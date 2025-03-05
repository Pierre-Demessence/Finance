import { Transaction, TransactionCategory } from '@/models';
import { DEFAULT_TRANSACTION_CATEGORIES } from '@/config/constants';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export interface TransactionsSlice {
  transactions: Transaction[];
  transactionCategories: TransactionCategory[];
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteTransaction: (id: string) => boolean;
  
  addTransactionCategory: (category: Omit<TransactionCategory, 'id' | 'isDefault'>) => string;
  updateTransactionCategory: (id: string, updates: Partial<Omit<TransactionCategory, 'id' | 'isDefault'>>) => boolean;
  deleteTransactionCategory: (id: string) => boolean;
}

export const createTransactionsSlice: StateCreator<TransactionsSlice> = (set, get) => ({
  transactions: [],
  transactionCategories: DEFAULT_TRANSACTION_CATEGORIES,
  
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
          updatedAt: now,
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
    if (category?.isDefault) {
      return false;
    }
    
    // Can't delete if transactions are using this category
    const isInUse = transactions.some(transaction => transaction.categoryId === id);
    if (isInUse) {
      return false;
    }
    
    set((state) => ({
      transactionCategories: state.transactionCategories.filter(c => c.id !== id)
    }));
    
    return true;
  }
});