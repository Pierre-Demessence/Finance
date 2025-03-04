"use client";

import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
  SegmentedControl,
  Grid
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useFinanceStore } from '@/store/financeStore';
import { Asset, AssetType } from '@/models';
import { ASSET_TYPES } from '@/config/constants';

interface AssetFormProps {
  asset: Asset | null;
  onClose: () => void;
  initialType?: AssetType;
}

export default function AssetForm({ asset, onClose, initialType }: AssetFormProps) {
  const { 
    accounts,
    addAsset,
    updateAsset
  } = useFinanceStore();
  
  const [assetType, setAssetType] = useState<AssetType>(
    asset?.type || initialType || AssetType.CRYPTOCURRENCY
  );
  
  // Create form with validation
  const form = useForm({
    initialValues: {
      name: '',
      type: AssetType.CRYPTOCURRENCY,
      accountId: '',
      quantity: 1,
      currentPrice: 0,
      acquisitionPrice: undefined as number | undefined,
      acquisitionDate: null as Date | null,
      description: '',
      identifier: '',
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? 'Asset name is required' : null),
      accountId: (value) => (value.trim().length < 1 ? 'Account is required' : null),
      quantity: (value) => (value <= 0 ? 'Quantity must be greater than 0' : null),
      currentPrice: (value) => (value < 0 ? 'Current price cannot be negative' : null),
      acquisitionPrice: (value) => (value !== undefined && value < 0 ? 'Acquisition price cannot be negative' : null),
    },
  });
  
  // If editing, set initial form values
  useEffect(() => {
    if (asset) {
      form.setValues({
        name: asset.name,
        type: asset.type,
        accountId: asset.accountId,
        quantity: asset.quantity,
        currentPrice: asset.currentPrice,
        acquisitionPrice: asset.acquisitionPrice,
        acquisitionDate: asset.acquisitionDate || null,
        description: asset.description || '',
        identifier: asset.identifier || '',
      });
      setAssetType(asset.type);
    } else if (initialType) {
      form.setFieldValue('type', initialType);
    }
  }, [asset, initialType]);
  
  // Handle asset type change
  useEffect(() => {
    form.setFieldValue('type', assetType);
  }, [assetType]);
  
  // Create account options
  const accountOptions = accounts
    .filter(account => !account.isArchived)
    .map(account => ({
      value: account.id,
      label: `${account.name} (${account.currency})`
    }));
  
  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    const assetData = {
      name: values.name,
      type: values.type as AssetType,
      accountId: values.accountId,
      quantity: values.quantity,
      currentPrice: values.currentPrice,
      purchasePrice: values.acquisitionPrice || 0, // Default to 0 if undefined
      purchaseDate: values.acquisitionDate || new Date(), // Default to current date if not provided
      description: values.description || undefined,
      identifier: values.identifier || undefined,
      lastUpdated: new Date(),
    };
    
    if (asset) {
      updateAsset(asset.id, assetData);
    } else {
      addAsset(assetData);
    }
    
    form.reset();
    onClose();
  });

  // Get identifier placeholder based on asset type
  const getIdentifierPlaceholder = () => {
    switch (assetType) {
      case AssetType.CRYPTOCURRENCY:
        return 'e.g., BTC, ETH, ADA';
      case AssetType.STOCK:
        return 'e.g., AAPL, TSLA, MSFT';
      case AssetType.REAL_ESTATE:
        return 'e.g., Property address';
      default:
        return 'e.g., Serial number, unique identifier';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Select
          label="Asset Type"
          data={Object.entries(ASSET_TYPES).map(([type, info]) => ({
            value: type,
            label: info.name
          }))}
          value={assetType}
          onChange={(value) => setAssetType(value as AssetType)}
        />
        
        <TextInput
          label="Asset Name"
          placeholder={`e.g., ${
            assetType === AssetType.CRYPTOCURRENCY ? 'Bitcoin' :
            assetType === AssetType.STOCK ? 'Apple Inc.' :
            assetType === AssetType.REAL_ESTATE ? 'Main Street Property' :
            assetType === AssetType.VEHICLE ? '2023 Tesla Model 3' :
            assetType === AssetType.ELECTRONICS ? 'MacBook Pro' :
            'My Asset'
          }`}
          required
          {...form.getInputProps('name')}
        />
        
        <TextInput
          label="Identifier"
          placeholder={getIdentifierPlaceholder()}
          {...form.getInputProps('identifier')}
        />
        
        <Select
          label="Account"
          placeholder="Select account to associate with this asset"
          data={accountOptions}
          required
          {...form.getInputProps('accountId')}
        />
        
        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Quantity"
              placeholder="1"
              min={0.000001}
              step={assetType === AssetType.CRYPTOCURRENCY ? 0.01 : 1}
              decimalScale={assetType === AssetType.CRYPTOCURRENCY ? 8 : 2}
              required
              {...form.getInputProps('quantity')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Current Price (per unit)"
              placeholder="0.00"
              min={0}
              step={0.01}
              decimalScale={2}
              required
              {...form.getInputProps('currentPrice')}
            />
          </Grid.Col>
        </Grid>
        
        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Acquisition Price (per unit, optional)"
              placeholder="0.00"
              min={0}
              step={0.01}
              decimalScale={2}
              {...form.getInputProps('acquisitionPrice')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <DateInput
              label="Acquisition Date (optional)"
              placeholder="Select date"
              valueFormat="DD/MM/YYYY"
              clearable
              {...form.getInputProps('acquisitionDate')}
            />
          </Grid.Col>
        </Grid>
        
        <Textarea
          label="Description"
          placeholder="Optional description"
          autosize
          minRows={2}
          maxRows={4}
          {...form.getInputProps('description')}
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button type="submit">{asset ? 'Update' : 'Create'} Asset</Button>
        </Group>
      </Stack>
    </form>
  );
}