#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the compiled CSS
const css = fs.readFileSync(path.join(__dirname, 'assets/styles.css'), 'utf-8');

// Screen definitions organized by category
const screens = {
  dashboard: [
    { file: 'dashboard.html', title: 'Main Dashboard', description: 'Multi-tab dashboard with My Day, Company Today, and Executive Overview tabs' },
    { file: 'my-day-tab.html', title: 'My Day Tab', description: 'Personal performance metrics and pending tasks overview' },
    { file: 'company-today-tab.html', title: 'Company Today Tab', description: 'Real-time operational snapshot with fleet status and pending actions' },
    { file: 'executive-overview-tab.html', title: 'Executive Overview Tab', description: 'Strategic analytics, revenue trends, and geographic distribution' },
  ],
  contracts: [
    { file: 'contracts.html', title: 'Contracts List', description: 'Browse, filter, and manage all rental contracts' },
    { file: 'contract-form.html', title: 'Contract Form', description: 'Create and edit rental contracts with validation' },
    { file: 'contract-view.html', title: 'Contract View', description: 'Detailed contract information with payments and history' },
    { file: 'contract-form-sample.html', title: 'Contract Form Sample', description: 'Demo contract form with type-ahead search implementation' },
  ],
  entities: [
    { file: 'customers.html', title: 'Customers', description: 'Customer database management with risk scoring' },
    { file: 'vehicles.html', title: 'Vehicles', description: 'Fleet management, vehicle tracking, and maintenance' },
    { file: 'users.html', title: 'Users', description: 'System user management with role-based access control' },
    { file: 'sponsors.html', title: 'Sponsors', description: 'Sponsor/guarantor management for contracts' },
    { file: 'companies.html', title: 'Companies', description: 'Corporate client and B2B customer management' },
    { file: 'branches.html', title: 'Branches', description: 'Multi-branch location management' },
  ],
  drivers: [
    { file: 'drivers.html', title: 'Drivers', description: 'Professional driver database and management' },
    { file: 'driver-scheduling.html', title: 'Driver Scheduling', description: 'Schedule and assign drivers to contracts' },
    { file: 'driver-companies.html', title: 'Driver Companies', description: 'Manage external driver service companies' },
    { file: 'toll-management.html', title: 'Toll Management', description: 'UAE Salik toll tracking and management' },
    { file: 'traffic-fines.html', title: 'Traffic Fines', description: 'Traffic violation tracking and processing' },
    { file: 'vehicle-transfers.html', title: 'Vehicle Transfers', description: 'Inter-branch vehicle transfer management' },
  ],
  insurance: [
    { file: 'insurance-claims.html', title: 'Insurance Claims', description: 'Insurance claim management and tracking' },
    { file: 'insurance-claim-form.html', title: 'Insurance Claim Form', description: 'Submit and edit insurance claims' },
    { file: 'vehicle-maintenance.html', title: 'Vehicle Maintenance', description: 'Maintenance scheduling, tracking, and history' },
    { file: 'vehicle-accessories.html', title: 'Vehicle Accessories', description: 'Accessory inventory and assignment' },
    { file: 'incidents.html', title: 'Incidents', description: 'Incident reporting and tracking system' },
  ],
  financialReports: [
    { file: 'financial-reports.html', title: 'Financial Reports', description: 'Comprehensive financial analytics dashboard' },
    { file: 'revenue-trends-report.html', title: 'Revenue Trends Report', description: 'Revenue analysis over time with trends' },
    { file: 'revenue-forecast-report.html', title: 'Revenue Forecast Report', description: 'Predictive revenue analytics and forecasting' },
    { file: 'collection-performance-report.html', title: 'Collection Performance Report', description: 'Payment collection efficiency metrics' },
    { file: 'unclosed-contracts-report.html', title: 'Unclosed Contracts Report', description: 'Contracts pending closure tracking' },
  ],
  operationalReports: [
    { file: 'operational-reports.html', title: 'Operational Reports', description: 'Operations analytics and KPI dashboard' },
    { file: 'fleet-performance-report.html', title: 'Fleet Performance Report', description: 'Vehicle utilization and performance metrics' },
    { file: 'driver-utilization-report.html', title: 'Driver Utilization Report', description: 'Driver performance and utilization analytics' },
    { file: 'driver-revenue-cost-report.html', title: 'Driver Revenue & Cost Report', description: 'Driver service financial analysis' },
    { file: 'contract-analytics-report.html', title: 'Contract Analytics Report', description: 'Contract trend and pattern analysis' },
    { file: 'insurance-reports.html', title: 'Insurance Reports', description: 'Insurance claim analytics and trends' },
  ],
  customerReports: [
    { file: 'customer-reports.html', title: 'Customer Reports', description: 'Customer analytics and behavior insights' },
    { file: 'customer-risk-scoring.html', title: 'Customer Risk Scoring', description: 'ML-based customer risk assessment system' },
    { file: 'customer-churn-risk-report.html', title: 'Customer Churn Risk Report', description: 'Customer retention and churn prediction' },
    { file: 'payment-default-prediction.html', title: 'Payment Default Prediction', description: 'ML-based payment default risk prediction' },
    { file: 'audit-reports.html', title: 'Audit Reports', description: 'Compliance and audit trail reporting' },
    { file: 'access-report.html', title: 'Access Report', description: 'User access and permission audit logs' },
  ],
  predictive: [
    { file: 'fleet-utilization-forecast.html', title: 'Fleet Utilization Forecast', description: 'Predict future fleet usage patterns' },
    { file: 'location-demand-forecast.html', title: 'Location Demand Forecast', description: 'Geographic demand prediction analytics' },
    { file: 'maintenance-cost-forecast.html', title: 'Maintenance Cost Forecast', description: 'Predictive maintenance cost analysis' },
  ],
  settings: [
    { file: 'settings.html', title: 'User Settings', description: 'Personal preferences, profile, and security' },
    { file: 'company-settings.html', title: 'Company Settings', description: 'Organization-wide system configuration' },
    { file: 'financial-settings.html', title: 'Financial Settings', description: 'Currency, tax, and financial configuration' },
    { file: 'rental-rate-plans.html', title: 'Rental Rate Plans', description: 'Dynamic pricing and rate plan management' },
    { file: 'public-holidays.html', title: 'Public Holidays', description: 'UAE holiday calendar management' },
  ],
  communications: [
    { file: 'campaign-management.html', title: 'Campaign Management', description: 'Marketing campaign creation and management' },
    { file: 'campaign-analytics.html', title: 'Campaign Analytics', description: 'Campaign performance tracking and ROI' },
    { file: 'automated-reminders.html', title: 'Automated Reminders', description: 'Smart notification engine with 30+ templates' },
    { file: 'notification-templates.html', title: 'Notification Templates', description: 'Bilingual notification template management' },
    { file: 'manual-notification-sender.html', title: 'Manual Notification Sender', description: 'Send custom notifications to customers' },
    { file: 'communication-providers.html', title: 'Communication Providers', description: 'SMS/Email provider configuration and routing' },
    { file: 'communication-logs.html', title: 'Communication Logs', description: 'Message delivery tracking and analytics' },
  ],
  system: [
    { file: 'audit-logs.html', title: 'Audit Logs', description: 'System-wide activity tracking and compliance' },
    { file: 'user-activity.html', title: 'User Activity', description: 'User action monitoring and analytics' },
    { file: 'system-errors.html', title: 'System Errors', description: 'Error tracking, debugging, and resolution' },
    { file: 'performance-monitoring.html', title: 'Performance Monitoring', description: 'System health and performance metrics' },
  ],
  workflows: [
    { file: 'approval-workflows.html', title: 'Approval Workflows', description: 'Multi-level approval and workflow management' },
    { file: 'document-registry.html', title: 'Document Registry', description: 'Document management with expiry tracking' },
    { file: 'import-data.html', title: 'Import Data', description: 'Bulk data import utility with CSV/Excel support' },
  ],
  design: [
    { file: 'design-system-showcase.html', title: 'Design System Showcase', description: 'Complete design pattern library with 12 dashboard variations' },
    { file: 'design-system-library.html', title: 'Design System Library', description: 'Component documentation and usage guidelines' },
    { file: 'dashboard-samples.html', title: 'Dashboard Design Samples', description: 'Interactive dashboard layout gallery with 12+ variations' },
    { file: 'design-samples.html', title: 'Design Samples', description: 'UI component showcase organized by category' },
    { file: 'design-samples-showcase.html', title: 'Design Samples Showcase', description: 'Interactive design pattern gallery' },
    { file: 'field-style-showcase.html', title: 'Field Style Showcase', description: 'Input field styling patterns and examples' },
    { file: 'provider-comparison.html', title: 'Provider Comparison', description: 'Communication provider comparison tools' },
  ],
  public: [
    { file: 'login.html', title: 'Login', description: 'User authentication with animated subtitle rotation' },
    { file: 'landing.html', title: 'Landing Page', description: 'Public landing page with hero section' },
    { file: 'about.html', title: 'About KarāraOS', description: 'About the platform and features' },
    { file: 'support-help.html', title: 'Support & Help', description: 'Help center, FAQs, and documentation' },
    { file: 'terms-of-service.html', title: 'Terms of Service', description: 'Legal terms and conditions' },
    { file: 'privacy-policy.html', title: 'Privacy Policy', description: 'Privacy and data protection policy' },
  ]
};

// Modal definitions
const modals = [
  { file: 'driver-assignment-modal.html', title: 'Driver Assignment Modal', description: 'Assign and manage drivers for rental contracts' },
  { file: 'vehicle-inspection-form.html', title: 'Vehicle Inspection Form', description: 'Pre-rental and post-rental vehicle inspection checklist' },
  { file: 'pdf-preview-modal.html', title: 'PDF Preview Modal', description: 'Document preview and download popup' },
  { file: 'edit-reason-dialog.html', title: 'Edit Reason Dialog', description: 'Audit trail justification for record modifications' },
];

// HTML template generator
function generateHTML(title, description, category) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KarāraOS</title>
    <meta name="description" content="${description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
${css}

/* Additional custom styles for documentation */
body {
    min-height: 100vh;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: 'Inter', sans-serif;
}

.doc-header {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    color: white;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.doc-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.doc-header p {
    font-size: 1.1rem;
    opacity: 0.95;
}

.doc-header .breadcrumb {
    font-size: 0.9rem;
    opacity: 0.85;
    margin-top: 1rem;
}

.doc-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
}

.doc-banner {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.doc-banner h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: hsl(var(--primary));
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    color: #0ea5e9;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
    margin-bottom: 1rem;
}

.back-link:hover {
    background: #f0f9ff;
    transform: translateX(-4px);
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.feature-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    padding: 1.5rem;
}

.feature-card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: hsl(var(--foreground));
}

.feature-card ul {
    list-style: none;
    padding: 0;
}

.feature-card li {
    padding: 0.5rem 0;
    color: hsl(var(--muted-foreground));
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.feature-card li:before {
    content: "✓";
    color: hsl(var(--primary));
    font-weight: bold;
}

.screenshot-placeholder {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 2px dashed #0ea5e9;
    border-radius: 8px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2rem 0;
    color: #0369a1;
    font-size: 1.2rem;
    font-weight: 500;
}

.lang-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    z-index: 1000;
}

[dir="rtl"] {
    font-family: 'Cairo', sans-serif;
}
    </style>
</head>
<body>
    <div class="lang-toggle">
        <button onclick="toggleLanguage()" style="border: none; background: none; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: #0ea5e9;">
            <span id="lang-text">العربية | EN</span>
        </button>
    </div>

    <div class="doc-header">
        <div class="breadcrumb">
            <a href="../index.html" style="color: white; text-decoration: underline;">Home</a> / 
            <span>${category}</span> / 
            <span>${title}</span>
        </div>
        <h1>${title}</h1>
        <p>${description}</p>
    </div>

    <div class="doc-content">
        <a href="../index.html" class="back-link">
            ← Back to Documentation Index
        </a>

        <div class="doc-banner">
            <h2>📄 Screen Documentation</h2>
            <p>This page represents the <strong>${title}</strong> screen from the KarāraOS application. This is a static HTML documentation page showing the layout and key features.</p>
        </div>

        <div class="screenshot-placeholder">
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                <div>${title} Screenshot</div>
                <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">Interactive implementation available in the application</div>
            </div>
        </div>

        <div class="feature-grid">
            <div class="feature-card">
                <h3>Key Features</h3>
                <ul>
                    <li>Bilingual Support (English/Arabic)</li>
                    <li>Material Design 3 Aesthetic</li>
                    <li>Responsive Layout</li>
                    <li>Real-time Data Updates</li>
                    <li>Role-based Access Control</li>
                </ul>
            </div>

            <div class="feature-card">
                <h3>Technical Details</h3>
                <ul>
                    <li>React + TypeScript</li>
                    <li>TanStack Query for Data</li>
                    <li>Tailwind CSS Styling</li>
                    <li>Shadcn/ui Components</li>
                    <li>Form Validation with Zod</li>
                </ul>
            </div>

            <div class="feature-card">
                <h3>User Experience</h3>
                <ul>
                    <li>Type-ahead Search</li>
                    <li>Keyboard Shortcuts</li>
                    <li>Loading States</li>
                    <li>Error Handling</li>
                    <li>Success Notifications</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        function toggleLanguage() {
            const html = document.documentElement;
            const currentDir = html.getAttribute('dir');
            const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
            const newLang = newDir === 'rtl' ? 'ar' : 'en';
            html.setAttribute('dir', newDir);
            html.setAttribute('lang', newLang);
        }
    </script>
</body>
</html>`;
}

// Create directories
const screensDir = path.join(__dirname, 'screens');
const modalsDir = path.join(__dirname, 'modals');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}
if (!fs.existsSync(modalsDir)) {
  fs.mkdirSync(modalsDir, { recursive: true });
}

// Generate all screen HTML files
let totalGenerated = 0;

for (const [category, screenList] of Object.entries(screens)) {
  console.log(`Generating ${screenList.length} screens for category: ${category}...`);
  for (const screen of screenList) {
    const html = generateHTML(screen.title, screen.description, category);
    fs.writeFileSync(path.join(screensDir, screen.file), html);
    totalGenerated++;
  }
}

// Generate all modal HTML files
console.log(`Generating ${modals.length} modal dialogs...`);
for (const modal of modals) {
  const html = generateHTML(modal.title, modal.description, 'Modals');
  fs.writeFileSync(path.join(modalsDir, modal.file), html);
  totalGenerated++;
}

console.log(`\n✅ Successfully generated ${totalGenerated} HTML documentation files!`);
console.log(`   📁 Screens: ${Object.values(screens).flat().length} files`);
console.log(`   💬 Modals: ${modals.length} files`);
console.log(`\nOpen docs/index.html to browse all documentation.`);
