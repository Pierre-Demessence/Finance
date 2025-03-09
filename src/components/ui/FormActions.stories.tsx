import type { Meta, StoryObj } from '@storybook/react';
import FormActions from './FormActions';

const meta = {
  title: 'UI/FormActions',
  component: FormActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCancel: () => console.log('Cancel clicked'),
    onSubmit: () => console.log('Submit clicked'),
    isSubmitting: false,
    submitLabel: 'Save',
    cancelLabel: 'Cancel'
  }
};

export const Submitting: Story = {
  args: {
    onCancel: () => console.log('Cancel clicked'),
    onSubmit: () => console.log('Submit clicked'),
    isSubmitting: true,
    submitLabel: 'Saving...',
    cancelLabel: 'Cancel'
  }
};

export const CustomLabels: Story = {
  args: {
    onCancel: () => console.log('Cancel clicked'),
    onSubmit: () => console.log('Submit clicked'),
    isSubmitting: false,
    submitLabel: 'Create Account',
    cancelLabel: 'Go Back'
  }
};

export const WithDelete: Story = {
  args: {
    onCancel: () => console.log('Cancel clicked'),
    onSubmit: () => console.log('Submit clicked'),
    isSubmitting: false,
    showDelete: true,
    onDelete: () => console.log('Delete clicked')
  }
};