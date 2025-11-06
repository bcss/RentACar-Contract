import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Shield, Database, Lock, Users, Eye, FileText, Globe, Cookie, Scale, Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from 'react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          current = section.getAttribute('data-section') || '';
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.querySelector(`[data-section="${id}"]`);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'intro', title: 'Introduction', icon: Shield },
    { id: 'collection', title: 'Information Collection', icon: Database },
    { id: 'usage', title: 'How We Use Information', icon: Eye },
    { id: 'security', title: 'Data Security', icon: Lock },
    { id: 'retention', title: 'Data Retention', icon: FileText },
    { id: 'rights', title: 'Your Rights', icon: Users },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'sharing', title: 'Data Sharing', icon: Globe },
    { id: 'international', title: 'International Transfers', icon: Globe },
    { id: 'children', title: 'Children\'s Privacy', icon: Users },
    { id: 'gdpr', title: 'GDPR Compliance', icon: Scale },
    { id: 'changes', title: 'Policy Updates', icon: FileText },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: December 2025</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      data-testid={`toc-${section.id}`}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Introduction */}
            <Card data-section="intro">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Welcome to RCCMS (Rental Car Contract Management System). We are committed to protecting your privacy 
                  and ensuring the security of your personal information. This Privacy Policy explains how we collect, 
                  use, store, and protect your data when you use our system.
                </p>
                <p className="text-muted-foreground">
                  By using RCCMS, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with any part of this policy, please do not use the system.
                </p>
              </CardContent>
            </Card>

            {/* Information Collection - Accordion */}
            <Card data-section="collection">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="personal" data-testid="accordion-personal-info">
                    <AccordionTrigger>Personal Information</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>We collect the following personal information:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>User account credentials (username, email, password hash)</li>
                        <li>Full name and contact details</li>
                        <li>Role and permission levels</li>
                        <li>Last login timestamps and session information</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="customer" data-testid="accordion-customer-data">
                    <AccordionTrigger>Customer & Business Data</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>Information about customers and business entities:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Customer names, national IDs, and passport numbers</li>
                        <li>Contact information (phone, email, address)</li>
                        <li>Driver's license numbers and expiration dates</li>
                        <li>Company registration and tax identification numbers</li>
                        <li>Sponsor and guarantor information</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contract" data-testid="accordion-contract-data">
                    <AccordionTrigger>Contract & Financial Data</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>Transaction and contract information:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Rental contract details and pricing</li>
                        <li>Payment records and transaction history</li>
                        <li>Credit card last 4 digits (for reference only)</li>
                        <li>Cheque and bank transfer details</li>
                        <li>Outstanding balances and payment status</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vehicle" data-testid="accordion-vehicle-data">
                    <AccordionTrigger>Vehicle & Inspection Data</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>Vehicle-related information:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Vehicle registration, make, model, and specifications</li>
                        <li>Odometer readings and fuel levels</li>
                        <li>Vehicle condition notes and damage reports</li>
                        <li>Inspection photographs (pre-delivery and post-return)</li>
                        <li>Maintenance and service records</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        <strong>Note:</strong> Vehicle inspection photos may inadvertently capture individuals. 
                        These images are stored securely and used solely for vehicle condition documentation.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="technical" data-testid="accordion-technical-data">
                    <AccordionTrigger>Technical & System Data</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>Automatically collected system information:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>IP addresses and browser information</li>
                        <li>Session cookies and authentication tokens</li>
                        <li>System usage logs and access timestamps</li>
                        <li>Error logs with automatic screenshots</li>
                        <li>Audit trails of all system modifications</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card data-section="usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>Your information is used exclusively for legitimate business purposes:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Core Operations</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Processing rental contracts</li>
                      <li>Managing customer relationships</li>
                      <li>Tracking vehicle availability</li>
                      <li>Recording payments and transactions</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Security & Compliance</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Authentication and access control</li>
                      <li>Audit logging for compliance</li>
                      <li>Fraud detection and prevention</li>
                      <li>Legal and regulatory requirements</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Analytics & Reporting</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Business intelligence and reporting</li>
                      <li>Revenue and utilization analysis</li>
                      <li>Performance metrics tracking</li>
                      <li>System usage optimization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Support & Maintenance</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Customer support and assistance</li>
                      <li>System maintenance and updates</li>
                      <li>Error monitoring and resolution</li>
                      <li>Performance optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card data-section="security">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Data Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="encryption" data-testid="accordion-encryption">
                    <AccordionTrigger>Encryption & Protection</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Bcrypt password hashing with salt rounds</li>
                        <li>HTTPS/TLS encryption for data in transit</li>
                        <li>Database encryption at rest (via Neon PostgreSQL)</li>
                        <li>Secure session management with httpOnly cookies</li>
                        <li>Environment-based secret management</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="access" data-testid="accordion-access-control">
                    <AccordionTrigger>Access Control</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Role-Based Access Control (RBAC) system</li>
                        <li>Four permission levels: Admin, Manager, Staff, Viewer</li>
                        <li>Granular permission toggles per user</li>
                        <li>Protected routes and API endpoints</li>
                        <li>Session timeout and automatic logout</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="monitoring" data-testid="accordion-monitoring">
                    <AccordionTrigger>Monitoring & Auditing</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Comprehensive audit logging of all actions</li>
                        <li>Dual audit trail system (system + business operations)</li>
                        <li>Automatic error logging with screenshots</li>
                        <li>Real-time system health monitoring</li>
                        <li>Regular security updates and patches</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="backup" data-testid="accordion-backup">
                    <AccordionTrigger>Backup & Recovery</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Automatic database backups via Neon PostgreSQL</li>
                        <li>Point-in-time recovery capabilities</li>
                        <li>Immutable finalized contracts (prevent accidental deletion)</li>
                        <li>Disable-only architecture for master data</li>
                        <li>Disaster recovery procedures</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card data-section="retention">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Data Retention Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We retain data according to the following guidelines:</p>
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Active Contracts</h4>
                    <p className="text-muted-foreground">Retained for the duration of the rental period plus 90 days</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Closed Contracts</h4>
                    <p className="text-muted-foreground">Retained for 7 years for tax and legal compliance purposes</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Audit Logs</h4>
                    <p className="text-muted-foreground">Retained for 5 years for security and compliance audits</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">User Accounts</h4>
                    <p className="text-muted-foreground">Disabled (not deleted) to maintain data integrity and audit trails</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">System Errors</h4>
                    <p className="text-muted-foreground">Retained until acknowledged and resolved, then archived for 1 year</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Vehicle Photos</h4>
                    <p className="text-muted-foreground">Retained with the associated contract for the full retention period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card data-section="rights">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>As a user of RCCMS, you have the following rights:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Access</h4>
                    <p className="text-muted-foreground">Request access to your personal data and account information</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Rectification</h4>
                    <p className="text-muted-foreground">Request corrections to inaccurate or incomplete data</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Erasure</h4>
                    <p className="text-muted-foreground">Request account deactivation (subject to legal retention requirements)</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Portability</h4>
                    <p className="text-muted-foreground">Export your data in machine-readable format (PDF/Excel)</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Object</h4>
                    <p className="text-muted-foreground">Object to certain data processing activities</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Right to Audit</h4>
                    <p className="text-muted-foreground">Review audit logs of activities involving your data (subject to permissions)</p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">
                  To exercise any of these rights, please contact your system administrator or visit the{' '}
                  <Link href="/settings/support" className="text-primary hover:underline font-medium">
                    Support & Help page
                  </Link>.
                </p>
              </CardContent>
            </Card>

            {/* Cookies & Tracking */}
            <Card data-section="cookies">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  Cookies & Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>RCCMS uses cookies and similar technologies for essential functionality:</p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Essential Cookies (Required)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Session authentication cookies (httpOnly, secure)</li>
                      <li>User preferences (theme, language selection)</li>
                      <li>CSRF protection tokens</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Performance Cookies (Optional)</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Anonymous usage analytics (if enabled)</li>
                      <li>System performance monitoring</li>
                      <li>Error tracking and diagnostics</li>
                    </ul>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  We do not use advertising or tracking cookies. All cookies expire when you log out or after 24 hours of inactivity.
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card data-section="sharing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Data Sharing & Third Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>We do not sell, rent, or trade your personal information. Data is shared only in these limited circumstances:</p>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="service" data-testid="accordion-service-providers">
                    <AccordionTrigger>Service Providers</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li><strong>Neon PostgreSQL:</strong> Database hosting and management</li>
                        <li><strong>Replit:</strong> Application hosting and infrastructure</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        These providers are contractually obligated to protect your data and use it only for providing their services.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="legal" data-testid="accordion-legal-requirements">
                    <AccordionTrigger>Legal Requirements</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>We may disclose information when required by law:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>In response to valid court orders or subpoenas</li>
                        <li>To comply with legal obligations and regulations</li>
                        <li>To protect our rights, property, or safety</li>
                        <li>In connection with fraud investigations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="business" data-testid="accordion-business-transfers">
                    <AccordionTrigger>Business Transfers</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                        to the acquiring entity. You will be notified of any such change.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card data-section="international">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  International Data Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Your data may be transferred to and stored in countries outside your jurisdiction. We ensure adequate 
                  protection through:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Standard Contractual Clauses (SCCs) approved by regulatory authorities</li>
                  <li>Data Processing Agreements with all third-party providers</li>
                  <li>Compliance with GDPR requirements for international transfers</li>
                  <li>Regular assessments of data transfer mechanisms</li>
                </ul>
                <p className="text-muted-foreground">
                  Our infrastructure provider (Replit) operates globally with data centers in multiple regions to ensure 
                  optimal performance and redundancy.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card data-section="children">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  RCCMS is not intended for use by individuals under the age of 18. We do not knowingly collect 
                  personal information from children.
                </p>
                <p className="text-muted-foreground">
                  If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact your system administrator immediately. We will take steps to remove such information 
                  from our systems.
                </p>
                <p className="text-muted-foreground">
                  Note: Customer records may include minors as renters when accompanied by adults or sponsors, 
                  as permitted by local rental regulations.
                </p>
              </CardContent>
            </Card>

            {/* GDPR Compliance */}
            <Card data-section="gdpr">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  GDPR & Privacy Regulations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>RCCMS is designed to comply with major privacy regulations including:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">GDPR (EU)</h4>
                    <p className="text-muted-foreground text-xs">
                      General Data Protection Regulation - Comprehensive data protection framework for EU citizens
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">CCPA (California)</h4>
                    <p className="text-muted-foreground text-xs">
                      California Consumer Privacy Act - Enhanced privacy rights for California residents
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">PDPA (Various)</h4>
                    <p className="text-muted-foreground text-xs">
                      Personal Data Protection Acts in multiple jurisdictions including Singapore, Thailand
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Local Regulations</h4>
                    <p className="text-muted-foreground text-xs">
                      Compliance with applicable local data protection and privacy laws in your jurisdiction
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Legal Basis for Processing</h4>
                  <p className="text-muted-foreground text-sm">
                    We process personal data based on:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4 mt-2">
                    <li><strong>Contractual Necessity:</strong> To fulfill rental agreements</li>
                    <li><strong>Legal Obligation:</strong> To comply with financial and regulatory requirements</li>
                    <li><strong>Legitimate Interest:</strong> For business operations and fraud prevention</li>
                    <li><strong>Consent:</strong> For optional features and communications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Policy Changes */}
            <Card data-section="changes">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Notification of Changes</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Material changes will be communicated via system notifications</li>
                    <li>The "Last Updated" date will be revised</li>
                    <li>Users will be prompted to review significant updates</li>
                    <li>Previous versions will be archived for reference</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  Continued use of RCCMS after changes constitutes acceptance of the updated policy. If you do not 
                  agree with changes, please discontinue use and contact your administrator.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card data-section="contact">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact & Data Protection Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>For privacy-related questions, concerns, or to exercise your rights, please contact:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">General Privacy Inquiries</h4>
                    <p className="text-muted-foreground">Email: privacy@rccms.com</p>
                    <p className="text-muted-foreground">
                      <Link href="/settings/support" className="text-primary hover:underline font-medium">
                        Support & Help Page
                      </Link>
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">System Administrator</h4>
                    <p className="text-muted-foreground">Contact your organization's system administrator for:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs ml-2 mt-1">
                      <li>Account modifications</li>
                      <li>Data access requests</li>
                      <li>Permission changes</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold mb-2">Data Protection Officer (DPO)</h4>
                  <p className="text-muted-foreground">
                    For GDPR-related matters and formal complaints:
                  </p>
                  <p className="text-muted-foreground mt-2">Email: dpo@rccms.com</p>
                </div>
                <p className="text-muted-foreground text-xs mt-4">
                  You also have the right to lodge a complaint with your local data protection authority if you believe 
                  your privacy rights have been violated.
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-6">
              <p>© 2025 RCCMS. All rights reserved.</p>
              <p className="mt-2">
                This privacy policy is effective as of December 2025 and applies to all users of the RCCMS platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
