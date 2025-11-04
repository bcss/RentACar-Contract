import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { 
  CheckCircle, XCircle, Database, HardDrive, Users, Car, FileText, Building, Package, 
  Book, HelpCircle, Bug, Mail, AlertCircle, Download, Filter, Check
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface SystemHealth {
  database: {
    status: 'healthy' | 'error';
    message: string;
  };
  counts: {
    users: number;
    customers: number;
    vehicles: number;
    contracts: number;
    activeContracts: number;
    companies: number;
    sponsors: number;
  };
  storage: {
    totalRecords: number;
    estimatedSize: string;
  };
}

interface SystemError {
  id: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  sentToSupport?: boolean;
}

export default function SupportHelpPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: healthData, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
  });

  const { data: errors, isLoading: errorsLoading } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors'],
  });

  // Mutation for marking error as sent to support
  const markSentMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return await apiRequest(`/api/system-errors/${errorId}/mark-sent`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors'] });
      toast({
        title: 'Success',
        description: 'Error marked as sent to support',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark error as sent',
      });
    },
  });

  // Mutation for acknowledging error
  const acknowledgeMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return await apiRequest(`/api/system-errors/${errorId}/acknowledge`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-errors'] });
      toast({
        title: 'Success',
        description: 'Error acknowledged',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to acknowledge error',
      });
    },
  });

  // Filter errors based on date range, status, and search
  const filteredErrors = errors?.filter((error) => {
    // Date filter
    if (startDate || endDate) {
      const errorDate = error.createdAt ? new Date(error.createdAt) : null;
      if (errorDate) {
        if (startDate && errorDate < startDate) return false;
        if (endDate && errorDate > endDate) return false;
      }
    }

    // Status filter - three-state workflow: pending → sent → acknowledged
    if (statusFilter === 'pending' && (error.sentToSupport || error.acknowledged)) return false;
    if (statusFilter === 'sent' && (!error.sentToSupport || error.acknowledged)) return false;
    if (statusFilter === 'acknowledged' && !error.acknowledged) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        error.errorMessage?.toLowerCase().includes(query) ||
        error.errorType?.toLowerCase().includes(query) ||
        error.endpoint?.toLowerCase().includes(query)
      );
    }

    return true;
  }) || [];

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body);
      const link = document.createElement('a');
      link.download = `rccms-screenshot-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({
        title: 'Screenshot captured',
        description: 'Screenshot saved to downloads folder',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Screenshot failed',
        description: 'Unable to capture screenshot',
      });
    }
  };

  const generateEmailBody = (error: SystemError) => {
    const body = `
[RCCMS Error Report]

Error Type: ${error.errorType}
Error Message: ${error.errorMessage}
Endpoint: ${error.endpoint || 'N/A'}
Method: ${error.method || 'N/A'}
Timestamp: ${error.createdAt ? format(new Date(error.createdAt), 'PPpp') : 'N/A'}
IP Address: ${error.ipAddress || 'N/A'}
User Agent: ${error.userAgent || 'N/A'}

Stack Trace:
${error.stackTrace || 'N/A'}

---
Please attach a screenshot if available.
    `.trim();

    return encodeURIComponent(body);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Support & Help</h1>
        <p className="text-muted-foreground">
          System information, documentation, and technical support
        </p>
      </div>

      {/* System Information Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Product</span>
              <span className="text-muted-foreground">RCCMS</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Version</span>
              <Badge variant="outline">1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Release</span>
              <span className="text-muted-foreground">December 2025</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Architecture</span>
              <span className="text-muted-foreground">React + Express</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    {healthData?.database.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          Healthy
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <Badge variant="destructive">Error</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Database</span>
                  <span className="text-muted-foreground">PostgreSQL</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {healthData?.database.message}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Storage & Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              Storage & Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Total Records</span>
                  <Badge variant="secondary">{healthData?.storage.totalRecords.toLocaleString() || '0'}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Est. Size</span>
                  <span className="text-muted-foreground">{healthData?.storage.estimatedSize || 'N/A'}</span>
                </div>
                <div className="pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{healthData?.counts.users || 0} Users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{healthData?.counts.customers || 0} Customers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3 text-muted-foreground" />
                    <span>{healthData?.counts.vehicles || 0} Vehicles</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span>{healthData?.counts.contracts || 0} Contracts</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentation & FAQs */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>Access comprehensive guides and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p>
                <strong>User Guide:</strong> Detailed instructions on using RCCMS features
              </p>
              <p>
                <strong>Admin Guide:</strong> Administrative tasks and system configuration
              </p>
              <p>
                <strong>Feature List:</strong> Complete inventory of all system capabilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>Common Questions</CardTitle>
            </div>
            <CardDescription>Quick answers to frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div>
                <strong>Q: How do I create a new contract?</strong>
                <p className="text-muted-foreground">Click "New Contract" on the dashboard and follow the form workflow.</p>
              </div>
              <div>
                <strong>Q: Can I delete a contract?</strong>
                <p className="text-muted-foreground">No, contracts can only be disabled for data integrity.</p>
              </div>
              <div>
                <strong>Q: How do I export reports?</strong>
                <p className="text-muted-foreground">Use the PDF or Excel export buttons on any report page.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Error Reporter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              <CardTitle>Report System Errors</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={captureScreenshot} data-testid="button-capture-screenshot">
                <Download className="h-4 w-4 mr-2" />
                Capture Screenshot
              </Button>
            </div>
          </div>
          <CardDescription>
            View and report critical system errors to RCCMS support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">From Date</label>
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="Start date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">To Date</label>
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="End date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending Report</SelectItem>
                      <SelectItem value="sent">Sent to Support</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <Input
                    placeholder="Error message, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-errors"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Error List */}
          {errorsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No errors found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((error) => (
                <Card key={error.id} className="border-l-4 border-l-destructive" data-testid={`error-card-${error.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{error.errorType}</Badge>
                          {error.sentToSupport && (
                            <Badge variant="secondary" className="text-xs">
                              Sent to Support
                            </Badge>
                          )}
                          {error.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{error.errorMessage}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {error.endpoint && <p>Endpoint: {error.method} {error.endpoint}</p>}
                          {error.createdAt && <p>Time: {format(new Date(error.createdAt), 'PPpp')}</p>}
                          {error.ipAddress && <p>IP: {error.ipAddress}</p>}
                        </div>
                        {error.stackTrace && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View stack trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {error.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            markSentMutation.mutate(error.id);
                            const mailtoLink = `mailto:support@rccms.com?subject=${encodeURIComponent(`[RCCMS Error] ${error.errorType} - ${error.createdAt ? format(new Date(error.createdAt), 'yyyy-MM-dd HH:mm') : ''}`)}&body=${generateEmailBody(error)}`;
                            window.location.href = mailtoLink;
                          }}
                          disabled={markSentMutation.isPending || error.sentToSupport}
                          data-testid={`button-email-error-${error.id}`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {error.sentToSupport ? 'Sent' : 'Email & Mark Sent'}
                        </Button>
                        {!error.acknowledged && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => acknowledgeMutation.mutate(error.id)}
                            disabled={acknowledgeMutation.isPending}
                            data-testid={`button-acknowledge-error-${error.id}`}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>Core capabilities of RCCMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="font-medium">Bilingual Support</p>
              <p className="text-xs text-muted-foreground">English and Arabic with RTL/LTR layouts</p>
            </div>
            <div>
              <p className="font-medium">Role-Based Access</p>
              <p className="text-xs text-muted-foreground">Admin, Manager, Staff, and Viewer roles</p>
            </div>
            <div>
              <p className="font-medium">Contract Lifecycle</p>
              <p className="text-xs text-muted-foreground">Draft → Confirmed → Active → Completed → Closed</p>
            </div>
            <div>
              <p className="font-medium">Comprehensive Audit</p>
              <p className="text-xs text-muted-foreground">Field-level tracking and system logs</p>
            </div>
            <div>
              <p className="font-medium">Payment Tracking</p>
              <p className="text-xs text-muted-foreground">Multiple payment methods with validation</p>
            </div>
            <div>
              <p className="font-medium">Advanced Reports</p>
              <p className="text-xs text-muted-foreground">Financial, operational, and analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
