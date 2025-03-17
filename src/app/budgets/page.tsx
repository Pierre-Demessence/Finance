"use client";

import { useState } from 'react';
import {
  Container,
  Title,
  Group,
  Button,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPigMoney, IconPlus } from '@tabler/icons-react';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency } from '@/hooks/useFinanceUtils';
import { Budget } from '@/models';
import BudgetCard from '@/components/ui/BudgetCard';
import BudgetForm from '@/components/BudgetForm';
import ModalWrapper from '@/components/ui/ModalWrapper';
import EmptyStateCard from '@/components/ui/EmptyStateCard';

export default function BudgetsPage() {
  const { 
    budgets, 
    transactionCategories,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetSpent,
    getBudgetRemaining 
  } = useFinanceStore();
  const { formatAmount } = useCurrency();
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  
  // Form handlers
  const handleFormSubmit = (values: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedBudget) {
      updateBudget(selectedBudget.id, values);
    } else {
      addBudget(values);
    }
    close();
  };
  
  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    open();
  };
  
  const handleNewBudget = () => {
    setSelectedBudget(null);
    open();
  };
  
  const handleDelete = () => {
    if (selectedBudget && deleteBudget(selectedBudget.id)) {
      close();
    }
  };
  
  // Convert transaction categories to format needed by form
  const categoryOptions = transactionCategories
    .filter(cat => cat.type === 'expense' || cat.type === 'all')
    .map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  
  // Group budgets by period
  const groupedBudgets = budgets.reduce((groups, budget) => {
    if (!groups[budget.period]) {
      groups[budget.period] = [];
    }
    groups[budget.period].push(budget);
    return groups;
  }, {} as Record<string, Budget[]>);
  
  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Budgets</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleNewBudget}
        >
          New Budget
        </Button>
      </Group>

      {budgets.length === 0 ? (
        <EmptyStateCard
          title="No budgets yet"
          description="Create your first budget to start tracking your spending"
          icon={<IconPigMoney size={50} />}
          actionLabel="Create Budget"
          onAction={handleNewBudget}
        />
      ) : (
        <Stack>
          {Object.entries(groupedBudgets).map(([period, periodBudgets]) => (
            <Stack key={period}>
              <Title order={3}>
                {period.charAt(0).toUpperCase() + period.slice(1)} Budgets
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {periodBudgets.map(budget => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    spent={getBudgetSpent(budget.id)}
                    remaining={getBudgetRemaining(budget.id)}
                    formatAmount={formatAmount}
                    onEdit={() => handleEditBudget(budget)}
                    categories={transactionCategories}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>
      )}

      <ModalWrapper
        opened={opened}
        onClose={close}
        title={selectedBudget ? 'Edit Budget' : 'New Budget'}
        size="lg"
      >
        <BudgetForm
          budget={selectedBudget || undefined}
          transactionCategories={categoryOptions}
          onSubmit={handleFormSubmit}
          onCancel={close}
          onDelete={selectedBudget ? handleDelete : undefined}
        />
      </ModalWrapper>
    </Container>
  );
}