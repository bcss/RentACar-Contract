# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform designed for multi-branch operations and driver services. It streamlines the entire rental lifecycle, featuring robust security, role-based access control, dual audit trails, insurance claims tracking, and inter-branch vehicle transfers. The system includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. RCCMS aims to enhance operational efficiency and market reach for rental car businesses through a comprehensive, secure, and user-friendly solution, supporting global deployment and future mobile integration. The system also includes advanced analytics, predictive intelligence reports, and a campaign management system.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (November 2025)

### Quality Assurance & Documentation
- **Comprehensive System Audit:** Complete 60-page audit document analyzing all 23 specialized modules with detailed workflow analysis, schema validation, and implementation correctness verification (`docs/COMPREHENSIVE_SYSTEM_AUDIT.md`)
- **Unified Design System:** 1,200+ line design guidelines covering entire application with 15 sections including Material Design 3 principles, bilingual support, accessibility (WCAG 2.1 AA), and responsive design patterns (`design_guidelines.md`)
- **Security Enhancements:** Implemented hybrid rate limiting with standalone `rateLimiters.ts` module, breaking circular dependencies and providing production-ready brute-force protection

### UI/UX Improvements
- **Sidebar Reorganization:** Restructured navigation into 6 logical categories (Dashboard, Operations, Masters, Reports, Administration, Settings) with full bilingual tooltips and RTL/LTR support
- **RTL/LTR Support:** Automatic direction switching (`dir` attribute) and font family changes (Cairo for Arabic, Inter for English) in LanguageContext
- **Export Functionality:** Universal RFC 4180 compliant CSV export across ALL reports (Financial, Operational, Customer, Insurance, Audit, 6 Predictive Intelligence, 8 Specialized Operational, and 5 Enhanced Analytics reports). PDF export available for major report categories with chart embedding.
- **Design System Showcase:** Comprehensive showcase featuring 12 production-ready dashboard variations (Executive, Operations, Financial, Fleet, Customer, Risk, Marketing, Branch Manager, Predictive, Audit, Communications, Driver Operations) with live examples demonstrating consistent design patterns, Material Design 3 principles, and bilingual support (accessible via Settings > Design System Showcase).
- **Translation Coverage:** 100% bilingual support with complete English/Arabic translations across all 23+ modules, including new Design System Showcase, all navigation items, and system messages. Full RTL/LTR layout support with automatic direction switching and font family changes.

### Technical Infrastructure
- **Export Utilities:**
  - `client/src/utils/csvExport.ts` - RFC 4180 compliant CSV generation with proper field escaping, null safety, and memory leak prevention
  - `client/src/utils/contractPDF.ts` - Contract PDF generation with multi-page support
  - `client/src/utils/chartExport.ts` - Chart image capture for PDF embedding
  - `server/utils/exportHelpers.ts` - Server-side PDF/Excel generation with company headers, tables, and chart integration
- **Rate Limiting:** Standalone module with hybrid key generation (user ID for authenticated, IP for unauthenticated) preventing circular dependencies

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout, data visualization (recharts), tabbed views, enhanced filtering, responsive design, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality.
- **Key Features:** Dashboard, tabbed dialog forms, advanced analytics and reporting with PDF/Excel export, full CRUD pages for Branches, Public Holidays, Drivers, Driver Companies, Vehicle Transfers, and Campaign Management. Six production-ready predictive intelligence reports are integrated.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation, CSRF protection, PII sanitization, password complexity/rotation, security headers (Helmet.js), robust business logic validation adhering to GDPR, PCI-DSS, and OWASP Top 10:2021 standards.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** Prepared endpoints for future mobile applications with customer-facing authentication.
- **Automation Orchestrator:** Background job scheduler with cron jobs for nightly risk scoring, document expiry checks, and contract/payment due reminders.
- **Communications Platform:** Multi-provider SMS/Email infrastructure with priority-based routing and automatic failover.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive 40+ table schema supporting complete UAE rental car operations, including:
    - Core entities: Users, Customers, Vehicles, Contracts, Payments, Branches, Drivers, Driver Companies, Sponsors, Public Holidays.
    - Specialized modules: Toll Management, Compliance & Safety, Fleet Operations, Accessories & Upsell, Driver Scheduling, Automation, Approvals, Risk Management, Document Registry.
    - Architecture: 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, disable-only architecture.

### Core Features
- **Rental Lifecycle Management:** 4-state workflow, hardened edit validation, contract timeline.
- **Financials:** Automated calculations, configurable settings, enhanced payment tracking.
- **Reporting & Analytics:** Comprehensive reporting with `recharts`, production-ready CSV/PDF export across all 20+ reports. Universal RFC 4180 compliant CSV utility ensures data integrity with proper escaping and null safety. Predictive reports: revenue forecast, fleet utilization, customer churn risk, maintenance cost, payment default prediction, and location demand forecast.
- **Vehicle Management:** Enhanced inspection, automatic status synchronization, inter-branch transfers. Complete UAE toll integration, traffic fines tracking, accidents & incidents management, fleet maintenance, dynamic pricing, and accessories management.
- **Driver Service Module:** Professional driver assignment infrastructure, UAE market compliance, driver master data, outsource companies management, rate cards, and schedule management.
- **Customer Risk Scoring:** Production-ready hybrid override algorithm with automated nightly recalculations.
- **Document Registry & Management:** Centralized tracking with intelligent auto-seeding and automated expiry monitoring.
- **Automated Reminders Engine:** Multi-channel (email/SMS) bilingual notification system with templates and CRUD APIs.
- **Campaign Management System:** UI for creating and managing branch-scoped or organization-wide campaigns with RBAC, approval workflows, recipient filtering, scheduling, and delivery tracking.
- **Internationalization:** Complete English/Arabic translations via i18next for all features, including RTL/LTR layout support and localized CSV exports.
- **Security & Compliance:** App access logging, granular role-based permissions, QR Code Service for contract verification.

## External Dependencies

### Third-Party Services
- **Neon Database:** Serverless PostgreSQL hosting.
- **Google Fonts:** Inter, Cairo, and JetBrains Mono.
- **Material Icons:** Icon library.
- **Twilio:** Primary SMS provider.
- **SendGrid:** Primary Email provider.
- **Gmail SMTP:** Fallback Email provider.

### Key NPM Packages
- **Database:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`.
- **Authentication:** `passport`, `passport-local`, `bcrypt`, `express-session`, `connect-pg-simple`.
- **UI Components:** `@radix-ui/*`, `@tanstack/react-query`.
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`.
- **Communications:** `qrcode`, `jsonwebtoken`, `node-cron`.