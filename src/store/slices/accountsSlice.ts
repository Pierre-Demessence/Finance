import { Account, AccountCategory } from '@/models';
import { DEFAULT_ACCOUNT_CATEGORIES } from '@/config/constants';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { TransactionsSlice } from './transactionsSlice';
import { AssetsSlice } from './assetsSlice';

export interface AccountsSlice {
  accounts: Account[];
  accountCategories: AccountCategory[];
  
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => string;
  updateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteAccount: (id: string) => boolean;
  archiveAccount: (id: string) => boolean;
  unarchiveAccount: (id: string) => boolean;
  
  addAccountCategory: (category: Omit<AccountCategory, 'id' | 'isDefault'>) => string;
  updateAccountCategory: (id: string, updates: Partial<Omit<AccountCategory, 'id' | 'isDefault'>>) => boolean;
  deleteAccountCategory: (id: string) => boolean;
}

type AccountsStoreWithDependencies = AccountsSlice & TransactionsSlice & AssetsSlice;

export const createAccountsSlice: StateCreator<
  AccountsStoreWithDependencies,
  [],
  [],
  AccountsSlice
> = (set, get) => ({
  accounts: [],
  accountCategories: DEFAULT_ACCOUNT_CATEGORIES,
  
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
    if (category?.isDefault) {
      return false;
    }
    
    // Can't delete if accounts are using this category
    const isInUse = accounts.some(account => account.categoryId === id);
    if (isInUse) {
      return false;
    }
    
    set((state) => ({
      accountCategories: state.accountCategories.filter(c => c.id !== id)
    }));
    
    return true;
  }
});