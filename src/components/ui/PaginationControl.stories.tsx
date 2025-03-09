import type { Meta, StoryObj } from '@storybook/react';
import PaginationControl from './PaginationControl';

const meta = {
  title: 'UI/PaginationControl',
  component: PaginationControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PaginationControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    pageSizeOptions: [
      { value: '10', label: '10 per page' },
      { value: '25', label: '25 per page' },
      { value: '50', label: '50 per page' },
      { value: '100', label: '100 per page' },
    ],
    onPageChange: (page) => console.log('Page changed to:', page),
    onPageSizeChange: (size) => console.log('Page size changed to:', size),
  }
};

export const CurrentPageInMiddle: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    pageSize: 25,
    pageSizeOptions: [
      { value: '10', label: '10 per page' },
      { value: '25', label: '25 per page' },
      { value: '50', label: '50 per page' },
      { value: '100', label: '100 per page' },
    ],
    onPageChange: (page) => console.log('Page changed to:', page),
    onPageSizeChange: (size) => console.log('Page size changed to:', size),
  }
};

export const ManyPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 50,
    pageSize: 10,
    pageSizeOptions: [
      { value: '10', label: '10 per page' },
      { value: '25', label: '25 per page' },
      { value: '50', label: '50 per page' },
      { value: '100', label: '100 per page' },
    ],
    onPageChange: (page) => console.log('Page changed to:', page),
    onPageSizeChange: (size) => console.log('Page size changed to:', size),
  }
};