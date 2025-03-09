"use client";

import { useState, useMemo } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  Tabs,
  SegmentedControl,
  Select,
  Stack,
  SimpleGrid,
  Grid,
  Paper,
  ThemeIcon,
  RingProgress,
  Progress,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconChartLine, 
  IconChartPie, 
  IconChartBar, 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconCalendarStats,
  IconCash,
  IconPigMoney,
  IconReceipt
} from '@tabler/icons-react';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency, useNetWorth, useTransactionAnalysis } from '@/hooks/useFinanceUtils';
import ChartTooltip from '@/components/ChartTooltip';
import dayjs from 'dayjs';
// Import UI components
import DataCard from '@/components/ui/DataCard';
import ChartCard from '@/components/ui/ChartCard';
import CategoryDistribution from '@/components/ui/CategoryDistribution';
import { formatPercentage } from '@/utils/financeUtils';

export default function ReportsPage() {
  // Date range for reports
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(30, 'day').toDate(),
    new Date()
  ]);
  
  // Track the active report tab - explicitly handle null
  const [activeTab, setActiveTab] = useState<string>('net-worth');
  const handleTabChange = (value: string | null) => {
    if (value) setActiveTab(value);
  };
  
  const { settings, accounts, accountCategories, transactions, transactionCategories } = useFinanceStore();
  const { formatAmount, toBaseCurrency } = useCurrency();
  const { getNetWorthHistory } = useNetWorth();
  const { getTransactionsByCategory, calculateTotalIncome, calculateTotalExpenses } = useTransactionAnalysis();
  
  // Update date range when period changes
  const handlePeriodChange = (value: '7d' | '30d' | '90d' | '1y' | 'custom') => {
    setPeriod(value);
    
    if (value !== 'custom') {
      let startDate;
      const endDate = new Date();
      
      switch (value) {
        case '7d':
          startDate = dayjs().subtract(7, 'day').toDate();
          break;
        case '30d':
          startDate = dayjs().subtract(30, 'day').toDate();
          break;
        case '90d':
          startDate = dayjs().subtract(90, 'day').toDate();
          break;
        case '1y':
          startDate = dayjs().subtract(1, 'year').toDate();
          break;
      }
      
      setDateRange([startDate, endDate]);
    }
  };
  
  // Calculate start and end dates from the date range
  const startDate = dateRange[0] || new Date();
  const endDate = dateRange[1] || new Date();
  
  // Generate net worth history data
  const netWorthData = useMemo(() => {
    // Determine appropriate interval based on date range
    let interval: 'day' | 'week' | 'month' = 'day';
    const daysDiff = dayjs(endDate).diff(startDate, 'day');
    
    if (daysDiff > 90) {
      interval = 'month';
    } else if (daysDiff > 30) {
      interval = 'week';
    }
    
    // Get net worth history data
    const netWorthHistory = getNetWorthHistory(startDate, endDate, interval);
    
    // Format data for chart
    return netWorthHistory.map(point => ({
      date: point.date.toLocaleDateString(),
      value: point.netWorth,
    }));
  }, [startDate, endDate, getNetWorthHistory]);
  
  // Calculate income and expense totals for the period
  const totalIncome = calculateTotalIncome(startDate, endDate);
  const totalExpenses = calculateTotalExpenses(startDate, endDate);
  const netCashflow = totalIncome - totalExpenses;
  
  // Generate income by category data
  const incomeByCategory = useMemo(() => {
    const data = getTransactionsByCategory(startDate, endDate, 'income');
    const colors = ['blue', 'cyan', 'teal', 'green', 'lime', 'yellow'];
    
    return Object.entries(data).map(([categoryId, amount], index) => {
      const category = transactionCategories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: amount,
        color: colors[index % colors.length],
        icon: <IconCash size={16} />
      };
    }).sort((a, b) => b.value - a.value);
  }, [startDate, endDate, getTransactionsByCategory, transactionCategories]);
  
  // Generate expense by category data
  const expenseByCategory = useMemo(() => {
    const data = getTransactionsByCategory(startDate, endDate, 'expense');
    const colors = ['red', 'pink', 'grape', 'violet', 'indigo', 'blue'];
    
    return Object.entries(data).map(([categoryId, amount], index) => {
      const category = transactionCategories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: amount,
        color: colors[index % colors.length],
        icon: <IconReceipt size={16} />
      };
    }).sort((a, b) => b.value - a.value);
  }, [startDate, endDate, getTransactionsByCategory, transactionCategories]);
  
  // Generate monthly comparison data (last 12 months)
  const monthlyComparisonData = useMemo(() => {
    const data: { month: string; income: number; expense: number }[] = [];
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month');
      const monthStart = month.startOf('month').toDate();
      const monthEnd = month.endOf('month').toDate();
      
      data.push({
        month: month.format('MMM YYYY'),
        income: calculateTotalIncome(monthStart, monthEnd),
        expense: calculateTotalExpenses(monthStart, monthEnd),
      });
    }
    
    return data;
  }, [calculateTotalIncome, calculateTotalExpenses]);

  return (
    <Container size="xl">
      <Title order={2} mb="md">Financial Reports</Title>
      
      <Card withBorder mb="md">
        <Stack>
          <Group>
            <SegmentedControl
              data={[
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' },
                { label: '1 Year', value: '1y' },
                { label: 'Custom', value: 'custom' },
              ]}
              value={period}
              onChange={(value) => handlePeriodChange(value as any)}
            />
            
            {period === 'custom' && (
              <DatePickerInput
                type="range"
                placeholder="Pick date range"
                value={dateRange}
                onChange={setDateRange}
                mx="auto"
              />
            )}
          </Group>
          
          <Text size="sm" c="dimmed">
            Showing data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
          </Text>
        </Stack>
      </Card>
      
      {/* Replace the summary cards with DataCard components */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <DataCard
          title="Net Cash Flow"
          value={`${netCashflow >= 0 ? '+' : ''}${formatAmount(netCashflow)}`}
          icon={netCashflow >= 0 ? <IconArrowUpRight size={18} /> : <IconArrowDownRight size={18} />}
          color={netCashflow >= 0 ? 'teal' : 'red'}
          valueColor={netCashflow >= 0 ? 'teal' : 'red'}
        />
        
        <DataCard
          title="Total Income"
          value={formatAmount(totalIncome)}
          icon={<IconArrowUpRight size={18} />}
          color="teal"
          valueColor="teal"
        />
        
        <DataCard
          title="Total Expenses"
          value={formatAmount(totalExpenses)}
          icon={<IconArrowDownRight size={18} />}
          color="red"
          valueColor="red"
        />
      </SimpleGrid>
      
      <Tabs value={activeTab} onChange={handleTabChange} mb="xl">
        <Tabs.List>
          <Tabs.Tab 
            value="net-worth" 
            leftSection={<IconChartLine size={16} />}
          >
            Net Worth
          </Tabs.Tab>
          <Tabs.Tab 
            value="income" 
            leftSection={<IconChartPie size={16} />}
          >
            Income
          </Tabs.Tab>
          <Tabs.Tab 
            value="expenses" 
            leftSection={<IconChartPie size={16} />}
          >
            Expenses
          </Tabs.Tab>
          <Tabs.Tab 
            value="monthly" 
            leftSection={<IconChartBar size={16} />}
          >
            Monthly Comparison
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="net-worth" pt="md">
          {/* Replace with ChartCard component */}
          <ChartCard 
            title="Net Worth Over Time"
            height={350}
            hasData={netWorthData.length > 0}
          >
            <AreaChart
              h={350}
              data={netWorthData}
              dataKey="date"
              series={[{ name: 'value', label: 'Net Worth', color: 'blue.6' }]}
              curveType="natural"
              gridAxis="xy"
              withLegend
              withTooltip
              tooltipProps={{
                content: ({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <ChartTooltip
                      label="Net Worth"
                      value={formatAmount(data.value)}
                      color="blue"
                      icon={<IconPigMoney size={16} />}
                      secondaryLabel="Date"
                      secondaryValue={data.date}
                    />
                  );
                },
              }}
            />
          </ChartCard>
        </Tabs.Panel>
        
        <Tabs.Panel value="income" pt="md">
          {/* Replace with CategoryDistribution component */}
          <CategoryDistribution
            title="Income by Category"
            totalValue={totalIncome}
            totalLabel="Income Summary"
            data={incomeByCategory}
            formatValue={formatAmount}
            chartHeight={350}
          />
        </Tabs.Panel>
        
        <Tabs.Panel value="expenses" pt="md">
          {/* Replace with CategoryDistribution component */}
          <CategoryDistribution
            title="Expenses by Category"
            totalValue={totalExpenses}
            totalLabel="Expenses Summary"
            data={expenseByCategory}
            formatValue={formatAmount}
            chartHeight={350}
          />
        </Tabs.Panel>
        
        <Tabs.Panel value="monthly" pt="md">
          {/* Replace with ChartCard component */}
          <ChartCard 
            title="Monthly Income vs. Expenses" 
            height={350}
            hasData={monthlyComparisonData.length > 0}
          >
            <BarChart
              h={350}
              data={monthlyComparisonData}
              dataKey="month"
              series={[
                { name: 'income', color: 'teal.6', label: 'Income' },
                { name: 'expense', color: 'red.6', label: 'Expenses' },
              ]}
              withLegend
              withTooltip
              tooltipProps={{
                content: ({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <ChartTooltip
                      label={data.month}
                      value={formatAmount(data.income - data.expense)}
                      color={data.income - data.expense >= 0 ? 'teal' : 'red'}
                      icon={data.income - data.expense >= 0 ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
                      secondaryLabel="Details"
                      secondaryValue={`Income: ${formatAmount(data.income)} | Expenses: ${formatAmount(data.expense)}`}
                    />
                  );
                },
              }}
            />
          </ChartCard>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}