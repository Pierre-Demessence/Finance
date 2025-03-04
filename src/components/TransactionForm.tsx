"use client";

import { useState, useEffect } from 'react';
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Select,
  Textarea,
  SegmentedControl,
  Divider,
  TagsInput,
  FileInput,
  Box,
  Text,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useFinanceStore } from '@/store/financeStore';
import { Transaction, TransactionType } from '@/models';
import { IconCalendar, IconReceipt, IconRepeat } from '@tabler/icons-react';
import { useCurrency } from '@/hooks/useFinanceUtils';
import dayjs from 'dayjs';

interface TransactionFormProps {
  transaction?: Transaction;
  initialType?: TransactionType;
  initialAccountId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function TransactionForm({
  transaction,
  initialType = TransactionType.EXPENSE,
  initialAccountId,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    accounts,
    transactionCategories,
    addTransaction,
    updateTransaction,
  } = useFinanceStore();
  const { formatAmount } = useCurrency();

  // Form state
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [fromAccountId, setFromAccountId] = useState<string | null>(
    type === TransactionType.EXPENSE || type === TransactionType.TRANSFER
      ? initialAccountId || null
      : null
  );
  const [toAccountId, setToAccountId] = useState<string | null>(
    type === TransactionType.INCOME ? initialAccountId || null : null
  );
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Use local variables to manage account selection
  const handleFromAccountChange = (value: string | null) => {
    setFromAccountId(value);
  };
  
  const handleToAccountChange = (value: string | null) => {
    setToAccountId(value);
  };
  
  // Populate form if editing an existing transaction
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setDate(transaction.date);
      setDescription(transaction.description || '');
      // Set category without resetting it
      setCategoryId(transaction.categoryId || '');
      // Set accounts without resetting them based on type
      if (transaction.fromAccountId) {
        setFromAccountId(transaction.fromAccountId);
      }
      if (transaction.toAccountId) {
        setToAccountId(transaction.toAccountId);
      }
      setNotes(transaction.notes || '');
      setTags(transaction.tags || []);
      setIsRecurring(transaction.isRecurring || false);
    }
  }, [transaction]);
  
  // Update account fields when transaction type changes, but only for new transactions
  useEffect(() => {
    if (!transaction) {
      if (type === TransactionType.EXPENSE) {
        setToAccountId(null);
      } else if (type === TransactionType.INCOME) {
        setFromAccountId(null);
      }
      
      // Reset categoryId when changing transaction type only for new transactions
      setCategoryId('');
    }
  }, [type, transaction]);
  
  // Filter categories based on transaction type
  const filteredCategories = transactionCategories.filter(
    cat => cat.type === type || cat.type === 'all'
  );
  
  // Prepare category options for the select input
  const categoryOptions = filteredCategories.map(category => ({
    value: category.id,
    label: category.name,
  }));
  
  // Prepare account options for the select inputs
  const accountOptions = accounts
    .filter(account => !account.isArchived)
    .map(account => ({
      value: account.id,
      label: `${account.name} (${formatAmount(0, account.currency)})`,
    }));
  
  // Get account currency
  const getAccountCurrency = (accountId: string | null) => {
    if (!accountId) return null;
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.currency : null;
  };
  
  // Determine main currency for the transaction
  const transactionCurrency = 
    getAccountCurrency(fromAccountId) || 
    getAccountCurrency(toAccountId) || 
    'EUR';
  
  // Validate the form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (type === TransactionType.EXPENSE && !fromAccountId) {
      newErrors.fromAccountId = 'Source account is required';
    }
    
    if (type === TransactionType.INCOME && !toAccountId) {
      newErrors.toAccountId = 'Destination account is required';
    }
    
    if (type === TransactionType.TRANSFER) {
      if (!fromAccountId) {
        newErrors.fromAccountId = 'Source account is required';
      }
      
      if (!toAccountId) {
        newErrors.toAccountId = 'Destination account is required';
      }
      
      if (fromAccountId === toAccountId) {
        newErrors.toAccountId = 'Source and destination accounts must be different';
      }
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
      // Prepare transaction data
      const transactionData = {
        type,
        amount,
        // Ensure we're sending a valid date
        date: date instanceof Date && !isNaN(date.getTime()) ? date : new Date(),
        categoryId,
        description,
        fromAccountId,
        toAccountId,
        notes,
        tags,
        isRecurring,
        // Handle attachments - would typically upload files and store URLs
        attachments: [],
      };
      
      if (transaction) {
        // Update existing transaction
        updateTransaction(transaction.id, transactionData);
      } else {
        // Add new transaction
        addTransaction(transactionData);
      }
      
      // Call the onSubmit callback to notify parent component
      onSubmit();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <SegmentedControl
          value={type}
          onChange={(value) => setType(value as TransactionType)}
          data={[
            { label: 'Expense', value: TransactionType.EXPENSE },
            { label: 'Income', value: TransactionType.INCOME },
            { label: 'Transfer', value: TransactionType.TRANSFER },
          ]}
          fullWidth
          mb="xs"
        />
        
        <Group grow>
          <NumberInput
            label="Amount"
            placeholder="0.00"
            value={amount}
            onChange={(value) => setAmount(Number(value) || 0)}
            min={0.01}
            step={0.01}
            decimalScale={2}
            fixedDecimalScale
            required
            error={errors.amount}
            rightSection={<Text size="sm">{transactionCurrency}</Text>}
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
        
        <Select
          label="Category"
          placeholder="Select category"
          data={categoryOptions}
          value={categoryId}
          onChange={(value) => setCategoryId(value || '')}
          required
          error={errors.categoryId}
          searchable
        />
        
        <TextInput
          label="Description"
          placeholder={
            type === TransactionType.EXPENSE
              ? 'e.g., Grocery shopping at Walmart'
              : type === TransactionType.INCOME
              ? 'e.g., Monthly salary'
              : 'e.g., Transfer from savings to checking'
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {(type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) && (
          <Select
            label="From Account"
            placeholder="Select source account"
            data={accountOptions}
            value={fromAccountId}
            onChange={handleFromAccountChange}
            required
            error={errors.fromAccountId}
            searchable
          />
        )}
        
        {(type === TransactionType.INCOME || type === TransactionType.TRANSFER) && (
          <Select
            label="To Account"
            placeholder="Select destination account"
            data={accountOptions}
            value={toAccountId}
            onChange={handleToAccountChange}
            required
            error={errors.toAccountId}
            searchable
          />
        )}
        
        <Divider my="xs" label="Additional Details" labelPosition="center" />
        
        <TagsInput
          label="Tags"
          placeholder="Add tags and press Enter"
          value={tags}
          onChange={setTags}
        />
        
        <FileInput
          label="Attachments"
          placeholder="Upload receipts or related documents"
          accept="image/png,image/jpeg,application/pdf"
          multiple
          onChange={setAttachments}
          leftSection={<IconReceipt size={16} />}
        />
        
        <Textarea
          label="Notes"
          placeholder="Additional information about this transaction"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          autosize
          minRows={3}
        />
        
        <Checkbox
          mt="xs"
          label={
            <Group gap="xs">
              <IconRepeat size={14} />
              <Text size="sm">Set up as recurring transaction</Text>
            </Group>
          }
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.currentTarget.checked)}
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {transaction ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}