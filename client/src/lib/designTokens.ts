/**
 * RCCMS Design System Tokens
 * Centralized design system for consistent UI theming
 * All components should reference these tokens instead of hardcoded values
 */

// ============================================================================
// SPACING SYSTEM
// ============================================================================
export const spacing = {
  xs: '0.25rem',   // 4px  - Minimal spacing
  sm: '0.5rem',    // 8px  - Small spacing
  md: '1rem',      // 16px - Medium spacing (default)
  lg: '1.5rem',    // 24px - Large spacing
  xl: '2rem',      // 32px - Extra large spacing
  '2xl': '3rem',   // 48px - 2X large spacing
  '3xl': '4rem',   // 64px - 3X large spacing
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  // Page-level headings
  pageTitle: 'text-3xl font-bold',
  pageSubtitle: 'text-muted-foreground mt-1',
  
  // Section headings
  sectionTitle: 'text-2xl font-semibold',
  sectionSubtitle: 'text-lg font-medium text-muted-foreground',
  
  // Component headings
  cardTitle: 'text-lg font-semibold',
  cardDescription: 'text-sm text-muted-foreground',
  
  // Body text
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  
  // Utility text
  caption: 'text-sm text-muted-foreground',
  label: 'text-sm font-medium',
  help: 'text-xs text-muted-foreground',
  
  // Special text
  mono: 'font-mono text-sm',
  error: 'text-sm text-destructive',
  success: 'text-sm text-green-600 dark:text-green-400',
} as const;

// ============================================================================
// LAYOUT PATTERNS
// ============================================================================
export const layout = {
  // Page containers
  pageContainer: 'h-full overflow-auto',
  pageInner: 'max-w-6xl mx-auto p-6',
  pageInnerWide: 'max-w-7xl mx-auto p-6',
  pageInnerNarrow: 'max-w-4xl mx-auto p-6',
  
  // Page header
  pageHeader: 'mb-6',
  pageHeaderWithActions: 'mb-6 flex flex-wrap items-start justify-between gap-4',
  
  // Section spacing
  section: 'space-y-6',
  sectionTight: 'space-y-4',
  sectionLoose: 'space-y-8',
  
  // Grid layouts
  grid2Col: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  grid3Col: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  grid4Col: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  gridAuto: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Flex layouts
  flexRow: 'flex flex-wrap items-center gap-2',
  flexCol: 'flex flex-col gap-4',
  flexBetween: 'flex flex-wrap items-center justify-between gap-4',
  
  // Content areas
  contentArea: 'space-y-4',
  contentAreaTight: 'space-y-2',
} as const;

// ============================================================================
// CARD PATTERNS
// ============================================================================
export const card = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  header: 'flex flex-col space-y-1.5 p-6',
  headerWithActions: 'flex flex-wrap items-start justify-between gap-4 p-6',
  content: 'p-6 pt-0',
  contentNoPadding: '',
  footer: 'flex items-center justify-end gap-2 p-6 pt-0',
  footerBetween: 'flex flex-wrap items-center justify-between gap-2 p-6 pt-0',
} as const;

// ============================================================================
// BUTTON PATTERNS
// ============================================================================
export const button = {
  // Size variants
  sizeSmall: 'h-8 px-3 text-sm',
  sizeMedium: 'h-9 px-4 text-sm',
  sizeLarge: 'h-10 px-8 text-base',
  sizeIcon: 'h-9 w-9',
  
  // Common button groups
  actionGroup: 'flex flex-wrap items-center gap-2',
  actionGroupEnd: 'flex flex-wrap items-center justify-end gap-2',
} as const;

// ============================================================================
// FORM PATTERNS
// ============================================================================
export const form = {
  // Form containers
  formSection: 'space-y-4',
  formSectionTight: 'space-y-2',
  
  // Field layouts
  fieldRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  field3Col: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  fieldGroup: 'space-y-2',
  
  // Field elements
  label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  input: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
  textarea: 'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
  
  // Helper text
  description: 'text-sm text-muted-foreground',
  error: 'text-sm font-medium text-destructive',
} as const;

// ============================================================================
// TABLE PATTERNS
// ============================================================================
export const table = {
  container: 'relative w-full overflow-auto',
  wrapper: 'rounded-md border',
  base: 'w-full caption-bottom text-sm',
  
  header: 'border-b bg-muted/50',
  headerRow: '[&_tr]:border-b',
  headerCell: 'h-10 px-4 text-left align-middle font-medium text-muted-foreground',
  
  body: '[&_tr:last-child]:border-0',
  bodyRow: 'border-b transition-colors hover:bg-muted/50',
  bodyCell: 'p-4 align-middle',
  
  // Table utilities
  cellCentered: 'text-center',
  cellRight: 'text-right',
  cellNowrap: 'whitespace-nowrap',
} as const;

// ============================================================================
// BADGE PATTERNS
// ============================================================================
export const badge = {
  // Status badges
  statusSuccess: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  statusWarning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  statusError: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  statusInfo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  statusNeutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  
  // Risk level badges
  riskLow: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  riskMedium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  riskHigh: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  riskCritical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
} as const;

// ============================================================================
// DASHBOARD PATTERNS
// ============================================================================
export const dashboard = {
  // KPI Cards
  kpiCard: 'rounded-lg border bg-card p-6',
  kpiTitle: 'text-sm font-medium text-muted-foreground',
  kpiValue: 'text-2xl font-bold',
  kpiChange: 'text-xs text-muted-foreground mt-1',
  kpiIcon: 'h-4 w-4 text-muted-foreground',
  
  // Chart containers
  chartCard: 'rounded-lg border bg-card p-6',
  chartTitle: 'text-lg font-semibold mb-4',
  chartContainer: 'h-[300px] w-full',
  chartContainerLarge: 'h-[400px] w-full',
  chartContainerSmall: 'h-[200px] w-full',
  
  // Dashboard grid
  dashboardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
  dashboardGrid2: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  dashboardGrid3: 'grid grid-cols-1 lg:grid-cols-3 gap-4',
  
  // Widget containers
  widget: 'rounded-lg border bg-card p-4',
  widgetHeader: 'flex items-center justify-between mb-3',
  widgetTitle: 'font-medium',
  widgetContent: 'space-y-2',
} as const;

// ============================================================================
// STAT PATTERNS
// ============================================================================
export const stats = {
  container: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  card: 'rounded-lg border bg-card p-6',
  label: 'text-sm font-medium text-muted-foreground',
  value: 'text-2xl font-bold mt-2',
  change: 'text-sm mt-2 flex items-center gap-1',
  changePositive: 'text-green-600 dark:text-green-400',
  changeNegative: 'text-red-600 dark:text-red-400',
  changeNeutral: 'text-muted-foreground',
} as const;

// ============================================================================
// EMPTY STATE PATTERNS
// ============================================================================
export const emptyState = {
  container: 'flex flex-col items-center justify-center py-12 text-center',
  icon: 'h-12 w-12 text-muted-foreground mb-4',
  title: 'text-lg font-medium mb-2',
  description: 'text-sm text-muted-foreground mb-4',
  action: 'mt-4',
} as const;

// ============================================================================
// LOADING STATE PATTERNS
// ============================================================================
export const loading = {
  container: 'flex items-center justify-center py-12',
  spinner: 'h-8 w-8 animate-spin text-muted-foreground',
  skeleton: 'animate-pulse bg-muted rounded',
  skeletonText: 'h-4 bg-muted rounded',
  skeletonCard: 'h-24 bg-muted rounded-lg',
} as const;

// ============================================================================
// ALERT PATTERNS
// ============================================================================
export const alert = {
  base: 'relative w-full rounded-lg border px-4 py-3 text-sm',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive',
  warning: 'border-yellow-500/50 text-yellow-900 dark:text-yellow-200',
  success: 'border-green-500/50 text-green-900 dark:text-green-200',
  info: 'border-blue-500/50 text-blue-900 dark:text-blue-200',
} as const;

// ============================================================================
// DIALOG PATTERNS
// ============================================================================
export const dialog = {
  overlay: 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
  content: 'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
  header: 'flex flex-col space-y-1.5 text-center sm:text-left',
  footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  title: 'text-lg font-semibold leading-none tracking-tight',
  description: 'text-sm text-muted-foreground',
} as const;

// ============================================================================
// FILTER PATTERNS
// ============================================================================
export const filter = {
  container: 'rounded-lg border bg-card p-4 mb-6',
  grid: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4',
  actions: 'flex flex-wrap items-center gap-2 mt-4',
} as const;

// ============================================================================
// PAGINATION PATTERNS
// ============================================================================
export const pagination = {
  container: 'flex items-center justify-between px-2 mt-4',
  info: 'text-sm text-muted-foreground',
  controls: 'flex items-center gap-2',
} as const;

// ============================================================================
// UTILITY CLASSES
// ============================================================================
export const utility = {
  truncate: 'truncate',
  srOnly: 'sr-only',
  visuallyHidden: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  noScrollbar: 'scrollbar-hide',
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS (for reference in className strings)
// ============================================================================
export const breakpoints = {
  sm: '640px',   // Tailwind's sm breakpoint
  md: '768px',   // Tailwind's md breakpoint
  lg: '1024px',  // Tailwind's lg breakpoint
  xl: '1280px',  // Tailwind's xl breakpoint
  '2xl': '1536px', // Tailwind's 2xl breakpoint
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
/*
import { layout, typography, card, button } from '@/lib/designTokens';

// Page layout
<div className={layout.pageContainer}>
  <div className={layout.pageInner}>
    <div className={layout.pageHeader}>
      <h1 className={typography.pageTitle}>Page Title</h1>
      <p className={typography.pageSubtitle}>Page description</p>
    </div>
    
    <div className={layout.section}>
      <Card>
        <CardHeader className={card.header}>
          <CardTitle className={typography.cardTitle}>Card Title</CardTitle>
        </CardHeader>
        <CardContent className={card.content}>
          Content here
        </CardContent>
        <CardFooter className={card.footer}>
          <Button className={button.sizeMedium}>Action</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</div>
*/
