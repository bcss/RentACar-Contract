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
- **Performance Optimizations:** Route-based lazy loading, professional loading skeletons, optimized bundle splitting.
- **Personalized User Experience:** Dashboard features time-based greeting, role badge, last login timestamp tracking, and non-obtrusive system errors banner.

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
- **Contract Timeline:** Displays full history of field edits and lifecycle events.
- **Automatic Fuel Charge Calculation:** Based on tank capacity, fuel type, and configurable pricing.
- **Comprehensive Financial Settings:** Admin-only centralized configuration for rental rates, addon fees, and fuel pricing.
- **Automatic Vehicle Status Synchronization:** Real-time vehicle availability integrated with contract lifecycle.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition, calculates extra charges.
- **Enhanced Payment Tracking System:** Comprehensive payment history with conditional validation, mandatory final payment before contract closure.
- **Customer Phone Validation:** Non-blocking duplicate phone number detection.
- **Complete Audit Logging:** Comprehensive audit trail for CRUD operations and contract lifecycle events.
- **System Error Logging:** Automatic error logging to database with full context.
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Support & Help Center:** Unified page with dynamic system health monitoring, comprehensive documentation modals with navigation links, 20 FAQs in dropdown format, and error reporting system.
- **Legal Compliance Pages:** Professional Privacy Policy and Terms of Service pages.
- **Dashboard with Context-Aware Navigation:** Critical metrics with deep-link filtering.
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts`, PDF and Excel export functionality.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate).
- **Professional PDF Integration:** Professional, bilingual PDF generation for rental contracts.
- **Vehicle Inspection System:** Two-stage workflow (pre-delivery, post-return) with mandatory photo documentation, strict validation, and full history view.

### Data Validation & Business Rules
- **Mandatory Fields:** Enforced at both frontend (Zod schema) and backend for Customer (National ID, Nationality, Phone, License Number) and Company (TAX ID, Contact Person, Phone, Email).
- **Contract Date Validation:** Rental start date cannot be in the past.
- **Payment Method Validation:** Conditional required fields based on payment method.
- **Contract Closure Enforcement:** Final payment must be recorded before contract can be closed.

### Role-Based Permissions with Granular Toggles
- **Core Roles:** Admin, Manager, Staff, Viewer.
- **Permission Toggles:** `canAccessReports`, `canCloseContracts`, `canViewAllContracts`.
- **Implementation:** Backend middleware and frontend hooks for conditional rendering.

### Dual Audit System Architecture
- **System Audit Logs:** System-wide security and compliance logging.
- **Business Operations Audit:** Focuses on business operations (contract lifecycle, master data, payments, inspections, contract field modifications).

### Error Logging & Enhanced Error Reporter System
- **Automatic Error Capture:** All errors logged to `systemErrors` table with full context.
- **Enhanced Error Reporter:** Comprehensive error management UI with filtering, search, email workflow, screenshot capture, and status tracking.

### Dynamic System Health Monitoring
- **Real-Time Metrics:** Version from package.json, dynamic database health checks, webserver status (running/degraded based on uptime and memory), hardware info (CPU, memory).
- **Comprehensive Storage Tracking:** Total records count, vehicle inspection photos count, estimated storage size calculations.
- **Status Indicators:** Color-coded badges for database (healthy/error), webserver (running/degraded), with conditional rendering.
- **System Information Cards:** Four-card responsive grid displaying System Info, Webserver Status, Database Health, and Hardware metrics.
- **Documentation System:** Extensive modal-based guides (User Guide, Admin Guide, Feature List) with clickable navigation links to relevant pages.
- **FAQ System:** 20 comprehensive frequently asked questions in searchable dropdown format.

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