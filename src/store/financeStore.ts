"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Account, 
  Settings, 
  AccountCategory, 
  TransactionCategory, 
  Transaction,
  Asset,
  TransactionType,
  AssetType,
  CustomAssetType
} from '@/models';
import { CURRENCIES } from '@/config/constants';
import demoData from '@/data/demoData.json';

export interface FinanceStore {
  // Settings
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  // Accounts
  accounts: Account[];
  accountCategories: AccountCategory[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => string;
  updateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteAccount: (id: string) => boolean;
  archiveAccount: (id: string) => boolean;
  unarchiveAccount: (id: string) => boolean;
  
  // Account Categories
  addAccountCategory: (category: Omit<AccountCategory, 'id' | 'isDefault'>) => string;
  updateAccountCategory: (id: string, updates: Partial<Omit<AccountCategory, 'id' | 'isDefault'>>) => boolean;
  deleteAccountCategory: (id: string) => boolean;
  
  // Transactions
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteTransaction: (id: string) => boolean;
  
  // Transaction Categories
  addTransactionCategory: (category: Omit<TransactionCategory, 'id' | 'isDefault'>) => string;
  updateTransactionCategory: (id: string, updates: Partial<Omit<TransactionCategory, 'id' | 'isDefault'>>) => boolean;
  deleteTransactionCategory: (id: string) => boolean;
  
  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteAsset: (id: string) => boolean;
  
  // Custom Asset Types
  customAssetTypes: CustomAssetType[];
  addCustomAssetType: (assetType: Omit<CustomAssetType, 'id'>) => string;
  updateCustomAssetType: (id: string, updates: Partial<Omit<CustomAssetType, 'id'>>) => boolean;
  deleteCustomAssetType: (id: string) => boolean;
  
  // Data Export/Import
  exportData: () => object;
  importData: (data: any) => boolean;
  resetData: () => void;
  loadDemoData: () => void;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  baseCurrency: 'EUR',
  theme: 'dark',
  dateFormat: 'DD/MM/YYYY',
  decimalPlaces: 2
};

// Default account categories
const DEFAULT_ACCOUNT_CATEGORIES: AccountCategory[] = [
  { id: 'cat_banking', name: 'Banking', icon: 'building-bank', isDefault: true },
  { id: 'cat_cash', name: 'Cash', icon: 'cash', isDefault: true },
  { id: 'cat_investment', name: 'Investments', icon: 'chart-line', isDefault: true },
  { id: 'cat_credit', name: 'Credit Cards', icon: 'credit-card', isDefault: true },
  { id: 'cat_loan', name: 'Loans', icon: 'cash-banknote', isDefault: true }
];

// Default transaction categories
const DEFAULT_TRANSACTION_CATEGORIES: TransactionCategory[] = [
  // Income categories
  { id: 'tcat_salary', name: 'Salary', type: TransactionType.INCOME, icon: 'wallet', isDefault: true },
  { id: 'tcat_interest', name: 'Interest', type: TransactionType.INCOME, icon: 'chart-line', isDefault: true },
  { id: 'tcat_gift', name: 'Gifts', type: TransactionType.INCOME, icon: 'gift', isDefault: true },
  { id: 'tcat_other_income', name: 'Other Income', type: TransactionType.INCOME, icon: 'plus', isDefault: true },
  
  // Expense categories
  { id: 'tcat_housing', name: 'Housing', type: TransactionType.EXPENSE, icon: 'home', isDefault: true },
  { id: 'tcat_food', name: 'Food & Dining', type: TransactionType.EXPENSE, icon: 'chef-hat', isDefault: true },
  { id: 'tcat_transportation', name: 'Transportation', type: TransactionType.EXPENSE, icon: 'car', isDefault: true },
  { id: 'tcat_utilities', name: 'Utilities', type: TransactionType.EXPENSE, icon: 'bulb', isDefault: true },
  { id: 'tcat_shopping', name: 'Shopping', type: TransactionType.EXPENSE, icon: 'shopping-cart', isDefault: true },
  { id: 'tcat_entertainment', name: 'Entertainment', type: TransactionType.EXPENSE, icon: 'device-tv', isDefault: true },
  { id: 'tcat_health', name: 'Health & Medical', type: TransactionType.EXPENSE, icon: 'stethoscope', isDefault: true },
  { id: 'tcat_other_expense', name: 'Other Expenses', type: TransactionType.EXPENSE, icon: 'minus', isDefault: true },
  
  // Transfer category
  { id: 'tcat_transfer', name: 'Transfer', type: TransactionType.TRANSFER, icon: 'arrows-exchange', isDefault: true },
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // Initialize with default settings and categories
      settings: DEFAULT_SETTINGS,
      accounts: [],
      accountCategories: DEFAULT_ACCOUNT_CATEGORIES,
      transactions: [],
      transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
      assets: [],
      customAssetTypes: [],
      
      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      // Account functions
      addAccount: (account) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id,
              createdAt: now,
              updatedAt: now,
              isArchived: false,
            }
          ]
        }));
        
        return id;
      },
      
      updateAccount: (id, updates) => {
        let found = false;
        
        set((state) => ({
          accounts: state.accounts.map(account => {
            if (account.id === id) {
              found = true;
              return {
                ...account,
                ...updates,
                updatedAt: new Date()
              };
            }
            return account;
          })
        }));
        
        return found;
      },
      
      deleteAccount: (id) => {
        // Check if account has transactions or assets
        const { transactions, assets } = get();
        const hasTransactions = transactions.some(
          t => t.fromAccountId === id || t.toAccountId === id
        );
        const hasAssets = assets.some(a => a.accountId === id);
        
        if (hasTransactions || hasAssets) {
          return false; // Can't delete account with transactions or assets
        }
        
        set((state) => ({
          accounts: state.accounts.filter(account => account.id !== id)
        }));
        
        return true;
      },
      
      archiveAccount: (id) => {
        return get().updateAccount(id, { isArchived: true });
      },

      unarchiveAccount: (id) => {
        return get().updateAccount(id, { isArchived: false });
      },
      
      // Account Category functions
      addAccountCategory: (category) => {
        const id = uuidv4();
        
        set((state) => ({
          accountCategories: [
            ...state.accountCategories,
            {
              ...category,
              id,
              isDefault: false
            }
          ]
        }));
        
        return id;
      },
      
      updateAccountCategory: (id, updates) => {
        let found = false;
        
        set((state) => ({
          accountCategories: state.accountCategories.map(category => {
            if (category.id === id && !category.isDefault) {
              found = true;
              return { ...category, ...updates };
            }
            return category;
          })
        }));
        
        return found;
      },
      
      deleteAccountCategory: (id) => {
        const { accounts, accountCategories } = get();
        
        // Can't delete if it's a default category
        const category = accountCategories.find(c => c.id === id);
        if (!category || category.isDefault) {
          return false;
        }
        
        // Check if any accounts are using this category
        const isInUse = accounts.some(account => account.categoryId === id);
        if (isInUse) {
          return false;
        }
        
        set((state) => ({
          accountCategories: state.accountCategories.filter(cat => cat.id !== id)
        }));
        
        return true;
      },
      
      // Transaction functions
      addTransaction: (transaction) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id,
              createdAt: now,
              updatedAt: now
            }
          ]
        }));
        
        return id;
      },
      
      updateTransaction: (id, updates) => {
        let found = false;
        
        set((state) => ({
          transactions: state.transactions.map(transaction => {
            if (transaction.id === id) {
              found = true;
              return {
                ...transaction,
                ...updates,
                updatedAt: new Date()
              };
            }
            return transaction;
          })
        }));
        
        return found;
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(transaction => transaction.id !== id)
        }));
        
        return true;
      },
      
      // Transaction Category functions
      addTransactionCategory: (category) => {
        const id = uuidv4();
        
        set((state) => ({
          transactionCategories: [
            ...state.transactionCategories,
            {
              ...category,
              id,
              isDefault: false
            }
          ]
        }));
        
        return id;
      },
      
      updateTransactionCategory: (id, updates) => {
        let found = false;
        
        set((state) => ({
          transactionCategories: state.transactionCategories.map(category => {
            if (category.id === id && !category.isDefault) {
              found = true;
              return { ...category, ...updates };
            }
            return category;
          })
        }));
        
        return found;
      },
      
      deleteTransactionCategory: (id) => {
        const { transactions, transactionCategories } = get();
        
        // Can't delete if it's a default category
        const category = transactionCategories.find(c => c.id === id);
        if (!category || category.isDefault) {
          return false;
        }
        
        // Check if any transactions are using this category
        const isInUse = transactions.some(transaction => transaction.categoryId === id);
        if (isInUse) {
          return false;
        }
        
        set((state) => ({
          transactionCategories: state.transactionCategories.filter(cat => cat.id !== id)
        }));
        
        return true;
      },
      
      // Asset functions
      addAsset: (asset) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          assets: [
            ...state.assets,
            {
              ...asset,
              id,
              createdAt: now,
              updatedAt: now
            }
          ]
        }));
        
        return id;
      },
      
      updateAsset: (id, updates) => {
        let found = false;
        
        set((state) => ({
          assets: state.assets.map(asset => {
            if (asset.id === id) {
              found = true;
              return {
                ...asset,
                ...updates,
                updatedAt: new Date()
              };
            }
            return asset;
          })
        }));
        
        return found;
      },
      
      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter(asset => asset.id !== id)
        }));
        
        return true;
      },
      
      // Custom Asset Type functions
      addCustomAssetType: (assetType) => {
        const id = uuidv4();
        
        set((state) => ({
          customAssetTypes: [
            ...state.customAssetTypes,
            {
              ...assetType,
              id,
            }
          ]
        }));
        
        return id;
      },
      
      updateCustomAssetType: (id, updates) => {
        let found = false;
        
        set((state) => ({
          customAssetTypes: state.customAssetTypes.map(assetType => {
            if (assetType.id === id) {
              found = true;
              return { ...assetType, ...updates };
            }
            return assetType;
          })
        }));
        
        return found;
      },
      
      deleteCustomAssetType: (id) => {
        const { assets } = get();
        
        // Check if any assets are using this type
        const isInUse = assets.some(asset => 
          asset.type === AssetType.CUSTOM && asset.customTypeId === id
        );
        
        if (isInUse) {
          return false;
        }
        
        set((state) => ({
          customAssetTypes: state.customAssetTypes.filter(type => type.id !== id)
        }));
        
        return true;
      },
      
      // Data Export/Import functions
      exportData: () => {
        const { settings, accounts, accountCategories, transactions, transactionCategories, assets, customAssetTypes } = get();
        
        return {
          appVersion: '1.0.0',
          exportDate: new Date().toISOString(),
          data: {
            settings,
            accounts,
            accountCategories,
            transactions,
            transactionCategories,
            assets,
            customAssetTypes,
          }
        };
      },
      
      importData: (data) => {
        if (!data || typeof data !== 'object') {
          return false;
        }
        
        try {
          // Validate the data structure
          const requiredKeys = ['settings', 'accounts', 'accountCategories', 
                               'transactions', 'transactionCategories', 'assets'];
          
          if (!data.data || !requiredKeys.every(key => key in data.data)) {
            return false;
          }
          
          set(() => ({
            settings: data.data.settings || DEFAULT_SETTINGS,
            accounts: data.data.accounts || [],
            accountCategories: [
              ...DEFAULT_ACCOUNT_CATEGORIES, // Always include default categories
              ...(data.data.accountCategories || []).filter((cat: AccountCategory) => 
                !cat.isDefault && !DEFAULT_ACCOUNT_CATEGORIES.some(dc => dc.id === cat.id)
              )
            ],
            transactions: data.data.transactions || [],
            transactionCategories: [
              ...DEFAULT_TRANSACTION_CATEGORIES, // Always include default categories
              ...(data.data.transactionCategories || []).filter((cat: TransactionCategory) => 
                !cat.isDefault && !DEFAULT_TRANSACTION_CATEGORIES.some(dc => dc.id === cat.id)
              )
            ],
            assets: data.data.assets || [],
            customAssetTypes: data.data.customAssetTypes || [],
          }));
          
          return true;
        } catch (error) {
          console.error('Error importing data:', error);
          return false;
        }
      },
      
      resetData: () => {
        set(() => ({
          settings: DEFAULT_SETTINGS,
          accounts: [],
          accountCategories: DEFAULT_ACCOUNT_CATEGORIES,
          transactions: [],
          transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
          assets: [],
          customAssetTypes: [],
        }));
      },

      loadDemoData: () => {
        // First reset to remove any existing data
        get().resetData();
        
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        
        // Create a map to store the actual UUIDs for account IDs
        const accountIdMap: Record<string, string> = {};
        
        // Helper function to create a date in the past
        const getDateInPast = (daysAgo: number): Date => {
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          return date;
        };
        
        // Create demo accounts from the JSON data
        const demoAccounts: Account[] = demoData.accounts.map(account => {
          const id = uuidv4();
          // Store the mapping between placeholder ID and actual UUID
          accountIdMap[account.id] = id;
          
          return {
            ...account,
            id,
            createdAt: oneYearAgo,
            updatedAt: now
          };
        });
        
        // Generate transactions for the past year
        const demoTransactions: Transaction[] = [];
        
        // Add monthly recurring transactions for the past 12 months
        for (let i = 0; i < 12; i++) {
          for (const recurTrans of demoData.recurringTransactions) {
            const transactionDate = new Date();
            transactionDate.setMonth(now.getMonth() - i);
            transactionDate.setDate(recurTrans.dayOfMonth);
            
            // Skip future dates
            if (transactionDate > now) continue;

            demoTransactions.push({
              id: uuidv4(),
              type: recurTrans.type as TransactionType,
              amount: recurTrans.amount,
              date: transactionDate,
              categoryId: recurTrans.categoryId,
              description: recurTrans.description,
              fromAccountId: recurTrans.fromAccountId ? accountIdMap[recurTrans.fromAccountId] : null,
              toAccountId: recurTrans.toAccountId ? accountIdMap[recurTrans.toAccountId] : null,
              createdAt: transactionDate,
              updatedAt: transactionDate,
            });
          }
        }
        
        // Add random expenses over the past year using the data from JSON
        for (let i = 0; i < 50; i++) {
          const daysAgo = Math.floor(Math.random() * 365);
          const transactionDate = getDateInPast(daysAgo);
          
          const expenseType = demoData.randomExpenses[Math.floor(Math.random() * demoData.randomExpenses.length)];
          const amount = expenseType.min + Math.floor(Math.random() * (expenseType.max - expenseType.min));
          const description = expenseType.descriptions[Math.floor(Math.random() * expenseType.descriptions.length)];
          
          demoTransactions.push({
            id: uuidv4(),
            type: TransactionType.EXPENSE,
            amount: amount,
            date: transactionDate,
            categoryId: expenseType.category,
            description: description,
            fromAccountId: accountIdMap.creditcard,
            toAccountId: null,
            createdAt: transactionDate,
            updatedAt: transactionDate,
          });
        }
        
        // Add medical expenses from the JSON data
        for (const medExpense of demoData.medicalExpenses) {
          const transactionDate = getDateInPast(medExpense.daysAgo);
          const amount = medExpense.minAmount + Math.floor(Math.random() * (medExpense.maxAmount - medExpense.minAmount));
          
          demoTransactions.push({
            id: uuidv4(),
            type: TransactionType.EXPENSE,
            amount: amount,
            date: transactionDate,
            categoryId: medExpense.categoryId,
            description: medExpense.description,
            fromAccountId: accountIdMap[medExpense.fromAccountId],
            toAccountId: null,
            createdAt: transactionDate,
            updatedAt: transactionDate,
          });
        }
        
        // Create Assets from the JSON data
        const demoAssets: Asset[] = demoData.assets.map(asset => {
          const purchaseDate = getDateInPast(asset.acquisitionDateDaysAgo);
          return {
            id: uuidv4(),
            name: asset.name,
            type: asset.type as AssetType,
            accountId: accountIdMap[asset.accountId],
            description: asset.description,
            quantity: asset.quantity,
            currentPrice: asset.currentPrice,
            acquisitionPrice: asset.acquisitionPrice,
            acquisitionDate: purchaseDate,
            lastUpdated: now,
            notes: asset.notes,
            symbol: asset.symbol,
            purchasePrice: asset.purchasePrice,
            purchaseDate: purchaseDate,
            createdAt: purchaseDate,
            updatedAt: now,
          };
        });
        
        // Set all data at once
        set(() => ({
          accounts: demoAccounts,
          transactions: demoTransactions,
          assets: demoAssets,
          // Keep default categories and settings
          accountCategories: DEFAULT_ACCOUNT_CATEGORIES,
          transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
          settings: DEFAULT_SETTINGS,
        }));
      }
    }),
    {
      name: 'finance-store',
      // Only serialize specific keys to avoid circular references
      partialize: (state) => ({
        settings: state.settings,
        accounts: state.accounts,
        accountCategories: state.accountCategories,
        transactions: state.transactions,
        transactionCategories: state.transactionCategories,
        assets: state.assets,
        customAssetTypes: state.customAssetTypes,
      }),
    }
  )
);