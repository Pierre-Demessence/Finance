import { Meta, StoryObj } from '@storybook/react';
import { IconApps, IconHome, IconCar, IconShoppingCart, IconHeartbeat, IconSchool } from '@tabler/icons-react';
import CategoryBreakdown from './CategoryBreakdown';

const meta = {
  title: 'UI/CategoryBreakdown',
  component: CategoryBreakdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryBreakdown>;

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
    title: 'Breakdown',
    totalValue: 3030,
    data: demoData,
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const WithCounts: Story = {
  args: {
    title: 'Items by Category',
    totalValue: 3030,
    data: demoData.map(item => ({
      ...item,
      count: Math.floor(Math.random() * 10) + 1
    })),
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const FewCategories: Story = {
  args: {
    title: 'Asset Breakdown',
    totalValue: 2150,
    data: demoData.slice(0, 3),
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};