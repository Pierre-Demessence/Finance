import type { Meta, StoryObj } from '@storybook/react';
import { FinanceChart } from './FinanceChart';

const meta: Meta<typeof FinanceChart> = {
  title: 'Components/FinanceChart',
  component: FinanceChart,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FinanceChart>;

// Sample accounts data
const sampleAccounts = [
  { id: '1', name: 'Checking', categoryId: 'Bank', type: 'checking', balance: 5000 },
  { id: '2', name: 'Savings', categoryId: 'Bank', type: 'savings', balance: 15000 },
  { id: '3', name: 'Investment', categoryId: 'Investments', type: 'investment', balance: 35000 },
  { id: '4', name: 'Retirement', categoryId: 'Investments', type: 'retirement', balance: 45000 },
  { id: '5', name: 'Credit Card', categoryId: 'Liabilities', type: 'credit', balance: -2000 },
];

// Sample data for chart entries
const today = new Date();
const getDateMonthsAgo = (months: number): Date => {
  const date = new Date(today);
  date.setMonth(date.getMonth() - months);
  return date;
};

const sampleEntries = [
  {
    date: getDateMonthsAgo(5),
    values: {
      '1': 3500,
      '2': 12000,
      '3': 28000,
      '4': 40000,
      '5': -1500,
    }
  },
  {
    date: getDateMonthsAgo(4),
    values: {
      '1': 4200,
      '2': 13000,
      '3': 30000,
      '4': 41000,
      '5': -1800,
    }
  },
  {
    date: getDateMonthsAgo(3),
    values: {
      '1': 4500,
      '2': 13500,
      '3': 31000,
      '4': 42000,
      '5': -2000,
    }
  },
  {
    date: getDateMonthsAgo(2),
    values: {
      '1': 4800,
      '2': 14000,
      '3': 33000,
      '4': 43500,
      '5': -1900,
    }
  },
  {
    date: getDateMonthsAgo(1),
    values: {
      '1': 5000,
      '2': 15000,
      '3': 35000,
      '4': 45000,
      '5': -2000,
    }
  }
];

export const Default: Story = {
  args: {
    accounts: sampleAccounts,
    entries: sampleEntries,
  },
};

export const WithNoData: Story = {
  args: {
    accounts: sampleAccounts,
    entries: [],
  },
};