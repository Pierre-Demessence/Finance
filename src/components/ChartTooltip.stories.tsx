import type { Meta, StoryObj } from '@storybook/react';
import { IconTrendingUp, IconCoin, IconCalendar } from '@tabler/icons-react';
import ChartTooltip from './ChartTooltip';

const meta = {
  title: 'Components/ChartTooltip',
  component: ChartTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChartTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: '$12,345.67',
    color: 'blue'
  }
};

export const WithCustomIcon: Story = {
  args: {
    label: 'Monthly Profit',
    value: '$2,845.33',
    color: 'green',
    icon: <IconTrendingUp size={16} />
  }
};

export const WithSecondaryData: Story = {
  args: {
    label: 'Portfolio Growth',
    value: '+24.6%',
    color: 'teal',
    icon: <IconCoin size={16} />,
    secondaryLabel: 'Since',
    secondaryValue: 'January 2023'
  }
};

export const NegativeValue: Story = {
  args: {
    label: 'Expense Change',
    value: '-$1,234.56',
    color: 'red',
    icon: <IconCalendar size={16} />,
    secondaryLabel: 'Compared to',
    secondaryValue: 'Last Month'
  }
};