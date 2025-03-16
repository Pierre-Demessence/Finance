"use client";

import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Stack, Grid, NumberInput, MultiSelect, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Budget } from '@/models';
import FormActions from './ui/FormActions';

interface BudgetFormProps {
  budget?: Budget;
  transactionCategories: { value: string; label: string }[];
  onSubmit: (values: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

export default function BudgetForm({
  budget,
  transactionCategories,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false
}: BudgetFormProps) {
  const form = useForm({
    initialValues: {
      name: '',
      startDate: new Date(),
      endDate: null as Date | null,
      amount: 0,
      period: 'monthly' as Budget['period'],
      categoryIds: [] as string[],
      notes: '',
      isRecurring: false,
      recurringRuleId: undefined as string | undefined,
    },
    validate: {
      name: (value) => !value ? 'Name is required' : null,
      amount: (value) => value <= 0 ? 'Amount must be greater than 0' : null,
      startDate: (value) => !value ? 'Start date is required' : null,
    },
  });

  useEffect(() => {
    if (budget) {
      form.setValues({
        name: budget.name,
        startDate: new Date(budget.startDate),
        endDate: budget.endDate ? new Date(budget.endDate) : null,
        amount: budget.amount,
        period: budget.period,
        categoryIds: budget.categoryIds,
        notes: budget.notes || '',
        isRecurring: budget.isRecurring,
        recurringRuleId: budget.recurringRuleId,
      });
    }
  }, [budget]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Budget Name"
              placeholder="e.g., Monthly Expenses"
              required
              {...form.getInputProps('name')}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <DatePickerInput
              label="Start Date"
              placeholder="Select start date"
              required
              clearable={false}
              {...form.getInputProps('startDate')}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <DatePickerInput
              label="End Date"
              placeholder="Select end date (optional)"
              clearable
              {...form.getInputProps('endDate')}
              minDate={form.values.startDate}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput
              label="Budget Amount"
              placeholder="0.00"
              required
              min={0}
              precision={2}
              {...form.getInputProps('amount')}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="Period"
              data={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              {...form.getInputProps('period')}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <MultiSelect
              label="Categories"
              placeholder="Select categories"
              data={transactionCategories}
              searchable
              {...form.getInputProps('categoryIds')}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Notes"
              placeholder="Optional notes about this budget"
              {...form.getInputProps('notes')}
            />
          </Grid.Col>
        </Grid>

        <FormActions
          onCancel={onCancel}
          onSubmit={() => {}}
          onDelete={budget ? onDelete : undefined}
          isSubmitting={isSubmitting}
          submitLabel={budget ? 'Update Budget' : 'Create Budget'}
        />
      </Stack>
    </form>
  );
}