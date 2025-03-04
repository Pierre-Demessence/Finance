import { Paper, Text, Group, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { IconChartLine } from '@tabler/icons-react';

interface ChartTooltipProps {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
  secondaryLabel?: string;
  secondaryValue?: string;
}

export default function ChartTooltip({ 
  label, 
  value, 
  color = 'blue', 
  icon = <IconChartLine size={16} />,
  secondaryLabel,
  secondaryValue
}: ChartTooltipProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper 
      shadow="md" 
      withBorder 
      p="md" 
      radius="md" 
    >
      <Group gap="xs" mb={secondaryLabel ? "xs" : 0}>
        <ThemeIcon color={color} variant={isDark ? "filled" : "light"} size="sm">
          {icon}
        </ThemeIcon>
        <Text size="sm" fw={500}>
          {label}
        </Text>
      </Group>
      <Text size="lg" fw={700} c={color} variant={isDark ? "filled" : "light"}>
        {value}
      </Text>
      {secondaryLabel && secondaryValue && (
        <Group gap="xs" mt={4}>
          <Text size="xs">
            {secondaryLabel}:
          </Text>
          <Text size="xs" fw={500}>
            {secondaryValue}
          </Text>
        </Group>
      )}
    </Paper>
  );
}