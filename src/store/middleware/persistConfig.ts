import { StateStorage, PersistOptions } from 'zustand/middleware';

// Define which parts of the state we want to persist
export const persistOptions: PersistOptions<any> = {
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
};