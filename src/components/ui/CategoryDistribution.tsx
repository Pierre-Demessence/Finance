import { Card, Group, Text, Grid, Stack } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { IconChartPie } from '@tabler/icons-react';
import React from 'react';
import ChartTooltip from '@/components/ChartTooltip';
import CategoryProgressBar from './CategoryProgressBar';

interface CategoryItem {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  count?: number;
}

interface CategoryDistributionProps {
  title: string;
  totalValue: number;
  totalLabel?: string;
  data: CategoryItem[];
  chartHeight?: number;
  formatValue: (value: number) => string;
}

/**
 * A component that displays category distribution with donut chart and category breakdown.
 * Used for financial distribution visualizations like income/expense breakdowns or asset allocations.
 */
export default function CategoryDistribution({ 
  title, 
  totalValue, 
  totalLabel = "Total",
  data, 
  chartHeight = 240,
  formatValue 
}: CategoryDistributionProps) {
  // Sort data by value in descending order to display the largest values first
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
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
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder padding="lg" radius="md">
          <Text fw={500} mb="md">{totalLabel}</Text>
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
      </Grid.Col>
    </Grid>
  );
}