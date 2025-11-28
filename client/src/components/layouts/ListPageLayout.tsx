/**
 * File: client/src/components/layouts/ListPageLayout.tsx
 * @area UI Design System
 * @checklist UI Alignment Phase 2
 * @purpose Reusable list page layout matching reference design pattern
 * 
 * @behaviour
 *  - Filter panel on left (collapsible on mobile)
 *  - Main content area with table/grid on right
 *  - Page header with title and action buttons
 *  - Responsive: stacks on smaller screens
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
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {filterPanel && (
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card dark:bg-card rounded-xl border border-card-border p-5 sticky top-24">
              {filterPanel}
            </div>
          </aside>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
            
            {searchBar && (
              <div className="w-full">
                {searchBar}
              </div>
            )}
          </div>
          
          <div className="bg-card dark:bg-card rounded-xl border border-card-border overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPageLayout;
