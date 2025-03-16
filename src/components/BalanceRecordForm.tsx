"use client";

import { useState, useEffect } from 'react';
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Textarea,
  Checkbox,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useFinanceStore } from '@/store/financeStore';
import { BalanceRecord } from '@/models';
import { IconCalendar, IconCoin } from '@tabler/icons-react';
import { useCurrency } from '@/hooks/useFinanceUtils';
import dayjs from 'dayjs';

interface BalanceRecordFormProps {
  record?: BalanceRecord;
  accountId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function BalanceRecordForm({
  record,
  accountId,
  onSubmit,
  onCancel,
}: BalanceRecordFormProps) {
  const { accounts, addBalanceRecord, updateBalanceRecord } = useFinanceStore();
  const { formatAmount } = useCurrency();
  
  // Find the account
  const account = accounts.find(a => a.id === accountId);
  
  // Form state
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Populate form if editing an existing record
  useEffect(() => {
    if (record) {
      setAmount(record.amount);
      setDate(record.date instanceof Date ? record.date : new Date(record.date));
      setNotes(record.notes || '');
      setIsVerified(record.isVerified);
    }
  }, [record]);

  // Validate the form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare record data
      const recordData = {
        accountId,
        amount,
        date: date instanceof Date && !isNaN(date.getTime()) ? date : new Date(),
        notes,
        isVerified,
      };
      
      if (record) {
        // Update existing record
        updateBalanceRecord(record.id, recordData);
      } else {
        // Add new record
        addBalanceRecord(recordData);
      }
      
      // Call the onSubmit callback to notify parent component
      onSubmit();
    } catch (error) {
      console.error('Error saving balance record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Text size="sm" c="dimmed" mb="xs">
          A balance record serves as a reference point that will override transaction calculations.
          Use this to reconcile your account balance with the actual balance from your bank statement.
        </Text>
        
        <Group grow>
          <NumberInput
            label="Balance Amount"
            placeholder="0.00"
            value={amount}
            onChange={(value) => setAmount(Number(value) || 0)}
            min={0}
            step={0.01}
            decimalScale={2}
            fixedDecimalScale
            required
            error={errors.amount}
            rightSection={<Text size="sm">{account?.currency || 'EUR'}</Text>}
            leftSection={<IconCoin size={16} />}
          />
          
          <DatePickerInput
            label="Date"
            placeholder="Select date"
            value={date instanceof Date && !isNaN(date.getTime()) ? date : new Date()}
            onChange={(value) => setDate(value || new Date())}
            required
            leftSection={<IconCalendar size={16} />}
            error={errors.date}
            clearable={false}
          />
        </Group>
        
        <Textarea
          label="Notes"
          placeholder="Optional notes about this balance record"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          autosize
          minRows={2}
        />
        
        <Checkbox
          mt="xs"
          label="Verified balance (reconciled with bank statement or official source)"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.currentTarget.checked)}
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {record ? 'Update Balance Record' : 'Save Balance Record'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}