import { Settings } from '@/models';
import { DEFAULT_SETTINGS } from '@/config/constants';
import { StateCreator } from 'zustand';

export interface SettingsSlice {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,
  
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },
});