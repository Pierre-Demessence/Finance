import { Card, Text, Group, ThemeIcon, Badge } from '@mantine/core';
import Link from 'next/link';
import React from 'react';

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

/**
 * A standardized card component for displaying data with a title, value, and optional icon/badge.
 * Used for summary cards, metrics, and dashboard tiles.
 */
export default function DataCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "blue", 
  badgeValue, 
  valueColor, 
  onClick, 
  asLink, 
  href 
}: DataCardProps) {
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
    <Card 
      withBorder 
      padding="lg" 
      radius="md" 
      onClick={onClick} 
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {cardContent}
    </Card>
  );
}