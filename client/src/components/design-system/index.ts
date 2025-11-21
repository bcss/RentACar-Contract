/**
 * KarāraOS Design System - Reusable Components
 * 
 * This module exports standardized, production-ready UI components
 * for consistent design across the application.
 * 
 * All components include:
 * - Full TypeScript typing
 * - data-testid attributes for testing
 * - Consistent hover/active states
 * - Accessibility support
 */

export { ErrorDisplay, useErrorDisplay } from "./ErrorDisplay";
export { FormSection } from "./FormSection";
export { ActionButtons } from "./ActionButtons";
export { DashboardStatCard } from './DashboardStatCard';
export { StatusBadge } from './StatusBadge';
export { DataTablePattern } from './DataTablePattern';
export { ChartCard } from './ChartCard';
export { FilterPanel } from './FilterPanel';
export { TimelineEvent } from './TimelineEvent';
export { EmptyState } from './EmptyState';
export { LoadingState } from './LoadingState';
export { PageHeader } from './PageHeader';
export { GuidelineBox } from './GuidelineBox';

export type { DashboardStatCardProps } from './DashboardStatCard';
export type { StatusBadgeProps, StatusVariant } from './StatusBadge';
export type { DataTableColumn, DataTablePatternProps } from './DataTablePattern';
export type { ChartCardProps } from './ChartCard';
export type { FilterPanelProps } from './FilterPanel';
export type { TimelineEventProps, TimelineVariant } from './TimelineEvent';
export type { EmptyStateProps } from './EmptyState';
export type { LoadingStateProps } from './LoadingState';
export type { PageHeaderProps } from './PageHeader';
export type { GuidelineBoxProps } from './GuidelineBox';
