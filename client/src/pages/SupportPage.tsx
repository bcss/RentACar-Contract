import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Mail, MessageSquare, Book, Bug, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild data-testid="button-back">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Support & Help</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>
              Access comprehensive guides and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>User Guide:</strong> Check the USER_GUIDE.md file for detailed instructions on using RCCMS features.
              </p>
              <p className="text-sm">
                <strong>Admin Guide:</strong> See ADMIN_GUIDE.md for administrative tasks and system configuration.
              </p>
              <p className="text-sm">
                <strong>Feature List:</strong> Review MASTER_FEATURE_LIST.md for a complete inventory of all system capabilities.
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
            <CardDescription>
              Quick answers to frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div>
                <strong>Q: How do I create a new contract?</strong>
                <p className="text-muted-foreground">Click "New Contract" on the dashboard and follow the form workflow.</p>
              </div>
              <div>
                <strong>Q: Can I delete a contract?</strong>
                <p className="text-muted-foreground">No, contracts can only be disabled for data integrity. Disabled contracts are archived.</p>
              </div>
              <div>
                <strong>Q: How do I export reports?</strong>
                <p className="text-muted-foreground">Navigate to any report page and use the PDF or Excel export buttons.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              <CardTitle>Report an Issue</CardTitle>
            </div>
            <CardDescription>
              Found a bug or experiencing technical problems?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              If you encounter system errors, they will be logged automatically and visible to administrators in the
              System Errors page.
            </p>
            <p className="text-sm">
              For urgent issues, contact your system administrator or developer:
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>support@rccms.local</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Contact Developer</CardTitle>
            </div>
            <CardDescription>
              Need custom features or have questions?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              For feature requests, customization needs, or general inquiries about RCCMS, please contact the development team.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>developer@rccms.local</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Response time: Typically within 1-2 business days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Quick reference for technical details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-semibold">System Version</p>
              <p className="text-muted-foreground">RCCMS v1.0.0</p>
            </div>
            <div>
              <p className="font-semibold">Architecture</p>
              <p className="text-muted-foreground">React + Express + PostgreSQL</p>
            </div>
            <div>
              <p className="font-semibold">Database</p>
              <p className="text-muted-foreground">PostgreSQL (Neon Serverless)</p>
            </div>
            <div>
              <p className="font-semibold">Authentication</p>
              <p className="text-muted-foreground">Internal (Username/Password)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
            <div>
              <p className="font-medium">View System Errors</p>
              <p className="text-sm text-muted-foreground">Check unacknowledged errors (Admin only)</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/system-errors">View</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
            <div>
              <p className="font-medium">Audit Logs</p>
              <p className="text-sm text-muted-foreground">Review system activity and changes</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/audit-logs">View</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
            <div>
              <p className="font-medium">Settings</p>
              <p className="text-sm text-muted-foreground">Configure company, financial, and system settings</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/settings">Open</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
