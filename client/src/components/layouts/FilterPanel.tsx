/**
 * File: client/src/components/layouts/FilterPanel.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2 - Reference Design Match
 * @purpose Reusable filter panel component matching reference design
 * 
 * @behaviour
 *  - Filter groups with labels (text-muted-foreground)
 *  - Apply/Clear buttons at bottom
 *  - Supports search fields, dropdowns, checkboxes, radio groups
 * 
 * @reference ui_design_28_nov_2025/customer_list_screen
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
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
      )}
      
      <div className="space-y-5">
        {children}
      </div>
      
      {showButtons && (onApply || onClear) && (
        <div className="flex flex-col gap-3 pt-2">
          {onApply && (
            <Button 
              onClick={onApply}
              className="w-full h-10 rounded-lg"
              data-testid="button-apply-filters"
            >
              {t('common.apply')}
            </Button>
          )}
          {onClear && (
            <Button 
              onClick={onClear}
              variant="secondary"
              className="w-full h-10 rounded-lg bg-gray-200 dark:bg-[#283039] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#3b4754]"
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
    <div className={`${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground pb-2 block">
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
      <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground">
        <MaterialSymbol name="search" size="sm" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-3 rtl:pl-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-[#1c2127] text-sm text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        data-testid="input-filter-search"
      />
    </div>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-[#1c2127] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      data-testid="select-filter"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

interface FilterRadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function FilterRadioGroup({
  name,
  value,
  onChange,
  options,
  className = ''
}: FilterRadioGroupProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            value === opt.value 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 dark:border-[#3b4754] hover:border-gray-400 dark:hover:border-[#4a5968]'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-2 border-gray-300 dark:border-[#3b4754] accent-primary"
          />
          <span className="text-sm font-medium text-foreground">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export default FilterPanel;
