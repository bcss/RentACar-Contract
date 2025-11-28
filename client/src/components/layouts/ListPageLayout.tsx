/**
 * File: client/src/components/layouts/ListPageLayout.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2 - Reference Design Match
 * @purpose Reusable list page layout matching reference design pattern
 * 
 * @behaviour
 *  - Page header at top with title and action button
 *  - Filter panel on left (w-72, sticky)
 *  - Main content area with table/grid on right
 *  - Responsive: stacks on smaller screens
 * 
 * @reference ui_design_28_nov_2025/customer_list_screen
 */

import { ReactNode } from 'react';

interface ListPageLayoutProps {
  title: string;
  titleAr?: string;
  subtitle?: string;
  actionButton?: ReactNode;
  filterPanel?: ReactNode;
  children: ReactNode;
  searchBar?: ReactNode;
  className?: string;
}

export function ListPageLayout({
  title,
  titleAr,
  subtitle,
  actionButton,
  filterPanel,
  children,
  searchBar,
  className = '',
}: ListPageLayoutProps) {
  return (
    <div className={`p-6 lg:p-8 ${className}`}>
      {/* Page Header - Title and Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 
            className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-foreground"
            data-testid="text-page-title"
          >
            {title}
            {titleAr && (
              <span className="text-muted-foreground text-lg font-normal ltr:ml-2 rtl:mr-2">
                {titleAr}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {actionButton && (
          <div className="flex-shrink-0">
            {actionButton}
          </div>
        )}
      </div>
      
      {/* Main Content Area - Filter + Table */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {filterPanel && (
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-card rounded-xl p-5 space-y-5 sticky top-6">
              {filterPanel}
            </div>
          </aside>
        )}
        
        <div className="flex-1 min-w-0 overflow-x-auto">
          {searchBar && (
            <div className="w-full mb-4">
              {searchBar}
            </div>
          )}
          
          <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPageLayout;
