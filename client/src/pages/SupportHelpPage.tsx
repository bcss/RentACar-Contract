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
  version: string;
  database: {
    status: 'healthy' | 'error';
    message: string;
  };
  webserver: {
    status: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
    hostname: string;
    uptime: string;
    uptimeSeconds: number;
  };
  system: {
    totalMemory: string;
    usedMemory: string;
    freeMemory: string;
    memoryUsage: string;
    cpuCores: number;
    cpuModel: string;
  };
  counts: {
    users: number;
    customers: number;
    vehicles: number;
    contracts: number;
    activeContracts: number;
    companies: number;
    sponsors: number;
    vehicleInspections: number;
    photos: number;
  };
  storage: {
    totalRecords: number;
    totalPhotos: number;
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
      answer: 'Navigate to the Contracts page or click "New Contract" from the dashboard. Fill in customer details (name, ID, license), select an available vehicle, set rental dates and times, configure optional addons (GPS, insurance), and save as draft. You can continue editing until you confirm the contract.'
    },
    q2: {
      question: 'Can I delete a contract?',
      answer: 'No, contracts cannot be deleted for data integrity and compliance. Instead, you can disable contracts which hides them from active views while preserving the complete audit trail for regulatory purposes.'
    },
    q3: {
      question: 'How do I export reports?',
      answer: 'Navigate to the Reports section, select your desired report type (Financial, Operational, or Customer), apply date range or status filters if needed, then click either the PDF or Excel export button. Each report exports with a descriptive filename including the report type and date.'
    },
    q4: {
      question: 'What payment methods are supported?',
      answer: 'RCCMS supports Cash, Credit/Debit Card, Check, and Bank Transfer. Each method has specific required fields: cheque number for checks, last 4 card digits for card payments, and reference number for bank transfers.'
    },
    q5: {
      question: 'How do vehicle inspections work?',
      answer: 'Two inspections are mandatory: pre-delivery inspection (before activating contract) and post-return inspection (before completing contract). Each requires 6 photos from different angles (front, back, left, right, top, dashboard), odometer reading, fuel level percentage, and condition notes.'
    },
    q6: {
      question: 'What are the user roles and permissions?',
      answer: 'RCCMS has 4 core roles: Admin (full system access), Manager (business operations, reports), Staff (daily operations, contract management), and Viewer (read-only access). Additional permission toggles include Reports Access, Close Contracts, and View All Contracts.'
    },
    q7: {
      question: 'How do I switch between English and Arabic?',
      answer: 'Click the language toggle button in the application header. The system supports full bilingual display with automatic RTL (right-to-left) layout for Arabic and LTR (left-to-right) for English.'
    },
    q8: {
      question: 'What happens when a contract is completed early?',
      answer: 'If you complete a contract before the scheduled rental end date, a dialog will appear asking for the early closure reason. This reason is logged in the contract timeline for audit and compliance purposes.'
    },
    q9: {
      question: 'How do I add a new customer?',
      answer: 'Navigate to the Customers page and click "Add Customer". Fill in required fields: National ID, full name (English and Arabic), nationality, phone number, and license details. Email and address are optional. All customer data is bilingual.'
    },
    q10: {
      question: 'How do I add a new vehicle?',
      answer: 'Go to the Vehicles page and click "Add Vehicle". Enter registration number, make, model, year, color, fuel type, and pricing (daily, weekly, monthly rates). You can also set the vehicle status (Available, Maintenance, Out of Service).'
    },
    q11: {
      question: 'What is the contract lifecycle?',
      answer: 'Contracts follow this workflow: Draft (editable) → Confirmed (locked, pre-delivery inspection required) → Active (vehicle out, rental in progress) → Completed (vehicle returned, final charges calculated) → Closed (all payments settled, no further changes).'
    },
    q12: {
      question: 'How do I record a payment?',
      answer: 'Open the contract details, navigate to the Payments tab, and click "Record Payment". Select payment method, enter the amount, and provide method-specific details (cheque number, card digits, or transfer reference). All payments are tracked with timestamps and user attribution.'
    },
    q13: {
      question: 'What are extra charges?',
      answer: 'Extra charges are additional fees beyond the base rental rate, including: extra kilometers, fuel differences, Salik/toll charges, traffic fines, vehicle damage, and other miscellaneous charges. These are calculated during vehicle return and must be paid before contract closure.'
    },
    q14: {
      question: 'How do I view audit logs?',
      answer: 'Admin and Manager users can access audit logs from the Audit Logs page in the sidebar. The system maintains two audit trails: System Audit Logs (security and system events) and Business Operations Audit (contract changes, payments, inspections).'
    },
    q15: {
      question: 'Can I edit a confirmed contract?',
      answer: 'No, once a contract is confirmed, it becomes immutable for data integrity. If changes are needed, you must contact an administrator who can provide an edit reason, which will be logged in the audit trail for compliance.'
    },
    q16: {
      question: 'What is the difference between Sponsors and Companies?',
      answer: 'Sponsors are individual guarantors for contracts (hirer type: with_sponsor), while Companies are corporate entities that rent vehicles for their employees (hirer type: from_company). Both are master data that can be reused across multiple contracts.'
    },
    q17: {
      question: 'How do I configure company settings?',
      answer: 'Admin users can access Company Settings from the Settings menu. Configure bilingual company information (name, address, contact), upload logo, set default contract clauses and terms. All settings are applied to PDF contract generation.'
    },
    q18: {
      question: 'How do I configure financial settings?',
      answer: 'Admin users can access Financial Settings to configure rental rate tiers, addon pricing (GPS, child seat, insurance), fuel pricing per type (Petrol, Diesel, Electric), mileage limits, and extra charge rates. These settings apply globally to all new contracts.'
    },
    q19: {
      question: 'What reports are available?',
      answer: 'RCCMS provides comprehensive reports: Financial Reports (revenue, payment collection, outstanding payments), Operational Reports (vehicle utilization, contract status, extra charges), and Customer Reports. All reports support date filtering and PDF/Excel export.'
    },
    q20: {
      question: 'How do I troubleshoot system errors?',
      answer: 'Visit the Support & Help page to view system errors. Admin users can filter errors by date, type, and status. Use the email workflow to report critical errors to support, capture screenshots for context, and acknowledge errors once resolved.'
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Product</span>
                  <span className="text-muted-foreground">RCCMS</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Version</span>
                  <Badge variant="outline">{healthData?.version || '1.0.0'}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Platform</span>
                  <span className="text-muted-foreground text-xs">{healthData?.webserver.platform || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Arch</span>
                  <span className="text-muted-foreground text-xs">{healthData?.webserver.architecture || 'N/A'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Webserver Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Webserver
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
                    {healthData?.webserver.status === 'running' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          Running
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                          Degraded
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Node.js</span>
                  <span className="text-muted-foreground text-xs">{healthData?.webserver.nodeVersion || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Uptime</span>
                  <span className="text-muted-foreground text-xs">{healthData?.webserver.uptime || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Host</span>
                  <span className="text-muted-foreground text-xs truncate max-w-[120px]" title={healthData?.webserver.hostname || 'N/A'}>
                    {healthData?.webserver.hostname || 'N/A'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Database Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database
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
                  <span className="font-medium">Type</span>
                  <span className="text-muted-foreground text-xs">PostgreSQL</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {healthData?.database.message}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* System Hardware */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              Hardware
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">CPU Cores</span>
                  <Badge variant="secondary">{healthData?.system.cpuCores || 0}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Memory</span>
                  <span className="text-muted-foreground text-xs">{healthData?.system.totalMemory || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Used</span>
                  <span className="text-muted-foreground text-xs">{healthData?.system.usedMemory || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Usage</span>
                  <Badge variant="outline">{healthData?.system.memoryUsage || 'N/A'}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage & Records - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Storage & Records
          </CardTitle>
          <CardDescription>Database records and photo storage information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span className="font-medium">Total Records</span>
                  <Badge variant="secondary" className="text-base">{healthData?.storage.totalRecords.toLocaleString() || '0'}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span className="font-medium">Photos Stored</span>
                  <Badge variant="secondary" className="text-base">{healthData?.storage.totalPhotos.toLocaleString() || '0'}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span className="font-medium">Est. Size</span>
                  <Badge variant="outline" className="text-base">{healthData?.storage.estimatedSize || 'N/A'}</Badge>
                </div>
              </div>
              <div className="pt-3 border-t grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-sm">
                <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">Users</span>
                  </div>
                  <span className="font-semibold">{healthData?.counts.users || 0}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">Customers</span>
                  </div>
                  <span className="font-semibold">{healthData?.counts.customers || 0}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Car className="h-3 w-3" />
                    <span className="text-xs">Vehicles</span>
                  </div>
                  <span className="font-semibold">{healthData?.counts.vehicles || 0}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">Contracts</span>
                  </div>
                  <span className="font-semibold">{healthData?.counts.contracts || 0}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    <span className="text-xs">Inspections</span>
                  </div>
                  <span className="font-semibold">{healthData?.counts.vehicleInspections || 0}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documentation & Common Questions Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Documentation with Modal Guides */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>Access comprehensive guides and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" data-testid="button-open-user-guide">
                  <BookOpen className="h-4 w-4 mr-2" />
                  User Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>RCCMS User Guide</DialogTitle>
                  <DialogDescription>Comprehensive guide for using all RCCMS features</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <section>
                    <h3 className="font-semibold text-base mb-2">Getting Started</h3>
                    <p className="text-muted-foreground mb-2">Welcome to RCCMS - Your comprehensive rental car contract management system.</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Login with your credentials provided by your administrator</li>
                      <li>Navigate using the sidebar menu on the left side</li>
                      <li><Link href="/" className="text-primary hover:underline">Dashboard</Link> provides quick overview of active rentals, revenue, and key metrics</li>
                      <li>Use the language toggle in header to switch between English and Arabic</li>
                      <li>Dark/Light theme toggle available for comfortable viewing</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="font-semibold text-base mb-2">Contract Management</h3>
                    <p className="text-muted-foreground mb-2">Navigate to <Link href="/contracts" className="text-primary hover:underline">Contracts</Link> to manage rental agreements.</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Creating:</strong> Click "New Contract" button to start a new rental. Fill customer, vehicle, dates, and addon selections</li>
                      <li><strong>Editing:</strong> Contracts can only be edited in Draft status. Provide edit reason for confirmed contracts</li>
                      <li><strong>Contract Lifecycle:</strong> Draft → Confirmed → Active → Completed → Closed</li>
                      <li><strong>Timeline View:</strong> See complete contract history with all field edits and status changes</li>
                      <li><strong>Search & Filter:</strong> Use contract number, customer name, status, or date range filters</li>
                      <li><strong>PDF Generation:</strong> Professional bilingual contract PDFs available for confirmed contracts</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-base mb-2">Master Data Management</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong><Link href="/customers" className="text-primary hover:underline">Customers</Link>:</strong> Manage customer database with bilingual names, IDs, licenses, contact info</li>
                      <li><strong><Link href="/vehicles" className="text-primary hover:underline">Vehicles</Link>:</strong> Vehicle fleet with registration, make, model, pricing, and real-time status</li>
                      <li><strong><Link href="/sponsors" className="text-primary hover:underline">Sponsors</Link>:</strong> Individual guarantors for rental contracts</li>
                      <li><strong><Link href="/companies" className="text-primary hover:underline">Companies</Link>:</strong> Corporate clients for business rentals</li>
                      <li><strong>Disable/Enable:</strong> No data deletion - use disable feature to hide inactive records</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-base mb-2">Payments & Invoicing</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Payment Methods:</strong> Cash, Credit/Debit Card, Check, Bank Transfer</li>
                      <li><strong>Method-Specific Fields:</strong> Cheque number for checks, last 4 digits for cards, reference for transfers</li>
                      <li><strong>Payment History:</strong> Complete audit trail of all payments with timestamps and users</li>
                      <li><strong>Final Payment:</strong> Required before contract can be closed</li>
                      <li><strong>Security Deposits:</strong> Track deposits and refunds separately</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-base mb-2">Vehicle Inspections</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Pre-Delivery:</strong> Required before activating contract - capture vehicle condition before handover</li>
                      <li><strong>Post-Return:</strong> Required before completing contract - document return condition</li>
                      <li><strong>6 Mandatory Photos:</strong> Front, Back, Left, Right, Top, Dashboard views</li>
                      <li><strong>Inspection Data:</strong> Odometer reading (km), fuel level (%), condition notes</li>
                      <li><strong>Photo Compression:</strong> Automatic compression for storage optimization</li>
                      <li><strong>Inspection History:</strong> View all inspections for any vehicle with photo galleries</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-base mb-2">Reports & Analytics</h3>
                    <p className="text-muted-foreground mb-2">Access comprehensive reporting from <Link href="/reports" className="text-primary hover:underline">Reports</Link> section.</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Financial Reports:</strong> Revenue summary, payment collection, outstanding payments</li>
                      <li><strong>Operational Reports:</strong> Vehicle utilization, contract status breakdown, extra charges</li>
                      <li><strong>Customer Reports:</strong> Top customers, retention analytics</li>
                      <li><strong>Date Filters:</strong> Apply custom date ranges to focus analysis</li>
                      <li><strong>Export Options:</strong> PDF and Excel exports with descriptive filenames</li>
                      <li><strong>Chart Visualization:</strong> Interactive charts for trend analysis</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-semibold text-base mb-2">Audit & Timeline</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Contract Timeline:</strong> View all changes to any contract with who, when, what</li>
                      <li><strong>Field-Level Tracking:</strong> Every field edit is logged with old and new values</li>
                      <li><strong>Status Changes:</strong> Complete lifecycle tracking from draft to closed</li>
                      <li><strong>User Attribution:</strong> Know which user made each change</li>
                      <li><strong>Edit Reasons:</strong> Required explanations for post-confirmation edits</li>
                    </ul>
                  </section>
                </DialogContent>
              </Dialog>

              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-open-admin-guide">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Guide
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>RCCMS Admin Guide</DialogTitle>
                      <DialogDescription>Administrative tasks and system configuration</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <section>
                        <h3 className="font-semibold text-base mb-2">User Management</h3>
                        <p className="text-muted-foreground mb-2">Access <Link href="/users" className="text-primary hover:underline">Users</Link> to manage system access.</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>Create Users:</strong> Set username, password, full name, and assign role</li>
                          <li><strong>Four Roles:</strong> Admin (full access), Manager (business ops), Staff (daily ops), Viewer (read-only)</li>
                          <li><strong>Permission Toggles:</strong> Reports Access, Close Contracts, View All Contracts</li>
                          <li><strong>Password Management:</strong> Users can change own password, admins can reset any password</li>
                          <li><strong>Disable Users:</strong> Suspend access without data deletion</li>
                          <li><strong>Last Login Tracking:</strong> Monitor user activity</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold text-base mb-2">Company Settings</h3>
                        <p className="text-muted-foreground mb-2">Configure via <Link href="/settings/company" className="text-primary hover:underline">Company Settings</Link>.</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>Bilingual Information:</strong> Company name, address, contact (English & Arabic)</li>
                          <li><strong>Contact Details:</strong> Phone, email, website, registration numbers</li>
                          <li><strong>Default Terms:</strong> Standard contract clauses and conditions</li>
                          <li><strong>PDF Branding:</strong> All settings apply to generated contract PDFs</li>
                          <li><strong>Tax Information:</strong> VAT/TAX registration for invoicing</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold text-base mb-2">Financial Settings</h3>
                        <p className="text-muted-foreground mb-2">Configure pricing via <Link href="/settings/financial" className="text-primary hover:underline">Financial Settings</Link>.</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>Rental Rates:</strong> Default daily, weekly, monthly pricing tiers</li>
                          <li><strong>Addon Pricing:</strong> GPS, Child Seat, Insurance, Driver charges</li>
                          <li><strong>Fuel Pricing:</strong> Per-liter rates for Petrol, Diesel, Electric</li>
                          <li><strong>Mileage Limits:</strong> Included kilometers and excess charges</li>
                          <li><strong>Extra Charge Rates:</strong> Salik, damage, late return fees</li>
                          <li><strong>Global Application:</strong> Settings apply to all new contracts</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold text-base mb-2">Audit & Compliance</h3>
                        <p className="text-muted-foreground mb-2">Monitor system activity via <Link href="/audit-logs" className="text-primary hover:underline">Audit Logs</Link>.</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>System Audit Logs:</strong> User authentication, system changes, security events</li>
                          <li><strong>Business Operations Audit:</strong> Contract lifecycle, payments, inspections, master data</li>
                          <li><strong>Field-Level Tracking:</strong> Every contract edit logged with old/new values</li>
                          <li><strong>User Attribution:</strong> Complete who/when/what for all changes</li>
                          <li><strong>Export Capability:</strong> Download audit logs for compliance reporting</li>
                          <li><strong>Immutable Records:</strong> Audit logs cannot be deleted or modified</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold text-base mb-2">System Monitoring</h3>
                        <p className="text-muted-foreground mb-2">System health available at <Link href="/settings/support" className="text-primary hover:underline">Support & Help</Link>.</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>Database Health:</strong> Real-time connection status and health checks</li>
                          <li><strong>Record Counts:</strong> Users, customers, vehicles, contracts tracking</li>
                          <li><strong>Storage Estimates:</strong> Database size monitoring</li>
                          <li><strong>Error Reporter:</strong> System error logging with email workflow</li>
                          <li><strong>Screenshot Capture:</strong> Visual error documentation</li>
                          <li><strong>Error Acknowledgement:</strong> Track and resolve system issues</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold text-base mb-2">Data Management Best Practices</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li><strong>No Deletion Policy:</strong> Use disable instead of delete for data integrity</li>
                          <li><strong>Bilingual Data Entry:</strong> Always provide both English and Arabic where applicable</li>
                          <li><strong>Regular Backups:</strong> Ensure database backups are configured</li>
                          <li><strong>User Training:</strong> Train staff on contract workflows and compliance</li>
                          <li><strong>Permission Reviews:</strong> Regularly audit user permissions and access</li>
                        </ul>
                      </section>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-open-feature-list">
                    <List className="h-4 w-4 mr-2" />
                    Feature List
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>RCCMS Complete Feature List</DialogTitle>
                    <DialogDescription>Comprehensive inventory of all system capabilities</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <section>
                      <h3 className="font-semibold text-base mb-2">Core Features</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Bilingual Support:</strong> Full English/Arabic interface with RTL/LTR layouts</li>
                        <li><strong>Contract Lifecycle:</strong> Draft → Confirmed → Active → Completed → Closed workflow</li>
                        <li><strong>Role-Based Access:</strong> Admin, Manager, Staff, Viewer with granular permission toggles</li>
                        <li><strong>Payment Tracking:</strong> Cash, Card, Check, Bank Transfer with complete history</li>
                        <li><strong>Vehicle Inspections:</strong> Pre-delivery and post-return with 6-photo documentation</li>
                        <li><strong>Master Data:</strong> Customers, Vehicles, Sponsors, Companies management</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">Advanced Features</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Automatic Fuel Charges:</strong> Calculate based on tank capacity and fuel type pricing</li>
                        <li><strong>Vehicle Status Sync:</strong> Real-time availability updates with contract lifecycle</li>
                        <li><strong>Early Closure Tracking:</strong> Reason logging for contracts closed before end date</li>
                        <li><strong>Duplicate Phone Validation:</strong> Non-blocking customer phone number checks</li>
                        <li><strong>Contract Timeline:</strong> Complete audit trail with field-level change tracking</li>
                        <li><strong>Professional PDF:</strong> Bilingual contract generation for printing and archiving</li>
                        <li><strong>Three Hirer Types:</strong> Direct, with sponsor (individual), from company (corporate)</li>
                        <li><strong>Immutable Contracts:</strong> Confirmed contracts locked to prevent unauthorized changes</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">Reporting & Analytics</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Dashboard Metrics:</strong> Active rentals, monthly revenue, overdue returns, refunds</li>
                        <li><strong>Context-Aware Navigation:</strong> Click metrics to filter relevant data views</li>
                        <li><strong>Financial Reports:</strong> Revenue summary, payment collection rates, outstanding payments</li>
                        <li><strong>Operational Reports:</strong> Vehicle utilization, contract status distribution, extra charges analysis</li>
                        <li><strong>Customer Reports:</strong> Top customers, repeat customer rates, retention analytics</li>
                        <li><strong>Chart Visualization:</strong> Interactive charts using Recharts library</li>
                        <li><strong>Export Functionality:</strong> PDF and Excel exports with descriptive filenames</li>
                        <li><strong>Date Range Filtering:</strong> Flexible date filters for all reports</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">System Features</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Dual Audit System:</strong> System logs (security) and Business logs (operations)</li>
                        <li><strong>Enhanced Error Reporter:</strong> Email workflow, screenshot capture, status tracking</li>
                        <li><strong>System Health Monitoring:</strong> Database status, record counts, storage estimates</li>
                        <li><strong>Dark/Light Themes:</strong> User-selectable theme with localStorage persistence</li>
                        <li><strong>Responsive Design:</strong> Optimized for desktop, tablet, and mobile devices</li>
                        <li><strong>Route-Based Lazy Loading:</strong> Performance optimization with React.lazy()</li>
                        <li><strong>Disable-Only Architecture:</strong> No data deletion - disable/enable for data integrity</li>
                        <li><strong>Time-Based Greetings:</strong> Personalized dashboard with last login tracking</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">Security & Compliance</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Password Authentication:</strong> Bcrypt hashing for secure password storage</li>
                        <li><strong>Session Management:</strong> PostgreSQL-backed sessions with httpOnly cookies</li>
                        <li><strong>Role-Based Middleware:</strong> Backend route protection by user role</li>
                        <li><strong>Edit Reason Logging:</strong> Required explanations for post-confirmation contract edits</li>
                        <li><strong>Immutable Audit Logs:</strong> Tamper-proof compliance and security tracking</li>
                        <li><strong>Field-Level Audit:</strong> Track every contract field change with old/new values</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-base mb-2">User Experience</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Professional Loading States:</strong> Skeleton loaders for better perceived performance</li>
                        <li><strong>Toast Notifications:</strong> Success/error feedback for all user actions</li>
                        <li><strong>Confirmation Dialogs:</strong> Prevent accidental destructive actions</li>
                        <li><strong>Search & Filters:</strong> Powerful filtering across all data tables</li>
                        <li><strong>Pagination:</strong> Efficient handling of large datasets</li>
                        <li><strong>Tooltips:</strong> Contextual help throughout the application</li>
                        <li><strong>Keyboard Navigation:</strong> Accessible form controls and shortcuts</li>
                      </ul>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

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
                  <SelectItem value="q9">How do I add a new customer?</SelectItem>
                  <SelectItem value="q10">How do I add a new vehicle?</SelectItem>
                  <SelectItem value="q11">What is the contract lifecycle?</SelectItem>
                  <SelectItem value="q12">How do I record a payment?</SelectItem>
                  <SelectItem value="q13">What are extra charges?</SelectItem>
                  <SelectItem value="q14">How do I view audit logs?</SelectItem>
                  <SelectItem value="q15">Can I edit a confirmed contract?</SelectItem>
                  <SelectItem value="q16">What is the difference between Sponsors and Companies?</SelectItem>
                  <SelectItem value="q17">How do I configure company settings?</SelectItem>
                  <SelectItem value="q18">How do I configure financial settings?</SelectItem>
                  <SelectItem value="q19">What reports are available?</SelectItem>
                  <SelectItem value="q20">How do I troubleshoot system errors?</SelectItem>
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
