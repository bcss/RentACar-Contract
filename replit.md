# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## Recent Changes (October 21, 2025)
- **Database Schema Update:** Renamed `persons` table to `sponsors` throughout the entire stack (database table, API routes, storage interface, frontend components, type definitions).
- **Payments System:** Implemented comprehensive payment tracking with dedicated `payments` table, full CRUD API endpoints with RBAC and audit logging, and payment management UI in ContractView for recording deposits, final payments, and refunds.
- **Type Safety Improvements:** Created shared `UserRole` enum in schema.ts for consistent role management across frontend and backend, replacing hardcoded role strings.
- **Navigation Reorganization:** Hierarchical sidebar with collapsible parent menus (Masters: Customers/Vehicles/Sponsors/Companies; Settings: Company Settings/Users).
- **Bug Fixes:** Fixed server error handler crash bug (removed throw after response sent); improved error handling consistency.
- **Form Enhancements:** Updated Customers.tsx and Vehicles.tsx to use shared insert schemas from @shared/schema for better type consistency and code quality.
- **Audit Logging Verification:** Completed comprehensive audit of all mutation endpoints to ensure consistent audit logging coverage across create, update, delete operations. Added audit logging to system error acknowledgment endpoint.
- **RBAC Verification:** Verified all sensitive endpoints have appropriate role-based access controls with proper admin/manager/staff/viewer permissions.
- **Vehicle Availability Validation:** Verified full implementation of vehicle availability checking system - backend endpoint checks overlapping contracts, frontend automatically validates dates and vehicle selection, prevents submission if unavailable, shows real-time status badges.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Design System:** Material Design 3 with cyan-blue primary, dual theme (light/dark), i18next for bilingual support (English/Arabic) with RTL/LTR switching, and specific font families (Inter, Cairo, JetBrains Mono).
- **Navigation:** Hierarchical sidebar with collapsible sections (Masters, Settings), using Shadcn's Collapsible components for clean organization.
- **UI/UX:** Tabbed views for active/disabled lists, enhanced filtering, system error acknowledgment, full English/Arabic translations, and Material Design 3 styling. Semantic chart colors for status badges (dark/light mode compatible).
- **Features:** Context-based theme/language, custom hooks for auth, shared Zod schemas, responsive design, print functionality, contract lifecycle management, and comprehensive timeline visualization.
- **Route Protection:** ProtectedRoute wrapper ensures authentication before accessing protected pages.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js (passport-local), and express-session with PostgreSQL store.
- **API Design:** RESTful endpoints with `/api` prefix, role-based middleware, centralized error handling, and comprehensive audit logging for all contract operations.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies. Role-based access: Admin (full access), Manager (contract management/audit logs), Staff (own contract creation/editing), Viewer (read-only). Super admin account is immutable.
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection, and full proxy trust for Replit.
- **Audit Trails:** `contractEdits` table for field-level modifications with reason and before/after snapshots; `auditLogs` table for lifecycle events (create, confirm, activate, complete, close, print).

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users`, `Customers`, `Vehicles`, `Sponsors` (master data for individual sponsors, renamed from persons), `Companies` (master data for corporate sponsors), `Contracts` (core entity with bilingual fields, status, charges, companySponsorId), `Payments` (separate payment history tracking), `Audit Logs`, `Contract Edits`, `Contract Counter`, `System Errors`, and `Company Settings`.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, comprehensive dual-layer audit trail, singleton pattern for global settings, master data pattern for customers/vehicles/sponsors/companies, and separate payment tracking for full financial history.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for key entities, tracking `disabled`, `disabledBy`, `disabledAt` fields.
- **Payment Architecture:** Separate `payments` table stores complete payment history (id, contractId, amount, paymentMethod, currency, paidAt, paidBy, notes) with RBAC-protected endpoints and full audit logging.

### Features
- **Comprehensive Rental Lifecycle:** Five states: `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays complete history with field edits and lifecycle events in chronological order.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition notes, and calculates extra charges.
- **Payment Tracking System:** Comprehensive payment history with separate `payments` table. Records deposits, final payments, and refunds with full details (amount, method, currency, date, payer, notes). Payment management UI integrated into ContractView with add/delete capabilities and payment history display.
- **Company Settings Management:** Admin-only page to configure bilingual company information and additional contract clauses.
- **Dashboard:** Displays critical metrics like active rentals, monthly revenue, overdue returns, and pending refunds (based on 5 valid contract statuses).
- **Sponsors Master Data:** Reusable sponsor records (individual) for sponsoring customers across contracts. Full CRUD operations with search and disable/enable functionality. Stored in `sponsors` database table and displayed as "Sponsors" throughout the UI.
- **Companies Master Data:** Reusable company records for corporate sponsors with registration details, tax info, and contact information. Full CRUD operations with role-based access (admin/manager only).
- **Three Hirer Types:** 
  - `direct`: Customer rents directly without sponsor
  - `with_sponsor`: Customer rents with individual sponsor (from Sponsors table)
  - `from_company`: Customer rents with company sponsor (from Companies table)
- **MARMAR PDF Integration:** Professional PDF generation using an integrated MARMAR rental contract template, including dynamic sections for sponsor/hirer (supporting both individual and company sponsors), vehicle inspection, payment breakdown, and signatures.

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