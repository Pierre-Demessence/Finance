"use client";

import { useState } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  SimpleGrid,
  Badge,
  Progress,
  ActionIcon,
  Menu,
  Modal,
  Tabs,
  NumberInput,
  Grid,
  ThemeIcon,
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconPlus, 
  IconDotsVertical, 
  IconEdit, 
  IconTrash,
  IconChartPie,
  IconChartLine,
  IconRefresh,
  IconCurrencyBitcoin,
  IconBuilding,
  IconCar,
  IconDeviceLaptop,
  IconCube,
} from '@tabler/icons-react';
import { DonutChart } from '@mantine/charts';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency } from '@/hooks/useFinanceUtils';
import { Asset, AssetType } from '@/models';
import { ASSET_TYPES } from '@/config/constants';
import AssetForm from '@/components/AssetForm';
import ChartTooltip from '@/components/ChartTooltip';

export default function AssetsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType | 'all'>('all');
  
  const { assets, accounts, deleteAsset } = useFinanceStore();
  const { formatAmount, toBaseCurrency } = useCurrency();
  
  // Filter assets based on active tab
  const filteredAssets = assets
    .map(asset => ({
      ...asset,
      createdAt: new Date(asset.createdAt),
      updatedAt: new Date(asset.updatedAt),
      lastUpdated: new Date(asset.lastUpdated),
      acquisitionDate: asset.acquisitionDate ? new Date(asset.acquisitionDate) : undefined
    }))
    .filter(asset => activeTab === 'all' || asset.type === activeTab);
  
  // Calculate total value across all assets, grouped by type
  const assetValues = assets.reduce((acc, asset) => {
    const account = accounts.find(a => a.id === asset.accountId);
    if (!account) return acc;
    
    const value = asset.quantity * asset.currentPrice;
    const valueInBaseCurrency = toBaseCurrency(value, account.currency);
    
    if (!acc[asset.type]) {
      acc[asset.type] = {
        count: 0,
        value: 0,
      };
    }
    
    acc[asset.type].count += 1;
    acc[asset.type].value += valueInBaseCurrency;
    acc.total += valueInBaseCurrency;
    
    return acc;
  }, { total: 0 } as Record<string, { count: number; value: number }> & { total: number });
  
  // Prepare data for the donut chart
  const donutData = Object.entries(assetValues)
    .filter(([key]) => key !== 'total')
    .map(([type, data]) => ({
      name: ASSET_TYPES[type as keyof typeof ASSET_TYPES]?.name || type,
      value: typeof data === 'number' ? data : data.value,
      color: getAssetTypeColor(type as AssetType),
    }));
  
  // Get color for asset type
  function getAssetTypeColor(type: AssetType): string {
    switch (type) {
      case AssetType.CRYPTOCURRENCY: return '#1E88E5'; // Blue
      case AssetType.STOCK: return '#43A047'; // Green
      case AssetType.REAL_ESTATE: return '#FB8C00'; // Orange
      case AssetType.VEHICLE: return '#E53935'; // Red
      case AssetType.ELECTRONICS: return '#8E24AA'; // Purple
      case AssetType.OTHER: return '#757575'; // Gray
      default: return '#757575';
    }
  }
  
  // Get icon for asset type
  function getAssetTypeIcon(type: AssetType) {
    switch (type) {
      case AssetType.CRYPTOCURRENCY: return <IconCurrencyBitcoin size={16} />;
      case AssetType.STOCK: return <IconChartLine size={16} />;
      case AssetType.REAL_ESTATE: return <IconBuilding size={16} />;
      case AssetType.VEHICLE: return <IconCar size={16} />;
      case AssetType.ELECTRONICS: return <IconDeviceLaptop size={16} />;
      case AssetType.OTHER: return <IconCube size={16} />;
      default: return <IconCube size={16} />;
    }
  }
  
  // Handler to edit asset
  const handleEditAsset = (asset: Asset) => {
    setEditAsset(asset);
    open();
  };
  
  // Reset form state on close
  const handleCloseModal = () => {
    setEditAsset(null);
    close();
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Assets</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Asset
        </Button>
      </Group>
      
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="lg">
              <Text fw={500}>Asset Distribution</Text>
              <Text fw={700}>{formatAmount(assetValues.total)}</Text>
            </Group>
            
            <DonutChart
              h={240}
              data={donutData}
              withLabels
              withTooltip
              tooltipProps={{
                content: ({ payload }) => {
                  if (!payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <ChartTooltip
                      label={item.name}
                      value={formatAmount(item.value)}
                      color={getAssetTypeColor(item.name as AssetType)}
                      icon={<IconChartPie size={16} />}
                      secondaryLabel="Percentage"
                      secondaryValue={`${((item.value / assetValues.total) * 100).toFixed(1)}%`}
                    />
                  );
                },
              }}
            />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} mb="md">Assets Summary</Text>
            <Stack gap="xs">
              {Object.entries(ASSET_TYPES).map(([type, info]) => {
                const assetType = type as AssetType;
                const value = assetValues[assetType]?.value || 0;
                const count = assetValues[assetType]?.count || 0;
                const percentage = assetValues.total ? (value / assetValues.total) * 100 : 0;
                
                return (
                  <div key={type}>
                    <Group justify="space-between" mb={5}>
                      <Group>
                        <ThemeIcon color={getAssetTypeColor(assetType)} variant="light" size="sm">
                          {getAssetTypeIcon(assetType)}
                        </ThemeIcon>
                        <Text size="sm">{info.name}</Text>
                      </Group>
                      <Text size="sm" fw={500}>
                        {formatAmount(value)} <Text span c="dimmed" size="xs">({count})</Text>
                      </Text>
                    </Group>
                    <Progress 
                      value={percentage} 
                      color={getAssetTypeColor(assetType)} 
                      size="sm" 
                      mb={2}
                    />
                    <Text size="xs" ta="right" c="dimmed">{percentage.toFixed(0)}%</Text>
                  </div>
                );
              })}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
      
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as AssetType | 'all')} mb="md">
        <Tabs.List>
          <Tabs.Tab value="all" leftSection={<IconChartPie size={16} />}>
            All Assets
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.CRYPTOCURRENCY} 
            leftSection={<IconCurrencyBitcoin size={16} />}
          >
            Cryptocurrency
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.STOCK} 
            leftSection={<IconChartLine size={16} />}
          >
            Stocks
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.REAL_ESTATE} 
            leftSection={<IconBuilding size={16} />}
          >
            Real Estate
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.OTHER} 
            leftSection={<IconCube size={16} />}
          >
            Other
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {filteredAssets.length === 0 ? (
        <Card withBorder padding="xl" radius="md" ta="center">
          <IconChartPie size={50} stroke={1.5} opacity={0.3} />
          <Text size="xl" fw={500} mt="md">No assets found</Text>
          <Text size="sm" c="dimmed" mt="sm">
            {activeTab === 'all' 
              ? "You haven't added any assets yet. Click 'Add Asset' to create your first asset."
              : `You don't have any ${ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]?.name.toLowerCase() || 'assets'} yet.`}
          </Text>
          <Button mt="xl" leftSection={<IconPlus size={16} />} onClick={open}>
            Add {activeTab === 'all' ? 'Asset' : (ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]?.name || 'Asset')}
          </Button>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filteredAssets.map(asset => {
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
            
            return (
              <Card key={asset.id} withBorder padding="lg" radius="md">
                <Group justify="space-between" mb="xs">
                  <Group>
                    <ThemeIcon color={getAssetTypeColor(asset.type)} variant="light">
                      {getAssetTypeIcon(asset.type)}
                    </ThemeIcon>
                    <Text fw={500}>{asset?.name}</Text>
                  </Group>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item 
                        leftSection={<IconRefresh size={14} />}
                        onClick={() => {
                          // In a real app, this would fetch the current value from an API
                          // For now this is just a placeholder
                          alert('In a real app, this would fetch current prices from an API');
                        }}
                      >
                        Update Price
                      </Menu.Item>
                      <Menu.Item 
                        leftSection={<IconEdit size={14} />}
                        onClick={() => handleEditAsset(asset)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item 
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => deleteAsset(asset.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
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
                
                <Group mb="xs">
                  <div>
                    <Text size="xs" c="dimmed">Total Value</Text>
                    <Text fw={700}>{formatAmount(currentValue, account.currency)}</Text>
                  </div>
                  
                  {profitLoss !== undefined && (
                    <div>
                      <Text size="xs" c="dimmed">Profit/Loss</Text>
                      <Text fw={500} c={profitLoss >= 0 ? 'green' : 'red'}>
                        {profitLoss >= 0 ? '+' : ''}
                        {formatAmount(profitLoss, account.currency)}
                        {profitLossPercentage !== undefined && (
                          <Text span size="xs" ml={4}>
                            ({profitLossPercentage >= 0 ? '+' : ''}
                            {profitLossPercentage.toFixed(2)}%)
                          </Text>
                        )}
                      </Text>
                    </div>
                  )}
                </Group>
                
                {asset.acquisitionDate && (
                  <Text size="xs" c="dimmed">
                    Acquired: {new Date(asset.acquisitionDate).toLocaleDateString()}
                  </Text>
                )}
                
                <Text size="xs" c="dimmed">
                  Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      
      {/* Asset Form Modal */}
      <Modal 
        opened={opened} 
        onClose={handleCloseModal} 
        title={editAsset ? "Edit Asset" : "Add New Asset"} 
        size="md"
      >
        <AssetForm 
          asset={editAsset} 
          onClose={handleCloseModal} 
          initialType={activeTab !== 'all' ? activeTab : undefined}
        />
      </Modal>
    </Container>
  );
}