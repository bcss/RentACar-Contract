/**
 * File: client/src/components/layouts/FilterPanel.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2
 * @purpose Reusable filter panel component matching reference design
 * 
 * @behaviour
 *  - Filter groups with labels
 *  - Apply/Clear buttons at bottom
 *  - Supports search fields, dropdowns, checkboxes, radio groups
 */

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MaterialSymbol } from '@/components/MaterialSymbol';

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  showButtons?: boolean;
  className?: string;
}

export function FilterPanel({
  title,
  children,
  onApply,
  onClear,
  showButtons = true,
  className = '',
}: FilterPanelProps) {
  const { t } = useTranslation();
  
  return (
    <div className={`space-y-5 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MaterialSymbol name="filter_list" size="md" />
          {title}
        </h3>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {showButtons && (
        <div className="flex flex-col gap-2 pt-2">
          {onApply && (
            <Button 
              onClick={onApply}
              className="w-full"
              data-testid="button-apply-filters"
            >
              {t('common.apply')}
            </Button>
          )}
          {onClear && (
            <Button 
              onClick={onClear}
              variant="ghost"
              className="w-full"
              data-testid="button-clear-filters"
            >
              {t('common.clear')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ label, children, className = '' }: FilterGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-muted-foreground block">
        {label}
      </label>
      {children}
    </div>
  );
}

interface FilterSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterSearch({ 
  placeholder = 'Search...', 
  value, 
  onChange,
  className = ''
}: FilterSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <MaterialSymbol name="search" size="sm" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        data-testid="input-filter-search"
      />
    </div>
  );
}

export default FilterPanel;
