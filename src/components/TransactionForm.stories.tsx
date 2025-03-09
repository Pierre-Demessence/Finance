import type { Meta, StoryObj } from '@storybook/react';
import TransactionForm from './TransactionForm';
import { TransactionType } from '@/models';

const meta = {
  title: 'Components/TransactionForm',
  component: TransactionForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewExpenseTransaction: Story = {
  args: {
    initialType: TransactionType.EXPENSE,
    onSubmit: () => console.log('Form submitted'),
    onCancel: () => console.log('Form canceled'),
  }
};

export const NewIncomeTransaction: Story = {
  args: {
    initialType: TransactionType.INCOME,
    onSubmit: () => console.log('Form submitted'),
    onCancel: () => console.log('Form canceled'),
  }
};

export const NewTransferTransaction: Story = {
  args: {
    initialType: TransactionType.TRANSFER,
    onSubmit: () => console.log('Form submitted'),
    onCancel: () => console.log('Form canceled'),
  }
};

export const EditTransactionExample: Story = {
  args: {
    transaction: {
      id: 'tx123',
      type: TransactionType.EXPENSE,
      amount: 125.45,
      date: new Date(),
      categoryId: 'cat-groceries',
      description: 'Weekly grocery shopping',
      fromAccountId: 'acc-checking',
      notes: 'Monthly grocery budget',
      tags: ['food', 'essentials'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    onSubmit: () => console.log('Form submitted'),
    onCancel: () => console.log('Form canceled'),
  }
};