"use client";

import { useState } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Text,
  SimpleGrid,
  Card,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconArrowRight,
  IconWallet,
} from '@tabler/icons-react';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency, useNetWorth } from '@/hooks/useFinanceUtils';
import { Account } from '@/models';
import { getIconByName } from '@/utils/iconUtils';
import { getAccountCategoryColor } from '@/utils/financeUtils';
import AccountForm from '@/components/AccountForm';
import TransactionForm from '@/components/TransactionForm';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import FilterBar from '@/components/ui/FilterBar';
import ActionMenu from '@/components/ui/ActionMenu';
import ModalWrapper from '@/components/ui/ModalWrapper';
import DataCard from '@/components/ui/DataCard';

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
  
  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSortBy('name');
    setSortOrder('asc');
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
  
  // Calculate totals
  const activeAccounts = filteredAccounts.filter(acc => !acc.isArchived);
  const archivedAccounts = filteredAccounts.filter(acc => acc.isArchived);
  
  const totalBalance = activeAccounts.reduce((sum, account) => {
    return sum + calculateAccountBalance(account.id);
  }, 0);
  
  const positiveBalance = activeAccounts.reduce((sum, account) => {
    const balance = calculateAccountBalance(account.id);
    return balance > 0 ? sum + balance : sum;
  }, 0);
  
  const negativeBalance = activeAccounts.reduce((sum, account) => {
    const balance = calculateAccountBalance(account.id);
    return balance < 0 ? sum + Math.abs(balance) : sum;
  }, 0);
  
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
          Add Account
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
        <DataCard
          title="Total Balance"
          value={formatAmount(totalBalance)}
          icon={<IconWallet size={20} />}
          color="blue"
          badgeValue={activeAccounts.length}
        />
        <DataCard
          title="Positive Balance"
          value={formatAmount(positiveBalance)}
          color="teal"
          valueColor="teal"
        />
        <DataCard
          title="Negative Balance"
          value={formatAmount(negativeBalance)}
          color="red"
          valueColor="red"
        />
      </SimpleGrid>

      <FilterBar
        onSearch={setSearch}
        searchValue={search}
        sortOptions={sortOptions}
        sortValue={`${sortBy}_${sortOrder}`}
        onSort={(value) => {
          if (!value) return;
          const [field, order] = value.split('_');
          setSortBy(field as 'name' | 'balance');
          setSortOrder(order as 'asc' | 'desc');
        }}
        filterOptions={[{
          label: 'Filter by category',
          options: categoryOptions,
          value: categoryFilter,
          onChange: setCategoryFilter,
          icon: <IconWallet size={16} />
        }]}
        onReset={resetFilters}
      />

      {accounts.length === 0 ? (
        <EmptyStateCard
          icon={<IconWallet size={30} />}
          title="No accounts yet"
          description="Add your first account to start tracking your finances"
          actionLabel="Add Account"
          onAction={handleAddAccount}
        />
      ) : filteredAccounts.length === 0 ? (
        <EmptyStateCard
          icon={<IconWallet size={30} />}
          title="No matching accounts"
          description="Try adjusting your filters"
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {activeAccounts.map((account, index) => {
              const category = accountCategories.find(cat => cat.id === account.categoryId);
              const balance = calculateAccountBalance(account.id);
              const menuItems = [
                {
                  icon: <IconPlus size={14} />,
                  label: 'New Transaction',
                  onClick: () => handleNewTransaction(account),
                },
                {
                  icon: getIconByName('edit'),
                  label: 'Edit Account',
                  onClick: () => handleEditAccount(account),
                },
                {
                  icon: getIconByName('archive'),
                  label: 'Archive Account',
                  onClick: () => handleArchiveAccount(account),
                },
                {
                  icon: getIconByName('trash'),
                  label: 'Delete Account',
                  color: 'red',
                  onClick: () => handleDeleteConfirm(account),
                },
              ];

              return (
                <Card key={account.id} withBorder padding="lg" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <ThemeIcon color={getAccountCategoryColor(index)} variant="light">
                        {category?.icon ? getIconByName(category.icon) : <IconWallet size={16} />}
                      </ThemeIcon>
                      <Text fw={500}>{account.name}</Text>
                    </Group>
                    <ActionMenu items={menuItems} />
                  </Group>

                  <Text size="sm" c="dimmed" mb="md">
                    {category?.name || 'Uncategorized'} • {account.currency}
                  </Text>

                  <Text size="xl" fw={700} c={balance >= 0 ? 'teal' : 'red'}>
                    {formatAmount(balance, account.currency)}
                  </Text>

                  {account.description && (
                    <Text size="sm" c="dimmed" mt="sm">
                      {account.description}
                    </Text>
                  )}
                </Card>
              );
            })}
          </SimpleGrid>

          {archivedAccounts.length > 0 && (
            <>
              <Title order={3} mt="xl" mb="md">Archived Accounts</Title>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {archivedAccounts.map((account, index) => {
                  const category = accountCategories.find(cat => cat.id === account.categoryId);
                  const balance = calculateAccountBalance(account.id);
                  const menuItems = [
                    {
                      icon: getIconByName('archive'),
                      label: 'Unarchive Account',
                      onClick: () => handleUnarchiveAccount(account),
                    },
                    {
                      icon: getIconByName('trash'),
                      label: 'Delete Account',
                      color: 'red',
                      onClick: () => handleDeleteConfirm(account),
                    },
                  ];

                  return (
                    <Card key={account.id} withBorder padding="lg" radius="md" style={{ opacity: 0.7 }}>
                      <Group justify="space-between" mb="xs">
                        <Group>
                          <ThemeIcon color={getAccountCategoryColor(index)} variant="light">
                            {category?.icon ? getIconByName(category.icon) : <IconWallet size={16} />}
                          </ThemeIcon>
                          <Text fw={500}>{account.name}</Text>
                        </Group>
                        <Group gap={8}>
                          <Badge color="gray">Archived</Badge>
                          <ActionMenu items={menuItems} />
                        </Group>
                      </Group>

                      <Text size="sm" c="dimmed" mb="md">
                        {category?.name || 'Uncategorized'} • {account.currency}
                      </Text>

                      <Text size="xl" fw={700} c={balance >= 0 ? 'teal' : 'red'}>
                        {formatAmount(balance, account.currency)}
                      </Text>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </>
          )}
        </>
      )}

      <ModalWrapper
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
      </ModalWrapper>

      <ModalWrapper
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
      </ModalWrapper>

      <ModalWrapper
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Account"
        size="sm"
      >
        <Text mb="lg">
          Are you sure you want to delete this account? This cannot be undone, and all associated transactions will be lost.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={closeDeleteModal}>Cancel</Button>
          <Button color="red" onClick={handleDeleteAccount}>Delete</Button>
        </Group>
      </ModalWrapper>
    </Container>
  );
}