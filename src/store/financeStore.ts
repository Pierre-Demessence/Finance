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
  AssetType
} from '@/models';
import { CURRENCIES } from '@/config/constants';

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
      }),
    }
  )
);