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
  Switch,
} from '@mantine/core';
import { useFinanceStore } from '@/store/financeStore';
import { Account } from '@/models';
import { CURRENCIES } from '@/config/constants';

interface AccountFormProps {
  account?: Account;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const { accountCategories, addAccount, updateAccount } = useFinanceStore();
  
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('EUR');
  const [notes, setNotes] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Populate form if editing an existing account
  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setDescription(account.description || '');
      setCategoryId(account.categoryId || '');
      setCurrency(account.currency || 'EUR');
      setNotes(account.notes || '');
      // Note: initialBalance would need to be fetched from the account's balance history
      // For now, we just set it to 0 when editing
      setInitialBalance(0);
    }
  }, [account]);
  
  // Prepare category options for the select input
  const categoryOptions = accountCategories.map(category => ({
    value: category.id,
    label: category.name
  }));
  
  // Prepare currency options for the select input
  const currencyOptions = Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.code} (${currency.symbol}) - ${currency.name}`
  }));
  
  // Validate the form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    if (!currency) {
      newErrors.currency = 'Please select a currency';
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
      if (account) {
        // Update existing account
        updateAccount(account.id, {
          name,
          description,
          categoryId,
          currency,
          notes,
        });
      } else {
        // Add new account
        const accountData = {
          name,
          description,
          categoryId,
          currency,
          notes,
        };
        
        // Create account
        const newAccountId = addAccount(accountData);
        
        // In a real implementation, you'd also create an initial balance record
        // if initialBalance !== 0
        // Example: addBalanceRecord({ accountId: newAccountId, amount: initialBalance })
      }
      
      // Call the onSubmit callback to notify parent component
      onSubmit();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Account Name"
          placeholder="e.g., Checking Account, Savings Account"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        
        <TextInput
          label="Description"
          placeholder="e.g., Main checking account for daily expenses"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <Select
          label="Account Category"
          placeholder="Select a category"
          data={categoryOptions}
          value={categoryId}
          onChange={(value) => setCategoryId(value || '')}
          required
          error={errors.categoryId}
        />
        
        <Select
          label="Currency"
          placeholder="Select currency"
          data={currencyOptions}
          value={currency}
          onChange={(value) => setCurrency(value || 'EUR')}
          required
          searchable
          error={errors.currency}
        />
        
        {!account && (
          <NumberInput
            label="Initial Balance"
            placeholder="0.00"
            value={initialBalance}
            onChange={(value) => setInitialBalance(Number(value) || 0)}
            decimalScale={2}
            fixedDecimalScale
            allowNegative
          />
        )}
        
        <Textarea
          label="Notes"
          placeholder="Additional information about this account"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          autosize
          minRows={3}
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}