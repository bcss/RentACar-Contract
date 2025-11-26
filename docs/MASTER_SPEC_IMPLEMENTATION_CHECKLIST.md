# MASTER SYSTEM SPECIFICATION v1.0 — IMPLEMENTATION CHECKLIST

**Created:** November 25, 2025
**Purpose:** Track implementation of every requirement from top to bottom
**Status Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Completed | ❌ Blocked

---

# PART 1 — CORE PRINCIPLES & SYSTEM OVERVIEW

## 1.1 Vision Implementation
- ⬜ Fully digitized contract lifecycle
- ⬜ Real-time operational visibility across all branches
- ⬜ Strong accountability, auditability, and process discipline
- ⬜ Automated notifications, reminders, and payment confirmations
- ⬜ Multi-language (EN/AR) capability in every layer
- ⬜ Scalable architecture ready for future SaaS model

## 1.2 v1 Production Release Scope
- ⬜ Full operational contract lifecycle
- ⬜ OTP-based digital signing (3-minute expiry, rate limiting)
- ⬜ Payment confirmations (mandatory for every payment)
- ⬜ Real-time fleet availability across branches
- ⬜ Vehicle inspections (checkout + return)
- ⬜ Damage detection + incident initiation
- ⬜ Excess collection + deposit application
- ⬜ Branch transfers & maintenance
- ⬜ Operational reports & dashboards
- ⬜ Notification framework with provider fallback
- ⬜ Template engine (contract PDF)
- ⬜ High-performance availability engine
- ⬜ Full audit & no hard delete
- ⬜ Enterprise-grade data model

## 1.3 Core Principles Enforcement
- ⬜ 1. Accuracy First - Strict validation for all operational data
- ⬜ 2. Operational Discipline - Mandatory prerequisites for lifecycle moves
- ⬜ 3. No Hard Deletes - All records permanently preserved
- ⬜ 4. Multi-Branch Intelligence - Branch boundaries with cross-branch rules
- ⬜ 5. Corporate Liability Clarity - Direct/Sponsored/Company enforcement
- ⬜ 6. Multi-Stage Inspections - Checkout before activate, return before complete
- ⬜ 7. OTP-Driven Authorization - Material steps require OTP
- ⬜ 8. Template Engine Reusability - One engine for all docs
- ⬜ 9. Notification First - SMS/Email confirmations for audit
- ⬜ 10. Enterprise Data Model - Future-proof tables
- ⬜ 11. High Availability & Performance - Indexes, caching, optimized queries
- ⬜ 12. Safety & Compliance by Design - Business rules, expiration, insurance

---

# PART 2 — MASTER FEATURE LIST

## 2.1 Contracting Model (Strict)

### Party Types
- ⬜ DIRECT_HIRER: Hirer required, Sponsor MUST BE EMPTY, Company MUST BE EMPTY, OTP from Hirer
- ⬜ SPONSORED_INDIVIDUAL: Hirer required, Sponsor required, Company MUST BE EMPTY, OTP from Sponsor
- ⬜ SPONSORED_COMPANY: Hirer required, Sponsor MUST BE EMPTY, Company required, OTP from Company Signatory
- ⬜ System blocks invalid combinations

## 2.2 Contract Lifecycle

### Contract Statuses
- ⬜ DRAFT status implemented
- ⬜ ACTIVE status implemented
- ⬜ COMPLETED status implemented
- ⬜ COMPLETED_PENDING_ACCIDENT status implemented
- ⬜ CLOSED status implemented
- ⬜ CANCELLED status implemented

### Transition Rules: DRAFT → ACTIVE
- ⬜ Checkout inspection complete required
- ⬜ OTP verified (hirer/sponsor/company) required
- ⬜ Vehicle must be available
- ⬜ Deposit rule satisfied
- ⬜ No blacklist hard-block
- ⬜ Branch must have operational access

### Transition Rules: ACTIVE → COMPLETED
- ⬜ Return inspection complete required
- ⬜ Odometer & fuel recorded required
- ⬜ Damage detection check executed
- ⬜ All charges calculated

### Transition Rules: COMPLETED → CLOSED
- ⬜ No pending incidents required
- ⬜ Settlement complete (balance = 0) required
- ⬜ Deposit returned/adjusted
- ⬜ OTP if configured for closure

### Transition Rules: ACTIVE → CANCELLED
- ⬜ Only possible before vehicle leaves branch

## 2.3 Inspections (Mandatory)

### Checkout Inspection Requirements
- ⬜ Odometer out required
- ⬜ Fuel out required
- ⬜ Vehicle condition required
- ⬜ Observed damages recorded
- ⬜ Photos OR remarks mandatory enforcement

### Return Inspection Requirements
- ⬜ Odometer in required
- ⬜ Fuel in required
- ⬜ Vehicle condition required
- ⬜ Damages (new vs old) comparison
- ⬜ Photos/remarks enforcement

## 2.4 Damage & Incidents

### Damage Detection
- ⬜ New scratches/dents vs checkout detected
- ⬜ Broken parts detected
- ⬜ Tyre damage detected
- ⬜ Windshield damage detected
- ⬜ Other declared damages

### When Damage Found
- ⬜ Contract → COMPLETED_PENDING_ACCIDENT
- ⬜ New incident record created automatically
- ⬜ Excess workflow triggered
- ⬜ Insurance claim created (if applicable)
- ⬜ Incident type classification: Accident, New damage, Theft, Vandalism, Transfer accident, Abandoned vehicle

## 2.5 Insurance Claims & Excess

### Excess Workflow
- ⬜ Excess amount loaded from insurance/tariff
- ⬜ Provisional charge created
- ⬜ Customer notified
- ⬜ Repair amount added later
- ⬜ Final settlement calculated
- ⬜ Deposit auto-applied

### Incident Outcomes
- ⬜ Close with full recovery
- ⬜ Close with partial insurance payout
- ⬜ Write-off rules
- ⬜ Recoverable vs non-recoverable parts

## 2.6 Distance / Fuel / Charges

### Distance Calculation
- ⬜ distance = odoIn - odoOut calculation
- ⬜ Tariff entitlements for free KM
- ⬜ Extra km fees applied

### Fuel Calculation
- ⬜ Price per litre from settings
- ⬜ Fuel difference = extra charge

### Charges Generated By
- ⬜ Tariff (time-based)
- ⬜ Add-ons
- ⬜ Fuel shortage
- ⬜ Extra KM
- ⬜ Damage/incident fees
- ⬜ Penalties
- ⬜ One-way fee
- ⬜ Late return fees

## 2.7 Payments & Deposits

### Payment Methods Supported
- ⬜ Cash
- ⬜ POS card (external)
- ⬜ Bank transfer

### Payment Actions
- ⬜ Multiple payments allowed
- ⬜ Partial payments allowed
- ⬜ Refunds supported
- ⬜ Payment must generate payment confirmation notification

### Deposit Workflow
- ⬜ Pre-auth mode supported (recorded only)
- ⬜ Full-charge mode supported
- ⬜ Applied to charges at closure
- ⬜ Remaining refunded

### Payment Confirmation Includes
- ⬜ Amount
- ⬜ Method
- ⬜ Date
- ⬜ Contract number
- ⬜ Outstanding balance
- ⬜ Mandatory for every payment

## 2.8 Sponsors & Liability

### Sponsor Types
- ⬜ Individual sponsor support
- ⬜ Company sponsor support

### Liability Rules
- ⬜ DIRECT_HIRER → Hirer liable
- ⬜ SPONSORED_INDIVIDUAL → Sponsor liable
- ⬜ SPONSORED_COMPANY → Company liable

## 2.9 Reservation Engine

### Reservation Features
- ⬜ Branch-specific reservations
- ⬜ Cross-branch (HQ view)
- ⬜ Vehicle-based reservation
- ⬜ Vehicle-group based reservation

### Reservation Rules
- ⬜ No overlaps
- ⬜ Reservation expiry grace
- ⬜ Auto-cancel cron
- ⬜ Convert to contract
- ⬜ Deposit optional at reservation stage

## 2.10 Vehicle Operations

### Vehicle Statuses
- ⬜ AVAILABLE status
- ⬜ RESERVED status
- ⬜ OUT status
- ⬜ UNDER_MAINTENANCE status
- ⬜ UNDER_REPAIR status
- ⬜ IN_TRANSFER status
- ⬜ RETIRED status
- ⬜ LOST/STOLEN status

### Vehicle Operations
- ⬜ Assign vehicle
- ⬜ Block for maintenance
- ⬜ Transfer to another branch
- ⬜ Transfer accident management
- ⬜ Arrival check-in workflow

## 2.11 Corporate Accounts

### Corporate Features
- ⬜ Company profile
- ⬜ Company rates
- ⬜ Approved employee list
- ⬜ Fleet creation
- ⬜ Driver change/handover workflow
- ⬜ Monthly statements (provision)

## 2.12 Tariffs & Pricing Engine

### Rate Types
- ⬜ Hourly rates
- ⬜ Daily rates
- ⬜ Weekly rates
- ⬜ Monthly rates

### Pricing Features
- ⬜ Seasonal pricing
- ⬜ Add-ons
- ⬜ Packages
- ⬜ Minimum rental rules
- ⬜ Grace period
- ⬜ Cross-branch pricing
- ⬜ Monthly → Daily downgrade fees

## 2.13 Notifications Engine

### Notification Purposes
- ⬜ OTP
- ⬜ Activation confirmation
- ⬜ Completion confirmation
- ⬜ Payment confirmation
- ⬜ Incident creation
- ⬜ Due reminders
- ⬜ Overdue reminders
- ⬜ Cron failure alerts
- ⬜ Campaign messages

### Notification Channels
- ⬜ SMS
- ⬜ Email
- ⬜ WhatsApp (future provision)

### Provider Fallback
- ⬜ SMS → Secondary SMS → Email logic

## 2.14 Customer / Sponsor Profiles

### Profile Captures
- ⬜ Full name
- ⬜ ID numbers
- ⬜ License details
- ⬜ Expiry alerts
- ⬜ EN/AR preference
- ⬜ Notification preference
- ⬜ Marketing opt-in
- ⬜ DND window

## 2.15 Document Management

### Enabled Now
- ⬜ Contract PDF generation

### Provision-Only
- ⬜ Invoice structure
- ⬜ Receipt structure
- ⬜ Tax invoice structure
- ⬜ Payment confirmation PDF structure
- ⬜ Statement structure
- ⬜ Handover PDF structure
- ⬜ Transfer sheet structure
- ⬜ Accident/incident form structure

### Scanned Documents
- ⬜ Upload scanned signed contract option

## 2.16 Template Engine

### Implemented Now
- ⬜ Contract template
- ⬜ EN/AR support
- ⬜ Pixel-perfect drag/drop
- ⬜ Layered elements
- ⬜ Snap-to-grid
- ⬜ Variable binding
- ⬜ Version history

## 2.17 Cron & Automation

### Cron Tasks
- ⬜ Reservations expiry
- ⬜ Overdue reminders
- ⬜ Risk recalculation
- ⬜ License/ID expiry reminders
- ⬜ Cron failure watch
- ⬜ Import job validation
- ⬜ Availability refresh

## 2.18 Availability Engine

### High-Performance Design
- ⬜ Materialized availability tables
- ⬜ Updated via events
- ⬜ Indexed queries
- ⬜ Full multi-branch real-time view

## 2.19 Dashboards & Reports

### Dashboards
- ⬜ Fleet dashboard
- ⬜ Contracts dashboard
- ⬜ Financial KPIs
- ⬜ Maintenance KPIs

### Reports
- ⬜ Revenue report
- ⬜ Outstanding report
- ⬜ Utilization report
- ⬜ Aging report
- ⬜ Incident summary report

## 2.20 Import Engine

### Import Features
- ⬜ Map old system fields
- ⬜ Pre-validation
- ⬜ Duplicate detection
- ⬜ Partial import
- ⬜ Bulk import
- ⬜ Dry-run mode
- ⬜ Full audit

## 2.23 Security / RBAC

### Roles
- ⬜ Reception role
- ⬜ Supervisor role
- ⬜ Manager role
- ⬜ Admin role
- ⬜ Finance role
- ⬜ HQ Administrator role

### Scope
- ⬜ Branch-limited access
- ⬜ HQ global view

## 2.24 Settings Module

### Settings Categories
- ⬜ Tariff settings
- ⬜ Deposit settings
- ⬜ VAT %
- ⬜ Contract numbering
- ⬜ Template version selection
- ⬜ Provider settings
- ⬜ Notification toggles
- ⬜ Cron toggles

---

# PART 3 — WORKFLOWS

## 3.1 Contract Creation Workflow
- ⬜ Select vehicle
- ⬜ Select party type: DIRECT / SPONSORED INDIVIDUAL / SPONSORED COMPANY
- ⬜ Enforce required party fields
- ⬜ Select tariff plan (daily/weekly/monthly)
- ⬜ Select start date/time (now or future)
- ⬜ Add extras (GPS, baby seat, insurance upgrades)
- ⬜ Add notes (optional)
- ⬜ Compute provisional charges
- ⬜ Save → contract enters DRAFT
- ⬜ Vehicle not blocked yet on draft

## 3.2 Checkout Inspection Workflow
- ⬜ Open DRAFT contract
- ⬜ Begin Checkout Inspection
- ⬜ Require odometer out
- ⬜ Require fuel out
- ⬜ Require photos OR remarks
- ⬜ Capture required images
- ⬜ Enter existing damages
- ⬜ Save → Inspection record created
- ⬜ Inspection type = CHECKOUT

## 3.3 Contract Activation (OTP Workflow)
- ⬜ Click "Activate Contract"
- ⬜ Verify checkout inspection present
- ⬜ Verify deposit rule satisfied
- ⬜ OTP sent based on party type
- ⬜ User enters OTP
- ⬜ OTP validated (3-minute expiry)
- ⬜ OTP rate limiting (3 per 10 min per user)
- ⬜ Contract status → ACTIVE
- ⬜ Vehicle status → OUT
- ⬜ SMS/Email confirmation of activation

## 3.4 Vehicle Delivery Confirmation
- ⬜ Configurable option
- ⬜ Operator marks vehicle left branch
- ⬜ Timestamp stored for audit

## 3.5 Contract Completion Workflow
- ⬜ Operator selects contract → "Mark as Returned"
- ⬜ Return inspection required
- ⬜ System enters COMPLETED state

## 3.6 Return Inspection Workflow
- ⬜ Capture odo-in
- ⬜ Capture fuel-in
- ⬜ Capture new photos
- ⬜ Compare photos with checkout
- ⬜ Prompt operator for new damages
- ⬜ Save inspection

## 3.7 Damage Detection Workflow
- ⬜ Checkout vs return images/remarks diff
- ⬜ If new damage found: auto-create incident
- ⬜ If new damage found: status → COMPLETED_PENDING_ACCIDENT
- ⬜ If no damage: continue to settlement

## 3.8 Incident & Excess Workflow
- ⬜ Incident record created
- ⬜ Operator selects type (accident, new damage, theft, etc.)
- ⬜ System loads insurer excess amount
- ⬜ Provisional excess charge generated
- ⬜ Customer notified
- ⬜ Operator finalizes settlement when repair data arrives
- ⬜ Contract cannot close until incident resolved

## 3.9 Deposit Adjustment Workflow
- ⬜ Compute total charges
- ⬜ Compute deposit received
- ⬜ Compute amount deductible from deposit
- ⬜ Auto-apply deposit
- ⬜ Calculate remaining deposit refund
- ⬜ Create negative payment entry for refund
- ⬜ Send refund confirmation

## 3.10 Balance Clearance Workflow
- ⬜ Outstanding balance shown
- ⬜ Operator records payment(s)
- ⬜ Apply FIFO
- ⬜ Update balance
- ⬜ Send payment confirmation notifications

## 3.11 Contract Closure Workflow
- ⬜ Precondition: No pending incidents
- ⬜ Precondition: Balance = 0
- ⬜ Precondition: Deposits adjusted
- ⬜ Precondition: Return inspection complete
- ⬜ Operator clicks "Close Contract"
- ⬜ OTP (if configured)
- ⬜ Status → CLOSED
- ⬜ Contract becomes read-only

## 3.12 Contract Cancellation Workflow
- ⬜ Allowed only in DRAFT or ACTIVE (before vehicle leaves)
- ⬜ Operator clicks cancel
- ⬜ Select reason
- ⬜ Check vehicle status
- ⬜ Deposit refunded if applicable
- ⬜ Contract → CANCELLED

## 3.13 Extension Workflow
- ⬜ Operator selects new end date/time
- ⬜ Check vehicle availability
- ⬜ Recalculate charges
- ⬜ Amendment record created
- ⬜ OTP optional
- ⬜ Contract duration updated

## 3.14 Early Return Workflow
- ⬜ Customer returns vehicle early
- ⬜ Recalculate charges
- ⬜ Apply minimum rental rule
- ⬜ Apply early return penalty (if configured)
- ⬜ Payment adjustment notification sent

## 3.15 Contract Amendment Workflow
- ⬜ Rate change type
- ⬜ Tariff upgrade/downgrade type
- ⬜ Discount adjustment type
- ⬜ Changing liability party (requires manager)
- ⬜ Each amendment logged in contract_amendments
- ⬜ Reason required
- ⬜ Operator recorded
- ⬜ Timestamp recorded
- ⬜ OTP if material

## 3.16 Vehicle Swap Workflow
- ⬜ Customer requests swap
- ⬜ Return inspection for current vehicle
- ⬜ Checkout inspection for new vehicle
- ⬜ Odometer and fuel reset for segment
- ⬜ Create amendment record
- ⬜ Contract continues with new vehicle

## 3.17 Driver Change / Handover Flow (Corporate)
- ⬜ Corporate admin requests driver change
- ⬜ Return inspection optional
- ⬜ New driver ID/License verified
- ⬜ OTP from company
- ⬜ Driver assigned
- ⬜ Amendment logged

## 3.18 Vehicle Status Transition Model
- ⬜ AVAILABLE → RESERVED allowed
- ⬜ RESERVED → AVAILABLE allowed
- ⬜ RESERVED → OUT allowed
- ⬜ OUT → COMPLETED allowed
- ⬜ OUT → UNDER_REPAIR allowed (incident)
- ⬜ OUT → UNDER_MAINTENANCE allowed
- ⬜ OUT → IN_TRANSFER allowed
- ⬜ IN_TRANSFER → AVAILABLE allowed (destination)
- ⬜ AVAILABLE → RETIRED allowed
- ⬜ System rejects invalid transitions

## 3.19 Maintenance Workflow
- ⬜ Operator creates maintenance job
- ⬜ Vehicle → UNDER_MAINTENANCE
- ⬜ Job details recorded
- ⬜ On completion: Close job
- ⬜ On completion: Vehicle → AVAILABLE

## 3.20 Transfer Workflow
- ⬜ Branch A requests transfer to Branch B
- ⬜ Approval from Branch B
- ⬜ Vehicle → IN_TRANSFER
- ⬜ On arrival: Arrival inspection
- ⬜ On arrival: Vehicle → AVAILABLE @ Branch B
- ⬜ Any damages → transfer incident

## 3.21 Transfer Accident Workflow
- ⬜ Operator logs transfer accident
- ⬜ Incident record created
- ⬜ Responsibility assigned
- ⬜ Excess workflow triggered
- ⬜ Contract NOT affected (independent flow)

## 3.22 Abandoned Vehicle Workflow
- ⬜ Overdue cron flags abnormal delay
- ⬜ Operator attempts contact
- ⬜ After threshold → "Abandoned" status
- ⬜ Police reference number recorded
- ⬜ Insurance informed
- ⬜ Incident opened
- ⬜ Contract held in COMPLETED_PENDING_ACCIDENT

## 3.23 Theft Workflow
- ⬜ Marked as theft incident
- ⬜ Police report mandatory
- ⬜ Damage recovery process starts

## 3.24 Reservation Workflow
- ⬜ Operator creates reservation
- ⬜ Vehicle/group temporarily blocked
- ⬜ Reservation expires via cron if not converted
- ⬜ Convert reservation → DRAFT

## 3.25 Reservation Auto-Expiry Cron
- ⬜ Check expired reservations
- ⬜ Send reminder
- ⬜ Cancel with reason = "Auto-expired"

## 3.26 Availability Reconciliation
- ⬜ Triggered by: Reservation
- ⬜ Triggered by: Cancellation
- ⬜ Triggered by: Activation
- ⬜ Triggered by: Completion
- ⬜ Triggered by: Transfer
- ⬜ Triggered by: Maintenance
- ⬜ Update availability materialized table

## 3.27 Payment Recording Workflow
- ⬜ Operator selects payment method
- ⬜ Inputs amount & reference
- ⬜ Store payment
- ⬜ Update contract balance
- ⬜ Send payment confirmation

## 3.28 Payment Confirmation Flow (Mandatory)
- ⬜ Triggered after: Payment created
- ⬜ Triggered after: Refund created
- ⬜ Triggered after: Deposit collected
- ⬜ Triggered after: Excess paid
- ⬜ Message includes: Amount, Payment type, Balance
- ⬜ Sent via: Email (HTML)
- ⬜ Sent via: SMS (concise)
- ⬜ Logged in notifications table

## 3.29 Refund Workflow
- ⬜ Operator triggers refund
- ⬜ Refund stored as payment with negative amount
- ⬜ Confirmation sent
- ⬜ Contract balance updated

## 3.30 Deposit Workflows
- ⬜ Pre-auth mode (record only)
- ⬜ Charge and track mode
- ⬜ Release/refund mode

## 3.32 Notification Routing Workflow
- ⬜ Internal module triggers notification
- ⬜ NotificationService selects template
- ⬜ Route via preferred channel
- ⬜ Fallback if primary fails
- ⬜ Record delivery status

## 3.33 Provider Fallback Flow
- ⬜ If SMS fails: Try secondary SMS
- ⬜ If SMS fails again: Email
- ⬜ Record fallback reason

## 3.34 Cron Failure Flow
- ⬜ Retry on failure
- ⬜ Mark failure count
- ⬜ If thresholds reached: HTML alert to admins
- ⬜ SMS fallback if email fails

## 3.35 Blacklist Enforcement Flow
- ⬜ Hard block: Block contract creation/activation
- ⬜ Soft block: Manager override required

## 3.36 Soft-Block Override Flow
- ⬜ Operator tries activating contract
- ⬜ Soft block detected
- ⬜ System prompts for manager approval
- ⬜ Approval logged
- ⬜ Activation allowed

## 3.37 Risk Recalculation Flow
- ⬜ Cron recalculates every 24 hours
- ⬜ Risk inputs: Late returns
- ⬜ Risk inputs: Incidents
- ⬜ Risk inputs: Unpaid balances
- ⬜ Risk inputs: ID/license validity
- ⬜ Risk inputs: Blacklist proximity

## 3.38 Import Mapping Flow
- ⬜ Upload CSV/XLS
- ⬜ System maps columns
- ⬜ User confirms mapping

## 3.39 Import Validation Flow
- ⬜ Validate hirers
- ⬜ Validate sponsors
- ⬜ Validate vehicles
- ⬜ Validate contracts
- ⬜ Produce error report

## 3.40 Import Apply Flow
- ⬜ Insert validated rows
- ⬜ Create related entities
- ⬜ Log results

## 3.41 Template Render Workflow
- ⬜ Load template
- ⬜ Load contract data
- ⬜ Resolve variables
- ⬜ Render HTML
- ⬜ Convert to PDF
- ⬜ Save/attach

## 3.42 Template Version Publish Flow
- ⬜ Draft → Published
- ⬜ Only one active version per branch

---

# PART 4 — DATA MODEL (TABLES)

## 4.1 Core / Infrastructure Tables

### 4.1.1 branches
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(32) UNIQUE NOT NULL
- ⬜ name VARCHAR(255) NOT NULL
- ⬜ legal_name VARCHAR(255)
- ⬜ address_line1, address_line2 VARCHAR(255)
- ⬜ city VARCHAR(128)
- ⬜ country VARCHAR(64)
- ⬜ phone VARCHAR(64)
- ⬜ email VARCHAR(128)
- ⬜ timezone VARCHAR(64)
- ⬜ is_hq BOOLEAN DEFAULT FALSE
- ⬜ is_active BOOLEAN DEFAULT TRUE
- ⬜ created_at, updated_at DATETIME

### 4.1.2 users
- ⬜ id BIGINT PK
- ⬜ branch_id BIGINT FK
- ⬜ name VARCHAR(255) NOT NULL
- ⬜ email VARCHAR(255) UNIQUE NOT NULL
- ⬜ phone VARCHAR(64)
- ⬜ password_hash VARCHAR(255)
- ⬜ locale VARCHAR(8) DEFAULT 'en'
- ⬜ is_superadmin BOOLEAN DEFAULT FALSE
- ⬜ is_active BOOLEAN DEFAULT TRUE
- ⬜ last_login_at DATETIME

### 4.1.3 roles
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(64) UNIQUE NOT NULL
- ⬜ name VARCHAR(255) NOT NULL
- ⬜ description VARCHAR(512)

### 4.1.4 role_assignments
- ⬜ id BIGINT PK
- ⬜ user_id BIGINT FK → users
- ⬜ role_id BIGINT FK → roles
- ⬜ branch_id BIGINT FK (branch-scoped)

### 4.1.5 system_settings
- ⬜ id BIGINT PK
- ⬜ scope_type VARCHAR(16) NOT NULL ('GLOBAL', 'BRANCH')
- ⬜ scope_id BIGINT (branch id if BRANCH)
- ⬜ key VARCHAR(128) NOT NULL
- ⬜ value TEXT

## 4.2 Party Data (Customers / Sponsors / Companies)

### 4.2.1 customers
- ⬜ All spec fields with correct data types
- ⬜ risk_score DECIMAL(5,2)
- ⬜ blacklist_status VARCHAR(32) ENUM('NONE','WATCH','SOFT','HARD')
- ⬜ Unique mobile constraint

### 4.2.2 companies
- ⬜ All spec fields with DECIMAL(12,2) for credit_limit
- ⬜ payment_terms_days INT

### 4.2.3 company_contacts (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ company_id BIGINT FK
- ⬜ full_name VARCHAR(255)
- ⬜ email VARCHAR(255)
- ⬜ phone VARCHAR(64)
- ⬜ is_signatory BOOLEAN
- ⬜ is_driver BOOLEAN

### 4.2.4 blacklist_entries (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ subject_type VARCHAR(32) ('CUSTOMER','COMPANY','VEHICLE')
- ⬜ subject_id BIGINT
- ⬜ status VARCHAR(32) ('WATCHLIST','SOFT','HARD')
- ⬜ reason TEXT
- ⬜ created_by BIGINT FK → users
- ⬜ approved_by BIGINT FK → users

## 4.3 Vehicle Master Data

### 4.3.1 vehicle_classes (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(64) UNIQUE NOT NULL
- ⬜ name VARCHAR(255) NOT NULL
- ⬜ description VARCHAR(512)

### 4.3.2 vehicle_groups (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(64) UNIQUE NOT NULL
- ⬜ name VARCHAR(255) NOT NULL
- ⬜ description VARCHAR(512)

### 4.3.3 vehicles
- ⬜ vehicle_class_id BIGINT FK NOT NULL
- ⬜ vehicle_group_id BIGINT FK
- ⬜ plate_number VARCHAR(64) UNIQUE NOT NULL
- ⬜ vin VARCHAR(64) UNIQUE
- ⬜ tank_capacity_litres DECIMAL(6,2)
- ⬜ odometer_current INT
- ⬜ status ENUM('AVAILABLE','RESERVED','OUT','UNDER_MAINTENANCE','UNDER_REPAIR','IN_TRANSFER','RETIRED','LOST_STOLEN')

## 4.4 Contracts & Related

### 4.4.1 contracts
- ⬜ tariff_id BIGINT FK NOT NULL
- ⬜ party_type VARCHAR(32) ENUM
- ⬜ company_contact_id BIGINT FK
- ⬜ original_branch_id BIGINT FK NOT NULL
- ⬜ return_branch_id BIGINT FK
- ⬜ deposit_expected DECIMAL(12,2)
- ⬜ deposit_received DECIMAL(12,2)
- ⬜ deposit_refunded DECIMAL(12,2)
- ⬜ total_charges DECIMAL(12,2)
- ⬜ total_payments_in DECIMAL(12,2)
- ⬜ total_payments_out DECIMAL(12,2)
- ⬜ outstanding_amount DECIMAL(12,2)
- ⬜ has_active_dispute BOOLEAN
- ⬜ has_pending_incident BOOLEAN
- ⬜ otp_activation_verified_at DATETIME
- ⬜ otp_closure_verified_at DATETIME
- ⬜ version INT DEFAULT 1
- ⬜ status ENUM with CANCELLED

### 4.4.2 contract_status_history ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ contract_id VARCHAR FK
- ✅ from_status VARCHAR(35)
- ✅ to_status VARCHAR(35) NOT NULL
- ✅ changed_by VARCHAR FK → users
- ✅ changed_at TIMESTAMP
- ✅ reason TEXT

### 4.4.3 contract_amendments ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ contract_id VARCHAR FK
- ✅ type VARCHAR(64)
- ✅ old_value_json JSONB
- ✅ new_value_json JSONB
- ✅ penalty_amount DECIMAL(12,2)
- ✅ reason TEXT
- ✅ approved_by VARCHAR FK
- ✅ created_by VARCHAR FK
- ✅ requires_approval BOOLEAN
- ✅ approved_at TIMESTAMP

### 4.4.4 contract_charges ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ contract_id VARCHAR FK
- ✅ type VARCHAR(64)
- ✅ description VARCHAR(255)
- ✅ quantity DECIMAL(10,2)
- ✅ unit_price DECIMAL(12,4)
- ✅ amount DECIMAL(12,2) NOT NULL
- ✅ tax_category VARCHAR(64)
- ✅ tax_amount DECIMAL(12,2)
- ✅ is_manual BOOLEAN

### 4.4.5 contract_disputes (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ contract_id BIGINT FK
- ⬜ status VARCHAR(32)
- ⬜ disputed_amount DECIMAL(12,2)
- ⬜ reason TEXT
- ⬜ opened_by BIGINT FK
- ⬜ resolved_by BIGINT FK
- ⬜ outcome VARCHAR(64)

## 4.5 Reservations

### 4.5.1 reservations ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ reservation_number INTEGER UNIQUE
- ✅ branch_id VARCHAR FK
- ✅ contract_id VARCHAR FK (if converted)
- ✅ hirer_id VARCHAR FK
- ✅ vehicle_id VARCHAR FK
- ✅ vehicle_group_id VARCHAR
- ✅ tariff_id VARCHAR FK
- ✅ start_datetime TIMESTAMP
- ✅ end_datetime TIMESTAMP
- ✅ status VARCHAR(32) DEFAULT 'pending'
- ✅ deposit_expected DECIMAL(12,2)
- ✅ deposit_received DECIMAL(12,2)
- ✅ notes TEXT
- ✅ cancellation_reason TEXT

## 4.6 Inspections

### 4.6.1 vehicle_inspections
- ⬜ type ENUM('CHECKOUT','RETURN','TRANSFER_IN','TRANSFER_OUT','MAINTENANCE')
- ⬜ fuel_level DECIMAL(5,2) (0-100 percent)

### 4.6.2 vehicle_inspection_photos
- ⬜ tag ENUM('FRONT','BACK','LEFT','RIGHT','TOP','INTERIOR','OTHER')

## 4.7 Incidents & Claims

### 4.7.1 incidents
- ⬜ vehicle_transfer_id BIGINT FK
- ⬜ type ENUM('ACCIDENT','NEW_DAMAGE','THEFT','ABANDONED','TRANSFER_ACCIDENT')
- ⬜ status ENUM('OPEN','UNDER_REVIEW','CLOSED')
- ⬜ police_report_no VARCHAR(128)

### 4.7.2 insurance_claims
- ⬜ All DECIMAL(12,2) financial fields
- ⬜ status ENUM('OPEN','SUBMITTED','APPROVED','REJECTED','CLOSED')

## 4.8 Payments & Financials

### 4.8.1 payments
- ⬜ method ENUM('CASH','CARD','BANK_TRANSFER')
- ⬜ direction ENUM('IN','OUT')
- ⬜ type ENUM('RENT','DEPOSIT','REFUND','EXCESS','OTHER')
- ⬜ amount DECIMAL(12,2) NOT NULL
- ⬜ reference VARCHAR(128)
- ⬜ status VARCHAR(32)

### 4.8.2 sequences (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ scope_type VARCHAR(16)
- ⬜ scope_id BIGINT
- ⬜ sequence_type VARCHAR(32)
- ⬜ prefix VARCHAR(32)
- ⬜ current_number BIGINT
- ⬜ padding INT DEFAULT 6

## 4.9 Tariffs & Pricing

### 4.9.1 tariffs ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ branch_id VARCHAR FK
- ✅ vehicle_class_id VARCHAR
- ✅ vehicle_group_id VARCHAR
- ✅ name VARCHAR(255)
- ✅ name_ar VARCHAR(255)
- ✅ code VARCHAR(64) UNIQUE
- ✅ rate_hourly DECIMAL(12,2)
- ✅ rate_daily DECIMAL(12,2)
- ✅ rate_weekly DECIMAL(12,2)
- ✅ rate_monthly DECIMAL(12,2)
- ✅ included_km_per_day DECIMAL(10,2)
- ✅ extra_km_rate DECIMAL(12,4)
- ✅ deposit_required BOOLEAN
- ✅ default_deposit DECIMAL(12,2)
- ✅ minimum_rental_hours INT
- ✅ minimum_rental_days INT
- ✅ return_grace_minutes INT DEFAULT 0
- ✅ downgrade_penalty_rate DECIMAL(12,2)
- ✅ is_active BOOLEAN

### 4.9.2 seasonal_tariffs (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ tariff_id BIGINT FK
- ⬜ start_date DATE
- ⬜ end_date DATE
- ⬜ rate_hourly, rate_daily, rate_weekly, rate_monthly DECIMAL(12,2)
- ⬜ extra_km_rate DECIMAL(12,4)

### 4.9.3 addons (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(64)
- ⬜ name VARCHAR(255)
- ⬜ rate_type ENUM('PER_DAY','PER_RENTAL','FLAT')
- ⬜ rate DECIMAL(12,2)
- ⬜ description VARCHAR(512)

### 4.9.4 packages (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ name VARCHAR(255)
- ⬜ description VARCHAR(512)
- ⬜ is_active BOOLEAN

### 4.9.5 package_addons (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ package_id BIGINT FK
- ⬜ addon_id BIGINT FK
- ⬜ quantity DECIMAL(10,2)

## 4.10 Driver Services

### 4.10.2 driver_rate_plans (NEW/UPDATE TABLE)
- ⬜ driver_id BIGINT FK
- ⬜ rate_type ENUM('HOURLY','DAILY','WEEKLY','MONTHLY')
- ⬜ rate_amount DECIMAL(12,2)
- ⬜ internal_cost_rate DECIMAL(12,2)
- ⬜ is_chargeable BOOLEAN

### 4.10.3 contract_drivers
- ⬜ driver_rate_plan_id BIGINT FK

## 4.11 Vehicle Transfers & Maintenance

### 4.11.1 vehicle_transfers
- ⬜ status ENUM('REQUESTED','APPROVED','IN_TRANSIT','COMPLETED','CANCELLED')
- ⬜ responsible_driver_id BIGINT FK

### 4.11.2 maintenance_jobs (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ vehicle_id BIGINT FK
- ⬜ branch_id BIGINT FK
- ⬜ type VARCHAR(64) ('SERVICE','REPAIR','INSPECTION')
- ⬜ description TEXT
- ⬜ status ENUM('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED')
- ⬜ planned_start DATETIME
- ⬜ planned_end DATETIME
- ⬜ actual_start DATETIME
- ⬜ actual_end DATETIME

## 4.12 Availability Engine

### 4.12.1 vehicle_availability_cache (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ vehicle_id BIGINT FK
- ⬜ branch_id BIGINT FK
- ⬜ date DATE
- ⬜ status ENUM('FREE','RESERVED','OUT','MAINTENANCE','TRANSFER','BLOCKED')
- ⬜ source VARCHAR(32)
- ⬜ UNIQUE (vehicle_id, date)

## 4.13 Notifications & OTP

### 4.13.1 communication_providers
- ⬜ Complete per spec

### 4.13.2 notification_purposes (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ code VARCHAR(64) UNIQUE
- ⬜ description VARCHAR(255)

### 4.13.3 notification_routes (NEW TABLE NEEDED)
- ⬜ id BIGINT PK
- ⬜ purpose_id BIGINT FK
- ⬜ channel VARCHAR(32)
- ⬜ branch_id BIGINT FK
- ⬜ primary_provider_id BIGINT FK
- ⬜ secondary_provider_id BIGINT FK
- ⬜ max_retries INT DEFAULT 1

### 4.13.4 otp_logs ✅ CREATED
- ✅ id VARCHAR PK (UUID)
- ✅ contract_id VARCHAR FK
- ✅ purpose VARCHAR(64)
- ✅ channel VARCHAR(32)
- ✅ target VARCHAR(255)
- ✅ otp_hash VARCHAR(255)
- ✅ expires_at TIMESTAMP (3-minute expiry)
- ✅ verified_at TIMESTAMP
- ✅ attempts INT DEFAULT 0

## 4.14 Cron & Import

### 4.14.1 cron_job_definitions (NEW TABLE NEEDED)
- ⬜ Per spec

### 4.14.2 cron_job_executions (NEW TABLE NEEDED)
- ⬜ Per spec

### 4.15.1 import_jobs
- ⬜ Per spec

## 4.16 Documents & Template Engine

### 4.16.1 templates
- ⬜ canvas_definition JSON

### 4.16.2 documents
- ⬜ Per spec

## 4.17 Audit & Logging

### 4.17.1 audit_logs
- ⬜ entity_type VARCHAR(64)
- ⬜ entity_id BIGINT
- ⬜ metadata JSON (before/after values)

---

# PART 5 — VALIDATION RULES (Part 15)

## 15.1 Global Validation Principles
- ⬜ Mandatory vs Optional vs Conditional field classification
- ⬜ State-driven validation (DRAFT=Minimal, ACTIVE=Full, COMPLETE=Post-usage, CLOSED=Final)

## 15.2 Contract Validation

### 15.2.1 Universal Mandatory
- ⬜ hirer_id FK required
- ⬜ vehicle_id FK required
- ⬜ branch_id FK required
- ⬜ start_datetime >= now or planned
- ⬜ end_datetime > start
- ⬜ rate_id FK required
- ⬜ rental_type enum required
- ⬜ free_km >= 0
- ⬜ charges table initialized

### 15.2.2 ACTIVE Stage Mandatory
- ⬜ odometer_start >= vehicle.current_odo validation
- ⬜ fuel_start 0-100 range validation
- ⬜ inspection_photos_start required IF photo_required
- ⬜ remarks_start required IF photos < MIN
- ⬜ OTP verification mandatory
- ⬜ hirer signature mandatory

### 15.2.3 COMPLETION Stage
- ⬜ odometer_end >= start validation
- ⬜ fuel_end 0-100 range validation
- ⬜ inspection_photos_end required IF photo_required
- ⬜ damage detection auto-check
- ⬜ extra_km auto-computed
- ⬜ fuel_difference auto-computed

### 15.2.4 CLOSURE Stage
- ⬜ all charges finalised
- ⬜ outstanding_amount = 0 mandatory BEFORE closure
- ⬜ deposit accounting completed
- ⬜ final signature required (OTP or digital)

## 15.3 Customer & Sponsor Validations

### 15.3.1 Customer (Hirer)
- ⬜ full_name required
- ⬜ mobile_number required, valid regex, unique
- ⬜ id_type required
- ⬜ id_number required
- ⬜ id_expiry >= today validation
- ⬜ license_number required
- ⬜ license_expiry >= today validation
- ⬜ nationality required
- ⬜ blacklist_check required (auto)

### 15.3.2 Sponsor (Individual)
- ⬜ sponsor_full_name required
- ⬜ sponsor_mobile required
- ⬜ sponsor_id_doc required
- ⬜ relationship required

### 15.3.3 Sponsor (Company)
- ⬜ company_id required
- ⬜ authorized_person_name required
- ⬜ authorized_mobile required
- ⬜ trade_license required
- ⬜ payment_terms_days >= 0

## 15.4 Vehicle Validation

### 15.4.1 Vehicle Creation
- ⬜ plate_number required, unique
- ⬜ chassis_number required, unique
- ⬜ make required
- ⬜ model required
- ⬜ year >= 2000
- ⬜ vehicle_class_id required
- ⬜ current_odometer >= 0
- ⬜ branch_id required
- ⬜ status valid enum

### 15.4.2 Rental Eligibility
- ⬜ status = AVAILABLE check
- ⬜ No open maintenance job check
- ⬜ Not in transfer check
- ⬜ Not in accident hold check
- ⬜ Next service not overdue (if setting enabled)
- ⬜ Not blacklisted check

## 15.5 Inspection Validation
- ⬜ min photos required OR remarks required
- ⬜ VIN matches stored VIN
- ⬜ odometer_end >= start
- ⬜ fuel_end in 0-100 range
- ⬜ unreported damage auto-opens incident

## 15.6 Financial Validation

### 15.6.1 Charges
- ⬜ All charge types must exist (no arbitrary)
- ⬜ VAT applied only if enabled
- ⬜ Extra KM charge auto-computed, override needs manager
- ⬜ Fuel charge auto-computed, override needs manager
- ⬜ Discount requires approval (supervisor cannot approve)
- ⬜ Amendments produce charge diff entries

### 15.6.2 Payment Validation
- ⬜ Payment method required (cash/card/bank)
- ⬜ Amount > 0 required
- ⬜ Receipt number auto-generated
- ⬜ Cannot overpay unless allowed
- ⬜ Refund requires linked payment (no free refunds)
- ⬜ Refund <= deposit
- ⬜ Bank transfer requires reference
- ⬜ Payment confirmation notification required

### 15.6.3 Deposit Validation
- ⬜ Deposit >= min deposit amount (per settings)
- ⬜ Deposit type (hold/charge) specified
- ⬜ Deposit refund requires approval

## 15.7 Amendment & Extension Validation
- ⬜ end_datetime_new > previous
- ⬜ vehicle available for extension
- ⬜ extra charges calculated
- ⬜ OTP required for material changes
- ⬜ RATE_CHANGE requires manager approval
- ⬜ VEHICLE_SWAP requires dual inspection
- ⬜ DISCOUNT_ADJUSTMENT requires finance approval if > threshold
- ⬜ DOWNGRADE_RATE applies fine

## 15.8 Maintenance Validation
- ⬜ job_type required
- ⬜ start_planned required
- ⬜ end_planned required
- ⬜ vehicle status → UNDER_MAINTENANCE
- ⬜ cannot start new job if existing active
- ⬜ closing requires actual_end + remarks/document

## 15.9 Transfer Validation
- ⬜ from_branch != to_branch
- ⬜ driver or transport company required
- ⬜ Arrival inspection required
- ⬜ Odometer validated
- ⬜ Damage validation required
- ⬜ status becomes AVAILABLE
- ⬜ Accident during transfer auto-opens incident

## 15.10 Incident Validation
- ⬜ incident_type required
- ⬜ linked contract or vehicle required
- ⬜ photos required
- ⬜ insurance details required if excess applied
- ⬜ incident close requires manager approval

## 15.11 Import Validation
- ⬜ Required core columns checked
- ⬜ No duplicate plates
- ⬜ No duplicate contract numbers
- ⬜ Missing IDs flagged
- ⬜ Old balances validated
- ⬜ Odometer inconsistencies flagged
- ⬜ IMPORT_CONFLICT_POLICY configurable (SKIP/MERGE/OVERWRITE)

## 15.12 Security Validation
- ⬜ Password complexity (length, uppercase, special chars)
- ⬜ Password min 8 chars
- ⬜ Max login attempts enforced
- ⬜ Account lockout after threshold

---

# PART 6 — APPLICATION SERVICES

## Core Services (Per Spec)
- ⬜ ContractLifecycleService
- ⬜ ContractAmendmentService
- ⬜ ContractValidationService
- ⬜ InspectionService
- ⬜ DamageAssessmentService
- ⬜ PaymentService
- ⬜ PaymentNotificationService
- ⬜ DepositService
- ⬜ BillingService
- ⬜ SettlementService
- ⬜ IncidentService
- ⬜ InsuranceClaimService
- ⬜ ExcessSettlementService
- ⬜ TariffService
- ⬜ PricingEngineService
- ⬜ DriverRateService
- ⬜ TemplateService
- ⬜ DocumentRenderService
- ⬜ NotificationService
- ⬜ NotificationRoutingService
- ⬜ NotificationTemplateService
- ⬜ ProviderClientFactory
- ⬜ TransferService
- ⬜ MaintenanceService
- ⬜ VehicleService
- ⬜ VehicleStatusService
- ⬜ ReservationService
- ⬜ AvailabilityService
- ⬜ AvailabilityRebuildService
- ⬜ CronManagerService
- ⬜ CronExecutionService
- ⬜ CronFailureAlertService
- ⬜ ImportService
- ⬜ ImportValidationService
- ⬜ RiskEngineService
- ⬜ BlacklistService
- ⬜ OtpService

---

# PART 7 — SECURITY & RBAC

## Security Requirements
- ⬜ Password hashing (bcrypt/argon2)
- ⬜ Session management
- ⬜ Idle timeout (15 min)
- ⬜ Login lockout after 5 failures (ENFORCED)
- ⬜ 2FA for staff
- ⬜ AES encryption for sensitive data
- ⬜ SHA256 for document integrity
- ⬜ Revoke all sessions capability
- ⬜ Device session logs

## RBAC Enforcement
- ⬜ Reception role permissions
- ⬜ Supervisor role permissions
- ⬜ Manager role permissions
- ⬜ Admin role permissions
- ⬜ Finance role permissions
- ⬜ HQ_ADMIN role permissions
- ⬜ Branch-scoped permissions
- ⬜ HQ global view permissions

## Approval Workflows
- ⬜ Extra KM charge override → Manager approval
- ⬜ Fuel charge override → Manager approval
- ⬜ Discount > threshold → Finance approval
- ⬜ Rate change → Manager approval
- ⬜ Deposit refund → Branch/HQ approval
- ⬜ Incident closure → Manager approval

---

# PART 8 — OTP SYSTEM

## OTP Requirements
- ✅ 3-minute expiry (NOT 5 minutes) - FIXED Nov 26 in otpService.ts
- ✅ Rate limiting: 3 OTPs per 10 min per user - IMPLEMENTED Nov 26
- ✅ Hash storage for OTP - otp_hash column in otp_logs
- ✅ Attempt tracking - attempts column in otp_logs
- ✅ otp_logs table with correct structure - CREATED Nov 25

---

# PART 9 — DATABASE TRANSACTIONS

## Transactional Operations
- ⬜ Contract Activation in transaction
- ⬜ Contract Completion in transaction
- ⬜ Contract Closure in transaction
- ⬜ Payment Recording in transaction
- ⬜ Multi-table updates in transaction
- ⬜ Rollback on failure

---

# PART 10 — FINANCIAL DATA TYPES

## All Financial Fields Must Be DECIMAL(12,2)
- ✅ daily_rate DECIMAL(12,2) (not varchar) - CONVERTED contracts.daily_rate, vehicles.daily_rate
- ✅ weekly_rate DECIMAL(12,2) - CONVERTED vehicles.weekly_rate
- ✅ monthly_rate DECIMAL(12,2) - CONVERTED vehicles.monthly_rate
- ⬜ security_deposit DECIMAL(12,2)
- ✅ total_amount DECIMAL(12,2) - CONVERTED contracts.total_amount
- ⬜ vat_amount DECIMAL(12,2)
- ✅ extra_km_rate DECIMAL(12,4) - CONVERTED contracts.extra_km_rate
- ✅ All payment amounts DECIMAL(12,2) - CONVERTED payments.amount
- ✅ All charge amounts DECIMAL(12,2) - NEW contract_charges table uses DECIMAL

---

# IMPLEMENTATION TRACKING

## Current Phase: Phase 1 - Critical Database Schema
**Started:** November 25, 2025
**Updated:** November 25, 2025

### Priority Order:
1. ✅ Fix all financial field data types (varchar → DECIMAL) - DONE Nov 25
2. ⬜ Add missing contract statuses (CANCELLED)
3. ⬜ Add missing vehicle statuses
4. ✅ Create missing core tables - DONE Nov 25 (6 tables created)
5. ⬜ Add missing contract fields
6. ⬜ Implement validation rules
7. ⬜ Implement approval workflows
8. ✅ Fix OTP parameters - DONE Nov 26 (3-min expiry + rate limiting)
9. ⬜ Add database transactions
10. ⬜ Implement services

### Tables Created (Nov 25, 2025):
- ✅ contract_charges (itemized charges per contract)
- ✅ contract_amendments (track contract changes)
- ✅ contract_status_history (lifecycle transitions)
- ✅ otp_logs (OTP verification with 3-min expiry)
- ✅ tariffs (pricing plans)
- ✅ reservations (bookings before contracts)

### Services Updated (Nov 26, 2025):
- ✅ OTP Service - 3-minute expiry (per Master Spec Part 5.9)
- ✅ OTP Service - Rate limiting 3 per 10 min (per Master Spec Part 8)
- ✅ Storage Layer - Status history tracking on lifecycle transitions

---

**Document Version:** 1.0
**Total Items:** ~500+
**Last Updated:** November 25, 2025
