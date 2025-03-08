import { Menu, ActionIcon } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import React from 'react';

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

/**
 * A standardized dropdown menu for common actions like edit, delete, etc.
 * Used to provide consistent action menus across the application.
 */
export default function ActionMenu({ items }: ActionMenuProps) {
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