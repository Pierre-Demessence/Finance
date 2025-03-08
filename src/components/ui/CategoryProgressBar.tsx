import { Group, ThemeIcon, Text, Progress } from '@mantine/core';
import React from 'react';

interface CategoryProgressBarProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  percentage: number;
  count?: number;
  color: string;
}

/**
 * A component for displaying a category with its value, percentage, and progress bar.
 * Used for visualizing distribution across categories in reports and asset breakdowns.
 */
export default function CategoryProgressBar({ 
  icon, 
  name, 
  value, 
  percentage, 
  count, 
  color 
}: CategoryProgressBarProps) {
  return (
    <div>
      <Group justify="space-between" mb={5}>
        <Group>
          <ThemeIcon color={color} variant="light" size="sm">
            {icon}
          </ThemeIcon>
          <Text size="sm">{name}</Text>
        </Group>
        <Text size="sm" fw={500}>
          {value} {count !== undefined && <Text span c="dimmed" size="xs">({count})</Text>}
        </Text>
      </Group>
      <Progress 
        value={percentage} 
        color={color} 
        size="sm" 
        mb={2}
      />
      <Text size="xs" ta="right" c="dimmed">{percentage.toFixed(0)}%</Text>
    </div>
  );
}