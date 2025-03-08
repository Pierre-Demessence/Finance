import { Modal } from '@mantine/core';
import React from 'react';

interface ModalWrapperProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
  centered?: boolean;
}

/**
 * A standard wrapper for all modals with consistent styling and behavior.
 * Used to maintain consistent modal appearance throughout the application.
 */
export default function ModalWrapper({ 
  opened, 
  onClose, 
  title, 
  children, 
  size = "md",
  centered = false
}: ModalWrapperProps) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={title} 
      size={size}
      centered={centered}
    >
      {children}
    </Modal>
  );
}