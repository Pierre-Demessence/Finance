import { Card, Stack, Group, TextInput, Select, Button } from '@mantine/core';
import { IconSearch, IconSortAscending } from '@tabler/icons-react';
import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  searchValue: string;
  sortOptions?: FilterOption[];
  onSort?: (value: string | null) => void;  // Updated type signature
  sortValue?: string | null;  // Updated type signature
  filterOptions?: {
    label: string;
    options: FilterOption[];
    value: string | null;  // Updated type signature
    onChange: (value: string | null) => void;  // Updated type signature
    icon?: React.ReactNode;
  }[];
  onReset?: () => void;
  children?: React.ReactNode;
}

/**
 * A reusable filter bar for tables with search, sort, and filter options.
 * Provides consistent filtering UI across the application.
 */
export default function FilterBar({ 
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