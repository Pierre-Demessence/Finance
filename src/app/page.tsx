"use client";
import { useState } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  Grid,
  SimpleGrid,
  Stack,
  ThemeIcon,
  RingProgress,
  Paper,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconWallet, 
  IconCoin,
  IconCash,
  IconChartPie,
  IconChartBar,
  IconPlus,
  IconChartLine
} from '@tabler/icons-react';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import Link from 'next/link';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency, useNetWorth, useTransactionAnalysis } from '@/hooks/useFinanceUtils';
import dayjs from 'dayjs';
import AccountForm from '@/components/AccountForm';
import TransactionForm from '@/components/TransactionForm';
import ChartTooltip from '@/components/ChartTooltip';
// Import new UI components
import DataCard from '@/components/ui/DataCard';
import ChartCard from '@/components/ui/ChartCard';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { dateHelpers } from '@/utils/financeUtils';

export default function Dashboard() {
  const { accounts, transactions, assets, transactionCategories } = useFinanceStore();
  const { formatAmount, toBaseCurrency } = useCurrency();
  const { calculateNetWorth, getNetWorthHistory, calculateAccountBalance } = useNetWorth();
  const { 
    calculateTotalIncome, 
    calculateTotalExpenses, 
    getTransactionsByCategory 
  } = useTransactionAnalysis();
  
  // Modal states
  const [accountModalOpened, { open: openAccountModal, close: closeAccountModal }] = useDisclosure(false);
  const [transactionModalOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);

  // Define period for reports
  const startDate = dayjs().subtract(30, 'day').toDate();
  const endDate = new Date();
  
  // Calculate key financial metrics
  const netWorth = calculateNetWorth();
  const totalIncome = calculateTotalIncome(startDate, endDate);
  const totalExpenses = calculateTotalExpenses(startDate, endDate);
  const netCashflow = totalIncome - totalExpenses;
  
  // Prepare net worth history data for chart
  const netWorthData = getNetWorthHistory(
    dayjs().subtract(6, 'month').toDate(),
    new Date(),
    'month'
  ).map(point => ({
    date: dayjs(point.date).format('MMM YYYY'),
    value: point.netWorth
  }));
  
  // Prepare expense data for donut chart
  const expenseData = Object.entries(
    getTransactionsByCategory(startDate, endDate, 'expense')
  ).map(([categoryId, amount], index) => {
    const category = transactionCategories.find(c => c.id === categoryId);
    const colors = ['red', 'pink', 'grape', 'violet', 'indigo', 'blue'];
    return {
      name: category?.name || 'Unknown',
      value: amount,
      color: colors[index % colors.length]
    };
  }).sort((a, b) => b.value - a.value);
  
  // Count active accounts and assets
  const activeAccountsCount = accounts.filter(acc => !acc.isArchived).length;
  const assetsCount = assets.length;
  const recentTransactionsCount = transactions.filter(
    t => t.date >= startDate && t.date <= endDate
  ).length;

  // Handle form submission
  const handleFormSubmit = () => {
    closeAccountModal();
    closeTransactionModal();
  };
  
  // Calculate total account balances
  const totalAccountsBalance = accounts.reduce((total, acc) => {
    if (acc.isArchived) return total;
    const balance = calculateAccountBalance(acc.id);
    return total + toBaseCurrency(balance, acc.currency);
  }, 0);
  
  // Calculate total assets value
  const totalAssetsValue = assets.reduce((total, asset) => {
    const account = accounts.find(acc => acc.id === asset.accountId);
    if (!account) return total;
    const value = asset.quantity * asset.currentPrice;
    return total + toBaseCurrency(value, account.currency);
  }, 0);
  
  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Financial Dashboard</Title>
        <Group>
          <Button 
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={openAccountModal}
          >
            New Account
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={openTransactionModal}
          >
            New Transaction
          </Button>
        </Group>
      </Group>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        <DataCard
          title="Net Worth"
          value={formatAmount(netWorth)}
          subtitle="All accounts and assets"
          icon={<IconCash size={20} />}
          color="blue"
        />
        
        <DataCard
          title="Cash Flow (30d)"
          value={`${netCashflow >= 0 ? '+' : ''}${formatAmount(netCashflow)}`}
          subtitle={`+${formatAmount(totalIncome)} / -${formatAmount(totalExpenses)}`}
          icon={netCashflow >= 0 ? <IconArrowUpRight size={20} /> : <IconArrowDownRight size={20} />}
          color={netCashflow >= 0 ? 'teal' : 'red'}
          valueColor={netCashflow >= 0 ? 'teal' : 'red'}
        />
        
        <DataCard
          title="Accounts"
          value={formatAmount(totalAccountsBalance)}
          subtitle="Total Balance"
          icon={<IconWallet size={20} />}
          color="blue"
          badgeValue={activeAccountsCount}
          onClick={accounts.length > 0 ? undefined : openAccountModal}
          asLink={accounts.length > 0}
          href="/accounts"
        />
        
        <DataCard
          title="Assets"
          value={formatAmount(totalAssetsValue)}
          subtitle="Total Value"
          icon={<IconCoin size={20} />}
          color="violet"
          badgeValue={assetsCount}
          asLink
          href="/assets"
        />
      </SimpleGrid>
      
      <Grid mb="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <ChartCard 
            title="Net Worth Over Time"
            height={300}
            hasData={netWorthData.length > 0}
          >
            <AreaChart
              h={300}
              data={netWorthData}
              dataKey="date"
              series={[{ name: 'value', color: 'blue.6' }]}
              curveType="natural"
              withLegend={false}
              tooltipProps={{
                content: ({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  const prevValue = netWorthData[netWorthData.findIndex(d => d.date === data.date) - 1]?.value;
                  const change = prevValue ? ((data.value - prevValue) / prevValue) * 100 : 0;
                  return (
                    <ChartTooltip
                      label="Net Worth"
                      value={formatAmount(data.value)}
                      icon={<IconChartLine size={16} />}
                      color="blue.6"
                      secondaryLabel="Date"
                      secondaryValue={`${data.date} ${change ? `(${change >= 0 ? '+' : ''}${change.toFixed(1)}%)` : ''}`}
                    />
                  );
                },
              }}
            />
          </ChartCard>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard
            title="Expenses by Category"
            height={300} 
            hasData={expenseData.length > 0}
            emptyMessage="No expense data for the selected period"
          >
            <DonutChart
              data={expenseData}
              withLabels
              size={200}
              thickness={20}
              tooltipProps={{
                content: ({ payload }) => {
                  if (!payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <ChartTooltip
                      label={item.name}
                      value={formatAmount(item.value)}
                      color={item.color}
                      icon={<IconChartPie size={16} />}
                      secondaryLabel="Percentage"
                      secondaryValue={`${((item.value / totalExpenses) * 100).toFixed(1)}% of expenses`}
                    />
                  );
                },
              }}
              style={{ margin: '0 auto' }}
            />
          </ChartCard>
        </Grid.Col>
      </Grid>
      
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Text fw={500}>Recent Transactions</Text>
            <Button 
              component={Link} 
              href="/transactions" 
              size="xs" 
              variant="light"
            >
              View All
            </Button>
          </Group>
          
          {transactions.length > 0 ? (
            <Stack gap="xs">
              {transactions
                .filter(t => dayjs(t.date).isAfter(startDate) || dayjs(t.date).isSame(startDate))
                .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
                .slice(0, 5)
                .map(transaction => {
                  const category = transactionCategories.find(c => c.id === transaction.categoryId);
                  return (
                    <Paper key={transaction.id} withBorder p="xs">
                      <Group justify="space-between">
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {category?.name || 'Uncategorized'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dateHelpers.formatDate(
                              transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
                            )}
                          </Text>
                        </Stack>
                        <Text 
                          fw={500}
                          c={transaction.type === 'expense' ? 'red' : 
                             transaction.type === 'income' ? 'teal' : 'blue'}
                        >
                          {transaction.type === 'expense' ? '-' : 
                           transaction.type === 'income' ? '+' : ''}
                          {formatAmount(transaction.amount)}
                        </Text>
                      </Group>
                    </Paper>
                  );
                })}
            </Stack>
          ) : (
            <EmptyStateCard
              icon={<IconChartBar size={24} />}
              title="No transactions yet"
              description="Add transactions to track your income and expenses"
              actionLabel="Add Transaction"
              onAction={openTransactionModal}
              actionVariant="light"
            />
          )}
        </Card>
        
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Text fw={500}>Quick Actions</Text>
          </Group>
          
          <SimpleGrid cols={{ base: 2 }} spacing="md">
            <Button 
              leftSection={<IconPlus size={16} />}
              fullWidth
              variant="light"
              onClick={openTransactionModal}
            >
              Add Transaction
            </Button>
            <Button 
              leftSection={<IconPlus size={16} />}
              fullWidth
              variant="light"
              color="blue"
              onClick={openAccountModal}
            >
              New Account
            </Button>
            <Button 
              component={Link}
              href="/assets"
              leftSection={<IconPlus size={16} />}
              fullWidth
              variant="light"
              color="violet"
            >
              Track Asset
            </Button>
            <Button 
              component={Link}
              href="/reports"
              leftSection={<IconChartPie size={16} />}
              fullWidth
              variant="light"
              color="teal"
            >
              View Reports
            </Button>
          </SimpleGrid>
          
          <Card withBorder radius="md" p="md" mt="lg" bg="rgba(0,0,0,0.03)">
            <Text size="sm" fw={500}>Financial Health</Text>
            <Text size="xs" c="dimmed" mb="md">30-day overview</Text>
            
            <Group gap="xs">
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[
                  { value: Math.min((totalIncome > 0 ? totalExpenses / totalIncome * 100 : 0), 100), color: 'red' },
                ]}
                label={
                  <Text ta="center" size="xs" fw={500}>
                    {totalIncome > 0 
                      ? Math.round(totalExpenses / totalIncome * 100) 
                      : 0}%
                  </Text>
                }
              />
              <Stack gap={0}>
                <Text size="sm">Expenses to Income Ratio</Text>
                <Text size="xs" c="dimmed">
                  {totalExpenses <= totalIncome * 0.8 
                    ? 'Good! Your expenses are under control.' 
                    : 'Warning: Your expenses are high relative to income.'}
                </Text>
              </Stack>
            </Group>
          </Card>
        </Card>
      </SimpleGrid>

      {/* Account Form Modal */}
      <ModalWrapper 
        opened={accountModalOpened} 
        onClose={closeAccountModal} 
        title="New Account"
        size="lg"
      >
        <AccountForm
          onSubmit={handleFormSubmit}
          onCancel={closeAccountModal}
        />
      </ModalWrapper>
      
      {/* Transaction Form Modal */}
      <ModalWrapper 
        opened={transactionModalOpened} 
        onClose={closeTransactionModal} 
        title="New Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleFormSubmit}
          onCancel={closeTransactionModal}
        />
      </ModalWrapper>
    </Container>
  );
}