# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform built with React, Express, and PostgreSQL. It manages the complete rental lifecycle through a streamlined 4-state workflow (Draft → Active → Completed → Closed). Key features include role-based access control, hardened security validation, comprehensive dual audit trails, insurance claims tracking, unclosed contract alerts, enhanced vehicle inspection documentation, and extensive admin configuration. The system is designed for global deployment without source code modifications, supporting Material Design principles and RTL/LTR layouts, and its backend is prepared for future Staff and Customer mobile applications.

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
- **Security Hardening:** Includes session fixation protection, CSRF protection via double-submit cookie, PII sanitization from error logs, password complexity and rotation, security headers (Helmet.js), and robust business logic validation (e.g., edit reason, financial input guards). All critical vulnerabilities are resolved, aligning with GDPR, PCI-DSS, and OWASP Top 10:2021 standards.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** Backend is prepared for future mobile apps with 29 RESTful endpoints, with customer-facing endpoints protected by `requireCustomerAuth` middleware until customer authentication is deployed.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive tables for core entities (Users, Customers, Vehicles, Contracts, Payments) and system features (Audit Logs, Insurance Claims, System Errors).
- **Key Design Decisions:** 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, disable-only architecture instead of delete.

### Core Features
- **Streamlined Rental Lifecycle:** 4-state workflow (draft → active → completed → closed).
- **Hardened Edit Validation:** Server-side enforcement of mandatory, meaningful edit reasons for contract mutations.
- **Contract Timeline:** Visualizes full history of field edits and lifecycle events.
- **Insurance Claims Module:** Complete CRUD system with workflow and contract integration.
- **Unclosed Contract Alerts:** System for detecting and reporting on contracts completed but not closed.
- **Enhanced Vehicle Inspection:** Supports 6 mandatory angles plus unlimited optional photos with compression.
- **Automated Calculations:** Automatic fuel charge calculation and advance payment auto-adjustment.
- **Comprehensive Financial Settings:** Admin-only configuration for rental rates, fees, and pricing.
- **Vehicle Delivery & Pickup Service:** Configurable charges and bilingual address support.
- **Automatic Vehicle Status Synchronization:** Real-time availability integrated with contract lifecycle.
- **Enhanced Payment Tracking System:** Comprehensive history with conditional validation, mandatory final payment.
- **Complete Audit Logging:** Dual audit trail for CRUD operations and lifecycle events.
- **System Error Logging:** Automatic error logging to database with full context.
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Support & Help Center:** Unified page with dynamic system health monitoring, documentation modals, FAQs, and error reporting.
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, PDF and Excel export functionality with chart visualization embedding.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor, from_company.
- **Professional PDF Integration:** Bilingual PDF generation for rental contracts with RTA compliance fields.

### Role-Based Permissions
- **Core Roles:** Admin, Manager, Staff, Viewer.
- **Granular Toggles:** e.g., `canAccessReports`, `canCloseContracts`.

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