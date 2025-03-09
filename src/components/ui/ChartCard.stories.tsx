import type { Meta, StoryObj } from '@storybook/react';
import ChartCard from './ChartCard';
import { DonutChart } from '@mantine/charts';

const meta: Meta<typeof ChartCard> = {
  title: 'UI/ChartCard',
  component: ChartCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChartCard>;

// Sample chart data for the demo
const chartData = [
  { name: 'Housing', value: 1200, color: '#228be6' },
  { name: 'Transportation', value: 600, color: '#40c057' },
  { name: 'Food', value: 450, color: '#fa5252' },
  { name: 'Entertainment', value: 300, color: '#fab005' },
];

export const WithChart: Story = {
  args: {
    title: 'Monthly Expenses',
    description: 'Breakdown of expenses by category',
    height: 300,
    hasData: true,
    children: (
      <DonutChart
        data={chartData}
        withLabels
        withTooltip
        tooltipDataSource="segment"
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const NoData: Story = {
  args: {
    title: 'Monthly Expenses',
    description: 'Breakdown of expenses by category',
    height: 300,
    hasData: false,
    emptyMessage: 'No expense data available for this period',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};