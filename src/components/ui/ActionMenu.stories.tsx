import type { Meta, StoryObj } from '@storybook/react';
import { IconEdit, IconTrash, IconEye, IconStar } from '@tabler/icons-react';
import ActionMenu from './ActionMenu';

const meta = {
  title: 'UI/ActionMenu',
  component: ActionMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        icon: <IconEye size={16} />,
        label: 'View Details',
        onClick: () => console.log('View clicked')
      },
      {
        icon: <IconEdit size={16} />,
        label: 'Edit',
        onClick: () => console.log('Edit clicked')
      },
      {
        icon: <IconTrash size={16} />,
        label: 'Delete',
        onClick: () => console.log('Delete clicked'),
        color: 'red'
      }
    ]
  }
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      {
        icon: <IconEye size={16} />,
        label: 'View Details',
        onClick: () => console.log('View clicked')
      },
      {
        icon: <IconEdit size={16} />,
        label: 'Edit',
        onClick: () => console.log('Edit clicked'),
        disabled: true
      },
      {
        icon: <IconStar size={16} />,
        label: 'Favorite',
        onClick: () => console.log('Favorite clicked'),
        color: 'yellow'
      },
      {
        icon: <IconTrash size={16} />,
        label: 'Delete',
        onClick: () => console.log('Delete clicked'),
        color: 'red'
      }
    ]
  }
};