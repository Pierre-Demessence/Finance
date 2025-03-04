"use client";

import { useState, ReactNode } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Title,
  NavLink,
  Text,
  ThemeIcon,
  Avatar,
  useMantineTheme,
  Image,
  rem,
  Stack,
  Badge,
  Switch,
  Menu,
  ActionIcon,
} from '@mantine/core';
import {
  IconDashboard,
  IconWallet,
  IconCoin,
  IconChartLine,
  IconSettings,
  IconReceipt2,
  IconMoon,
  IconSun,
  IconUser,
  IconLogout,
  IconHeartHandshake,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinanceStore } from '@/store/financeStore';
import { useCurrency } from '@/hooks/useFinanceUtils';

interface NavigationProps {
  children: ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const theme = useMantineTheme();
  const { settings, updateSettings } = useFinanceStore();
  const { formatAmount } = useCurrency();
  
  // Toggle dark/light theme
  const toggleColorScheme = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <IconDashboard size={18} />, href: '/' },
    { label: 'Accounts', icon: <IconWallet size={18} />, href: '/accounts' },
    { label: 'Transactions', icon: <IconReceipt2 size={18} />, href: '/transactions' },
    { label: 'Assets', icon: <IconCoin size={18} />, href: '/assets' },
    { label: 'Reports', icon: <IconChartLine size={18} />, href: '/reports' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Image 
              src="/logo.svg" 
              alt="Finance logo" 
              w={30} 
              h={30}
            />
            <Title order={3} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Finance Tracker
            </Title>
          </Group>
          
          <Group>
            <Switch
              size="md"
              color={theme.primaryColor}
              onLabel={<IconSun size="1rem" stroke={2.5} />}
              offLabel={<IconMoon size="1rem" stroke={2.5} />}
              checked={settings.theme === 'dark'}
              onChange={toggleColorScheme}
            />
            
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon size="lg" radius="xl" variant="subtle">
                  <Avatar color="blue" radius="xl" size="sm">
                    <IconUser size="1.2rem" />
                  </Avatar>
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>User</Menu.Label>
                <Menu.Item
                  component={Link}
                  href="/settings"
                  leftSection={<IconSettings size={14} />}
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={
                  <ThemeIcon variant="light" size="sm">
                    {item.icon}
                  </ThemeIcon>
                }
                active={pathname === item.href}
              />
            ))}
          </Stack>
          
          <Stack>
            <NavLink
              component={Link}
              href="/settings"
              label="Settings"
              leftSection={
                <ThemeIcon variant="light" size="sm">
                  <IconSettings size={18} />
                </ThemeIcon>
              }
              active={pathname === '/settings'}
            />
            <Group p="xs" gap="xs">
              <IconHeartHandshake size={20} stroke={1.5} />
              <Text size="sm" fw={500}>
                Finance Manager v1.0
              </Text>
            </Group>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}