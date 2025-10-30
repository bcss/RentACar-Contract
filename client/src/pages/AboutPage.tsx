import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Database, HardDrive, Clock, Users, Car, FileText, Building, Package } from 'lucide-react';

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

export default function AboutPage() {
  const { t } = useTranslation();

  const { data: healthData, isLoading, error } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
  });

  const formatUptime = () => {
    const uptime = process.uptime?.() || 0;
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">About RCCMS</h1>
        <p className="text-muted-foreground">
          System information, health monitoring, and resource usage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              System Information
            </CardTitle>
            <CardDescription>Application version and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Product Name</span>
                <span className="text-sm text-muted-foreground">RCCMS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Full Name</span>
                <span className="text-sm text-muted-foreground">Rental Car Contract Management System</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Version</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Release Date</span>
                <span className="text-sm text-muted-foreground">December 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Architecture</span>
                <span className="text-sm text-muted-foreground">React + Express + PostgreSQL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-muted-foreground">PostgreSQL (Neon Serverless)</span>
              </div>
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
            <CardDescription>Database connection and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">Unable to fetch system health</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Message</span>
                  <span className="text-sm text-muted-foreground">{healthData?.database.message}</span>
                </div>
              </div>
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
            <CardDescription>Database storage and record counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : healthData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Records</span>
                  <Badge variant="secondary">{healthData.storage.totalRecords.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Estimated Size</span>
                  <span className="text-sm text-muted-foreground">{healthData.storage.estimatedSize}</span>
                </div>
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Users</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.users}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Customers</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.customers}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>Vehicles</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.vehicles}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Total Contracts</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.contracts}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>Active Contracts</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      {healthData.counts.activeContracts}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>Companies</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.companies}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Sponsors</span>
                    </div>
                    <span className="text-muted-foreground">{healthData.counts.sponsors}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Developer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Developer Information
            </CardTitle>
            <CardDescription>Built and maintained by</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Developer</span>
                <span className="text-sm text-muted-foreground">RCCMS Development Team</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Contact</span>
                <span className="text-sm text-muted-foreground">developer@rccms.local</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Support</span>
                <span className="text-sm text-muted-foreground">support@rccms.local</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  RCCMS is a production-ready bilingual rental car contract management system with comprehensive
                  audit trails, role-based access control, and professional reporting capabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>Core capabilities of RCCMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Bilingual Support</p>
              <p className="text-xs text-muted-foreground">English and Arabic with RTL/LTR layouts</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Role-Based Access</p>
              <p className="text-xs text-muted-foreground">Admin, Manager, Staff, and Viewer roles</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Contract Lifecycle</p>
              <p className="text-xs text-muted-foreground">Draft → Confirmed → Active → Completed → Closed</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Comprehensive Audit</p>
              <p className="text-xs text-muted-foreground">Field-level tracking and system logs</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Payment Tracking</p>
              <p className="text-xs text-muted-foreground">Multiple payment methods with validation</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Vehicle Inspections</p>
              <p className="text-xs text-muted-foreground">Photo documentation and condition tracking</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Advanced Reports</p>
              <p className="text-xs text-muted-foreground">Financial, operational, and analytics</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Professional PDFs</p>
              <p className="text-xs text-muted-foreground">Bilingual contract generation</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Data Export</p>
              <p className="text-xs text-muted-foreground">PDF and Excel export capabilities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
