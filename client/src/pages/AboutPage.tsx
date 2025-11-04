import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Info, Globe, Shield, Users } from "lucide-react";

interface SystemHealth {
  version: string;
  database: { status: string };
  webserver: { status: string };
}

export default function AboutPage() {
  const { data: health } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>About RCCMS</CardTitle>
          </div>
          <CardDescription>Rental Car Contract Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">System Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <Badge variant="outline">{health?.version || 'Loading...'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Status:</span>
                <Badge variant={health?.database?.status === 'healthy' ? 'default' : 'destructive'}>
                  {health?.database?.status || 'Loading...'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Application Status:</span>
                <Badge variant={health?.webserver?.status === 'running' ? 'default' : 'secondary'}>
                  {health?.webserver?.status || 'Loading...'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Key Features
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Bilingual interface (English/Arabic) with RTL/LTR support</li>
              <li>Comprehensive contract lifecycle management</li>
              <li>Role-based access control and permissions</li>
              <li>Dual audit trail system for compliance</li>
              <li>Vehicle inspection workflow with photo documentation</li>
              <li>Payment tracking and financial management</li>
              <li>Advanced reporting and analytics</li>
              <li>Real-time system health monitoring</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security & Compliance
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Password authentication with bcrypt hashing</li>
              <li>PostgreSQL-backed session management</li>
              <li>Comprehensive audit logging for all operations</li>
              <li>Field-level change tracking for contracts</li>
              <li>Role-based authorization at API level</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-medium">Admin:</span>
                <span className="text-muted-foreground ml-2">Full system access</span>
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-medium">Manager:</span>
                <span className="text-muted-foreground ml-2">Business operations</span>
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-medium">Staff:</span>
                <span className="text-muted-foreground ml-2">Daily operations</span>
              </div>
              <div className="p-2 bg-muted/20 rounded">
                <span className="font-medium">Viewer:</span>
                <span className="text-muted-foreground ml-2">Read-only access</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              RCCMS - Rental Car Contract Management System
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Designed for professional rental car operations with enterprise-grade features
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
