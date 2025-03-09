import { Meta, StoryObj } from '@storybook/react';
import { IconApps, IconHome, IconCar, IconShoppingCart, IconHeartbeat, IconSchool } from '@tabler/icons-react';
import CategoryDonutChart from './CategoryDonutChart';

const meta = {
  title: 'UI/CategoryDonutChart',
  component: CategoryDonutChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CategoryDonutChart>;

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
    chartHeight: 240,
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const SmallChart: Story = {
  args: {
    title: 'Monthly Expenses',
    totalValue: 3030,
    data: demoData,
    chartHeight: 180,
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};

export const WithCounts: Story = {
  args: {
    title: 'Category Distribution',
    totalValue: 3030,
    data: demoData.map(item => ({
      ...item,
      count: Math.floor(Math.random() * 10) + 1
    })),
    formatValue: (value) => `$${value.toLocaleString()}`,
  },
};