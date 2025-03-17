"use client";

import { Card, Text, Stack, Group, Progress, ActionIcon, Badge } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { Budget } from '@/models';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  remaining: number;
  formatAmount: (amount: number) => string;
  onEdit?: () => void;
  categories?: { id: string; name: string; color?: string }[];
}

export default function BudgetCard({
  budget,
  spent,
  remaining,
  formatAmount,
  onEdit,
  categories = []
}: BudgetCardProps) {
  const progress = (spent / budget.amount) * 100;
  const isOverBudget = spent > budget.amount;
  const progressColor = isOverBudget ? 'red' : progress > 80 ? 'orange' : 'blue';

  // Get selected categories
  const selectedCategories = categories.filter(cat => budget.categoryIds.includes(cat.id));

  return (
    <Card withBorder padding="lg">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} truncate>{budget.name}</Text>
          {onEdit && (
            <ActionIcon variant="subtle" onClick={onEdit}>
              <IconPencil size={16} />
            </ActionIcon>
          )}
        </Group>

        {selectedCategories.length > 0 ? (
          <Group gap="xs">
            {selectedCategories.map(category => (
              <Badge 
                key={category.id} 
                size="sm" 
                color={category.color || 'blue'}
                variant="dot"
              >
                {category.name}
              </Badge>
            ))}
          </Group>
        ) : (
          <Badge size="sm" variant="dot" color="blue    ">All Categories</Badge>
        )}

        <Progress 
          value={Math.min(progress, 100)} 
          color={progressColor}
          size="xl"
        />

        <Group grow>
          <Stack gap={0}>
            <Text size="xs" c="dimmed">Spent</Text>
            <Text fw={500} c={isOverBudget ? 'red' : undefined}>
              {formatAmount(spent)}
            </Text>
          </Stack>

          <Stack gap={0} align="flex-end">
            <Text size="xs" c="dimmed">Remaining</Text>
            <Text fw={500}>
              {formatAmount(remaining)}
            </Text>
          </Stack>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget: {formatAmount(budget.amount)}
        </Text>
      </Stack>
    </Card>
  );
}