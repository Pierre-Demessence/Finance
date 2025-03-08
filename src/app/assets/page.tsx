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
  ActionIcon,
  Menu,
  Modal,
  Tabs,
  Grid,
  ThemeIcon,
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
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency } from '@/hooks/useFinanceUtils';
import { Asset, AssetType } from '@/models';
import { ASSET_TYPES } from '@/config/constants';
import AssetForm from '@/components/AssetForm';
// Import our new components
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import CategoryDistribution from '@/components/ui/CategoryDistribution';
import ActionMenu from '@/components/ui/ActionMenu';
import ModalWrapper from '@/components/ui/ModalWrapper';
import { formatPercentage } from '@/utils/financeUtils';

export default function AssetsPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType | 'all' | string>('all');
  
  const { assets, accounts, customAssetTypes, deleteAsset } = useFinanceStore();
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
    .filter(asset => {
      if (activeTab === 'all') return true;
      
      // For standard asset types
      if (Object.values(AssetType).includes(activeTab as AssetType)) {
        return String(asset.type) === String(activeTab);
      }
      
      // For custom asset types (the tab value will be the custom type ID)
      return asset.type === AssetType.CUSTOM && asset.customTypeId === activeTab;
    });
  
  // Calculate total value across all assets, grouped by type
  const assetValues = assets.reduce((acc, asset) => {
    const account = accounts.find(a => a.id === asset.accountId);
    if (!account) return acc;
    
    const value = asset.quantity * asset.currentPrice;
    const valueInBaseCurrency = toBaseCurrency(value, account.currency);
    
    let typeKey = asset.type;
    
    // For custom asset types, use the custom type ID as the key
    if (asset.type === AssetType.CUSTOM) {
      const customTypeId = asset.customTypeId;
      const customType = customAssetTypes.find(t => t.id === customTypeId);
      if (customType) {
        typeKey = `custom_${customType.id}` as AssetType;
      }
    }
    
    if (!acc[typeKey]) {
      acc[typeKey] = {
        count: 0,
        value: 0,
      };
    }
    
    acc[typeKey].count += 1;
    acc[typeKey].value += valueInBaseCurrency;
    acc.total += valueInBaseCurrency;
    
    return acc;
  }, { total: 0 } as Record<string, { count: number; value: number }> & { total: number });
  
  // Get color for asset type
  function getAssetTypeColor(type: AssetType | string): string {
    // For standard asset types
    switch (type) {
      case AssetType.CRYPTOCURRENCY: return '#1E88E5'; // Blue
      case AssetType.STOCK: return '#43A047'; // Green
      case AssetType.REAL_ESTATE: return '#FB8C00'; // Orange
      case AssetType.VEHICLE: return '#E53935'; // Red
      case AssetType.ELECTRONICS: return '#8E24AA'; // Purple
      case AssetType.OTHER: return '#757575'; // Gray
      case AssetType.CUSTOM: {
        // For custom type, this should never be called directly
        // but if it is, return gray
        return '#757575';
      }
      default: {
        // Check if it's a custom asset type ID
        const customType = customAssetTypes.find(t => t.id === type);
        if (customType && customType.color) {
          return customType.color;
        }
        return '#757575'; // Default gray
      }
    }
  }
  
  // Get icon for asset type
  function getAssetTypeIcon(type: AssetType | string, customTypeId?: string) {
    // For standard asset types
    switch (type) {
      case AssetType.CRYPTOCURRENCY: return <IconCurrencyBitcoin size={16} />;
      case AssetType.STOCK: return <IconChartLine size={16} />;
      case AssetType.REAL_ESTATE: return <IconBuilding size={16} />;
      case AssetType.VEHICLE: return <IconCar size={16} />;
      case AssetType.ELECTRONICS: return <IconDeviceLaptop size={16} />;
      case AssetType.OTHER: return <IconCube size={16} />;
      case AssetType.CUSTOM: {
        // Find the custom type
        if (customTypeId) {
          const customType = customAssetTypes.find(t => t.id === customTypeId);
          if (customType && customType.icon) {
            // Would use dynamic icon lookup here in a real app
            return <IconCube size={16} />;
          }
        }
        return <IconCube size={16} />;
      }
      default: {
        // Check if it's a custom asset type ID
        const customType = customAssetTypes.find(t => t.id === type);
        if (customType) {
          // Would use dynamic icon lookup here in a real app
          return <IconCube size={16} />;
        }
        return <IconCube size={16} />;
      }
    }
  }
  
  // Prepare data for the category distribution
  const distributionData = Object.entries(assetValues)
    .filter(([key]) => key !== 'total')
    .map(([type, data]) => {
      let name = type;
      let color = '#757575'; // Default gray
      
      // Handle standard asset types
      if (ASSET_TYPES[type as keyof typeof ASSET_TYPES]) {
        name = ASSET_TYPES[type as keyof typeof ASSET_TYPES].name;
        color = getAssetTypeColor(type as AssetType);
      } 
      // Handle custom asset types
      else if (type.startsWith('custom_')) {
        const customTypeId = type.replace('custom_', '');
        const customType = customAssetTypes.find(t => t.id === customTypeId);
        if (customType) {
          name = customType.name;
          color = customType.color || '#757575';
        }
      }
      
      return {
        name,
        value: typeof data === 'number' ? data : data.value,
        color,
        icon: getAssetTypeIcon(type.startsWith('custom_') ? type.replace('custom_', '') : type),
        count: typeof data === 'number' ? 1 : data.count
      };
    });
  
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

  // Get empty state description based on active tab
  const getEmptyStateDescription = () => {
    if (activeTab === 'all') {
      return "You haven't added any assets yet. Click 'Add Asset' to create your first asset.";
    }
    
    // For standard asset types
    if (ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]) {
      return `You don't have any ${ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]?.name.toLowerCase() || 'assets'} yet.`;
    }
    
    // For custom asset types
    const customType = customAssetTypes.find(t => t.id === activeTab);
    if (customType) {
      return `You don't have any ${customType.name.toLowerCase()} assets yet.`;
    }
    
    return "You don't have any assets in this category yet.";
  };
  
  // Get action label for the empty state button
  const getActionLabel = () => {
    if (activeTab === 'all') return 'Add Asset';
    
    // For standard asset types
    if (ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]) {
      return `Add ${ASSET_TYPES[activeTab as keyof typeof ASSET_TYPES]?.name || 'Asset'}`;
    }
    
    // For custom asset types
    const customType = customAssetTypes.find(t => t.id === activeTab);
    if (customType) {
      return `Add ${customType.name}`;
    }
    
    return 'Add Asset';
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Assets</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Asset
        </Button>
      </Group>
      
      {/* Use the CategoryDistribution component */}
      <CategoryDistribution
        title="Asset Distribution"
        totalValue={assetValues.total}
        totalLabel="Assets Summary"
        data={distributionData}
        formatValue={formatAmount}
        chartHeight={240}
      />
      
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as AssetType | 'all' | string)} mb="md">
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
            value={AssetType.VEHICLE} 
            leftSection={<IconCar size={16} />}
          >
            Vehicles
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.ELECTRONICS} 
            leftSection={<IconDeviceLaptop size={16} />}
          >
            Electronics
          </Tabs.Tab>
          <Tabs.Tab 
            value={AssetType.OTHER} 
            leftSection={<IconCube size={16} />}
          >
            Other
          </Tabs.Tab>
          
          {/* Custom Asset Type Tabs */}
          {customAssetTypes.map(customType => (
            <Tabs.Tab 
              key={customType.id}
              value={customType.id} 
              leftSection={getAssetTypeIcon(customType.id)}
            >
              {customType.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {filteredAssets.length === 0 ? (
        <EmptyStateCard
          icon={<IconChartPie size={50} />}
          title="No assets found"
          description={getEmptyStateDescription()}
          actionLabel={getActionLabel()}
          onAction={open}
        />
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
                onClick: () => handleEditAsset(asset)
              },
              {
                icon: <IconTrash size={14} />,
                label: 'Delete',
                color: 'red',
                onClick: () => deleteAsset(asset.id)
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
                            {formatPercentage(profitLossPercentage)})
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
      
      {/* Use ModalWrapper component */}
      <ModalWrapper 
        opened={opened} 
        onClose={handleCloseModal} 
        title={editAsset ? "Edit Asset" : "Add New Asset"} 
        size="md"
      >
        <AssetForm 
          asset={editAsset} 
          onClose={handleCloseModal} 
          initialType={activeTab !== 'all' && !customAssetTypes.some(t => t.id === activeTab) ? activeTab as AssetType : undefined}
          customTypeId={customAssetTypes.some(t => t.id === activeTab) ? activeTab : undefined}
        />
      </ModalWrapper>
    </Container>
  );
}