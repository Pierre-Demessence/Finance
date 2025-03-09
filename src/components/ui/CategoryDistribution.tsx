import { Grid } from '@mantine/core';
import React from 'react';
import CategoryDonutChart from './CategoryDonutChart';
import CategoryBreakdown from './CategoryBreakdown';

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
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <CategoryDonutChart
          title={title}
          totalValue={totalValue}
          data={data}
          chartHeight={chartHeight}
          formatValue={formatValue}
        />
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <CategoryBreakdown
          title={totalLabel}
          totalValue={totalValue}
          data={data}
          formatValue={formatValue}
        />
      </Grid.Col>
    </Grid>
  );
}