"use client";

import { Card, Text, Stack, Group, Progress, ActionIcon } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { Budget } from '@/models';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  remaining: number;
  formatAmount: (amount: number) => string;
  onEdit?: () => void;
}

export default function BudgetCard({
  budget,
  spent,
  remaining,
  formatAmount,
  onEdit
}: BudgetCardProps) {
  const progress = (spent / budget.amount) * 100;
  const isOverBudget = spent > budget.amount;
  const progressColor = isOverBudget ? 'red' : progress > 80 ? 'orange' : 'blue';

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