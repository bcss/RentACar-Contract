import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunicationLog } from "@shared/schema";
import { Mail, Phone, Search, Download, Filter, CheckCircle2, XCircle, Clock, Send } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function CommunicationLogs() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery<CommunicationLog[]>({
    queryKey: ['/api/communication-logs'],
  });

  // Filter logs based on search and filters
  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.subject && log.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesChannel = channelFilter === "all" || log.channel === channelFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleExport = () => {
    if (!filteredLogs) return;

    const csv = [
      ['Date', 'Channel', 'Recipient', 'Subject', 'Status', 'Provider', 'Message'].join(','),
      ...filteredLogs.map(log => [
        log.createdAt ? format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm') : '',
        log.channel,
        log.recipient,
        log.subject || '',
        log.status,
        log.providerName || '',
        `"${log.message.replace(/"/g, '""')}"` // Escape quotes in CSV
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> {t('communications.logStatusDelivered')}</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-600"><Send className="w-3 h-3 mr-1" /> {t('communications.logStatusSent')}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> {t('communications.logStatusFailed')}</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {t('communications.logStatusPending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'email' 
      ? <Mail className="w-4 h-4 text-blue-600" />
      : <Phone className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-communication-logs">
          {t('communications.logs')}
        </h1>
        <p className="text-muted-foreground">
          {t('communications.logsDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('communications.messageHistory')}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={!filteredLogs || filteredLogs.length === 0}
                data-testid="button-export-logs"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('common.exportCSV')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('communications.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-logs"
                />
              </div>
            </div>
            <div>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger data-testid="select-channel-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('communications.logChannel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('communications.allChannels')}</SelectItem>
                  <SelectItem value="sms">{t('communications.smsOnly')}</SelectItem>
                  <SelectItem value="email">{t('communications.emailOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('communications.logStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('communications.allStatus')}</SelectItem>
                  <SelectItem value="delivered">{t('communications.logStatusDelivered')}</SelectItem>
                  <SelectItem value="sent">{t('communications.logStatusSent')}</SelectItem>
                  <SelectItem value="failed">{t('communications.logStatusFailed')}</SelectItem>
                  <SelectItem value="pending">{t('communications.logStatusPending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`log-entry-${log.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getChannelIcon(log.channel)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(log.status)}
                          <span className="text-sm text-muted-foreground">
                            {log.createdAt && format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{log.recipient}</span>
                          {log.providerName && (
                            <Badge variant="outline" className="text-xs">
                              {t('communications.via')} {log.providerName}
                            </Badge>
                          )}
                        </div>
                        {log.subject && (
                          <p className="text-sm font-medium mb-1">{log.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {log.message}
                        </p>
                        {log.failureReason && (
                          <p className="text-sm text-destructive mt-2">
                            <strong>{t('common.error')}:</strong> {log.failureReason}
                          </p>
                        )}
                        {log.sentAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('communications.sentAt')}: {format(new Date(log.sentAt), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        )}
                        {log.deliveredAt && (
                          <p className="text-xs text-muted-foreground">
                            {t('communications.deliveredAt')}: {format(new Date(log.deliveredAt), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('communications.noLogs')}</p>
              {(searchTerm || channelFilter !== "all" || statusFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchTerm("");
                    setChannelFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-2"
                  data-testid="button-clear-filters"
                >
                  {t('common.clearFilters')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
