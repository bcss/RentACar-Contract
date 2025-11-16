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
- **Enhanced Dashboard Analytics:** Four professionally redesigned visual analytics cards with Material Design 3 styling:
  - **Fleet Status Distribution:** Real-time vehicle status breakdown (Available, Rented, Maintenance, Damaged) with concentric donut chart visualization
  - **Geographic Distribution:** Top 10 customer and vehicle regions by licensing authority for market analysis *(planned enhancement: UAE 7 emirates)*
  - **Pending Actions:** Critical action tracking (Overdue Returns, Pending Refunds, Unclosed Contracts) with severity-grid layout and priority badges
  - **Top Performers:** Top 5 vehicles and staff by revenue with rank badges and avatar integration
- **Dashboard Backend Analytics:** 4 storage methods and API endpoints (`/api/analytics/fleet-status`, `/api/analytics/geographic-distribution`, `/api/analytics/pending-actions`, `/api/analytics/top-performers`) providing efficient database aggregations.
- **Tabbed Dashboard Architecture (✅ IMPLEMENTED):** Four-tab interface for different user perspectives:
  - **My Day Tab (✅ IMPLEMENTED):** Personal performance dashboard with modern Material Design 3 styling:
    - Hero KPI rail with 3 large metric cards (My Contracts, My Revenue, Pending Tasks)
    - MD3 tonal surfaces with bg-[hsl(var(--primary)/0.08)] and shadow-lg elevation
    - Circular icon containers with primary accent backgrounds
    - Large 4xl typography for metrics with tabular numerals
    - Uppercase tracking labels (text-base font-medium tracking-[0.08em])
    - Quick Actions with functional filtering (query parameters for overdue, refunds, unclosed)
    - Badge counters integrated into action buttons with transitions
    - Status breakdown cards with colored left borders and hover effects
    - Task Command Center with tonal containers and days overdue calculations
    - Responsive 3-column grid (gap-6 spacing)
    - Visible to all authenticated users
  - **Company Today Tab (🔄 PENDING):** Real-time operational snapshot (Manager/Admin only) - live fleet status, same-day operations, pending actions, activity feed
  - **Executive Overview Tab (✅ IMPLEMENTED):** Strategic analytics (Manager/Admin only) - revenue trends, elegant list-based top performers, geographic distribution, pending actions
  - **Design Samples Tab (✅ IMPLEMENTED):** Design customization interface (Manager/Admin only) - 5 dashboard design options with descriptions, features, and preview links
  - **UAE Emirates Integration (🔄 PENDING):** New `emirate` enum field for Customers, Vehicles, Sponsors, Companies supporting all 7 emirates (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah)
  - **Role-Based Visibility:** Staff/Viewer see only "My Day"; Manager/Admin see all four tabs
  - **Design Samples:** Five design style options available at `/dashboard-samples` (Clean Modern, Data Dense, Dark Elegant, Minimal Cards, Colorful), now integrated as dashboard tab
  - **Documentation:** Full architectural spec in `docs/DASHBOARD_TABBED_ARCHITECTURE.md`
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
- **App Access Logging System:** Comprehensive security monitoring system tracking all login attempts with IP geolocation and country tracking. Features include:
  - Automatic logging of successful and failed login attempts with geolocation data
  - IP address tracking with country and city resolution
  - User agent logging for device and browser identification
  - Access Report interface with advanced filtering (date range, outcome, username, IP address, country)
  - Pagination support for efficient handling of large log volumes
  - Excel export functionality for security audits and compliance reporting
  - Admin-controlled purge functionality for log retention management
  - Permission-based access via `canAccessAppAccessReport` toggle (Admin/Manager by default)

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