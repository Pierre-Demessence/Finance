"use client";
import { useState } from 'react';
import { Table, Group, Button, Text, Stack } from '@mantine/core';
import { NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { formatCurrency } from '../config/finance';

interface Account {
  id: string;
  name: string;
  category: string;
}

interface FinanceTableProps {
  accounts: Account[];
  entries: { date: Date; values: Record<string, number> }[];
  onAddEntry: (date: Date, values: Record<string, number>) => void;
}

export default function FinanceTable({ accounts, entries, onAddEntry }: FinanceTableProps) {
  const [newDate, setNewDate] = useState<Date | null>(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  const sortedEntries = [...entries].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDate) return;

    const numberValues: Record<string, number> = {};
    Object.keys(newValues).forEach(account => {
      if (newValues[account]) {
        numberValues[account] = parseFloat(newValues[account]);
      }
    });
    
    if (Object.keys(numberValues).length > 0) {
      // Create a UTC date at midnight for the first of the month
      const utcDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), 1));
      onAddEntry(utcDate, numberValues);
      setNewValues({});
    }
  };

  const handleValueChange = (accountId: string, value: string) => {
    setNewValues(prev => ({
      ...prev,
      [accountId]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Always set to first day of the selected month
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      setNewDate(firstDayOfMonth);
    } else {
      setNewDate(null);
    }
  };

  // Get unique categories
  const categories = [...new Set(accounts.map(acc => acc.category))];

  // Calculate total for an entry across all accounts or by category
  const calculateEntryTotal = (entry: { date: Date; values: Record<string, number> }, categoryFilter?: string) => {
    return accounts.reduce((sum, account) => {
      if (categoryFilter && account.category !== categoryFilter) return sum;
      return sum + (entry.values[account.id] || 0);
    }, 0);
  };

  // Group accounts by category
  const accountsByCategory = categories.reduce((acc, category) => {
    acc[category] = accounts.filter(account => account.category === category);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <Stack>
      <form onSubmit={handleSubmit}>
        <Group align="end" gap="sm" mb="md">
          <DatePickerInput
            value={newDate}
            onChange={handleDateChange}
            label="Date"
            required
            type="default"
            valueFormat="MMM YYYY"
          />
          {accounts.map(account => (
            <NumberInput
              key={account.id}
              label={`${account.name} (${account.category})`}
              value={newValues[account.id] || ''}
              onChange={(val) => handleValueChange(account.id, val?.toString() || '')}
              placeholder="0.00"
              decimalScale={2}
              min={-999999999}
              max={999999999}
              style={{ width: '120px' }}
            />
          ))}
          <Button type="submit">Add Entry</Button>
        </Group>
      </form>

      {accounts.length > 0 ? (
        <Table withTableBorder withColumnBorders striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              {categories.map(category => (
                <Table.Th key={category} colSpan={accountsByCategory[category].length + 1}>
                  {category}
                </Table.Th>
              ))}
              <Table.Th>Total</Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Th />
              {categories.map(category => (
                accountsByCategory[category].map(account => (
                  <Table.Th key={account.id}>{account.name}</Table.Th>
                )).concat(
                  <Table.Th key={`${category}-total`}>Total</Table.Th>
                )
              )).flat()}
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedEntries.map((entry, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  {entry.date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Table.Td>
                {categories.map(category => (
                  accountsByCategory[category].map(account => (
                    <Table.Td key={account.id}>
                      {entry.values[account.id] !== undefined 
                        ? formatCurrency(entry.values[account.id]) 
                        : '-'}
                    </Table.Td>
                  )).concat(
                    <Table.Td key={`${category}-total`} fw={500}>
                      {formatCurrency(calculateEntryTotal(entry, category))}
                    </Table.Td>
                  )
                )).flat()}
                <Table.Td fw={700}>
                  {formatCurrency(calculateEntryTotal(entry))}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text ta="center" py="xl" c="dimmed">
          Please add at least one account to get started.
        </Text>
      )}
    </Stack>
  );
}