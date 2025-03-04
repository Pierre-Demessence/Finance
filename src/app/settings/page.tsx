"use client";

import { useState } from 'react';
import {
  Title,
  Container,
  Group,
  Button,
  Card,
  Text,
  Switch,
  Divider,
  Select,
  NumberInput,
  Stack,
  Grid,
  Tabs,
  ActionIcon,
  TextInput,
  ColorInput,
  Modal,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSettings,
  IconCategoryPlus,
  IconCurrencyEuro,
  IconCalendarStats,
  IconTrash,
  IconEdit,
  IconPlus,
  IconInfoCircle,
  IconCheck,
} from '@tabler/icons-react';
import { useFinanceStore } from '@/store/financeStore';
import { CURRENCIES } from '@/config/constants';
import { AccountCategory, TransactionCategory, TransactionType } from '@/models';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [opened, { open, close }] = useDisclosure(false);
  const [currentCategory, setCurrentCategory] = useState<AccountCategory | TransactionCategory | null>(null);
  const [categoryType, setCategoryType] = useState<'account' | 'transaction'>('account');
  const [transactionCategoryType, setTransactionCategoryType] = useState<TransactionType | 'all'>(TransactionType.INCOME);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const {
    settings,
    updateSettings,
    accountCategories,
    transactionCategories,
    addAccountCategory,
    updateAccountCategory,
    deleteAccountCategory,
    addTransactionCategory,
    updateTransactionCategory,
    deleteTransactionCategory
  } = useFinanceStore();
  
  // Form for adding/editing categories
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    color: '',
    type: TransactionType.INCOME,
  });
  
  // Prepare currency options for select input
  const currencyOptions = Object.values(CURRENCIES).map((currency) => ({
    value: currency.code,
    label: `${currency.code} (${currency.symbol}) - ${currency.name}`
  }));
  
  // Date format options
  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2023)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2023)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-12-31)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.12.2023)' }
  ];
  
  // Handle settings save
  const handleSaveSettings = () => {
    // Save logic could be more complex in a real app
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  // Open category modal for edit
  const handleEditCategory = (category: AccountCategory | TransactionCategory, type: 'account' | 'transaction') => {
    setCurrentCategory(category);
    setCategoryType(type);
    
    if ('type' in category && type === 'transaction') {
      setTransactionCategoryType(category.type);
      setFormData({
        name: category.name,
        icon: category.icon || '',
        color: '', // Assuming color is not stored but could be added
        type: category.type as TransactionType,
      });
    } else {
      setFormData({
        name: category.name,
        icon: category.icon || '',
        color: '',
        type: TransactionType.INCOME, // Default, not used for account categories
      });
    }
    
    open();
  };
  
  // Open category modal for new
  const handleAddCategory = (type: 'account' | 'transaction', transactionType?: TransactionType | 'all') => {
    setCurrentCategory(null);
    setCategoryType(type);
    
    if (type === 'transaction' && transactionType) {
      setTransactionCategoryType(transactionType);
      setFormData({
        name: '',
        icon: '',
        color: '',
        type: transactionType === 'all' ? TransactionType.INCOME : transactionType,
      });
    } else {
      setFormData({
        name: '',
        icon: '',
        color: '',
        type: TransactionType.INCOME,
      });
    }
    
    open();
  };
  
  // Handle category save
  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      // Basic validation
      return;
    }
    
    const categoryData = {
      name: formData.name,
      icon: formData.icon || undefined,
    };
    
    if (categoryType === 'account') {
      if (currentCategory) {
        updateAccountCategory(currentCategory.id, categoryData);
      } else {
        addAccountCategory(categoryData);
      }
    } else {
      // Transaction category
      const transactionCategoryData = {
        ...categoryData,
        type: formData.type,
      };
      
      if (currentCategory) {
        updateTransactionCategory(currentCategory.id, transactionCategoryData);
      } else {
        addTransactionCategory(transactionCategoryData);
      }
    }
    
    close();
    // Reset form data
    setFormData({
      name: '',
      icon: '',
      color: '',
      type: TransactionType.INCOME,
    });
  };
  
  // Handle category delete
  const handleDeleteCategory = (id: string) => {
    if (categoryType === 'account') {
      const success = deleteAccountCategory(id);
      if (!success) {
        alert('Cannot delete a default category or a category in use');
      }
    } else {
      const success = deleteTransactionCategory(id);
      if (!success) {
        alert('Cannot delete a default category or a category in use');
      }
    }
    
    close();
  };

  return (
    <Container size="lg">
      <Title order={2} mb="md">Settings</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab 
            value="general" 
            leftSection={<IconSettings size={16} />}
          >
            General
          </Tabs.Tab>
          <Tabs.Tab 
            value="categories" 
            leftSection={<IconCategoryPlus size={16} />}
          >
            Categories
          </Tabs.Tab>
          <Tabs.Tab 
            value="currencies" 
            leftSection={<IconCurrencyEuro size={16} />}
          >
            Currencies
          </Tabs.Tab>
          <Tabs.Tab 
            value="data" 
            leftSection={<IconCalendarStats size={16} />}
          >
            Data & Sync
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="general" pt="md">
          <Card withBorder p="lg">
            <Text fw={500} mb="md">General Settings</Text>
            
            {saveSuccess && (
              <Alert 
                icon={<IconCheck size="1rem" />} 
                title="Settings saved!" 
                color="green" 
                mb="md"
              >
                Your settings have been saved successfully.
              </Alert>
            )}
            
            <Stack>
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Base Currency"
                    description="All values will be converted to this currency for reports"
                    placeholder="Select base currency"
                    data={currencyOptions}
                    value={settings.baseCurrency}
                    onChange={(value) => updateSettings({ baseCurrency: value || 'EUR' })}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Date Format"
                    description="Format used for displaying dates"
                    placeholder="Select date format"
                    data={dateFormatOptions}
                    value={settings.dateFormat}
                    onChange={(value) => updateSettings({ dateFormat: value || 'DD/MM/YYYY' })}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <NumberInput
                    label="Decimal Places"
                    description="Number of decimal places for currency display"
                    placeholder="2"
                    min={0}
                    max={8}
                    value={settings.decimalPlaces}
                    onChange={(value) => updateSettings({ decimalPlaces: Number(value) })}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Switch
                    label="Dark Mode"
                    description="Enable dark mode for the application"
                    checked={settings.theme === 'dark'}
                    onChange={(event) => 
                      updateSettings({ 
                        theme: event.currentTarget.checked ? 'dark' : 'light' 
                      })
                    }
                    mt="md"
                  />
                </Grid.Col>
              </Grid>
              
              <Divider my="md" />
              
              <Group justify="flex-end">
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>
        
        <Tabs.Panel value="categories" pt="md">
          <Card withBorder p="lg" mb="md">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Account Categories</Text>
              <Button 
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleAddCategory('account')}
              >
                Add Category
              </Button>
            </Group>
            
            <Divider mb="md" />
            
            {accountCategories.map(category => (
              <Group key={category.id} justify="space-between" mb="xs">
                <Group>
                  <Text>{category.name}</Text>
                  {category.isDefault && (
                    <Text size="xs" c="dimmed">(Default)</Text>
                  )}
                </Group>
                <Group>
                  <ActionIcon 
                    color="blue" 
                    variant="subtle"
                    onClick={() => handleEditCategory(category, 'account')}
                    disabled={category.isDefault}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon 
                    color="red" 
                    variant="subtle"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.isDefault}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Card>
          
          <Card withBorder p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Transaction Categories</Text>
              <Group>
                <Button 
                  size="sm"
                  variant="outline"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleAddCategory('transaction', TransactionType.INCOME)}
                >
                  Add Income Category
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => handleAddCategory('transaction', TransactionType.EXPENSE)}
                >
                  Add Expense Category
                </Button>
              </Group>
            </Group>
            
            <Divider mb="md" />
            
            <Text fw={500} mb="xs">Income Categories</Text>
            {transactionCategories
              .filter(cat => cat.type === TransactionType.INCOME)
              .map(category => (
                <Group key={category.id} justify="space-between" mb="xs">
                  <Group>
                    <Text>{category.name}</Text>
                    {category.isDefault && (
                      <Text size="xs" c="dimmed">(Default)</Text>
                    )}
                  </Group>
                  <Group>
                    <ActionIcon 
                      color="blue" 
                      variant="subtle"
                      onClick={() => handleEditCategory(category, 'transaction')}
                      disabled={category.isDefault}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      color="red" 
                      variant="subtle"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.isDefault}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            
            <Divider my="md" />
            
            <Text fw={500} mb="xs">Expense Categories</Text>
            {transactionCategories
              .filter(cat => cat.type === TransactionType.EXPENSE)
              .map(category => (
                <Group key={category.id} justify="space-between" mb="xs">
                  <Group>
                    <Text>{category.name}</Text>
                    {category.isDefault && (
                      <Text size="xs" c="dimmed">(Default)</Text>
                    )}
                  </Group>
                  <Group>
                    <ActionIcon 
                      color="blue" 
                      variant="subtle"
                      onClick={() => handleEditCategory(category, 'transaction')}
                      disabled={category.isDefault}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      color="red" 
                      variant="subtle"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.isDefault}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
          </Card>
        </Tabs.Panel>
        
        <Tabs.Panel value="currencies" pt="md">
          <Card withBorder p="lg">
            <Text fw={500} mb="md">Currency Settings</Text>
            
            <Alert 
              icon={<IconInfoCircle size="1rem" />}
              title="Currency Exchange Rates"
              mb="md"
            >
              In a production environment, this application would connect to a currency exchange rate API to automatically update exchange rates for accurate conversions between different currencies.
            </Alert>
            
            <Stack>
              <Select
                label="Base Currency"
                description="All values will be converted to this currency for reports"
                placeholder="Select base currency"
                data={currencyOptions}
                value={settings.baseCurrency}
                onChange={(value) => updateSettings({ baseCurrency: value || 'EUR' })}
              />
              
              <Text fw={500} mt="md">Available Currencies</Text>
              <Grid>
                {Object.values(CURRENCIES).map(currency => (
                  <Grid.Col key={currency.code} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card withBorder p="sm">
                      <Group>
                        <Text fw={500}>{currency.code}</Text>
                        <Text>{currency.symbol}</Text>
                        <Text c="dimmed">{currency.name}</Text>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Card>
        </Tabs.Panel>
        
        <Tabs.Panel value="data" pt="md">
          <Card withBorder p="lg">
            <Text fw={500} mb="md">Data Management</Text>
            
            <Alert 
              icon={<IconInfoCircle size="1rem" />}
              title="Local Storage"
              mb="md"
            >
              Currently, all data is stored in your browser's local storage. In a production environment, this app would include cloud sync and backup functionality.
            </Alert>
            
            <Stack gap="md">
              <Button variant="outline" color="blue">Export All Data (JSON)</Button>
              <Button variant="outline" color="blue">Import Data</Button>
              <Divider my="xs" />
              <Button variant="outline" color="red">Reset All Data</Button>
            </Stack>
            
            <Text fw={500} mt="xl" mb="md">External Integrations</Text>
            <Text size="sm" c="dimmed" mb="md">
              In a production environment, the app would include integrations with financial services like:
            </Text>
            <Stack>
              <Button variant="light" color="gray" disabled>Connect to Banking API</Button>
              <Button variant="light" color="gray" disabled>Connect to Investment Platforms</Button>
              <Button variant="light" color="gray" disabled>Connect to Crypto Exchanges</Button>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
      
      {/* Category Edit/Add Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={`${currentCategory ? 'Edit' : 'Add'} ${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} Category`} 
        size="md"
      >
        <Stack>
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            required
          />
          
          <TextInput
            label="Icon"
            placeholder="Icon name (e.g., wallet, chart-line)"
            description="Enter a Tabler Icons name"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.currentTarget.value })}
          />
          
          {categoryType === 'transaction' && (
            <Select
              label="Transaction Type"
              placeholder="Select type"
              data={[
                { value: TransactionType.INCOME, label: 'Income' },
                { value: TransactionType.EXPENSE, label: 'Expense' },
                { value: TransactionType.TRANSFER, label: 'Transfer' },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ 
                ...formData, 
                type: value as TransactionType || TransactionType.INCOME
              })}
            />
          )}
          
          <Group justify="space-between" mt="md">
            {currentCategory && (
              <Button 
                color="red" 
                variant="outline" 
                onClick={() => handleDeleteCategory(currentCategory.id)}
                disabled={currentCategory?.isDefault}
              >
                Delete
              </Button>
            )}
            <Group ml="auto">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button onClick={handleSaveCategory}>Save</Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}