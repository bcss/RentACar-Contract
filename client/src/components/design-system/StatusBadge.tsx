import { Badge } from '@/components/ui/badge';
import { LucideIcon, CheckCircle, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react';

export type StatusVariant = 
  | 'draft' | 'active' | 'completed' | 'closed'
  | 'pending' | 'paid' | 'overdue' 
  | 'low' | 'medium' | 'high' | 'very_high'
  | 'success' | 'warning' | 'danger' | 'info';

export interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  icon?: LucideIcon;
  testId?: string;
}

const statusConfig: Record<StatusVariant, { className: string; defaultIcon: LucideIcon }> = {
  // Contract statuses
  draft: {
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover-elevate',
    defaultIcon: FileText,
  },
  active: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate',
    defaultIcon: CheckCircle,
  },
  completed: {
    className: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover-elevate',
    defaultIcon: CheckCircle,
  },
  closed: {
    className: 'bg-slate-100 text-slate-700 border-slate-200 hover-elevate',
    defaultIcon: XCircle,
  },
  
  // Payment statuses
  pending: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover-elevate',
    defaultIcon: Clock,
  },
  paid: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate',
    defaultIcon: CheckCircle,
  },
  overdue: {
    className: 'bg-rose-100 text-rose-700 border-rose-200 hover-elevate',
    defaultIcon: AlertTriangle,
  },
  
  // Risk levels
  low: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate',
    defaultIcon: CheckCircle,
  },
  medium: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover-elevate',
    defaultIcon: AlertTriangle,
  },
  high: {
    className: 'bg-orange-100 text-orange-700 border-orange-200 hover-elevate',
    defaultIcon: AlertTriangle,
  },
  very_high: {
    className: 'bg-rose-100 text-rose-700 border-rose-200 hover-elevate',
    defaultIcon: AlertTriangle,
  },
  
  // Generic statuses
  success: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover-elevate',
    defaultIcon: CheckCircle,
  },
  warning: {
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover-elevate',
    defaultIcon: AlertTriangle,
  },
  danger: {
    className: 'bg-rose-100 text-rose-700 border-rose-200 hover-elevate',
    defaultIcon: XCircle,
  },
  info: {
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover-elevate',
    defaultIcon: FileText,
  },
};

/**
 * Reusable Status Badge Component
 * 
 * Consistent badge styling for different status types with color-coded semantics.
 * Automatically applies correct colors and icons based on status variant.
 * 
 * Color Standards:
 * - Green (Emerald): Success, Active, Low Risk, Paid
 * - Blue (Cyan/Sky): Info, Draft, Completed
 * - Yellow (Amber): Warning, Pending, Medium Risk
 * - Red (Rose): Danger, Failed, Overdue, High/Very High Risk
 * - Gray (Slate): Inactive, Closed
 * 
 * @example
 * <StatusBadge variant="active" label="Active" testId="contract-status" />
 * <StatusBadge variant="overdue" label="Overdue" icon={AlertTriangle} testId="payment-status" />
 */
export function StatusBadge({ 
  variant, 
  label, 
  icon, 
  testId = 'status-badge' 
}: StatusBadgeProps) {
  const config = statusConfig[variant];
  const Icon = icon || config.defaultIcon;

  return (
    <Badge 
      variant="default" 
      className={config.className}
      data-testid={`badge-${testId}-${variant}`}
    >
      <Icon className="mr-1 h-3 w-3" data-testid={`icon-${testId}`} />
      <span data-testid={`label-${testId}`}>{label}</span>
    </Badge>
  );
}
