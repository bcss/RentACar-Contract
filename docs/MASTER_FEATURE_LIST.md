# RCCMS - Master Feature List
**Generated:** December 2024  
**Purpose:** Comprehensive single source of truth for all implemented features - used for documentation consistency verification

---

## 1. DATABASE ARCHITECTURE (15 Tables)

### Core Tables
1. **sessions** - Session data storage (Replit Auth + internal auth)
2. **users** - Internal username/password authentication with role-based access (Admin, Manager, Staff, Viewer)
3. **customers** - Master data for rental customers/hirers (bilingual fields)
4. **vehicles** - Master data for rental fleet (bilingual support, status tracking)
5. **sponsors** - Master data for individual sponsors/drivers (bilingual fields)
6. **companies** - Master data for corporate sponsors (bilingual fields)

### Contract & Transaction Tables
7. **contracts** - Core rental contract records (5 lifecycle states: draft → confirmed → active → completed → closed)
8. **payments** - Comprehensive payment tracking (deposits, final payments, refunds)
9. **vehicle_inspections** - Two-stage inspection workflow (pre-delivery & post-return) with 6-photo mandatory documentation
10. **damage_assessments** - Structured damage tracking for completed rentals

### Audit & System Tables
11. **audit_logs** - Comprehensive lifecycle event tracking (CREATE, UPDATE, DELETE/disable/enable operations)
12. **contract_edits** - Field-level modification tracking with before/after snapshots and reason capture
13. **contract_counter** - Auto-incrementing contract number generation
14. **system_errors** - System error logging with acknowledgment workflow
15. **company_settings** - Singleton pattern for global system configuration (bilingual company info, financial settings, contract clauses)

---

## 2. API ARCHITECTURE (100+ Endpoints)

### Authentication (1 endpoint)
- `GET /api/auth/user` - Current user retrieval

### Customers (8 endpoints)
- `GET /api/customers` - List with disable filter
- `GET /api/customers/search` - Search by name
- `GET /api/customers/:id` - Individual customer
- `POST /api/customers` - Create (Manager/Admin)
- `PATCH /api/customers/:id` - Update (Manager/Admin)
- `POST /api/customers/:id/disable` - Disable (Manager/Admin)
- `POST /api/customers/:id/enable` - Enable (Manager/Admin)
- `GET /api/customers/check-phone/:phone` - Duplicate phone detection with non-blocking warnings

### Vehicles (8 endpoints)
- `GET /api/vehicles` - List with disable filter
- `GET /api/vehicles/search` - Search by registration
- `GET /api/vehicles/:id` - Individual vehicle
- `GET /api/vehicles/:id/availability` - Date range availability check
- `POST /api/vehicles` - Create (Manager/Admin)
- `PATCH /api/vehicles/:id` - Update (Manager/Admin)
- `POST /api/vehicles/:id/disable` - Disable (Manager/Admin)
- `POST /api/vehicles/:id/enable` - Enable (Manager/Admin)

### Sponsors (8 endpoints)
- `GET /api/sponsors` - List with disable filter
- `GET /api/sponsors/search` - Search by name
- `GET /api/sponsors/:id` - Individual sponsor
- `POST /api/sponsors` - Create (Manager/Admin)
- `PATCH /api/sponsors/:id` - Update (Manager/Admin)
- `POST /api/sponsors/:id/disable` - Disable (Manager/Admin)
- `POST /api/sponsors/:id/enable` - Enable (Manager/Admin)

### Companies (8 endpoints)
- `GET /api/companies` - List with disable filter
- `GET /api/companies/search` - Search by name
- `GET /api/companies/:id` - Individual company
- `POST /api/companies` - Create (Manager/Admin)
- `PATCH /api/companies/:id` - Update (Manager/Admin)
- `POST /api/companies/:id/disable` - Disable (Manager/Admin)
- `POST /api/companies/:id/enable` - Enable (Manager/Admin)

### Contracts (17 endpoints)
- `GET /api/contracts` - List all (role-based filtering: Staff see only their own)
- `GET /api/contracts/disabled` - Disabled contracts (Admin only)
- `GET /api/contracts/:id` - Individual contract with real-time outstanding balance calculation
- `GET /api/contracts/:id/edits` - Edit history
- `GET /api/contracts/:id/audit-logs` - Audit logs
- `POST /api/contracts` - Create new contract
- `PATCH /api/contracts/:id` - Update draft contract (requires edit reason)
- `POST /api/contracts/:id/confirm` - Transition: draft → confirmed (includes vehicle availability check)
- `POST /api/contracts/:id/activate` - Transition: confirmed → active (requires pre-delivery inspection, prevents early activation)
- `POST /api/contracts/:id/complete` - Transition: active → completed (requires post-return inspection, recalculates charges)
- `POST /api/contracts/:id/close` - Transition: completed → closed (requires payment verification, Admin only)
- `POST /api/contracts/:id/deposit` - Legacy deposit payment endpoint
- `POST /api/contracts/:id/final-payment` - Legacy final payment endpoint
- `POST /api/contracts/:id/refund` - Legacy refund endpoint
- `POST /api/contracts/:id/disable` - Disable contract (Admin only)
- `POST /api/contracts/:id/enable` - Enable contract (Admin only)
- `POST /api/contracts/:id/print` - Log print action

### Payments (3 endpoints)
- `POST /api/contracts/:contractId/payments` - Create payment (Manager/Admin)
- `GET /api/contracts/:contractId/payments` - List all payments for contract
- `DELETE /api/payments/:id` - Delete payment (Admin only)

### Vehicle Inspections (3 endpoints)
- `POST /api/contracts/:contractId/inspections` - Create inspection (pre-delivery or post-return)
- `GET /api/contracts/:contractId/inspections` - List all inspections for contract
- `GET /api/inspections/:id` - Individual inspection details

### Audit & System (5 endpoints)
- `GET /api/audit-logs` - All audit logs (Admin/Manager)
- `GET /api/audit-logs/recent` - 10 most recent logs
- `GET /api/system-errors` - All system errors (Admin only)
- `GET /api/system-errors/unacknowledged` - Unacknowledged errors (Admin only)
- `POST /api/system-errors/:id/acknowledge` - Acknowledge error (Admin only)

### Analytics (3 endpoints)
- `GET /api/analytics/revenue` - Revenue analytics (Admin/Manager)
- `GET /api/analytics/operations` - Operational analytics (Admin/Manager)
- `GET /api/analytics/customers` - Customer analytics (Admin/Manager)

### Reports (12 endpoints)
- `GET /api/reports/financial` - Financial report with date range
- `GET /api/reports/operational` - Operational report with date range
- `GET /api/reports/customers` - Customer report with date range
- `GET /api/reports/audit` - Audit report with date range
- `POST /api/reports/financial/export` - Export to PDF/Excel with chart visualization embedding
- `POST /api/reports/operational/export` - Export to PDF/Excel with chart visualization embedding
- `POST /api/reports/customers/export` - Export to PDF/Excel with chart visualization embedding
- `POST /api/reports/audit/export` - Export to PDF/Excel with chart visualization embedding

### Settings (4 endpoints)
- `GET /api/settings` - All company settings
- `PUT /api/settings` - Update all settings (Admin only)
- `GET /api/settings/financial` - Financial settings only
- `PUT /api/settings/financial` - Update financial settings (Admin only)

### User Management (7 endpoints)
- `GET /api/users` - All users (Admin only)
- `GET /api/users/:id` - Individual user
- `PATCH /api/users/:id/role` - Update role (Admin only)
- `POST /api/users` - Create user (Admin only)
- `POST /api/users/:id/disable` - Disable user (Admin only)
- `POST /api/users/:id/enable` - Enable user (Admin only)
- `GET /api/users/disabled` - Disabled users (Admin only)
- `POST /api/users/change-password` - Change own password

---

## 3. FRONTEND ARCHITECTURE (22 Pages)

### Public Pages (2)
1. **Landing** (`/`) - Welcome page with login button
2. **Login** (`/login`) - Internal authentication

### Core Pages (5)
3. **Dashboard** (`/`) - Metrics overview (active rentals, monthly revenue, overdue returns, system errors)
4. **Contracts** (`/contracts`) - Contract list with filtering (status, date range)
5. **Contract View** (`/contracts/:id`) - Detailed contract view (timeline, payments, inspections, legal terms)
6. **Contract Form** (`/contracts/new`, `/contracts/:id/edit`) - Create/edit contracts
7. **Not Found** - 404 catch-all

### Master Data Pages (4)
8. **Customers** (`/customers`) - Customer management with active/disabled tabs
9. **Vehicles** (`/vehicles`) - Vehicle management with active/disabled tabs
10. **Sponsors** (`/sponsors`) - Individual sponsor management with active/disabled tabs
11. **Companies** (`/companies`) - Corporate sponsor management with active/disabled tabs

### Report Pages (4)
12. **Financial Reports** (`/reports/financial`) - Revenue trends, payment collection, outstanding payments with recharts visualization
13. **Operational Reports** (`/reports/operational`) - Vehicle utilization, contract status with recharts visualization
14. **Customer Reports** (`/reports/customers`) - Customer activity, retention rates with recharts visualization
15. **Audit Reports** (`/reports/audit`) - Contract modifications, system actions, user activity

### Admin Pages (5)
16. **Audit Logs** (`/audit`) - System action trail (filtering by action, user, date range)
17. **System Errors** (`/system-errors`) - Error list with acknowledgment (Admin only)
18. **Users** (`/users`) - User management (Admin only)
19. **Settings** (`/settings`) - Multi-tab settings page (company, financial, terms & conditions)
20. **Company Settings** (Settings tab) - Company info configuration
21. **Financial Settings** (Settings tab) - Rental rates, addon fees, fuel pricing
22. **Terms & Conditions** (Settings tab) - Bilingual contract clauses editor

---

## 4. UI/UX FEATURES

### Microsoft 365-Style Sidebar (Latest Implementation)
- **Responsive Header Controls:** Horizontal layout (flex-row) when expanded, vertical layout (flex-col) when collapsed to prevent overflow
- **Icon-Only Collapsed Mode:** All controls remain accessible with icons only
- **Deferred Submenu Opening:** `pendingSubmenuOpen` state + `useEffect` pattern ensures submenus open AFTER sidebar expansion completes (no race conditions)
- **Complete Tooltip Coverage:** All 6 main menu items (Dashboard, Masters, Contracts, Reports, Audit, Settings) have tooltips in collapsed mode
- **Hierarchical Navigation:** Collapsible sections (Masters, Reports, Audit, Settings) with localStorage state persistence
- **RTL/LTR Adaptation:** Sidebar positioned right (Arabic) or left (English), tooltip positioning adapts
- **Bilingual Tooltips:** Dynamic aria-labels and tooltip content based on current language

### Material Design 3 System
- **Color System:** Cyan-blue primary, semantic color tokens
- **Typography:** Inter (English), Cairo (Arabic), JetBrains Mono (code)
- **Dual Theme:** Light/dark mode with automatic CSS variable switching
- **Elevation System:** Subtle shadows, elevated cards
- **Responsive Layout:** Mobile-first design with breakpoint adaptation

### Bilingual Architecture (i18next)
- **Complete English/Arabic Support:** All UI strings, error messages, validation messages
- **RTL/LTR Layout Switching:** Automatic direction change with language toggle
- **Bilingual Data Fields:** nameEn/nameAr, companyNameEn/companyNameAr, currencyEn/currencyAr
- **Dynamic Font Loading:** Google Fonts (Inter, Cairo, JetBrains Mono)

### Form System (React Hook Form + Zod)
- **Comprehensive Validation:** Client-side + server-side validation
- **Smart Defaults:** Auto-filled fields (inspector name, created by, timestamps)
- **Non-Blocking Warnings:** Duplicate phone detection with warning (not error)
- **Date/Time Pickers:** React Day Picker integration
- **File Upload:** Image compression for inspections (1920x1080, 0.85 quality, JPEG)

### Data Visualization (recharts)
- **Financial Charts:** Monthly revenue trends (line chart), revenue by status (pie chart), payment method breakdown (pie chart)
- **Operational Charts:** Vehicle utilization (bar chart), contract status distribution (pie chart)
- **Customer Charts:** Top customers by revenue (bar chart), retention analysis (donut chart)
- **Theme Integration:** Charts adapt to light/dark mode
- **Responsive Design:** Charts resize for mobile/tablet/desktop

---

## 5. CORE BUSINESS FEATURES

### Contract Lifecycle Management
1. **Five-Stage Workflow:** draft → confirmed → active → completed → closed
2. **Role-Based Permissions:** Staff (create/view own), Manager (view all), Admin (full control)
3. **Immutability Rules:** Finalized contracts cannot be edited (only closed by Admin)
4. **Sequential Gating:** Pre-delivery inspection required for activation, post-return inspection required for completion
5. **Automatic Vehicle Status:** Real-time synchronization (rented/available) based on contract lifecycle

### Payment Tracking System
1. **Comprehensive Payment History:** Separate `payments` table for all transactions
2. **Real-Time Outstanding Balance:** Calculated from totalAmount + totalExtraCharges - sum(payments)
3. **Multiple Payment Methods:** Cash, card, bank transfer, check
4. **Payment Deletion:** Admin-only with audit logging
5. **Currency Support:** Configurable via company settings (bilingual currency names)

### Two-Stage Vehicle Inspection Workflow
1. **Pre-Delivery Inspection:**
   - Required before contract activation (gates draft → confirmed → active)
   - Mandatory 6 unique photos at different angles (front, back, left, right, top, dashboard)
   - Strict photo validation (no duplicates, validated frontend + backend)
   - Auto-compression (1920x1080, 0.85 quality, JPEG)
   - Captures: inspector name, odometer reading, fuel level, condition notes
   - Automatic chaining to activation workflow

2. **Post-Return Inspection:**
   - Required before rental completion (gates active → completed)
   - Same 6-photo requirement with validation
   - Auto-compression applied
   - Captures return condition data
   - Automatic chaining to return charges dialog

3. **Inspection History View:**
   - Complete timeline with photo gallery
   - Zoom capabilities for photos
   - Visual differentiation (default badge for pre-delivery, secondary badge for post-return)
   - Material icons (local_shipping/assignment_turned_in)
   - Full bilingual support

4. **Technical Implementation:**
   - JSONB photo storage (base64-encoded)
   - Inspector tracking (name, timestamp, user auth)
   - Comprehensive audit logging
   - API: POST create, GET list, GET individual

### Financial Calculations
1. **Automatic Fuel Charge:** Based on tank capacity, fuel type, configurable pricing (manual override available)
2. **Rental Rate Calculation:** Daily/weekly/monthly rates from vehicle or company defaults
3. **Extra Charges:** Extra kilometers, damages, addons (GPS, baby seat, insurance, additional driver)
4. **VAT Support:** Configurable VAT percentage in company settings
5. **Security Deposit:** Configurable default with per-contract override

### Master Data Architecture
1. **Reusable Records:** Customers, vehicles, sponsors (individual), companies (corporate)
2. **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate)
3. **Disable-Only Pattern:** No deletion - all entities can be disabled/enabled with tracking (disabledBy, disabledAt)
4. **Bilingual Fields:** nameEn/nameAr for all master entities
5. **Search Functionality:** Real-time search by name, registration, phone, etc.

### Audit & Compliance
1. **Dual-Layer Audit Trail:**
   - `auditLogs` - Lifecycle events (CREATE, UPDATE, DELETE/disable/enable)
   - `contractEdits` - Field-level modifications with before/after snapshots + reason

2. **Comprehensive Event Tracking:**
   - All CRUD operations
   - Contract state transitions
   - Payment additions/deletions
   - Inspection creation
   - User role changes
   - Settings updates

3. **System Error Management:**
   - Automatic error logging
   - Admin-only acknowledgment workflow
   - Dashboard alerts for unacknowledged errors

### Report Export System
1. **Four Report Types:** Financial, Operational, Customer, Audit
2. **Dual Format Export:** PDF and Excel
3. **Chart Visualization Embedding:**
   - Frontend: html2canvas captures recharts as images
   - Backend: Receives base64-encoded chart images
   - PDF: Full chart images embedded
   - Excel: Metadata sheet with chart data
4. **Technical Details:**
   - jsPDF v3.x with named export
   - xlsx library for Excel
   - Request body limit: 10MB for base64 images
   - Bilingual support in exports
5. **Date Range Filtering:** All reports support custom date ranges

### Generic System Architecture
1. **Zero Hardcoding:** All company info configurable via admin panel
2. **Bilingual Configuration:** Company name, address, contract clauses (English + Arabic)
3. **No Code Changes Required:** Any rental company can deploy and customize
4. **Sample Data:** Included for demonstration only
5. **Currency Flexibility:** Configurable currency symbol and name (bilingual)

---

## 6. TECHNICAL INFRASTRUCTURE

### Authentication & Security
- **Internal Username/Password:** Passport.js with passport-local strategy
- **Session Management:** PostgreSQL-backed sessions (connect-pg-simple)
- **Role-Based Access Control:** Admin, Manager, Staff, Viewer with middleware enforcement
- **Password Security:** bcrypt hashing, last password change tracking
- **Immutable Super Admin:** Cannot be deleted, system protection
- **CSRF Protection:** Full implementation
- **Secure Cookies:** httpOnly, secure flags in production
- **Full Proxy Trust:** Replit environment configuration

### Database & ORM
- **PostgreSQL (Neon Serverless):** Production database
- **Drizzle ORM:** Type-safe database queries
- **Migration Strategy:** Drizzle Kit for schema management
- **JSONB Storage:** Inspection photos (MVP approach, ready for object storage migration)
- **Indexes:** Session expiration index for performance
- **Constraints:** Foreign keys, unique constraints, not null enforcement

### Frontend Stack
- **React 18 + TypeScript:** Component-based architecture
- **Wouter:** Lightweight routing
- **TanStack Query v5:** Server state management, caching, mutations
- **React Hook Form:** Form state management
- **Zod Validation:** Runtime type checking + validation
- **Radix UI + shadcn/ui:** Accessible component primitives
- **Tailwind CSS:** Utility-first styling
- **Vite:** Build tool and dev server

### Backend Stack
- **Node.js + TypeScript:** Server runtime
- **Express.js:** HTTP server framework
- **RESTful API:** `/api` prefix, JSON responses
- **Centralized Error Handling:** Consistent error responses
- **Request Validation:** Zod schema validation on all POST/PATCH endpoints
- **Audit Middleware:** Automatic logging for all mutations

### Document Generation
- **jsPDF v3.x:** PDF generation with named export
- **jspdf-autotable:** Table formatting in PDFs
- **xlsx:** Excel file generation
- **html2canvas:** Chart screenshot capture for export
- **Bilingual Templates:** English/Arabic contract PDFs

### Development Tools
- **TypeScript:** Static typing across stack
- **ESBuild:** Fast transpilation
- **Drizzle Studio:** Database GUI
- **Development Workflow:** `npm run dev` (Express + Vite concurrently)

---

## 7. DEPLOYMENT & PRODUCTION

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment flag
- `PORT` - Server port (default: 5000)

### Production Readiness
- **Error Logging:** System errors table with acknowledgment
- **Session Persistence:** PostgreSQL-backed sessions survive restarts
- **HTTPS Support:** Secure cookie configuration
- **Proxy Trust:** Express proxy trust for Replit
- **Database Migrations:** Drizzle migration system
- **Backup Strategy:** Database-level backups (Neon)

### Performance Optimization
- **Route-Based Lazy Loading (December 2025):** React.lazy() + Suspense for all 21 pages (except Login)
  - Initial bundle: ~50KB (reduced from ~744KB - 88% smaller)
  - Load time: 1-2s (improved from 4-5s - 3-4x faster)
  - Professional loading spinner (Loader2) during page transitions
  - Browser caching for instant navigation to visited pages
  - NotFound page also lazy-loaded with Suspense
- **Query Optimization:** Drizzle ORM efficient queries
- **Image Compression:** Automatic for inspection photos (10MB → 500KB)
- **Caching:** TanStack Query client-side caching with invalidation
- **Memoization:** React component optimization where beneficial

---

## 8. DOCUMENTATION COVERAGE REQUIREMENTS

### ALL 15 Files Must Include:
1. **Microsoft 365 Sidebar:** Responsive controls, deferred submenu, complete tooltips
2. **Two-Stage Inspection:** Pre-delivery + post-return with 6-photo mandatory workflow
3. **Dual Audit System:** auditLogs + contractEdits tables
4. **Report Export:** PDF/Excel with chart visualization embedding
5. **Disable-Only Architecture:** No deletions, only disable/enable with tracking
6. **Generic System:** Zero hardcoding, configurable company settings
7. **Role-Based Permissions:** Admin, Manager, Staff, Viewer with specific capabilities
8. **Contract Lifecycle:** 5 states with sequential gating
9. **Payment Tracking:** Separate payments table, real-time outstanding balance
10. **Bilingual Support:** i18next, RTL/LTR, bilingual data fields

### Critical Implementation Details:
- `pendingSubmenuOpen` state pattern for deferred submenu opening
- `flex-row` (expanded) vs `flex-col` (collapsed) responsive header layout
- Pre-delivery inspection gates activation, post-return inspection gates completion
- html2canvas → base64 → backend → PDF/Excel embedding workflow
- Real-time outstanding balance calculation: totalAmount + totalExtraCharges - sum(payments)
- Automatic vehicle status synchronization with contract lifecycle
- Duplicate phone detection (non-blocking warning, not error)
- Image compression (1920x1080, 0.85 quality, JPEG) for all inspections
- jsPDF v3.x named export import pattern
- 10MB request body limit for chart image uploads

---

## 9. MISSING FROM REPLIT.MD (Needs Addition)

### Microsoft 365 Sidebar Latest Implementation
- **Responsive Header Controls:** flex-row (expanded) vs flex-col (collapsed) pattern
- **Deferred Submenu Opening:** pendingSubmenuOpen state + useEffect implementation details
- **Complete Tooltip Coverage:** All 6 main menu items now have tooltips

### Technical Patterns Not Documented
- `useEffect` hook pattern for sidebar expansion + submenu opening coordination
- localStorage persistence for collapsible section states
- Tooltip positioning logic (left for Arabic, right for English)
- Dynamic aria-label updates based on sidebar state

### API Implementation Details
- Real-time outstanding balance calculation in GET /api/contracts/:id
- Role-based filtering in GET /api/contracts (Staff see only own contracts)
- Vehicle availability check in POST /api/contracts/:id/confirm
- Edit reason requirement in PATCH /api/contracts/:id

---

## VERSION HISTORY
- **v1.0 (December 2024):** Initial master feature list created from comprehensive codebase inventory + replit.md cross-reference
- **Purpose:** Single source of truth for documentation consistency verification across all 15 documentation files

---

**Developer:** AKN Consulting  
**Support:** +91 9400750821, rccms@akn-consulting.com  
**Location:** Muttathu, Thattayil, Pathanamthitta - 691525, Kerala, India
