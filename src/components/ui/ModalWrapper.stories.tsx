import type { Meta, StoryObj } from '@storybook/react';
import { Button, Text, Stack } from '@mantine/core';
import { useState } from 'react';
import ModalWrapper from './ModalWrapper';

const meta = {
  title: 'UI/ModalWrapper',
  component: ModalWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    opened: { 
      control: 'boolean',
      description: 'Controls whether the modal is open'
    },
    onClose: { action: 'closed' }
  },
  decorators: [
    (Story) => {
      const [opened, setOpened] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpened(true)}>Open Modal</Button>
          {Story({ args: { ...Story.args, opened, onClose: () => setOpened(false) } })}
        </div>
      );
    },
  ],
} satisfies Meta<typeof ModalWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Example Modal',
    size: 'md',
    centered: false,
    children: (
      <Stack p="md">
        <Text>This is a sample modal content.</Text>
        <Text>You can put any content here.</Text>
      </Stack>
    )
  }
};

export const Centered: Story = {
  args: {
    title: 'Centered Modal',
    size: 'md',
    centered: true,
    children: (
      <Stack p="md">
        <Text>This modal is centered on the screen.</Text>
        <Text>It provides a different focal point for important information.</Text>
      </Stack>
    )
  }
};

export const LargeModal: Story = {
  args: {
    title: 'Large Modal',
    size: 'lg',
    centered: false,
    children: (
      <Stack p="md">
        <Text>This is a larger modal for displaying more content.</Text>
        <Text>It's useful for forms or detailed information displays.</Text>
      </Stack>
    )
  }
};