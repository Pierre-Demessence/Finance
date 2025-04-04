import { Meta, StoryObj } from '@storybook/react';
import { IconApps, IconHome, IconCar, IconShoppingCart, IconHeartbeat, IconSchool } from '@tabler/icons-react';
import CategoryDistribution from './CategoryDistribution';

const meta = {
  title: 'UI/CategoryDistribution',
  component: CategoryDistribution,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryDistribution>;

export default meta;
type Story = StoryObj<typeof meta>;

const demoData = [
  { name: 'Housing', value: 1500, color: 'blue', icon: <IconHome size={16} /> },
  { name: 'Transport', value: 450, color: 'green', icon: <IconCar size={16} /> },
  { name: 'Shopping', value: 380, color: 'yellow', icon: <IconShoppingCart size={16} /> },
  { name: 'Healthcare', value: 180, color: 'red', icon: <IconHeartbeat size={16} /> },
  { name: 'Education', value: 220, color: 'violet', icon: <IconSchool size={16} /> },
  { name: 'Others', value: 300, color: 'gray', icon: <IconApps size={16} /> },
];

export const Default: Story = {
  args: {
    title: 'Monthly Expenses',
    totalValue: 3030,
    data: demoData,
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const WithCustomTotalLabel: Story = {
  args: {
    title: 'Income Sources',
    totalLabel: 'Total Income',
    totalValue: 5200,
    data: [
      { name: 'Salary', value: 4000, color: 'blue', icon: <IconHome size={16} /> },
      { name: 'Investments', value: 800, color: 'green', icon: <IconCar size={16} /> },
      { name: 'Freelance', value: 400, color: 'yellow', icon: <IconShoppingCart size={16} /> },
    ],
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const WithCounts: Story = {
  args: {
    title: 'Asset Allocation',
    totalLabel: 'Total Assets',
    totalValue: 125000,
    data: [
      { name: 'Stocks', value: 65000, color: 'blue', count: 12 },
      { name: 'Bonds', value: 25000, color: 'green', count: 5 },
      { name: 'Real Estate', value: 30000, color: 'yellow', count: 1 },
      { name: 'Cash', value: 5000, color: 'cyan', count: 3 },
    ],
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};