# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## Recent Changes (October 23, 2025)
- **🔒 CRITICAL SECURITY FIXES - PRODUCTION READY:** Completed 6 critical backend validation and security fixes (architect-approved):
  1. **Backend Fuel Calculation Security:** Server-side fuel charge calculation prevents client manipulation. Backend fetches vehicle tankCapacity/fuelType and fuel pricing, calculates charges automatically, ignores client values unless fuelChargeOverride flag set with full audit logging.
  2. **Double-Booking Prevention:** Added `checkVehicleAvailability()` validation before confirming contracts. Returns 400 error if vehicle has overlapping confirmed/active/completed contracts.
  3. **Payment Architecture Cleanup:** Removed legacy payment routes (deposit/final-payment/refund). System now uses only new payments table with RBAC-protected CRUD operations.
  4. **Payment Validation with Currency Precision:** Close contract endpoint calculates outstanding balance server-side with proper rounding (`Math.round(value*100)/100`), compares with 0.001 AED threshold. Prevents underpayment exploits.
  5. **Activation Date Validation:** Prevents activating contracts before rental start date. Compares current date (date-only) with rentalStartDate, returns 400 error if too early.
  6. **Contract Immutability Verification:** Confirmed PATCH endpoint enforces draft-only editing, returns 403 for non-draft contracts.
- **Automatic Fuel Charge Calculation System:** Implemented comprehensive fuel management with automatic charge calculation. Added `tankCapacity` field to vehicles table (in liters), petrol/diesel pricing in Financial Settings (via new `/api/settings/financial` endpoints), and automatic calculation on vehicle return using formula: `fuelCharge = tankCapacity × (startFuelLevel% - endFuelLevel%) / 100 × pricePerLiter`. Supports manual override and displays detailed breakdown in contract completion workflow.
- **Comprehensive Financial Settings System:** Created dedicated Financial Settings page at `/settings/financials` (admin-only) with 11 configurable defaults: defaultDailyRate, defaultWeeklyRate, defaultMonthlyRate, insurancePerDay, gpsPerDay, babySeatPerDay, additionalDriverFee, defaultExtraKmRate, defaultSecurityDeposit, petrolPricePerLiter, dieselPricePerLiter. New contracts automatically populate all rates from financial settings with per-contract manual override capability. Backend API endpoints: GET/PUT `/api/settings/financial`.
- **Automatic Vehicle Status Synchronization:** Implemented automatic vehicle status updates integrated with contract lifecycle. Contract confirm/activate → vehicle status changes to "rented"; contract complete/close → vehicle status changes to "available". Prevents double-booking and maintains accurate real-time vehicle availability.
- **Customer Phone Uniqueness Validation:** Added non-blocking phone duplicate detection with real-time validation (500ms debounce). Shows warning when duplicate phone number detected, displays names of customers with same phone, allows user to proceed if intentional (e.g., family members). API endpoint: GET `/api/customers/check-phone/:phone`.
- **Complete UPDATE Audit Logging:** Expanded comprehensive audit logging to cover all master data UPDATE operations (customers, vehicles, sponsors, companies, users) in addition to existing CREATE/DELETE/disable/enable logging. Full field-level change tracking in contractEdits table provides complete audit trail for compliance and data integrity.
- **Database Schema Enhancements:** Added `tankCapacity` (numeric) and ensured `fuelType` (petrol/diesel/electric/hybrid) fields in vehicles table. Expanded company_settings table with 11 new financial default fields. All changes backward-compatible with existing data.
- **Previous Major Updates (October 21, 2025):**
  - Database Schema Update: Renamed `persons` table to `sponsors` throughout entire stack
  - Payments System: Comprehensive payment tracking with dedicated table, CRUD API, RBAC, audit logging
  - Type Safety: Shared `UserRole` enum for consistent role management
  - Navigation Reorganization: Page-based architecture with hierarchical sidebar
  - UI/UX Improvements: Dynamic company name, 6 status cards, filter alignment standardization
  - Bug Fixes: Server error handler, sponsor form reference, payment validation, dashboard cards
  - Form Enhancements: Shared insert schemas for type consistency
  - Audit/RBAC/Availability Verification: Comprehensive coverage verified
  - End-to-End Testing: Full workflow validation completed

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
- **Automatic Fuel Charge Calculation:** Smart fuel management system that automatically calculates fuel charges based on vehicle tank capacity, fuel type (petrol/diesel), and configurable per-liter pricing. Formula: `fuelCharge = tankCapacity × (startFuelLevel% - endFuelLevel%) / 100 × pricePerLiter`. Includes manual override capability and detailed breakdown display in completion workflow.
- **Comprehensive Financial Settings:** Centralized financial configuration page (admin-only) managing 11 default rates: rental rates (daily/weekly/monthly), addon fees (insurance/GPS/baby seat), additional driver fee, extra km rate, security deposit, and fuel pricing (petrol/diesel per liter). All new contracts auto-populate from these defaults with per-contract override capability.
- **Automatic Vehicle Status Synchronization:** Real-time vehicle availability management integrated with contract lifecycle. Contract confirmation/activation automatically sets vehicle status to "rented", preventing double-booking. Contract completion/closure automatically returns vehicle status to "available" for new rentals.
- **Vehicle Return Workflow:** Captures odometer, fuel levels, condition notes, and automatically calculates all extra charges including fuel consumption based on tank capacity and pricing.
- **Payment Tracking System:** Comprehensive payment history with separate `payments` table. Records deposits, final payments, and refunds with full details (amount, method, currency, date, payer, notes). Payment management UI integrated into ContractView with add/delete capabilities and payment history display.
- **Customer Phone Validation:** Non-blocking duplicate phone number detection with real-time validation (500ms debounce). Shows informative warnings when duplicate phone detected, displays customer names with matching numbers, allows proceeding if intentional (e.g., family members).
- **Complete Audit Logging:** Comprehensive audit trail covering all operations: CREATE (customers, vehicles, sponsors, companies, contracts, payments, users), UPDATE (all master data with field-level tracking), DELETE/disable/enable, and contract lifecycle events. Dual-layer system: `auditLogs` table for lifecycle events, `contractEdits` table for field-level modifications.
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