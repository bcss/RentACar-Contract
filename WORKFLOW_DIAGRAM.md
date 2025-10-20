# Rental Car Contract Management System - Complete Workflow Diagram

## System Overview
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    RENTAL CAR CONTRACT MANAGEMENT SYSTEM                        │
│                         Bilingual (English/Arabic)                              │
│                    Role-Based Access Control (RBAC)                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

| Role    | Permissions                                                                |
|---------|---------------------------------------------------------------------------|
| Admin   | Full access: All CRUD, user management, settings, audit logs              |
| Manager | Contract management, master data, audit logs, read users                  |
| Staff   | Create/edit own contracts, view master data, limited access               |
| Viewer  | Read-only access to contracts and master data                             |

## 1. Authentication Flow
```
┌─────────────┐
│   Landing   │ → User not authenticated
│    Page     │
└──────┬──────┘
       │
       ├──→ Click "Login"
       │
       v
┌─────────────┐
│   Login     │ → Enter username/password
│    Page     │ → POST /api/login
└──────┬──────┘
       │
       ├──→ Authentication Success
       │
       v
┌─────────────┐
│  Dashboard  │ → Authenticated session established
└─────────────┘
```

## 2. Main Application Structure
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SIDEBAR NAVIGATION                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  📊 Dashboard         → Overview, metrics, quick actions                     │
│  👥 Customers         → Master data for hirers/drivers                       │
│  🚗 Vehicles          → Master data for rental fleet                         │
│  👤 Persons           → Master data for individual sponsors (Admin/Manager)  │
│  🏢 Companies         → Master data for corporate sponsors (Admin/Manager)   │
│  📄 Contracts         → Contract management & lifecycle                      │
│  👨‍💼 Users             → User management (Admin only)                          │
│  📋 Audit Logs        → System audit trail (Admin/Manager)                   │
│  ⚙️ Settings          → Company settings (Admin only)                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 3. Master Data Management Workflows

### 3.1 Customers (👥)
```
┌─────────────┐
│  Customers  │
│    Page     │
└──────┬──────┘
       │
       ├─→ View Active Customers (Tab)
       │   └─→ Search by name, ID, phone
       │   └─→ Edit customer → Update details
       │   └─→ Disable customer
       │
       ├─→ View Disabled Customers (Tab)
       │   └─→ Enable customer → Restore to active
       │
       └─→ Add New Customer
           └─→ Fill form:
               • Basic Info: Name (EN/AR), National ID
               • Contact: Phone, Email, Address
               • License: Number, Issued By, Dates
               • Demographics: Gender, DOB, Nationality
           └─→ POST /api/customers → Save to database
```

**Customer Fields:**
- nameEn, nameAr, nationalId, gender, dateOfBirth
- phone, email, address
- licenseNumber, licenseIssuedBy, licenseIssueDate, licenseExpiryDate, nationality
- notes, disabled, disabledBy, disabledAt

### 3.2 Vehicles (🚗)
```
┌─────────────┐
│  Vehicles   │
│    Page     │
└──────┬──────┘
       │
       ├─→ View Active Vehicles (Tab)
       │   └─→ Search by registration, make, model
       │   └─→ Edit vehicle → Update details
       │   └─→ Disable vehicle
       │
       ├─→ View Disabled Vehicles (Tab)
       │   └─→ Enable vehicle → Restore to active
       │
       └─→ Add New Vehicle
           └─→ Fill form:
               • Identification: Registration, VIN
               • Details: Make, Model, Year, Color, Fuel Type
               • Tracking: Odometer
               • Pricing: Daily/Weekly/Monthly Rates
               • Status: Available/Rented/Maintenance/Damaged
           └─→ POST /api/vehicles → Save to database
```

**Vehicle Fields:**
- registration, vin, make, model, year, color, fuelType
- odometer, dailyRate, weeklyRate, monthlyRate, status
- notes, disabled, disabledBy, disabledAt

### 3.3 Persons (👤) - Individual Sponsors
```
┌─────────────┐
│   Persons   │ (Admin/Manager only)
│    Page     │
└──────┬──────┘
       │
       ├─→ View Active Persons (Tab)
       │   └─→ Search by name, passport, license
       │   └─→ Edit person → Update details
       │   └─→ Disable person
       │
       ├─→ View Disabled Persons (Tab)
       │   └─→ Enable person → Restore to active
       │
       └─→ Add New Person
           └─→ Fill form:
               • Basic Info: Name (EN/AR), Nationality
               • Identification: Passport ID, License Number
               • Contact: Mobile, Address
               • Relation: Relationship to hirer (e.g., Employer)
           └─→ POST /api/persons → Save to database
```

**Person Fields:**
- nameEn, nameAr, nationality, passportId, licenseNumber
- mobile, address, relation
- notes, disabled, disabledBy, disabledAt

### 3.4 Companies (🏢) - Corporate Sponsors
```
┌─────────────┐
│  Companies  │ (Admin/Manager only)
│    Page     │
└──────┬──────┘
       │
       ├─→ View Active Companies (Tab)
       │   └─→ Search by name, registration, tax ID
       │   └─→ Edit company → Update details
       │   └─→ Disable company
       │
       ├─→ View Disabled Companies (Tab)
       │   └─→ Enable company → Restore to active
       │
       └─→ Add New Company
           └─→ Fill form:
               • Basic Info: Name (EN/AR)
               • Registration: Number, Validity Date
               • Tax: Tax ID, Validity Date
               • Contact: Contact Person, Phone, Email
               • Address: Physical address
           └─→ POST /api/companies → Save to database
```

**Company Fields:**
- nameEn, nameAr, registrationNumber, registrationValidity
- taxId, taxValidity, contactPerson, phone, email, address
- notes, disabled, disabledBy, disabledAt

## 4. Contract Management Workflow

### 4.1 Contract Creation - Three Hirer Types
```
┌──────────────────┐
│   Contracts      │
│     Page         │
└────────┬─────────┘
         │
         └─→ Click "New Contract"
             │
             v
┌────────────────────────────────────────────────────────────────────────────┐
│                         CONTRACT FORM                                      │
├────────────────────────────────────────────────────────────────────────────┤
│  STEP 1: Select Customer (Hirer/Driver - ALWAYS THE PERSON RENTING)       │
│          └─→ Search/Select from Customers table                           │
│                                                                            │
│  STEP 2: Select Vehicle                                                   │
│          └─→ Search/Select from Vehicles table                            │
│          └─→ Check availability for date range                            │
│                                                                            │
│  STEP 3: Select Hirer Type (Important!)                                   │
│          ┌──────────────────────────────────────┐                         │
│          │  🔹 Direct (No Sponsor)              │                         │
│          │     Customer rents directly          │                         │
│          │     No sponsorId or companySponsorId │                         │
│          ├──────────────────────────────────────┤                         │
│          │  🔹 With Sponsor (Individual)        │                         │
│          │     Customer rents with person       │                         │
│          │     Select from Persons table        │                         │
│          │     Sets sponsorId field             │                         │
│          ├──────────────────────────────────────┤                         │
│          │  🔹 From Company (Corporate)         │                         │
│          │     Customer rents with company      │                         │
│          │     Select from Companies table      │                         │
│          │     Sets companySponsorId field      │                         │
│          └──────────────────────────────────────┘                         │
│                                                                            │
│  STEP 4: Rental Details                                                   │
│          • Start Date, End Date                                           │
│          • Pickup Location, Dropoff Location                              │
│          • Daily Rate, Total Amount                                       │
│                                                                            │
│  STEP 5: Additional Details (Optional)                                    │
│          • Notes, Terms, Conditions                                       │
│                                                                            │
│  STEP 6: Submit                                                           │
│          └─→ POST /api/contracts                                          │
│          └─→ Creates contract in 'draft' status                           │
│          └─→ Audit log: CREATE event                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Contract Lifecycle (5 States)
```
                    ┌──────────────────────────────────────────┐
                    │          CONTRACT LIFECYCLE              │
                    └──────────────────────────────────────────┘

┌─────────┐         ┌───────────┐         ┌────────┐         ┌───────────┐         ┌────────┐
│  DRAFT  │ ──────> │ CONFIRMED │ ──────> │ ACTIVE │ ──────> │ COMPLETED │ ──────> │ CLOSED │
└─────────┘         └───────────┘         └────────┘         └───────────┘         └────────┘
    │                    │                     │                    │                    │
    │                    │                     │                    │                    │
    v                    v                     v                    v                    v
Editable           Ready to start        Customer has        Vehicle          All payments
Can be modified    Cannot edit contract  vehicle             returned         settled
without reason     Customer confirmed    Payment tracking    Extra charges    Contract finalized
                   details correct       available           calculated       Cannot reopen

                   ⚠️ Immutable once confirmed - edits require reason ⚠️
```

### 4.3 Detailed State Transitions
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: DRAFT                                                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Contract created, not yet confirmed                                          │
│ • Fully editable (no edit reason required)                                     │
│ • Actions Available:                                                           │
│   └─→ Edit Contract → Modify any field                                        │
│   └─→ Confirm Contract → Transition to CONFIRMED                              │
│   └─→ Disable Contract → Mark as disabled (Admin only)                        │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/contracts/:id/confirm
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: CONFIRMED                                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Contract details confirmed by customer                                       │
│ • ⚠️ IMMUTABLE: Edits require reason (tracked in contractEdits table)         │
│ • Actions Available:                                                           │
│   └─→ Edit Contract (with reason) → Creates audit trail                       │
│   └─→ Activate Contract → Transition to ACTIVE                                │
│   └─→ Audit log: CONFIRM event                                                │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/contracts/:id/activate
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: ACTIVE                                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Customer has taken the vehicle                                               │
│ • Vehicle status changed to 'rented'                                           │
│ • Payment tracking enabled:                                                    │
│   └─→ Record Deposit Payment → POST /api/contracts/:id/deposit                │
│       • depositAmount, depositMethod, depositDate                             │
│       • Sets depositPaid = true                                               │
│ • Actions Available:                                                           │
│   └─→ Edit Contract (with reason)                                             │
│   └─→ Complete Contract → Transition to COMPLETED                             │
│   └─→ Audit log: ACTIVATE event                                               │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/contracts/:id/complete
                                    │ + Vehicle Return Workflow
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: COMPLETED                                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Vehicle returned by customer                                                 │
│ • Vehicle Return Workflow captures:                                            │
│   • returnOdometer (final mileage)                                            │
│   • returnFuelLevel (1/4, 1/2, 3/4, Full)                                     │
│   • vehicleCondition (notes about damage, cleanliness)                        │
│   • extraCharges calculated (fuel, damage, late fees)                         │
│ • Payment Recording:                                                           │
│   └─→ Record Final Payment → POST /api/contracts/:id/final-payment            │
│       • finalPaymentAmount, finalPaymentMethod, finalPaymentDate              │
│       • Sets finalPaymentPaid = true                                          │
│ • Actions Available:                                                           │
│   └─→ Close Contract → Transition to CLOSED                                   │
│   └─→ Audit log: COMPLETE event                                               │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/contracts/:id/close
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: CLOSED                                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Contract fully finalized                                                     │
│ • All payments settled                                                         │
│ • Refund tracking:                                                             │
│   └─→ Record Deposit Refund → POST /api/contracts/:id/refund                  │
│       • depositRefundAmount, depositRefundMethod, depositRefundDate           │
│       • Sets depositRefunded = true                                           │
│ • Vehicle available for next rental                                            │
│ • Actions Available:                                                           │
│   └─→ Print PDF → Generate MARMAR contract template                           │
│   └─→ View Timeline → Complete history                                        │
│   └─→ Audit log: CLOSE event                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

## 5. Contract Timeline & Audit Trail

### 5.1 Dual-Layer Audit System
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUDIT TRAIL SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: Contract Edits (Field-Level Changes)                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Table: contractEdits                                                       │
│  Purpose: Track every field modification after contract is confirmed        │
│  Fields:                                                                    │
│    • contractId: Which contract was edited                                  │
│    • fieldName: Which field changed (e.g., "totalAmount")                   │
│    • oldValue: Previous value                                               │
│    • newValue: Updated value                                                │
│    • editReason: Why the change was made (required for confirmed+)          │
│    • editedBy: User who made the change                                     │
│    • editedAt: Timestamp                                                    │
│                                                                             │
│  Layer 2: Lifecycle Events (State Transitions & Actions)                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Table: auditLogs                                                           │
│  Purpose: Track major contract lifecycle events and user actions            │
│  Events:                                                                    │
│    • create: Contract created                                               │
│    • confirm: Contract confirmed (becomes immutable)                        │
│    • activate: Contract activated (vehicle taken)                           │
│    • complete: Contract completed (vehicle returned)                        │
│    • close: Contract closed (fully settled)                                 │
│    • print: PDF generated                                                   │
│    • edit: General edit action                                              │
│    • login/logout: User authentication events                               │
│  Fields:                                                                    │
│    • userId: Who performed the action                                       │
│    • action: What action was performed                                      │
│    • contractId: Related contract (if applicable)                           │
│    • ipAddress: User's IP                                                   │
│    • details: Additional context                                            │
│    • timestamp: When it happened                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Contract Timeline View
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CONTRACT TIMELINE                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Displays combined view of:                                                 │
│    1. Field edits (from contractEdits table)                                │
│    2. Lifecycle events (from auditLogs table)                               │
│                                                                              │
│  Sorted by: Timestamp (most recent first)                                   │
│                                                                              │
│  Example Timeline:                                                          │
│  ───────────────────────────────────────────────────────────────────────    │
│  🟢 2025-10-20 14:30 │ Contract Closed                                      │
│     By: Admin User   │ Final state transition                              │
│  ───────────────────────────────────────────────────────────────────────    │
│  💰 2025-10-20 14:25 │ Deposit Refunded                                     │
│     Amount: $500     │ Method: Cash                                         │
│  ───────────────────────────────────────────────────────────────────────    │
│  ✏️  2025-10-19 10:15 │ Field Edit: totalExtraCharges                       │
│     Old: $0          │ New: $50                                             │
│     Reason: Late return fee (1 day)                                         │
│     By: Manager User                                                        │
│  ───────────────────────────────────────────────────────────────────────    │
│  🔵 2025-10-18 16:00 │ Contract Completed                                   │
│     By: Staff User   │ Vehicle returned                                     │
│  ───────────────────────────────────────────────────────────────────────    │
│  📄 2025-10-10 09:00 │ Contract Printed                                     │
│     By: Staff User   │ PDF generated                                        │
│  ───────────────────────────────────────────────────────────────────────    │
│  🟡 2025-10-10 08:45 │ Contract Activated                                   │
│     By: Staff User   │ Customer took vehicle                                │
│  ───────────────────────────────────────────────────────────────────────    │
│  🟠 2025-10-09 15:00 │ Contract Confirmed                                   │
│     By: Customer     │ Details verified                                     │
│  ───────────────────────────────────────────────────────────────────────    │
│  ⚪ 2025-10-09 14:30 │ Contract Created                                     │
│     By: Staff User   │ Initial draft                                        │
│  ───────────────────────────────────────────────────────────────────────    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 6. Payment Tracking Workflow
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT TRACKING                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Payment Type 1: DEPOSIT (recorded when contract is ACTIVE)                 │
│  ───────────────────────────────────────────────────────────────────────    │
│  Endpoint: POST /api/contracts/:id/deposit                                  │
│  Fields Updated:                                                            │
│    • depositAmount: Amount paid                                             │
│    • depositMethod: cash/card/transfer                                      │
│    • depositDate: Payment date                                              │
│    • depositPaid: true                                                      │
│  Status: depositPaid = true, depositRefunded = false                        │
│                                                                              │
│  Payment Type 2: FINAL PAYMENT (recorded when contract is COMPLETED)        │
│  ───────────────────────────────────────────────────────────────────────    │
│  Endpoint: POST /api/contracts/:id/final-payment                            │
│  Fields Updated:                                                            │
│    • finalPaymentAmount: Amount paid                                        │
│    • finalPaymentMethod: cash/card/transfer                                 │
│    • finalPaymentDate: Payment date                                         │
│    • finalPaymentPaid: true                                                 │
│  Status: finalPaymentPaid = true                                            │
│                                                                              │
│  Payment Type 3: DEPOSIT REFUND (recorded when contract is CLOSED)          │
│  ───────────────────────────────────────────────────────────────────────    │
│  Endpoint: POST /api/contracts/:id/refund                                   │
│  Fields Updated:                                                            │
│    • depositRefundAmount: Amount refunded                                   │
│    • depositRefundMethod: cash/card/transfer                                │
│    • depositRefundDate: Refund date                                         │
│    • depositRefunded: true                                                  │
│  Status: depositPaid = true, depositRefunded = true                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Dashboard Metrics Calculations
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD METRICS                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Metric 1: ACTIVE RENTALS                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: contracts.filter(c => c.status === 'active').length                 │
│  Purpose: Shows how many vehicles are currently rented out                  │
│                                                                              │
│  Metric 2: MONTHLY REVENUE                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: contracts                                                            │
│    .filter(c =>                                                              │
│      created this month AND                                                 │
│      (status === 'active' OR 'completed' OR 'closed')                       │
│    )                                                                         │
│    .reduce((sum, c) =>                                                       │
│      sum + parseFloat(c.totalAmount) + parseFloat(c.totalExtraCharges)      │
│    )                                                                         │
│  Purpose: Total revenue from contracts created this month                   │
│                                                                              │
│  Metric 3: OVERDUE RETURNS                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: contracts.filter(c =>                                                │
│    c.status === 'active' AND                                                │
│    c.rentalEndDate < today                                                  │
│  )                                                                           │
│  Purpose: Active contracts past their return date                           │
│  Display: RED border if count > 0                                           │
│                                                                              │
│  Metric 4: PENDING REFUNDS                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: contracts.filter(c =>                                                │
│    c.status === 'closed' AND                                                │
│    c.depositPaid === true AND                                               │
│    c.depositRefunded !== true                                               │
│  )                                                                           │
│  Purpose: Closed contracts with deposits not yet refunded                   │
│  Display: YELLOW border if count > 0                                        │
│                                                                              │
│  Additional Analytics (Admin/Manager only):                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Revenue Analytics: Total revenue, avg contract value, growth             │
│  • Operational Analytics: Avg rental duration, contract growth              │
│  • Customer Analytics: Total customers, repeat rate, new this month         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 8. PDF Generation (MARMAR Template)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      MARMAR PDF CONTRACT TEMPLATE                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Trigger: Click "Print" button on contract view                             │
│  Endpoint: Creates audit log entry for 'print' action                       │
│                                                                              │
│  PDF Sections:                                                              │
│  ───────────────────────────────────────────────────────────────────────    │
│  1. Company Header (from Company Settings)                                  │
│     • Company Name (EN/AR)                                                  │
│     • Logo, Contact Info, Registration Details                             │
│                                                                              │
│  2. Contract Details                                                        │
│     • Contract Number, Date                                                 │
│     • Rental Period, Locations                                              │
│                                                                              │
│  3. Parties Section (Dynamic based on hirerType)                            │
│     ┌────────────────────────────────────────────┐                          │
│     │ HIRER/DRIVER (Always Customer)            │                          │
│     │  • Customer details from Customers table  │                          │
│     │  • Customer is ALWAYS the actual driver   │                          │
│     └────────────────────────────────────────────┘                          │
│     ┌────────────────────────────────────────────┐                          │
│     │ SPONSOR (Conditional)                      │                          │
│     │  If hirerType === 'with_sponsor':         │                          │
│     │    • Person details from Persons table    │                          │
│     │  If hirerType === 'from_company':         │                          │
│     │    • Company details from Companies table │                          │
│     │  If hirerType === 'direct':               │                          │
│     │    • Section hidden                       │                          │
│     └────────────────────────────────────────────┘                          │
│                                                                              │
│  4. Vehicle Details                                                         │
│     • From Vehicles table                                                   │
│     • Make, Model, Year, Registration, Color                                │
│                                                                              │
│  5. Vehicle Inspection Checklist                                            │
│     • Pre-rental condition                                                  │
│     • Post-rental condition (if completed)                                  │
│                                                                              │
│  6. Financial Breakdown                                                     │
│     • Base rental amount                                                    │
│     • Extra charges (if any)                                                │
│     • Deposit paid/refunded status                                          │
│     • Final payment status                                                  │
│                                                                              │
│  7. Terms & Conditions                                                      │
│     • From Company Settings (bilingual)                                     │
│     • Additional contract clauses                                           │
│                                                                              │
│  8. Signatures                                                              │
│     • Customer signature                                                    │
│     • Company representative signature                                      │
│     • Date                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 9. User Management (Admin Only)
```
┌─────────────┐
│    Users    │ (Admin only)
│    Page     │
└──────┬──────┘
       │
       ├─→ View Active Users (Tab)
       │   └─→ Edit user → Update role, details
       │   └─→ Disable user → Prevent login
       │   └─→ Change Password (own account or others)
       │
       ├─→ View Disabled Users (Tab)
       │   └─→ Enable user → Restore access
       │
       └─→ Add New User
           └─→ Fill form:
               • Username (unique), Password
               • First Name, Last Name, Email
               • Role: Admin/Manager/Staff/Viewer
           └─→ POST /api/users → Save to database
           └─→ Password hashing with bcrypt
```

**Special User: Super Admin**
- Username: `admin`
- Immutable (cannot be deleted or disabled)
- Seeded on application startup
- Full system access

## 10. System Settings (Admin Only)
```
┌─────────────┐
│  Settings   │ (Admin only)
│    Page     │
└──────┬──────┘
       │
       └─→ Company Settings (Singleton)
           ├─→ Company Information
           │   • Name (EN/AR)
           │   • Registration Number
           │   • Tax ID
           │
           ├─→ Contact Details
           │   • Phone, Email, Website
           │   • Address (EN/AR)
           │
           ├─→ Financial Settings
           │   • Default currency
           │   • Tax rate
           │
           ├─→ Contract Terms
           │   • Default terms (EN/AR)
           │   • Additional clauses (EN/AR)
           │
           └─→ Logo Upload
               • Company logo for PDFs
```

## 11. Complete Data Model
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  users           → User accounts (admin, manager, staff, viewer)            │
│  customers       → Master data: Hirers/Drivers (always the renter)          │
│  vehicles        → Master data: Rental fleet                                │
│  persons         → Master data: Individual sponsors                         │
│  companies       → Master data: Corporate sponsors                          │
│  contracts       → Core entity: Rental contracts                            │
│                   • References: customerId, vehicleId                       │
│                   • Optional: sponsorId (person) OR companySponsorId        │
│  auditLogs       → Lifecycle events & user actions                          │
│  contractEdits   → Field-level change tracking                              │
│  contractCounter → Auto-incrementing contract numbers                       │
│  systemErrors    → Error tracking & acknowledgment                          │
│  companySettings → Global company configuration (singleton)                 │
│  sessions        → User session storage (PostgreSQL)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 12. Key Business Rules

### Contract Status Rules
```
✅ VALID STATUS FLOW:
draft → confirmed → active → completed → closed

❌ INVALID:
• No 'finalized' status exists
• Cannot skip states
• Cannot go backwards (e.g., closed → active)
```

### Hirer Type Rules
```
🔹 Direct (hirerType === 'direct')
   • Customer rents on their own
   • sponsorId = NULL
   • companySponsorId = NULL

🔹 With Sponsor (hirerType === 'with_sponsor')
   • Customer rents with individual sponsor
   • sponsorId = person.id (from persons table)
   • companySponsorId = NULL

🔹 From Company (hirerType === 'from_company')
   • Customer rents with company sponsor
   • sponsorId = NULL
   • companySponsorId = company.id (from companies table)
```

### Immutability Rules
```
⚠️ DRAFT Status:
   • Fully editable
   • No edit reason required

⚠️ CONFIRMED+ Status (confirmed, active, completed, closed):
   • Edits require reason
   • Reason tracked in contractEdits table
   • All field changes logged
```

### Disable-Only Architecture
```
🚫 NO DELETE OPERATIONS
   • Customers, Vehicles, Persons, Companies: Can only be disabled/enabled
   • Users: Can only be disabled/enabled (except super admin)
   • Contracts: Can only be disabled/enabled (Admin only)
   
✅ Preserves data integrity
✅ Maintains audit trail
✅ Allows historical reporting
```

## 13. Language & Theming
```
┌──────────────────────────────────────────────────────────────────────┐
│  🌍 LANGUAGE SUPPORT                                                 │
│  ──────────────────────────────────────────────────────────────────  │
│  • English (EN) - LTR layout                                         │
│  • Arabic (AR) - RTL layout                                          │
│  • Toggle: Header language selector                                 │
│  • Persistence: localStorage                                        │
│  • Zero hardcoded strings (all via i18next)                         │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  🎨 THEME SUPPORT                                                    │
│  ──────────────────────────────────────────────────────────────────  │
│  • Light Mode (default)                                              │
│  • Dark Mode                                                         │
│  • Toggle: Header theme selector                                    │
│  • Design: Material Design 3                                        │
│  • Primary Color: Cyan-Blue (#06b6d4)                                │
│  • Persistence: localStorage                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Summary

This comprehensive workflow diagram shows the complete rental car contract management system with:

✅ **Authentication**: Internal username/password system with role-based access
✅ **Master Data**: Customers, Vehicles, Persons (individual sponsors), Companies (corporate sponsors)
✅ **Contract Lifecycle**: 5-state workflow (draft → confirmed → active → completed → closed)
✅ **Three Hirer Types**: Direct, with individual sponsor, with company sponsor
✅ **Payment Tracking**: Deposit, final payment, and refund workflows
✅ **Audit Trail**: Dual-layer system (field edits + lifecycle events)
✅ **Dashboard**: Real-time metrics (active rentals, revenue, overdue, refunds)
✅ **PDF Generation**: MARMAR contract template with dynamic sponsor sections
✅ **Bilingual**: Full English/Arabic support with RTL/LTR layouts
✅ **Immutability**: Edit tracking with reasons for confirmed+ contracts
✅ **Disable-Only**: No delete operations, only disable/enable
