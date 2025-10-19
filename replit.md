# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, and detailed company settings management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Design System:** Material Design-inspired, dual theme (light/dark), i18next for bilingual support (English/Arabic) with RTL/LTR switching, and specific font families (Inter, Cairo, JetBrains Mono).
- **Key Features:** Context-based theme/language, custom hooks for auth, shared Zod schemas, responsive design, print functionality, and contract lifecycle management.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js (passport-local), and express-session with PostgreSQL store.
- **API Design:** RESTful endpoints with `/api` prefix, role-based middleware, centralized error handling, and audit logging for all contract operations.
- **Key Architectural Decisions:** Middleware-based authentication, bcrypt for password security (12+ rounds), storage abstraction layer, shared Zod schemas, and atomic contract number generation.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies. Role-based access: Admin (full access), Manager (contract management/audit logs), Staff (own contract creation/editing), Viewer (read-only). Super admin account is immutable.
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection, and full proxy trust for Replit.
- **Contract Edit Audit:** Implemented a `contractEdits` table to log all contract modifications with `editedBy`, `editedAt`, mandatory `reason`, `changesSummary`, `fieldsBefore`, and `fieldsAfter` snapshots for compliance.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users` (with role-based access), `Contracts` (core entity with bilingual fields, status tracking, payment, and extra charges), `Audit Logs` (immutable activity log), `Contract Counter`, `System Errors` (with acknowledgment workflow), and `Company Settings` (singleton table for configurable company info).
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, comprehensive audit trail, and singleton pattern for global settings.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for users and contracts, tracking `disabled`, `disabledBy`, `disabledAt` fields.

### Features
- **Comprehensive Rental Lifecycle:** Five states: `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition notes, and calculates extra charges (KM, fuel, damage, other).
- **Payment Recording:** Tracks deposit, final payment, and refunds with methods and dates.
- **Company Settings Management:** Admin-only page to configure bilingual company information displayed on contracts.
- **Dashboard:** Displays critical metrics like active rentals, monthly revenue, overdue returns, and pending refunds.
- **UI/UX:** Tabbed views for active/disabled lists, enhanced filtering (audit logs, system errors), system error acknowledgment, and full English/Arabic translations.

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