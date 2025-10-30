import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild data-testid="button-back">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Terms of Service</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RCCMS Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          <section>
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <p>
              By accessing and using the RCCMS (Rental Car Contract Management System), you accept and agree to be bound
              by the terms and conditions of this agreement. If you do not agree to these terms, please do not use this system.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. System License and Usage</h3>
            <p>
              RCCMS is provided as a software solution for managing rental car contracts. Your company has been granted a
              license to use this system for its internal business operations. The system must not be:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reverse engineered, decompiled, or disassembled</li>
              <li>Resold, redistributed, or sublicensed to third parties</li>
              <li>Modified or altered without authorization</li>
              <li>Used for illegal or unauthorized purposes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. User Accounts and Access</h3>
            <p>
              User accounts are created and managed by system administrators. Users are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of their login credentials</li>
              <li>All activities conducted under their account</li>
              <li>Immediately notifying administrators of unauthorized access</li>
              <li>Using the system in accordance with their assigned role and permissions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. Data Accuracy and Responsibility</h3>
            <p>
              Users are responsible for ensuring the accuracy and completeness of data entered into the system, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Customer information and identification details</li>
              <li>Vehicle inspection reports and condition assessments</li>
              <li>Contract terms, pricing, and financial information</li>
              <li>Payment records and transaction details</li>
            </ul>
            <p>
              The system maintains comprehensive audit logs of all modifications for compliance and accountability purposes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. System Availability</h3>
            <p>
              While we strive to maintain 99.9% uptime, the system may occasionally be unavailable due to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Scheduled maintenance and updates</li>
              <li>Emergency security patches</li>
              <li>Infrastructure issues beyond our control</li>
              <li>Force majeure events</li>
            </ul>
            <p>
              We will make reasonable efforts to notify users in advance of planned downtime.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Data Backup and Recovery</h3>
            <p>
              Your company is responsible for maintaining adequate backups of system data. While the system includes
              built-in data persistence and error logging, we recommend implementing a regular backup schedule for
              business continuity purposes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Prohibited Activities</h3>
            <p>Users must not engage in any activity that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates local, state, or national laws</li>
              <li>Compromises system security or integrity</li>
              <li>Interferes with other users' access or use</li>
              <li>Attempts to gain unauthorized access to system resources</li>
              <li>Introduces malicious code, viruses, or harmful software</li>
              <li>Bypasses role-based access controls or audit mechanisms</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">8. Limitation of Liability</h3>
            <p>
              RCCMS is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we shall
              not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Direct, indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Damages resulting from system errors or user errors</li>
              <li>Third-party actions or security breaches</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">9. Compliance and Legal Requirements</h3>
            <p>
              Your company is responsible for ensuring that use of RCCMS complies with all applicable laws and
              regulations, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data protection and privacy laws (GDPR, CCPA, etc.)</li>
              <li>Financial reporting requirements</li>
              <li>Vehicle rental regulations</li>
              <li>Customer identification and verification laws</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">10. Modifications to Terms</h3>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately
              upon posting. Continued use of the system following any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">11. Termination</h3>
            <p>
              User accounts may be disabled or terminated at any time by system administrators for violations of these
              terms or as required for business operations. System administrators cannot be disabled by other users.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">12. Contact and Support</h3>
            <p>
              For questions about these Terms of Service, technical support, or to report issues, please visit the
              Support page or contact your system administrator.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
