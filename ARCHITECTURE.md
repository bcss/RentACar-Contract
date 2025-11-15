# RCCMS - Comprehensive Architectural Analysis

## 1. APPLICATION OVERVIEW & CORE FEATURES

### **What RCCMS Is**
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) enterprise application for managing the complete rental car lifecycle. It supports RTA (Roads & Transport Authority) compliance fields for UAE operations and implements a streamlined 4-state contract workflow with comprehensive audit trails, role-based access control, and extensive reporting capabilities.

---

## 2. DATABASE SCHEMA (shared/schema.ts)

### **Core Tables (20 Total)**

#### **Authentication & Authorization**
- **`sessions`** - Passport.js session storage (lines 30-38)
- **`users`** - Staff authentication with username/password (lines 40-64)
  - Roles: admin, manager, staff, viewer
  - Fine-grained permissions: `canAccessReports`, `canCloseContracts`, `canViewAllContracts`
  - Tracks last login for dashboard display
  - Soft-delete with `disabled` flag

#### **Master Data**
- **`customers`** (lines 77-156) - Customer/hirer records with:
  - Bilingual fields (`nameEn`, `nameAr`)
  - RTA license fields (permitted vehicles, transmission type, glasses requirement, traffic code)
  - Extended license details from RTA documents
  - Mandatory: National ID, nationality, phone, license number
  
- **`vehicles`** (lines 158-236) - Vehicle inventory with:
  - Registration, VIN, make/model/year/color
  - RTA compliance: TC number, chassis/engine numbers, licensing authority, insurance/registration expiry
  - Tank capacity for fuel charge calculation
  - Status: available, rented, maintenance, damaged
  - Soft-delete architecture

- **`sponsors`** (lines 239-287) - Individual sponsors for contracts
  - Passport ID, license number, relationship to hirer
  
- **`companies`** (lines 290-347) - Corporate sponsors
  - TAX ID, registration number, contact person
  - Mandatory: TAX ID, contact person, phone, email

#### **Contract Management**
- **`contracts`** (lines 392-595) - Core rental agreements with:
  - **4-state lifecycle**: `draft` → `active` → `completed` → `closed`
  - Sequential numbering (starts at 15500)
  - Three hirer types: `direct`, `with_sponsor`, `from_company`
  - Foreign keys to customers, vehicles, sponsors, companies (master data pattern)
  - Legacy inline sponsor/company fields for backward compatibility
  - Financial breakdown: subtotal, VAT, total, security deposit, extra charges
  - Delivery service: drop-off/pick-up with bilingual addresses
  - State transition tracking: `activatedBy/At`, `completedBy/At`, `closedBy/At`
  - **Security fields**: 
    - `editReason` - Mandatory 10+ word reason for edits to active/completed contracts
    - `closureRemark` - Admin override for closing with outstanding balance
  - Validation: rental start date cannot be in the past (lines 575-590)

- **`contractCounter`** (lines 835-840) - Singleton table for auto-incrementing contract numbers (starts at 15499)

#### **Financial Tracking**
- **`payments`** (lines 611-698) - Payment records with:
  - Conditional validation based on method:
    - Cheque: requires `chequeNumber`
    - Card: requires `last4Digits` (exactly 4 digits)
    - Other methods: requires `referenceNumber`
  - Linked to contract via `contractId`

#### **Vehicle Inspection**
- **`vehicleInspections`** (lines 701-770) - Two-stage inspection system:
  - Types: `pre_delivery` (gates contract activation), `post_return` (gates completion)
  - **6 mandatory photo angles** + unlimited optional extras (lines 748-766):
    - Required: front, back, left, right, top, dashboard
    - Optional: extra photos with descriptions (e.g., damage documentation)
  - Photos stored as JSONB array `[{angle, data, description?}]`
  - Validation ensures all 6 mandatory angles present and unique
  - Odometer reading, fuel level (0-100%), condition notes

#### **Audit & Compliance**
- **`auditLogs`** (lines 773-800) - System-wide audit trail:
  - Actions: create, edit, finalize, print, delete, login, logout
  - IP address, user agent, session ID, geolocation (country/city/region)
  - Links to contracts when applicable

- **`contractEdits`** (lines 803-832) - Field-level change tracking:
  - Before/after snapshots (`fieldsBefore`, `fieldsAfter` as JSONB)
  - Mandatory `editReason` for Active/Completed contract modifications
  - IP address tracking

- **`systemErrors`** (lines 843-863) - Error logging with:
  - Automatic screenshot capture (Base64 in `screenshot` field)
  - Full stack trace, endpoint, HTTP method
  - Acknowledgement workflow: `acknowledged`, `acknowledgedBy`, `sentToSupport`

#### **Company Configuration**
- **`companySettings`** (lines 866-995) - Singleton configuration table:
  - Bilingual company info (name, tagline, address, phones)
  - Currency and VAT percentage
  - **Financial defaults**: daily/weekly/monthly rates, insurance/GPS/baby seat fees, extra km rate, security deposit
  - **Fuel pricing**: petrol/diesel per liter
  - **Delivery charges**: drop-off and pick-up
  - **Terms & Conditions**: 3 bilingual sections plus 13 payment/fine/accident clauses

#### **Phase 2: Insurance Claims**
- **`insuranceClaims`** (lines 998-1078) - Insurance claim tracking:
  - Auto-generated claim numbers: `CLM-YYYY-NNNN`
  - Status workflow: pending, approved, rejected, settled
  - Financial: `claimAmount`, `approvedAmount`, `settledAmount`
  - Links to contract, handled by staff user

#### **Phase 3 PREP: Mobile Backend Infrastructure**
- **`renewalRequests`** (lines 1081-1144) - Contract renewal requests
- **`documentApprovals`** (lines 1147-1200) - Customer document submissions (license, ID, insurance)
- **`supportTickets`** (lines 1203-1263) - Customer/staff support system with auto-generated ticket numbers `TKT-YYYY-NNNN`
- **`pushNotificationTokens`** (lines 1266-1310) - FCM/APNS tokens for mobile push notifications

#### **Additional Support Table**
- **`damageAssessments`** - Vehicle damage documentation and assessment tracking (linked to contracts)

---

## 3. BACKEND API (server/routes.ts - 5,050 lines, 143 endpoints)

### **Authentication Endpoints**
```typescript
GET  /api/auth/user                 // Get current user (line 125)
POST /api/auth/login                // Username/password login (setupAuth in localAuth.ts)
POST /api/auth/logout               // End session
GET  /api/system/health             // System health check (line 140)
```

### **Customer Endpoints**
```typescript
GET    /api/customers               // List customers (line 297, filters: disabled, search)
GET    /api/customers/search        // Search by name/phone (line 320)
GET    /api/customers/:id           // Get customer details (line 330)
POST   /api/customers               // Create customer (line 342, requireEditor)
PATCH  /api/customers/:id           // Update customer (line 361, requireEditor)
POST   /api/customers/:id/disable   // Disable customer (line 377, requireAdmin)
POST   /api/customers/:id/enable    // Re-enable customer (line 389, requireAdmin)
GET    /api/customers/check-phone/:phone  // Check phone duplicate (line 402, non-blocking)
```

### **Vehicle Endpoints**
```typescript
GET    /api/vehicles                // List vehicles (line 427, filters: disabled, search, status)
GET    /api/vehicles/search         // Search vehicles (line 450)
GET    /api/vehicles/:id            // Get vehicle details (line 460)
GET    /api/vehicles/:id/availability // Check availability for date range (line 472)
POST   /api/vehicles               // Create vehicle (line 492, requireEditor)
PATCH  /api/vehicles/:id           // Update vehicle (line 511, requireEditor)
POST   /api/vehicles/:id/disable   // Disable vehicle (line 527, requireAdmin)
POST   /api/vehicles/:id/enable    // Re-enable vehicle (line 539, requireAdmin)
```

### **Contract Lifecycle Endpoints**
```typescript
// Contract CRUD
GET    /api/contracts              // List contracts (line 762)
       // Role-based filtering: Staff see only own contracts unless canViewAllContracts
       // Filters: status, customerId, vehicleId, startDate, endDate
GET    /api/contracts/disabled     // List disabled contracts (line 788, requireAdmin)
GET    /api/contracts/:id          // Get contract with outstanding balance calculation (line 798)
       // Calculates: totalAmount + totalExtraCharges - sum(payments)
POST   /api/contracts              // Create draft contract (line 949)
       // Auto-increments contractNumber
PATCH  /api/contracts/:id          // Update contract (line 970)
       // SECURITY: Enforces edit reason validation (10+ meaningful words, 3+ chars each)
       // Validation applied to Active/Completed contracts (validateEditReason)
       // Creates contractEdit record with before/after snapshots

// State Transitions
POST   /api/contracts/:id/activate // Draft → Active (line 1088, requireEditor)
       // SECURITY: Validates vehicle availability
       // Requires pre_delivery inspection
       // Updates vehicle status to "rented"
       // Creates audit log
POST   /api/contracts/:id/complete // Active → Completed (line 1158, requireEditor)
       // Requires post_return inspection
       // Calculates extra charges (km, fuel, damage)
       // Automatically deducts security deposit from final payment
       // Updates vehicle status back to "available"
POST   /api/contracts/:id/close    // Completed → Closed (line 1349, requireContractCloseAccess)
       // SECURITY: Requires final payment OR admin override with closure remark
       // Admin closure remark requires 10+ words validation
       // Creates audit log

// Contract Metadata
GET    /api/contracts/:id/edits    // Get field-level edit history (line 838)
GET    /api/contracts/:id/audit-logs // Get lifecycle audit trail (line 862)
GET    /api/contracts/unclosed-alerts // Contracts completed 30+ days without closure (line 886)
```

### **Insurance Claims Endpoints** (Phase 2)
```typescript
GET    /api/insurance-claims       // List claims (line 3662, role-based filtering)
GET    /api/insurance-claims/:id   // Get claim details (line 3680)
POST   /api/insurance-claims       // Create claim (line 3694)
       // Auto-generates CLM-YYYY-NNNN number
PATCH  /api/insurance-claims/:id   // Update claim (line 3729)
DELETE /api/insurance-claims/:id   // Delete claim (line 3760, requireManagerOrAdmin)
```

### **Reporting & Analytics Endpoints**
```typescript
// Analytics Data
GET    /api/analytics/revenue      // Revenue analytics (line 2948, requireReportsAccess)
GET    /api/analytics/operations   // Operational metrics (line 2958, requireReportsAccess)
GET    /api/analytics/customers    // Customer analytics (line 2968, requireReportsAccess)

// Report Generation
GET    /api/reports/financial      // Financial report data (line 2979, requireReportsAccess)
GET    /api/reports/operational    // Operational report data (line 2991, requireReportsAccess)
GET    /api/reports/customers      // Customer report data (line 3003, requireReportsAccess)
GET    /api/reports/audit          // Audit report data (line 3015, requireReportsAccess)
GET    /api/reports/insurance      // Insurance report data (line 3566, requireReportsAccess)

// Export Endpoints (PDF/Excel with embedded charts)
POST   /api/reports/financial/export     // Export with chart images (line 3028)
       // Accepts chart images as base64 from html2canvas
       // 10MB request body limit for chart uploads
POST   /api/reports/operational/export   // Export with charts (line 3161)
POST   /api/reports/customers/export     // Export with charts (line 3353)
POST   /api/reports/insurance/export     // Export with charts (line 3578)
GET    /api/reports/audit/export         // Export audit CSV (line 3470)
```

### **Configuration Endpoints**
```typescript
GET    /api/settings              // Get company settings
PUT    /api/settings              // Update company settings (requireAdmin)
GET    /api/settings/financial    // Get financial settings
PUT    /api/settings/financial    // Update financial settings (requireAdmin)
```

### **Sponsor & Company Endpoints**
```typescript
GET    /api/sponsors              // List sponsors
GET    /api/sponsors/search       // Search sponsors
GET    /api/sponsors/:id          // Get sponsor details
POST   /api/sponsors              // Create sponsor (requireEditor)
PATCH  /api/sponsors/:id          // Update sponsor (requireEditor)
POST   /api/sponsors/:id/disable  // Disable sponsor (requireAdmin)
POST   /api/sponsors/:id/enable   // Enable sponsor (requireAdmin)

GET    /api/companies             // List companies
GET    /api/companies/search      // Search companies
GET    /api/companies/:id         // Get company details
POST   /api/companies             // Create company (requireEditor)
PATCH  /api/companies/:id         // Update company (requireEditor)
POST   /api/companies/:id/disable // Disable company (requireAdmin)
POST   /api/companies/:id/enable  // Enable company (requireAdmin)
```

### **Payment Endpoints**
```typescript
POST   /api/contracts/:contractId/payments // Add payment (requireManagerOrAdmin)
GET    /api/contracts/:contractId/payments // Get contract payments
DELETE /api/payments/:id                    // Delete payment (requireAdmin)
POST   /api/contracts/:id/deposit          // Record deposit payment (requireEditor)
POST   /api/contracts/:id/final-payment    // Record final payment (requireEditor)
POST   /api/contracts/:id/refund           // Record deposit refund (requireEditor)
```

### **Inspection Endpoints**
```typescript
POST   /api/contracts/:contractId/inspections // Create inspection (requireEditor)
GET    /api/contracts/:contractId/inspections // Get contract inspections
GET    /api/inspections/:id                    // Get inspection details
```

### **Renewal & Document Approval Endpoints**
```typescript
GET    /api/renewal-requests       // List renewal requests
GET    /api/renewal-requests/:id   // Get renewal request
POST   /api/renewal-requests       // Create renewal request (requireEditor)
PATCH  /api/renewal-requests/:id   // Update renewal request (requireEditor)
DELETE /api/renewal-requests/:id   // Delete renewal request (requireAdmin)
POST   /api/renewal-requests/:id/approve // Approve request (requireManagerOrAdmin)
POST   /api/renewal-requests/:id/reject  // Reject request (requireManagerOrAdmin)

GET    /api/document-approvals     // List document approvals
GET    /api/document-approvals/:id // Get document approval
POST   /api/document-approvals     // Create document approval (requireEditor)
PATCH  /api/document-approvals/:id // Update document approval (requireEditor)
DELETE /api/document-approvals/:id // Delete document approval (requireAdmin)
POST   /api/document-approvals/:id/approve // Approve document (requireManagerOrAdmin)
POST   /api/document-approvals/:id/reject  // Reject document (requireManagerOrAdmin)
```

### **Support Ticket Endpoints**
```typescript
GET    /api/support-tickets        // List support tickets
GET    /api/support-tickets/:id    // Get support ticket
POST   /api/support-tickets        // Create support ticket (requireEditor)
PATCH  /api/support-tickets/:id    // Update support ticket (requireEditor)
DELETE /api/support-tickets/:id    // Delete support ticket (requireAdmin)
POST   /api/support-tickets/:id/assign  // Assign ticket (requireManagerOrAdmin)
POST   /api/support-tickets/:id/resolve // Resolve ticket (requireEditor)
```

### **User Management Endpoints**
```typescript
GET    /api/users                  // List users (requireAdmin)
GET    /api/users/:id              // Get user details
PATCH  /api/users/:id/role         // Update user role (requireAdmin)
POST   /api/users                  // Create user (requireAdmin)
PATCH  /api/users/:id              // Update user (requireAdmin)
POST   /api/users/:id/disable      // Disable user (requireAdmin)
POST   /api/users/:id/enable       // Enable user (requireAdmin)
GET    /api/users/disabled         // List disabled users (requireAdmin)
POST   /api/users/change-password  // Change own password (isAuthenticated)
```

### **Audit & Error Management Endpoints**
```typescript
GET    /api/audit-logs             // Get all audit logs (requireManagerOrAdmin)
GET    /api/audit-logs/recent      // Get 10 most recent audit logs

GET    /api/system-errors          // Get all system errors (requireAdmin)
GET    /api/system-errors/unacknowledged // Get unacknowledged errors (requireAdmin)
POST   /api/system-errors/:id/acknowledge // Acknowledge error (requireAdmin)
POST   /api/system-errors/:id/mark-sent   // Mark error sent to support (requireAdmin)
POST   /api/system-errors/log             // Log client-side error
```

### **Push Notification Endpoints**
```typescript
GET    /api/push-tokens            // Get push tokens (with filters)
GET    /api/push-tokens/:id        // Get push token
POST   /api/push-tokens            // Register push token
PATCH  /api/push-tokens/:id        // Update push token
DELETE /api/push-tokens/:id        // Delete push token
POST   /api/push-tokens/:id/activate   // Activate push token
POST   /api/push-tokens/:id/deactivate // Deactivate push token
```

### **Mobile Backend Endpoints** (Phase 3 PREP - ALL BLOCKED)
**SECURITY: All 13 customer endpoints protected by `requireCustomerAuth` middleware (line 94-106)**
**Returns 501 Not Implemented until customer authentication system is deployed**

```typescript
// Customer Mobile APIs (BLOCKED)
GET    /api/mobile/customer/profile            // (line 3810, BLOCKED)
GET    /api/mobile/customer/contracts          // (line 3867, BLOCKED)
GET    /api/mobile/customer/contracts/:id      // (line 3945, BLOCKED)
GET    /api/mobile/customer/payments           // (line 3995, BLOCKED)
POST   /api/mobile/customer/renewal-request    // (line 4068, BLOCKED)
GET    /api/mobile/customer/documents          // (line 4123, BLOCKED)
POST   /api/mobile/customer/documents          // (line 4157, BLOCKED)
GET    /api/mobile/customer/support-tickets    // (line 4204, BLOCKED)
POST   /api/mobile/customer/support-tickets    // (line 4238, BLOCKED)
POST   /api/mobile/customer/report-accident    // (line 4295, BLOCKED)
PATCH  /api/mobile/customer/profile            // (line 4437, BLOCKED)
POST   /api/mobile/customer/change-password    // (line 4495, BLOCKED)
POST   /api/mobile/customer/push-token         // (line 4523, BLOCKED)

// Staff Mobile APIs (16 endpoints, ACTIVE)
GET    /api/mobile/staff/dashboard         // Staff dashboard summary (requireEditor)
GET    /api/mobile/staff/tasks             // Staff task list (requireEditor)
POST   /api/mobile/staff/quick-inspection  // Quick vehicle inspection (requireEditor)
GET    /api/mobile/staff/contracts         // Staff contracts list (requireEditor)
GET    /api/mobile/staff/contracts/:id     // Staff contract details (requireEditor)
POST   /api/mobile/staff/contract/:id/activate   // Activate contract (requireEditor)
POST   /api/mobile/staff/contract/:id/complete   // Complete contract (requireEditor)
GET    /api/mobile/staff/vehicles          // Staff vehicles list (requireEditor)
GET    /api/mobile/staff/vehicles/:id      // Staff vehicle details (requireEditor)
GET    /api/mobile/staff/customers         // Staff customers list (requireEditor)
GET    /api/mobile/staff/customers/:id     // Staff customer details (requireEditor)
GET    /api/mobile/staff/notifications     // Staff notifications (requireEditor)
POST   /api/mobile/staff/notifications/:id/mark-read // Mark notification read (requireEditor)
GET    /api/mobile/staff/profile           // Staff profile (requireEditor)
PATCH  /api/mobile/staff/profile           // Update staff profile (requireEditor)
POST   /api/mobile/staff/push-token        // Register staff push token (requireEditor)
```

### **Security Hardening Implementations**
```typescript
// SECURITY FIX 1: Edit Reason Validation (server/utils/validation.ts)
function validateEditReason(reason: string): { valid: boolean; error?: string }
  // Enforces 10+ meaningful words (3+ chars each)
  // Bypass-proof server-side enforcement
  // Applied to ALL Active/Completed contract mutations

// SECURITY FIX 2: Financial Input Validation (line 84-90)
function validateFinancialInput(value: any, fieldName: string): number
  // Number.isFinite() guards prevent NaN database corruption
  // Applied to all monetary inputs

// SECURITY FIX 3: Mobile Customer Auth Blocking (line 94-106)
const requireCustomerAuth = (req, res, next) => {
  // Returns 501 Not Implemented
  // Prevents horizontal privilege escalation
  // All 13 customer endpoints blocked until customer auth deployed
}
```

---

## 4. FRONTEND UI SCREENS (client/src/pages/ - 31 pages)

### **Authentication**
- **Login.tsx** - Username/password authentication, language/theme toggles

### **Dashboard** (Dashboard.tsx)
- Time-based greeting (good morning/afternoon/evening)
- Role badge display
- Last login timestamp
- **7 metric cards** with deep-link filtering
- Quick actions: New contract, New customer, New vehicle
- Recent contracts table

### **Master Data Management**

#### **Customers.tsx, Vehicles.tsx, Sponsors.tsx, Companies.tsx**
- CRUD operations with role-based permissions
- Search and filtering capabilities
- Soft-delete architecture

### **Contract Management**

#### **Contracts.tsx**
- Advanced filtering by status, customer, vehicle, date range
- Role-based visibility (Staff see only own contracts)
- Outstanding balance display

#### **ContractForm.tsx** - Multi-step creation/editing
- 6 steps: Customer Selection → Vehicle Selection → Rental Details → Pricing → Vehicle Inspection → Terms

#### **ContractView.tsx** - 5-tab details page
- Details, Timeline, Payments, Inspections, Insurance Claims tabs
- Contextual actions based on contract status

### **Insurance Management** (Phase 2)

#### **InsuranceClaims.tsx, InsuranceClaimForm.tsx**
- Complete CRUD system with auto-generated claim numbers
- Status workflow management
- Only visible to Managers and Admins

### **Reporting & Analytics**

#### **FinancialReports.tsx, OperationalReports.tsx, CustomerReports.tsx, InsuranceReports.tsx**
- Analytics with recharts visualization
- Filterable data tables
- Export to PDF/Excel with embedded charts (html2canvas → base64 → backend → PDF/Excel)

#### **AuditReports.tsx, UserActivity.tsx**
- Comprehensive audit trail viewer
- User activity tracking

#### **UnclosedContractsReport.tsx** (Phase 2)
- Lists contracts completed 30+ days without closure
- Statistics and export capabilities

### **Settings & Configuration**

#### **Settings.tsx** - User profile
#### **CompanySettings.tsx** - Bilingual company info (Admin only)
#### **FinancialSettings.tsx** - Rates and pricing (Admin only)
#### **TermsConditions.tsx** - Contract clauses (Admin only)
#### **SupportHelpPage.tsx** - Dynamic system health, documentation, FAQ, error reporting

### **Legal Compliance**

#### **PrivacyPolicyPage.tsx, TermsOfServicePage.tsx**
- Professional legal pages

### **Administration**

#### **Users.tsx** - User management with role assignment (Admin only)
#### **AuditLogs.tsx** - System-wide audit trail
#### **SystemErrors.tsx** - Error log viewer with screenshots (Admin only)

### **Additional Pages**

#### **AboutPage.tsx** - Application information and version details
#### **Landing.tsx** - Initial landing page (pre-authentication)
#### **not-found.tsx** - 404 error page for undefined routes

---

## 5. OVERALL ARCHITECTURE SUMMARY

### **Frontend (React + TypeScript)**
- **Routing**: Wouter (client-side routing)
- **State Management**: TanStack Query v5 (server state), React Context (theme, language, auth)
- **Form Handling**: React Hook Form + Zod validation, shadcn/ui form components
- **UI Library**: Radix UI primitives + shadcn/ui components + Tailwind CSS
- **Design System**: Material Design 3 (cyan-blue primary), dual theme (light/dark)
- **Internationalization**: i18next (English/Arabic with RTL/LTR layout switching)
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF + jspdf-autotable
- **Excel Export**: xlsx library
- **Image Handling**: html2canvas for screenshot capture and chart embedding
- **Performance**: Route-based lazy loading, React.Suspense for code splitting

### **Backend (Node.js + TypeScript + Express)**
- **Authentication**: Passport.js with local strategy (username/password)
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend
- **Security**:
  - Bulletproof edit reason validation (10+ meaningful words, 3+ chars each)
  - Financial NaN guards (Number.isFinite() validation)
  - Mobile customer endpoints blocked (501) pending customer auth
  - CSRF protection, httpOnly/secure cookies
  - Role-based middleware
- **Audit**: Dual-layer audit trail (system-wide auditLogs + field-level contractEdits)
- **Error Handling**: Centralized error logging to database with automatic screenshot capture

### **Database (PostgreSQL via Neon)**
- **20 tables** with strict schema validation (sessions, users, customers, vehicles, sponsors, companies, contracts, contractCounter, payments, vehicleInspections, auditLogs, contractEdits, systemErrors, companySettings, insuranceClaims, renewalRequests, documentApprovals, supportTickets, pushNotificationTokens, damageAssessments)
- **Soft-delete architecture**: disabled flags instead of DELETE operations
- **Auto-incrementing counters**: contractNumber, claimNumber, ticketNumber
- **JSONB storage**: Photos, field snapshots, settings
- **Foreign key relationships**: Enforced referential integrity
- **Master data pattern**: Separate tables for customers, vehicles, sponsors, companies

### **External Services**
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Inter (sans-serif), Cairo (Arabic), JetBrains Mono (monospace)
- **Material Icons**: Icon library

### **Key Design Patterns**
- **Master Data**: Reusable customer/vehicle/sponsor/company records
- **Singleton**: Company settings, contract counter
- **Soft Delete**: disabled/disabledBy/disabledAt pattern
- **Audit Trail**: Before/after snapshots for contract edits
- **State Machine**: 4-state contract lifecycle (draft → active → completed → closed)
- **Role-Based Access Control**: Middleware + frontend hooks for conditional rendering
- **Bilingual Data**: Separate columns for English/Arabic (nameEn, nameAr, etc.)

### **Security Hardening (Critical Fixes)**
1. **Edit Reason Validation**: Bypass-proof server-side enforcement (10+ meaningful words, 3-4 chars each) on ALL contract mutations to Active/Completed contracts
2. **Financial NaN Guards**: Number.isFinite() validation prevents database corruption on all monetary inputs
3. **Mobile Customer API Blocking**: requireCustomerAuth middleware returns 501 for all 13 customer endpoints pending customer authentication system (prevents horizontal privilege escalation)
4. **Transaction Safety**: Accident reporting wrapped with manual rollback for claim/ticket creation failures
5. **Comprehensive Audit Logging**: All mutations tracked with IP, geolocation, before/after snapshots

### **Production Readiness Status**
✅ **PRODUCTION-READY** with the following notes:
- Mobile customer endpoints intentionally disabled (501) pending customer authentication implementation
- Backend infrastructure prepared for future Staff and Customer mobile apps
- All critical security vulnerabilities addressed and verified by architect

---

## 6. RECENT UPDATES (November 15, 2025)

### **Insurance Reports Feature** (Phase 2 Enhancement)
- **InsuranceReports.tsx** - Comprehensive insurance claims analytics page with:
  - 3 tabs: Overview, Analysis, Recent Claims
  - Summary statistics cards (total claims, pending, settled amounts)
  - Interactive charts (claims by status, monthly trend, claims by insurer)
  - Filterable data tables
  - Export to PDF/Excel with embedded chart visualizations
- **Backend**: GET `/api/reports/insurance` and POST `/api/reports/insurance/export` endpoints
- **Storage**: `getInsuranceReport()` method with date range filtering
- **Navigation**: Added to Reports submenu in AppSidebar (visible to users with canAccessReports permission)
- **Route Protection**: Integrated with ProtectedRoute wrapper in App.tsx

---

This application represents a comprehensive, enterprise-grade rental car management system with extensive RTA compliance, robust security controls, and a complete audit trail suitable for production deployment in the UAE rental car industry.
