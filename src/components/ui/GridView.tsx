import { SimpleGrid, ReactNode, MantineSpacing } from '@mantine/core';

interface GridViewProps {
  children: ReactNode;
  cols?: { base?: number; xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: MantineSpacing;
}

/**
 * A generic grid-based view component that provides consistent styling for grid views across the app
 */
export default function GridView({ 
  children, 
  cols = { base: 1, sm: 2, lg: 3 }, 
  spacing = "md"
}: GridViewProps) {
  return (
    <SimpleGrid cols={cols} spacing={spacing}>
      {children}
    </SimpleGrid>
  );
}