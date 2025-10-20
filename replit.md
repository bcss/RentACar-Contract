# Rental Car Contract Management System

## Overview
This bilingual (English/Arabic) rental car contract management system, built with React, Express, and PostgreSQL, enables users to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (October 20, 2025)

### Persons Master Data Architecture - COMPLETED
- **Reusable Person Records:** Converted inline sponsor/driver fields to master data architecture with `persons` table for sponsors and drivers across contracts
  - Eliminates repetitive data entry for frequent sponsors/drivers
  - Bilingual person records with nameEn, nameAr, nationality, passportId, licenseNumber, mobile, address, relation
  - Disable/enable functionality for person records (admin/manager only)
- **Database Design:**
  - `persons` table with comprehensive person information
  - Foreign keys `sponsorId` and `driverId` on contracts table linking to persons
  - Legacy inline sponsor*/hirer* fields retained for backward compatibility with existing contracts
- **Contract Form Integration:**
  - PersonSelector component with search and create-new functionality
  - Replace sponsor inline fields with PersonSelector when hirerType='with_sponsor'
  - Replace driver inline fields with PersonSelector when hirerType='from_company'
  - Flexible validation: accepts EITHER person IDs (new workflow) OR legacy inline fields (backward compatibility)
    - For with_sponsor: accepts sponsorId OR sponsorName (minimal requirement for legacy contracts)
    - For from_company: accepts driverId OR hirerNameEn (minimal requirement for legacy contracts)
- **Contract Display:**
  - Helper functions getSponsorDisplay() and getDriverDisplay() provide fallback logic
  - Person data from joined persons table displayed in contract view with graceful fallback to legacy inline fields
  - MARMAR PDF template supports both new person data and legacy inline fields
- **Persons Management Page:**
  - Admin/manager exclusive page at /persons route
  - Full CRUD operations: create, edit, disable, enable persons
  - Tabbed views for active/disabled persons with search functionality
  - Following Customers/Vehicles pattern for consistency
- **Storage & API:**
  - Storage layer joins persons table with contracts, returns sponsorPerson/driverPerson in ContractWithDetails
  - Complete REST API: GET /api/persons, POST /api/persons, GET /api/persons/search?q={query}, PATCH /api/persons/:id, PATCH /api/persons/:id/disable, PATCH /api/persons/:id/enable
  - Role-based access: admin/manager can manage persons, staff/viewer can view (via PersonSelector in contract form)

### Additional Contract Clauses Population - October 20, 2025
- **MARMAR Template Integration:** Populated all 11 Additional Contract Clauses in company settings from official MARMAR rental contract template
  - **Write-Off & Confiscation:** Total loss compensation including insurance policy cost and court time
  - **Credit Card Authorization:** Authorization text for traffic fines and parking penalties
  - **Desert/UAE Prohibition:** Vehicle usage and insurance limited to UAE only
  - **Accident Liability - Hirer Fault:** AED 2500 responsibility clause for hirer-caused accidents
  - **Accident Liability - Police Reporting:** Immediate notification requirement for all accidents
  - **Monthly Payment Schedule:** Default to daily rate if no weekly/monthly arrangement
  - **Daily KM Limit:** 300 km/day limit with 50 fils/km overage charge
  - **Monthly KM Limit:** 24-hour day definition for rental calculations
  - **Self-Repair Penalty:** Prohibition on unauthorized vehicle repairs
  - **Daily Rate Default:** 9pm return deadline to avoid full-day charges
  - **Back Page Reference:** Damage and repair responsibility during hire period
- All clauses available in both English and Arabic, fully editable via Settings page

### Bug Fixes - October 20, 2025
1. **PersonSelector Search API Fix:** Fixed query parameter format from `/api/persons/search/${query}` to `/api/persons/search?q=${query}` to match backend endpoint expectations. TanStack Query default fetcher was joining query key segments with slashes instead of using proper query parameters.
2. **Contract Form Dialog Trigger Fix:** Replaced DialogTrigger components with regular onClick buttons for Create Customer and Create Vehicle dialogs to prevent form submission event conflicts. Person dialogs were already correctly structured outside main form.
3. **Backward Compatibility Validation:** Made form validation lenient to accept legacy contracts with minimal inline data (just name field) while encouraging PersonSelector use for new contracts via insertPersonSchema validation.

## Recent Updates (October 19, 2025)

### MARMAR Template PDF Integration
- **Print-Only Sections:** Integrated official MARMAR rental contract template for professional PDF generation
  - **Sponsor/Hirer Section:** Two-column layout with sponsor on left (conditional on hirerType), hirer on right with complete customer/license/vehicle details
  - **Vehicle Inspection Section:** Displays tools, spare tyre, GPS checkboxes, fuel percentage start/end, and damage notes using static Unicode symbols (☑/☐)
  - **Payment Breakdown Section:** Complete payment grid with Rent, VAT, SALIK, Traffic Fines, Damage, Extra KM, Fuel Charge, Deposit, Others, and Total Amount
  - **Signature Section:** Dynamic layout with 2 boxes (Office In-charge, Hirer) or 3 boxes (Office In-charge, Sponsor, Hirer) based on hirerType
- **Print CSS Optimizations:** Enhanced print stylesheet to ensure proper PDF layout
  - Valid selector sequence for hiding/showing buttons in print
  - Ensured borders, backgrounds, colors, and grid layouts print correctly
  - Prevented page breaks in signature section
  - Optimized font sizing and spacing for professional appearance

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
- **Schema Design:** Tables for `Sessions`, `Users` (with role-based access), `Customers` (master data for hirers/renters), `Vehicles` (master data for rental fleet), `Persons` (master data for sponsors/drivers), `Contracts` (core entity with bilingual fields, status tracking, payment, extra charges, and foreign keys to customers/vehicles/persons), `Audit Logs` (immutable lifecycle activity log), `Contract Edits` (detailed field change tracking), `Contract Counter`, `System Errors` (with acknowledgment workflow), and `Company Settings` (singleton table for configurable company info).
- **Master Data Architecture:** Persons table enables reusing sponsor/driver records across contracts with sponsorId/driverId foreign keys. Legacy inline sponsor*/hirer* fields maintained for backward compatibility.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, comprehensive dual-layer audit trail (edits + lifecycle), singleton pattern for global settings, and master data pattern for customers/vehicles/persons.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for users, customers, vehicles, persons, and contracts, tracking `disabled`, `disabledBy`, `disabledAt` fields.

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
