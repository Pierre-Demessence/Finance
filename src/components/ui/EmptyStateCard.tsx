import { Card, Stack, ThemeIcon, Text, Button } from '@mantine/core';
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: string;
}

/**
 * A reusable component for displaying empty state messages with an icon, title, description, and optional action button.
 * Used when there's no data to display in a section or page.
 */
export default function EmptyStateCard({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  actionVariant = "light" 
}: EmptyStateProps) {
  return (
    <Card withBorder padding="xl" radius="md">
      <Stack align="center" gap="md">
        <ThemeIcon size={50} radius={50} variant="light">
          {icon}
        </ThemeIcon>
        <Stack align="center" gap={4}>
          <Text fw={500} size="lg">{title}</Text>
          <Text c="dimmed" ta="center">{description}</Text>
        </Stack>
        {actionLabel && onAction && (
          <Button 
            variant={actionVariant} 
            onClick={onAction}
            mt="sm"
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Card>
  );
}