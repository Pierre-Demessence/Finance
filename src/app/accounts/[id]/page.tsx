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
  Table,
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
  IconCoinOff,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { LineChart } from '@mantine/charts';
import { useFinanceStore } from '@/store/financeStore';
import { useDisclosure } from '@mantine/hooks';
import { useCurrency, useNetWorth } from '@/hooks/useFinanceUtils';
import TransactionForm from '@/components/TransactionForm';
import AccountForm from '@/components/AccountForm';
import BalanceRecordForm from '@/components/BalanceRecordForm';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { redirect } from 'next/navigation';
import { AccountCategory, BalanceRecord, Transaction } from '@/models';
// Import UI components
import PaginationControl from '@/components/ui/PaginationControl';
import ActionMenu from '@/components/ui/ActionMenu';
import ModalWrapper from '@/components/ui/ModalWrapper';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import ChartCard from '@/components/ui/ChartCard';

const TRANSACTIONS_PER_PAGE = 10;
const RECORDS_PER_PAGE = 10;
const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" }
];

type Params = {
  id: string;
};

export default function AccountDetailsPage({ params }: { params: Params }) {
  const { id: accountId } = params;

  const { 
    accounts, 
    transactions, 
    balanceRecords,
    accountCategories, 
    transactionCategories, 
    deleteAccount, 
    archiveAccount, 
    unarchiveAccount,
    deleteBalanceRecord,
    getBalanceRecordsForAccount,
  } = useFinanceStore();
  const { formatAmount } = useCurrency();
  const { calculateAccountBalance } = useNetWorth();
  
  // Find the account
  const account = accounts.find(a => a.id === accountId);
  
  // Loading state to handle hydration
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the transaction being edited
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  
  // State for the balance record being edited
  const [currentBalanceRecord, setCurrentBalanceRecord] = useState<BalanceRecord | undefined>(undefined);
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [transactionModalOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);
  const [editTransactionModalOpened, { open: openEditTransactionModal, close: closeEditTransactionModal }] = useDisclosure(false);
  const [balanceRecordModalOpened, { open: openBalanceRecordModal, close: closeBalanceRecordModal }] = useDisclosure(false);
  const [editBalanceRecordModalOpened, { open: openEditBalanceRecordModal, close: closeEditBalanceRecordModal }] = useDisclosure(false);
  const [deleteBalanceRecordModalOpened, { open: openDeleteBalanceRecordModal, close: closeDeleteBalanceRecordModal }] = useDisclosure(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(TRANSACTIONS_PER_PAGE);
  
  // Balance records pagination
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsPageSize, setRecordsPageSize] = useState(RECORDS_PER_PAGE);
  
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
  
  // Get account balance records
  const accountBalanceRecords = getBalanceRecordsForAccount(accountId);
  
  // Paginate transactions
  const paginatedTransactions = accountTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Paginate balance records
  const paginatedBalanceRecords = accountBalanceRecords.slice(
    (recordsPage - 1) * recordsPageSize,
    recordsPage * recordsPageSize
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(accountTransactions.length / pageSize);
  const totalRecordsPages = Math.ceil(accountBalanceRecords.length / recordsPageSize);
  
  // Skip rendering if account is not yet available
  if (!account) return null;
  
  const balance = calculateAccountBalance(accountId);
  const category = accountCategories.find((c: AccountCategory) => c.id === account.categoryId);
  
  // Chart data for balance history
  // We need to incorporate balance records into the timeline
  const balanceHistory = (() => {
    // First create the timeline from transactions
    let timeline: { date: string; balance: number; isRecord?: boolean }[] = accountTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
      .reduce((acc: { date: string; balance: number; isRecord?: boolean }[], transaction) => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        const amount = transaction.fromAccountId === accountId ? -transaction.amount : transaction.amount;
        
        // Get the previous balance
        const prevBalance = acc.length > 0 
          ? acc[acc.length - 1].balance 
          : (account.initialBalance || 0);
        
        // Add new balance point with accumulated balance
        acc.push({ 
          date, 
          balance: prevBalance + amount 
        });
        
        return acc;
      }, []);
    
    // If there are no transactions but we have an initial balance, add a data point
    if (timeline.length === 0 && account.initialBalance) {
      const today = new Date().toISOString().split('T')[0];
      timeline.push({
        date: today,
        balance: account.initialBalance
      });
    }
    
    // Add initial balance point if we have transactions
    if (timeline.length > 0 && account.initialBalance !== undefined) {
      const firstDate = timeline[0].date;
      const dayBefore = new Date(new Date(firstDate).getTime() - 86400000).toISOString().split('T')[0];
      timeline.unshift({
        date: dayBefore,
        balance: account.initialBalance
      });
    }
    
    // Now incorporate balance records
    if (accountBalanceRecords.length > 0) {
      // Convert balance records to the same format as our timeline
      const balanceRecordPoints = accountBalanceRecords.map(record => ({
        date: new Date(record.date).toISOString().split('T')[0],
        balance: record.amount,
        isRecord: true
      }));
      
      // Merge both arrays and sort by date
      const mergedTimeline = [...timeline, ...balanceRecordPoints].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Process the timeline to apply balance records as reset points
      let finalTimeline: typeof timeline = [];
      let lastRecordIndex = -1;
      
      for (let i = 0; i < mergedTimeline.length; i++) {
        const point = mergedTimeline[i];
        
        if (point.isRecord) {
          // This is a balance record point, add it directly
          finalTimeline.push(point);
          lastRecordIndex = finalTimeline.length - 1;
        } else {
          // This is a transaction-based point
          if (lastRecordIndex >= 0 && i > 0) {
            // We have a previous record, calculate balance relative to that
            const lastRecord = finalTimeline[lastRecordIndex];
            const prevPoints = mergedTimeline.slice(lastRecordIndex + 1, i);
            
            // Calculate the cumulative amount change since the last record
            const change = prevPoints.reduce((sum, p) => {
              if (!p.isRecord) {
                // Find the transaction that corresponds to this point
                const txDate = new Date(p.date);
                const tx = accountTransactions.find(t => 
                  new Date(t.date).toISOString().split('T')[0] === p.date
                );
                if (tx) {
                  const txAmount = tx.fromAccountId === accountId ? -tx.amount : tx.amount;
                  return sum + txAmount;
                }
              }
              return sum;
            }, 0);
            
            // Add point with balance calculated from the last record
            finalTimeline.push({
              date: point.date,
              balance: lastRecord.balance + change,
            });
          } else {
            // No previous record, use the point as is
            finalTimeline.push(point);
          }
        }
      }
      
      return finalTimeline;
    }
    
    return timeline;
  })();
    
  // Handle account edit
  const handleEditAccount = () => {
    open();
  };
  
  // Handle transaction edit
  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    openEditTransactionModal();
  };
  
  // Handle balance record edit
  const handleEditBalanceRecord = (record: BalanceRecord) => {
    setCurrentBalanceRecord(record);
    openEditBalanceRecordModal();
  };
  
  // Handle balance record delete
  const handleDeleteBalanceRecord = (record: BalanceRecord) => {
    setCurrentBalanceRecord(record);
    openDeleteBalanceRecordModal();
  };
  
  // Handle balance record delete confirmation
  const handleConfirmDeleteBalanceRecord = () => {
    if (currentBalanceRecord) {
      deleteBalanceRecord(currentBalanceRecord.id);
      closeDeleteBalanceRecordModal();
      setCurrentBalanceRecord(undefined);
      notifications.show({
        title: 'Success',
        message: 'Balance record deleted successfully.',
        color: 'green',
      });
    }
  };
  
  // Handle form submission (edit)
  const handleFormSubmit = () => {
    close();
    closeTransactionModal();
    closeEditTransactionModal();
    closeBalanceRecordModal();
    closeEditBalanceRecordModal();
    setCurrentTransaction(undefined);
    setCurrentBalanceRecord(undefined);
    notifications.show({
      title: 'Success',
      message: currentTransaction 
        ? 'Transaction updated successfully' 
        : currentBalanceRecord 
          ? 'Balance record updated successfully'
          : `"${account.name}" has been updated successfully.`,
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
  
  // Action menu items
  const menuItems = [
    {
      icon: <IconEdit size={14} />,
      label: 'Edit Account',
      onClick: handleEditAccount
    },
    !account.isArchived ? {
      icon: <IconHistory size={14} />,
      label: 'Archive Account',
      onClick: handleArchiveAccount
    } : {
      icon: <IconHistory size={14} />,
      label: 'Unarchive Account',
      onClick: handleUnarchiveAccount
    },
    {
      icon: <IconTrash size={14} />,
      label: 'Delete Account',
      color: 'red',
      onClick: handleDeleteConfirm
    }
  ];
  
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
          <ActionMenu items={menuItems} />
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
          <Tabs.Tab value="records" leftSection={<IconFileSpreadsheet size={16} />}>
            Balance Records
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="transactions" pt="md">
          {accountTransactions.length === 0 ? (
            <EmptyStateCard
              icon={<IconCoin size={30} />}
              title="No transactions yet"
              description="This account doesn't have any transactions yet"
              actionLabel="Add Transaction"
              onAction={openTransactionModal}
              actionVariant="light"
            />
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
                            <Link href={`/accounts/${otherAccount.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
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
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </Card>
          )}
        </Tabs.Panel>
        
        <Tabs.Panel value="balance" pt="md">
          <ChartCard 
            title="Balance History" 
            description="Chart showing account balance over time"
            height={300}
            hasData={balanceHistory.length >= 2}
            emptyMessage="Not enough transaction history to show the balance chart"
          >
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
          </ChartCard>
          <Text c="dimmed" size="sm" mt="xs">
            * Balance history includes both transactions and manual balance records. When a balance record exists, it overrides the calculated balance.
          </Text>
        </Tabs.Panel>
        
        <Tabs.Panel value="records" pt="md">
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={500}>Balance Records</Text>
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={openBalanceRecordModal}
              variant="light"
            >
              Add Balance Record
            </Button>
          </Group>
          
          {accountBalanceRecords.length === 0 ? (
            <EmptyStateCard
              icon={<IconCoinOff size={30} />}
              title="No balance records yet"
              description="Add balance records to override transaction-based balance calculations"
              actionLabel="Add Balance Record"
              onAction={openBalanceRecordModal}
              actionVariant="light"
            />
          ) : (
            <Card withBorder p="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedBalanceRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>{new Date(record.date).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Text fw={500}>{formatAmount(record.amount, account.currency)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={record.isVerified ? 'green' : 'yellow'}>
                          {record.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{record.notes || '-'}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon 
                            variant="light" 
                            color="blue"
                            onClick={() => handleEditBalanceRecord(record)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            variant="light" 
                            color="red"
                            onClick={() => handleDeleteBalanceRecord(record)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              
              {totalRecordsPages > 1 && (
                <PaginationControl
                  currentPage={recordsPage}
                  totalPages={totalRecordsPages}
                  pageSize={recordsPageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={setRecordsPage}
                  onPageSizeChange={setRecordsPageSize}
                />
              )}
            </Card>
          )}
          
          <Card withBorder mt="md" p="md">
            <Text fw={500} size="md" mb="md">About Balance Records</Text>
            <Text size="sm">
              Balance records allow you to record specific account balances at certain dates. 
              These serve as reference points that override the calculated balance from transactions.
              This is useful for reconciling your actual bank statement with the transactions you've recorded.
            </Text>
            <Text size="sm" mt="sm" c="dimmed">
              When a balance record exists, the account balance at that date is set to the recorded amount,
              and all subsequent transactions are applied from that point forward.
            </Text>
          </Card>
        </Tabs.Panel>
      </Tabs>
      
      {/* Account Edit Modal */}
      <ModalWrapper
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
      </ModalWrapper>
      
      {/* New Transaction Modal */}
      <ModalWrapper
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
      </ModalWrapper>
      
      {/* Edit Transaction Modal */}
      <ModalWrapper
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
      </ModalWrapper>
      
      {/* New Balance Record Modal */}
      <ModalWrapper
        opened={balanceRecordModalOpened}
        onClose={closeBalanceRecordModal}
        title="Add Balance Record"
        size="lg"
      >
        <BalanceRecordForm
          accountId={accountId}
          onSubmit={handleFormSubmit}
          onCancel={closeBalanceRecordModal}
        />
      </ModalWrapper>
      
      {/* Edit Balance Record Modal */}
      <ModalWrapper
        opened={editBalanceRecordModalOpened}
        onClose={closeEditBalanceRecordModal}
        title="Edit Balance Record"
        size="lg"
      >
        <BalanceRecordForm
          record={currentBalanceRecord}
          accountId={accountId}
          onSubmit={handleFormSubmit}
          onCancel={closeEditBalanceRecordModal}
        />
      </ModalWrapper>
      
      {/* Delete Balance Record Modal */}
      <ModalWrapper
        opened={deleteBalanceRecordModalOpened}
        onClose={closeDeleteBalanceRecordModal}
        title="Delete Balance Record"
        centered={true}
      >
        <Text mb="lg">
          Are you sure you want to delete this balance record? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteBalanceRecordModal}>Cancel</Button>
          <Button color="red" onClick={handleConfirmDeleteBalanceRecord}>Delete</Button>
        </Group>
      </ModalWrapper>
      
      {/* Delete Account Modal */}
      <ModalWrapper
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Account"
        centered={true}
      >
        <Text mb="lg">
          Are you sure you want to delete the account "{account.name}"? 
          This action cannot be undone if the account has no associated transactions or assets.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteAccount}>Delete</Button>
        </Group>
      </ModalWrapper>
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