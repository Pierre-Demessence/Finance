import { Card, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconChartPie } from '@tabler/icons-react';
import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
  emptyMessage?: string;
  hasData?: boolean;
}

/**
 * A standard wrapper for charts with title, description, and proper formatting.
 * Provides a consistent container for all charts in the application.
 */
export default function ChartCard({ 
  title, 
  description, 
  height = 300, 
  children, 
  emptyMessage = "No data available", 
  hasData = true 
}: ChartCardProps) {
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