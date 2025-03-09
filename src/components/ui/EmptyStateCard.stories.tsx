import type { Meta, StoryObj } from '@storybook/react';
import { IconDatabase, IconWallet, IconUsers, IconChartBar } from '@tabler/icons-react';
import EmptyStateCard from './EmptyStateCard';

const meta: Meta<typeof EmptyStateCard> = {
  title: 'UI/EmptyStateCard',
  component: EmptyStateCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyStateCard>;

export const NoData: Story = {
  args: {
    icon: <IconDatabase size={24} />,
    title: 'No Data Available',
    description: 'There is no data to display for this time period. Please adjust your filters or check back later.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithAction: Story = {
  args: {
    icon: <IconWallet size={24} />,
    title: 'No Accounts Yet',
    description: 'You haven\'t added any accounts to track your finances. Add your first account to get started.',
    actionLabel: 'Add Account',
    onAction: () => console.log('Add account clicked'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const NoTransactions: Story = {
  args: {
    icon: <IconChartBar size={24} />,
    title: 'No Transaction History',
    description: 'Your transaction history is empty. Start by adding your first transaction to track your spending.',
    actionLabel: 'New Transaction',
    onAction: () => console.log('New transaction clicked'),
    actionVariant: 'filled',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};