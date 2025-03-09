import type { Meta, StoryObj } from '@storybook/react';
import AssetForm from './AssetForm';
import { AssetType } from '@/models';

const meta = {
  title: 'Components/AssetForm',
  component: AssetForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AssetForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewCryptoAsset: Story = {
  args: {
    asset: null,
    onClose: () => console.log('Form closed'),
    initialType: AssetType.CRYPTOCURRENCY,
  }
};

export const NewStockAsset: Story = {
  args: {
    asset: null,
    onClose: () => console.log('Form closed'),
    initialType: AssetType.STOCK,
  }
};

export const NewRealEstateAsset: Story = {
  args: {
    asset: null,
    onClose: () => console.log('Form closed'),
    initialType: AssetType.REAL_ESTATE,
  }
};

export const EditExistingAsset: Story = {
  args: {
    asset: {
      id: 'asset123',
      name: 'Bitcoin Holdings',
      type: AssetType.CRYPTOCURRENCY,
      accountId: 'acc-crypto',
      quantity: 0.5,
      currentPrice: 42000,
      acquisitionPrice: 35000,
      acquisitionDate: new Date('2023-01-15'),
      description: 'Long-term cryptocurrency investment',
      identifier: 'BTC',
      lastUpdated: new Date(),
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date(),
    },
    onClose: () => console.log('Form closed'),
  }
};

export const NewCustomAsset: Story = {
  args: {
    asset: null,
    onClose: () => console.log('Form closed'),
    initialType: AssetType.CUSTOM,
    customTypeId: 'custom-type-collectibles'
  }
};