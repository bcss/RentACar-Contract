# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform designed for multi-branch operations and driver services. It streamlines the entire rental lifecycle through a 4-state workflow (Draft → Active → Completed → Closed). The system features role-based access control, robust security validation, comprehensive dual audit trails, insurance claims tracking, unclosed contract alerts, enhanced vehicle inspection, and inter-branch vehicle transfers. It also includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. RCCMS is built for global deployment without source code modifications, integrates Material Design principles, supports RTL/LTR layouts, and its backend is prepared for future mobile applications.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout, data visualization (recharts), tabbed views, enhanced filtering, responsive design, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality.
- **Performance Optimizations:** Route-based lazy loading, loading skeletons, optimized bundle splitting.
- **Personalized User Experience:** Dashboard with time-based greeting, role badge, last login timestamp, and non-obtrusive system errors banner.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation, CSRF protection, PII sanitization, password complexity/rotation, security headers (Helmet.js), robust business logic validation. Adheres to GDPR, PCI-DSS, and OWASP Top 10:2021 standards.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** 29 RESTful endpoints prepared for future mobile apps, with customer-facing endpoints protected by `requireCustomerAuth` middleware.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive tables for core entities (Users, Customers, Vehicles, Contracts, Payments) and system features. Features a 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, and disable-only architecture.

### Core Features
- **Rental Lifecycle Management:** Streamlined 4-state workflow.
- **Hardened Edit Validation:** Server-side enforcement of mandatory edit reasons.
- **Contract Timeline:** Visualizes history of field edits and lifecycle events.
- **Insurance Claims Module:** Complete CRUD system with workflow.
- **Unclosed Contract Alerts:** System for detecting and reporting unclosed contracts.
- **Enhanced Vehicle Inspection:** Supports 6 mandatory angles plus unlimited optional photos with compression.
- **Automated Calculations:** Automatic fuel charge calculation and advance payment auto-adjustment.
- **Financial Settings:** Admin-only configuration for rental rates, fees, and pricing.
- **Vehicle Delivery & Pickup Service:** Configurable charges and bilingual address support.
- **Automatic Vehicle Status Synchronization:** Real-time availability integrated with contract lifecycle.
- **Enhanced Payment Tracking System:** Comprehensive history with conditional validation and mandatory final payment.
- **Complete Audit Logging:** Dual audit trail for CRUD operations and lifecycle events.
- **System Error Logging:** Automatic error logging to database with full context.
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Support & Help Center:** Unified page with dynamic system health monitoring, documentation, FAQs, and error reporting.
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, PDF/Excel export. Includes Revenue Trends, Fleet Performance, Contract Analytics, and Collection Performance.
- **Enhanced Dashboard Analytics:** Four redesigned visual analytics cards (Fleet Status, Geographic Distribution, Pending Actions, Top Performers) with Material Design 3 styling.
- **Tabbed Dashboard Architecture:** Four-tab interface (`My Day`, `Company Today` (pending), `Executive Overview`, `Design Samples`) with role-based visibility.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor, from_company.
- **Professional PDF Integration:** Bilingual PDF generation for rental contracts with RTA compliance fields.
- **Tabbed Dialog Forms:** Modern, multi-tab form interface for improved UX on large forms (e.g., Customer, Vehicle, Sponsor, Company, Insurance Claims, User forms).
- **Import Data Functionality (Superadmin Only):** Bulk import system for master data and contracts from external systems (JSON/CSV), with transaction-based atomicity and field-level error reporting.
- **App Access Logging System:** Comprehensive security monitoring tracking all login attempts with IP geolocation, country tracking, and user agent logging.
- **Branch Management System:** Multi-location operational support with comprehensive branch hierarchy and inter-branch vehicle transfer workflow.
  - **Backend Complete:** 41 RESTful API endpoints, branch-scoped data access, permission-based filtering, branch CRUD storage operations
  - **Frontend Status:** Branches Master Page created (`/branches`) with full CRUD interface, active/inactive toggle, bilingual support, and Material Design styling
  - **Pending:** Vehicle transfer UI integration, branch filtering across application pages
- **Driver Service Module:** Professional driver assignment capability with UAE market compliance.
  - **Backend Complete:** Driver master data, outsource companies, rate cards, schedule management, assignment tracking, UAE public holidays calendar, surcharge calculator, driver cost integration into contracts
  - **Contract Integration Complete:** Driver service costs automatically calculated and included in contract totals via `calculateDriverAssignmentCost()` utility
  - **Frontend Status:** 4 pages operational: Public Holidays (`/public-holidays`), Branches (`/branches`), Drivers (`/drivers`), Driver Companies (`/driver-companies`) with full CRUD interfaces
  - **Sidebar Navigation:** Branch/driver menu items added with i18n support (English/Arabic)
  - **Pending:** Driver Assignment Modal, Contract Driver Service section integration, Vehicle Transfers UI
- **Future-Proofing Tables:** Schema defined for Payment Gateways, Payment Transactions, Pricing Rules, Document Files, and Digital Signatures.

### Role-Based Permissions
- **Core Roles:** Admin, Manager, Staff, Viewer.
- **Core Permission Toggles:** `canCloseContracts`, `canViewAllContracts`.
- **Branch & Driver Permissions:** `canManageAllBranches` (manage all branches/transfers), `canManageDrivers` (manage drivers/companies/rates), `canAssignDrivers` (assign drivers to contracts), `canViewDriverCosts` (view driver cost breakdown).
- **Granular Report Permissions:** 10 fine-grained permission flags for individual report access. Admin and Manager roles have full access; Staff and Viewer roles are restricted.
- **Permission UI:** Users.tsx features tabbed dialogs (Basic Info + Permissions) for Create and Edit User operations, with grouped granular report permissions.
- **Permission Enforcement:** AppSidebar dynamically shows/hides report navigation based on user's granular permissions; `useAuth` hook implements Admin/Manager bypass logic. Branch API endpoints enforce branch-scoped access control.

### Dynamic System Health Monitoring
- Real-time metrics including version, database health, webserver status, hardware info, and storage tracking.

## Branch & Driver Service Implementation Status

### Completed (21/35 Tasks - 60%)

#### Backend Foundation (100% Complete)
1. ✅ **Database Schema:** 8 new tables (branches, branchTransfers, publicHolidays, drivers, driverOutsourceCompanies, driverRateCards, driverScheduleBlocks, driverAssignments) with full migration files
2. ✅ **Storage Layer:** 435 lines of CRUD operations for all entities with transaction-based transfers
3. ✅ **Surcharge Calculator:** UAE-compliant minute-by-minute calculation with emirate-aware weekends, night shift detection, public holiday integration
4. ✅ **Driver Cost Calculator:** `calculateDriverAssignmentCost()` and `calculateContractDriverCosts()` utilities with surcharge integration + VAT fix
5. ✅ **API Routes:** 41 RESTful endpoints with authentication, validation, audit logging:
   - 11 Branch endpoints (CRUD, enable/disable, transfers)
   - 4 Public Holiday endpoints (CRUD)
   - 16 Driver endpoints (drivers, companies, rate cards, schedules)
   - 10 Driver Assignment endpoints (CRUD, conflict detection, status management)
6. ✅ **Permissions System:** 4 new permission flags (`canManageAllBranches`, `canManageDrivers`, `canAssignDrivers`, `canViewDriverCosts`)
7. ✅ **Contract Calculations:** Driver service costs integrated into GET `/api/contracts/:id` endpoint with explicit `totalDriverCharges`, `totalDriverSurcharges`, and recalculated `totalDue`
8. ✅ **Company Settings:** 8 driver service configuration fields added to global settings

#### Frontend CRUD Pages (4/7 Complete - 57%)
9. ✅ **Public Holidays Manager:** `/public-holidays` - Full CRUD interface with recurring holiday support, bilingual fields, surcharge rate configuration, Gregorian/Hijri calendar support
10. ✅ **Branches Master Page:** `/branches` - Full CRUD with tabbed dialog, emirate selection, bilingual addresses, active/inactive toggle
11. ✅ **Drivers Master Page:** `/drivers` - Full CRUD with tabbed dialog for personal info and employment details
12. ✅ **Driver Companies Page:** `/driver-companies` - Simple CRUD interface for outsource company management

#### Integration & Polish (2/4 Complete - 50%)
13. ✅ **Sidebar Navigation:** Branch/driver management menu items added with Admin/Manager visibility
14. ✅ **i18n Translations:** Complete English/Arabic translation keys for all Branch & Driver Service UI strings

### Pending (14/35 Tasks - 40%)

#### Frontend CRUD Pages (3 remaining)
- **Vehicle Transfers UI:** Add transfer dialog to Vehicles page
- **Contract Driver Service Section:** Add driver assignment fields to Contract form
- **Driver Assignment Modal:** Create driver selection and assignment interface

#### Configuration & Settings (2 remaining)
- **Branch Filtering:** Add branch selector dropdown to all multi-branch pages
- **Financial Settings Extension:** Add driver service rate configuration to settings page

#### Reporting & Analytics (2 remaining)
- **Branch Analytics Dashboard:** Revenue, utilization, and transfer reports per branch
- **Driver Analytics:** Utilization rate, earnings, assignment history reports

#### Integration & Polish (2 remaining)
- **Financial Integration:** Add driver service line items to PDF receipts and invoices
- **Audit & Timeline:** Add branch/driver event types to contract timeline

#### Testing & Documentation (5 remaining)
- **Unit Tests:** Surcharge calculator and business logic tests
- **API Integration Tests:** Workflow tests for branch transfers and driver assignments
- **End-to-End Tests:** Complete user journey tests using Playwright
- **Documentation Consolidation:** User guides and API documentation
- **Final Architect Review:** Comprehensive code review and regression testing

## Technical Architecture Details

### Driver Service Cost Calculation Flow
1. When driver assigned to contract: `calculateDriverAssignmentCost()` computes base + surcharges
2. Contract total retrieved: `calculateContractDriverCosts()` sums all assignments for contract
3. Response includes: `totalDriverCharges`, `totalDriverSurcharges`, `totalDue` (rental + extras + driver)
4. Outstanding balance calculation includes driver costs: `totalDue - totalPaid`

### Surcharge Calculator Features
- **Night Shift:** Minute-by-minute calculation for cross-midnight shifts
- **Weekend:** Emirate-aware (Abu Dhabi: Fri-Sat, Others: Sat-Sun)
- **Public Holidays:** Database-driven with recurring support (Gregorian/Hijri calendars)
- **Priority:** Holiday > Weekend > Night (highest multiplier wins)
- **VAT:** Configurable per company settings

### Branch-Scoped Data Access
- Users assigned to specific branch via `branchId`
- Permission `canManageAllBranches` grants access to all branches
- API endpoints filter data by user's branch unless permission granted
- Branch transfers tracked with complete audit trail

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