# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform designed for multi-branch operations and driver services. It streamlines the entire rental lifecycle, features robust security, role-based access control, dual audit trails, insurance claims tracking, and inter-branch vehicle transfers. The system includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. RCCMS aims to enhance operational efficiency and market reach for rental car businesses through a comprehensive, secure, and user-friendly solution, supporting global deployment and future mobile integration.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout, data visualization (recharts), tabbed views, enhanced filtering, responsive design, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality.
- **Key Features:** Dashboard, tabbed dialog forms, advanced analytics and reporting with PDF/Excel export, full CRUD pages for Branches, Public Holidays, Drivers, Driver Companies, and Vehicle Transfers.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation, CSRF protection, PII sanitization, password complexity/rotation, security headers (Helmet.js), robust business logic validation adhering to GDPR, PCI-DSS, and OWASP Top 10:2021 standards.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** Prepared endpoints for future mobile applications with customer-facing authentication.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive 40+ table schema supporting complete UAE rental car operations, including:
    - Core entities: Users, Customers, Vehicles, Contracts, Payments, Branches, Drivers, Driver Companies, Sponsors, Public Holidays.
    - Specialized modules: Toll Management (Salik/Darb/Aber), Compliance & Safety (traffic fines, incidents), Fleet Operations (service records, rental rate plans), Accessories & Upsell, Driver Scheduling, Automation (reminders), Approvals, Risk Management, Document Registry.
    - Architecture: 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, disable-only architecture.

### Core Features
- **Rental Lifecycle Management:** 4-state workflow, hardened edit validation, contract timeline.
- **Financials:** Automated calculations, configurable settings, enhanced payment tracking.
- **Reporting & Analytics:** Comprehensive reporting with `recharts`, PDF/Excel export (Revenue Trends, Fleet Performance, Contract Analytics, Collection Performance, Driver Utilization, Driver Revenue vs. Cost Analysis).
- **Vehicle Management:** Enhanced inspection, automatic status synchronization, inter-branch transfers.
- **Toll Management System:** Complete UAE toll integration (Salik/Darb/Aber) with gate-level tracking, automatic fee assignment, and contract linking.
- **Traffic Fines & Violations:** RTA-compliant tracking, black points management, payment status, document uploads.
- **Accidents & Incidents Management:** Comprehensive tracking, insurance claim management, cost estimation, police report integration.
- **Fleet Maintenance & Service:** Vehicle service records, odometer tracking, cost logging, next service scheduling, depreciation tracking.
- **Dynamic Pricing System:** Rental rate plans with daily/weekly/monthly rates, seasonal pricing, promotional discounts.
- **Vehicle Accessories & Upsell:** Master catalog with inventory management and contract-level assignment.
- **Driver Scheduling & Attendance:** Shift management, branch/vehicle assignment, check-in/check-out, overtime calculation.
- **Automated Reminders Engine:** Multi-channel (email/SMS) bilingual notification system with 12 system templates and full CRUD APIs.
- **Approval Workflows:** Multi-level authorization for high-value transactions and modifications.
- **Customer Risk Scoring:** Production-ready hybrid override algorithm (payment history, violations, incidents, compliance) with calibrated payment curve, escalation overrides, and automated nightly recalculations.
- **Document Registry & Management:** Centralized tracking with intelligent auto-seeding from various entities and automated expiry monitoring.
- **Enhanced Sponsor Compliance:** Emirates ID verification, max exposure limits, blacklist reason documentation.
- **Driver Service Module:** Professional driver assignment infrastructure, UAE market compliance (surcharge, public holidays), driver master data, outsource companies management, rate cards, schedule management, and comprehensive reporting.
- **Branch Management System:** Multi-location operational support with hierarchy UI and inter-branch vehicle transfer workflow.
- **Public Holidays Management:** Full CRUD interface for UAE public holidays with emirate selection.
- **Security & Compliance:** App access logging, granular role-based permissions.
- **Data Handling:** Import data functionality for bulk master data and contracts.
- **PDF Integration:** Professional bilingual PDF generation for rental contracts.
- **QR Code Service:** JWT-based contract verification system with 30-day signed tokens embedded in contract PDFs.
- **Automation Orchestrator:** Background job scheduler with 4 active cron jobs: Nightly Risk Scoring, Document Expiry Check, Contract Expiry Reminders, Payment Due Reminders.
- **Internationalization:** Complete English/Arabic translations via i18next for all features.

## External Dependencies

### Third-Party Services
- **Neon Database:** Serverless PostgreSQL hosting.
- **Google Fonts:** Inter, Cairo, and JetBrains Mono.
- **Material Icons:** Icon library.

### Key NPM Packages
- **Database:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`.
- **Authentication:** `passport`, `passport-local`, `bcrypt`, `express-session`, `connect-pg-simple`.
- **UI Components:** `@radix-ui/*`, `@tanstack/react-query`.
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`.
- **Communications:** `qrcode`, `jsonwebtoken`, `node-cron` for automation.

## Recent Implementation (November 2025)

### Three-Phase Transformation Complete ✅

**Phase 1: Data & Automation Foundation**
- ✅ Customer Risk Scoring with nightly calculation (2 AM cron)
- ✅ Multi-Entity Document Registry with auto-seeding
- ✅ 12 Default Bilingual Reminder Templates
- ✅ QR Code Service (JWT-signed, 30-day expiry)
- ✅ Background Automation Orchestrator (4 active cron jobs)

**Phase 2: Experience & Navigation**
- ✅ Reorganized hierarchical sidebar menu
- ✅ 8 Advanced Analytical Reports with Recharts visualizations:
  - Customer Risk Trends Dashboard
  - Toll Expense vs Budget Analysis
  - Traffic Fine Aging & Recovery Report
  - Incident Cost & Liability Analysis
  - Maintenance Compliance Report
  - Driver Utilization & Overtime Report
  - Reminder Delivery SLA Report
  - Approval Turnaround Time Report
- ✅ All reports include filters, CSV export, and bilingual support

**Phase 3: Communications Platform**
- ✅ Multi-Provider SMS/Email Infrastructure
  - SMS: Twilio (primary), Mock (testing)
  - Email: SendGrid (primary), Gmail SMTP (fallback), Mock (testing)
- ✅ Priority-based routing with automatic failover
- ✅ Health monitoring and circuit breaking
- ✅ Communication Providers management UI
- ✅ Communication Logs viewer with delivery tracking
- ✅ Manual Notification Sender for testing
- ✅ 11 Automated Notification Touchpoints (event-driven + scheduled)

**Phase 3 Frontend: Predictive Intelligence Reports**
- ✅ 6 Production-Ready Predictive Report Pages with Recharts visualizations:
  - Revenue Forecast Report (time-series forecasting with confidence intervals)
  - Fleet Utilization Forecast (vehicle type capacity planning)
  - Customer Churn Risk Report (risk scoring with payment history analysis)
  - Maintenance Cost Forecast (vehicle age/mileage-based predictions)
  - Payment Default Prediction (overdue payment risk analysis)
  - Location Demand Forecast (emirate-based demand trends)
- ✅ Complete TypeScript interfaces in shared/schema.ts
- ✅ Filter components for date ranges, vehicle types, emirates, risk levels
- ✅ Summary statistics cards with warning thresholds
- ✅ CSV export functionality with memory leak prevention
- ✅ Full data-testid compliance for automated testing
- ✅ All query keys serialized with primitive values for cache stability

**Phase 4: Campaign Management System**
- ✅ Campaign Management UI with RBAC enforcement
  - Branch-scoped campaigns for Staff/Manager roles
  - Organization-wide campaigns for Admin role only
  - Multi-branch campaign selection for Admins
- ✅ Approval workflow integration
  - Staff campaigns auto-require approval
  - Admin/Manager campaigns with optional approval
- ✅ Recipient filtering and channel selection (Email/SMS/Both)
- ✅ Campaign status tracking (Draft → Pending Approval → Approved → Sent)
- ✅ Delivery tracking with success/failure counts
- ✅ Cost estimation and scheduling capabilities
- ✅ Bilingual campaign creation (English/Arabic)

### Current System Status
- **Application:** Running on port 5000
- **Cron Jobs:** 4 active (Risk Scoring 2AM, Document Expiry 8AM, Contract Reminders 9AM, Payment Reminders 10AM)
- **Predictive Reports:** 6 pages operational with backend integration
- **Campaign System:** Fully operational with RBAC and approval workflows
- **Production Readiness:** Ready for go-live (provider credentials required)
- **Documentation:** All 6 docs files updated + IMPLEMENTATION_STATUS.md added