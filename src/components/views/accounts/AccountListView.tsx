import {
  Text,
  Group,
  ThemeIcon,
  Badge,
  Title,
  Table,
  Anchor,
} from '@mantine/core';
import {
  IconPlus,
  IconWallet,
  IconEdit,
  IconArchive,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconExternalLink,
} from '@tabler/icons-react';
import { Account } from '@/models';
import { getIconByName } from '@/utils/iconUtils';
import ActionMenu from '@/components/ui/ActionMenu';
import ListView from '@/components/ui/ListView';

interface AccountListViewProps {
  accounts: Account[];
  accountCategories: any[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onArchive: (account: Account) => void;
  onUnarchive: (account: Account) => void;
  onNewTransaction: (account: Account) => void;
  onNavigate?: (account: Account) => void;
  calculateAccountBalance: (accountId: string) => number;
  formatAmount: (amount: number, currency?: string) => string;
  getAccountCategoryColor: (index: number) => string;
}

/**
 * Displays accounts in a tabular list view
 */
export default function AccountListView({
  accounts,
  accountCategories,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onNewTransaction,
  onNavigate,
  calculateAccountBalance,
  formatAmount,
  getAccountCategoryColor
}: AccountListViewProps) {
  const activeAccounts = accounts.filter(acc => !acc.isArchived);
  const archivedAccounts = accounts.filter(acc => acc.isArchived);
  
  const headers = [
    'Account',
    'Category',
    'Currency',
    'Balance',
    'Actions'
  ];

  return (
    <>
      <ListView headers={headers}>
        {activeAccounts.map((account, index) => {
          const category = accountCategories.find(cat => cat.id === account.categoryId);
          const balance = calculateAccountBalance(account.id);
          const menuItems = [
            {
              icon: <IconExternalLink size={14} />,
              label: 'View Details',
              onClick: () => onNavigate && onNavigate(account),
            },
            {
              icon: <IconPlus size={14} />,
              label: 'New Transaction',
              onClick: () => onNewTransaction(account),
            },
            {
              icon: <IconEdit size={14} />,
              label: 'Edit Account',
              onClick: () => onEdit(account),
            },
            {
              icon: <IconArchive size={14} />,
              label: 'Archive Account',
              onClick: () => onArchive(account),
            },
            {
              icon: <IconTrash size={14} />,
              label: 'Delete Account',
              color: 'red',
              onClick: () => onDelete(account),
            },
          ];

          return (
            <Table.Tr key={account.id}>
              <Table.Td>
                <Group gap="xs">
                  <ThemeIcon size="sm" color={getAccountCategoryColor(index)} variant="light">
                    {category?.icon ? getIconByName(category.icon) : <IconWallet size={16} />}
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{account.name}</Text>
                    {account.description && (
                      <Text size="xs" c="dimmed">{account.description}</Text>
                    )}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>{category?.name || 'Uncategorized'}</Table.Td>
              <Table.Td>{account.currency}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {balance >= 0 ? 
                    <IconArrowUp size={14} color="teal" /> : 
                    <IconArrowDown size={14} color="red" />
                  }
                  <Text c={balance >= 0 ? 'teal' : 'red'} fw={500}>
                    {formatAmount(balance, account.currency)}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <ActionMenu items={menuItems} />
              </Table.Td>
            </Table.Tr>
          );
        })}
      </ListView>

      {archivedAccounts.length > 0 && (
        <>
          <Title order={3} mt="xl" mb="md">Archived Accounts</Title>
          <ListView headers={headers}>
            {archivedAccounts.map((account, index) => {
              const category = accountCategories.find(cat => cat.id === account.categoryId);
              const balance = calculateAccountBalance(account.id);
              const menuItems = [
                {
                  icon: <IconExternalLink size={14} />,
                  label: 'View Details',
                  onClick: () => onNavigate && onNavigate(account),
                },
                {
                  icon: <IconArchive size={14} />,
                  label: 'Unarchive Account',
                  onClick: () => onUnarchive(account),
                },
                {
                  icon: <IconTrash size={14} />,
                  label: 'Delete Account',
                  color: 'red',
                  onClick: () => onDelete(account),
                },
              ];

              return (
                <Table.Tr key={account.id} style={{ opacity: 0.7 }}>
                  <Table.Td>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color={getAccountCategoryColor(index)} variant="light">
                        {category?.icon ? getIconByName(category.icon) : <IconWallet size={16} />}
                      </ThemeIcon>
                      <div>
                        <Group gap="xs">
                          <Text fw={500}>{account.name}</Text>
                          <Badge size="xs" color="gray">Archived</Badge>
                        </Group>
                        {account.description && (
                          <Text size="xs" c="dimmed">{account.description}</Text>
                        )}
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>{category?.name || 'Uncategorized'}</Table.Td>
                  <Table.Td>{account.currency}</Table.Td>
                  <Table.Td>
                    <Text c={balance >= 0 ? 'teal' : 'red'} fw={500}>
                      {formatAmount(balance, account.currency)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionMenu items={menuItems} />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </ListView>
        </>
      )}
    </>
  );
}