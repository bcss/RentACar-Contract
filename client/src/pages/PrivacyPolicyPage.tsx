import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            RCCMS collects and processes the following types of information:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>User account information (username, email, password hash)</li>
            <li>Customer and company data entered into the system</li>
            <li>Contract details and financial transactions</li>
            <li>System usage logs and audit trails</li>
            <li>IP addresses and session information for security purposes</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Your information is used exclusively for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Operating and maintaining the rental car contract management system</li>
            <li>Processing and tracking rental contracts and payments</li>
            <li>Generating reports and analytics for business operations</li>
            <li>Maintaining audit trails for compliance and security</li>
            <li>Providing customer support and system maintenance</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Encrypted password storage using bcrypt hashing</li>
            <li>Secure session management with httpOnly cookies</li>
            <li>Role-based access control (RBAC) to limit data access</li>
            <li>Comprehensive audit logging of all system activities</li>
            <li>Regular security updates and monitoring</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Data is retained according to the following policies:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Contract data: Retained for the duration required by your business needs and local regulations</li>
            <li>Audit logs: Retained for compliance and security purposes</li>
            <li>User accounts: Disabled rather than deleted to maintain data integrity</li>
            <li>System errors: Retained until acknowledged and resolved</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. User Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            As a user of RCCMS, you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Access your personal information and account data</li>
            <li>Request corrections to inaccurate information</li>
            <li>Change your password and update account details</li>
            <li>Review audit logs related to your activities (subject to role permissions)</li>
            <li>Request account deactivation (contact your system administrator)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            RCCMS uses the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Neon PostgreSQL: Database hosting and management</li>
            <li>Replit: Application hosting and infrastructure</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            These services have their own privacy policies and terms of service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            For privacy-related questions or concerns, please contact:
          </p>
          <p className="text-muted-foreground">
            Email: support@rccms.com
          </p>
          <p className="text-muted-foreground">
            Or contact your system administrator for assistance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            We may update this privacy policy from time to time. Users will be notified of significant changes
            through the system. Continued use of RCCMS after changes constitutes acceptance of the updated policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
