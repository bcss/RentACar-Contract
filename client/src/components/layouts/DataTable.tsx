/**
 * File: client/src/components/layouts/DataTable.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2 - Reference Design Match
 * @purpose Reusable data table component matching reference design
 * 
 * @behaviour
 *  - Styled table headers (uppercase, smaller text)
 *  - Row hover states with proper dark mode support
 *  - Status badges with rounded-full styling and dot indicators
 *  - Action buttons column
 *  - Pagination footer
 * 
 * @reference ui_design_28_nov_2025/customer_list_screen
 */

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialSymbol } from '@/components/MaterialSymbol';
import { Button } from '@/components/ui/button';

interface Column<T> {
  key: string;
  header: string;
  headerAr?: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage,
  isLoading = false,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  const totalPages = pagination 
    ? Math.ceil(pagination.total / pagination.pageSize) 
    : 1;
  
  const startItem = pagination 
    ? (pagination.page - 1) * pagination.pageSize + 1 
    : 1;
  const endItem = pagination 
    ? Math.min(pagination.page * pagination.pageSize, pagination.total) 
    : data.length;

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" data-testid="data-table">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#1c2127] dark:text-gray-400">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  scope="col"
                  className={`px-6 py-4 font-semibold ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {isRTL && col.headerAr ? col.headerAr : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    {t('common.loading')}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage || t('common.noData')}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    bg-white dark:bg-card 
                    border-b border-gray-200 dark:border-gray-700 
                    hover:bg-gray-50 dark:hover:bg-[#1c2127] 
                    transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  data-testid={`row-${keyExtractor(item, index)}`}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key}
                      className={`px-6 py-4 ${
                        col.align === 'right' ? 'text-right' : 
                        col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render 
                        ? col.render(item, index) 
                        : (item as any)[col.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground">
            {t('common.showing')} <span className="font-semibold text-foreground">{startItem}-{endItem}</span> {t('common.of')} <span className="font-semibold text-foreground">{pagination.total}</span>
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              data-testid="button-prev-page"
            >
              <MaterialSymbol name="chevron_left" size="md" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => pagination.onPageChange(pageNum)}
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              data-testid="button-next-page"
            >
              <MaterialSymbol name="chevron_right" size="md" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const variantStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
};

const dotStyles = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
};

export function StatusBadge({ status, variant = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 
        px-2.5 py-1 
        rounded-full 
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles[variant]}`} />
      {status}
    </span>
  );
}

export function ActionButton({ 
  icon, 
  onClick, 
  title,
  variant = 'ghost'
}: { 
  icon: string; 
  onClick: () => void; 
  title?: string;
  variant?: 'ghost' | 'default' | 'destructive';
}) {
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="h-8 w-8"
    >
      <MaterialSymbol name={icon} size="sm" />
    </Button>
  );
}

export default DataTable;
