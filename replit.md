# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform. It manages the complete rental lifecycle through a streamlined 4-state workflow (Draft → Active → Completed → Closed). Key capabilities include role-based access control, hardened security validation, comprehensive dual audit trails, insurance claims tracking, unclosed contract alerts, enhanced vehicle inspection documentation, and extensive admin configuration. The system supports global deployment without source code modifications, integrates Material Design principles and RTL/LTR layouts, and its backend is prepared for future Staff and Customer mobile applications.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR switching, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout, data visualization (recharts), tabbed views, enhanced filtering, responsive design, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality.
- **Performance Optimizations:** Route-based lazy loading, professional loading skeletons, optimized bundle splitting.
- **Personalized User Experience:** Dashboard features time-based greeting, role badge, last login timestamp, and non-obtrusive system errors banner.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation protection, CSRF protection via double-submit cookie pattern, PII sanitization, password complexity and rotation, security headers (Helmet.js), robust business logic validation. Adheres to GDPR, PCI-DSS, and OWASP Top 10:2021 standards. Production environment enforces strong security measures like mandatory super admin password and configurable session TTL.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** Prepared for future mobile apps with 29 RESTful endpoints, with customer-facing endpoints protected by `requireCustomerAuth` middleware.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive tables for core entities (Users, Customers, Vehicles, Contracts, Payments) and system features. Features a 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, and disable-only architecture.

### Core Features
- **Streamlined Rental Lifecycle:** 4-state workflow.
- **Hardened Edit Validation:** Server-side enforcement of mandatory edit reasons.
- **Contract Timeline:** Visualizes full history of field edits and lifecycle events.
- **Insurance Claims Module:** Complete CRUD system with workflow.
- **Unclosed Contract Alerts:** System for detecting and reporting unclosed contracts.
- **Enhanced Vehicle Inspection:** Supports 6 mandatory angles plus unlimited optional photos with compression.
- **Automated Calculations:** Automatic fuel charge calculation and advance payment auto-adjustment.
- **Comprehensive Financial Settings:** Admin-only configuration for rental rates, fees, and pricing.
- **Vehicle Delivery & Pickup Service:** Configurable charges and bilingual address support.
- **Automatic Vehicle Status Synchronization:** Real-time availability integrated with contract lifecycle.
- **Enhanced Payment Tracking System:** Comprehensive history with conditional validation, mandatory final payment.
- **Complete Audit Logging:** Dual audit trail for CRUD operations and lifecycle events.
- **System Error Logging:** Automatic error logging to database with full context.
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Support & Help Center:** Unified page with dynamic system health monitoring, documentation, FAQs, and error reporting.
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, PDF and Excel export functionality. Includes Revenue Trends, Fleet Performance, Contract Analytics, and Collection Performance reports.
- **Enhanced Dashboard Analytics (NEW):** Four new visual analytics cards for comprehensive business monitoring:
  - **Fleet Status Distribution:** Real-time vehicle status breakdown (Available, Rented, Maintenance, Damaged) with donut chart visualization
  - **Geographic Distribution:** Top 10 customer and vehicle regions by licensing authority for market analysis
  - **Pending Actions:** Critical action tracking (Overdue Returns, Pending Refunds, Unclosed Contracts) with drill-down capabilities
  - **Top Performers:** Top 5 vehicles by revenue and most active staff by contract count for performance insights
- **Dashboard Backend Analytics:** 4 new storage methods and API endpoints (`/api/analytics/fleet-status`, `/api/analytics/geographic-distribution`, `/api/analytics/pending-actions`, `/api/analytics/top-performers`) providing efficient database aggregations for dashboard cards.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor, from_company.
- **Professional PDF Integration:** Bilingual PDF generation for rental contracts with RTA compliance fields.
- **Import Data Functionality (Superadmin Only):** Bulk import system for master data (Customers, Vehicles, Sponsors, Companies) and Contracts from external systems. Features include:
  - Transaction-based atomicity (all-or-nothing imports)
  - Comprehensive validation with field-level error reporting (row, field, message)
  - Support for JSON and CSV file formats
  - Downloadable sample files for all entity types (JSON and CSV templates)
  - In-app Import Data Guide modal with comprehensive documentation
  - Inline field type documentation (string, number, date, enum, boolean)
  - User-friendly error tables with drill-down capabilities
  - All imported contracts created in DRAFT status only

### Role-Based Permissions
- **Core Roles:** Admin, Manager, Staff, Viewer.
- **Core Permission Toggles:** `canCloseContracts`, `canViewAllContracts`.
- **Granular Report Permissions:** 10 fine-grained permission flags for individual report access. Admin and Manager roles automatically bypass all granular permission checks and have full report access. Granular permissions only restrict Staff and Viewer roles.
  - **Analytical Reports:** `canAccessRevenueTrends`, `canAccessFleetPerformance`, `canAccessContractAnalytics`, `canAccessCollectionPerformance`
  - **Standard Reports:** `canAccessFinancialReports`, `canAccessOperationalReports`, `canAccessCustomerReports`, `canAccessInsuranceReports`, `canAccessAuditReports`, `canAccessUserActivityReports`
- **Permission UI:** Users.tsx features tabbed dialogs (Basic Info + Permissions) for Create and Edit User operations. The Permissions tab presents core permissions followed by grouped granular report permissions (Analytical Reports + Standard Reports) for intuitive permission management. Tabbed design solves screen overflow issues and improves UX.
- **Permission Enforcement:** AppSidebar dynamically shows/hides report navigation based on user's granular permissions. useAuth hook implements Admin/Manager bypass logic consistently across the application.

### Dynamic System Health Monitoring
- Real-time metrics including version, database health, webserver status, hardware info, and storage tracking.

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