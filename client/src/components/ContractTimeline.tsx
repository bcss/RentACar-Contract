import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Edit, User, Clock, CheckCircle, PlayCircle, XCircle, Lock, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Contract } from '@shared/schema';

interface ContractEdit {
  id: string;
  contractId: string;
  editedBy: string;
  editedAt: string;
  editReason: string;
  changesSummary: string;
  fieldsBefore: any;
  fieldsAfter: any;
  ipAddress: string;
  editorUsername: string;
  editorFirstName: string | null;
  editorLastName: string | null;
}

interface ContractAuditLog {
  id: string;
  userId: string;
  action: string;
  contractId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'edited' | 'confirm' | 'activate' | 'complete' | 'close' | 'print' | 'other';
  timestamp: Date;
  user: string;
  username: string;
  description: string;
  details?: string;
}

interface ContractTimelineProps {
  contract: Contract;
  creatorUsername?: string;
  creatorName?: string;
}

export function ContractTimeline({ contract, creatorUsername, creatorName }: ContractTimelineProps) {
  const { t } = useTranslation();

  const { data: edits, isLoading: editsLoading } = useQuery<ContractEdit[]>({
    queryKey: ['/api/contracts', contract.id, 'edits'],
    enabled: !!contract.id,
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<ContractAuditLog[]>({
    queryKey: ['/api/contracts', contract.id, 'audit-logs'],
    enabled: !!contract.id,
  });

  const isLoading = editsLoading || logsLoading;

  if (isLoading) {
    return (
      <Card data-testid="contract-timeline-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('Contract Timeline')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Build timeline events
  const events: TimelineEvent[] = [];

  // Add creation event from audit logs (if available) or contract.createdAt
  const creationLog = auditLogs?.find((log) => log.action === 'create');
  if (creationLog) {
    const displayName = creationLog.firstName && creationLog.lastName
      ? `${creationLog.firstName} ${creationLog.lastName}`
      : creationLog.username;
    events.push({
      id: creationLog.id,
      type: 'created',
      timestamp: new Date(creationLog.createdAt),
      user: displayName,
      username: creationLog.username,
      description: t('Contract Created'),
      details: creationLog.details,
    });
  } else if (contract.createdAt) {
    const displayName = creatorName || creatorUsername || 'Unknown User';
    events.push({
      id: `created-${contract.id}`,
      type: 'created',
      timestamp: new Date(contract.createdAt),
      user: displayName,
      username: creatorUsername || '',
      description: t('Contract Created'),
      details: `Contract #${contract.contractNumber} created`,
    });
  }

  // Add lifecycle events from audit logs
  if (auditLogs && auditLogs.length > 0) {
    auditLogs.forEach((log) => {
      // Skip create action as it's already handled above
      if (log.action === 'create') return;

      const userName = log.firstName && log.lastName
        ? `${log.firstName} ${log.lastName}`
        : log.username;

      let eventType: TimelineEvent['type'] = 'other';
      let description = '';

      // Map audit log actions to timeline event types
      switch (log.action) {
        case 'confirm':
          eventType = 'confirm';
          description = t('Contract Confirmed');
          break;
        case 'activate':
          eventType = 'activate';
          description = t('Contract Activated');
          break;
        case 'complete':
          eventType = 'complete';
          description = t('Contract Completed');
          break;
        case 'close':
          eventType = 'close';
          description = t('Contract Closed');
          break;
        case 'print':
          eventType = 'print';
          description = t('Contract Printed');
          break;
        case 'edit':
          // Edit actions are handled separately from contract_edits table
          eventType = 'other';
          description = t('Contract Activity');
          break;
        default:
          eventType = 'other';
          description = log.action.charAt(0).toUpperCase() + log.action.slice(1);
      }

      events.push({
        id: log.id,
        type: eventType,
        timestamp: new Date(log.createdAt),
        user: userName,
        username: log.username,
        description,
        details: log.details,
      });
    });
  }

  // Add edit events from contract_edits table
  if (edits && edits.length > 0) {
    edits.forEach((edit) => {
      const editorName = edit.editorFirstName && edit.editorLastName
        ? `${edit.editorFirstName} ${edit.editorLastName}`
        : edit.editorUsername;
      
      events.push({
        id: `edit-${edit.id}`,
        type: 'edited',
        timestamp: new Date(edit.editedAt),
        user: editorName,
        username: edit.editorUsername,
        description: t('Contract Edited'),
        details: edit.editReason,
      });
    });
  }

  // Sort events by timestamp (newest first)
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return <FileText className="w-5 h-5 text-primary" />;
      case 'edited':
        return <Edit className="w-5 h-5 text-amber-600" />;
      case 'confirm':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'activate':
        return <PlayCircle className="w-5 h-5 text-green-600" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'close':
        return <Lock className="w-5 h-5 text-slate-600" />;
      case 'print':
        return <Printer className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getEventBadgeVariant = (type: TimelineEvent['type']): 'default' | 'secondary' | 'outline' => {
    switch (type) {
      case 'created':
      case 'confirm':
      case 'activate':
        return 'default';
      case 'edited':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (events.length === 0) {
    return (
      <Card data-testid="contract-timeline-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('Contract Timeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('No timeline events available')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="contract-timeline">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t('Contract Timeline')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />
          
          {/* Timeline events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="relative flex gap-4"
                data-testid={`timeline-event-${event.type}`}
              >
                {/* Icon circle */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-card">
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventBadgeVariant(event.type)} data-testid={`badge-${event.type}`}>
                          {event.description}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{event.user}</span>
                        {event.username && (
                          <span className="text-xs text-muted-foreground">@{event.username}</span>
                        )}
                      </div>

                      {event.details && (
                        <p className="text-sm text-muted-foreground italic" data-testid={`event-details-${index}`}>
                          "{event.details}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
