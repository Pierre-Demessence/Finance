import { Group, Button } from '@mantine/core';
import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showDelete?: boolean;
  onDelete?: () => void;
}

/**
 * Standardized form action buttons with cancel/submit functionality.
 * Provides consistent form actions across all forms in the application.
 */
export default function FormActions({ 
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