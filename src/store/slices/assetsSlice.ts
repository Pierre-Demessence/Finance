import { Asset, CustomAssetType } from '@/models';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export interface AssetsSlice {
  assets: Asset[];
  customAssetTypes: CustomAssetType[];
  
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  deleteAsset: (id: string) => boolean;
  
  addCustomAssetType: (assetType: Omit<CustomAssetType, 'id'>) => string;
  updateCustomAssetType: (id: string, updates: Partial<Omit<CustomAssetType, 'id'>>) => boolean;
  deleteCustomAssetType: (id: string) => boolean;
}

export const createAssetsSlice: StateCreator<AssetsSlice> = (set, get) => ({
  assets: [],
  customAssetTypes: [],
  
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
          updatedAt: now,
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
  
  addCustomAssetType: (assetType) => {
    const id = uuidv4();
    
    set((state) => ({
      customAssetTypes: [
        ...state.customAssetTypes,
        {
          ...assetType,
          id
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
          return {
            ...assetType,
            ...updates
          };
        }
        return assetType;
      })
    }));
    
    return found;
  },
  
  deleteCustomAssetType: (id) => {
    const { assets, customAssetTypes } = get();
    
    // Can't delete if assets are using this type
    const isInUse = assets.some(asset => asset.customTypeId === id);
    if (isInUse) {
      return false;
    }
    
    set((state) => ({
      customAssetTypes: state.customAssetTypes.filter(type => type.id !== id)
    }));
    
    return true;
  }
});