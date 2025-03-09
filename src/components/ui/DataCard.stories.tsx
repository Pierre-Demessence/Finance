import type { Meta, StoryObj } from '@storybook/react';
import { IconWallet, IconArrowUpRight, IconUsers, IconBuildingBank } from '@tabler/icons-react';
import DataCard from './DataCard';

const meta: Meta<typeof DataCard> = {
  title: 'UI/DataCard',
  component: DataCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataCard>;

export const Basic: Story = {
  args: {
    title: 'Total Balance',
    value: '$24,500.00',
    subtitle: 'Updated today',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithIcon: Story = {
  args: {
    title: 'Monthly Income',
    value: '$5,230.80',
    subtitle: '12% increase from last month',
    icon: <IconWallet size={20} />,
    color: 'green',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithBadge: Story = {
  args: {
    title: 'Active Accounts',
    value: '8',
    subtitle: 'Across 3 financial institutions',
    icon: <IconBuildingBank size={20} />,
    badgeValue: '+2',
    color: 'blue',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCustomValueColor: Story = {
  args: {
    title: 'Expense Growth',
    value: '+15.3%',
    subtitle: 'Compared to last quarter',
    icon: <IconArrowUpRight size={20} />,
    valueColor: 'red',
    color: 'red',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AsLink: Story = {
  args: {
    title: 'Authorized Users',
    value: '3 Users',
    subtitle: 'Click to manage users',
    icon: <IconUsers size={20} />,
    asLink: true,
    href: '#',
    color: 'violet',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};