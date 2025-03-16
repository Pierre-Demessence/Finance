import { BalanceRecord } from '@/models';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export interface BalanceRecordsSlice {
  balanceRecords: BalanceRecord[];
  
  addBalanceRecord: (record: Omit<BalanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBalanceRecord: (id: string, updates: Partial<Omit<BalanceRecord, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteBalanceRecord: (id: string) => boolean;
  getBalanceRecordsForAccount: (accountId: string) => BalanceRecord[];
}

export const createBalanceRecordsSlice: StateCreator<BalanceRecordsSlice> = (set, get) => ({
  balanceRecords: [],
  
  addBalanceRecord: (record) => {
    const id = uuidv4();
    const now = new Date();
    
    set((state) => ({
      balanceRecords: [
        ...state.balanceRecords,
        {
          ...record,
          id,
          createdAt: now,
          updatedAt: now,
        }
      ]
    }));
    
    return id;
  },
  
  updateBalanceRecord: (id, updates) => {
    let found = false;
    
    set((state) => ({
      balanceRecords: state.balanceRecords.map(record => {
        if (record.id === id) {
          found = true;
          return {
            ...record,
            ...updates,
            updatedAt: new Date()
          };
        }
        return record;
      })
    }));
    
    return found;
  },
  
  deleteBalanceRecord: (id) => {
    set((state) => ({
      balanceRecords: state.balanceRecords.filter(record => record.id !== id)
    }));
    
    return true;
  },
  
  getBalanceRecordsForAccount: (accountId) => {
    return get().balanceRecords
      .filter(record => record.accountId === accountId)
      .sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  },
});