"use client";
import { LineChart } from '@mantine/charts';
import { Paper, Title, Stack } from '@mantine/core';
import { formatCurrency } from '../config/finance';
import { Account } from '../models';

interface FinanceEntry {
  date: Date;
  values: Record<string, number>;
}

interface FinanceChartProps {
  accounts: Account[];
  entries: FinanceEntry[];
}

export function FinanceChart({ accounts, entries }: FinanceChartProps) {
  // Sort entries by date (oldest first for the chart)
  const sortedEntries = [...entries].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  // Get unique categories
  const categories = [...new Set(accounts.map(acc => acc.categoryId))];

  // Calculate totals by category for each date
  const chartData = sortedEntries.map(entry => ({
    date: entry.date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    }),
    // Add category totals
    ...categories.reduce((acc, categoryId) => {
      acc[categoryId] = accounts
        .filter(acc => acc.categoryId === categoryId)
        .reduce((sum, acc) => sum + (entry.values[acc.id] || 0), 0);
      return acc;
    }, {} as Record<string, number>),
    // Add total last so it appears at the bottom of the tooltip
    total: accounts.reduce((sum, acc) => sum + (entry.values[acc.id] || 0), 0)
  }));

  const colors = ['blue.7', 'teal.7', 'violet.7', 'pink.7', 'orange.7', 'green.7'];

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack>
        <Title order={2} size="h3">Net Worth Over Time</Title>
        {chartData.length > 0 ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <LineChart
              h={350}
              data={chartData}
              dataKey="date"
              series={[
                ...categories.map((categoryId, index) => ({
                  name: categoryId,
                  color: colors[index % colors.length]
                })),
                { name: 'Total', color: 'red.7' }
              ]}
              curveType="monotone"
              gridAxis="xy"
              withLegend
              valueFormatter={(value) => formatCurrency(value)}
              yAxisProps={{
                tickFormatter: (value) => formatCurrency(value),
                width: 100
              }}
              style={{ flex: 1 }}
            />
          </div>
        ) : (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No data available
          </div>
        )}
      </Stack>
    </Paper>
  );
}