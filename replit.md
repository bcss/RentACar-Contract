# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a generic, bilingual (English/Arabic) rental car contract management system built with React, Express, and PostgreSQL. It enables rental car companies to create, manage, and finalize rental contracts. The system features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. It supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization. RCCMS is designed to be deployed for any rental car company worldwide without requiring source code modifications, as all company-specific information is configurable through an admin panel.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR switching, Inter, Cairo, JetBrains Mono fonts.
- **UI/UX Decisions:** Hierarchical sidebar (collapsible, localStorage persistence), bilingual tooltips, full RTL/LTR layout with dynamic sidebar positioning, data visualization with recharts, tabbed views, enhanced filtering, system error acknowledgment, comprehensive translations, semantic chart colors, responsive design.
- **Key Features:** Context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality, contract lifecycle management, comprehensive timeline visualization, route protection.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js (passport-local), express-session with PostgreSQL store.
- **API Design:** RESTful endpoints (`/api` prefix), role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection, full proxy trust for Replit.
- **Audit Trails:** `contractEdits` for field-level modifications; `auditLogs` for lifecycle events.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users`, `Customers`, `Vehicles`, `Sponsors`, `Companies`, `Contracts`, `Payments`, `Vehicle Inspections`, `Audit Logs`, `Contract Edits`, `Contract Counter`, `System Errors`, `Company Settings`.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, dual-layer audit trail, singleton pattern for global settings, master data pattern, separate payment tracking.
- **Disable-Only Architecture:** All delete operations replaced with disable/enable functionality tracking `disabled`, `disabledBy`, `disabledAt` fields.

### Core Features
- **Comprehensive Rental Lifecycle:** `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays full history of field edits and lifecycle events.
- **Automatic Fuel Charge Calculation:** Calculates charges based on tank capacity, fuel type, and configurable pricing, with manual override.
- **Comprehensive Financial Settings:** Admin-only centralized configuration for rental rates, addon fees, and fuel pricing.
- **Automatic Vehicle Status Synchronization:** Real-time vehicle availability integrated with contract lifecycle.
- **Vehicle Return Workflow:** Captures odometer, fuel, condition, calculates extra charges.
- **Payment Tracking System:** Comprehensive payment history for deposits, final payments, refunds.
- **Customer Phone Validation:** Non-blocking duplicate phone number detection.
- **Complete Audit Logging:** Comprehensive audit trail for all CRUD operations and contract lifecycle events.
- **Company Settings Management:** Admin-only configuration for bilingual company information and contract clauses.
- **Dashboard:** Critical metrics (active rentals, monthly revenue, overdue returns).
- **Advanced Analytics & Reporting:** Comprehensive reporting with `recharts` for financial, operational, customer reports. Includes PDF and Excel export functionality using `jsPDF` and `xlsx`, with chart visualization embedded via `html2canvas`.
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate).
- **Professional PDF Integration:** Professional, bilingual PDF generation for rental contracts.
- **Vehicle Inspection System:** Two-stage workflow (pre-delivery, post-return) with mandatory 6-photo documentation (front, back, left, right, top, dashboard), strict validation, automatic compression, visual differentiation, full history view, bilingual support, audit logging, and JSONB photo storage (MVP).

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