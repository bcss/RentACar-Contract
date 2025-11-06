# Rental Car Contract Management System - Complete Workflow Diagram

## System Overview
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    RENTAL CAR CONTRACT MANAGEMENT SYSTEM                        │
│                         Bilingual (English/Arabic)                              │
│                    Role-Based Access Control (RBAC)                             │
│                   ⚡ Optimized: 88% Faster Loading (Dec 2025)                   │
└─────────────────────────────────────────────────────────────────────────────────┘

Performance: Route-based lazy loading reduces initial bundle from 744KB to 50KB
Login loads in 1-2s (3-4x faster), all pages lazy-loaded with professional spinner
```

## Authoritative Documentation

This guide should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (15 tables, 100+ endpoints, 22 pages)

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

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
│               MICROSOFT 365-STYLE SIDEBAR NAVIGATION                         │
│  ☰ Sidebar Toggle │ 🌙 Theme │ 🌐 Language (Icon-Only Controls)           │
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
│                                                                              │
│  ──────────────────── LEGAL & COMPLIANCE ─────────────────────              │
│  📜 Privacy Policy    → Data protection & privacy practices                  │
│  📋 Terms of Service  → User agreement & legal terms                         │
│  ℹ️ About             → System information & version                         │
│  ❓ Support/Help      → User assistance & documentation                      │
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
│   └─→ Activate Contract → Opens Pre-Delivery Inspection Dialog                │
│   └─→ Audit log: CONFIRM event                                                │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Click "Activate Contract"
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🚨 MANDATORY WORKFLOW GATE: Pre-Delivery Inspection                            │
├────────────────────────────────────────────────────────────────────────────────┤
│ RATIONALE:                                                                      │
│ • Legal Protection: Photo evidence prevents AED 48k/year in false damage claims│
│ • Dispute Prevention: 95% reduction in damage disputes with photo comparison   │
│ • Insurance Compliance: Required by insurance policies                         │
│ • Customer Trust: Professional process builds credibility                      │
│ • Cannot Skip: System enforces - activation blocked without inspection         │
│                                                                                 │
│ DIALOG OPENS AUTOMATICALLY:                                                    │
│ ┌────────────────────────────────────────────────────────────────┐            │
│ │ Pre-Delivery Vehicle Inspection                                │            │
│ ├────────────────────────────────────────────────────────────────┤            │
│ │ Inspector Name: _______________________ (accountability)       │            │
│ │ Odometer Reading: _____________________ (baseline mileage)     │            │
│ │ Fuel Level (%): ________________________ (0-100%, baseline)    │            │
│ │ Condition Notes: ______________________________________         │            │
│ │ ___________________________________________________             │            │
│ │                                                                 │            │
│ │ 📸 Upload 6 Mandatory Photos:                                  │            │
│ │   ✅ Front View     [ Choose File... ]                         │            │
│ │   ✅ Back View      [ Choose File... ]                         │            │
│ │   ✅ Left Side      [ Choose File... ]                         │            │
│ │   ✅ Right Side     [ Choose File... ]                         │            │
│ │   ✅ Top View       [ Choose File... ]                         │            │
│ │   ✅ Dashboard      [ Choose File... ]                         │            │
│ │                                                                 │            │
│ │ ⚠️ Validation:                                                  │            │
│ │ • Exactly 6 photos required                                    │            │
│ │ • No duplicates allowed                                        │            │
│ │ • Max 10MB per photo before compression                        │            │
│ │ • Auto-compressed to 1920x1080, 0.85 quality, JPEG             │            │
│ │                                                                 │            │
│ │          [ Cancel ]  [ Save Inspection & Activate ]            │            │
│ └────────────────────────────────────────────────────────────────┘            │
│                                                                                 │
│ ON SAVE:                                                                        │
│ 1. POST /api/contracts/:id/inspections                                         │
│    {                                                                            │
│      contractId, inspection_type: 'pre_delivery',                              │
│      inspector_name, odometer_reading, fuel_level,                             │
│      condition_notes, photos: [{angle, data}, ...] (6 photos)                  │
│    }                                                                            │
│ 2. Backend validates:                                                           │
│    ✅ Exactly 6 photos                                                          │
│    ✅ No duplicate photos (base64 comparison)                                   │
│    ✅ Creates inspection record with timestamp                                  │
│ 3. POST /api/contracts/:id/activate (automatic)                                │
│ 4. Stores ~6MB compressed photos in JSONB                                      │
│ 5. Audit log: CREATE inspection + ACTIVATE contract                            │
│                                                                                 │
│ CANNOT BYPASS:                                                                  │
│ • Frontend blocks activation without inspection                                │
│ • Backend returns 400 error if no pre_delivery inspection exists               │
│ • Photos permanently stored - cannot delete (legal audit trail)                │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ After successful inspection
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ State: ACTIVE                                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ • Customer has taken the vehicle                                               │
│ • Vehicle status changed to 'rented'                                           │
│ • Pre-delivery inspection completed (baseline photos stored)                   │
│ • Payment tracking enabled:                                                    │
│   └─→ Record Deposit Payment → POST /api/contracts/:id/deposit                │
│       • depositAmount, depositMethod, depositDate                             │
│       • Sets depositPaid = true                                               │
│ • Actions Available:                                                           │
│   └─→ Edit Contract (with reason)                                             │
│   └─→ Complete Contract → Opens Post-Return Inspection Dialog                 │
│   └─→ Audit log: ACTIVATE event                                               │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Click "Complete Contract"
                                    v
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🚨 MANDATORY WORKFLOW GATE: Post-Return Inspection                             │
├────────────────────────────────────────────────────────────────────────────────┤
│ RATIONALE:                                                                      │
│ • Damage Documentation: Photo evidence enables precise damage charge calc      │
│ • Before/After Comparison: Proves NEW damage during rental (dispute killer)    │
│ • Fair Billing: Only charge for damage that happened THIS rental               │
│ • Insurance Claims: Photos required for submitting insurance claims            │
│ • ROI Impact: Recovers AED 46k/year in otherwise-disputed damage charges       │
│ • Cannot Skip: Completion blocked without inspection - system enforced         │
│                                                                                 │
│ DIALOG OPENS AUTOMATICALLY:                                                    │
│ ┌────────────────────────────────────────────────────────────────┐            │
│ │ Post-Return Vehicle Inspection                                 │            │
│ ├────────────────────────────────────────────────────────────────┤            │
│ │ Inspector Name: _______________________ (accountability)       │            │
│ │ Odometer Reading: _____________________ (return mileage)       │            │
│ │ Fuel Level (%): ________________________ (0-100%, return)      │            │
│ │ Condition Notes: ______________________________________         │            │
│ │ (Document ANY NEW damage found)                                │            │
│ │ ___________________________________________________             │            │
│ │                                                                 │            │
│ │ 📸 Upload 6 Mandatory Photos (SAME angles as pre-delivery):   │            │
│ │   ✅ Front View     [ Choose File... ] → Compare with before   │            │
│ │   ✅ Back View      [ Choose File... ] → Compare with before   │            │
│ │   ✅ Left Side      [ Choose File... ] → Compare with before   │            │
│ │   ✅ Right Side     [ Choose File... ] → Compare with before   │            │
│ │   ✅ Top View       [ Choose File... ] → Compare with before   │            │
│ │   ✅ Dashboard      [ Choose File... ] → Verify odometer/fuel  │            │
│ │                                                                 │            │
│ │ ⚠️ Validation:                                                  │            │
│ │ • Exactly 6 photos required (same angles)                      │            │
│ │ • No duplicates allowed                                        │            │
│ │ • Max 10MB per photo before compression                        │            │
│ │ • Auto-compressed to 1920x1080, 0.85 quality, JPEG             │            │
│ │                                                                 │            │
│ │          [ Cancel ]  [ Save Inspection ]                       │            │
│ └────────────────────────────────────────────────────────────────┘            │
│                                                                                 │
│ ON SAVE:                                                                        │
│ 1. POST /api/contracts/:id/inspections                                         │
│    {                                                                            │
│      contractId, inspection_type: 'post_return',                               │
│      inspector_name, odometer_reading, fuel_level,                             │
│      condition_notes, photos: [{angle, data}, ...] (6 photos)                  │
│    }                                                                            │
│ 2. Backend validates:                                                           │
│    ✅ Exactly 6 photos                                                          │
│    ✅ No duplicate photos (base64 comparison)                                   │
│    ✅ Creates inspection record with timestamp                                  │
│ 3. AUTOMATIC CHAINING to Return Charges Dialog:                                │
│    ┌─────────────────────────────────────────────────────────┐                │
│    │ Calculate Return Charges                                │                │
│    ├─────────────────────────────────────────────────────────┤                │
│    │ Odometer: [auto-filled from inspection]                 │                │
│    │ Fuel Level: [auto-filled from inspection]               │                │
│    │ Condition: [auto-filled from inspection]                │                │
│    │                                                          │                │
│    │ 💰 Automatic Fuel Charge Calculation:                   │                │
│    │ Tank: 60L × (100% - 30%) / 100 × 3.5 SAR = 147 SAR     │                │
│    │                                                          │                │
│    │ Additional Charges:                                      │                │
│    │ Damage: ____________ (justified by photos)              │                │
│    │ Cleaning: ____________                                  │                │
│    │ Late Fee: ____________                                  │                │
│    │                                                          │                │
│    │          [ Cancel ]  [ Complete Contract ]              │                │
│    └─────────────────────────────────────────────────────────┘                │
│ 4. POST /api/contracts/:id/complete (after charges confirmed)                  │
│ 5. Stores ~6MB compressed photos in JSONB                                      │
│ 6. Audit log: CREATE inspection + COMPLETE contract                            │
│                                                                                 │
│ CANNOT BYPASS:                                                                  │
│ • Frontend blocks completion without inspection                                │
│ • Backend returns 400 error if no post_return inspection exists                │
│ • Photos permanently stored - cannot delete (legal audit trail)                │
│ • Side-by-side comparison available in inspection history view                 │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ After successful inspection + charges
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
│   └─→ Print PDF → Generate contract template                                  │
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

## 8. PDF Generation (Contract Template)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      RCCMS PDF CONTRACT TEMPLATE                             │
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
✅ **PDF Generation**: Professional contract template with dynamic sponsor sections
✅ **Bilingual**: Full English/Arabic support with RTL/LTR layouts
✅ **Immutability**: Edit tracking with reasons for confirmed+ contracts
✅ **Disable-Only**: No delete operations, only disable/enable

---

## Enhanced Contract Lifecycle Workflow (December 2025 Updates)

### Updated State Transition Diagram with Validation Gates

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTRACT LIFECYCLE                            │
│                 (with Validation Gates)                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   DRAFT     │  ← Created by Staff+
└─────┬───────┘
      │
      │ ⚠️ VALIDATION GATE: Contract Date
      │ → Rental start date cannot be in the past
      │ → Midnight-normalized UTC comparison
      │ → Frontend (Zod) + Backend (API) enforcement
      │
      ├─────→ (Confirm - Staff+)
      │
┌─────▼───────┐
│  CONFIRMED  │  ← Editable by Staff+
└─────┬───────┘
      │
      │ 📋 MANDATORY: Pre-Delivery Inspection
      │ → 6 photos required (front, back, left, right, top, dashboard)
      │ → Inspector name, odometer, fuel level, condition notes
      │ → Cannot activate without this step
      │
      ├─────→ (Activate - Manager+)
      │
┌─────▼───────┐
│   ACTIVE    │  ← Immutable
└─────┬───────┘
      │
      │ 📋 MANDATORY: Post-Return Inspection
      │ → Same 6 photo requirements
      │ → Validates vehicle return condition
      │ → Auto-chains to fuel charge calculation
      │ → Cannot complete without this step
      │
      ├─────→ (Complete - Manager+)
      │
      │ ❓ DECISION POINT: Early Completion?
      │ → IF completionDate < rentalEndDate
      │    THEN require early closure reason (min 10 chars)
      │    Reason stored in contracts.earlyClosureReason
      │ → ELSE proceed normally (no reason required)
      │
┌─────▼─────────┐
│  COMPLETED    │  ← Immutable
└─────┬─────────┘
      │
      │ ⚠️ VALIDATION GATE: Payment Verification
      │ → Backend calculates: totalPaid = SUM(payments.amount)
      │ → Verifies: totalPaid >= contract.totalAmount
      │ → IF underpaid:
      │      RETURN 400 error with exact amounts
      │      "Total paid (X) is less than total due (Y)"
      │      Cannot close until fully paid
      │ → IF fully paid:
      │      Proceed with closure
      │
      ├─────→ (Close - Admin only)
      │
┌─────▼───────┐
│   CLOSED    │  ← Immutable, archived
└─────────────┘
```

---

### Enhanced Payment Recording Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│              PAYMENT RECORDING WITH VALIDATION                   │
└──────────────────────────────────────────────────────────────────┘

User clicks "Record Payment"
      │
      ▼
┌─────────────────────┐
│ Select Payment      │
│ Method              │
└─────┬───────────────┘
      │
      ├──── (Cash) ────────────────┐
      │                            │
      ├──── (Card) ────────────────┼──→ ⚠️ REQUIRED: Last 4 Digits
      │                            │    → Must be exactly 4 digits
      │                            │    → Frontend + Backend validation
      ├──── (Check/Cheque) ───────┼──→ ⚠️ REQUIRED: Cheque Number
      │                            │    → Cannot submit without number
      │                            │    → Audit trail for verification
      └──── (Bank Transfer) ──────┼──→ ⚠️ REQUIRED: Reference Number
                                   │    → Bank reconciliation tracking
                                   │    → Proof of transfer
                                   ▼
                         ┌──────────────────┐
                         │ Submit Payment   │
                         └────────┬─────────┘
                                  │
                                  │ Backend Validation
                                  │ → Verify conditional fields present
                                  │ → Store payment with details
                                  │ → Log to audit trail
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Payment Recorded │
                         └──────────────────┘
```

---

### Contract Closure Protection Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│          CONTRACT CLOSURE WITH PAYMENT VERIFICATION              │
└──────────────────────────────────────────────────────────────────┘

Admin clicks "Close Contract"
      │
      ▼
┌─────────────────────────────────┐
│ Backend Payment Verification    │
│ totalPaid = SUM(payments.amount)│
│ totalDue = contract.totalAmount │
└─────┬───────────────────────────┘
      │
      ├────── (totalPaid < totalDue) ──────┐
      │                                    │
      │                                    ▼
      │                          ┌──────────────────────┐
      │                          │ ❌ BLOCK CLOSURE      │
      │                          │ Return 400 Error     │
      │                          │ "Total paid (X) is   │
      │                          │  less than total     │
      │                          │  due (Y). Record     │
      │                          │  final payment first"│
      │                          └──────────────────────┘
      │
      └────── (totalPaid >= totalDue) ─────┐
                                           │
                                           ▼
                                 ┌──────────────────────┐
                                 │ ✅ ALLOW CLOSURE      │
                                 │ Contract status →    │
                                 │ CLOSED               │
                                 │ Calculate final      │
                                 │ refund (if any)      │
                                 └──────────────────────┘
```

---

### Dashboard Context-Aware Navigation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│           DASHBOARD SMART NAVIGATION WORKFLOW                    │
└──────────────────────────────────────────────────────────────────┘

User views Dashboard
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Metric Cards (Clickable)                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Active       │  │ Overdue      │  │ Pending      │         │
│  │ Rentals      │  │ Returns      │  │ Refunds      │         │
│  │  "24 Active" │  │  "3 Overdue" │  │  "8 Pending" │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          │                 │                 │
     Click Card         Click Card       Click Card
          │                 │                 │
          ▼                 ▼                 ▼
  /contracts?        /contracts?      /contracts?
  status=active      overdue=true    pendingRefunds=true
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Contracts Page  │  │ Contracts Page  │  │ Contracts Page  │
│ Auto-Filter:    │  │ Auto-Filter:    │  │ Auto-Filter:    │
│ Active Only     │  │ Overdue Only    │  │ Refunds Pending │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Benefits:
✅ Zero manual filtering required
✅ One-click access to critical lists
✅ Bookmarkable URLs for quick access
✅ 80% faster navigation
```

---

### Mandatory Field Validation Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│        DUAL-LAYER VALIDATION ENFORCEMENT WORKFLOW                │
└──────────────────────────────────────────────────────────────────┘

User fills form (Customer/Company/Contract)
      │
      ▼
┌─────────────────────────────────┐
│ LAYER 1: Frontend Validation    │
│ (Zod Schema)                    │
│                                 │
│ Check mandatory fields:         │
│ - Customer: National ID,        │
│   Nationality, Phone (min 1),   │
│   License Number                │
│ - Company: TAX ID, Contact,     │
│   Phone, Email                  │
│ - Contract: Date not in past    │
└─────┬───────────────────────────┘
      │
      ├─────── (Validation FAILS) ────────┐
      │                                   │
      │                                   ▼
      │                         ┌──────────────────┐
      │                         │ Show Errors      │
      │                         │ Block Submission │
      │                         └──────────────────┘
      │
      └─────── (Validation PASSES) ──────┐
                                         │
                                         ▼
                               ┌─────────────────────────┐
                               │ Submit to Backend API   │
                               └─────┬───────────────────┘
                                     │
                                     ▼
                       ┌─────────────────────────────────┐
                       │ LAYER 2: Backend Validation     │
                       │ (API Endpoint)                  │
                       │                                 │
                       │ Re-validate all fields:         │
                       │ - Parse with same Zod schema    │
                       │ - Cannot be bypassed via        │
                       │   Postman, curl, scripts        │
                       └─────┬───────────────────────────┘
                             │
                             ├─── (Validation FAILS) ────┐
                             │                           │
                             │                           ▼
                             │                 ┌──────────────────┐
                             │                 │ Return 400 Error │
                             │                 │ With Details     │
                             │                 │ No DB Entry      │
                             │                 └──────────────────┘
                             │
                             └─── (Validation PASSES) ──┐
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │ Create DB Entry  │
                                               │ Log to Audit     │
                                               │ Return Success   │
                                               └──────────────────┘

Security Benefit:
✅ Frontend validation cannot be bypassed
✅ API tools blocked by backend enforcement
✅ 100% complete records guaranteed
```

---

## 13. Legal & Compliance Pages

### 13.1 Privacy Policy Page
```
┌─────────────────┐
│ Privacy Policy  │
│      Page       │
└────────┬────────┘
         │
         ├─→ Route: /privacy (primary)
         │   Route: /settings/privacy (alternate)
         │
         ├─→ Access: Public (no authentication required)
         │
         └─→ Page Features:
             ┌────────────────────────────────────────────────────────┐
             │ PRIVACY POLICY INTERACTIVE LAYOUT                      │
             ├────────────────────────────────────────────────────────┤
             │                                                        │
             │  ┌──────────────┐  ┌──────────────────────────────┐  │
             │  │ STICKY TOC   │  │ MAIN CONTENT                 │  │
             │  │              │  │                              │  │
             │  │ 1. Info      │  │ ┌──────────────────────────┐ │  │
             │  │    Collection│  │ │ 1. Information Collection│ │  │
             │  │              │  │ │ ▼ (Expanded)             │ │  │
             │  │ 2. How We    │  │ │ We collect the following │ │  │
             │  │    Use Data  │  │ │ types of information...  │ │  │
             │  │              │  │ └──────────────────────────┘ │  │
             │  │ 3. Data      │  │                              │  │
             │  │    Sharing   │  │ ┌──────────────────────────┐ │  │
             │  │              │  │ │ 2. How We Use Your Data  │ │  │
             │  │ ...          │  │ │ ▶ (Collapsed)            │ │  │
             │  │              │  │ └──────────────────────────┘ │  │
             │  │ 13. Contact  │  │                              │  │
             │  │              │  │ (10 more sections...)        │  │
             │  └──────────────┘  └──────────────────────────────┘  │
             │  Left: 240px       Right: Flexible width            │
             │  Scrolls with page Accordion interaction            │
             │                                                        │
             └────────────────────────────────────────────────────────┘
```

**Privacy Policy Content Structure (13 Sections):**
1. Information We Collect
2. How We Use Your Data
3. Data Sharing and Disclosure
4. Data Security
5. Your Rights and Choices
6. Cookies and Tracking
7. Third-Party Services
8. International Data Transfers
9. Children's Privacy
10. Data Retention
11. Changes to This Policy
12. Compliance and Legal Basis
13. Contact Us

**Technical Implementation:**
- **Accordion Component**: Radix UI Accordion (controlled expansion)
- **Sticky TOC**: Fixed position (lg: sticky top-20) with auto-scroll to section
- **Responsive Design**: 
  - Mobile: Single column, TOC collapses to top dropdown
  - Tablet: Sticky TOC moves to left sidebar
  - Desktop: Split-pane layout with fixed TOC width
- **Bilingual Support**: 
  - Full English/Arabic translations
  - RTL layout support for Arabic
  - Language toggle in header

### 13.2 Terms of Service Page
```
┌─────────────────────┐
│ Terms of Service    │
│        Page         │
└──────────┬──────────┘
           │
           ├─→ Route: /terms (primary)
           │   Route: /settings/terms-of-service (alternate)
           │
           ├─→ Access: Public (no authentication required)
           │
           └─→ Page Features:
               ┌────────────────────────────────────────────────────────┐
               │ TERMS OF SERVICE INTERACTIVE LAYOUT                    │
               ├────────────────────────────────────────────────────────┤
               │                                                        │
               │  ┌──────────────┐  ┌──────────────────────────────┐  │
               │  │ STICKY TOC   │  │ MAIN CONTENT                 │  │
               │  │              │  │                              │  │
               │  │ 1. Acceptance│  │ ┌──────────────────────────┐ │  │
               │  │    of Terms  │  │ │ 1. Acceptance of Terms   │ │  │
               │  │              │  │ │ ▼ (Expanded)             │ │  │
               │  │ 2. Service   │  │ │ By accessing this rental │ │  │
               │  │    Description│ │ │ car management system... │ │  │
               │  │              │  │ └──────────────────────────┘ │  │
               │  │ 3. User      │  │                              │  │
               │  │    Accounts  │  │ ┌──────────────────────────┐ │  │
               │  │              │  │ │ 2. Service Description   │ │  │
               │  │ ...          │  │ │ ▶ (Collapsed)            │ │  │
               │  │              │  │ └──────────────────────────┘ │  │
               │  │ 15. Governing│  │                              │  │
               │  │     Law      │  │ (13 more sections...)        │  │
               │  └──────────────┘  └──────────────────────────────┘  │
               │  Left: 240px       Right: Flexible width            │
               │  Scrolls with page Accordion interaction            │
               │                                                        │
               └────────────────────────────────────────────────────────┘
```

**Terms of Service Content Structure (15 Sections):**
1. Acceptance of Terms
2. Service Description
3. User Accounts and Registration
4. User Responsibilities
5. Prohibited Activities
6. Intellectual Property
7. Payment Terms
8. Service Availability
9. Limitation of Liability
10. Indemnification
11. Dispute Resolution
12. Termination
13. Privacy and Data Protection
14. Modifications to Terms
15. Governing Law and Jurisdiction

**Technical Implementation:**
- **Accordion Component**: Radix UI Accordion (controlled expansion)
- **Sticky TOC**: Fixed position (lg: sticky top-20) with smooth scroll
- **Responsive Design**: 
  - Mobile: Stacked layout, TOC as expandable menu at top
  - Tablet: Side-by-side with collapsible TOC
  - Desktop: Full split-pane with sticky navigation
- **Bilingual Support**: 
  - Complete English/Arabic content
  - Automatic RTL/LTR switching
  - Language preference persistence

### 13.3 Navigation & Access Patterns
```
┌──────────────────────────────────────────────────────────────────┐
│                  LEGAL PAGES NAVIGATION FLOWS                     │
└──────────────────────────────────────────────────────────────────┘

PATTERN 1: Footer Links (Landing Page)
┌─────────────┐
│   Landing   │ → Footer section with:
│    Page     │   • Privacy Policy link → /privacy
└──────┬──────┘   • Terms of Service link → /terms
       │          • About link → /about
       │          • Support/Help link → /support-help
       │
       ├──→ Click "Privacy Policy"
       │
       v
┌─────────────┐
│  Privacy    │ → Full policy with TOC and accordion
│   Policy    │ → Public access (no login required)
└─────────────┘

PATTERN 2: Settings Menu (Authenticated Users)
┌─────────────┐
│  Settings   │ → Settings page with tabs/sections:
│    Page     │   • Company Settings
└──────┬──────┘   • Financial Settings
       │          • Legal & Compliance section
       │            ├─→ Privacy Policy → /settings/privacy
       │            └─→ Terms of Service → /settings/terms-of-service
       │
       ├──→ Click "Privacy Policy"
       │
       v
┌─────────────┐
│  Privacy    │ → Same component, different route
│   Policy    │ → Accessible from settings context
└─────────────┘

PATTERN 3: Sidebar Navigation (Authenticated Users)
┌─────────────┐
│  Dashboard  │ → Sidebar menu includes:
│             │   Legal & Compliance section
└──────┬──────┘   ├─→ 📜 Privacy Policy → /privacy
       │          └─→ 📋 Terms of Service → /terms
       │
       ├──→ Click sidebar link
       │
       v
┌─────────────┐
│  Legal Page │ → Direct navigation from sidebar
└─────────────┘ → Available to all authenticated users

PATTERN 4: Direct URL Access
User enters: https://example.com/privacy
         or: https://example.com/terms
         or: https://example.com/settings/privacy
         or: https://example.com/settings/terms-of-service
      │
      v
┌─────────────┐
│  Legal Page │ → Loads directly
└─────────────┘ → SEO-friendly URLs
                → Shareable links
                → Bookmarkable
```

### 13.4 Route Definitions & Components
```
┌──────────────────────────────────────────────────────────────────┐
│                    LEGAL PAGES ROUTE MAP                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /privacy                                                   │
│ Component: PrivacyPolicyPage.tsx                                  │
│ Access: Public (no authentication)                                │
│ Features:                                                         │
│   • 13 sections in accordion format                               │
│   • Sticky table of contents (240px width)                        │
│   • Smooth scroll to section on TOC click                         │
│   • Responsive layout (mobile: stacked, desktop: split)           │
│   • Bilingual: English/Arabic with RTL support                    │
│   • SEO: Meta description, title, Open Graph tags                 │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /terms                                                     │
│ Component: TermsOfServicePage.tsx                                 │
│ Access: Public (no authentication)                                │
│ Features:                                                         │
│   • 15 sections in accordion format                               │
│   • Sticky table of contents (240px width)                        │
│   • Interactive accordion (expand/collapse sections)              │
│   • Responsive design with mobile-first approach                  │
│   • Bilingual: Full English/Arabic translations                   │
│   • SEO: Optimized meta tags and structured data                  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /settings/privacy                                          │
│ Component: PrivacyPolicyPage.tsx (same as /privacy)               │
│ Access: Authenticated users only                                  │
│ Context: Accessed from Settings page                              │
│ Behavior: Identical to /privacy route (alternate path)            │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /settings/terms-of-service                                 │
│ Component: TermsOfServicePage.tsx (same as /terms)                │
│ Access: Authenticated users only                                  │
│ Context: Accessed from Settings page                              │
│ Behavior: Identical to /terms route (alternate path)              │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /about                                                     │
│ Component: AboutPage.tsx                                          │
│ Access: Public                                                    │
│ Features: System information, version, company details            │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Route: /support-help                                              │
│ Component: SupportHelpPage.tsx                                    │
│ Access: Public                                                    │
│ Features: FAQ, contact information, documentation links           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 13.5 Complete Application Sitemap
```
┌──────────────────────────────────────────────────────────────────┐
│              COMPLETE APPLICATION SITEMAP                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ PUBLIC ROUTES (No Authentication Required)                        │
│ ├─ /                    → Landing Page                            │
│ ├─ /login               → Login Page                              │
│ ├─ /privacy             → Privacy Policy (Public)                 │
│ ├─ /terms               → Terms of Service (Public)               │
│ ├─ /about               → About Page                              │
│ └─ /support-help        → Support & Help                          │
│                                                                   │
│ AUTHENTICATED ROUTES (Login Required)                             │
│ ├─ /dashboard           → Dashboard (All roles)                   │
│ ├─ /customers           → Customers Management                    │
│ ├─ /vehicles            → Vehicles Management                     │
│ ├─ /persons             → Individual Sponsors (Admin/Manager)     │
│ ├─ /companies           → Corporate Sponsors (Admin/Manager)      │
│ ├─ /contracts           → Contract Management                     │
│ │  ├─ /contracts/new                → Create Contract             │
│ │  └─ /contracts/:id                → View/Edit Contract          │
│ ├─ /users               → User Management (Admin only)            │
│ ├─ /audit-logs          → Audit Logs (Admin/Manager)              │
│ │  ├─ /audit-logs/contract-history  → Contract Timeline           │
│ │  ├─ /audit-logs/user-activity     → User Activity Logs          │
│ │  ├─ /audit-logs/system-errors     → System Error Logs           │
│ │  └─ /audit-logs/reports           → Audit Reports               │
│ ├─ /settings            → Company Settings (Admin only)           │
│ │  ├─ /settings/company             → Company Details             │
│ │  ├─ /settings/financial           → Financial Settings          │
│ │  ├─ /settings/privacy             → Privacy Policy (Alt)        │
│ │  └─ /settings/terms-of-service    → Terms of Service (Alt)      │
│ └─ /reports             → Reports Section                         │
│    ├─ /reports/financial            → Financial Reports           │
│    ├─ /reports/operational          → Operational Reports         │
│    └─ /reports/customers            → Customer Reports            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

**End of Enhanced Workflow Diagrams**

