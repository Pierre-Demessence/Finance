import type { Meta, StoryObj } from '@storybook/react';
import FinanceTable from './FinanceTable';

const meta: Meta<typeof FinanceTable> = {
  title: 'Components/FinanceTable',
  component: FinanceTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FinanceTable>;

// Sample accounts data
const sampleAccounts = [
  { id: '1', name: 'Checking', category: 'Bank', type: 'checking' },
  { id: '2', name: 'Savings', category: 'Bank', type: 'savings' },
  { id: '3', name: 'Brokerage', category: 'Investments', type: 'investment' },
  { id: '4', name: '401k', category: 'Investments', type: 'retirement' },
  { id: '5', name: 'Credit Card', category: 'Liabilities', type: 'credit' },
];

// Sample entries data for the table
const today = new Date();
const getMonthDate = (monthsAgo: number): Date => {
  const date = new Date(today);
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(1); // First day of the month
  return date;
};

const sampleEntries = [
  {
    date: getMonthDate(5),
    values: {
      '1': 3500,
      '2': 12000, 
      '3': 28000,
      '4': 40000,
      '5': -1500,
    }
  },
  {
    date: getMonthDate(4),
    values: {
      '1': 4200,
      '2': 13000,
      '3': 30000,
      '4': 41000,
      '5': -1800,
    }
  },
  {
    date: getMonthDate(3),
    values: {
      '1': 4500,
      '2': 13500,
      '3': 31000,
      '4': 42000,
      '5': -2000,
    }
  },
  {
    date: getMonthDate(2),
    values: {
      '1': 4800,
      '2': 14000,
      '3': 33000,
      '4': 43500,
      '5': -1900,
    }
  },
  {
    date: getMonthDate(1),
    values: {
      '1': 5000,
      '2': 15000,
      '3': 35000,
      '4': 45000,
      '5': -2000,
    }
  },
  {
    date: getMonthDate(0),
    values: {
      '1': 5500,
      '2': 16000,
      '3': 36000,
      '4': 47000,
      '5': -1800,
    }
  }
];

export const Default: Story = {
  args: {
    accounts: sampleAccounts,
    entries: sampleEntries,
    onAddEntry: (date, values) => {
      console.log('New entry added:', { date, values });
    },
  },
};

export const EmptyEntries: Story = {
  args: {
    accounts: sampleAccounts,
    entries: [],
    onAddEntry: (date, values) => {
      console.log('New entry added:', { date, values });
    },
  },
};

export const NoAccounts: Story = {
  args: {
    accounts: [],
    entries: [],
    onAddEntry: (date, values) => {
      console.log('New entry added:', { date, values });
    },
  },
};