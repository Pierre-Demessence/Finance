"use client";

import { useMemo } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { 
  Account, 
  Asset, 
  Transaction, 
  TransactionType,
  Currency,
  BalanceRecord
} from '@/models';
import { CURRENCIES } from '@/config/constants';
import dayjs from 'dayjs';

/**
 * Hook for currency-related utilities
 */
export function useCurrency() {
  const { settings } = useFinanceStore();
  
  /**
   * Get the base currency from settings
   */
  const baseCurrency = settings.baseCurrency;
  
  /**
   * Format a number as currency
   * @param amount - Amount to format
   * @param currencyCode - Currency code (defaults to base currency)
   */
  const formatAmount = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode || baseCurrency;
    const currencyInfo = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.USD;
    
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: settings.decimalPlaces,
      maximumFractionDigits: settings.decimalPlaces,
    }).format(amount);
  };
  
  /**
   * Convert an amount from one currency to another
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code (defaults to base currency)
   */
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = baseCurrency): number => {
    // In a real app, this would use actual exchange rates
    // For now, we'll use mock conversion rates
    if (fromCurrency === toCurrency) return amount;
    
    const mockExchangeRates: Record<string, number> = {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110.0,
      // Add more currencies as needed
    };
    
    // Convert to USD first (as our base for conversions)
    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / mockExchangeRates[fromCurrency];
    
    // Convert from USD to target currency
    return toCurrency === 'USD' 
      ? amountInUSD 
      : amountInUSD * mockExchangeRates[toCurrency];
  };
  
  /**
   * Convert an amount to the base currency
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency code
   */
  const toBaseCurrency = (amount: number, fromCurrency: string): number => {
    return convertCurrency(amount, fromCurrency);
  };
  
  return {
    baseCurrency,
    formatAmount,
    convertCurrency,
    toBaseCurrency,
  };
}

/**
 * Hook for transaction analysis utilities
 */
export function useTransactionAnalysis() {
  const { transactions, transactionCategories } = useFinanceStore();
  const { toBaseCurrency } = useCurrency();
  
  /**
   * Calculate total income for a given period
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   */
  const calculateTotalIncome = (startDate: Date, endDate: Date): number => {
    return transactions
      .filter(t => 
        t.type === TransactionType.INCOME &&
        (dayjs(t.date).isAfter(startDate, 'day') || dayjs(t.date).isSame(startDate, 'day')) &&
        (dayjs(t.date).isBefore(endDate, 'day') || dayjs(t.date).isSame(endDate, 'day'))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  /**
   * Calculate total expenses for a given period
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   */
  const calculateTotalExpenses = (startDate: Date, endDate: Date): number => {
    return transactions
      .filter(t => 
        t.type === TransactionType.EXPENSE &&
        (dayjs(t.date).isAfter(startDate, 'day') || dayjs(t.date).isSame(startDate, 'day')) &&
        (dayjs(t.date).isBefore(endDate, 'day') || dayjs(t.date).isSame(endDate, 'day'))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  /**
   * Group transactions by category for a given period
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   * @param type - Type of transactions to include
   */
  const getTransactionsByCategory = (
    startDate: Date, 
    endDate: Date, 
    type: 'income' | 'expense' | 'all' = 'all'
  ): Record<string, number> => {
    const transactionType = type === 'income' 
      ? TransactionType.INCOME 
      : type === 'expense' 
        ? TransactionType.EXPENSE 
        : undefined;
    
    return transactions
      .filter(t => {
        // Skip transfers completely
        if (t.type === TransactionType.TRANSFER) return false;

        // Check if transaction type matches requested type
        if (transactionType !== undefined && t.type !== transactionType) return false;

        // Check if date is within range
        const transactionDate = dayjs(t.date);
        const isAfterStart = transactionDate.isAfter(startDate, 'day') || transactionDate.isSame(startDate, 'day');
        const isBeforeEnd = transactionDate.isBefore(endDate, 'day') || transactionDate.isSame(endDate, 'day');
        
        return isAfterStart && isBeforeEnd;
      })
      .reduce((acc, t) => {
        if (!acc[t.categoryId]) {
          acc[t.categoryId] = 0;
        }
        
        // For expenses, only add positive amounts to show actual spending
        // For income, use amount as is
        const amount = t.type === TransactionType.EXPENSE ? Math.abs(t.amount) : t.amount;
        acc[t.categoryId] += amount;
        
        return acc;
      }, {} as Record<string, number>);
  };
  
  /**
   * Group transactions by account for a given period
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   * @param type - Type of transactions to include
   */
  const getTransactionsByAccount = (
    startDate: Date, 
    endDate: Date, 
    type: 'income' | 'expense' | 'all' = 'all'
  ): Record<string, number> => {
    const transactionType = type === 'income' 
      ? TransactionType.INCOME 
      : type === 'expense' 
        ? TransactionType.EXPENSE 
        : undefined;
    
    return transactions
      .filter(t => 
        (transactionType === undefined || t.type === transactionType) &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((acc, t) => {
        if (t.type === TransactionType.INCOME && t.toAccountId) {
          // Income goes to an account
          if (!acc[t.toAccountId]) {
            acc[t.toAccountId] = 0;
          }
          acc[t.toAccountId] += t.amount;
        } else if (t.type === TransactionType.EXPENSE && t.fromAccountId) {
          // Expense comes from an account
          if (!acc[t.fromAccountId]) {
            acc[t.fromAccountId] = 0;
          }
          acc[t.fromAccountId] -= t.amount; // Subtract for expenses
        } else if (t.type === TransactionType.TRANSFER) {
          // Transfer affects two accounts
          if (t.fromAccountId) {
            if (!acc[t.fromAccountId]) {
              acc[t.fromAccountId] = 0;
            }
            acc[t.fromAccountId] -= t.amount;
          }
          
          if (t.toAccountId) {
            if (!acc[t.toAccountId]) {
              acc[t.toAccountId] = 0;
            }
            acc[t.toAccountId] += t.amount;
          }
        }
        
        return acc;
      }, {} as Record<string, number>);
  };
  
  /**
   * Get transactions grouped by day for a given period
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   * @param type - Type of transactions to include
   */
  const getTransactionsByDate = (
    startDate: Date, 
    endDate: Date, 
    type: 'income' | 'expense' | 'all' = 'all'
  ): Record<string, number> => {
    const transactionType = type === 'income' 
      ? TransactionType.INCOME 
      : type === 'expense' 
        ? TransactionType.EXPENSE 
        : undefined;
    
    return transactions
      .filter(t => 
        (transactionType === undefined || t.type === transactionType) &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((acc, t) => {
        const dateStr = dayjs(t.date).format('YYYY-MM-DD');
        if (!acc[dateStr]) {
          acc[dateStr] = 0;
        }
        
        // Add for income, subtract for expenses
        const amount = t.type === TransactionType.EXPENSE ? -t.amount : t.amount;
        acc[dateStr] += amount;
        
        return acc;
      }, {} as Record<string, number>);
  };
  
  return {
    calculateTotalIncome,
    calculateTotalExpenses,
    getTransactionsByCategory,
    getTransactionsByAccount,
    getTransactionsByDate,
  };
}

/**
 * Hook for net worth calculation and analysis
 */
export function useNetWorth() {
  const { accounts, assets, transactions, balanceRecords, getBalanceRecordsForAccount } = useFinanceStore();
  const { toBaseCurrency } = useCurrency();
  
  /**
   * Calculate the current balance of an account considering all transactions and balance records
   * @param accountId - ID of the account to calculate balance for
   * @param asOfDate - Optional date to calculate balance as of (defaults to now)
   */
  const calculateAccountBalance = (accountId: string, asOfDate?: Date): number => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    const calculationDate = asOfDate || new Date();
    
    // Get balance records for this account, sorted by date (newest first)
    const accountBalanceRecords = getBalanceRecordsForAccount(accountId);
    
    // Find the most recent balance record before or on the calculation date
    const latestRecord = accountBalanceRecords.find(record => {
      const recordDate = record.date instanceof Date ? record.date : new Date(record.date);
      return recordDate <= calculationDate;
    });
    
    // If we have a balance record, use it as the baseline
    if (latestRecord) {
      // Use the balance record amount as our starting point
      let balance = latestRecord.amount;
      const recordDate = latestRecord.date instanceof Date ? latestRecord.date : new Date(latestRecord.date);
      
      // Apply transactions that occurred after the balance record date
      const laterTransactions = transactions.filter(t => {
        const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
        return (t.fromAccountId === accountId || t.toAccountId === accountId) && 
               transactionDate > recordDate &&
               transactionDate <= calculationDate;
      });
      
      // Apply each transaction
      laterTransactions.forEach(transaction => {
        if (transaction.fromAccountId === accountId) {
          // Money going out of the account
          balance -= transaction.amount;
        } else if (transaction.toAccountId === accountId) {
          // Money coming into the account
          balance += transaction.amount;
        }
      });
      
      return balance;
    }
    
    // No balance record found, calculate based on initial balance and all transactions
    let initialBalance = account.initialBalance || 0;
    
    // Filter transactions up to the calculation date
    const relevantTransactions = transactions.filter(t => {
      const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
      return (t.fromAccountId === accountId || t.toAccountId === accountId) && 
             transactionDate <= calculationDate;
    });
    
    // Calculate balance from transactions
    return relevantTransactions.reduce((balance, transaction) => {
      if (transaction.fromAccountId === accountId) {
        // Money going out of the account
        return balance - transaction.amount;
      } else if (transaction.toAccountId === accountId) {
        // Money coming into the account
        return balance + transaction.amount;
      }
      return balance;
    }, initialBalance);
  };
  
  /**
   * Calculate the total value of all assets in an account
   * @param accountId - ID of the account to calculate asset value for
   */
  const calculateAssetValue = (accountId: string): number => {
    return assets
      .filter(asset => asset.accountId === accountId)
      .reduce((total, asset) => {
        return total + (asset.quantity * asset.currentPrice);
      }, 0);
  };
  
  /**
   * Calculate the total net worth across all accounts
   */
  const calculateNetWorth = (): number => {
    let totalNetWorth = 0;
    
    // Add account balances
    accounts.forEach(account => {
      const balance = calculateAccountBalance(account.id);
      totalNetWorth += toBaseCurrency(balance, account.currency);
    });
    
    // Add asset values
    assets.forEach(asset => {
      const account = accounts.find(a => a.id === asset.accountId);
      if (account) {
        const assetValue = asset.quantity * asset.currentPrice;
        totalNetWorth += toBaseCurrency(assetValue, account.currency);
      }
    });
    
    return totalNetWorth;
  };
  
  /**
   * Calculate net worth for each day between start and end dates
   * @param startDate - Start date for the period
   * @param endDate - End date for the period
   * @param interval - Interval for data points ('day', 'week', 'month')
   */
  const getNetWorthHistory = (
    startDate: Date, 
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day'
  ): { date: Date; netWorth: number }[] => {
    const history: { date: Date; netWorth: number }[] = [];
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);
    
    // Function to calculate net worth at a specific date
    const calculateNetWorthAtDate = (date: Date): number => {
      let netWorth = 0;
      
      // Calculate account balances up to this date (now using our improved function)
      accounts.forEach(account => {
        const balance = calculateAccountBalance(account.id, date);
        netWorth += toBaseCurrency(balance, account.currency);
      });
      
      // Add asset values - assuming assets are valued at their current price
      // In a real app, you'd want to track historical asset prices
      assets.forEach(asset => {
        const account = accounts.find(a => a.id === asset.accountId);
        if (account) {
          const assetValue = asset.quantity * asset.currentPrice;
          netWorth += toBaseCurrency(assetValue, account.currency);
        }
      });
      
      return netWorth;
    };
    
    // Generate data points based on interval
    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      history.push({
        date: currentDate.toDate(),
        netWorth: calculateNetWorthAtDate(currentDate.toDate())
      });
      
      // Move to next interval
      switch (interval) {
        case 'day':
          currentDate = currentDate.add(1, 'day');
          break;
        case 'week':
          currentDate = currentDate.add(1, 'week');
          break;
        case 'month':
          currentDate = currentDate.add(1, 'month');
          break;
      }
    }
    
    return history;
  };
  
  return useMemo(() => {
    return {
      calculateAccountBalance,
      calculateAssetValue,
      calculateNetWorth,
      getNetWorthHistory,
    };
  }, [accounts, assets, transactions, balanceRecords, toBaseCurrency]);
}

/**
 * Hook for date-based utilities
 */
export function useDateUtils() {
  const { settings } = useFinanceStore();
  
  /**
   * Format a date according to user settings
   * @param date - Date to format
   */
  const formatDate = (date: Date): string => {
    return dayjs(date).format(settings.dateFormat);
  };
  
  /**
   * Get date range for a relative period
   * @param period - Period type (e.g., '7d', '30d', '90d', '1y')
   */
  const getDateRangeForPeriod = (period: '7d' | '30d' | '90d' | '1y'): [Date, Date] => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = dayjs().subtract(7, 'day').toDate();
        break;
      case '30d':
        startDate = dayjs().subtract(30, 'day').toDate();
        break;
      case '90d':
        startDate = dayjs().subtract(90, 'day').toDate();
        break;
      case '1y':
        startDate = dayjs().subtract(1, 'year').toDate();
        break;
      default:
        startDate = dayjs().subtract(30, 'day').toDate();
    }
    
    return [startDate, endDate];
  };
  
  /**
   * Get the start and end of specific periods
   * @param period - Period type ('day', 'week', 'month', 'year')
   * @param date - Reference date (defaults to today)
   */
  const getPeriodRange = (
    period: 'day' | 'week' | 'month' | 'year',
    date: Date = new Date()
  ): [Date, Date] => {
    const d = dayjs(date);
    let start: Date, end: Date;
    
    switch (period) {
      case 'day':
        start = d.startOf('day').toDate();
        end = d.endOf('day').toDate();
        break;
      case 'week':
        start = d.startOf('week').toDate();
        end = d.endOf('week').toDate();
        break;
      case 'month':
        start = d.startOf('month').toDate();
        end = d.endOf('month').toDate();
        break;
      case 'year':
        start = d.startOf('year').toDate();
        end = d.endOf('year').toDate();
        break;
    }
    
    return [start, end];
  };
  
  return {
    formatDate,
    getDateRangeForPeriod,
    getPeriodRange,
  };
}