# Finance App Code Optimization Report

This report identifies areas of code duplication and potential components/functions that could be created to optimize the codebase.

## Common UI Components

### 1. EmptyStateCard Component

**Description:** A reusable component for displaying empty state messages with an icon, title, description, and optional action button.

**Current Duplication:**
- `accounts/page.tsx` (lines 224-245)
- `assets/page.tsx` (lines 376-396) 
- `transactions/page.tsx` (lines 313-337)
- `accounts/[id]/page.tsx` (lines 325-344)
- `page.tsx` (Dashboard) (lines 346-364)

**Implementation Details:**
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: string;
}

function EmptyStateCard({ icon, title, description, actionLabel, onAction, actionVariant = "light" }: EmptyStateProps) {
  return (
    <Card withBorder>
      <Stack align="center" py="xl">
        <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
          {icon}
        </ThemeIcon>
        <Text ta="center" fw={500}>{title}</Text>
        <Text ta="center" c="dimmed" size="sm">{description}</Text>
        {actionLabel && onAction && (
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={onAction}
            variant={actionVariant}
            mt="md"
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Card>
  );
}
```

### 2. DataCard Component

**Description:** A standardized card component for displaying data with a title, value, and optional icon/badge.

**Current Duplication:**
- `page.tsx` (Dashboard) (lines 120-195) - Net Worth, Cash Flow, Accounts, Assets cards
- `accounts/page.tsx` (lines 372-390) - Multiple summary cards 
- `transactions/page.tsx` (lines 517-536) - Income/Expenses cards
- `reports/page.tsx` (lines 188-235) - Net Cash Flow, Income, Expenses cards

**Implementation Details:**
```tsx
interface DataCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  badgeValue?: string | number;
  valueColor?: string;
  onClick?: () => void;
  asLink?: boolean;
  href?: string;
}

function DataCard({ title, value, subtitle, icon, color = "blue", badgeValue, valueColor, onClick, asLink, href }: DataCardProps) {
  const cardContent = (
    <>
      <Group justify="space-between">
        <Text size="lg" fw={500} c="dimmed">{title}</Text>
        <Group gap="xs">
          {badgeValue && <Badge>{badgeValue}</Badge>}
          {icon && (
            <ThemeIcon color={color} variant="light" size="lg" radius="md">
              {icon}
            </ThemeIcon>
          )}
        </Group>
      </Group>
      <Text fw={700} size="xl" mt="md" c={valueColor}>{value}</Text>
      {subtitle && <Text size="xs" c="dimmed" mt={4}>{subtitle}</Text>}
    </>
  );

  if (asLink && href) {
    return (
      <Card withBorder padding="lg" radius="md" component={Link} href={href}>
        {cardContent}
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      {cardContent}
    </Card>
  );
}
```

### 3. CategoryProgressBar Component

**Description:** A component for displaying a category with its value, percentage, and progress bar.

**Current Duplication:**
- `assets/page.tsx` (lines 260-272, 285-297) - Asset type progress bars
- `reports/page.tsx` (lines 326-359, 407-427) - Income/Expense category progress bars

**Implementation Details:**
```tsx
interface CategoryProgressBarProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  percentage: number;
  count?: number;
  color: string;
}

function CategoryProgressBar({ icon, name, value, percentage, count, color }: CategoryProgressBarProps) {
  return (
    <div>
      <Group justify="space-between" mb={5}>
        <Group>
          <ThemeIcon color={color} variant="light" size="sm">
            {icon}
          </ThemeIcon>
          <Text size="sm">{name}</Text>
        </Group>
        <Text size="sm" fw={500}>
          {value} {count !== undefined && <Text span c="dimmed" size="xs">({count})</Text>}
        </Text>
      </Group>
      <Progress 
        value={percentage} 
        color={color} 
        size="sm" 
        mb={2}
      />
      <Text size="xs" ta="right" c="dimmed">{percentage.toFixed(0)}%</Text>
    </div>
  );
}
```

### 4. ActionMenu Component

**Description:** A standardized dropdown menu for common actions like edit, delete, etc.

**Current Duplication:**
- `accounts/page.tsx` (lines 308-341)
- `transactions/page.tsx` (lines 451-482) 
- `assets/page.tsx` (lines 445-476)
- `accounts/[id]/page.tsx` (lines 269-297)

**Implementation Details:**
```tsx
interface ActionMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

function ActionMenu({ items }: ActionMenuProps) {
  return (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {items.map((item, index) => (
          <Menu.Item 
            key={index}
            leftSection={item.icon}
            onClick={item.onClick}
            color={item.color}
            disabled={item.disabled}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
```

### 5. FilterBar Component

**Description:** A reusable filter bar for tables with search, sort, and filter options.

**Current Duplication:**
- `accounts/page.tsx` (lines 192-223)
- `transactions/page.tsx` (lines 241-313)

**Implementation Details:**
```tsx
interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  searchValue: string;
  sortOptions?: FilterOption[];
  onSort?: (value: string) => void;
  sortValue?: string;
  filterOptions?: {
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
  }[];
  onReset?: () => void;
  children?: React.ReactNode;
}

function FilterBar({ 
  onSearch, 
  searchValue, 
  sortOptions, 
  onSort, 
  sortValue, 
  filterOptions, 
  onReset,
  children 
}: FilterBarProps) {
  return (
    <Card withBorder p="md" mb="md">
      <Stack>
        <Group mb="md">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          
          {sortOptions && onSort && (
            <Select
              placeholder="Sort by"
              leftSection={<IconSortAscending size={16} />}
              data={sortOptions}
              value={sortValue}
              onChange={onSort}
              w={200}
            />
          )}
        </Group>
        
        {filterOptions && filterOptions.length > 0 && (
          <Group align="flex-end">
            {filterOptions.map((filter, index) => (
              <Select
                key={index}
                placeholder={filter.label}
                leftSection={filter.icon}
                data={filter.options}
                value={filter.value}
                onChange={filter.onChange}
                clearable
                flex={1}
              />
            ))}
            
            {onReset && (
              <Button variant="light" onClick={onReset}>
                Reset Filters
              </Button>
            )}
          </Group>
        )}
        
        {children}
      </Stack>
    </Card>
  );
}
```

### 6. ModalWrapper Component

**Description:** A standard wrapper for all modals with consistent styling and behavior.

**Current Duplication:**
- Almost every page has modal code that follows the same pattern
- `accounts/page.tsx` (lines 414-427)
- `transactions/page.tsx` (lines 544-557)
- `assets/page.tsx` (lines 538-552)
- `settings/page.tsx` multiple places

**Implementation Details:**
```tsx
interface ModalWrapperProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
}

function ModalWrapper({ opened, onClose, title, children, size = "md" }: ModalWrapperProps) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={title} 
      size={size}
    >
      {children}
    </Modal>
  );
}
```

### 7. Pagination Component

**Description:** A standardized pagination component with page size selection.

**Current Duplication:**
- `accounts/[id]/page.tsx` (lines 412-428)
- `transactions/page.tsx` (lines 487-503)

**Implementation Details:**
```tsx
interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: { value: string; label: string }[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function PaginationControl({ 
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange
}: PaginationControlProps) {
  return (
    <Flex justify="center" mt="md" align="center" gap="md">
      <Pagination 
        value={currentPage} 
        onChange={onPageChange}
        total={totalPages} 
      />
      <NativeSelect
        data={pageSizeOptions}
        value={pageSize.toString()}
        onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
        style={{ width: '130px' }}
      />
    </Flex>
  );
}
```

## Utility Functions

### 1. getStatusColor Function

**Description:** A utility function to get the appropriate color based on transaction type or value sign.

**Current Duplication:**
- `transactions/page.tsx` (lines 396-407)
- `accounts/[id]/page.tsx` (lines 363-385)
- All files that check transaction type to determine colors

**Implementation Details:**
```tsx
function getStatusColor(
  type: TransactionType | string | 'positive' | 'negative', 
  defaultColor = undefined
) {
  if (type === TransactionType.INCOME || type === 'positive') return 'teal';
  if (type === TransactionType.EXPENSE || type === 'negative') return 'red';
  if (type === TransactionType.TRANSFER) return 'blue';
  return defaultColor;
}
```

### 2. formatPercentage Function

**Description:** A utility to format percentage values consistently.

**Current Duplication:**
- `assets/page.tsx` (lines 260-272)
- `reports/page.tsx` (lines 351-359)
- Multiple other locations displaying percentage values

**Implementation Details:**
```tsx
function formatPercentage(value: number, decimals = 1, includeSymbol = true) {
  return `${includeSymbol ? '' : ''}${value.toFixed(decimals)}${includeSymbol ? '%' : ''}`;
}
```

### 3. dateHelpers Functions

**Description:** Standardize date formatting and manipulation.

**Current Duplication:**
- `reports/page.tsx` (lines 59-83) - Period calculation
- `transactions/page.tsx` - Date formatting logic
- Various other files with date manipulation

**Implementation Details:**
```tsx
const dateHelpers = {
  getDateRangeByPeriod: (period: '7d' | '30d' | '90d' | '1y'): [Date, Date] => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = dayjs().subtract(7, 'day').toDate();
        break;
      case '30d':
        startDate = dayjs().subtract(30, 'day').toDate();
        break;
      case '90d':
        startDate = dayjs().subtract(90, 'day').toDate();
        break;
      case '1y':
        startDate = dayjs().subtract(1, 'year').toDate();
        break;
    }
    
    return [startDate, endDate];
  },
  
  formatDate: (date: Date, format = 'MMM D, YYYY') => {
    return dayjs(date).format(format);
  }
};
```

## Chart-related Components

### 1. ChartCard Component

**Description:** A standard wrapper for charts with title, description, and proper formatting.

**Current Duplication:**
- `page.tsx` (Dashboard) (lines 239-262)
- `reports/page.tsx` (lines 266-295)
- `accounts/[id]/page.tsx` (lines 439-467)

**Implementation Details:**
```tsx
interface ChartCardProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
  emptyMessage?: string;
  hasData?: boolean;
}

function ChartCard({ title, description, height = 300, children, emptyMessage = "No data available", hasData = true }: ChartCardProps) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Text fw={500} mb="md">{title}</Text>
      {description && <Text c="dimmed" size="sm" mb="md">{description}</Text>}
      
      {hasData ? (
        <div style={{ height: `${height}px` }}>
          {children}
        </div>
      ) : (
        <Stack align="center" h={height} justify="center">
          <ThemeIcon size="xl" color="gray" variant="light" radius="xl">
            <IconChartPie size={24} />
          </ThemeIcon>
          <Text c="dimmed" mt="md" ta="center">{emptyMessage}</Text>
        </Stack>
      )}
    </Card>
  );
}
```

### 2. CategoryDistribution Component

**Description:** A component that displays category distribution with donut chart and category breakdown.

**Current Duplication:**
- `assets/page.tsx` (lines 207-297) - Asset distribution
- `reports/page.tsx` (lines 296-359, 351-427) - Income/Expense distribution

**Implementation Details:**
```tsx
interface CategoryItem {
  name: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  count?: number;
}

interface CategoryDistributionProps {
  title: string;
  totalValue: number;
  totalLabel?: string;
  data: CategoryItem[];
  chartHeight?: number;
  formatValue: (value: number) => string;
}

function CategoryDistribution({ 
  title, 
  totalValue, 
  totalLabel = "Total",
  data, 
  chartHeight = 240,
  formatValue 
}: CategoryDistributionProps) {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="lg">
            <Text fw={500}>{title}</Text>
            <Text fw={700}>{formatValue(totalValue)}</Text>
          </Group>
          
          <DonutChart
            h={chartHeight}
            data={data}
            withLabels
            withTooltip
            tooltipProps={{
              content: ({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <ChartTooltip
                    label={item.name}
                    value={formatValue(item.value)}
                    color={item.color}
                    icon={item.icon || <IconChartPie size={16} />}
                    secondaryLabel="Percentage"
                    secondaryValue={`${((item.value / totalValue) * 100).toFixed(1)}%`}
                  />
                );
              },
            }}
          />
        </Card>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder padding="lg" radius="md">
          <Text fw={500} mb="md">{totalLabel}</Text>
          <Stack gap="xs">
            {data.map((item, index) => {
              const percentage = totalValue ? (item.value / totalValue) * 100 : 0;
              
              return (
                <CategoryProgressBar
                  key={index}
                  icon={item.icon || <IconChartPie size={16} />}
                  name={item.name}
                  value={formatValue(item.value)}
                  percentage={percentage}
                  count={item.count}
                  color={item.color}
                />
              );
            })}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
```

## Form Abstractions

### 1. FormActions Component

**Description:** Standardized form actions with cancel/submit buttons.

**Current Duplication:**
- `components/TransactionForm.tsx` (lines 358-367)
- `components/AssetForm.tsx` (lines 273-282)
- `components/AccountForm.tsx` similar pattern

**Implementation Details:**
```tsx
interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showDelete?: boolean;
  onDelete?: () => void;
}

function FormActions({ 
  onCancel, 
  onSubmit, 
  isSubmitting = false, 
  submitLabel = 'Save', 
  cancelLabel = 'Cancel',
  showDelete = false,
  onDelete
}: FormActionsProps) {
  return (
    <Group justify="flex-end" mt="md">
      {showDelete && onDelete && (
        <Button 
          color="red" 
          variant="outline" 
          onClick={onDelete}
          mr="auto"
        >
          Delete
        </Button>
      )}
      <Button variant="light" onClick={onCancel} disabled={isSubmitting}>
        {cancelLabel}
      </Button>
      {onSubmit && (
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      )}
    </Group>
  );
}
```

### 2. useFormValidation Hook

**Description:** A custom hook for form validation that's used across various forms.

**Current Duplication:**
- `components/TransactionForm.tsx` (lines 100-119)
- `components/AssetForm.tsx` similar validation logic
- `components/AccountForm.tsx` similar validation logic

**Implementation Details:**
```tsx
function useFormValidation<T extends object>(initialErrors: Partial<T> = {}) {
  const [errors, setErrors] = useState<Partial<T>>(initialErrors);
  
  const validate = (data: T, rules: Record<keyof T, (val: any) => string | null>) => {
    const newErrors: Partial<T> = {};
    let isValid = true;
    
    for (const field in rules) {
      const error = rules[field](data[field]);
      if (error) {
        newErrors[field] = error as any;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  return { errors, validate, setErrors };
}
```

## Conclusion

Implementing these reusable components and utilities would significantly reduce code duplication across the application, improve maintainability, and ensure UI consistency. Each component should be created in its own file within a new `components/common` or `components/ui` directory, and the utility functions should be grouped in a logical manner in the `utils` directory.