import {
  Card,
  Text,
  Group,
  ThemeIcon,
  Badge,
  Title,
} from '@mantine/core';
import {
  IconPlus,
  IconWallet,
  IconExternalLink,
} from '@tabler/icons-react';
import { Account } from '@/models';
import { getIconByName } from '@/utils/iconUtils';
import ActionMenu from '@/components/ui/ActionMenu';
import GridView from '@/components/ui/GridView';

interface AccountGridViewProps {
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
 * Displays accounts in a grid of cards
 */
export default function AccountGridView({
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
}: AccountGridViewProps) {
  const activeAccounts = accounts.filter(acc => !acc.isArchived);
  const archivedAccounts = accounts.filter(acc => acc.isArchived);

  return (
    <>
      <GridView>
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
              icon: getIconByName('edit'),
              label: 'Edit Account',
              onClick: () => onEdit(account),
            },
            {
              icon: getIconByName('archive'),
              label: 'Archive Account',
              onClick: () => onArchive(account),
            },
            {
              icon: getIconByName('trash'),
              label: 'Delete Account',
              color: 'red',
              onClick: () => onDelete(account),
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
      </GridView>

      {archivedAccounts.length > 0 && (
        <>
          <Title order={3} mt="xl" mb="md">Archived Accounts</Title>
          <GridView>
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
                  icon: getIconByName('archive'),
                  label: 'Unarchive Account',
                  onClick: () => onUnarchive(account),
                },
                {
                  icon: getIconByName('trash'),
                  label: 'Delete Account',
                  color: 'red',
                  onClick: () => onDelete(account),
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
          </GridView>
        </>
      )}
    </>
  );
}