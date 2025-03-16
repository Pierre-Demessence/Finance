import { Card, Table, ReactNode } from '@mantine/core';

interface ListViewProps {
  headers: string[];
  children: ReactNode;
  withBorder?: boolean;
  mb?: string | number;
}

/**
 * A generic table-based list view component that provides consistent styling for list views across the app
 */
export default function ListView({ 
  headers, 
  children,
  withBorder = true,
  mb = 'md'
}: ListViewProps) {
  return (
    <Card withBorder={withBorder} mb={mb}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {headers.map((header, index) => (
              <Table.Th key={index}>{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {children}
        </Table.Tbody>
      </Table>
    </Card>
  );
}