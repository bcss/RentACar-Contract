import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'wouter';
import { 
  CheckCircle, XCircle, Database, HardDrive, Users, Car, FileText, Building, Package, 
  Book, HelpCircle, Bug, Mail, AlertCircle, Download, Filter, Check, Camera, BookOpen, Shield, List
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resendReason, setResendReason] = useState('');
  const [resendErrorId, setResendErrorId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState('q1');

  const questions = {
    q1: {
      question: 'How do I create a new contract?',
      answer: 'Click "New Contract" from the dashboard or Contracts page. Fill in customer details, select a vehicle, set rental dates, configure addons, and save as draft. You can edit it until you confirm the contract.'
    },
    q2: {
      question: 'Can I delete a contract?',
      answer: 'No, contracts cannot be deleted for data integrity and compliance. Instead, you can disable contracts which hides them from active views while preserving the audit trail.'
    },
    q3: {
      question: 'How do I export reports?',
      answer: 'Navigate to Reports section, select your report type, apply filters if needed, then use the PDF or Excel export buttons. Each report exports with descriptive filenames.'
    },
    q4: {
      question: 'What payment methods are supported?',
      answer: 'RCCMS supports Cash, Credit/Debit Card, Check, and Bank Transfer. Each method has specific required fields (e.g., cheque number for checks, last 4 digits for cards).'
    },
    q5: {
      question: 'How do vehicle inspections work?',
      answer: 'Two inspections are required: pre-delivery (before activating contract) and post-return (before completing contract). Each requires 6 photos from different angles, odometer reading, fuel level, and condition notes.'
    },
    q6: {
      question: 'What are the user roles and permissions?',
      answer: 'Four roles: Admin (full access), Manager (business operations), Staff (daily operations), Viewer (read-only). Additional toggles available: Reports Access, Close Contracts, View All Contracts.'
    },
    q7: {
      question: 'How do I switch between English and Arabic?',
      answer: 'Use the language toggle button in the header. The system supports full bilingual display with automatic RTL/LTR layout switching.'
    },
    q8: {
      question: 'What happens when a contract is completed early?',
      answer: 'If you complete a contract before the rental end date, a dialog will appear asking for the early closure reason. This is logged in the contract timeline for audit purposes.'
    },
  };

  const { data: healthData, isLoading: healthLoading} = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
  });

  const { data: errors, isLoading: errorsLoading } = useQuery<SystemError[]>({
    queryKey: ['/api/system-errors'],
  });

  // Mutation for marking error as sent to support
  const markSentMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return await apiRequest('POST', `/api/system-errors/${errorId}/mark-sent`);
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
      return await apiRequest('POST', `/api/system-errors/${errorId}/acknowledge`);
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

  const generateEmailBody = (error: SystemError, reason?: string) => {
    const body = `
[RCCMS Error Report${reason ? ' - RESEND' : ''}]

${reason ? `RESEND REASON: ${reason}\n\n` : ''}Error Type: ${error.errorType}
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

  const handleResendWithReason = () => {
    if (!resendErrorId || !resendReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a reason for resending',
      });
      return;
    }

    const error = errors?.find(e => e.id === resendErrorId);
    if (!error) return;

    const mailtoLink = `mailto:support@rccms.com?subject=${encodeURIComponent(`[RCCMS Error - RESEND] ${error.errorType} - ${error.createdAt ? format(new Date(error.createdAt), 'yyyy-MM-dd HH:mm') : ''}`)}&body=${generateEmailBody(error, resendReason)}`;
    window.location.href = mailtoLink;

    setResendReason('');
    setResendErrorId(null);

    toast({
      title: 'Email Prepared',
      description: 'Error re-sent with reason to support',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header with Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Support & Help</h1>
          <p className="text-muted-foreground">
            System information, documentation, and technical support
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={captureScreenshot} 
          data-testid="button-capture-screenshot"
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Capture Screenshot
        </Button>
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

      {/* User Guide - Direct Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>User Guide</CardTitle>
          </div>
          <CardDescription>Comprehensive guide for using RCCMS features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <section>
            <h3 className="font-semibold text-base mb-2">Getting Started</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Login with your credentials provided by your administrator</li>
              <li>Navigate using the sidebar menu on the left</li>
              <li>Dashboard provides quick overview of active rentals and metrics</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">Managing Contracts</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Creating:</strong> Click "New Contract" from dashboard or Contracts page</li>
              <li><strong>Editing:</strong> Contracts can be edited in draft status only</li>
              <li><strong>Workflow:</strong> Draft → Confirmed → Active → Completed → Closed</li>
              <li><strong>Timeline:</strong> View full contract history and audit trail</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">Payments & Invoicing</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Record payments with multiple methods (Cash, Card, Check, Bank Transfer)</li>
              <li>Track payment history for each contract</li>
              <li>Final payment required before closing contracts</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">Vehicle Inspections</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Pre-delivery inspection required before activating contract</li>
              <li>Post-return inspection required before completing contract</li>
              <li>6 mandatory photos from different angles</li>
              <li>Record odometer, fuel level, and condition notes</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      {/* Admin Guide - Direct Display (Admin/Manager Only) */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Admin Guide</CardTitle>
            </div>
            <CardDescription>Administrative tasks and system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">User Management</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Create and manage user accounts with role-based access</li>
                <li>Roles: Admin, Manager, Staff, Viewer</li>
                <li>Permission toggles: Reports Access, Close Contracts, View All Contracts</li>
                <li>Disable/enable users without deleting data</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">Company Settings</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Configure bilingual company information (English/Arabic)</li>
                <li>Set default contract clauses and terms</li>
                <li>Manage company logo and branding</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">Financial Settings</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Configure rental rates and pricing tiers</li>
                <li>Set addon fees (GPS, child seat, insurance, etc.)</li>
                <li>Fuel pricing configuration per type</li>
                <li>Mileage limits and extra charges</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-base mb-2">Audit & Compliance</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>System audit logs for security tracking</li>
                <li>Business operations audit for contract changes</li>
                <li>Enhanced error reporter with email workflow</li>
                <li>Export audit logs for compliance reporting</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      )}

      {/* Feature List - Direct Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <CardTitle>Feature List</CardTitle>
          </div>
          <CardDescription>Complete inventory of all system capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <section>
            <h3 className="font-semibold text-base mb-2">Core Features</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Bilingual support (English/Arabic) with RTL/LTR layouts</li>
              <li>Comprehensive contract lifecycle management</li>
              <li>Role-based access control with granular permissions</li>
              <li>Payment tracking with multiple methods</li>
              <li>Vehicle inspection with photo documentation</li>
              <li>Master data management (Customers, Vehicles, Sponsors, Companies)</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">Advanced Features</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Automatic fuel charge calculation</li>
              <li>Vehicle status synchronization with contract lifecycle</li>
              <li>Early closure with reason tracking</li>
              <li>Duplicate phone validation for customers</li>
              <li>Contract timeline with full edit history</li>
              <li>Professional PDF generation for contracts</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">Reporting & Analytics</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Dashboard with context-aware navigation</li>
              <li>Vehicle utilization reports</li>
              <li>Contract status analytics</li>
              <li>Extra charges reporting</li>
              <li>PDF and Excel export functionality</li>
              <li>Chart visualization with Recharts</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-base mb-2">System Features</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Dual audit trail system (System & Business Operations)</li>
              <li>Enhanced error reporter with email workflow</li>
              <li>System health monitoring</li>
              <li>Dark/Light theme support</li>
              <li>Responsive design for all devices</li>
              <li>Route-based lazy loading for performance</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      {/* Documentation & FAQs */}
      <div className="grid gap-6 md:grid-cols-1">

        {/* Common Questions with Dropdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>Common Questions</CardTitle>
            </div>
            <CardDescription>Quick answers to frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Select a Question</label>
              <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                <SelectTrigger data-testid="select-common-question">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">How do I create a new contract?</SelectItem>
                  <SelectItem value="q2">Can I delete a contract?</SelectItem>
                  <SelectItem value="q3">How do I export reports?</SelectItem>
                  <SelectItem value="q4">What payment methods are supported?</SelectItem>
                  <SelectItem value="q5">How do vehicle inspections work?</SelectItem>
                  <SelectItem value="q6">What are the user roles and permissions?</SelectItem>
                  <SelectItem value="q7">How do I switch between English and Arabic?</SelectItem>
                  <SelectItem value="q8">What happens when a contract is completed early?</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  {questions[selectedQuestion as keyof typeof questions].answer}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Critical Error Reporter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-destructive" />
            <CardTitle>Report System Errors</CardTitle>
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
                        {!error.sentToSupport ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              markSentMutation.mutate(error.id);
                              const mailtoLink = `mailto:support@rccms.com?subject=${encodeURIComponent(`[RCCMS Error] ${error.errorType} - ${error.createdAt ? format(new Date(error.createdAt), 'yyyy-MM-dd HH:mm') : ''}`)}&body=${generateEmailBody(error)}`;
                              window.location.href = mailtoLink;
                            }}
                            disabled={markSentMutation.isPending}
                            data-testid={`button-email-error-${error.id}`}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email & Mark Sent
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResendErrorId(error.id)}
                                data-testid={`button-resend-error-${error.id}`}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Re-send with Reason
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Re-send Error Report</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for re-sending this error to support
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Reason for Re-send</label>
                                  <Textarea
                                    placeholder="e.g., Additional context discovered, error recurred, new information..."
                                    value={resendReason}
                                    onChange={(e) => setResendReason(e.target.value)}
                                    rows={4}
                                    className="mt-1"
                                    data-testid="textarea-resend-reason"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setResendReason('');
                                    setResendErrorId(null);
                                  }}
                                  data-testid="button-cancel-resend"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleResendWithReason}
                                  disabled={!resendReason.trim()}
                                  data-testid="button-confirm-resend"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
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
