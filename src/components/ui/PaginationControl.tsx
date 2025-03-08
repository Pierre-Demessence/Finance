import { Flex, Pagination, NativeSelect } from '@mantine/core';
import React from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: { value: string; label: string }[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * A standardized pagination component with page size selection.
 * Used for consistent pagination UI across tables and lists.
 */
export default function PaginationControl({ 
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange
}: PaginationControlProps) {
  return (
    <Flex justify="center" mt="md" align="center" gap="md">
      <Pagination 
        value={currentPage} 
        onChange={onPageChange}
        total={totalPages} 
      />
      <NativeSelect
        data={pageSizeOptions}
        value={pageSize.toString()}
        onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
        style={{ width: '130px' }}
      />
    </Flex>
  );
}