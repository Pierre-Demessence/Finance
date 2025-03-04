"use client";

import { useState, useEffect } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  Table,
  ActionIcon,
  Menu,
  Badge,
  Modal,
  ThemeIcon,
  Stack,
  TextInput,
  Select,
  SimpleGrid,
  Pagination,
  SegmentedControl,
  Box,
  Flex,
  Chip,
  NativeSelect,
  Group as MantineGroup,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconEdit, 
  IconTrash, 
  IconDotsVertical, 
  IconPlus,
  IconSearch,
  IconCalendar,
  IconCategory,
  IconFilter,
  IconSortAscending,
  IconReceipt2,
  IconWallet,
} from '@tabler/icons-react';
import { useFinanceStore } from '@/store/financeStore';
import { useDisclosure } from '@mantine/hooks';
import { useCurrency } from '@/hooks/useFinanceUtils';
import { Transaction, TransactionType } from '@/models';
import TransactionForm from '@/components/TransactionForm';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

const TRANSACTIONS_PER_PAGE = 10;
const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" }
];

export default function TransactionsPage() {
  const { 
    transactions, 
    transactionCategories, 
    accounts,
    deleteTransaction 
  } = useFinanceStore();
  const { formatAmount } = useCurrency();
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Search and filtering
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(TRANSACTIONS_PER_PAGE);
  
  // Handle transaction edit
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    open();
  };
  
  // Handle transaction delete confirmation
  const handleDeleteConfirm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    openDeleteModal();
  };
  
  // Handle actual transaction deletion
  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;
    
    deleteTransaction(selectedTransaction.id);
    
    notifications.show({
      title: 'Transaction Deleted',
      message: `Transaction has been deleted successfully.`,
      color: 'green',
    });
    
    closeDeleteModal();
  };
  
  // Handle new transaction
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    open();
  };
  
  // Handle form submission (both edit and create)
  const handleFormSubmit = () => {
    close();
    notifications.show({
      title: selectedTransaction ? 'Transaction Updated' : 'Transaction Created',
      message: selectedTransaction
        ? `Transaction has been updated successfully.`
        : 'Your new transaction has been created successfully.',
      color: 'green',
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setDateRange([null, null]);
    setCategoryFilter(null);
    setAccountFilter(null);
    setTypeFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };
  
  // Filter and sort transactions based on search and filters
  const filteredTransactions = transactions
    .filter(transaction => {
      // Search filter (in description)
      if (search && transaction.description && 
          !transaction.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      const transactionDate = transaction.date instanceof Date ? 
        transaction.date : new Date(transaction.date);
      
      if (dateRange[0] && transactionDate < dateRange[0]) {
        return false;
      }
      if (dateRange[1] && transactionDate > dateRange[1]) {
        return false;
      }
      
      // Category filter
      if (categoryFilter && transaction.categoryId !== categoryFilter) {
        return false;
      }
      
      // Account filter
      if (accountFilter && 
          transaction.fromAccountId !== accountFilter && 
          transaction.toAccountId !== accountFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date or amount
      if (sortBy === 'date') {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return sortOrder === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      } else {
        return sortOrder === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
    });
  
  // Paginate transactions
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  
  // Reset pagination when filters change or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange, categoryFilter, accountFilter, typeFilter, sortBy, sortOrder, pageSize]);
  
  // Category filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...transactionCategories.map(cat => ({ value: cat.id, label: cat.name }))
  ];
  
  // Account filter options
  const accountOptions = [
    { value: '', label: 'All Accounts' },
    ...accounts.map(acc => ({ value: acc.id, label: acc.name }))
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'amount_desc', label: 'Amount (Highest First)' },
    { value: 'amount_asc', label: 'Amount (Lowest First)' },
  ];
  
  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Transactions</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddTransaction}
        >
          New Transaction
        </Button>
      </Group>
      
      <Card withBorder p="md" mb="md">
        <Stack>
          <Group>
            <TextInput
              placeholder="Search transactions..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Sort by"
              leftSection={<IconSortAscending size={16} />}
              data={sortOptions}
              value={`${sortBy}_${sortOrder}`}
              onChange={(value) => {
                if (!value) return;
                
                const [field, order] = value.split('_');
                setSortBy(field as 'date' | 'amount');
                setSortOrder(order as 'asc' | 'desc');
              }}
              w={200}
            />
          </Group>
          
          <Group align="flex-end">
            <DatePickerInput
              type="range"
              placeholder="Filter by date range"
              leftSection={<IconCalendar size={16} />}
              value={dateRange}
              onChange={setDateRange}
              w="auto"
              clearable
              flex={1}
            />
            
            <Select
              placeholder="Filter by category"
              leftSection={<IconCategory size={16} />}
              data={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              w="auto"
              flex={1}
              clearable
            />
            
            <Select
              placeholder="Filter by account"
              leftSection={<IconWallet size={16} />}
              data={accountOptions}
              value={accountFilter}
              onChange={setAccountFilter}
              w="auto"
              flex={1}
              clearable
            />
            
            <Button variant="light" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Group>
          
          <SegmentedControl
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as TransactionType | 'all')}
            data={[
              { label: 'All Types', value: 'all' },
              { label: 'Income', value: TransactionType.INCOME },
              { label: 'Expenses', value: TransactionType.EXPENSE },
              { label: 'Transfers', value: TransactionType.TRANSFER },
            ]}
          />
        </Stack>
      </Card>
      
      {transactions.length === 0 ? (
        <Card withBorder>
          <Stack align="center" py="xl">
            <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
              <IconReceipt2 size={30} />
            </ThemeIcon>
            <Text ta="center" fw={500}>No transactions yet</Text>
            <Text ta="center" c="dimmed" size="sm">
              Add your first transaction to start tracking your finances
            </Text>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleAddTransaction}
              variant="light"
              mt="md"
            >
              Add Transaction
            </Button>
          </Stack>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card withBorder>
          <Text ta="center" c="dimmed" py="lg">
            No transactions match your search criteria
          </Text>
        </Card>
      ) : (
        <>
          <Card withBorder mb="md">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Account(s)</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedTransactions.map(transaction => {
                  const category = transactionCategories.find(cat => cat.id === transaction.categoryId);
                  const fromAccount = transaction.fromAccountId ? accounts.find(acc => acc.id === transaction.fromAccountId) : null;
                  const toAccount = transaction.toAccountId ? accounts.find(acc => acc.id === transaction.toAccountId) : null;
                  
                  return (
                    <Table.Tr key={transaction.id}>
                      <Table.Td>
                        {dayjs(transaction.date).format('MMM D, YYYY')}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {category?.name || 'Uncategorized'}
                          <Badge 
                            color={
                              transaction.type === TransactionType.INCOME 
                                ? 'teal' 
                                : transaction.type === TransactionType.EXPENSE
                                ? 'red'
                                : 'blue'
                            }
                            size="xs"
                          >
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>{transaction.description || '-'}</Table.Td>
                      <Table.Td>
                        <Text 
                          c={
                            transaction.type === TransactionType.INCOME 
                              ? 'teal' 
                              : transaction.type === TransactionType.EXPENSE
                              ? 'red'
                              : undefined
                          }
                          fw={500}
                        >
                          {formatAmount(
                            transaction.amount, 
                            fromAccount?.currency || toAccount?.currency || undefined
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {transaction.type === TransactionType.TRANSFER ? (
                          <Text size="sm">
                            {fromAccount ? (
                              <Link href={`/accounts/${fromAccount.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                                {fromAccount.name}
                              </Link>
                            ) : 'Unknown'} → {
                            toAccount ? (
                              <Link href={`/accounts/${toAccount.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                                {toAccount.name}
                              </Link>
                            ) : 'Unknown'}
                          </Text>
                        ) : transaction.type === TransactionType.INCOME ? (
                          toAccount ? (
                            <Link href={`/accounts/${toAccount.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                              {toAccount.name}
                            </Link>
                          ) : 'External'
                        ) : (
                          fromAccount ? (
                            <Link href={`/accounts/${fromAccount.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                              {fromAccount.name}
                            </Link>
                          ) : 'External'
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <ActionIcon 
                            variant="light" 
                            color="blue" 
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <Menu position="bottom-end" withArrow withinPortal>
                            <Menu.Target>
                              <ActionIcon variant="subtle">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item 
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEditTransaction(transaction)}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => handleDeleteConfirm(transaction)}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            
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
          
          <SimpleGrid cols={{ base: 1, md: 3 }} mb="md">
            <Card withBorder p="md">
              <Text fw={500} size="sm" mb="xs" c="dimmed">Total Transactions</Text>
              <Text fw={700} size="xl">{filteredTransactions.length}</Text>
            </Card>
            <Card withBorder p="md">
              <Text fw={500} size="sm" mb="xs" c="dimmed">Total Income</Text>
              <Text fw={700} size="xl" c="teal">
                +{formatAmount(
                  filteredTransactions
                    .filter(t => t.type === TransactionType.INCOME)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text fw={500} size="sm" mb="xs" c="dimmed">Total Expenses</Text>
              <Text fw={700} size="xl" c="red">
                -{formatAmount(
                  filteredTransactions
                    .filter(t => t.type === TransactionType.EXPENSE)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </Text>
            </Card>
          </SimpleGrid>
        </>
      )}
      
      {/* Transaction Form Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={selectedTransaction ? 'Edit Transaction' : 'New Transaction'}
        size="lg"
      >
        <TransactionForm
          transaction={selectedTransaction || undefined}
          onSubmit={handleFormSubmit}
          onCancel={close}
          initialType={typeFilter !== 'all' ? typeFilter : undefined}
          initialAccountId={accountFilter || undefined}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal} 
        title="Delete Transaction"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteTransaction}>Delete</Button>
        </Group>
      </Modal>
    </Container>
  );
}