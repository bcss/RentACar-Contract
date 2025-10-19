# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (October 19, 2025)

### Contract Timeline Feature
- **Dual Data Source Architecture:** Timeline now displays complete contract history by merging field edits and lifecycle events
  - `/api/contracts/:id/edits` endpoint for field-level changes from `contract_edits` table
  - `/api/contracts/:id/audit-logs` endpoint for lifecycle events from `audit_logs` table
- **Event Types Displayed:** Creation, field edits, confirmation, activation, completion, closing, and printing
- **Visual Presentation:** Each event shows icon, badge, user name, timestamp, and details
- **Access Control:** Staff can only view timelines for their own contracts

### Critical Bug Fixes
1. **Audit Logs 500 Error:** Fixed database query to use correct schema field names (contractId instead of entityType/entityId)
2. **Customer Selector:** Added `shouldFilter={false}` to Command component to display server-side search results
3. **Vehicle Selector:** Added cache invalidation for `/api/vehicles/search` queries and `shouldFilter={false}` to Command component
4. **Database Schema:** Renamed `contract_edits.reason` column to `edit_reason` to match Drizzle schema
5. **Routing:** Flattened route structure to prevent duplicate /contracts prefix in URLs
6. **Authentication:** Implemented proper redirects using useLocation for protected routes

### Security Enhancements
- ProtectedRoute wrapper component with automatic redirect to /login for unauthenticated users
- All protected routes properly guarded
- URL navigation instead of inline component rendering for better UX

### Design System
- Material Design 3 with cyan-blue primary color (HSL: 199 89% 48%)
- Semantic chart colors for status badges (dark/light mode compatible)
- Full accessibility support

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Design System:** Material Design 3 with cyan-blue primary, dual theme (light/dark), i18next for bilingual support (English/Arabic) with RTL/LTR switching, and specific font families (Inter, Cairo, JetBrains Mono).
- **Key Features:** Context-based theme/language, custom hooks for auth, shared Zod schemas, responsive design, print functionality, contract lifecycle management, and comprehensive timeline visualization.
- **Route Protection:** ProtectedRoute wrapper ensures authentication before accessing protected pages

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js (passport-local), and express-session with PostgreSQL store.
- **API Design:** RESTful endpoints with `/api` prefix, role-based middleware, centralized error handling, and comprehensive audit logging for all contract operations.
- **Key Architectural Decisions:** Middleware-based authentication, bcrypt for password security (12+ rounds), storage abstraction layer, shared Zod schemas, and atomic contract number generation.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies. Role-based access: Admin (full access), Manager (contract management/audit logs), Staff (own contract creation/editing), Viewer (read-only). Super admin account is immutable.
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection, and full proxy trust for Replit.
- **Contract Edit Audit:** Implemented `contractEdits` table to log all contract modifications with `editedBy`, `editedAt`, mandatory `edit_reason`, `changesSummary`, `fieldsBefore`, and `fieldsAfter` snapshots for compliance.
- **Lifecycle Audit:** Implemented `auditLogs` table to track all lifecycle events (create, confirm, activate, complete, close, print) with user, timestamp, and details.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users` (with role-based access), `Contracts` (core entity with bilingual fields, status tracking, payment, and extra charges), `Audit Logs` (immutable lifecycle activity log), `Contract Edits` (detailed field change tracking), `Contract Counter`, `System Errors` (with acknowledgment workflow), and `Company Settings` (singleton table for configurable company info).
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, comprehensive dual-layer audit trail (edits + lifecycle), and singleton pattern for global settings.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for users and contracts, tracking `disabled`, `disabledBy`, `disabledAt` fields.

### Features
- **Comprehensive Rental Lifecycle:** Five states: `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays complete history with field edits and lifecycle events in chronological order.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition notes, and calculates extra charges (KM, fuel, damage, other).
- **Payment Recording:** Tracks deposit, final payment, and refunds with methods and dates.
- **Company Settings Management:** Admin-only page to configure bilingual company information displayed on contracts.
- **Dashboard:** Displays critical metrics like active rentals, monthly revenue, overdue returns, and pending refunds.
- **UI/UX:** Tabbed views for active/disabled lists, enhanced filtering (audit logs, system errors), system error acknowledgment, full English/Arabic translations, and Material Design 3 styling.

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

### Development Tools
- TypeScript, Vite, ESBuild, Replit-specific plugins.

## Known Issues
- Minor accessibility warning: DialogContent missing aria-describedby attribute (no functional impact)
- Transient loading spinners during data fetches (expected behavior)

## Testing
- Comprehensive E2E testing completed for all features
- Authentication, routing, timeline, customer/vehicle selectors verified
- All protected routes and security measures tested
