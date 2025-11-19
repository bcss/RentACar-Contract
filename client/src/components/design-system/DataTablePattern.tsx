import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReactNode } from 'react';

export interface DataTableColumn {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, row: any) => ReactNode;
}

export interface DataTablePatternProps {
  columns: DataTableColumn[];
  data: any[];
  testId?: string;
  onRowClick?: (row: any) => void;
}

export function DataTablePattern({ columns, data, testId, onRowClick }: DataTablePatternProps) {
  const isInteractive = !!onRowClick;

  return (
    <Table data-testid={testId || 'table-data'}>
      <TableHeader data-testid={`${testId || 'table'}-header`}>
        <TableRow data-testid={`${testId || 'table'}-header-row`}>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
              data-testid={`header-${column.key}`}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody data-testid={`${testId || 'table'}-body`}>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            className={isInteractive ? 'hover-elevate cursor-pointer' : ''}
            onClick={isInteractive ? () => onRowClick(row) : undefined}
            data-testid={`row-${rowIndex}`}
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                data-testid={`cell-${column.key}-${rowIndex}`}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
