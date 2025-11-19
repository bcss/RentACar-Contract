/**
 * RCCMS Design System - Reusable Components
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

export type { DashboardStatCardProps } from './DashboardStatCard';
export type { StatusBadgeProps, StatusVariant } from './StatusBadge';
