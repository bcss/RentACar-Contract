# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a generic, bilingual (English/Arabic) system for managing rental car contracts. Built with React, Express, and PostgreSQL, it allows rental companies to create, manage, and finalize contracts through a full rental lifecycle (draft to closed). Key features include role-based access, immutable finalized contracts, comprehensive audit logging, payment tracking, vehicle return workflows, and extensive company settings configuration via an admin panel. RCCMS is designed for global deployment without source code modifications, supporting Material Design principles and RTL/LTR layouts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR switching, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout with dynamic sidebar positioning, data visualization (recharts), tabbed views, enhanced filtering, responsive design with Tailwind breakpoints.
- **Key Features:** Context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality, contract lifecycle management, comprehensive timeline visualization, route protection.
- **Performance Optimizations:** Route-based lazy loading with React.lazy() and Suspense for all 21 pages (except Login which is eagerly loaded for immediate access), professional loading skeleton with spinner, optimized bundle splitting reduces initial load from ~744KB to ~50KB (88% reduction), 3-4x faster initial page load.
- **Responsive Dashboard Metrics:** All 7 primary dashboard metric cards use adaptive text sizing (`text-2xl sm:text-3xl xl:text-4xl`) with automatic truncation for optimal display across mobile (24px), tablet (30px), and desktop (36px) viewports.
- **Personalized User Experience:** Dashboard features time-based greeting (Good morning/afternoon/evening) with user's first name, role badge, and last login timestamp tracking with full bilingual support (time-ago format: "2 hours ago"/"منذ ساعتين"). Non-obtrusive system errors banner at top of dashboard with click-to-navigate functionality and complete i18n translation support.
- **Professional Navigation:** Sidebar footer displays RCCMS version information. Help & Legal resources organized under Settings menu with submenu containing Support & Help, Privacy Policy, and Terms of Service pages.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection.
- **Audit Trails:** `contractEdits` for field-level modifications; `auditLogs` for lifecycle events.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users`, `Customers`, `Vehicles`, `Sponsors`, `Companies`, `Contracts`, `Payments`, `Vehicle Inspections`, `Audit Logs`, `Contract Edits`, `System Errors`, `Company Settings`.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, dual-layer audit trail, singleton pattern for global settings, master data pattern, separate payment tracking.
- **Disable-Only Architecture:** Delete operations replaced with disable/enable functionality.

### Core Features
- **Comprehensive Rental Lifecycle:** `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays full history of field edits and lifecycle events with creator attribution.
- **Automatic Fuel Charge Calculation:** Based on tank capacity, fuel type, and configurable pricing.
- **Comprehensive Financial Settings:** Admin-only centralized configuration for rental rates, addon fees, and fuel pricing.
- **Automatic Vehicle Status Synchronization:** Real-time vehicle availability integrated with contract lifecycle.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition, calculates extra charges. Includes early closure reason dialog for contracts completed before rental end date.
- **Enhanced Payment Tracking System:** Comprehensive payment history with conditional validation - requires cheque number for check payments, last 4 card digits for card payments, and reference number for bank transfers. Final payment recording mandatory before contract closure.
- **Customer Phone Validation:** Non-blocking duplicate phone number detection.
- **Complete Audit Logging:** Comprehensive audit trail for CRUD operations and contract lifecycle events.
- **System Error Logging:** Automatic error logging to database with full context (endpoint, method, user, stack trace, request details).
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Support & Help Center:** Unified page at /settings/support combining system health monitoring (database status, record counts, storage estimates, version info, developer contact) with documentation resources, common questions, and Enhanced Error Reporter. Consolidates former About and Support pages into single resource center.
- **Legal Compliance Pages:** Professional Privacy Policy and Terms of Service pages with comprehensive legal content, accessible via Settings → Help & Legal submenu.
- **Dashboard with Context-Aware Navigation:** Critical metrics (active rentals, monthly revenue, overdue returns) with deep-link filtering via URL parameters - clicking metric cards navigates to filtered views (contracts by status/overdue/pendingRefunds, vehicles by status).
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, separated PDF and Excel export functionality (`jsPDF`, `xlsx`) - Vehicle Utilization, Contract Status, and Extra Charges reports export individually with descriptive filenames, and chart visualization.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate).
- **Professional PDF Integration:** Professional, bilingual PDF generation for rental contracts.
- **Vehicle Inspection System:** Two-stage workflow (pre-delivery, post-return) with mandatory 6-photo documentation, strict validation, automatic compression, visual differentiation, full history view, bilingual support, audit logging, and JSONB photo storage.
- **System Administrator Suite (Planned):** Enterprise-grade disaster recovery framework including: (1) Backdoor super admin with invisible emergency access and TOTP authentication, (2) 3-tier clean slate system with mandatory pre-cleanup encrypted backups, (3) Bulk CSV import for migrating from legacy systems (6 entity types with validation), (4) Automated scheduled backups with 30-day rollback window, (5) Immutable hash-chained audit logs for backdoor operations. Estimated cost: $170-260 USD development + $35-45/month operations. See `SYSTEM_ADMINISTRATOR_SUITE.md` for full specification.

### Data Validation & Business Rules
- **Mandatory Customer Fields:** National ID, Nationality, Phone, License Number - enforced at both frontend (Zod schema) and backend (API validation) to prevent bypass.
- **Mandatory Company Fields:** TAX ID, Contact Person, Phone, Email - enforced at both frontend and backend levels.
- **Contract Date Validation:** Rental start date cannot be in the past - uses midnight-normalized comparison for timezone safety, validated at both form and API levels.
- **Payment Method Validation:** Conditional required fields based on payment method - cheque number for cheques, last 4 digits for cards, reference number for bank transfers. Enforced via Zod superRefine validation.
- **Contract Closure Enforcement:** Final payment must be recorded before contract can be closed - backend verifies total paid equals total due (rounded to currency precision) before allowing closure.

### Role-Based Permissions with Granular Toggles
RCCMS implements a flexible role-based access control (RBAC) system with 4 core roles enhanced by 3 targeted permission toggles. This balance provides simplicity with flexibility, allowing administrators to grant additional capabilities as needed.

**Permission Toggles:**
- `canAccessReports`: Grants access to reports and analytics pages
- `canCloseContracts`: Grants permission to close completed contracts
- `canViewAllContracts`: Grants ability to view all contracts (not just own)

**Core Roles:**
- **Admin:** Full system access including user management, company settings, financial settings, permission toggle management, disable/enable operations. All toggles enabled by default.
- **Manager:** Business operations manager - full contract lifecycle, reports access, master data management, audit logs. All toggles enabled by default. Cannot manage users or modify settings.
- **Staff:** Operational staff with full workflow capability - create/edit/confirm/activate/complete contracts, record payments, manage master data, vehicle inspections. Toggles disabled by default but can be granted: +reports for analytics access, +close for contract closure, +viewAll for system-wide contract visibility.
- **Viewer:** Read-only access to contracts (own by default), customers, vehicles, master data. Toggles can be granted for audit/compliance roles (typically +reports and +viewAll).

**Enhanced Staff Permissions (New):**
Staff role significantly expanded to handle full operational workflow including contract activation, completion, and payment recording. This allows day-to-day rental operations without manager intervention. Permission toggles provide granular elevation of Staff/Viewer capabilities without creating additional roles.

**Implementation:**
- Backend: Role-based middleware (`requireAdmin`, `requireAdminOrManager`, `requireEditor`) + toggle-based middleware (`requireReportsAccess`, `requireContractCloseAccess`)
- Frontend: useAuth hook exposes toggles for conditional rendering (Reports menu, Close button)
- Database: Boolean columns with role-based defaults (Admin/Manager=true, Staff/Viewer=false)

See `ROLE_PERMISSIONS.md` for comprehensive role matrix, permission combinations, workflow examples, and configuration guide.

### Dual Audit System Architecture
- **System Audit Logs:** System-wide security and compliance logging for all operations (user auth, business ops, system errors, config changes). Accessed by Admin/Manager.
- **Business Operations Audit:** Focuses solely on business operations (contract lifecycle, master data, payments, inspections, contract field modifications). Excludes system-level events. Accessed by Admin/Manager.
- **Benefits:** Clear separation for clarity, efficiency, compliance, and user experience.

### Error Logging & Enhanced Error Reporter System
- **Automatic Error Capture:** All errors caught by global error middleware are automatically logged to `systemErrors` table with full context (error type, message, stack trace, user ID, endpoint, HTTP method, IP address, user agent, request data).
- **Enhanced Error Reporter:** Comprehensive error management UI at /settings/support with advanced filtering (date range, error type, status), search capability, and workflow actions:
  - **Email Workflow:** One-click email to support with pre-filled error details, screenshot capture via html2canvas, and automatic "sent to support" status marking
  - **Status Tracking:** Three-state workflow (pending → sent to support → acknowledged) with visual badges and filtering
  - **Acknowledgement System:** Admin/Manager users can acknowledge errors after resolution
  - **Screenshot Capture:** Automatic screenshot generation for visual error context
  - **Comprehensive Filtering:** Filter by date range (DatePicker), error type (Select), status (pending/sent/acknowledged), and keyword search
- **Database Schema:** `sentToSupport` boolean field added to track email workflow status alongside existing `acknowledged` field and `acknowledgedBy` reference
- **Backend Endpoints:** POST /api/system-errors/:id/mark-sent for status updates, POST /api/system-errors/:id/acknowledge for acknowledgements
- **Helper Function:** `logSystemError()` helper available in routes for manual error logging with full context
- **Critical Route Integration:** Error logging implemented in authentication, contract creation, payment processing, and other critical routes

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