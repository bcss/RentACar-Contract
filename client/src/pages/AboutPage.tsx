import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Info, Globe, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SystemHealth {
  version: string;
  database: { status: string };
  webserver: { status: string };
}

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: health } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
  });

  return (
    <div className="space-y-6" data-testid="page-about">
      <Card data-testid="card-about">
        <CardHeader data-testid="header-about">
          <div className="flex items-center gap-2" data-testid="title-container">
            <Info className="h-5 w-5 text-primary" data-testid="icon-info" />
            <CardTitle data-testid="text-title">{t('about.title', 'About RCCMS')}</CardTitle>
          </div>
          <CardDescription data-testid="text-subtitle">
            {t('about.subtitle', 'Rental Car Contract Management System')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="content-about">
          <div data-testid="section-system-info">
            <h3 className="font-semibold mb-2" data-testid="heading-system-info">
              {t('about.systemInformation', 'System Information')}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground" data-testid="list-system-info">
              <div className="flex items-center justify-between" data-testid="info-version">
                <span data-testid="label-version">{t('about.version', 'Version:')}</span>
                <Badge variant="outline" data-testid="badge-version">{health?.version || t('common.loading', 'Loading...')}</Badge>
              </div>
              <div className="flex items-center justify-between" data-testid="info-database">
                <span data-testid="label-database">{t('about.databaseStatus', 'Database Status:')}</span>
                <Badge variant={health?.database?.status === 'healthy' ? 'default' : 'destructive'} data-testid="badge-database">
                  {health?.database?.status || t('common.loading', 'Loading...')}
                </Badge>
              </div>
              <div className="flex items-center justify-between" data-testid="info-application">
                <span data-testid="label-application">{t('about.applicationStatus', 'Application Status:')}</span>
                <Badge variant={health?.webserver?.status === 'running' ? 'default' : 'secondary'} data-testid="badge-application">
                  {health?.webserver?.status || t('common.loading', 'Loading...')}
                </Badge>
              </div>
            </div>
          </div>

          <div data-testid="section-key-features">
            <h3 className="font-semibold mb-2 flex items-center gap-2" data-testid="heading-features">
              <Globe className="h-4 w-4" data-testid="icon-globe" />
              {t('about.keyFeatures', 'Key Features')}
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside" data-testid="list-features">
              <li data-testid="feature-1">{t('about.feature1', 'Bilingual interface (English/Arabic) with RTL/LTR support')}</li>
              <li data-testid="feature-2">{t('about.feature2', 'Comprehensive contract lifecycle management')}</li>
              <li data-testid="feature-3">{t('about.feature3', 'Role-based access control and permissions')}</li>
              <li data-testid="feature-4">{t('about.feature4', 'Dual audit trail system for compliance')}</li>
              <li data-testid="feature-5">{t('about.feature5', 'Vehicle inspection workflow with photo documentation')}</li>
              <li data-testid="feature-6">{t('about.feature6', 'Payment tracking and financial management')}</li>
              <li data-testid="feature-7">{t('about.feature7', 'Advanced reporting and analytics')}</li>
              <li data-testid="feature-8">{t('about.feature8', 'Real-time system health monitoring')}</li>
            </ul>
          </div>

          <div data-testid="section-security">
            <h3 className="font-semibold mb-2 flex items-center gap-2" data-testid="heading-security">
              <Shield className="h-4 w-4" data-testid="icon-shield" />
              {t('about.securityCompliance', 'Security & Compliance')}
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside" data-testid="list-security">
              <li data-testid="security-1">{t('about.security1', 'Password authentication with bcrypt hashing')}</li>
              <li data-testid="security-2">{t('about.security2', 'PostgreSQL-backed session management')}</li>
              <li data-testid="security-3">{t('about.security3', 'Comprehensive audit logging for all operations')}</li>
              <li data-testid="security-4">{t('about.security4', 'Field-level change tracking for contracts')}</li>
              <li data-testid="security-5">{t('about.security5', 'Role-based authorization at API level')}</li>
            </ul>
          </div>

          <div data-testid="section-user-roles">
            <h3 className="font-semibold mb-2 flex items-center gap-2" data-testid="heading-roles">
              <Users className="h-4 w-4" data-testid="icon-users" />
              {t('about.userRoles', 'User Roles')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm" data-testid="grid-roles">
              <div className="p-2 bg-muted/20 rounded" data-testid="role-admin">
                <span className="font-medium" data-testid="role-admin-name">{t('roles.admin', 'Admin:')}</span>
                <span className="text-muted-foreground ml-2" data-testid="role-admin-desc">{t('about.roleAdmin', 'Full system access')}</span>
              </div>
              <div className="p-2 bg-muted/20 rounded" data-testid="role-manager">
                <span className="font-medium" data-testid="role-manager-name">{t('roles.manager', 'Manager:')}</span>
                <span className="text-muted-foreground ml-2" data-testid="role-manager-desc">{t('about.roleManager', 'Business operations')}</span>
              </div>
              <div className="p-2 bg-muted/20 rounded" data-testid="role-staff">
                <span className="font-medium" data-testid="role-staff-name">{t('roles.staff', 'Staff:')}</span>
                <span className="text-muted-foreground ml-2" data-testid="role-staff-desc">{t('about.roleStaff', 'Daily operations')}</span>
              </div>
              <div className="p-2 bg-muted/20 rounded" data-testid="role-viewer">
                <span className="font-medium" data-testid="role-viewer-name">{t('roles.viewer', 'Viewer:')}</span>
                <span className="text-muted-foreground ml-2" data-testid="role-viewer-desc">{t('about.roleViewer', 'Read-only access')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t" data-testid="section-footer">
            <p className="text-xs text-muted-foreground text-center" data-testid="text-footer-name">
              {t('about.footerName', 'RCCMS - Rental Car Contract Management System')}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1" data-testid="text-footer-tagline">
              {t('about.footerTagline', 'Designed for professional rental car operations with enterprise-grade features')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
