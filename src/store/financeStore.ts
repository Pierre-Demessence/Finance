"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import all slices
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { AccountsSlice, createAccountsSlice } from './slices/accountsSlice';
import { TransactionsSlice, createTransactionsSlice } from './slices/transactionsSlice';
import { AssetsSlice, createAssetsSlice } from './slices/assetsSlice';
import { DataSlice, createDataSlice } from './slices/dataSlice';

// Import persist configuration
import { persistOptions } from './middleware/persistConfig';

// Define the complete store type
export type FinanceStore = 
  SettingsSlice & 
  AccountsSlice & 
  TransactionsSlice & 
  AssetsSlice & 
  DataSlice;

// Create the store by combining all slices
export const useFinanceStore = create<FinanceStore>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createAccountsSlice(...a),
      ...createTransactionsSlice(...a),
      ...createAssetsSlice(...a),
      ...createDataSlice(...a),
    }),
    persistOptions
  )
);