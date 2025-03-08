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
  Badge,
  ThemeIcon,
  SegmentedControl,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus,
  IconCalendar,
  IconCategory,
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
import { getIconByName } from '@/utils/iconUtils';
// Import new UI components
import FilterBar from '@/components/ui/FilterBar';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import ActionMenu from '@/components/ui/ActionMenu';
import ModalWrapper from '@/components/ui/ModalWrapper';
import PaginationControl from '@/components/ui/PaginationControl';
import DataCard from '@/components/ui/DataCard';
import { getStatusColor } from '@/utils/financeUtils';

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
  
  // Calculate summary values
  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
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
      
      <FilterBar
        onSearch={setSearch}
        searchValue={search}
        sortOptions={sortOptions}
        sortValue={`${sortBy}_${sortOrder}`}
        onSort={(value) => {
          if (!value) return;
          const [field, order] = value.split('_');
          setSortBy(field as 'date' | 'amount');
          setSortOrder(order as 'asc' | 'desc');
        }}
        onReset={resetFilters}
      >
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
      </FilterBar>
      
      {transactions.length === 0 ? (
        <EmptyStateCard
          icon={<IconReceipt2 size={30} />}
          title="No transactions yet"
          description="Add your first transaction to start tracking your finances"
          actionLabel="Add Transaction"
          onAction={handleAddTransaction}
          actionVariant="light"
        />
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
                  <Table.Th>Type</Table.Th>
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
                  
                  // Action menu items
                  const menuItems = [
                    {
                      icon: <IconEdit size={14} />,
                      label: 'Edit',
                      onClick: () => handleEditTransaction(transaction)
                    },
                    {
                      icon: <IconTrash size={14} />,
                      label: 'Delete',
                      color: 'red',
                      onClick: () => handleDeleteConfirm(transaction)
                    }
                  ];
                  
                  return (
                    <Table.Tr key={transaction.id}>
                      <Table.Td>
                        {dayjs(transaction.date).format('MMM D, YYYY')}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ThemeIcon 
                            size="sm" 
                            variant="light" 
                            color={getStatusColor(transaction.type)}
                          >
                            {category?.icon ? 
                              getIconByName(category.icon) : 
                              transaction.type === TransactionType.INCOME ? 
                                getIconByName('plus') :
                                transaction.type === TransactionType.EXPENSE ?
                                  getIconByName('minus') :
                                  getIconByName('arrows-exchange')
                            }
                          </ThemeIcon>
                          {category?.name || 'Uncategorized'}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={getStatusColor(transaction.type)}
                          size="xs"
                        >
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{transaction.description || '-'}</Table.Td>
                      <Table.Td>
                        <Text 
                          c={getStatusColor(transaction.type)}
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
                          <ActionMenu items={menuItems} />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            
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
          
          <Group grow mb="md">
            <DataCard
              title="Total Transactions"
              value={filteredTransactions.length.toString()}
              icon={<IconReceipt2 size={20} />}
            />
            <DataCard
              title="Total Income"
              value={`+${formatAmount(totalIncome)}`}
              color="teal"
              valueColor="teal"
            />
            <DataCard
              title="Total Expenses"
              value={`-${formatAmount(totalExpenses)}`}
              color="red"
              valueColor="red"
            />
          </Group>
        </>
      )}
      
      {/* Use ModalWrapper component */}
      <ModalWrapper
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
      </ModalWrapper>
      
      {/* Delete Confirmation Modal */}
      <ModalWrapper
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Transaction"
        centered={true}
      >
        <Text mb="lg">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteTransaction}>Delete</Button>
        </Group>
      </ModalWrapper>
    </Container>
  );
}