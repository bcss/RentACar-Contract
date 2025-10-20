# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Design System:** Material Design 3 with cyan-blue primary, dual theme (light/dark), i18next for bilingual support (English/Arabic) with RTL/LTR switching, and specific font families (Inter, Cairo, JetBrains Mono).
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
- **Schema Design:** Tables for `Sessions`, `Users`, `Customers`, `Vehicles`, `Persons` (master data for sponsors/drivers), `Contracts` (core entity with bilingual fields, status, payments, charges), `Audit Logs`, `Contract Edits`, `Contract Counter`, `System Errors`, and `Company Settings`.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, comprehensive dual-layer audit trail, singleton pattern for global settings, and master data pattern for customers/vehicles/persons.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for key entities, tracking `disabled`, `disabledBy`, `disabledAt` fields.

### Features
- **Comprehensive Rental Lifecycle:** Five states: `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays complete history with field edits and lifecycle events in chronological order.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition notes, and calculates extra charges.
- **Payment Recording:** Tracks deposit, final payment, and refunds with methods and dates.
- **Company Settings Management:** Admin-only page to configure bilingual company information and additional contract clauses.
- **Dashboard:** Displays critical metrics like active rentals, monthly revenue, overdue returns, and pending refunds.
- **Persons Master Data:** Reusable person records for sponsors and drivers across contracts, reducing repetitive data entry. Full CRUD operations with search and disable/enable functionality.
- **MARMAR PDF Integration:** Professional PDF generation using an integrated MARMAR rental contract template, including dynamic sections for sponsor/hirer, vehicle inspection, payment breakdown, and signatures.

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