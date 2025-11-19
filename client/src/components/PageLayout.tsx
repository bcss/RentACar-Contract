import { ReactNode } from 'react';
import { layout, typography } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Optional page description/subtitle
   */
  description?: string;
  
  /**
   * Page content
   */
  children: ReactNode;
  
  /**
   * Optional actions to display in header (buttons, etc.)
   */
  actions?: ReactNode;
  
  /**
   * Page width variant
   */
  width?: 'narrow' | 'normal' | 'wide';
  
  /**
   * Additional className for page container
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Reusable page layout component for consistent page structure
 * Provides standard page container, header with title/actions, and content area
 */
export function PageLayout({
  title,
  description,
  children,
  actions,
  width = 'normal',
  className,
  testId = 'page-layout',
}: PageLayoutProps) {
  const widthClass = {
    narrow: layout.pageInnerNarrow,
    normal: layout.pageInner,
    wide: layout.pageInnerWide,
  }[width];
  
  return (
    <div className={cn(layout.pageContainer, className)} data-testid={testId}>
      <div className={widthClass}>
        {/* Page Header */}
        <div className={actions ? layout.pageHeaderWithActions : layout.pageHeader}>
          <div>
            <h1 className={typography.pageTitle} data-testid={`${testId}-title`}>
              {title}
            </h1>
            {description && (
              <p className={typography.pageSubtitle} data-testid={`${testId}-description`}>
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex flex-wrap items-center gap-2" data-testid={`${testId}-actions`}>
              {actions}
            </div>
          )}
        </div>
        
        {/* Page Content */}
        <div className={layout.section} data-testid={`${testId}-content`}>
          {children}
        </div>
      </div>
    </div>
  );
}
