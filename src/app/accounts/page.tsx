"use client";

import { useState } from 'react';
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
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconDotsVertical, 
  IconPlus,
  IconArrowRight,
  IconSearch,
  IconWallet,
  IconChartLine,
  IconArrowUp,
  IconArrowDown,
  IconFilter,
  IconSortAscending,
} from '@tabler/icons-react';
import { useFinanceStore } from '@/store/financeStore';
import { useDisclosure } from '@mantine/hooks';
import { useCurrency, useNetWorth } from '@/hooks/useFinanceUtils';
import { Account } from '@/models';
import AccountForm from '@/components/AccountForm';
import TransactionForm from '@/components/TransactionForm';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';

export default function AccountsPage() {
  const { accounts, accountCategories, deleteAccount, archiveAccount, unarchiveAccount } = useFinanceStore();
  const { formatAmount } = useCurrency();
  const { calculateAccountBalance } = useNetWorth();
  
  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [transactionModalOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Search and filtering
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Handle account edit
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    open();
  };
  
  // Handle account delete confirmation
  const handleDeleteConfirm = (account: Account) => {
    setSelectedAccount(account);
    openDeleteModal();
  };
  
  // Handle actual account deletion
  const handleDeleteAccount = () => {
    if (!selectedAccount) return;
    
    const deleted = deleteAccount(selectedAccount.id);
    if (deleted) {
      notifications.show({
        title: 'Account Deleted',
        message: `"${selectedAccount.name}" has been deleted successfully.`,
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Cannot Delete Account',
        message: 'This account has transactions or assets associated with it and cannot be deleted.',
        color: 'red',
      });
    }
    
    closeDeleteModal();
  };
  
  // Handle account archive
  const handleArchiveAccount = (account: Account) => {
    archiveAccount(account.id);
    notifications.show({
      title: 'Account Archived',
      message: `"${account.name}" has been archived.`,
      color: 'blue',
    });
  };

  // Handle account unarchive
  const handleUnarchiveAccount = (account: Account) => {
    unarchiveAccount(account.id);
    notifications.show({
      title: 'Account Unarchived',
      message: `"${account.name}" has been unarchived.`,
      color: 'blue',
    });
  };
  
  // Handle new account
  const handleAddAccount = () => {
    setSelectedAccount(null);
    open();
  };
  
  // Handle new transaction for specific account
  const handleNewTransaction = (account: Account) => {
    setSelectedAccount(account);
    openTransactionModal();
  };
  
  // Handle form submission (both edit and create)
  const handleFormSubmit = () => {
    close();
    closeTransactionModal();
    notifications.show({
      title: selectedAccount ? 'Account Updated' : 'Account Created',
      message: selectedAccount
        ? `"${selectedAccount.name}" has been updated successfully.`
        : 'Your new account has been created successfully.',
      color: 'green',
    });
  };
  
  // Filter and sort accounts based on search and filters
  const filteredAccounts = accounts
    .filter(account => {
      // Search filter
      if (search && !account.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter && categoryFilter !== 'all') {
        return account.categoryId === categoryFilter;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by name or balance
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        const balanceA = calculateAccountBalance(a.id);
        const balanceB = calculateAccountBalance(b.id);
        return sortOrder === 'asc' ? balanceA - balanceB : balanceB - balanceA;
      }
    });
  
  // Category filter options
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...accountCategories.map(cat => ({ value: cat.id, label: cat.name }))
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'balance_asc', label: 'Balance (Low to High)' },
    { value: 'balance_desc', label: 'Balance (High to Low)' },
  ];
  
  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Accounts</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddAccount}
        >
          New Account
        </Button>
      </Group>
      
      <Card withBorder p="md" mb="md">
        <Group mb="md">
          <TextInput
            placeholder="Search accounts..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by category"
            leftSection={<IconFilter size={16} />}
            data={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            w={220}
          />
          <Select
            placeholder="Sort by"
            leftSection={<IconSortAscending size={16} />}
            data={sortOptions}
            value={`${sortBy}_${sortOrder}`}
            onChange={(value) => {
              if (!value) return;
              
              const [field, order] = value.split('_');
              setSortBy(field as 'name' | 'balance');
              setSortOrder(order as 'asc' | 'desc');
            }}
            w={200}
          />
        </Group>
        
        {accounts.length === 0 ? (
          <Card withBorder>
            <Stack align="center" py="xl">
              <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                <IconWallet size={30} />
              </ThemeIcon>
              <Text ta="center" fw={500}>No accounts yet</Text>
              <Text ta="center" c="dimmed" size="sm">
                Add your first account to start tracking your finances
              </Text>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={handleAddAccount}
                variant="light"
                mt="md"
              >
                Add Account
              </Button>
            </Stack>
          </Card>
        ) : filteredAccounts.length === 0 ? (
          <Text ta="center" c="dimmed" py="lg">
            No accounts match your search criteria
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Currency</Table.Th>
                <Table.Th>Balance</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAccounts.map(account => {
                const category = accountCategories.find(cat => cat.id === account.categoryId);
                const balance = calculateAccountBalance(account.id);
                
                return (
                  <Table.Tr key={account.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Text>{account.name}</Text>
                        {account.isArchived && (
                          <Badge color="gray">Archived</Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>{category?.name || 'Unknown'}</Table.Td>
                    <Table.Td>{account.currency}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Text 
                          c={balance > 0 ? 'teal' : balance < 0 ? 'red' : undefined}
                          fw={500}
                        >
                          {formatAmount(balance, account.currency)}
                        </Text>
                        {balance > 0 ? (
                          <IconArrowUp size={14} stroke={1.5} color="teal" />
                        ) : balance < 0 ? (
                          <IconArrowDown size={14} stroke={1.5} color="red" />
                        ) : null}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon 
                          variant="light" 
                          color="blue" 
                          component={Link}
                          href={`/accounts/${account.id}`}
                        >
                          <IconChartLine size={16} />
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
                              onClick={() => handleEditAccount(account)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconArrowRight size={14} />}
                              onClick={() => handleNewTransaction(account)}
                            >
                              New Transaction
                            </Menu.Item>
                            {!account.isArchived ? (
                              <Menu.Item 
                                leftSection={<IconWallet size={14} />}
                                onClick={() => handleArchiveAccount(account)}
                              >
                                Archive
                              </Menu.Item>
                            ) : (
                              <Menu.Item 
                                leftSection={<IconWallet size={14} />}
                                onClick={() => handleUnarchiveAccount(account)}
                              >
                                Unarchive
                              </Menu.Item>
                            )}
                            <Menu.Item 
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDeleteConfirm(account)}
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
        )}
      </Card>
      
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} mb="md">
        <Card withBorder p="md">
          <Text fw={500} size="sm" mb="xs" c="dimmed">Total Accounts</Text>
          <Text fw={700} size="xl">{accounts.length}</Text>
        </Card>
        <Card withBorder p="md">
          <Text fw={500} size="sm" mb="xs" c="dimmed">Active Accounts</Text>
          <Text fw={700} size="xl">{accounts.filter(a => !a.isArchived).length}</Text>
        </Card>
        <Card withBorder p="md">
          <Text fw={500} size="sm" mb="xs" c="dimmed">Total Balance</Text>
          <Text fw={700} size="xl">
            {formatAmount(
              accounts.reduce((sum, account) => {
                return sum + calculateAccountBalance(account.id);
              }, 0)
            )}
          </Text>
        </Card>
        <Card withBorder p="md">
          <Text fw={500} size="sm" mb="xs" c="dimmed">Categories</Text>
          <Text fw={700} size="xl">{accountCategories.length}</Text>
        </Card>
      </SimpleGrid>
      
      {/* Account Form Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={selectedAccount ? 'Edit Account' : 'New Account'}
        size="lg"
      >
        <AccountForm
          account={selectedAccount || undefined}
          onSubmit={handleFormSubmit}
          onCancel={close}
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
          initialAccountId={selectedAccount?.id}
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
          Are you sure you want to delete the account "{selectedAccount?.name}"? 
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