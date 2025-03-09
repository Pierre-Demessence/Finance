import type { Meta, StoryObj } from '@storybook/react';
import AccountForm from './AccountForm';

const meta = {
  title: 'Components/AccountForm',
  component: AccountForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateNewAccount: Story = {
  args: {
    onSubmit: () => console.log('Account form submitted'),
    onCancel: () => console.log('Account form canceled'),
  }
};

export const EditExistingAccount: Story = {
  args: {
    account: {
      id: 'acc123',
      name: 'Main Checking Account',
      description: 'Primary bank account for daily expenses',
      categoryId: 'cat-banking',
      currency: 'USD',
      notes: 'Joint account with partner',
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    onSubmit: () => console.log('Account form submitted'),
    onCancel: () => console.log('Account form canceled'),
  }
};

export const CreateSavingsAccount: Story = {
  args: {
    onSubmit: () => console.log('Savings account form submitted'),
    onCancel: () => console.log('Savings account form canceled'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example for creating a new savings account'
      }
    }
  }
};