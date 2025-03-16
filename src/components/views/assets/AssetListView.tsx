import {
  Text,
  Group,
  ThemeIcon,
  Table,
} from '@mantine/core';
import { 
  IconRefresh, 
  IconEdit, 
  IconTrash 
} from '@tabler/icons-react';
import { Asset, AssetType } from '@/models';
import { ASSET_TYPES } from '@/config/constants';
import ActionMenu from '@/components/ui/ActionMenu';
import ListView from '@/components/ui/ListView';
import { formatPercentage } from '@/utils/financeUtils';

interface AssetListViewProps {
  assets: Asset[];
  accounts: any[];
  customAssetTypes: any[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  getAssetTypeColor: (type: AssetType | string) => string;
  getAssetTypeIcon: (type: AssetType | string, customTypeId?: string) => JSX.Element;
  formatAmount: (amount: number, currency?: string) => string;
}

/**
 * Displays assets in a tabular list view
 */
export default function AssetListView({ 
  assets, 
  accounts, 
  customAssetTypes, 
  onEdit, 
  onDelete, 
  getAssetTypeColor, 
  getAssetTypeIcon, 
  formatAmount 
}: AssetListViewProps) {
  const headers = [
    'Asset',
    'Type',
    'Account',
    'Quantity',
    'Price',
    'Total Value',
    'Profit/Loss',
    'Actions'
  ];

  return (
    <ListView headers={headers}>
      {assets.map(asset => {
        const account = accounts.find(a => a.id === asset.accountId);
        if (!account) return null;

        const currentValue = asset.quantity * asset.currentPrice;
        const acquisitionValue = asset.acquisitionPrice
          ? asset.quantity * asset.acquisitionPrice
          : undefined;

        // Calculate profit/loss if acquisition price is available
        const profitLoss = acquisitionValue
          ? currentValue - acquisitionValue
          : undefined;

        const profitLossPercentage = acquisitionValue && acquisitionValue > 0
          ? ((currentValue - acquisitionValue) / acquisitionValue) * 100
          : undefined;

        // Get custom asset type if applicable
        let assetTypeColor = getAssetTypeColor(asset.type);
        let assetTypeIcon = getAssetTypeIcon(asset.type, asset.customTypeId);
        let assetTypeName = ASSET_TYPES[asset.type as keyof typeof ASSET_TYPES]?.name || 'Other';

        if (asset.type === AssetType.CUSTOM && asset.customTypeId) {
          const customType = customAssetTypes.find(t => t.id === asset.customTypeId);
          if (customType) {
            assetTypeName = customType.name;
            if (customType.color) {
              assetTypeColor = customType.color;
            }
          }
        }

        // Action menu items
        const actionMenuItems = [
          {
            icon: <IconRefresh size={14} />,
            label: 'Update Price',
            onClick: () => {
              // In a real app, this would fetch the current value from an API
              alert('In a real app, this would fetch current prices from an API');
            }
          },
          {
            icon: <IconEdit size={14} />,
            label: 'Edit',
            onClick: () => onEdit(asset)
          },
          {
            icon: <IconTrash size={14} />,
            label: 'Delete',
            color: 'red',
            onClick: () => onDelete(asset.id)
          }
        ];

        return (
          <Table.Tr key={asset.id}>
            <Table.Td>
              <Group gap="xs">
                <ThemeIcon size="sm" color={assetTypeColor} variant="light">
                  {assetTypeIcon}
                </ThemeIcon>
                <div>
                  <Text fw={500}>{asset.name}</Text>
                  {asset.description && (
                    <Text size="xs" c="dimmed">{asset.description}</Text>
                  )}
                </div>
              </Group>
            </Table.Td>
            <Table.Td>{assetTypeName}</Table.Td>
            <Table.Td>{account.name}</Table.Td>
            <Table.Td>{asset.quantity}</Table.Td>
            <Table.Td>{formatAmount(asset.currentPrice, account.currency)}</Table.Td>
            <Table.Td>
              <Text fw={700}>{formatAmount(currentValue, account.currency)}</Text>
            </Table.Td>
            <Table.Td>
              {profitLoss !== undefined ? (
                <Text fw={500} c={profitLoss >= 0 ? 'green' : 'red'}>
                  {profitLoss >= 0 ? '+' : ''}
                  {formatAmount(profitLoss, account.currency)}
                  {profitLossPercentage !== undefined && (
                    <Text span size="xs" ml={4}>
                      ({profitLossPercentage >= 0 ? '+' : ''}
                      {formatPercentage(profitLossPercentage)})
                    </Text>
                  )}
                </Text>
              ) : (
                '—'
              )}
            </Table.Td>
            <Table.Td>
              <ActionMenu items={actionMenuItems} />
            </Table.Td>
          </Table.Tr>
        );
      })}
    </ListView>
  );
}