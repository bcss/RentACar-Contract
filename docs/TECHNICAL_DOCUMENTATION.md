# RCCMS Technical Documentation

**Last Updated:** November 18, 2025  
**Version:** 3.0 - Communications Platform Complete  
**Target Audience:** Developers, Technical Architects, DevOps Engineers

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Security](#authentication--security)
6. [Core Modules](#core-modules)
7. [Integration Points](#integration-points)
8. [Development Guidelines](#development-guidelines)

---

## System Architecture

### High-Level Overview

RCCMS follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Wouter
│   (Client SPA)  │  TanStack Query + Radix UI
└────────┬────────┘
         │ REST API
┌────────┴────────┐
│   Backend       │  Node.js + Express.js
│   (API Server)  │  Passport.js Auth
└────────┬────────┘
         │ Drizzle ORM
┌────────┴────────┐
│   Database      │  PostgreSQL (Neon)
│   (Data Layer)  │  Serverless
└─────────────────┘
```

### Architecture Principles

1. **Frontend-Heavy Logic** - Business logic in React where possible
2. **Thin Backend Layer** - API routes for data persistence only
3. **Type Safety** - Shared schemas between frontend/backend
4. **Bilingual by Design** - English/Arabic throughout stack
5. **Material Design 3** - Consistent UI/UX patterns
6. **Role-Based Access** - Fine-grained permissions
7. **Audit Everything** - Dual audit trails (field-level + lifecycle)

### Project Structure

```
rccms/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   └── AppSidebar.tsx # Navigation
│   │   ├── pages/            # Route components
│   │   │   ├── dashboard/    # Dashboard tabs
│   │   │   ├── Contracts.tsx
│   │   │   ├── Drivers.tsx
│   │   │   └── ...
│   │   ├── lib/              # Utilities and clients
│   │   │   ├── queryClient.ts
│   │   │   └── currency.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── i18n/             # Internationalization
│   │   │   ├── en.json
│   │   │   └── ar.json
│   │   └── App.tsx           # Root component
│   └── index.html
├── server/                    # Backend Node.js application
│   ├── index.ts              # Entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Database operations (IStorage)
│   ├── middleware.ts         # Auth and security middleware
│   ├── pdf-contract.ts       # PDF generation
│   └── vite.ts               # Vite dev server integration
├── shared/                    # Shared code between client/server
│   └── schema.ts             # Drizzle database schema + Zod validators
├── db/                        # Database migrations
├── docs/                      # Documentation
└── package.json
```

---

## Technology Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.x | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Routing** | Wouter | 3.x | Client-side routing |
| **State Management** | TanStack Query | 5.x | Server state management |
| **Forms** | React Hook Form | 7.x | Form handling |
| **Validation** | Zod | 3.x | Schema validation |
| **UI Components** | Radix UI | Latest | Accessible primitives |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Design System** | shadcn/ui | Latest | Component library |
| **Icons** | Lucide React | Latest | Icon library |
| **Charts** | Recharts | 2.x | Data visualization |
| **i18n** | i18next | 23.x | Internationalization |
| **Date Handling** | date-fns | 3.x | Date utilities |
| **PDF Generation** | jsPDF | 2.x | Client-side PDF |
| **Excel Export** | xlsx | 0.18.x | Excel generation |

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | Server runtime |
| **Language** | TypeScript | 5.x | Type safety |
| **Framework** | Express.js | 4.x | HTTP server |
| **ORM** | Drizzle ORM | Latest | Database toolkit |
| **Database** | PostgreSQL | 15.x | Primary database |
| **Database Host** | Neon | Latest | Serverless Postgres |
| **Authentication** | Passport.js | 0.7.x | Auth middleware |
| **Sessions** | express-session | 1.x | Session management |
| **Session Store** | connect-pg-simple | 9.x | PostgreSQL sessions |
| **Password Hashing** | bcrypt | 5.x | Password security |
| **Security** | Helmet.js | 7.x | Security headers |
| **Rate Limiting** | express-rate-limit | 7.x | API rate limiting |
| **PDF Generation** | jsPDF | 2.x | Server-side PDF |

### Development Tools

- **Build Tool:** Vite 5.x
- **Package Manager:** npm
- **Code Quality:** ESLint, TypeScript compiler
- **Version Control:** Git

---

## Database Schema

### Core Entities

#### 1. Users Table
```typescript
users {
  id: serial PRIMARY KEY
  username: varchar(100) UNIQUE NOT NULL
  password: varchar(255) NOT NULL
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  role: enum ['superadmin', 'admin', 'manager', 'staff', 'viewer']
  email: varchar(255) UNIQUE NOT NULL
  branchId: integer (FK to branches.id, nullable)
  canAccessReports: boolean DEFAULT false
  isActive: boolean DEFAULT true
  lastLogin: timestamp
  passwordChangedAt: timestamp
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 2. Customers Table
```typescript
customers {
  id: serial PRIMARY KEY
  customerNumber: varchar(50) UNIQUE NOT NULL
  hirerType: enum ['direct', 'with_sponsor', 'from_company']
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  mobile: varchar(20) NOT NULL
  email: varchar(255)
  nationality: varchar(100) NOT NULL
  passportNumber: varchar(100)
  emiratesId: varchar(100)
  licenseNumber: varchar(100) NOT NULL
  licenseExpiry: date NOT NULL
  sponsorNameEn: varchar(255)
  sponsorNameAr: varchar(255)
  sponsorMobile: varchar(20)
  companyNameEn: varchar(255)
  companyNameAr: varchar(255)
  companyAddress: text
  companyTRN: varchar(100)
  notes: text
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 3. Vehicles Table
```typescript
vehicles {
  id: serial PRIMARY KEY
  plateNumber: varchar(50) UNIQUE NOT NULL
  brandEn: varchar(100) NOT NULL
  brandAr: varchar(100) NOT NULL
  modelEn: varchar(100) NOT NULL
  modelAr: varchar(100) NOT NULL
  year: integer NOT NULL
  color: varchar(50) NOT NULL
  engineNumber: varchar(100)
  chassisNumber: varchar(100)
  status: enum ['available', 'rented', 'maintenance', 'inactive']
  dailyRate: decimal(10,2) NOT NULL
  weeklyRate: decimal(10,2)
  monthlyRate: decimal(10,2)
  registrationExpiry: date
  insuranceExpiry: date
  branchId: integer (FK to branches.id)
  notes: text
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 4. Contracts Table
```typescript
contracts {
  id: serial PRIMARY KEY
  contractNumber: varchar(50) UNIQUE NOT NULL
  customerId: integer NOT NULL (FK to customers.id)
  vehicleId: integer NOT NULL (FK to vehicles.id)
  branchId: integer (FK to branches.id)
  
  // Contract Lifecycle
  status: enum ['draft', 'active', 'completed', 'closed']
  startDate: date NOT NULL
  endDate: date NOT NULL
  
  // Financials
  rentalType: enum ['daily', 'weekly', 'monthly']
  rentalRate: decimal(10,2) NOT NULL
  rentalDays: integer NOT NULL
  rentalAmount: decimal(10,2) NOT NULL
  deliveryCharge: decimal(10,2) DEFAULT 0
  advanceAmount: decimal(10,2) DEFAULT 0
  fuelCharge: decimal(10,2) DEFAULT 0
  additionalCharges: decimal(10,2) DEFAULT 0
  
  // Driver Service (Option B feature)
  requiresDriver: boolean DEFAULT false
  driverServiceType: enum ['daily', 'hourly', 'flat', 'none']
  driverServiceRate: decimal(10,2)
  driverServiceQuantity: decimal(10,2)
  driverServiceCharge: decimal(10,2) DEFAULT 0
  assignedDriverId: integer (FK to drivers.id, nullable)
  
  // Totals
  subtotal: decimal(10,2) NOT NULL
  vatAmount: decimal(10,2) DEFAULT 0
  totalAmount: decimal(10,2) NOT NULL
  
  // Inspection
  startKm: integer
  endKm: integer
  fuelStart: varchar(20)
  fuelEnd: varchar(20)
  
  // Notes
  remarks: text
  createdBy: integer NOT NULL (FK to users.id)
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 5. Payments Table
```typescript
payments {
  id: serial PRIMARY KEY
  contractId: integer NOT NULL (FK to contracts.id)
  paymentNumber: varchar(50) UNIQUE NOT NULL
  paymentDate: date NOT NULL
  paymentMethod: enum ['cash', 'card', 'bank_transfer', 'cheque']
  amount: decimal(10,2) NOT NULL
  reference: varchar(255)
  receivedBy: integer NOT NULL (FK to users.id)
  notes: text
  createdAt: timestamp DEFAULT NOW()
}
```

### Driver Service Module (Option B)

#### 6. Drivers Table
```typescript
drivers {
  id: serial PRIMARY KEY
  driverCode: varchar(50) UNIQUE NOT NULL
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  mobile: varchar(20) NOT NULL
  email: varchar(255)
  nationality: varchar(100) NOT NULL
  licenseNumber: varchar(100) NOT NULL
  licenseClass: varchar(50)
  licenseExpiry: date
  languagesSpoken: text[]
  employmentType: enum ['in_house', 'outsourced']
  driverCompanyId: integer (FK to driverCompanies.id, nullable)
  costRate: decimal(10,2)
  availability: enum ['available', 'on_assignment', 'off_duty', 'on_leave']
  isActive: boolean DEFAULT true
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 7. Driver Companies Table
```typescript
driverCompanies {
  id: serial PRIMARY KEY
  companyCode: varchar(50) UNIQUE NOT NULL
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  contactPerson: varchar(255)
  mobile: varchar(20) NOT NULL
  email: varchar(255)
  address: text
  trn: varchar(100)
  contractStartDate: date
  contractEndDate: date
  isActive: boolean DEFAULT true
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 8. Driver Rate Cards Table
```typescript
driverRateCards {
  id: serial PRIMARY KEY
  driverId: integer NOT NULL (FK to drivers.id)
  periodType: enum ['hourly', 'daily', 'monthly']
  emirate: enum ['dubai', 'abu_dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq']
  rate: decimal(10,2) NOT NULL
  effectiveFrom: date NOT NULL
  effectiveTo: date
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 9. Driver Assignments Table
```typescript
driverAssignments {
  id: serial PRIMARY KEY
  contractId: integer NOT NULL (FK to contracts.id)
  driverId: integer NOT NULL (FK to drivers.id)
  startDateTime: timestamp NOT NULL
  endDateTime: timestamp NOT NULL
  pickupLocation: text
  dropoffLocation: text
  pickupEmirate: enum ['dubai', 'abu_dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq']
  isPublicHoliday: boolean DEFAULT false
  surchargeAmount: decimal(10,2) DEFAULT 0
  totalAmount: decimal(10,2) NOT NULL
  status: enum ['scheduled', 'in_progress', 'completed', 'cancelled']
  assignedBy: integer NOT NULL (FK to users.id)
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

### Branch Management (Option B)

#### 10. Branches Table
```typescript
branches {
  id: serial PRIMARY KEY
  branchCode: varchar(50) UNIQUE NOT NULL
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  city: varchar(100) NOT NULL
  address: text
  phone: varchar(20)
  email: varchar(255)
  managerName: varchar(255)
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 11. Public Holidays Table
```typescript
publicHolidays {
  id: serial PRIMARY KEY
  holidayDate: date NOT NULL
  nameEn: varchar(255) NOT NULL
  nameAr: varchar(255) NOT NULL
  emirate: enum ['dubai', 'abu_dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq', 'all']
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT NOW()
}
```

#### 12. Vehicle Transfers Table
```typescript
vehicleTransfers {
  id: serial PRIMARY KEY
  transferNumber: varchar(50) UNIQUE NOT NULL
  vehicleId: integer NOT NULL (FK to vehicles.id)
  fromBranchId: integer NOT NULL (FK to branches.id)
  toBranchId: integer NOT NULL (FK to branches.id)
  requestedBy: integer NOT NULL (FK to users.id)
  requestDate: timestamp NOT NULL
  approvedBy: integer (FK to users.id, nullable)
  approvalDate: timestamp
  completedBy: integer (FK to users.id, nullable)
  completedDate: timestamp
  status: enum ['pending', 'approved', 'rejected', 'completed']
  reason: text
  rejectionReason: text
  notes: text
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

### Audit & System Tables

#### 13. Audit Logs Table
```typescript
auditLogs {
  id: serial PRIMARY KEY
  contractId: integer (FK to contracts.id, nullable)
  action: text NOT NULL
  performedBy: integer (FK to users.id, nullable)
  performedAt: timestamp DEFAULT NOW()
  details: text
}
```

#### 14. Contract Edits Table
```typescript
contractEdits {
  id: serial PRIMARY KEY
  contractId: integer NOT NULL (FK to contracts.id)
  fieldName: varchar(100) NOT NULL
  oldValue: text
  newValue: text
  editedBy: integer NOT NULL (FK to users.id)
  editedAt: timestamp DEFAULT NOW()
  reason: text
}
```

#### 15. Insurance Claims Table
```typescript
insuranceClaims {
  id: serial PRIMARY KEY
  claimNumber: varchar(50) UNIQUE NOT NULL
  contractId: integer NOT NULL (FK to contracts.id)
  vehicleId: integer NOT NULL (FK to vehicles.id)
  incidentDate: date NOT NULL
  reportedDate: date NOT NULL
  description: text NOT NULL
  estimatedAmount: decimal(10,2)
  approvedAmount: decimal(10,2)
  status: enum ['pending', 'under_review', 'approved', 'rejected', 'settled']
  insuranceCompany: varchar(255)
  policyNumber: varchar(100)
  notes: text
  createdBy: integer NOT NULL (FK to users.id)
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
}
```

#### 16. App Access Logs Table
```typescript
appAccessLogs {
  id: serial PRIMARY KEY
  userId: integer (FK to users.id, nullable)
  username: varchar(255)
  ipAddress: varchar(50)
  userAgent: text
  location: text
  accessTime: timestamp DEFAULT NOW()
}
```

#### 17. Company Settings Table
```typescript
companySettings {
  id: serial PRIMARY KEY (singleton table, id always = 1)
  companyNameEn: varchar(255) NOT NULL
  companyNameAr: varchar(255) NOT NULL
  logoUrl: text
  vatRate: decimal(5,2) DEFAULT 5.00
  currency: varchar(10) DEFAULT 'AED'
  // ... many more financial and operational settings
  updatedAt: timestamp DEFAULT NOW()
}
```

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout  
GET    /api/auth/user           # Get current user
POST   /api/auth/change-password # Change password
```

### Master Data Endpoints

```
# Customers
GET    /api/customers           # List all customers
POST   /api/customers           # Create customer
PUT    /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Soft delete customer

# Vehicles
GET    /api/vehicles            # List all vehicles
POST   /api/vehicles            # Create vehicle
PUT    /api/vehicles/:id        # Update vehicle
DELETE /api/vehicles/:id        # Soft delete vehicle

# Drivers (Option B)
GET    /api/drivers             # List all drivers
POST   /api/drivers             # Create driver
PUT    /api/drivers/:id         # Update driver
DELETE /api/drivers/:id         # Soft delete driver

# Driver Companies (Option B)
GET    /api/driver-companies    # List all driver companies
POST   /api/driver-companies    # Create company
PUT    /api/driver-companies/:id # Update company
DELETE /api/driver-companies/:id # Soft delete company

# Branches (Option B)
GET    /api/branches            # List all branches
POST   /api/branches            # Create branch
PUT    /api/branches/:id        # Update branch
DELETE /api/branches/:id        # Soft delete branch

# Public Holidays (Option B)
GET    /api/public-holidays     # List all holidays
POST   /api/public-holidays     # Create holiday
PUT    /api/public-holidays/:id # Update holiday
DELETE /api/public-holidays/:id # Delete holiday
```

### Contract Management

```
GET    /api/contracts           # List all contracts
GET    /api/contracts/:id       # Get single contract
POST   /api/contracts           # Create contract
PUT    /api/contracts/:id       # Update contract
DELETE /api/contracts/:id       # Soft delete contract
PATCH  /api/contracts/:id/status # Update contract status
GET    /api/contracts/:id/timeline # Get contract lifecycle timeline
```

### Payments

```
GET    /api/payments            # List all payments
GET    /api/payments/contract/:contractId # Get payments for contract
POST   /api/payments            # Record payment
DELETE /api/payments/:id        # Delete payment
```

### Driver Service (Option B)

```
GET    /api/driver-rate-cards   # List all rate cards
POST   /api/driver-rate-cards   # Create rate card
PUT    /api/driver-rate-cards/:id # Update rate card
DELETE /api/driver-rate-cards/:id # Delete rate card

GET    /api/driver-assignments  # List all assignments
POST   /api/driver-assignments  # Create assignment
PUT    /api/driver-assignments/:id # Update assignment
DELETE /api/driver-assignments/:id # Delete assignment
POST   /api/driver-assignments/check-availability # Check driver conflicts
```

### Branch Operations (Option B)

```
GET    /api/vehicle-transfers   # List all transfers
POST   /api/vehicle-transfers   # Request transfer
PATCH  /api/vehicle-transfers/:id/approve # Approve transfer
PATCH  /api/vehicle-transfers/:id/reject # Reject transfer
PATCH  /api/vehicle-transfers/:id/complete # Complete transfer
```

### Reporting & Analytics

```
GET    /api/reports/revenue-trends # Revenue analytics
GET    /api/reports/fleet-performance # Fleet KPIs
GET    /api/reports/contract-analytics # Contract insights
GET    /api/reports/collection-performance # Payment collection
GET    /api/reports/driver-utilization # Driver utilization (Option B)
GET    /api/reports/driver-revenue-cost # Driver profitability (Option B)

GET    /api/analytics/fleet-status # Dashboard fleet widget
GET    /api/analytics/pending-actions # Dashboard actions widget
GET    /api/analytics/driver-availability # Dashboard driver widget (Option B)
```

### System Administration

```
GET    /api/users               # List all users
POST   /api/users               # Create user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Soft delete user

GET    /api/company-settings    # Get company settings
PUT    /api/company-settings    # Update settings

GET    /api/insurance-claims    # List all claims
POST   /api/insurance-claims    # Create claim
PUT    /api/insurance-claims/:id # Update claim

GET    /api/branding            # Get branding (public)
GET    /api/system-health       # System health check
GET    /api/access-logs         # List access logs
DELETE /api/access-logs/purge   # Purge old logs

POST   /api/import-data         # Bulk import (superadmin only)
```

### PDF Generation

```
GET    /api/contracts/:id/pdf   # Generate contract PDF
```

---

## Authentication & Security

### Authentication Flow

1. **Login:** User submits credentials to `/api/auth/login`
2. **Passport.js:** Verifies username/password against database
3. **Session Creation:** Creates encrypted session in PostgreSQL
4. **Cookie Set:** Returns httpOnly, secure session cookie
5. **Subsequent Requests:** Cookie automatically sent with requests
6. **Middleware Check:** `isAuthenticated` middleware validates session

### Session Management

- **Storage:** PostgreSQL via `connect-pg-simple`
- **Expiry:** 24 hours of inactivity
- **Security:** httpOnly, secure flags (HTTPS in production)
- **CSRF:** Protected via csurf middleware

### Role-Based Access Control

**Role Hierarchy:**
1. **Superadmin** - Full system access, user management, imports
2. **Admin** - All operations except user management
3. **Manager** - Contract CRUD, reports, payments (if enabled)
4. **Staff** - Contract creation, view only for reports
5. **Viewer** - Read-only access to allowed modules

**Permission Middleware:**
```typescript
requireRole(['admin', 'manager']) // Route-level permissions
requireReportsAccess // Reports only for role + canAccessReports flag
```

### Security Features

1. **Password Security:**
   - bcrypt hashing (10 rounds)
   - Minimum 8 characters, 1 uppercase, 1 number, 1 special char
   - Password change tracking
   - Default password enforcement

2. **Session Security:**
   - PostgreSQL-backed sessions
   - Session fixation protection
   - Automatic expiry

3. **CSRF Protection:**
   - csurf middleware on all mutating routes

4. **Rate Limiting:**
   - 100 requests per 15 minutes per IP

5. **Security Headers:**
   - Helmet.js for standard headers

6. **Audit Logging:**
   - All contract changes logged
   - All lifecycle events logged
   - IP addresses captured

---

## Core Modules

### 1. Contract Management

**4-State Lifecycle:**
- **Draft:** Initial creation, editable
- **Active:** Rental in progress, restricted edits
- **Completed:** Rental ended, vehicle returned
- **Closed:** Final state, read-only

**Business Rules:**
- Draft → Active: Requires `startKm`, `fuelStart`
- Active → Completed: Requires `endKm`, `fuelEnd`
- Completed → Closed: Requires all payments settled
- Edit validation based on current state
- Automatic vehicle status sync

### 2. Payment Tracking

**Features:**
- Multiple payments per contract
- Payment allocation to contract total
- Outstanding balance calculation
- Receipt generation
- Payment history

### 3. Driver Service Module (Option B)

**Features:**
- Driver roster management (in-house + outsourced)
- Rate cards with emirate-specific pricing
- Driver assignments with conflict detection
- Public holiday surcharge automation
- Utilization and profitability reporting
- Real-time availability tracking

**Surcharge Logic:**
```typescript
if (isPublicHoliday && emirate in holidayList) {
  surcharge = publicHolidaySurcharge;
}
```

### 4. Branch Management (Option B)

**Features:**
- Multi-branch operations
- Branch-scoped vehicles and users
- Inter-branch vehicle transfers
- Approval workflow (request → approve → complete)

### 5. Reporting & Analytics

**Report Types:**
- Revenue Trends (time-series)
- Fleet Performance (utilization, revenue per vehicle)
- Contract Analytics (status distribution, averages)
- Collection Performance (payment tracking)
- Driver Utilization (assignments, days worked)
- Driver Revenue vs. Cost (profitability analysis)

**Dashboard Widgets:**
- Fleet status pie chart
- Pending actions list
- Driver availability metrics

---

## Communications Platform (Phase 3) ✅

### Overview

RCCMS features a production-ready multi-provider communications infrastructure supporting SMS and Email notifications with intelligent routing, fallback handling, and comprehensive delivery tracking.

### Architecture

```
┌──────────────────────┐
│ Notification Service │
│  (Orchestration)     │
└──────────┬───────────┘
           │
           ├──> Priority Routing
           ├──> Provider Health Monitoring
           ├──> Fallback Handling
           └──> Delivery Logging
           │
    ┌──────┴──────┐
    │  Providers   │
    ├─────────────┤
    │ SMS:         │
    │ - Twilio     │
    │ - Mock       │
    ├─────────────┤
    │ Email:       │
    │ - SendGrid   │
    │ - Gmail SMTP │
    │ - Mock       │
    └─────────────┘
```

### Key Components

**1. NotificationService** (`server/services/notificationService.ts`)
- Template-based message rendering (English/Arabic)
- Multi-channel delivery (SMS, Email, Both)
- Provider priority and fallback routing
- Health monitoring and circuit breaking
- Comprehensive logging

**2. Communication Providers** (Database-driven)
- Dynamic provider configuration
- Health status tracking
- Priority-based routing
- Support for multiple providers per channel

**3. Communication Templates** (12 Bilingual Templates)
- Contract lifecycle events
- Payment notifications
- Document reminders
- Risk score alerts
- Approval workflows

### Automated Notification Touchpoints

**Event-Driven (8 touchpoints):**
1. Contract Activated
2. Contract Completed
3. Payment Received (Deposit)
4. Payment Received (Final)
5. Document Uploaded
6. Document Verified
7. Approval Required
8. Risk Score Elevated

**Scheduled (4 cron jobs via Automation Orchestrator):**
1. Document Expiry Reminders (8 AM daily)
2. Contract Expiry Reminders (9 AM daily)
3. Payment Due Reminders (10 AM daily)
4. Nightly Risk Score Calculation (2 AM daily)

### API Endpoints

```typescript
// Provider Management
GET    /api/communication-providers
POST   /api/communication-providers
PATCH  /api/communication-providers/:id
DELETE /api/communication-providers/:id

// Communication Logs
GET    /api/communication-logs

// Templates
GET    /api/communication-templates
POST   /api/communication-templates
PATCH  /api/communication-templates/:id

// Send Notification
POST   /api/send-notification
```

### Provider Configuration

**Twilio (SMS):**
```typescript
{
  providerType: 'twilio',
  channel: 'sms',
  config: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_PHONE_NUMBER
  }
}
```

**SendGrid (Email):**
```typescript
{
  providerType: 'sendgrid',
  channel: 'email',
  config: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME
  }
}
```

### Monitoring & Observability

- Real-time delivery status tracking
- Provider health checks
- Automatic fallback on provider failure
- Comprehensive communication logs with metadata
- Performance metrics per provider

---

## Integration Points

### 1. PDF Generation

**Library:** jsPDF + jsPDF-AutoTable  
**Format:** Bilingual (English + Arabic)  
**Sections:** Contract terms, vehicle details, driver service, financial summary

### 2. Excel Export

**Library:** xlsx  
**Features:** Multi-sheet exports, formula support

### 3. SMS/Email Notifications ✅ IMPLEMENTED

**Providers:**
- **SMS:** Twilio (primary), Mock (testing)
- **Email:** SendGrid (primary), Gmail SMTP (fallback), Mock (testing)

**Features:**
- Multi-provider routing with priority
- Health monitoring and automatic fallback
- Template-based bilingual messages
- Comprehensive delivery tracking

### 4. Future Integrations (Roadmap)

- Payment gateways (Stripe, PayTabs)
- Accounting software (Zoho Books, QuickBooks)
- Telematics platforms
- RTA/AML compliance APIs

---

## Development Guidelines

### Coding Standards

1. **TypeScript Everywhere:** No `any` types without justification
2. **Shared Schemas:** Use `shared/schema.ts` for type consistency
3. **Error Handling:** Try-catch in all async operations
4. **Validation:** Zod schemas for all inputs
5. **Comments:** JSDoc for public functions
6. **Naming:** camelCase for variables, PascalCase for components

### Database Patterns

1. **IStorage Interface:** All DB operations through storage layer
2. **Transactions:** Use for multi-table operations
3. **Soft Deletes:** `isActive = false` instead of DELETE
4. **Audit Trails:** Log all contract changes
5. **Foreign Keys:** Always enforce referential integrity

### Frontend Patterns

1. **TanStack Query:** All server state via `useQuery`/`useMutation`
2. **Form Handling:** React Hook Form + Zod resolver
3. **Routing:** Wouter for client-side navigation
4. **Components:** Functional components with hooks
5. **Styling:** Tailwind CSS utility classes
6. **i18n:** `useTranslation` hook for all text

### Testing

- **E2E Tests:** Playwright for critical workflows
- **API Tests:** Manual testing via API endpoints
- **Type Safety:** TypeScript compilation = first line of testing

---

## Performance Considerations

1. **Query Optimization:** Select only needed columns
2. **Pagination:** Limit large datasets
3. **Caching:** TanStack Query automatic caching
4. **Indexes:** Primary keys, foreign keys, unique constraints
5. **Connection Pooling:** Neon serverless handles automatically

---

## Deployment Architecture

**Development:**
- Vite dev server (frontend)
- Express server (backend)
- Neon development database

**Production (Replit):**
- Express serves both frontend + backend
- Vite build assets served statically
- Neon production database
- PostgreSQL session store
- Auto-scaling via Replit infrastructure

---

## Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ Session security (PostgreSQL store, httpOnly cookies)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Security headers (Helmet.js)
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Drizzle ORM parameterized queries)
- ✅ XSS protection (React escaping)

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Check `DATABASE_URL` environment variable
- Verify Neon database is running
- Check network connectivity

**2. Session Expired**
- Default 24-hour expiry
- Clear cookies and re-login

**3. Permission Denied**
- Verify user role and `canAccessReports` flag
- Check route middleware

**4. PDF Generation Fails**
- Check browser console for font loading errors
- Verify contract data is complete

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Nov 2025 | Option B complete (Driver Service + Branch Management) |
| 1.5 | Oct 2025 | Driver Service Module implementation |
| 1.0 | Sep 2025 | Core contract management system |

---

**For More Information:**
- [User Guide](USER_GUIDE.md) - End-user documentation
- [Admin Guide](ADMIN_GUIDE.md) - Administrator documentation
- [Deployment Guide](DEPLOYMENT.md) - Deployment instructions
- [Feature Roadmap](FEATURE_ROADMAP.md) - Future development plans
