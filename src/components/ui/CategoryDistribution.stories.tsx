import type { Meta, StoryObj } from '@storybook/react';
import { IconHome, IconCar, IconDeviceDesktop, IconShoppingCart } from '@tabler/icons-react';
import CategoryDistribution from './CategoryDistribution';

const meta: Meta<typeof CategoryDistribution> = {
  title: 'UI/CategoryDistribution',
  component: CategoryDistribution,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryDistribution>;

export const Default: Story = {
  args: {
    title: 'Expense Categories',
    totalValue: 3500,
    totalLabel: 'Total Expenses',
    data: [
      { name: 'Housing', value: 1200, color: '#228be6', icon: <IconHome size={16} />, count: 2 },
      { name: 'Transportation', value: 600, color: '#40c057', icon: <IconCar size={16} />, count: 5 },
      { name: 'Electronics', value: 800, color: '#fa5252', icon: <IconDeviceDesktop size={16} />, count: 3 },
      { name: 'Shopping', value: 900, color: '#fab005', icon: <IconShoppingCart size={16} />, count: 8 },
    ],
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const EmptyData: Story = {
  args: {
    title: 'No Categories',
    totalValue: 0,
    totalLabel: 'No Data',
    data: [],
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};