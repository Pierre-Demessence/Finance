import { Account, Asset, Transaction, AssetType, TransactionType } from '@/models';
import { DEFAULT_SETTINGS, DEFAULT_ACCOUNT_CATEGORIES, DEFAULT_TRANSACTION_CATEGORIES } from '@/config/constants';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import demoData from '@/data/demoData.json';
import { AccountsSlice } from './accountsSlice';
import { TransactionsSlice } from './transactionsSlice';
import { AssetsSlice } from './assetsSlice';
import { SettingsSlice } from './settingsSlice';

export interface DataSlice {
  exportData: () => object;
  importData: (data: any) => boolean;
  resetData: () => void;
  loadDemoData: () => void;
}

type DataStoreWithDependencies = DataSlice & 
  AccountsSlice & 
  TransactionsSlice & 
  AssetsSlice & 
  SettingsSlice;

export const createDataSlice: StateCreator<
  DataStoreWithDependencies,
  [],
  [],
  DataSlice
> = (set, get) => ({
  exportData: () => {
    const { 
      settings, 
      accounts, 
      accountCategories, 
      transactions, 
      transactionCategories,
      assets,
      customAssetTypes 
    } = get();
    
    return {
      settings,
      accounts,
      accountCategories,
      transactions,
      transactionCategories,
      assets,
      customAssetTypes,
      exportDate: new Date()
    };
  },
  
  importData: (data) => {
    try {
      // Validate minimal data structure
      if (!data || 
          !Array.isArray(data.accounts) || 
          !Array.isArray(data.transactions) || 
          !data.settings) {
        return false;
      }
      
      // Set all data
      set(() => ({
        settings: data.settings,
        accounts: data.accounts,
        accountCategories: data.accountCategories || DEFAULT_ACCOUNT_CATEGORIES,
        transactions: data.transactions,
        transactionCategories: data.transactionCategories || DEFAULT_TRANSACTION_CATEGORIES,
        assets: data.assets || [],
        customAssetTypes: data.customAssetTypes || []
      }));
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
  
  resetData: () => {
    set(() => ({
      accounts: [],
      accountCategories: DEFAULT_ACCOUNT_CATEGORIES,
      transactions: [],
      transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
      assets: [],
      customAssetTypes: []
    }));
  },
  
  loadDemoData: () => {
    try {
      // Process accounts
      const now = new Date();
      const accountIdMap: Record<string, string> = {};
      
      // Create demo accounts with new UUIDs
      const demoAccounts: Account[] = demoData.accounts.map(account => {
        const id = uuidv4();
        accountIdMap[account.id] = id; // Map old ID to new ID
        
        return {
          id,
          name: account.name,
          description: account.description,
          categoryId: account.categoryId,
          currency: account.currency,
          initialBalance: account.initialBalance,
          notes: account.notes,
          isArchived: false,
          createdAt: now,
          updatedAt: now
        };
      });
      
       // Generate transactions for the past year
       const demoTransactions: Transaction[] = [];
        
       // Add monthly recurring transactions for the past 120 months
       for (let i = 0; i < 120; i++) {
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

       // Helper function to create a date in the past
       const getDateInPast = (daysAgo: number): Date => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
      };
       
       // Add 500 random expenses over the past 10 years using the data from JSON
       for (let i = 0; i < 500; i++) {
         const daysAgo = Math.floor(Math.random() * 3650); // Random days in the past 10 years
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
      
      // Process assets with mapped account IDs
      const demoAssets: Asset[] = demoData.assets.map(asset => {
        const id = uuidv4();
        const purchaseDate = getDateInPast(asset.acquisitionDateDaysAgo) || now;
        
        return {
          id,
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
      }));
    } catch (error) {
      console.error('Error loading demo data:', error);
    }
  }
});