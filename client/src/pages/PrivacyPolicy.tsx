import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild data-testid="button-back">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Privacy Policy</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RCCMS Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          <section>
            <h3 className="text-lg font-semibold">1. Introduction</h3>
            <p>
              RCCMS (Rental Car Contract Management System) is committed to protecting your privacy and ensuring the security
              of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when
              you use our rental car management system.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">2. Information We Collect</h3>
            <p>We collect and process the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Customer Information:</strong> Name, national ID, phone number, email address, driver's license details, and nationality</li>
              <li><strong>Contract Data:</strong> Rental agreements, vehicle information, payment records, and transaction history</li>
              <li><strong>User Account Data:</strong> Username, email, role, and authentication credentials</li>
              <li><strong>Usage Data:</strong> Login times, IP addresses, system interactions, and audit logs</li>
              <li><strong>Payment Information:</strong> Payment method details (masked card numbers, cheque references, bank transfer information)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">3. How We Use Your Information</h3>
            <p>Your information is used for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processing and managing rental car contracts</li>
              <li>Verifying customer identity and driver's license validity</li>
              <li>Processing payments and managing financial transactions</li>
              <li>Communicating with customers about their rentals</li>
              <li>Maintaining comprehensive audit trails for compliance</li>
              <li>Generating reports and analytics for business operations</li>
              <li>Ensuring system security and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">4. Data Security</h3>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encrypted database connections and secure data transmission</li>
              <li>Password hashing using industry-standard algorithms</li>
              <li>Role-based access control to limit data access</li>
              <li>Comprehensive audit logging of all system activities</li>
              <li>Regular security updates and monitoring</li>
              <li>Secure session management with HTTPOnly cookies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">5. Data Retention</h3>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy,
              unless a longer retention period is required by law. Contract data and audit logs are retained indefinitely
              for compliance and business continuity purposes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">6. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information stored in our system</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Object to processing of your personal data</li>
              <li>Receive a copy of your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold">7. Third-Party Services</h3>
            <p>
              RCCMS is a self-hosted solution. We do not share your data with third parties except as necessary for
              hosting infrastructure (database services) and as required by law. Your rental company has full control
              over the data and is responsible for its management.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">8. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
              updated revision date. Continued use of the system constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold">9. Contact Information</h3>
            <p>
              For questions or concerns about this Privacy Policy or your data, please contact your system administrator
              or visit the Support page for assistance.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
