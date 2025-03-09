import type { Meta, StoryObj } from '@storybook/react';
import { IconHome, IconCar, IconDeviceDesktop } from '@tabler/icons-react';
import CategoryProgressBar from './CategoryProgressBar';

const meta: Meta<typeof CategoryProgressBar> = {
  title: 'UI/CategoryProgressBar',
  component: CategoryProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryProgressBar>;

export const Default: Story = {
  args: {
    icon: <IconHome size={16} />,
    name: 'Housing',
    value: '$1,200',
    percentage: 45.2,
    color: '#228be6',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCount: Story = {
  args: {
    icon: <IconCar size={16} />,
    name: 'Transportation',
    value: '$600',
    percentage: 23.5,
    count: 5,
    color: '#40c057',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const HighPercentage: Story = {
  args: {
    icon: <IconDeviceDesktop size={16} />,
    name: 'Electronics',
    value: '$2,500',
    percentage: 87.3,
    color: '#fa5252',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};