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
## Generic System Architecture

**Important:** RCCMS is a completely generic rental car management system designed to be deployed for any rental car company worldwide without source code modifications.

### System Customization
- **Company Settings:** All company-specific information is configurable through the admin panel (Company Settings page)
- **Bilingual Fields:** Company name, address, and contract clauses can be set in both English and Arabic
- **No Code Changes Required:** Any rental car company can deploy and customize RCCMS without modifying source code
- **Default Data:** The system includes sample data for demonstration purposes only

### Configuration Options
Companies can configure:
- Company legal name (English & Arabic)
- Business registration numbers
- Contact information (address, phone, email, website)
- Contract terms and conditions (bilingual)
- Rental rates and pricing
- Fuel pricing by type
- Contract PDF branding and layout

**Developer Information:**
- **Developer:** AKN Consulting
- **Support:** +91 9400750821, rccms@akn-consulting.com
- **Location:** Muttathu, Thattayil, Pathanamthitta - 691525, Kerala, India

## Documentation Maintenance Requirements

**CRITICAL:** Whenever ANY feature is added, modified, or removed from the application, the following 15 documentation files MUST be updated to reflect the changes:

### User-Facing Documentation:
1. **USER_GUIDE.md** - Update user workflows, procedures, and feature descriptions
2. **ADMIN_GUIDE.md** - Update administrative procedures and system management

### Technical Documentation:
3. **MAINTENANCE_GUIDE.md** - Update technical maintenance procedures, database queries, performance considerations
4. **CONTRACT_FLOW.md** - Update contract lifecycle workflows, state transitions, validation rules
5. **WORKFLOW_DIAGRAM.md** - Update visual workflow representations
6. **DOCKER_DEPLOYMENT_GUIDE.md** - Update deployment procedures and configuration
7. **VPS_DEPLOYMENT_GUIDE.md** - Update VPS deployment instructions

### Testing Documentation:
8. **TESTING_GUIDE.md** - Add/update test scenarios for new features
9. **TESTING_RESULTS.md** - Update test results after feature changes

### Analysis & Status Documentation:
10. **PROJECT_ANALYSIS.md** - Update feature analysis and technical architecture
11. **PRODUCTION_READINESS_REPORT.md** - Update production readiness checklist
12. **MISSING_FEATURES.md** - Add missing features or remove implemented ones

### Marketing Documentation:
13. **compelling-features.md** - Add new features to compelling features list with ROI
14. **one-pager-data.md** - Update marketing one-pager with new features
15. **SYSTEM_BROCHURE.md** - Update system brochure with new capabilities

### Update Requirements:
- **Include Rationale:** Every feature decision must include "why" it was implemented
- **Complete Coverage:** Don't assume partial updates - update ALL relevant sections
- **Consistency:** Ensure terminology, naming, and descriptions match across all files
- **Examples:** Provide practical examples for new features
- **Test Scenarios:** Add comprehensive test cases for new functionality
- **Screenshots:** Update screenshot documentation when UI changes
- **ROI Impact:** Document business value and cost savings for new features

**This is a permanent requirement - NO EXCEPTIONS.**

## Recent System Updates (October 27, 2025)

### Schema Mismatch Bugs Discovered & Fixed

During comprehensive documentation review (October 27, 2025), systematic codebase analysis uncovered 5 data contract violations. All bugs have been resolved:

**Bug #1: Payment Method Field Access Violation**
- **Location:** `server/storage.ts` lines 1307, 1334
- **Issue:** Code accessed `payment.method` but schema defines `payment.paymentMethod`
- **Impact:** Financial reports displayed "unknown" for all payment methods
- **Fix:** Corrected to `payment.paymentMethod` in 2 locations
- **Status:** ✅ FIXED

**Bug #2: Missing Audit Log Translation Keys**
- **Location:** `client/src/lib/i18n.ts`
- **Issue:** 16+ audit log actions lacked English/Arabic translations
- **Impact:** Audit logs showed untranslated keys (e.g., "action.confirm")
- **Fix:** Added 26 translation keys for all lifecycle and master data operations
- **Status:** ✅ FIXED

**Bug #3: ContractEdits Property Access Violation**
- **Location:** `server/storage.ts` line 1626
- **Issue:** Code accessed non-existent `m.fieldName` property
- **Impact:** Audit report endpoint would throw runtime error
- **Fix:** Removed incorrect field breakdown logic (schema uses JSONB snapshots)
- **Status:** ✅ FIXED

**Bug #4: Undefined Variable Reference**
- **Location:** `server/storage.ts` line 1648
- **Issue:** Return statement referenced undefined `userActivity` variable
- **Impact:** Audit report endpoint would fail
- **Fix:** Implemented userActivity calculation from modification counts
- **Status:** ✅ FIXED

**Bug #5: Incomplete User Activity Tracking**
- **Location:** `server/storage.ts` lines 1629-1659
- **Issue:** User activity only counted modifications, ignored all audit log actions (create, confirm, activate, etc.)
- **Impact:** User activity report was incomplete - missing contract creations and lifecycle actions
- **Fix:** Enhanced to aggregate from BOTH sources (contractEdits + auditLogs) with detailed breakdown
- **New Output:** Returns modificationCount, auditActionCount, and totalActions per user
- **Status:** ✅ FIXED

**Prevention Strategies Established:**
1. TypeScript strict mode enforcement for all database access
2. LSP diagnostics review before every commit
3. Schema validation checklist for code reviews
4. Integration testing for all report endpoints

**Documentation Updates Completed:**
All 15 required documentation files have been updated with:
- Bug fix details and impact analysis (PROJECT_ANALYSIS.md)
- User-facing summaries (USER_GUIDE.md, ADMIN_GUIDE.md)
- Technical maintenance notes (MAINTENANCE_GUIDE.md)
- Testing validation (TESTING_RESULTS.md)
- Authoritative documentation cross-references (all 15 files)

**System Status:** ✅ Production-ready with enhanced data integrity and reliability
