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
  Modal,
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
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text size="lg" fw={500} c="dimmed">Net Worth</Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconCash size={20} stroke={1.5} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl" mt="md">{formatAmount(netWorth)}</Text>
          <Text size="xs" c="dimmed" mt={4}>All accounts and assets</Text>
        </Card>
        
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text size="lg" fw={500} c="dimmed">Cash Flow (30d)</Text>
            <ThemeIcon 
              color={netCashflow >= 0 ? 'teal' : 'red'} 
              variant="light" 
              size="lg"
              radius="md"
            >
              {netCashflow >= 0 ? 
                <IconArrowUpRight size={20} stroke={1.5} /> : 
                <IconArrowDownRight size={20} stroke={1.5} />
              }
            </ThemeIcon>
          </Group>
          <Text 
            fw={700} 
            size="xl" 
            mt="md" 
            c={netCashflow >= 0 ? 'teal' : 'red'}
          >
            {netCashflow >= 0 ? '+' : ''}{formatAmount(netCashflow)}
          </Text>
          <Group mt={4} gap="xs">
            <Text size="xs" c="teal">+{formatAmount(totalIncome)}</Text>
            <Text size="xs">/</Text>
            <Text size="xs" c="red">-{formatAmount(totalExpenses)}</Text>
          </Group>
        </Card>
        
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text size="lg" fw={500} c="dimmed">Accounts</Text>
            <Group gap="xs">
              <Badge>{activeAccountsCount}</Badge>
              <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                <IconWallet size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
          </Group>
          <Link href="/accounts" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group mt="md" gap="xs">
              {accounts.length > 0 ? (
                <Stack gap={0}>
                  <Text fw={700} size="xl">
                    {formatAmount(accounts.reduce((total, acc) => {
                      if (acc.isArchived) return total;
                      const balance = calculateAccountBalance(acc.id);
                      return total + toBaseCurrency(balance, acc.currency);
                    }, 0))}
                  </Text>
                  <Text size="xs" c="dimmed">Total Balance</Text>
                </Stack>
              ) : (
                <Button 
                  size="xs"
                  leftSection={<IconPlus size={12} />}
                  onClick={openAccountModal}
                >
                  Add Your First Account
                </Button>
              )}
            </Group>
          </Link>
        </Card>
        
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text size="lg" fw={500} c="dimmed">Assets</Text>
            <Group gap="xs">
              <Badge>{assetsCount}</Badge>
              <ThemeIcon color="violet" variant="light" size="lg" radius="md">
                <IconCoin size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
          </Group>
          <Link href="/assets" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group mt="md" gap={8}>
              {assets.length > 0 ? (
                <Stack gap={4}>
                  <Text fw={700} size="xl">
                    {formatAmount(assets.reduce((total, asset) => {
                      const account = accounts.find(acc => acc.id === asset.accountId);
                      if (!account) return total;
                      const value = asset.quantity * asset.currentPrice;
                      return total + toBaseCurrency(value, account.currency);
                    }, 0))}
                  </Text>
                  <Text size="xs" c="dimmed">Total Value</Text>
                </Stack>
              ) : (
                <Button 
                  component={Link}
                  href="/assets"
                  size="xs"
                  leftSection={<IconPlus size={12} />}
                >
                  Add Your First Asset
                </Button>
              )}
            </Group>
          </Link>
        </Card>
      </SimpleGrid>
      
      <Grid mb="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="md">Net Worth Over Time</Text>
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
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Text fw={500} mb="md">Expenses by Category</Text>
            {expenseData.length > 0 ? (
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
            ) : (
              <Stack align="center" mt="xl">
                <ThemeIcon size="xl" color="gray" variant="light" radius="xl">
                  <IconChartPie size={24} />
                </ThemeIcon>
                <Text c="dimmed" mt="md" ta="center">
                  No expense data for the selected period
                </Text>
              </Stack>
            )}
          </Card>
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
                            {dayjs(transaction.date).format('MMM D, YYYY')}
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
            <Stack align="center" mt="xl" mb="xl">
              <ThemeIcon size="xl" color="gray" variant="light" radius="xl">
                <IconChartBar size={24} />
              </ThemeIcon>
              <Text c="dimmed" mt="md">No transactions yet</Text>
              <Button 
                mt="sm"
                size="xs"
                leftSection={<IconPlus size={12} />}
                onClick={openTransactionModal}
              >
                Add Transaction
              </Button>
            </Stack>
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
      <Modal 
        opened={accountModalOpened} 
        onClose={closeAccountModal} 
        title="New Account"
        size="lg"
      >
        <AccountForm
          onSubmit={handleFormSubmit}
          onCancel={closeAccountModal}
        />
      </Modal>
      
      {/* Transaction Form Modal */}
      <Modal 
        opened={transactionModalOpened} 
        onClose={closeTransactionModal} 
        title="New Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleFormSubmit}
          onCancel={closeTransactionModal}
        />
      </Modal>
    </Container>
  );
}