"use client";

import {use, useEffect, useState } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  ActionIcon,
  Tabs,
  Badge,
  Menu,
  ThemeIcon,
  Stack,
  Modal,
  Pagination,
  Flex,
  NativeSelect,
  Loader,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconArrowRight,
  IconChartPie,
  IconCoin,
  IconHistory,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconDotsVertical,
} from '@tabler/icons-react';
import { LineChart } from '@mantine/charts';
import { useFinanceStore } from '@/store/financeStore';
import { useDisclosure } from '@mantine/hooks';
import { useCurrency, useNetWorth } from '@/hooks/useFinanceUtils';
import TransactionForm from '@/components/TransactionForm';
import AccountForm from '@/components/AccountForm';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { redirect } from 'next/navigation';
import { AccountCategory, Transaction } from '@/models';

const TRANSACTIONS_PER_PAGE = 10;
const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" }
];

export default function AccountDetailsPage({ params }: { params: { id: string } }) {
  // Might need to do differently as it shows problems in the code but works in the browser
  const { id : accountId } = use(params);
  
  const { accounts, transactions, accountCategories, transactionCategories, deleteAccount, archiveAccount, unarchiveAccount } = useFinanceStore();
  const { formatAmount } = useCurrency();
  const { calculateAccountBalance } = useNetWorth();
  
  // Find the account
  const account = accounts.find(a => a.id === accountId);
  
  // Loading state to handle hydration
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the transaction being edited
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [transactionModalOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);
  const [editTransactionModalOpened, { open: openEditTransactionModal, close: closeEditTransactionModal }] = useDisclosure(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(TRANSACTIONS_PER_PAGE);
  
  // Wait for hydration before redirecting
  useEffect(() => {
    // Give time for Zustand store to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect if account doesn't exist, but only after hydration
  useEffect(() => {
    if (!isLoading && accounts.length > 0 && !account) {
      redirect('/accounts');
    }
  }, [account, accounts.length, isLoading]);
  
  // Show loading state while hydrating
  if (isLoading) {
    return (
      <Container size="xl">
        <Stack h={200} justify="center" align="center">
          <Loader size="lg" />
          <Text>Loading account details...</Text>
        </Stack>
      </Container>
    );
  }
  
  // Return early when store is hydrated but account not found
  if (!account && accounts.length > 0) return null;
  
  // If we're still waiting for hydration or account is found, continue with rendering
  
  // Filter transactions related to this account
  const accountTransactions = transactions.filter(
    (t: Transaction) => t.fromAccountId === accountId || t.toAccountId === accountId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Paginate transactions
  const paginatedTransactions = accountTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(accountTransactions.length / pageSize);
  
  // Skip rendering if account is not yet available
  if (!account) return null;
  
  const balance = calculateAccountBalance(accountId);
  const category = accountCategories.find((c: AccountCategory) => c.id === account.categoryId);
  
  // Chart data for balance history
  const balanceHistory = accountTransactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
    .reduce((timeline: {date: string, balance: number}[], transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      const amount = transaction.fromAccountId === accountId ? -transaction.amount : transaction.amount;
      
      // Get the previous balance
      const prevBalance = timeline.length > 0 
        ? timeline[timeline.length - 1].balance 
        : (account.initialBalance || 0);
      
      // Add new balance point with accumulated balance
      timeline.push({ 
        date, 
        balance: prevBalance + amount 
      });
      
      return timeline;
    }, []);

  if (balanceHistory.length > 0) {
    // Ensure we start with initial balance point
    const firstDate = balanceHistory[0].date;
    if (account.initialBalance) {
      balanceHistory.unshift({
        date: new Date(new Date(firstDate).getTime() - 86400000).toISOString().split('T')[0], // day before first transaction
        balance: account.initialBalance
      });
    }
  }
    
  // Handle account edit
  const handleEditAccount = () => {
    open();
  };
  
  // Handle transaction edit
  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    openEditTransactionModal();
  };
  
  // Handle form submission (edit)
  const handleFormSubmit = () => {
    close();
    closeTransactionModal();
    closeEditTransactionModal();
    setCurrentTransaction(undefined);
    notifications.show({
      title: 'Success',
      message: currentTransaction ? 'Transaction updated successfully' : `"${account.name}" has been updated successfully.`,
      color: 'green',
    });
  };
  
  // Handle account archive
  const handleArchiveAccount = () => {
    archiveAccount(account.id);
    notifications.show({
      title: 'Account Archived',
      message: `"${account.name}" has been archived.`,
      color: 'blue',
    });
  };

  // Handle account unarchive
  const handleUnarchiveAccount = () => {
    unarchiveAccount(account.id);
    notifications.show({
      title: 'Account Unarchived',
      message: `"${account.name}" has been unarchived.`,
      color: 'blue',
    });
  };
  
  // Handle account delete confirmation
  const handleDeleteConfirm = () => {
    openDeleteModal();
  };
  
  // Handle actual account deletion
  const handleDeleteAccount = () => {
    const deleted = deleteAccount(account.id);
    if (deleted) {
      notifications.show({
        title: 'Account Deleted',
        message: `"${account.name}" has been deleted successfully.`,
        color: 'green',
      });
      redirect('/accounts');
    } else {
      notifications.show({
        title: 'Cannot Delete Account',
        message: 'This account has transactions or assets associated with it and cannot be deleted.',
        color: 'red',
      });
    }
    
    closeDeleteModal();
  };
  
  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <Button 
            variant="subtle" 
            component={Link} 
            href="/accounts"
            leftSection={<IconArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
          >
            Back to Accounts
          </Button>
          <Title order={2}>{account.name}</Title>
          {account.isArchived && (
            <Badge color="gray" size="lg">Archived</Badge>
          )}
        </Group>
        
        <Group>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={openTransactionModal}
          >
            New Transaction
          </Button>
          <Menu position="bottom-end" withArrow withinPortal>
            <Menu.Target>
              <ActionIcon variant="light" size="lg">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<IconEdit size={14} />}
                onClick={handleEditAccount}
              >
                Edit Account
              </Menu.Item>
              {!account.isArchived ? (
                <Menu.Item 
                  leftSection={<IconHistory size={14} />}
                  onClick={handleArchiveAccount}
                >
                  Archive Account
                </Menu.Item>
              ) : (
                <Menu.Item 
                  leftSection={<IconHistory size={14} />}
                  onClick={handleUnarchiveAccount}
                >
                  Unarchive Account
                </Menu.Item>
              )}
              <Menu.Item 
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={handleDeleteConfirm}
              >
                Delete Account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      
      <SimpleCard
        title="Account Details"
        data={[
          { label: 'Category', value: category?.name || 'Uncategorized' },
          { label: 'Currency', value: account.currency },
          { label: 'Current Balance', value: formatAmount(balance, account.currency) },
          { label: 'Description', value: account.description || 'None' },
        ]}
      />
      
      <Tabs defaultValue="transactions" mt="lg">
        <Tabs.List>
          <Tabs.Tab value="transactions" leftSection={<IconHistory size={16} />}>
            Transactions
          </Tabs.Tab>
          <Tabs.Tab value="balance" leftSection={<IconChartPie size={16} />}>
            Balance History
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="transactions" pt="md">
          {accountTransactions.length === 0 ? (
            <Card withBorder>
              <Stack align="center" py="xl">
                <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                  <IconCoin size={30} />
                </ThemeIcon>
                <Text ta="center" fw={500}>No transactions yet</Text>
                <Text ta="center" c="dimmed" size="sm">
                  This account doesn't have any transactions yet
                </Text>
                <Button 
                  leftSection={<IconPlus size={16} />}
                  onClick={openTransactionModal}
                  variant="light"
                  mt="md"
                >
                  Add Transaction
                </Button>
              </Stack>
            </Card>
          ) : (
            <Card withBorder p="md">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>From/To</th>
                    <th style={{ textAlign: 'left', padding: '8px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => {
                    const isExpense = transaction.fromAccountId === accountId;
                    const otherAccount = isExpense
                      ? accounts.find(a => a.id === transaction.toAccountId)
                      : accounts.find(a => a.id === transaction.fromAccountId);
                    const transactionCategory = transactionCategories.find(c => c.id === transaction.categoryId);
                    
                    return (
                      <tr key={transaction.id}>
                        <td style={{ padding: '8px 16px' }}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          {transaction.description}
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          {transactionCategory?.name || '-'}
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          <Group gap="xs" wrap="nowrap">
                            <Text 
                              c={isExpense ? 'red' : 'teal'}
                              fw={500}
                            >
                              {isExpense ? '-' : '+'}{formatAmount(transaction.amount, account.currency)}
                            </Text>
                            {isExpense ? (
                              <IconArrowDown size={14} stroke={1.5} color="red" />
                            ) : (
                              <IconArrowUp size={14} stroke={1.5} color="teal" />
                            )}
                          </Group>
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          {otherAccount ? (
                            <Link href={`/accounts/${otherAccount.id}`} style={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                              {otherAccount.name}
                            </Link>
                          ) : 'External'}
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          <ActionIcon 
                            variant="light" 
                            color="blue"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <Flex justify="center" mt="md" align="center" gap="md">
                  <Pagination 
                    value={currentPage} 
                    onChange={setCurrentPage}
                    total={totalPages} 
                  />
                  <NativeSelect
                    data={PAGE_SIZE_OPTIONS}
                    value={pageSize.toString()}
                    onChange={(event) => setPageSize(Number(event.currentTarget.value))}
                    style={{ width: '130px' }}
                  />
                </Flex>
              )}
            </Card>
          )}
        </Tabs.Panel>
        
        <Tabs.Panel value="balance" pt="md">
          <Card withBorder p="md">
            {balanceHistory.length < 2 ? (
              <Text ta="center" c="dimmed" py="lg">
                Not enough transaction history to show the balance chart
              </Text>
            ) : (
              <div>
                <Title order={4} mb="md">Balance History</Title>
                <Text c="dimmed" size="sm" mb="md">
                  Chart showing account balance over time
                </Text>
                <LineChart
                  h={300}
                  data={balanceHistory}
                  dataKey="date"
                  series={[{ name: 'balance', color: 'blue.6' }]}
                  curveType="natural"
                  withLegend={false}
                  gridAxis="xy"
                  valueFormatter={(value: number) => formatAmount(value, account.currency)}
                  yAxisProps={{
                    tickFormatter: (value: number) => formatAmount(value, account.currency),
                    width: 100
                  }}
                  p={20}
                />
              </div>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>
      
      {/* Account Form Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Edit Account"
        size="lg"
      >
        <AccountForm
          account={account}
          onSubmit={handleFormSubmit}
          onCancel={close}
        />
      </Modal>
      
      {/* New Transaction Form Modal */}
      <Modal 
        opened={transactionModalOpened} 
        onClose={closeTransactionModal} 
        title="New Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleFormSubmit}
          onCancel={closeTransactionModal}
          initialAccountId={accountId}
        />
      </Modal>
      
      {/* Edit Transaction Form Modal */}
      <Modal 
        opened={editTransactionModalOpened} 
        onClose={closeEditTransactionModal} 
        title="Edit Transaction"
        size="lg"
      >
        <TransactionForm
          transaction={currentTransaction}
          onSubmit={handleFormSubmit}
          onCancel={closeEditTransactionModal}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal} 
        title="Delete Account"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete the account "{account.name}"? 
          This action cannot be undone if the account has no associated transactions or assets.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteAccount}>Delete</Button>
        </Group>
      </Modal>
    </Container>
  );
}

// Helper component for displaying account details
function SimpleCard({ title, data }: { 
  title: string; 
  data: { label: string; value: string | React.ReactNode }[] 
}) {
  return (
    <Card withBorder>
      <Text fw={500} size="lg" mb="md">{title}</Text>
      <Stack gap="xs">
        {data.map((item, index) => (
          <Group key={index} justify="space-between">
            <Text c="dimmed" size="sm">{item.label}</Text>
            <Text fw={500}>{item.value}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
}