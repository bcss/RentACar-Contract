# Rental Car Contract Management System

## Overview

This is a bilingual (English/Arabic) rental car contract management system built with React, Express, and PostgreSQL. The application enables users to create, manage, and finalize rental contracts with role-based access control. Once finalized, contracts become immutable to ensure data integrity and compliance. The system includes comprehensive audit logging and supports Material Design principles with RTL/LTR layouts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **Forms:** React Hook Form with Zod validation
- **UI Components:** Radix UI primitives with shadcn/ui components
- **Styling:** Tailwind CSS with custom CSS variables for theming
- **Build Tool:** Vite

**Design System:**
- Material Design-inspired component library
- Dual theme support (light/dark mode) with CSS custom properties
- Bilingual support with i18next for internationalization
- RTL/LTR layout switching for Arabic/English
- Font families: Inter (Latin), Cairo (Arabic), JetBrains Mono (monospace)
- Comprehensive color palette with semantic colors for contract statuses

**Key Features:**
- Context-based theme and language management
- Custom hooks for authentication and authorization
- Form validation using Zod schemas shared with backend
- Responsive layouts with mobile support
- Print functionality with audit logging and bilingual support
- Contract lifecycle management (draft → finalized with immutability)

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Authentication:** Internal username/password authentication with Passport.js (passport-local strategy)
- **Session Management:** express-session with PostgreSQL store (connect-pg-simple)

**API Design:**
- RESTful endpoints under `/api` prefix
- Role-based middleware (isAuthenticated, requireAdmin, requireManagerOrAdmin)
- Centralized error handling
- Audit logging for all contract operations
- Request/response logging for debugging

**Key Architectural Decisions:**
- Middleware-based authentication flow with Passport.js local strategy
- Password security using bcrypt with 12+ rounds of hashing
- Storage abstraction layer (IStorage interface) for database operations
- Shared schema validation between client and server using Zod
- Atomic contract number generation using database counter

### Data Storage

**Database:** PostgreSQL (via Neon serverless)

**Schema Design:**

1. **Sessions Table** - Required for session persistence
2. **Users Table** - Stores user credentials (username, passwordHash) and profiles with role-based access (admin, manager, staff, viewer)
3. **Contracts Table** - Core entity with bilingual fields, status tracking (draft/finalized), and comprehensive rental details
4. **Audit Logs Table** - Immutable activity log for compliance and tracking
5. **Contract Counter Table** - Ensures unique, sequential contract numbers
6. **System Errors Table** - Tracks system-level errors with acknowledgment workflow
7. **Company Settings Table** - Singleton table storing configurable company information displayed on contracts (bilingual)

**Key Design Decisions:**
- Draft vs. finalized status with immutability enforcement at application level
- Bilingual field storage (separate columns for English/Arabic content)
- Auto-incrementing contract numbers independent of primary keys
- Comprehensive audit trail including user ID, action type, IP address, and details
- Singleton pattern for global settings (company info, contract counter)

### Authentication & Authorization

**Authentication System:**
- **Type:** Internal username/password authentication (no external OAuth)
- **Strategy:** Passport.js with passport-local strategy
- **Password Security:** bcrypt hashing with 12+ rounds
- **Session Storage:** PostgreSQL-backed sessions via connect-pg-simple
- **Cookie Configuration:** httpOnly, secure, 1-week TTL
- **Super Admin:** Immutable admin account created at startup (username: "superadmin", default password: "Admin@123456")

**Authentication Flow:**
1. User submits username/password via POST /api/login
2. Passport verifies credentials against hashed passwords in database
3. Session created and stored in PostgreSQL
4. Session cookie set with httpOnly and secure flags
5. Subsequent requests authenticated via session middleware

**Authorization Model:**
- **Admin:** Full access including user management, contract finalization, audit logs
- **Manager:** Contract management and audit log viewing
- **Staff:** Contract creation and editing (own drafts)
- **Viewer:** Read-only access to contracts

**Security Measures:**
- Role-based middleware guards on routes
- Client-side role checking for UI rendering
- Session secret management via environment variables
- CSRF protection through session middleware
- Full proxy trust configuration for Replit environment (trust proxy: true)

**Recent Changes (October 2025):**

**Phase 1-3: Comprehensive Rental Lifecycle Management (Latest - October 18, 2025):**

**Phase 1: Auto-Calculations & Validations**
- **Auto-Calculate Total Days:** Real-time calculation from rentalStartDate to rentalEndDate (minimum 1 day)
- **Auto-Calculate Financial Amounts:**
  - Subtotal based on rentalType (daily/weekly/monthly) × totalDays
  - VAT amount fetched from company settings (default 5%)
  - Total amount = subtotal + VAT
- **Enhanced Form Validations:**
  - End date must be after start date
  - License must be valid during entire rental period
  - License number optional for 'from_company' hirer type
- **Staff Permission Filtering:** Staff users can only view and edit their own contracts (filtered by createdBy)

**Phase 2: Extended Contract Lifecycle & Workflows**
- **Expanded Status Values:** draft → confirmed → active → completed → closed (5 states)
- **State Transition Endpoints:**
  - POST /api/contracts/:id/confirm - Confirm contract
  - POST /api/contracts/:id/activate - Hand over vehicle
  - POST /api/contracts/:id/complete - Complete rental with return data
  - POST /api/contracts/:id/close - Close contract after final payment
- **Vehicle Return Workflow:**
  - Complete return inspection dialog capturing:
    - Odometer end reading
    - Fuel level at return
    - Vehicle condition notes
  - Auto-calculated extra charges:
    - Extra KM Charge: (actual km - allowed km) × rate
    - Fuel charge (manual entry)
    - Damage charge (manual entry)
    - Other charges (manual entry)
    - Total extra charges = sum of all
    - Outstanding balance = total + extras - deposit
- **Payment Recording System:**
  - Record deposit payment with method (cash/card/bank_transfer)
  - Record final payment with method
  - Record deposit refund
  - Track payment status: pending → partial → paid → refunded
- **Enhanced ContractView:**
  - State transition buttons based on current status (Admin/Manager only)
  - Payment recording dialogs for deposit, final payment, refund
  - Payment status display showing dates and methods
  - Extra charges breakdown for completed/closed contracts

**Phase 3: Dashboard Enhancements**
- **Critical Metrics Cards:**
  - Active Rentals: Count of contracts currently in 'active' status
  - Monthly Revenue: Total revenue from active/completed/closed contracts this month
  - Overdue Returns: Active contracts past rental end date (highlighted in red)
  - Pending Refunds: Closed contracts with deposit not refunded
- **Status Breakdown:** Quick view of contracts by status (draft, confirmed, active, completed, closed)
- **Visual Indicators:** Color-coded alerts for overdue returns and pending refunds

**Database Schema Enhancements:**
- Added 30+ fields to contracts table:
  - State transition tracking: confirmedBy, confirmedAt, activatedBy, activatedAt, completedBy, completedAt, closedBy, closedAt
  - Payment tracking: depositPaid, depositPaidDate, depositPaidMethod, finalPaymentReceived, finalPaymentDate, finalPaymentMethod, depositRefunded, depositRefundedDate, paymentStatus
  - Extra charges: extraKmCharge, extraKmDriven, fuelCharge, damageCharge, otherCharges, totalExtraCharges, outstandingBalance
  - Auto-calculated: subtotal, vatAmount, totalDays

**Authorization Updates:**
- Staff users: Can only view/edit their own contracts
- Admin/Manager users: Can confirm, activate, complete, and close contracts
- Admin/Manager users: Can record all payments

**Company Settings Management:**
- **Settings Page:** Admin-only page for managing company information displayed on contracts
- **Database Schema:** Added companySettings table (singleton pattern) with 14 bilingual fields
- **Configurable Fields:**
  - Company names (English/Arabic)
  - Legal names (English/Arabic)
  - Tagline (English)
  - Contact: phone, mobile (English/Arabic numbers)
  - Email and website
  - Address (English/Arabic)
  - Logo URL (optional)
- **Dynamic Contract Printing:** ContractView now fetches company settings and displays them in printable header
- **API Endpoints:** GET /api/settings (all authenticated users), PUT /api/settings (admin-only)
- **Audit Logging:** All settings changes tracked in audit logs
- **Translations:** Full English/Arabic support for all settings labels and messages
- **Navigation:** Added Settings menu item to sidebar (visible only to admins)

**UI/UX Enhancements - Integrated Views & Navigation:**
- **Dashboard Navigation:** Added Dashboard as primary menu item in sidebar
- **Consolidated User Controls:** Moved user profile and logout to sidebar footer dropdown with password change option
- **Tabbed Views:** Integrated disabled users and disabled contracts into main pages using tabs (Active/Disabled) instead of separate pages
- **Enhanced Filtering:** Implemented comprehensive filter systems for:
  - Audit Logs: Filter by action type, user, and date range
  - System Errors: Filter by error type, endpoint, and date range
- **Error Acknowledgment System:** 
  - Added acknowledgment workflow for system errors (admin-only)
  - Database fields: acknowledged, acknowledgedBy, acknowledgedAt
  - Acknowledge individual errors in System Errors tab
  - Dashboard displays unacknowledged errors with "Acknowledge All" functionality
  - Links from dashboard to System Errors tab via query parameter
- **Complete Translations:** All new features fully translated in English and Arabic including filters, acknowledgment dialogs, dashboard elements, and navigation

**Disable-Only Architecture Implementation:**
- **Strict No-Deletion Policy:** Replaced all delete operations with disable/enable functionality for both users and contracts
- **Database Schema Updates:** Added `disabled`, `disabledBy`, and `disabledAt` fields to users and contracts tables
- **System Error Logging:** Implemented SystemErrors table for tracking system-level errors with errorType, errorMessage, endpoint, and stack trace
- **Admin-Only Operations:** Disable/enable buttons are restricted to admin users only
- **Enhanced Audit Logs:** Added tabbed interface with "Audit Trail" for user actions and "System Errors" for system-level error tracking
- **Cache Invalidation:** Implemented proper query cache invalidation to ensure both active and disabled lists update immediately after disable/enable operations

**Authentication System Overhaul:**
- **Replaced OAuth with Internal Authentication:** Completely removed Replit OAuth, implemented username/password authentication using Passport.js with bcrypt password hashing
- **Super Admin Account:** Created immutable super admin (username: "superadmin", default password: "Admin@123456") that cannot be deleted or disabled
- **User Management UI:** Built comprehensive admin interface for creating, editing, and disabling users with role assignment
- **Password Management:** Implemented secure password hashing, validation, and optional password changes during user edits
- **Database Schema Updates:** Added username, passwordHash, isImmutable, and lastPasswordChange fields to users table
- **Login Form:** Replaced OAuth button with username/password login form supporting both English and Arabic

**Previous Fixes:**
- Fixed Google login infinite loop by configuring Express to trust full Replit proxy chain (trust proxy: true)
- Fixed application loading state bug in useAuth hook to handle 401 responses gracefully
- Fixed date handling in contract forms to prevent "Invalid time value" errors
- Corrected CSS @page rule placement for proper 1cm print margins

### External Dependencies

**Third-Party Services:**
- **Neon Database:** Serverless PostgreSQL hosting
- **Google Fonts:** Inter, Cairo, and JetBrains Mono font families
- **Material Icons:** Icon library for UI elements

**Key NPM Packages:**
- **Database:** @neondatabase/serverless, drizzle-orm, drizzle-kit
- **Authentication:** passport, passport-local, bcrypt, express-session, connect-pg-simple
- **UI Components:** @radix-ui/* family, @tanstack/react-query
- **Form Handling:** react-hook-form, @hookform/resolvers, zod
- **Internationalization:** i18next, react-i18next
- **Styling:** tailwindcss, class-variance-authority, clsx

**Development Tools:**
- TypeScript for type safety across full stack
- Vite for fast development builds and HMR
- ESBuild for production server bundling
- Replit-specific plugins for development experience