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
- **Branch Management System (BACKEND COMPLETE):** Multi-location operational support with comprehensive branch hierarchy and inter-branch vehicle transfer workflow. Includes 41 RESTful API endpoints, branch-scoped data access, and permission-based filtering. Frontend UI pending.
- **Driver Service Module (BACKEND COMPLETE):** Professional driver assignment capability with UAE market compliance. Includes driver master data, outsource companies, rate cards, schedule management, assignment tracking, and UAE public holidays integration with full CRUD API endpoints and business logic. Frontend UI pending.
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