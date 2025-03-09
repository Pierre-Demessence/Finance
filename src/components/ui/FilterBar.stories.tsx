import type { Meta, StoryObj } from '@storybook/react';
import { IconCalendar, IconCategory, IconCoin } from '@tabler/icons-react';
import FilterBar from './FilterBar';

const meta = {
  title: 'UI/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    searchValue: '',
  }
};

export const WithSorting: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    searchValue: '',
    sortOptions: [
      { value: 'date-desc', label: 'Date (Newest first)' },
      { value: 'date-asc', label: 'Date (Oldest first)' },
      { value: 'amount-desc', label: 'Amount (High to low)' },
      { value: 'amount-asc', label: 'Amount (Low to high)' },
    ],
    onSort: (value) => console.log('Sort:', value),
    sortValue: null,
  }
};

export const WithFilters: Story = {
  args: {
    onSearch: (value: string) => console.log('Search:', value),
    searchValue: '',
    sortOptions: [
      { value: 'date-desc', label: 'Date (Newest first)' },
      { value: 'date-asc', label: 'Date (Oldest first)' },
    ],
    onSort: (value) => console.log('Sort:', value),
    sortValue: 'date-desc',
    filterOptions: [
      {
        label: 'Date Range',
        icon: <IconCalendar size={16} />,
        options: [
          { value: 'today', label: 'Today' },
          { value: 'this-week', label: 'This Week' },
          { value: 'this-month', label: 'This Month' },
          { value: 'this-year', label: 'This Year' },
        ],
        value: null,
        onChange: (value) => console.log('Date filter:', value),
      },
      {
        label: 'Category',
        icon: <IconCategory size={16} />,
        options: [
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
          { value: 'investment', label: 'Investment' },
        ],
        value: null,
        onChange: (value) => console.log('Category filter:', value),
      },
      {
        label: 'Amount',
        icon: <IconCoin size={16} />,
        options: [
          { value: '0-100', label: '$0 - $100' },
          { value: '101-500', label: '$101 - $500' },
          { value: '501-1000', label: '$501 - $1000' },
          { value: '1001+', label: '$1000+' },
        ],
        value: null,
        onChange: (value) => console.log('Amount filter:', value),
      },
    ],
    onReset: () => console.log('Reset filters'),
  }
};