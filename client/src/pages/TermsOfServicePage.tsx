import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  ArrowLeft, FileText, ShieldCheck, Users, Lock, AlertTriangle, 
  Scale, Globe, Server, Clock, Ban, Mail, Gavel, Shield
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from 'react';

export default function TermsOfServicePage() {
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
    { id: 'acceptance', title: 'Acceptance of Terms', icon: FileText },
    { id: 'license', title: 'License & Usage', icon: ShieldCheck },
    { id: 'accounts', title: 'User Accounts', icon: Users },
    { id: 'responsibilities', title: 'User Responsibilities', icon: Shield },
    { id: 'data', title: 'Data Accuracy', icon: FileText },
    { id: 'availability', title: 'System Availability', icon: Server },
    { id: 'prohibited', title: 'Prohibited Activities', icon: Ban },
    { id: 'intellectual', title: 'Intellectual Property', icon: Scale },
    { id: 'liability', title: 'Limitation of Liability', icon: AlertTriangle },
    { id: 'compliance', title: 'Legal Compliance', icon: Gavel },
    { id: 'termination', title: 'Termination', icon: Lock },
    { id: 'dispute', title: 'Dispute Resolution', icon: Scale },
    { id: 'modifications', title: 'Modifications', icon: Clock },
    { id: 'contact', title: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: December 2025</p>
          </div>
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
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 hover-elevate active-elevate-2 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
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
            {/* Acceptance */}
            <Card data-section="acceptance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  By accessing and using RCCMS (Rental Car Contract Management System), you acknowledge that you have 
                  read, understood, and agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold mb-2">Important Notice</p>
                  <p className="text-muted-foreground">
                    If you do not agree with any part of these terms, you must immediately discontinue use of the system 
                    and contact your system administrator. Continued use constitutes acceptance of these terms.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  These terms apply to all users of the system, regardless of role (Admin, Manager, Staff, or Viewer).
                </p>
              </CardContent>
            </Card>

            {/* License & Usage */}
            <Card data-section="license">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  2. System License and Usage Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="grant" data-testid="accordion-license-grant">
                    <AccordionTrigger>License Grant</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>
                        Your organization has been granted a non-exclusive, non-transferable license to use RCCMS 
                        for internal business operations related to rental car contract management.
                      </p>
                      <p className="text-muted-foreground">
                        This license permits you to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Create and manage rental contracts</li>
                        <li>Store customer and vehicle information</li>
                        <li>Process payments and financial transactions</li>
                        <li>Generate reports and analytics</li>
                        <li>Access the system within your assigned role permissions</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="restrictions" data-testid="accordion-license-restrictions">
                    <AccordionTrigger>Usage Restrictions</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>You must NOT:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Reverse engineer, decompile, or disassemble the software</li>
                        <li>Modify, adapt, or create derivative works</li>
                        <li>Resell, redistribute, or sublicense access to the system</li>
                        <li>Remove or alter any proprietary notices or labels</li>
                        <li>Use the system for illegal or unauthorized purposes</li>
                        <li>Share login credentials with unauthorized individuals</li>
                        <li>Attempt to circumvent security measures or access controls</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="scope" data-testid="accordion-usage-scope">
                    <AccordionTrigger>Scope of Use</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        RCCMS is designed exclusively for rental car contract management. Use for other purposes 
                        requires prior written authorization. The system should be used solely within your organization 
                        and not as a service for external clients.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card data-section="accounts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  3. User Accounts and Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="creation" data-testid="accordion-account-creation">
                    <AccordionTrigger>Account Creation & Management</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>User accounts are created by system administrators only</li>
                        <li>Each user must have a unique username and strong password</li>
                        <li>Users are assigned specific roles with appropriate permissions</li>
                        <li>Account sharing is strictly prohibited</li>
                        <li>Default passwords must be changed on first login</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="security" data-testid="accordion-account-security">
                    <AccordionTrigger>Account Security Responsibilities</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>You are responsible for:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Maintaining the confidentiality of your credentials</li>
                        <li>Using strong, unique passwords</li>
                        <li>Logging out when leaving your workstation</li>
                        <li>All activities performed under your account</li>
                        <li>Immediately reporting unauthorized access or security breaches</li>
                        <li>Not sharing your password with anyone, including IT staff</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="roles" data-testid="accordion-user-roles">
                    <AccordionTrigger>User Roles & Permissions</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <div className="grid gap-3">
                        <div className="p-3 rounded-lg border">
                          <p className="font-semibold">Admin</p>
                          <p className="text-muted-foreground text-xs">Full system access, user management, settings configuration</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="font-semibold">Manager</p>
                          <p className="text-muted-foreground text-xs">Contract management, reports, financial operations</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="font-semibold">Staff</p>
                          <p className="text-muted-foreground text-xs">Day-to-day operations, contract creation, basic reporting</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="font-semibold">Viewer</p>
                          <p className="text-muted-foreground text-xs">Read-only access to permitted data</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-3">
                        Attempting to access features or data beyond your assigned permissions may result in account suspension.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card data-section="responsibilities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  4. User Responsibilities and Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>As a user of RCCMS, you agree to:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Data Integrity
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Enter accurate and complete information</li>
                      <li>Verify data before submission</li>
                      <li>Update outdated information promptly</li>
                      <li>Maintain data quality standards</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Security Compliance
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Follow security protocols</li>
                      <li>Report security incidents immediately</li>
                      <li>Comply with access control policies</li>
                      <li>Protect sensitive information</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      Legal Compliance
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Adhere to applicable laws and regulations</li>
                      <li>Respect customer privacy rights</li>
                      <li>Maintain confidentiality</li>
                      <li>Follow anti-fraud procedures</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Professional Conduct
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Use the system respectfully</li>
                      <li>Cooperate with administrators</li>
                      <li>Report issues promptly</li>
                      <li>Assist with audits when requested</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Accuracy */}
            <Card data-section="data">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  5. Data Accuracy and Responsibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Users are solely responsible for the accuracy, completeness, and legality of data entered into RCCMS.
                </p>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="customer-data" data-testid="accordion-customer-data-accuracy">
                    <AccordionTrigger>Customer Information</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Verify national IDs, passports, and licenses are valid</li>
                        <li>Ensure contact information is current and accurate</li>
                        <li>Confirm customer eligibility for rental services</li>
                        <li>Maintain customer privacy and confidentiality</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contract-data" data-testid="accordion-contract-accuracy">
                    <AccordionTrigger>Contract Details</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Verify rental dates, rates, and terms are correct</li>
                        <li>Ensure pricing calculations are accurate</li>
                        <li>Document all agreed-upon terms and conditions</li>
                        <li>Obtain proper authorization before finalizing contracts</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vehicle-data" data-testid="accordion-vehicle-accuracy">
                    <AccordionTrigger>Vehicle Inspections</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Conduct thorough pre-delivery and post-return inspections</li>
                        <li>Photograph all vehicle angles as required</li>
                        <li>Record accurate odometer and fuel level readings</li>
                        <li>Document all damage, scratches, or condition issues</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        The system maintains comprehensive audit logs of all data modifications for accountability purposes.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* System Availability */}
            <Card data-section="availability">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  6. System Availability and Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-semibold mb-2">Service Level Target: 99.9% Uptime</p>
                  <p className="text-muted-foreground text-sm">
                    While we strive for maximum availability, the system may occasionally be unavailable.
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Planned Downtime</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Scheduled maintenance and updates</li>
                      <li>Security patches and improvements</li>
                      <li>Database optimization</li>
                      <li>Feature deployments</li>
                    </ul>
                    <p className="text-muted-foreground text-sm mt-2">
                      We will provide advance notice of planned maintenance whenever possible.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Unplanned Interruptions</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Infrastructure issues beyond our control</li>
                      <li>Third-party service outages (hosting, database)</li>
                      <li>Emergency security responses</li>
                      <li>Force majeure events</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-primary">
                  <p className="font-semibold mb-2">Your Responsibility</p>
                  <p className="text-muted-foreground text-sm">
                    We recommend maintaining manual backup procedures for critical operations and not solely 
                    relying on system availability during peak business hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card data-section="prohibited">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-primary" />
                  7. Prohibited Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="font-semibold">The following activities are strictly prohibited:</p>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border border-destructive/30">
                    <h4 className="font-semibold text-destructive mb-2">Security Violations</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                      <li>Attempting to gain unauthorized access to system resources</li>
                      <li>Bypassing role-based access controls or audit mechanisms</li>
                      <li>Introducing malicious code, viruses, or harmful software</li>
                      <li>Exploiting security vulnerabilities</li>
                      <li>Conducting penetration testing without authorization</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-destructive/30">
                    <h4 className="font-semibold text-destructive mb-2">Illegal Activities</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                      <li>Using the system for illegal purposes</li>
                      <li>Facilitating fraud or money laundering</li>
                      <li>Violating local, state, or national laws</li>
                      <li>Infringing on intellectual property rights</li>
                      <li>Harassment or discriminatory practices</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-destructive/30">
                    <h4 className="font-semibold text-destructive mb-2">System Abuse</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                      <li>Interfering with other users' access or system performance</li>
                      <li>Excessive automated requests (API abuse)</li>
                      <li>Intentionally corrupting data or databases</li>
                      <li>Attempting to disable audit logging</li>
                      <li>Reverse engineering the system architecture</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="font-semibold text-destructive mb-2">Consequences</p>
                  <p className="text-muted-foreground text-sm">
                    Violations may result in immediate account suspension, termination, legal action, and 
                    notification to law enforcement authorities as appropriate.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card data-section="intellectual">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  8. Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Our Ownership</h4>
                    <p className="text-muted-foreground mt-2">
                      RCCMS, including its source code, design, features, functionality, and documentation, is owned by 
                      us and protected by copyright, trademark, and other intellectual property laws. All rights are reserved.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Your Data Ownership</h4>
                    <p className="text-muted-foreground mt-2">
                      You retain all rights to data you input into the system (customer records, contracts, etc.). 
                      We do not claim ownership of your business data.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Limited License to Use Your Data</h4>
                    <p className="text-muted-foreground mt-2">
                      By using RCCMS, you grant us a limited license to process and store your data for the purpose 
                      of providing the service. This includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Storing data in our database infrastructure</li>
                      <li>Processing data to generate reports and analytics</li>
                      <li>Backing up data for recovery purposes</li>
                      <li>Analyzing usage patterns for system improvements (anonymized)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Trademarks</h4>
                    <p className="text-muted-foreground mt-2">
                      RCCMS and associated logos are trademarks. You may not use these marks without prior written permission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability */}
            <Card data-section="liability">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  9. Limitation of Liability and Warranties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="warranty" data-testid="accordion-warranty-disclaimer">
                    <AccordionTrigger>Warranty Disclaimer</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="font-semibold">RCCMS IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
                      <p className="text-muted-foreground">
                        We disclaim all warranties, express or implied, including but not limited to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Warranties of merchantability</li>
                        <li>Fitness for a particular purpose</li>
                        <li>Non-infringement</li>
                        <li>Uninterrupted or error-free operation</li>
                        <li>Complete accuracy of data or calculations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="exclusions" data-testid="accordion-liability-exclusions">
                    <AccordionTrigger>Liability Exclusions</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>To the maximum extent permitted by law, we shall NOT be liable for:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Direct, indirect, incidental, or consequential damages</li>
                        <li>Loss of data, profits, revenue, or business opportunities</li>
                        <li>Damages from system errors, bugs, or user errors</li>
                        <li>Third-party actions or security breaches</li>
                        <li>Damages from system downtime or data loss</li>
                        <li>Business decisions made based on system data</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Some jurisdictions do not allow limitation of liability for certain damages. 
                        In such cases, our liability is limited to the maximum extent permitted by law.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cap" data-testid="accordion-liability-cap">
                    <AccordionTrigger>Liability Cap</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        In no event shall our total liability exceed the amount paid by your organization for 
                        the service during the twelve (12) months preceding the claim.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="indemnification" data-testid="accordion-indemnification">
                    <AccordionTrigger>Indemnification</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Your use or misuse of the system</li>
                        <li>Violation of these Terms of Service</li>
                        <li>Violation of applicable laws or regulations</li>
                        <li>Infringement of third-party rights</li>
                        <li>Data you input into the system</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Compliance */}
            <Card data-section="compliance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  10. Compliance and Legal Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Your organization is responsible for ensuring compliance with all applicable laws and regulations:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Data Protection</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>GDPR (European Union)</li>
                      <li>CCPA (California)</li>
                      <li>PDPA (Singapore, Thailand, etc.)</li>
                      <li>Local privacy regulations</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Financial Regulations</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Tax reporting requirements</li>
                      <li>Anti-money laundering (AML)</li>
                      <li>Financial record keeping</li>
                      <li>Audit compliance</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Industry Regulations</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Vehicle rental regulations</li>
                      <li>Consumer protection laws</li>
                      <li>Insurance requirements</li>
                      <li>Licensing and permits</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Customer Verification</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Identity verification (KYC)</li>
                      <li>License validation</li>
                      <li>Age verification</li>
                      <li>Credit checks (if applicable)</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-sm">
                    While RCCMS provides tools to support compliance, ultimate responsibility for legal compliance 
                    rests with your organization and its designated compliance officers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card data-section="termination">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  11. Termination and Account Suspension
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="user-termination" data-testid="accordion-user-termination">
                    <AccordionTrigger>User Account Termination</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>User accounts may be disabled or terminated by administrators for:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Violation of these Terms of Service</li>
                        <li>Security breaches or suspicious activity</li>
                        <li>Employee separation from the organization</li>
                        <li>Extended periods of inactivity</li>
                        <li>Administrative or operational requirements</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Note:</strong> System administrator accounts cannot be disabled by other users to prevent 
                        lockout situations.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="service-termination" data-testid="accordion-service-termination">
                    <AccordionTrigger>Service Termination</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>We reserve the right to suspend or terminate service:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>For non-payment (if applicable)</li>
                        <li>For serious violations of terms</li>
                        <li>If required by law or regulatory authorities</li>
                        <li>To protect system integrity or other users</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        In case of service termination, we will provide reasonable notice and opportunity to 
                        export your data, except in cases of severe violations.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="effect" data-testid="accordion-termination-effect">
                    <AccordionTrigger>Effect of Termination</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p>Upon termination:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Access to the system is immediately revoked</li>
                        <li>Data retention follows our standard policies</li>
                        <li>Audit logs are preserved for compliance</li>
                        <li>Outstanding obligations remain in effect</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card data-section="dispute">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  12. Dispute Resolution and Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Informal Resolution</h4>
                    <p className="text-muted-foreground mt-2">
                      Before initiating any formal proceedings, parties agree to attempt informal resolution through 
                      good-faith negotiation for at least 30 days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Arbitration</h4>
                    <p className="text-muted-foreground mt-2">
                      If informal resolution fails, disputes shall be resolved through binding arbitration in accordance 
                      with the rules of [Applicable Arbitration Body] in [Jurisdiction].
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Governing Law</h4>
                    <p className="text-muted-foreground mt-2">
                      These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], 
                      without regard to conflict of law principles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Venue</h4>
                    <p className="text-muted-foreground mt-2">
                      Any legal action must be brought exclusively in the courts of [Jurisdiction].
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-sm">
                    <strong>Class Action Waiver:</strong> You agree to resolve disputes individually and waive any 
                    right to participate in class actions or representative proceedings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Modifications */}
            <Card data-section="modifications">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  13. Modifications to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                  immediately upon posting to the system.
                </p>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Material Changes</h4>
                    <p className="text-muted-foreground text-sm">
                      For significant changes affecting your rights or obligations, we will provide advance notice 
                      through system notifications or email.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Your Responsibility</h4>
                    <p className="text-muted-foreground text-sm">
                      You are responsible for reviewing these terms periodically. Continued use after changes 
                      constitutes acceptance of the modified terms.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Objection to Changes</h4>
                    <p className="text-muted-foreground text-sm">
                      If you do not agree with modified terms, you must discontinue use of the system and contact 
                      your administrator.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card data-section="contact">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  14. Contact Information and Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>For questions, support, or concerns regarding these Terms of Service:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Technical Support</h4>
                    <p className="text-muted-foreground text-sm">Visit the Support & Help page within the system</p>
                    <p className="text-muted-foreground text-sm">Email: support@rccms.com</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Legal Inquiries</h4>
                    <p className="text-muted-foreground text-sm">Email: legal@rccms.com</p>
                    <p className="text-muted-foreground text-sm">Response time: 5 business days</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">System Administrator</h4>
                    <p className="text-muted-foreground text-sm">Contact your organization's designated administrator for:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs ml-2 mt-1">
                      <li>Account issues</li>
                      <li>Permission requests</li>
                      <li>Internal policies</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Feedback & Suggestions</h4>
                    <p className="text-muted-foreground text-sm">Email: feedback@rccms.com</p>
                    <p className="text-muted-foreground text-sm">We value your input for improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Miscellaneous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  15. Miscellaneous Provisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="severability" data-testid="accordion-severability">
                    <AccordionTrigger>Severability</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        If any provision of these Terms is found to be invalid or unenforceable, the remaining 
                        provisions shall continue in full force and effect.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="waiver" data-testid="accordion-waiver">
                    <AccordionTrigger>Waiver</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        Our failure to enforce any right or provision shall not constitute a waiver of such right 
                        or provision.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="assignment" data-testid="accordion-assignment">
                    <AccordionTrigger>Assignment</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        You may not assign or transfer these Terms without our written consent. We may assign our 
                        rights and obligations without restriction.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="entire" data-testid="accordion-entire-agreement">
                    <AccordionTrigger>Entire Agreement</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                        and us regarding use of RCCMS.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="survival" data-testid="accordion-survival">
                    <AccordionTrigger>Survival</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        Provisions that by their nature should survive termination (liability limitations, 
                        intellectual property, dispute resolution) shall survive termination of these Terms.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-6 border-t">
              <p className="font-semibold mb-2">Acknowledgment</p>
              <p>
                By using RCCMS, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms of Service.
              </p>
              <p className="mt-4">© 2025 RCCMS. All rights reserved.</p>
              <p className="mt-2 text-xs">
                These Terms of Service are effective as of December 2025 and apply to all users of the RCCMS platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
