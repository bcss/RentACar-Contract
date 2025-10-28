# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a generic, bilingual (English/Arabic) system for managing rental car contracts. Built with React, Express, and PostgreSQL, it allows rental companies to create, manage, and finalize contracts through a full rental lifecycle (draft to closed). Key features include role-based access, immutable finalized contracts, comprehensive audit logging, payment tracking, vehicle return workflows, and extensive company settings configuration via an admin panel. RCCMS is designed for global deployment without source code modifications, supporting Material Design principles and RTL/LTR layouts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR switching, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout with dynamic sidebar positioning, data visualization (recharts), tabbed views, enhanced filtering, responsive design.
- **Key Features:** Context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality, contract lifecycle management, comprehensive timeline visualization, route protection.
- **Performance Optimizations:** Route-based lazy loading with React.lazy() and Suspense for all 21 pages (except Login which is eagerly loaded for immediate access), professional loading skeleton with spinner, optimized bundle splitting reduces initial load from ~744KB to ~50KB (88% reduction), 3-4x faster initial page load.

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
- **Dashboard with Context-Aware Navigation:** Critical metrics (active rentals, monthly revenue, overdue returns) with deep-link filtering via URL parameters - clicking metric cards navigates to filtered views (contracts by status/overdue/pendingRefunds, vehicles by status).
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, separated PDF and Excel export functionality (`jsPDF`, `xlsx`) - Vehicle Utilization, Contract Status, and Extra Charges reports export individually with descriptive filenames, and chart visualization.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate).
- **Professional PDF Integration:** Professional, bilingual PDF generation for rental contracts.
- **Vehicle Inspection System:** Two-stage workflow (pre-delivery, post-return) with mandatory 6-photo documentation, strict validation, automatic compression, visual differentiation, full history view, bilingual support, audit logging, and JSONB photo storage.

### Data Validation & Business Rules
- **Mandatory Customer Fields:** National ID, Nationality, Phone, License Number - enforced at both frontend (Zod schema) and backend (API validation) to prevent bypass.
- **Mandatory Company Fields:** TAX ID, Contact Person, Phone, Email - enforced at both frontend and backend levels.
- **Contract Date Validation:** Rental start date cannot be in the past - uses midnight-normalized comparison for timezone safety, validated at both form and API levels.
- **Payment Method Validation:** Conditional required fields based on payment method - cheque number for cheques, last 4 digits for cards, reference number for bank transfers. Enforced via Zod superRefine validation.
- **Contract Closure Enforcement:** Final payment must be recorded before contract can be closed - backend verifies total paid equals total due (rounded to currency precision) before allowing closure.

### Role-Based Permissions
- **Admin:** Full system access including user management, company settings, financial settings, contract closure, disable/enable operations.
- **Manager:** Business operations access - can confirm/activate/complete contracts, view reports, manage customers/vehicles/sponsors/companies.
- **Staff:** Editor-level access - can create drafts, confirm contracts (via `requireEditor` middleware), manage master data, record payments. Cannot close contracts or modify system settings.
- **Viewer:** Read-only access to contracts, customers, vehicles, and reports. Cannot create or modify data.

### Dual Audit System Architecture
- **System Audit Logs:** System-wide security and compliance logging for all operations (user auth, business ops, system errors, config changes). Accessed by Admin/Manager.
- **Business Operations Audit:** Focuses solely on business operations (contract lifecycle, master data, payments, inspections, contract field modifications). Excludes system-level events. Accessed by Admin/Manager.
- **Benefits:** Clear separation for clarity, efficiency, compliance, and user experience.

### Error Logging System
- **Automatic Error Capture:** All errors caught by global error middleware are automatically logged to `systemErrors` table.
- **Helper Function:** `logSystemError()` helper available in routes for logging errors with full context.
- **Critical Route Integration:** Error logging implemented in authentication, contract creation, and payment processing routes.
- **Error Details Logged:** Error type, message, stack trace, user ID, endpoint, HTTP method, IP address, user agent, request body/query/params.
- **Admin Features:** Errors viewable in System Errors page, can be acknowledged by Admin/Manager users.
- **Error Tracking:** All system errors stored in database for debugging, compliance, and system health monitoring.

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