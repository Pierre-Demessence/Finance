import type { Meta, StoryObj } from '@storybook/react';
import Navigation from './Navigation';

const meta = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div style={{ padding: '20px' }}>Main content area</div>
  }
};

// To make this story work properly, we need to mock the Next.js router context
// This is a simplified version for the story display
Navigation.displayName = 'Navigation';