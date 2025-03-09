import { Card, Group, Text } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { IconChartPie } from '@tabler/icons-react';
import React from 'react';
import ChartTooltip from '@/components/ChartTooltip';

interface CategoryItem {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  count?: number;
}

interface CategoryDonutChartProps {
  title: string;
  totalValue: number;
  data: CategoryItem[];
  chartHeight?: number;
  formatValue: (value: number) => string;
}

/**
 * A component that displays category distribution with a donut chart.
 * Used for financial distribution visualizations.
 */
export default function CategoryDonutChart({ 
  title, 
  totalValue, 
  data, 
  chartHeight = 240,
  formatValue 
}: CategoryDonutChartProps) {
  // Sort data by value in descending order to display the largest values first
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="lg">
        <Text fw={500}>{title}</Text>
        <Text fw={700}>{formatValue(totalValue)}</Text>
      </Group>
      
      <DonutChart
        h={chartHeight}
        data={sortedData}
        withLabels
        withTooltip
        tooltipProps={{
          content: ({ payload }) => {
            if (!payload?.length) return null;
            const item = payload[0].payload;
            return (
              <ChartTooltip
                label={item.name}
                value={formatValue(item.value)}
                color={item.color}
                icon={item.icon || <IconChartPie size={16} />}
                secondaryLabel="Percentage"
                secondaryValue={`${((item.value / totalValue) * 100).toFixed(1)}%`}
              />
            );
          },
        }}
      />
    </Card>
  );
}