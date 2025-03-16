import {
  Card,
  Text,
  Group,
  ThemeIcon,
  Grid,
} from '@mantine/core';
import { 
  IconRefresh, 
  IconEdit, 
  IconTrash 
} from '@tabler/icons-react';
import { Asset, AssetType } from '@/models';
import { ASSET_TYPES } from '@/config/constants';
import ActionMenu from '@/components/ui/ActionMenu';
import GridView from '@/components/ui/GridView';
import { formatPercentage } from '@/utils/financeUtils';

interface AssetGridViewProps {
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
 * Displays assets in a grid of cards
 */
export default function AssetGridView({ 
  assets, 
  accounts, 
  customAssetTypes, 
  onEdit, 
  onDelete, 
  getAssetTypeColor, 
  getAssetTypeIcon, 
  formatAmount 
}: AssetGridViewProps) {
  return (
    <GridView>
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
          <Card key={asset.id} withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <Group>
                <ThemeIcon color={assetTypeColor} variant="light">
                  {assetTypeIcon}
                </ThemeIcon>
                <Text fw={500}>{asset?.name}</Text>
              </Group>
              <ActionMenu items={actionMenuItems} />
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              {asset.description || 'No description'} • {account.name}
            </Text>

            <Group grow mb="md">
              <div>
                <Text size="xs" c="dimmed">Quantity</Text>
                <Text fw={500}>{asset.quantity}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Current Price</Text>
                <Text fw={500}>{formatAmount(asset.currentPrice, account.currency)}</Text>
              </div>
            </Group>

            <Grid mb="md">
              <Grid.Col span={acquisitionValue ? 6 : 12}>
                <Text size="xs" c="dimmed">Total Value</Text>
                <Text fw={700}>{formatAmount(currentValue, account.currency)}</Text>
              </Grid.Col>

              {profitLoss !== undefined && (
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Profit/Loss</Text>
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
                </Grid.Col>
              )}
            </Grid>

            {asset.acquisitionDate && (
              <Text size="xs" c="dimmed">
                Acquired: {new Date(asset.acquisitionDate).toLocaleDateString()}
              </Text>
            )}

            {acquisitionValue !== undefined && (
              <Text size="xs" c="dimmed">
                Acquisition Value: {formatAmount(acquisitionValue, account.currency)}
              </Text>
            )}

            <Text size="xs" c="dimmed">
              Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
            </Text>
          </Card>
        );
      })}
    </GridView>
  );
}