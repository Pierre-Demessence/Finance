import { Card, Text, Stack } from '@mantine/core';
import { IconChartPie } from '@tabler/icons-react';
import React from 'react';
import CategoryProgressBar from './CategoryProgressBar';

interface CategoryItem {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  count?: number;
}

interface CategoryBreakdownProps {
  title: string;
  totalValue: number;
  data: CategoryItem[];
  formatValue: (value: number) => string;
}

/**
 * A component that displays a breakdown of categories using progress bars.
 * Used for financial distribution visualizations.
 */
export default function CategoryBreakdown({ 
  title, 
  totalValue, 
  data, 
  formatValue 
}: CategoryBreakdownProps) {
  // Sort data by value in descending order to display the largest values first
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fw={500} mb="md">{title}</Text>
      <Stack gap="xs">
        {sortedData.map((item, index) => {
          const percentage = totalValue ? (item.value / totalValue) * 100 : 0;
          
          return (
            <CategoryProgressBar
              key={index}
              icon={item.icon || <IconChartPie size={16} />}
              name={item.name}
              value={formatValue(item.value)}
              percentage={percentage}
              count={item.count}
              color={item.color}
            />
          );
        })}
      </Stack>
    </Card>
  );
}