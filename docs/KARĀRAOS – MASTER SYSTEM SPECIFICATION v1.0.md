# 🚀 **KARĀRAOS – MASTER SYSTEM SPECIFICATION v1.0**

### **No additional files were requested or needed right now.**

The “continue” from you simply means:

👉 **Proceed with generating the full Master System Specification Document (Part 1 onwards).**

So I will now begin.

---

# 🚀 **KARĀRAOS – MASTER SYSTEM SPECIFICATION v1.0**

### **PART 1: TABLE OF CONTENTS**

I will generate **Part 1 → Part 2 → Part 3 → …** in **sequential messages** until the entire mega document is completed.

---

## **TABLE OF CONTENTS**

### **PART 1 — EXECUTIVE SUMMARY & SYSTEM OVERVIEW**

1. Vision & Scope

2. Core Principles

3. High-Level Architecture

4. High-Level Functional Overview

5. Glossary of Terms

### **PART 2 — MASTER FEATURE LIST (DETAILED)**

1. Contracting Model

2. Contract Lifecycle

3. Inspections

4. Damage & Incidents

5. Insurance Claims & Excess

6. Distances, Fuel & Charges

7. Payments & Deposits

8. Sponsors & Liability Model

9. Reservations

10. Vehicle Operations

11. Corporate Accounts

12. Tariffs, Pricing & Rate Management

13. Notifications & Communication

14. Customer & Sponsor Profiles

15. Document Management

16. Template Engine

17. Cron, Automation & Monitoring

18. Availability Engine

19. Reports & Dashboards

20. Import Engine

21. Loyalty / Discounts / Multi-Currency (Provision)

22. Mobile App / Customer Portal

23. Security, RBAC & Audit

24. Settings Module

### **PART 3 — WORKFLOWS & SUB-FLOWS (FULL)**

1. Contract Creation

2. Checkout Inspection

3. Activation (OTP)

4. Completion

5. Return Inspection

6. Incident Detection

7. Excess Workflow

8. Deposit Workflow

9. Payment Confirmation Workflow

10. Amendments

11. Extensions

12. Early Return

13. Vehicle Swap

14. Driver Change

15. Handover (Corporate)

16. Maintenance

17. Transfer

18. Transfer Accident

19. Abandoned Vehicle

20. Theft

21. Blacklist & Watchlist

22. Risk Engine

23. Notification Routing

24. Cron Failure System

25. Import

26. Availability Cache Refresh

27. Template Render

### **PART 4 — DATA MODEL (TABULAR)**

- Tables

- Fields

- Data types

- Null rules

- Defaults

- Constraints

- Relationships

### **PART 5 — DATA MODEL (SQL SCRIPT)**

- Full **CREATE TABLE** scripts for all entities

### **PART 6 — APPLICATION ARCHITECTURE**

- Service Layer

- Domain Layer

- Repository Layer

- Infrastructure Layer

- Inter-service flows

### **PART 7 — MODULE ARCHITECTURE**

- Contract Module

- Inspection Module

- Damage Module

- Payments Module

- Deposit Module

- Notifications Module

- Template Engine

- Availability Engine

- Transfer & Maintenance Module

- Corporate Module

### **PART 8 — NOTIFICATIONS ENGINE**

- Purposes

- Channels

- Provider routing

- Fallback logic

- Template variables

### **PART 9 — TEMPLATE ENGINE ARCHITECTURE**

- Pixel layout editor

- HTML/PDF renderer

- Variable resolver

- Versioning

- Multi-language logic

### **PART 10 — AVAILABILITY ENGINE**

- Realtime model

- Cache tables

- Refresh logic

- Query patterns

### **PART 11 — RISK, BLACKLIST & WATCHLIST**

### **PART 12 — PERFORMANCE & CACHING**

### **PART 13 — SECURITY, RATE LIMITING & AUDIT**

### **PART 14 — VALIDATION MATRIX**

(Every business rule converted into a matrix)

### **PART 15 — SETTINGS MATRIX**

(Every config option defined properly)

### **PART 16 — APPENDICES**

- Diagram legends

- Example template variables

- Notification samples (EN/AR)

- Error codes

# 🚀 **PART 1 — EXECUTIVE SUMMARY & SYSTEM OVERVIEW**

**KarāraOS – Master System Specification v1.0 (Mega Document)**  
*(This is the beginning of the full specification you requested. Parts will follow sequentially.)*

---

# **1.1 Vision & Purpose**

KarāraOS is architected as a **complete operational backbone** for rental car businesses in the UAE/GCC.  
It is designed to replace legacy, paper-based, or fragmented systems with:

- A **fully digitized contract lifecycle**

- Real-time operational visibility across all branches

- Strong accountability, auditability, and process discipline

- Automated notifications, reminders, and payment confirmations

- Multi-language (EN/AR) capability baked into every layer

- Scalable architecture ready for a future SaaS model

KarāraOS is **not merely a contract generator** — it is a full operational engine that manages:

- Vehicles

- Drivers

- Hirers

- Sponsors

- Contracts

- Inspections

- Payments

- Deposits

- Incidents

- Transfers

- Maintenance

- Notifications

- Risk

- Blacklists

- Reports

- Availability

The system is built for **precision, operational discipline, auditability, and future scalability**.

---

# **1.2 Scope of v1 Production Release**

The v1 system includes:

### ✔ Full operational contract lifecycle

### ✔ OTP-based digital signing

### ✔ Payment confirmations (mandatory operational requirement)

### ✔ Real-time fleet availability across branches

### ✔ Vehicle inspections (checkout + return)

### ✔ Damage detection + incident initiation

### ✔ Excess collection + deposit application

### ✔ Branch transfers & maintenance

### ✔ Operational reports & dashboards

### ✔ Notification framework

### ✔ Template engine (contract PDF implemented; others provisioned)

### ✔ High performance cache-based availability engine

### ✔ Full audit & no hard delete

### ✔ Enterprise-grade data model with forward compatibility

**Excluded from v1 (Provision Only):**

- Tax invoices

- Receipts

- Payment confirmation PDF (notifications are implemented)

- Loyalty programs

- Discounts / promo codes

- Multi-currency

- B2C/B2B portal

- Online payment gateway integration

- Mobile app extended features (only read-only v1)

These will be easily enabled later because the architecture fully anticipates them.

---

# **1.3 Core Principles**

KarāraOS is designed around 12 foundational principles:

### **1. Accuracy First**

All operational data must be captured with strict validation.  
Odometer, fuel, inspections, approvals, incidents, deposits — everything is audited.

### **2. Operational Discipline**

Nothing can move through the lifecycle without meeting mandatory prerequisites.

### **3. No Hard Deletes**

Every historical contract, payment, notification, amendment, transfer, or incident is permanently preserved.

### **4. Multi-Branch Intelligence**

Every function respects branch boundaries with explicit rules for cross-branch operations.

### **5. Corporate Liability Clarity**

The system enforces direct vs sponsored vs corporate models strictly.

### **6. Multi-Stage Inspections**

A contract cannot activate without checkout inspection  
A contract cannot complete without return inspection

### **7. OTP-Driven Authorization**

All material steps require OTP confirmation from the correct responsible party.

### **8. Template Engine Reusability**

One engine for ALL future documents.  
Only contract template is enabled in v1, but others are provisioned.

### **9. Notification First**

SMS/Email confirmations ensure transparency and audit readiness.

### **10. Enterprise Data Model**

All tables and relationships anticipate years of feature growth.

### **11. High Availability & Performance**

Availability tables, indexes, caching, and optimized queries ensure speed even with large data volumes.

### **12. Safety & Compliance by Design**

The system enforces business rules, expiration rules, insurance compliance, and contractual liability.

---

# **1.4 High-Level System Overview**

KarāraOS consists of the following high-level modules:

1. **Contract Management Engine**

2. **Vehicle Management**

3. **Hirer/Sponsor/Company Management**

4. **Inspection Engine**

5. **Payment & Deposit Engine**

6. **Damage & Incident Engine**

7. **Claims & Excess Engine**

8. **Tariff & Pricing Engine**

9. **Notifications Engine**

10. **Provider Manager (SMS/Email/WhatsApp)**

11. **Template Engine**

12. **Availability Engine**

13. **Maintenance & Transfer Engine**

14. **Reservation Engine**

15. **Risk & Blacklist Engine**

16. **Operations Dashboard & Reports**

17. **Cron Automation Engine**

18. **Import Engine**

All modules operate under a unified RBAC (Role-Based Access Control) and branch-scoped permission model.

---

# **1.5 High-Level Architecture Diagram (Textual)**

```
┌────────────────────────────┐
│        Presentation         │
│  - Operator Web Portal      │
│  - Mobile App APIs          │
│  - Customer Portal (future) │
└───────────────┬────────────┘
                │
┌───────────────▼────────────────┐
│         Application Layer       │
│ - ContractLifecycleService      │
│ - InspectionService             │
│ - PaymentService                │
│ - PaymentNotificationService    │
│ - IncidentService               │
│ - TariffService                 │
│ - TemplateService               │
│ - NotificationService           │
│ - TransferService               │
│ - MaintenanceService            │
│ - ReservationService            │
│ - AvailabilityService           │
│ - CronManagerService            │
│ - ImportService                 │
│ - RiskService                   │
└────────────────┬───────────────┘
                 │
┌────────────────▼───────────────────┐
│            Domain Layer             │
│ Entities, Aggregates, Repositories │
└─────────────────┬──────────────────┘
                  │
┌─────────────────▼───────────────────┐
│           Infrastructure Layer       │
│ - DB (MySQL/PostgreSQL)              │
│ - Redis Cache                        │
│ - File Storage (Contracts/Scans)     │
│ - Email Providers (SMTP/Gmail/M365)  │
│ - SMS Providers (Twilio/etc.)        │
│ - WhatsApp API (future)              │
└──────────────────────────────────────┘
```

---

# **1.6 Glossary**

| Term            | Meaning                                      |
| --------------- | -------------------------------------------- |
| Hirer           | Person physically renting the vehicle        |
| Sponsor         | Person financially responsible (individual)  |
| Company Sponsor | Corporate entity financially responsible     |
| OTP             | One-Time Password for contract confirmation  |
| Excess          | Insurance-based deductible                   |
| Reservation     | Temporary hold before contract               |
| Amendment       | Official change to an active contract        |
| Availability    | Real-time status of vehicles across branches |

# 🚀 **PART 2 — MASTER FEATURE LIST (DETAILED & EXPANDED)**

*(This is very long. It covers every feature, every rule, every mandatory/optional logic, and all sub-components. This is the foundation for the architecture that follows.)*

---

# **PART 2 — MASTER FEATURE LIST (DETAILED)**

This section defines **EVERY operational, functional, and business capability** of KarāraOS with zero ambiguity.  
It includes **mandatory rules, optional rules, validations, dependencies, and state logic**.

This is the **authoritative specification** for developers, QA, future auditors, and your business stakeholders.

---

# 🔥 **2.0 STRUCTURE OF THIS SECTION**

The detailed feature list is divided into:

1. **Contracting Model**

2. **Contract Lifecycle**

3. **Inspections**

4. **Damage & Incidents**

5. **Claims & Excess**

6. **Distance/Fuel/Charges**

7. **Payments & Deposits**

8. **Sponsors & Liability**

9. **Reservation Engine**

10. **Vehicle Operations**

11. **Corporate Accounts**

12. **Tariffs & Pricing**

13. **Notifications & Communication**

14. **Customer/Sponsor Profiles**

15. **Document Management**

16. **Template Engine**

17. **Cron & Automation**

18. **Availability Engine**

19. **Reports & Dashboards**

20. **Import Engine**

21. **Provision-Only Modules (Loyalty, Discounts, Multi-currency)**

22. **Mobile App / Customer Portal**

23. **Security / RBAC / Audit**

24. **System Settings**

---

# 🔵 **2.1 CONTRACTING MODEL (STRICT)**

KarāraOS supports **three exclusive contract types** with strict rules.

## **A. Direct Hirer (DIRECT_HIRER)**

- Hirer = REQUIRED

- Sponsor (individual) = MUST BE EMPTY

- Sponsoring Company = MUST BE EMPTY

- OTP required from: **HIRER**

## **B. Sponsored Individual (SPONSORED_INDIVIDUAL)**

- Hirer = REQUIRED

- Sponsor (individual) = REQUIRED

- Sponsoring Company = MUST BE EMPTY

- OTP required from: **SPONSOR**

## **C. Sponsored Company (SPONSORED_COMPANY)**

- Hirer = REQUIRED

- Sponsor (individual) = MUST BE EMPTY

- Sponsoring Company = REQUIRED

- OTP required from: **COMPANY SIGNATORY**

**System must block invalid combinations.**

---

# 🔵 **2.2 CONTRACT LIFECYCLE**

### **Statuses**

| Status                     | Meaning                         |
| -------------------------- | ------------------------------- |
| DRAFT                      | Created but not activated       |
| ACTIVE                     | Vehicle is out                  |
| COMPLETED                  | Returned but pending settlement |
| COMPLETED_PENDING_ACCIDENT | Returned with damage            |
| CLOSED                     | Fully settled & archived        |
| CANCELLED                  | Invalidated before activation   |

---

## **2.2.1 TRANSITION RULES**

### **DRAFT → ACTIVE**

Mandatory items:

- Checkout inspection complete

- OTP verified (hirer/sponsor/company)

- Vehicle must be available

- Deposit rule satisfied

- No blacklist hard-block

- Branch must have operational access

### **ACTIVE → COMPLETED**

Mandatory items:

- Return inspection complete

- Odometer & fuel recorded

- Damage detection check executed

- All charges calculated

### **COMPLETED → CLOSED**

Mandatory items:

- No pending incidents

- Settlement complete (balance = 0)

- Deposit returned/adjusted

- OTP if configured for closure

### **ACTIVE → CANCELLED**

Only possible **before vehicle leaves branch**.

---

# 🔵 **2.3 INSPECTIONS (MANDATORY)**

KarāraOS requires **two inspections per contract**:

1. **Checkout Inspection** (START)

2. **Return Inspection** (END)

### **Checkout Inspection Must Include:**

- Odometer out

- Fuel out

- Vehicle condition

- Observed damages

- Photos (if missing → remarks mandatory)

### **Return Inspection Must Include:**

- Odometer in

- Fuel in

- Vehicle condition

- Damages (new vs old)

- Photos/remarks enforcement

---

# 🔵 **2.4 DAMAGE & INCIDENTS**

### Damage detected when:

- New scratches/dents vs checkout

- Broken parts

- Tyre damage

- Windshield damage

- Other declared damages

### When damage is found:

- Contract → COMPLETED_PENDING_ACCIDENT

- New incident record created

- Excess workflow triggered

- Insurance claim (if applicable) created

- Operator must classify incident type:
  
  - Accident
  
  - New damage
  
  - Theft
  
  - Vandalism
  
  - Transfer accident
  
  - Abandoned vehicle

---

# 🔵 **2.5 INSURANCE CLAIMS & EXCESS**

### Excess workflow:

- Excess amount loaded from insurance/tariff

- Provisional charge created

- Customer notified

- Repair amount added later

- Final settlement calculated

- Deposit can be applied automatically

### Incident outcomes:

- Close with full recovery

- Close with partial insurance payout

- Write-off rules

- Recoverable vs non-recoverable parts

---

# 🔵 **2.6 DISTANCE / FUEL / CHARGES**

### Distance:

- `distance = odoIn - odoOut`

- Tariff entitlements for free KM

- Extra km fees applied

### Fuel:

- Price per litre

- Fuel difference = extra charge

### Charges generated by:

- Tariff (time-based)

- Add-ons

- Fuel

- Extra KM

- Damage/incident fees

- Penalties

- One-way fee

- Late return fees

---

# 🔵 **2.7 PAYMENTS & DEPOSITS**

### Payment supported methods:

- Cash

- POS card (external)

- Bank transfer

### Payment actions:

- Multiple payments allowed

- Partial payments allowed

- Refunds supported

- Payment must generate **payment confirmation notification**

### Deposit workflow:

- Pre-auth or full-charge mode (recorded only)

- Applied to charges at closure

- Remaining refunded

### Payment confirmation includes:

- Amount

- Method

- Date

- Contract number

- Outstanding balance

Mandatory for **every payment**.

---

# 🔵 **2.8 SPONSORS & LIABILITY**

### Sponsor Types:

- Individual

- Company

### Sponsor applies when:

- Hirer is not financially responsible

### Liability rules:

- DIRECT_HIRER → Hirer liable

- SPONSORED_INDIVIDUAL → Sponsor liable

- SPONSORED_COMPANY → Company liable

---

# 🔵 **2.9 RESERVATION ENGINE**

Reservations can be:

- Branch-specific

- Cross-branch (HQ view)

- Vehicle or vehicle-group based

Rules:

- No overlaps

- Reservation expiry grace

- Auto-cancel cron

- Convert to contract

- Deposit optional at reservation stage

---

# 🔵 **2.10 VEHICLE OPERATIONS**

### Vehicle states:

- AVAILABLE

- RESERVED

- OUT

- UNDER_MAINTENANCE

- UNDER_REPAIR

- IN_TRANSFER

- RETIRED

### Operations:

- Assign vehicle

- Block for maintenance

- Transfer to another branch

- Transfer accident management

- Arrival check-in workflow

---

# 🔵 **2.11 CORPORATE ACCOUNTS**

### Features:

- Company profile

- Company rates

- Approved employee list

- Fleet creation

- Driver change/handover workflow

- Monthly statements (provision only)

---

# 🔵 **2.12 TARIFFS & PRICING ENGINE**

### Types:

- Hourly / Daily / Weekly / Monthly

- Seasonal pricing

- Add-ons

- Packages

- Minimum rental rules

- Grace period

- Cross-branch pricing

- Monthly → Daily downgrade fees

### Dynamic pricing:

- **Provision-only**  
  (Not implemented but architecture supports.)

---

# 🔵 **2.13 NOTIFICATIONS ENGINE**

Purposes:

- OTP

- Activation

- Completion

- Payment confirmation

- Incident creation

- Due reminders

- Overdue reminders

- Cron failure alerts

- Campaign messages

Channels:

- SMS

- Email

- WhatsApp (future)

Provider fallback logic (SMS → Secondary SMS → Email).

---

# 🔵 **2.14 CUSTOMER / SPONSOR PROFILES**

### Captures:

- Full name

- ID numbers

- License details

- Expiry alerts

- EN/AR preference

- Notification preference

- Marketing opt-in

- DND window

---

# 🔵 **2.15 DOCUMENT MANAGEMENT**

### Enabled now:

- Contract PDF only

### Provision-only:

- Invoice

- Receipt

- Tax invoice

- Payment confirmation PDF

- Statement

- Handover PDF

- Transfer sheet

- Accident/incident form

### Scanned Documents:

- Option to upload scanned signed contract

---

# 🔵 **2.16 TEMPLATE ENGINE**

### Implemented now:

- Contract

- EN/AR

- Pixel-perfect drag/drop

- Layered elements

- Snap-to-grid

- Variable binding

- Version history

### Provision-only:

- Templates for invoices/receipts/etc.

---

# 🔵 **2.17 CRON & AUTOMATION**

Cron tasks:

- Reservations expiry

- Overdue reminders

- Risk recalc

- License/ID expiry reminders

- Cron failure watch

- Import job validation

- Availability refresh

---

# 🔵 **2.18 AVAILABILITY ENGINE**

### High-performance design:

- Materialized availability tables

- Updated via events

- Indexed queries

- Full multi-branch real-time view

---

# 🔵 **2.19 DASHBOARDS & REPORTS**

Dashboards:

- Fleet

- Contracts

- Financial KPIs

- Maintenance KPIs

Reports:

- Revenue

- Outstanding

- Utilization

- Aging

- Incident summary

---

# 🔵 **2.20 IMPORT ENGINE**

### Features:

- Map old system fields

- Pre-validation

- Duplicate detection

- Partial import

- Bulk import

- Dry-run mode

- Full audit

---

# 🔵 **2.21 PROVISION-ONLY MODULES**

### Future:

- Loyalty

- Discounts

- Multi-currency

- B2C portal

- Online payments

---

# 🔵 **2.22 MOBILE APP / PORTAL**

### v1:

- Read-only access

- Assigned contracts

- Driver view

### Future:

- Full user portal

---

# 🔵 **2.23 SECURITY / RBAC**

### Roles:

- Reception

- Supervisor

- Manager

- Admin

- Finance

- HQ Administrator

Scope:

- Branch-limited

- HQ global view

---

# 🔵 **2.24 SETTINGS MODULE**

Contains:

- Tariff settings

- Deposit settings

- VAT %

- Contract numbering

- Template version selection

- Provider settings

- Notification toggles

- Cron toggles

# 🚀 **PART 3 — FULL WORKFLOWS & SUB-FLOWS (EXTREMELY DETAILED)**

This is the **operational heart** of KarāraOS.  
Every flow below is written as:

- **Objective**

- **Actors**

- **Pre-conditions**

- **Post-conditions**

- **Main flow** (step-by-step)

- **Exception flows**

- **Notifications & validations**

- **Data affected**

- **Status changes**

This ensures **zero ambiguity** for developers, QA, and auditors.

---

# 🧩 **3.0 WORKFLOW INDEX**

### **Contracting Workflows**

3.1 Contract Creation  
3.2 Contract Checkout Inspection  
3.3 Contract Activation (OTP)  
3.4 Vehicle Delivery & Operator Confirmation  
3.5 Contract Completion  
3.6 Return Inspection  
3.7 Damage Detection  
3.8 Excess & Insurance Incident Workflow  
3.9 Deposit Adjustment Workflow  
3.10 Balance Clearance Workflow  
3.11 Final Contract Closure  
3.12 Contract Cancellation  
3.13 Renewal & Extension Workflow  
3.14 Early Return Workflow  
3.15 Contract Amendment Workflow  
3.16 Contract Vehicle Swap  
3.17 Driver Change / Handover (Corporate)

### **Vehicle & Operational Workflows**

3.18 Vehicle Status Transition Model  
3.19 Maintenance Workflow  
3.20 Transfer Workflow  
3.21 Transfer Accident Workflow  
3.22 Abandoned/Unreturned Vehicle Workflow  
3.23 Theft Workflow

### **Reservation & Availability Workflows**

3.24 Reservation Creation  
3.25 Reservation Auto-Expiry Cron Flow  
3.26 Availability Reconciliation Flow

### **Payments & Financial Workflows**

3.27 Payment Recording  
3.28 Payment Confirmation Flow  
3.29 Refund Flow  
3.30 Deposit Flow (Hold/Charge/Release)  
3.31 Excess Payment Flow

### **Notification Workflows**

3.32 Notification Routing Flow  
3.33 Provider Fallback Flow  
3.34 Cron Failure Alert Flow

### **Risk & Blacklist Workflows**

3.35 Blacklist Enforcement Flow  
3.36 Soft-Block Override Flow  
3.37 Risk Recalculation Flow

### **Data Import Workflows**

3.38 Import Mapping Flow  
3.39 Import Validation Flow  
3.40 Import Apply Flow

### **Template Engine Workflows**

3.41 Contract Template Rendering Flow  
3.42 Template Version Publish Flow

### **Mobile App / Portal Workflows**

3.43 Mobile Contract Sync  
3.44 Assigned Driver View Flow

---

# 🔵 **3.1 CONTRACT CREATION WORKFLOW**

### **Objective**

Create a new rental contract in DRAFT state.

### **Actors**

Operator, Supervisor

### **Pre-conditions**

- Hirer exists

- Sponsor/company (if required) exists

- Vehicle exists

- Tariff selected

### **Main Flow**

1. Operator selects vehicle

2. Select party type: DIRECT / SPONSORED INDIVIDUAL / SPONSORED COMPANY

3. System enforces required party fields

4. Select tariff plan (daily/weekly/monthly)

5. Select start date/time (now or future)

6. Add extras (GPS, baby seat, insurance upgrades)

7. Add notes (optional)

8. System computes provisional charges

9. Save → contract enters **DRAFT**

### **Post-conditions**

- Contract saved with status DRAFT

- Vehicle not blocked yet

### **Exceptions**

- Invalid party settings → error

- Vehicle not available → error

---

# 🔵 **3.2 CHECKOUT INSPECTION WORKFLOW**

### **Objective**

Record vehicle condition before handing over.

### **Main Flow**

1. Operator opens DRAFT contract

2. Begins **Checkout Inspection**

3. System requires:
   
   - Odometer out
   
   - Fuel out
   
   - Photos OR remarks

4. Operator captures required images

5. Operator enters existing damages

6. Save → Inspection record created

### **Post-conditions**

- Inspection type = CHECKOUT

- Mandatory before activation

### **Exceptions**

- Missing mandatory fields → block activation

---

# 🔵 **3.3 CONTRACT ACTIVATION (OTP WORKFLOW)**

### **Objective**

Digitally sign and activate the contract.

### **Main Flow**

1. Operator clicks “Activate Contract”

2. System verifies:
   
   - Checkout inspection present
   
   - Deposit rule satisfied

3. OTP sent based on party type

4. User enters OTP

5. OTP validated

6. Contract status → **ACTIVE**

7. Vehicle status → **OUT**

### **Notifications**

- SMS/Email confirmation of activation

### **Exceptions**

- OTP failure → cannot activate

- Deposit missing → cannot activate

---

# 🔵 **3.4 VEHICLE DELIVERY CONFIRMATION**

Optional (configurable).

- Operator marks that vehicle has left the branch physically.

- Timestamp stored for audit.

---

# 🔵 **3.5 CONTRACT COMPLETION WORKFLOW**

Triggered when customer returns vehicle.

### **Main Flow**

1. Operator selects contract → “Mark as Returned”

2. Return inspection required

3. System enters COMPLETED state (temporary)

### **Mandatory Checks**

- Return inspection

- Odometer in

- Fuel in

---

# 🔵 **3.6 RETURN INSPECTION WORKFLOW**

### **Main Flow**

1. Capture odo-in

2. Capture fuel-in

3. Capture new photos

4. System compares photos with checkout

5. System prompts operator for new damages

6. Save inspection

### **Post-conditions**

- Comparison engine triggered

- Damage workflow evaluated

---

# 🔵 **3.7 DAMAGE DETECTION WORKFLOW**

### **Main Flow**

1. Checkout vs return images/remarks diff

2. If new damage found:
   
   - Auto-create incident
   
   - Status → COMPLETED_PENDING_ACCIDENT

3. If no damage:
   
   - Continue to settlement

### **Validations**

- Must log at least one damage type if operator flags any damage.

---

# 🔵 **3.8 INCIDENT & EXCESS WORKFLOW**

### **Main Flow**

1. Incident record created

2. Operator selects type (accident, new damage, theft, etc.)

3. System loads insurer excess amount

4. Provisional excess charge generated

5. Customer notified

6. Operator finalizes settlement when repair data arrives

7. Contract cannot close until incident resolved

---

# 🔵 **3.9 DEPOSIT ADJUSTMENT WORKFLOW**

### **Main Flow**

1. System computes:
   
   - Total charges
   
   - Deposit received
   
   - Amount deductible from deposit

2. Auto-applies deposit

3. Calculates remaining deposit refund

4. Creates negative payment entry for refund

5. Sends refund confirmation

---

# 🔵 **3.10 BALANCE CLEARANCE WORKFLOW**

### **Main Flow**

1. Outstanding balance shown

2. Operator records payment(s)

3. System:
   
   - Applies FIFO
   
   - Updates balance
   
   - Sends **payment confirmation notifications**

---

# 🔵 **3.11 CONTRACT CLOSURE WORKFLOW**

Preconditions:

- No pending incidents

- Balance = 0

- Deposits adjusted

- Return inspection complete

### **Main Flow**

1. Operator clicks “Close Contract”

2. OTP (if configured)

3. Status → **CLOSED**

4. Contract becomes read-only

---

# 🔵 **3.12 CONTRACT CANCELLATION WORKFLOW**

Allowed only in DRAFT or ACTIVE (before vehicle leaves).

Steps:

1. Operator clicks cancel

2. Select reason

3. System checks vehicle status

4. Deposit refunded if applicable

5. Contract → CANCELLED

---

# 🔵 **3.13 EXTENSION WORKFLOW**

### **Main Flow**

1. Operator selects new end date/time

2. System checks vehicle availability

3. Recalculates charges

4. Amendment record created

5. OTP optional

6. Contract duration updated

---

# 🔵 **3.14 EARLY RETURN WORKFLOW**

### **Main Flow**

1. Customer returns vehicle early

2. System:
   
   - Recalculates charges
   
   - Applies minimum rental rule
   
   - Applies early return penalty (if configured)

3. Payment adjustment notification sent

---

# 🔵 **3.15 CONTRACT AMENDMENT WORKFLOW**

Types:

- Rate change

- Tariff upgrade/downgrade

- Discount adjustment

- Changing liability party (rare; requires manager)

### **Flow**

Each amendment is logged in `contract_amendments`.

All amendments require:

- Reason

- Operator

- Timestamp

- OTP if material

---

# 🔵 **3.16 VEHICLE SWAP WORKFLOW**

### **Main Flow**

1. Customer requests swap

2. Return inspection for current vehicle

3. Checkout inspection for new vehicle

4. Odometer and fuel reset for segment

5. System creates amendment record

6. Contract continues with new vehicle

---

# 🔵 **3.17 DRIVER CHANGE / HANDOVER FLOW (CORPORATE)**

### **Main Flow**

1. Corporate admin requests driver change

2. Return inspection optional

3. New driver ID/License verified

4. OTP from company

5. Driver assigned

6. Amendment logged

---

# 🔵 **3.18 VEHICLE STATUS TRANSITION MODEL**

Allowed transitions:

```
AVAILABLE → RESERVED  
RESERVED → AVAILABLE  
RESERVED → OUT  
OUT → COMPLETED  
OUT → UNDER_REPAIR (incident)  
OUT → UNDER_MAINTENANCE  
OUT → IN_TRANSFER  
IN_TRANSFER → AVAILABLE (destination)  
AVAILABLE → RETIRED
```

System rejects invalid transitions.

---

# 🔵 **3.19 MAINTENANCE WORKFLOW**

### **Main Flow**

1. Operator creates maintenance job

2. Vehicle → UNDER_MAINTENANCE

3. Job details recorded

4. On completion:
   
   - Close job
   
   - Vehicle → AVAILABLE

---

# 🔵 **3.20 TRANSFER WORKFLOW**

### **Main Flow**

1. Branch A requests transfer to Branch B

2. Approval from Branch B

3. Vehicle → IN_TRANSFER

4. On arrival:
   
   - Arrival inspection
   
   - Vehicle → AVAILABLE @ Branch B
   
   - Any damages → transfer incident

---

# 🔵 **3.21 TRANSFER ACCIDENT WORKFLOW**

If vehicle is damaged between branches:

1. Operator logs transfer accident

2. Incident record created

3. Responsibility assigned

4. Excess workflow triggered

5. Contract NOT affected (independent flow)

---

# 🔵 **3.22 ABANDONED VEHICLE WORKFLOW**

Triggered when customer does not return vehicle.

Flow:

1. Overdue cron flags abnormal delay

2. Operator attempts contact

3. After threshold → “Abandoned” status

4. Police reference number recorded

5. Insurance informed

6. Incident opened

7. Contract held in COMPLETED_PENDING_ACCIDENT

---

# 🔵 **3.23 THEFT WORKFLOW**

Similar to abandoned vehicle, but marked as theft incident.

Branch operations:

- Police report mandatory

- Damage recovery process starts

---

# 🔵 **3.24 RESERVATION WORKFLOW**

### **Main Flow**

1. Operator creates reservation

2. Vehicle/group temporarily blocked

3. Reservation expires via cron if not converted

4. Convert reservation → DRAFT

---

# 🔵 **3.25 RESERVATION AUTO-EXPIRY CRON**

Cron checks:

- Expired reservations

- Sends reminder

- Then cancels with reason = “Auto-expired”

---

# 🔵 **3.26 AVAILABILITY RECONCILIATION**

Triggered by:

- Reservation

- Cancellation

- Activation

- Completion

- Transfer

- Maintenance

System updates availability materialized table.

---

# 🔵 **3.27 PAYMENT RECORDING WORKFLOW**

### **Main Flow**

1. Operator selects payment method

2. Inputs amount & reference

3. System:
   
   - Stores payment
   
   - Updates contract balance
   
   - Sends **payment confirmation**

---

# 🔵 **3.28 PAYMENT CONFIRMATION FLOW (MANDATORY)**

Triggered after:

- Payment created

- Refund created

- Deposit collected

- Excess paid

Message includes:

- Amount

- Payment type

- Balance

Sent via:

- Email (HTML)

- SMS (concise)

Logged in notifications table.

---

# 🔵 **3.29 REFUND WORKFLOW**

Flow:

1. Operator triggers refund

2. Refund stored as payment with negative amount

3. Confirmation sent

4. Contract balance updated

---

# 🔵 **3.30 DEPOSIT WORKFLOWS**

Modes:

- Pre-auth (record only)

- Charge and track

- Release/refund

Flow as earlier described.

---

# 🔵 **3.31 EXCESS PAYMENT WORKFLOW**

Integrated with incident.

---

# 🔵 **3.32 NOTIFICATION ROUTING WORKFLOW**

### **Main Flow**

1. Internal module triggers notification

2. NotificationService selects template

3. Route via preferred channel

4. Fallback if primary fails

5. Record delivery status

---

# 🔵 **3.33 PROVIDER FALLBACK FLOW**

If SMS fails:

1. Try secondary SMS

2. If SMS fails again → email

3. Record fallback reason

---

# 🔵 **3.34 CRON FAILURE FLOW**

If cron job fails:

1. Retry

2. Mark failure count

3. If thresholds reached:
   
   - HTML alert to admins
   
   - SMS fallback if email fails

---

# 🔵 **3.35 BLACKLIST ENFORCEMENT FLOW**

### Hard block:

- Block contract creation/activation

### Soft block:

- Manager override required

---

# 🔵 **3.36 SOFT-BLOCK OVERRIDE FLOW**

1. Operator tries activating contract

2. Soft block detected

3. System prompts for manager approval

4. Approval logged

5. Activation allowed

---

# 🔵 **3.37 RISK RECALCULATION FLOW**

Cron recalculates every 24 hours.

Risk inputs:

- Late returns

- Incidents

- Unpaid balances

- ID/license validity

- Blacklist proximity

---

# 🔵 **3.38 IMPORT MAPPING FLOW**

1. Upload CSV/XLS

2. System maps columns

3. User confirms mapping

---

# 🔵 **3.39 IMPORT VALIDATION FLOW**

1. Validate hirers

2. Validate sponsors

3. Validate vehicles

4. Validate contracts

5. Produce error report

---

# 🔵 **3.40 IMPORT APPLY FLOW**

1. Insert validated rows

2. Create related entities

3. Log results

---

# 🔵 **3.41 TEMPLATE RENDER WORKFLOW**

1. Load template

2. Load contract data

3. Resolve variables

4. Render HTML

5. Convert to PDF

6. Save/attach

---

# 🔵 **3.42 TEMPLATE VERSION PUBLISH FLOW**

Strict versioning:

- Draft → Published

- Only one active version allowed per branch

---

# 🔵 **3.43 MOBILE CONTRACT SYNC**

Returns:

- Assigned contract list

- Customer view

- Driver details

- Read-only

---

# 🔵 **3.44 DRIVER-ASSIGNED VIEW**

Shows:

- Driver details

- Contract

- Vehicle details

# 🚀 PART 4 – DATA MODEL (TABULAR SCHEMA)

## 4.0 Conventions

- `id` = BIGINT (PK, auto-increment) unless stated otherwise

- `created_at`, `updated_at` = DATETIME (or TIMESTAMP)

- `is_active` = BOOLEAN with default TRUE where relevant

- Foreign keys listed as `<entity>_id`

- Currency: `'AED'` for v1 but table supports multi-currency later

- Soft delete: `deleted_at` nullable on selected tables (but we won’t hard delete anyway)

---

## 4.1 CORE / INFRASTRUCTURE TABLES

### 4.1.1 `branches`

| Column        | Type         | Null | Default | Description                    |
| ------------- | ------------ | ---- | ------- | ------------------------------ |
| id            | BIGINT       | NO   |         | Primary key                    |
| code          | VARCHAR(32)  | NO   |         | Unique branch code             |
| name          | VARCHAR(255) | NO   |         | Branch display name            |
| legal_name    | VARCHAR(255) | YES  | NULL    | Legal entity name if different |
| address_line1 | VARCHAR(255) | YES  | NULL    | Address line 1                 |
| address_line2 | VARCHAR(255) | YES  | NULL    | Address line 2                 |
| city          | VARCHAR(128) | YES  | NULL    | City                           |
| country       | VARCHAR(64)  | YES  | NULL    | Country (e.g., 'UAE')          |
| phone         | VARCHAR(64)  | YES  | NULL    | Branch contact                 |
| email         | VARCHAR(128) | YES  | NULL    | Branch email                   |
| timezone      | VARCHAR(64)  | YES  | NULL    | Timezone ID                    |
| is_hq         | BOOLEAN      | NO   | FALSE   | Whether branch is HQ           |
| is_active     | BOOLEAN      | NO   | TRUE    | Active flag                    |
| created_at    | DATETIME     | NO   |         | Created timestamp              |
| updated_at    | DATETIME     | NO   |         | Updated timestamp              |

---

### 4.1.2 `users`

| Column        | Type         | Null | Default | Description                       |
| ------------- | ------------ | ---- | ------- | --------------------------------- |
| id            | BIGINT       | NO   |         | Primary key                       |
| branch_id     | BIGINT       | YES  | NULL    | Default branch (if branch-scoped) |
| name          | VARCHAR(255) | NO   |         | Full name                         |
| email         | VARCHAR(255) | NO   |         | Unique email                      |
| phone         | VARCHAR(64)  | YES  | NULL    | Phone number                      |
| password_hash | VARCHAR(255) | NO   |         | Hashed password                   |
| locale        | VARCHAR(8)   | YES  | 'en'    | UI language ('en','ar')           |
| is_superadmin | BOOLEAN      | NO   | FALSE   | Global admin                      |
| is_active     | BOOLEAN      | NO   | TRUE    | Active flag                       |
| created_at    | DATETIME     | NO   |         | Created                           |
| updated_at    | DATETIME     | NO   |         | Updated                           |
| last_login_at | DATETIME     | YES  | NULL    | Last login                        |

---

### 4.1.3 `roles`

| Column      | Type         | Null | Default | Description                  |
| ----------- | ------------ | ---- | ------- | ---------------------------- |
| id          | BIGINT       | NO   |         | Primary key                  |
| code        | VARCHAR(64)  | NO   |         | e.g., 'RECEPTION', 'MANAGER' |
| name        | VARCHAR(255) | NO   |         | Role name                    |
| description | VARCHAR(512) | YES  | NULL    | Role description             |
| created_at  | DATETIME     | NO   |         | Created                      |
| updated_at  | DATETIME     | NO   |         | Updated                      |

---

### 4.1.4 `role_assignments`

| Column     | Type     | Null | Default | Description                |
| ---------- | -------- | ---- | ------- | -------------------------- |
| id         | BIGINT   | NO   |         | Primary key                |
| user_id    | BIGINT   | NO   |         | FK → users                 |
| role_id    | BIGINT   | NO   |         | FK → roles                 |
| branch_id  | BIGINT   | YES  | NULL    | When role is branch-scoped |
| created_at | DATETIME | NO   |         | Created                    |

---

### 4.1.5 `system_settings`

Global + branch-scoped configs in key/value.

| Column     | Type         | Null | Default | Description                             |
| ---------- | ------------ | ---- | ------- | --------------------------------------- |
| id         | BIGINT       | NO   |         | PK                                      |
| scope_type | VARCHAR(16)  | NO   |         | 'GLOBAL' or 'BRANCH'                    |
| scope_id   | BIGINT       | YES  | NULL    | Branch id if scope=BRANCH               |
| key        | VARCHAR(128) | NO   |         | e.g., 'VAT_RATE', 'REQUIRE_OTP_CLOSURE' |
| value      | TEXT         | YES  | NULL    | Serialized value (JSON/string)          |
| created_at | DATETIME     | NO   |         |                                         |
| updated_at | DATETIME     | NO   |         |                                         |

---

## 4.2 PARTY DATA (CUSTOMERS / SPONSORS / COMPANIES)

### 4.2.1 `customers`

| Column              | Type         | Null | Default | Description                     |
| ------------------- | ------------ | ---- | ------- | ------------------------------- |
| id                  | BIGINT       | NO   |         | PK                              |
| code                | VARCHAR(64)  | YES  | NULL    | Optional internal code          |
| first_name          | VARCHAR(128) | NO   |         | Hirer first name                |
| last_name           | VARCHAR(128) | NO   |         | Hirer last name                 |
| full_name           | VARCHAR(255) | NO   |         | Convenience field               |
| mobile              | VARCHAR(64)  | NO   |         | Primary mobile                  |
| email               | VARCHAR(255) | YES  | NULL    | Email                           |
| nationality         | VARCHAR(64)  | YES  | NULL    | Nationality                     |
| preferred_language  | VARCHAR(8)   | YES  | 'en'    | 'en' or 'ar'                    |
| marketing_opt_in    | BOOLEAN      | NO   | FALSE   | Marketing consent               |
| dnd_start_time      | TIME         | YES  | NULL    | Do-not-disturb start            |
| dnd_end_time        | TIME         | YES  | NULL    | DND end                         |
| id_type             | VARCHAR(64)  | YES  | NULL    | 'EMIRATES_ID', 'PASSPORT', etc. |
| id_number           | VARCHAR(128) | YES  | NULL    | ID no.                          |
| id_expiry_date      | DATE         | YES  | NULL    | ID expiry                       |
| license_number      | VARCHAR(128) | YES  | NULL    | DL number                       |
| license_expiry_date | DATE         | YES  | NULL    | License expiry                  |
| risk_score          | DECIMAL(5,2) | YES  | NULL    | Calculated risk score           |
| blacklist_status    | VARCHAR(32)  | YES  | NULL    | 'NONE','WATCH','SOFT','HARD'    |
| notes               | TEXT         | YES  | NULL    | Internal notes                  |
| created_at          | DATETIME     | NO   |         | Created                         |
| updated_at          | DATETIME     | NO   |         | Updated                         |

---

### 4.2.2 `companies`

| Column             | Type          | Null | Default | Description   |
| ------------------ | ------------- | ---- | ------- | ------------- |
| id                 | BIGINT        | NO   |         | PK            |
| code               | VARCHAR(64)   | YES  | NULL    | Internal code |
| name               | VARCHAR(255)  | NO   |         | Company name  |
| trade_license_no   | VARCHAR(128)  | YES  | NULL    | Trade license |
| tax_reg_no         | VARCHAR(128)  | YES  | NULL    | TRN           |
| contact_name       | VARCHAR(255)  | YES  | NULL    | Main contact  |
| contact_email      | VARCHAR(255)  | YES  | NULL    |               |
| contact_phone      | VARCHAR(64)   | YES  | NULL    |               |
| address_line1      | VARCHAR(255)  | YES  | NULL    |               |
| address_line2      | VARCHAR(255)  | YES  | NULL    |               |
| city               | VARCHAR(128)  | YES  | NULL    |               |
| country            | VARCHAR(64)   | YES  | NULL    |               |
| credit_limit       | DECIMAL(12,2) | YES  | NULL    | AR limit      |
| payment_terms_days | INT           | YES  | NULL    | e.g., 30 days |
| is_active          | BOOLEAN       | NO   | TRUE    | Active flag   |
| created_at         | DATETIME      | NO   |         |               |
| updated_at         | DATETIME      | NO   |         |               |

---

### 4.2.3 `company_contacts` (signatories/employees)

| Column       | Type         | Null | Default | Description        |
| ------------ | ------------ | ---- | ------- | ------------------ |
| id           | BIGINT       | NO   |         | PK                 |
| company_id   | BIGINT       | NO   |         | FK → companies     |
| full_name    | VARCHAR(255) | NO   |         |                    |
| email        | VARCHAR(255) | YES  | NULL    |                    |
| phone        | VARCHAR(64)  | YES  | NULL    |                    |
| is_signatory | BOOLEAN      | NO   | FALSE   | Can sign contracts |
| is_driver    | BOOLEAN      | NO   | FALSE   | Employee driver    |
| created_at   | DATETIME     | NO   |         |                    |
| updated_at   | DATETIME     | NO   |         |                    |

---

### 4.2.4 `blacklist_entries`

| Column       | Type        | Null | Default | Description                    |
| ------------ | ----------- | ---- | ------- | ------------------------------ |
| id           | BIGINT      | NO   |         | PK                             |
| subject_type | VARCHAR(32) | NO   |         | 'CUSTOMER','COMPANY','VEHICLE' |
| subject_id   | BIGINT      | NO   |         | ID of subject                  |
| status       | VARCHAR(32) | NO   |         | 'WATCHLIST','SOFT','HARD'      |
| reason       | TEXT        | YES  | NULL    |                                |
| created_by   | BIGINT      | NO   |         | FK → users                     |
| approved_by  | BIGINT      | YES  | NULL    | FK → users (for hard/soft)     |
| created_at   | DATETIME    | NO   |         |                                |
| updated_at   | DATETIME    | NO   |         |                                |

---

## 4.3 VEHICLE MASTER DATA

### 4.3.1 `vehicle_classes`

| Column      | Type         | Null | Default | Description         |
| ----------- | ------------ | ---- | ------- | ------------------- |
| id          | BIGINT       | NO   |         | PK                  |
| code        | VARCHAR(64)  | NO   |         | e.g., 'ECON', 'SUV' |
| name        | VARCHAR(255) | NO   |         | Class name          |
| description | VARCHAR(512) | YES  | NULL    |                     |
| created_at  | DATETIME     | NO   |         |                     |
| updated_at  | DATETIME     | NO   |         |                     |

---

### 4.3.2 `vehicle_groups`

| Column      | Type         | Null | Default | Description |
| ----------- | ------------ | ---- | ------- | ----------- |
| id          | BIGINT       | NO   |         | PK          |
| code        | VARCHAR(64)  | NO   |         | Group code  |
| name        | VARCHAR(255) | NO   |         | Name        |
| description | VARCHAR(512) | YES  | NULL    |             |
| created_at  | DATETIME     | NO   |         |             |
| updated_at  | DATETIME     | NO   |         |             |

---

### 4.3.3 `vehicles`

| Column               | Type         | Null | Default     | Description          |
| -------------------- | ------------ | ---- | ----------- | -------------------- |
| id                   | BIGINT       | NO   |             | PK                   |
| branch_id            | BIGINT       | NO   |             | Home branch          |
| vehicle_class_id     | BIGINT       | NO   |             | FK → vehicle_classes |
| vehicle_group_id     | BIGINT       | YES  | NULL        | FK → vehicle_groups  |
| plate_number         | VARCHAR(64)  | NO   |             | Plate                |
| registration_number  | VARCHAR(128) | YES  | NULL        | Reg number           |
| make                 | VARCHAR(128) | YES  | NULL        | Manufacturer         |
| model                | VARCHAR(128) | YES  | NULL        | Model                |
| year                 | INT          | YES  | NULL        | Model year           |
| color                | VARCHAR(64)  | YES  | NULL        |                      |
| vin                  | VARCHAR(64)  | YES  | NULL        | VIN                  |
| engine_number        | VARCHAR(64)  | YES  | NULL        |                      |
| tank_capacity_litres | DECIMAL(6,2) | YES  | NULL        | Fuel tank capacity   |
| odometer_current     | INT          | YES  | NULL        | Current odo          |
| status               | VARCHAR(32)  | NO   | 'AVAILABLE' | Fleet status         |
| insurance_policy_no  | VARCHAR(128) | YES  | NULL        |                      |
| insurance_expiry     | DATE         | YES  | NULL        |                      |
| registration_expiry  | DATE         | YES  | NULL        |                      |
| is_active            | BOOLEAN      | NO   | TRUE        |                      |
| created_at           | DATETIME     | NO   |             |                      |
| updated_at           | DATETIME     | NO   |             |                      |

---

## 4.4 CONTRACTS & RELATED

### 4.4.1 `contracts`

| Column                     | Type          | Null | Default | Description                                               |
| -------------------------- | ------------- | ---- | ------- | --------------------------------------------------------- |
| id                         | BIGINT        | NO   |         | PK                                                        |
| branch_id                  | BIGINT        | NO   |         | FK → branches                                             |
| contract_number            | VARCHAR(64)   | NO   |         | Human-visible contract no                                 |
| party_type                 | VARCHAR(32)   | NO   |         | 'DIRECT_HIRER','SPONSORED_INDIVIDUAL','SPONSORED_COMPANY' |
| hirer_id                   | BIGINT        | NO   |         | FK → customers                                            |
| sponsor_id                 | BIGINT        | YES  | NULL    | FK → customers (individual sponsor)                       |
| company_id                 | BIGINT        | YES  | NULL    | FK → companies                                            |
| company_contact_id         | BIGINT        | YES  | NULL    | FK → company_contacts (signatory)                         |
| vehicle_id                 | BIGINT        | NO   |         | FK → vehicles                                             |
| status                     | VARCHAR(32)   | NO   | 'DRAFT' | Contract status                                           |
| tariff_id                  | BIGINT        | NO   |         | FK → tariffs                                              |
| start_datetime_planned     | DATETIME      | NO   |         | Planned start                                             |
| end_datetime_planned       | DATETIME      | NO   |         | Planned end                                               |
| start_datetime_actual      | DATETIME      | YES  | NULL    | Activation time                                           |
| end_datetime_actual        | DATETIME      | YES  | NULL    | Return time                                               |
| original_branch_id         | BIGINT        | NO   |         | Pickup branch                                             |
| return_branch_id           | BIGINT        | YES  | NULL    | Return branch                                             |
| currency_code              | CHAR(3)       | NO   | 'AED'   | Currency (AED v1)                                         |
| deposit_required           | BOOLEAN       | NO   | FALSE   | Flag (for logic)                                          |
| deposit_expected           | DECIMAL(12,2) | YES  | NULL    | Expected deposit                                          |
| deposit_received           | DECIMAL(12,2) | YES  | NULL    | Sum of deposit IN                                         |
| deposit_refunded           | DECIMAL(12,2) | YES  | NULL    | Sum of deposit OUT                                        |
| total_charges              | DECIMAL(12,2) | YES  | NULL    | Derived total charges                                     |
| total_payments_in          | DECIMAL(12,2) | YES  | NULL    | Sum IN                                                    |
| total_payments_out         | DECIMAL(12,2) | YES  | NULL    | Sum OUT                                                   |
| outstanding_amount         | DECIMAL(12,2) | YES  | NULL    | Balance                                                   |
| has_active_dispute         | BOOLEAN       | NO   | FALSE   | Dispute flag                                              |
| has_pending_incident       | BOOLEAN       | NO   | FALSE   | Incident flag                                             |
| notes_internal             | TEXT          | YES  | NULL    | Internal remarks                                          |
| otp_activation_verified_at | DATETIME      | YES  | NULL    | Activation OTP time                                       |
| otp_closure_verified_at    | DATETIME      | YES  | NULL    | Closure OTP time                                          |
| version                    | INT           | NO   | 1       | For optimistic locking                                    |
| created_at                 | DATETIME      | NO   |         |                                                           |
| updated_at                 | DATETIME      | NO   |         |                                                           |

---

### 4.4.2 `contract_status_history`

| Column      | Type        | Null | Default | Description     |
| ----------- | ----------- | ---- | ------- | --------------- |
| id          | BIGINT      | NO   |         | PK              |
| contract_id | BIGINT      | NO   |         | FK → contracts  |
| from_status | VARCHAR(32) | YES  | NULL    | Previous status |
| to_status   | VARCHAR(32) | NO   |         | New status      |
| changed_by  | BIGINT      | YES  | NULL    | FK → users      |
| changed_at  | DATETIME    | NO   |         | Timestamp       |
| reason      | TEXT        | YES  | NULL    | Optional reason |

---

### 4.4.3 `contract_amendments`

| Column         | Type          | Null | Default | Description                                                                        |
| -------------- | ------------- | ---- | ------- | ---------------------------------------------------------------------------------- |
| id             | BIGINT        | NO   |         | PK                                                                                 |
| contract_id    | BIGINT        | NO   |         | FK → contracts                                                                     |
| type           | VARCHAR(64)   | NO   |         | 'RATE_CHANGE','VEHICLE_SWAP','DRIVER_CHANGE','UPGRADE_PLAN','DOWNGRADE_PLAN', etc. |
| old_value_json | JSON          | YES  | NULL    | Serialized old value                                                               |
| new_value_json | JSON          | YES  | NULL    | Serialized new value                                                               |
| penalty_amount | DECIMAL(12,2) | YES  | NULL    | Penalty if any                                                                     |
| reason         | TEXT          | YES  | NULL    | Why amendment                                                                      |
| approved_by    | BIGINT        | YES  | NULL    | FK → users                                                                         |
| created_by     | BIGINT        | NO   |         | FK → users                                                                         |
| created_at     | DATETIME      | NO   |         |                                                                                    |

---

### 4.4.4 `contract_charges`

| Column       | Type          | Null | Default | Description                                                                                                        |
| ------------ | ------------- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| id           | BIGINT        | NO   |         | PK                                                                                                                 |
| contract_id  | BIGINT        | NO   |         | FK → contracts                                                                                                     |
| type         | VARCHAR(64)   | NO   |         | 'RENT','FUEL','EXTRA_KM','INSURANCE_EXCESS','ONE_WAY_FEE','ADDON','DRIVER_SERVICE','PENALTY','DISCOUNT','VAT' etc. |
| description  | VARCHAR(255)  | YES  | NULL    | Short label                                                                                                        |
| quantity     | DECIMAL(10,2) | YES  | NULL    | For units-based charges                                                                                            |
| unit_price   | DECIMAL(12,4) | YES  | NULL    | Per unit                                                                                                           |
| amount       | DECIMAL(12,2) | NO   |         | Total line amount (+/-)                                                                                            |
| tax_category | VARCHAR(64)   | YES  | NULL    | For future VAT mapping                                                                                             |
| is_manual    | BOOLEAN       | NO   | FALSE   | Operator-added line?                                                                                               |
| created_at   | DATETIME      | NO   |         |                                                                                                                    |
| updated_at   | DATETIME      | NO   |         |                                                                                                                    |

---

### 4.4.5 `contract_disputes`

| Column          | Type          | Null | Default | Description                             |
| --------------- | ------------- | ---- | ------- | --------------------------------------- |
| id              | BIGINT        | NO   |         | PK                                      |
| contract_id     | BIGINT        | NO   |         | FK → contracts                          |
| status          | VARCHAR(32)   | NO   |         | 'OPEN','RESOLVED','CLOSED'              |
| disputed_amount | DECIMAL(12,2) | YES  | NULL    | Amount in question                      |
| reason          | TEXT          | YES  | NULL    | Description                             |
| opened_by       | BIGINT        | YES  | NULL    | FK → users                              |
| resolved_by     | BIGINT        | YES  | NULL    | FK → users                              |
| outcome         | VARCHAR(64)   | YES  | NULL    | 'UPHELD','REJECTED','PARTIAL','SETTLED' |
| created_at      | DATETIME      | NO   |         |                                         |
| updated_at      | DATETIME      | NO   |         |                                         |

---

## 4.5 RESERVATIONS

### 4.5.1 `reservations`

| Column           | Type          | Null | Default   | Description                                             |
| ---------------- | ------------- | ---- | --------- | ------------------------------------------------------- |
| id               | BIGINT        | NO   |           | PK                                                      |
| branch_id        | BIGINT        | NO   |           | FK → branches                                           |
| contract_id      | BIGINT        | YES  | NULL      | FK → contracts if converted                             |
| hirer_id         | BIGINT        | YES  | NULL      | FK → customers                                          |
| vehicle_id       | BIGINT        | YES  | NULL      | Specific vehicle (optional)                             |
| vehicle_group_id | BIGINT        | YES  | NULL      | Group-based reservation                                 |
| start_datetime   | DATETIME      | NO   |           | Reservation from                                        |
| end_datetime     | DATETIME      | NO   |           | Reservation to                                          |
| status           | VARCHAR(32)   | NO   | 'PENDING' | 'PENDING','CONFIRMED','EXPIRED','CANCELLED','CONVERTED' |
| deposit_expected | DECIMAL(12,2) | YES  | NULL      | Optional                                                |
| notes            | TEXT          | YES  | NULL      |                                                         |
| created_at       | DATETIME      | NO   |           |                                                         |
| updated_at       | DATETIME      | NO   |           |                                                         |

---

## 4.6 INSPECTIONS

### 4.6.1 `vehicle_inspections`

| Column          | Type         | Null | Default | Description                                                    |
| --------------- | ------------ | ---- | ------- | -------------------------------------------------------------- |
| id              | BIGINT       | NO   |         | PK                                                             |
| contract_id     | BIGINT       | NO   |         | FK → contracts                                                 |
| vehicle_id      | BIGINT       | NO   |         | FK → vehicles                                                  |
| type            | VARCHAR(32)  | NO   |         | 'CHECKOUT','RETURN','TRANSFER_IN','TRANSFER_OUT','MAINTENANCE' |
| odometer        | INT          | YES  | NULL    | Odo reading                                                    |
| fuel_level      | DECIMAL(5,2) | YES  | NULL    | % or fraction 0–1                                              |
| condition_notes | TEXT         | YES  | NULL    | Remarks                                                        |
| has_photos      | BOOLEAN      | NO   | FALSE   | If any photos attached                                         |
| created_by      | BIGINT       | NO   |         | FK → users                                                     |
| created_at      | DATETIME     | NO   |         |                                                                |
| updated_at      | DATETIME     | NO   |         |                                                                |

---

### 4.6.2 `vehicle_inspection_photos`

| Column        | Type         | Null | Default | Description                                            |
| ------------- | ------------ | ---- | ------- | ------------------------------------------------------ |
| id            | BIGINT       | NO   |         | PK                                                     |
| inspection_id | BIGINT       | NO   |         | FK → vehicle_inspections                               |
| tag           | VARCHAR(32)  | YES  | NULL    | 'FRONT','BACK','LEFT','RIGHT','TOP','INTERIOR','OTHER' |
| file_path     | VARCHAR(512) | NO   |         | Storage path                                           |
| created_at    | DATETIME     | NO   |         |                                                        |

---

## 4.7 INCIDENTS & CLAIMS

### 4.7.1 `incidents`

| Column              | Type         | Null | Default | Description                                                          |
| ------------------- | ------------ | ---- | ------- | -------------------------------------------------------------------- |
| id                  | BIGINT       | NO   |         | PK                                                                   |
| contract_id         | BIGINT       | YES  | NULL    | FK → contracts (nullable for transfer incident)                      |
| vehicle_id          | BIGINT       | NO   |         | FK → vehicles                                                        |
| vehicle_transfer_id | BIGINT       | YES  | NULL    | FK → vehicle_transfers (for transfer accidents)                      |
| type                | VARCHAR(32)  | NO   |         | 'ACCIDENT','NEW_DAMAGE','THEFT','ABANDONED','TRANSFER_ACCIDENT' etc. |
| description         | TEXT         | YES  | NULL    | Details                                                              |
| status              | VARCHAR(32)  | NO   | 'OPEN'  | 'OPEN','UNDER_REVIEW','CLOSED'                                       |
| police_report_no    | VARCHAR(128) | YES  | NULL    |                                                                      |
| opened_at           | DATETIME     | NO   |         |                                                                      |
| closed_at           | DATETIME     | YES  | NULL    |                                                                      |
| opened_by           | BIGINT       | YES  | NULL    | FK → users                                                           |
| closed_by           | BIGINT       | YES  | NULL    | FK → users                                                           |
| created_at          | DATETIME     | NO   |         |                                                                      |
| updated_at          | DATETIME     | NO   |         |                                                                      |

---

### 4.7.2 `insurance_claims`

| Column                   | Type          | Null | Default | Description                                       |
| ------------------------ | ------------- | ---- | ------- | ------------------------------------------------- |
| id                       | BIGINT        | NO   |         | PK                                                |
| incident_id              | BIGINT        | NO   |         | FK → incidents                                    |
| policy_number            | VARCHAR(128)  | YES  | NULL    | Insurance policy                                  |
| claim_number             | VARCHAR(128)  | YES  | NULL    | Claim ref                                         |
| excess_amount            | DECIMAL(12,2) | YES  | NULL    | Policy excess                                     |
| estimated_repair_cost    | DECIMAL(12,2) | YES  | NULL    | Estimated                                         |
| actual_repair_cost       | DECIMAL(12,2) | YES  | NULL    | Actual repair cost                                |
| insurer_paid_amount      | DECIMAL(12,2) | YES  | NULL    | Paid by insurer                                   |
| final_customer_liability | DECIMAL(12,2) | YES  | NULL    | Final liability                                   |
| status                   | VARCHAR(32)   | NO   | 'OPEN'  | 'OPEN','SUBMITTED','APPROVED','REJECTED','CLOSED' |
| created_at               | DATETIME      | NO   |         |                                                   |
| updated_at               | DATETIME      | NO   |         |                                                   |

---

## 4.8 PAYMENTS & FINANCIALS

### 4.8.1 `payments`

| Column        | Type          | Null | Default     | Description                                |
| ------------- | ------------- | ---- | ----------- | ------------------------------------------ |
| id            | BIGINT        | NO   |             | PK                                         |
| contract_id   | BIGINT        | NO   |             | FK → contracts                             |
| method        | VARCHAR(32)   | NO   |             | 'CASH','CARD','BANK_TRANSFER'              |
| direction     | VARCHAR(8)    | NO   |             | 'IN' or 'OUT'                              |
| type          | VARCHAR(32)   | NO   |             | 'RENT','DEPOSIT','REFUND','EXCESS','OTHER' |
| amount        | DECIMAL(12,2) | NO   |             | Amount (+ve, direction defines in/out)     |
| currency_code | CHAR(3)       | NO   | 'AED'       |                                            |
| reference     | VARCHAR(128)  | YES  | NULL        | POS slip, bank ref, etc.                   |
| paid_at       | DATETIME      | NO   |             | Payment timestamp                          |
| created_by    | BIGINT        | NO   |             | FK → users                                 |
| notes         | TEXT          | YES  | NULL        | Reason, description                        |
| status        | VARCHAR(32)   | NO   | 'CONFIRMED' | For future async gateway                   |
| created_at    | DATETIME      | NO   |             |                                            |
| updated_at    | DATETIME      | NO   |             |                                            |

---

### 4.8.2 `sequences` (for contracts, tax invoices, etc.)

| Column         | Type        | Null | Default | Description                   |
| -------------- | ----------- | ---- | ------- | ----------------------------- |
| id             | BIGINT      | NO   |         | PK                            |
| scope_type     | VARCHAR(16) | NO   |         | 'BRANCH','GLOBAL'             |
| scope_id       | BIGINT      | YES  | NULL    | Branch id when scope=BRANCH   |
| sequence_type  | VARCHAR(32) | NO   |         | 'CONTRACT','TAX_INVOICE' etc. |
| prefix         | VARCHAR(32) | YES  | NULL    | e.g., 'DXB-2025-'             |
| current_number | BIGINT      | NO   | 0       | Last used value               |
| padding        | INT         | YES  | 6       | Number of digits              |
| created_at     | DATETIME    | NO   |         |                               |
| updated_at     | DATETIME    | NO   |         |                               |

---

## 4.9 TARIFFS & PRICING

### 4.9.1 `tariffs`

| Column                 | Type          | Null | Default | Description            |
| ---------------------- | ------------- | ---- | ------- | ---------------------- |
| id                     | BIGINT        | NO   |         | PK                     |
| branch_id              | BIGINT        | YES  | NULL    | If branch-specific     |
| vehicle_class_id       | BIGINT        | YES  | NULL    | FK → vehicle_classes   |
| vehicle_group_id       | BIGINT        | YES  | NULL    | FK → vehicle_groups    |
| name                   | VARCHAR(255)  | NO   |         | Tariff name            |
| rate_hourly            | DECIMAL(12,2) | YES  | NULL    | Hourly rate            |
| rate_daily             | DECIMAL(12,2) | YES  | NULL    | Daily rate             |
| rate_weekly            | DECIMAL(12,2) | YES  | NULL    | Weekly rate            |
| rate_monthly           | DECIMAL(12,2) | YES  | NULL    | Monthly rate           |
| included_km_per_day    | DECIMAL(10,2) | YES  | NULL    | Included km/day        |
| extra_km_rate          | DECIMAL(12,4) | YES  | NULL    | Extra km fee           |
| deposit_required       | BOOLEAN       | NO   | FALSE   | Deposit flag           |
| default_deposit        | DECIMAL(12,2) | YES  | NULL    | Default deposit        |
| minimum_rental_hours   | INT           | YES  | NULL    | Minimum hours          |
| minimum_rental_days    | INT           | YES  | NULL    | Minimum days           |
| return_grace_minutes   | INT           | YES  | 0       | Grace period           |
| downgrade_penalty_rate | DECIMAL(12,2) | YES  | NULL    | For monthly→daily etc. |
| is_active              | BOOLEAN       | NO   | TRUE    |                        |
| created_at             | DATETIME      | NO   |         |                        |
| updated_at             | DATETIME      | NO   |         |                        |

---

### 4.9.2 `seasonal_tariffs`

| Column        | Type          | Null | Default | Description         |
| ------------- | ------------- | ---- | ------- | ------------------- |
| id            | BIGINT        | NO   |         | PK                  |
| tariff_id     | BIGINT        | NO   |         | FK → tariffs        |
| start_date    | DATE          | NO   |         | From date           |
| end_date      | DATE          | NO   |         | To date (inclusive) |
| rate_hourly   | DECIMAL(12,2) | YES  | NULL    | Override            |
| rate_daily    | DECIMAL(12,2) | YES  | NULL    | Override            |
| rate_weekly   | DECIMAL(12,2) | YES  | NULL    | Override            |
| rate_monthly  | DECIMAL(12,2) | YES  | NULL    | Override            |
| extra_km_rate | DECIMAL(12,4) | YES  | NULL    | Override            |
| created_at    | DATETIME      | NO   |         |                     |
| updated_at    | DATETIME      | NO   |         |                     |

---

### 4.9.3 `addons`

| Column      | Type          | Null | Default | Description                   |
| ----------- | ------------- | ---- | ------- | ----------------------------- |
| id          | BIGINT        | NO   |         | PK                            |
| code        | VARCHAR(64)   | NO   |         | e.g., 'GPS','BABY_SEAT'       |
| name        | VARCHAR(255)  | NO   |         | Display name                  |
| rate_type   | VARCHAR(32)   | NO   |         | 'PER_DAY','PER_RENTAL','FLAT' |
| rate        | DECIMAL(12,2) | NO   |         | Charge                        |
| description | VARCHAR(512)  | YES  | NULL    |                               |
| created_at  | DATETIME      | NO   |         |                               |
| updated_at  | DATETIME      | NO   |         |                               |

---

### 4.9.4 `packages`

| Column      | Type         | Null | Default | Description  |
| ----------- | ------------ | ---- | ------- | ------------ |
| id          | BIGINT       | NO   |         | PK           |
| name        | VARCHAR(255) | NO   |         | Package name |
| description | VARCHAR(512) | YES  | NULL    |              |
| is_active   | BOOLEAN      | NO   | TRUE    |              |
| created_at  | DATETIME     | NO   |         |              |
| updated_at  | DATETIME     | NO   |         |              |

---

### 4.9.5 `package_addons`

| Column     | Type          | Null | Default | Description      |
| ---------- | ------------- | ---- | ------- | ---------------- |
| id         | BIGINT        | NO   |         | PK               |
| package_id | BIGINT        | NO   |         | FK → packages    |
| addon_id   | BIGINT        | NO   |         | FK → addons      |
| quantity   | DECIMAL(10,2) | YES  | NULL    | Default quantity |

---

## 4.10 DRIVER SERVICES

### 4.10.1 `drivers`

| Column     | Type         | Null | Default | Description                                      |
| ---------- | ------------ | ---- | ------- | ------------------------------------------------ |
| id         | BIGINT       | NO   |         | PK                                               |
| type       | VARCHAR(32)  | NO   |         | 'STAFF','EXTERNAL_INDIVIDUAL','EXTERNAL_COMPANY' |
| full_name  | VARCHAR(255) | NO   |         | Name                                             |
| mobile     | VARCHAR(64)  | YES  | NULL    | Contact                                          |
| email      | VARCHAR(255) | YES  | NULL    |                                                  |
| company_id | BIGINT       | YES  | NULL    | For external company                             |
| is_active  | BOOLEAN      | NO   | TRUE    |                                                  |
| notes      | TEXT         | YES  | NULL    |                                                  |
| created_at | DATETIME     | NO   |         |                                                  |
| updated_at | DATETIME     | NO   |         |                                                  |

---

### 4.10.2 `driver_rate_plans`

| Column             | Type          | Null | Default | Description                         |
| ------------------ | ------------- | ---- | ------- | ----------------------------------- |
| id                 | BIGINT        | NO   |         | PK                                  |
| driver_id          | BIGINT        | NO   |         | FK → drivers                        |
| rate_type          | VARCHAR(32)   | NO   |         | 'HOURLY','DAILY','WEEKLY','MONTHLY' |
| rate_amount        | DECIMAL(12,2) | NO   |         | Customer-facing rate                |
| internal_cost_rate | DECIMAL(12,2) | YES  | NULL    | Internal cost                       |
| currency_code      | CHAR(3)       | NO   | 'AED'   |                                     |
| is_chargeable      | BOOLEAN       | NO   | TRUE    | Billable?                           |
| created_at         | DATETIME      | NO   |         |                                     |
| updated_at         | DATETIME      | NO   |         |                                     |

---

### 4.10.3 `contract_drivers`

| Column              | Type        | Null | Default    | Description            |
| ------------------- | ----------- | ---- | ---------- | ---------------------- |
| id                  | BIGINT      | NO   |            | PK                     |
| contract_id         | BIGINT      | NO   |            | FK → contracts         |
| driver_id           | BIGINT      | NO   |            | FK → drivers           |
| driver_rate_plan_id | BIGINT      | NO   |            | FK → driver_rate_plans |
| assignment_start    | DATETIME    | NO   |            | Service start          |
| assignment_end      | DATETIME    | YES  | NULL       | Service end            |
| status              | VARCHAR(32) | NO   | 'ASSIGNED' |                        |
| created_at          | DATETIME    | NO   |            |                        |
| updated_at          | DATETIME    | NO   |            |                        |

---

## 4.11 VEHICLE TRANSFERS & MAINTENANCE

### 4.11.1 `vehicle_transfers`

| Column                | Type        | Null | Default     | Description                                                 |
| --------------------- | ----------- | ---- | ----------- | ----------------------------------------------------------- |
| id                    | BIGINT      | NO   |             | PK                                                          |
| vehicle_id            | BIGINT      | NO   |             | FK → vehicles                                               |
| from_branch_id        | BIGINT      | NO   |             |                                                             |
| to_branch_id          | BIGINT      | NO   |             |                                                             |
| status                | VARCHAR(32) | NO   | 'REQUESTED' | 'REQUESTED','APPROVED','IN_TRANSIT','COMPLETED','CANCELLED' |
| requested_by          | BIGINT      | NO   |             | FK → users                                                  |
| approved_by           | BIGINT      | YES  | NULL        | FK → users                                                  |
| responsible_driver_id | BIGINT      | YES  | NULL        | FK → drivers                                                |
| planned_date          | DATE        | YES  | NULL        |                                                             |
| dispatch_datetime     | DATETIME    | YES  | NULL        | Actual out                                                  |
| arrival_datetime      | DATETIME    | YES  | NULL        | Actual in                                                   |
| notes                 | TEXT        | YES  | NULL        |                                                             |
| created_at            | DATETIME    | NO   |             |                                                             |
| updated_at            | DATETIME    | NO   |             |                                                             |

---

### 4.11.2 `maintenance_jobs`

| Column        | Type        | Null | Default   | Description                                     |
| ------------- | ----------- | ---- | --------- | ----------------------------------------------- |
| id            | BIGINT      | NO   |           | PK                                              |
| vehicle_id    | BIGINT      | NO   |           | FK → vehicles                                   |
| branch_id     | BIGINT      | NO   |           | FK → branches                                   |
| type          | VARCHAR(64) | NO   |           | 'SERVICE','REPAIR','INSPECTION'                 |
| description   | TEXT        | YES  | NULL      |                                                 |
| status        | VARCHAR(32) | NO   | 'PLANNED' | 'PLANNED','IN_PROGRESS','COMPLETED','CANCELLED' |
| planned_start | DATETIME    | YES  | NULL      |                                                 |
| planned_end   | DATETIME    | YES  | NULL      |                                                 |
| actual_start  | DATETIME    | YES  | NULL      |                                                 |
| actual_end    | DATETIME    | YES  | NULL      |                                                 |
| created_at    | DATETIME    | NO   |           |                                                 |
| updated_at    | DATETIME    | NO   |           |                                                 |

---

## 4.12 AVAILABILITY ENGINE

### 4.12.1 `vehicle_availability_cache`

| Column     | Type        | Null | Default | Description                                                |
| ---------- | ----------- | ---- | ------- | ---------------------------------------------------------- |
| id         | BIGINT      | NO   |         | PK                                                         |
| vehicle_id | BIGINT      | NO   |         | FK → vehicles                                              |
| branch_id  | BIGINT      | NO   |         | Branch where vehicle is considered                         |
| date       | DATE        | NO   |         | Day                                                        |
| status     | VARCHAR(32) | NO   |         | 'FREE','RESERVED','OUT','MAINTENANCE','TRANSFER','BLOCKED' |
| source     | VARCHAR(32) | YES  | NULL    | Derived from contracts/reservations/jobs                   |
| created_at | DATETIME    | NO   |         | Row created                                                |
| updated_at | DATETIME    | NO   |         | Updated                                                    |

---

## 4.13 NOTIFICATIONS & OTP

### 4.13.1 `communication_providers`

| Column      | Type         | Null | Default | Description                                 |
| ----------- | ------------ | ---- | ------- | ------------------------------------------- |
| id          | BIGINT       | NO   |         | PK                                          |
| type        | VARCHAR(32)  | NO   |         | 'SMS','EMAIL','WHATSAPP'                    |
| name        | VARCHAR(255) | NO   |         | Provider label                              |
| driver      | VARCHAR(64)  | NO   |         | 'TWILIO','GENERIC_SMTP','M365','GMAIL' etc. |
| config_json | JSON         | NO   |         | Credentials/settings                        |
| is_active   | BOOLEAN      | NO   | TRUE    |                                             |
| created_at  | DATETIME     | NO   |         |                                             |
| updated_at  | DATETIME     | NO   |         |                                             |

---

### 4.13.2 `notification_purposes`

| Column      | Type         | Null | Default | Description                                  |
| ----------- | ------------ | ---- | ------- | -------------------------------------------- |
| id          | BIGINT       | NO   |         | PK                                           |
| code        | VARCHAR(64)  | NO   |         | e.g., 'OTP_CONTRACT', 'PAYMENT_CONFIRMATION' |
| description | VARCHAR(255) | YES  | NULL    |                                              |
| created_at  | DATETIME     | NO   |         |                                              |
| updated_at  | DATETIME     | NO   |         |                                              |

---

### 4.13.3 `notification_routes`

| Column                | Type        | Null | Default | Description                  |
| --------------------- | ----------- | ---- | ------- | ---------------------------- |
| id                    | BIGINT      | NO   |         | PK                           |
| purpose_id            | BIGINT      | NO   |         | FK → notification_purposes   |
| channel               | VARCHAR(32) | NO   |         | 'SMS','EMAIL','WHATSAPP'     |
| branch_id             | BIGINT      | YES  | NULL    | Branch-specific override     |
| primary_provider_id   | BIGINT      | NO   |         | FK → communication_providers |
| secondary_provider_id | BIGINT      | YES  | NULL    | Optional fallback            |
| max_retries           | INT         | NO   | 1       | Retries per provider         |
| created_at            | DATETIME    | NO   |         |                              |
| updated_at            | DATETIME    | NO   |         |                              |

---

### 4.13.4 `notification_templates`

| Column        | Type         | Null | Default | Description                |
| ------------- | ------------ | ---- | ------- | -------------------------- |
| id            | BIGINT       | NO   |         | PK                         |
| purpose_id    | BIGINT       | NO   |         | FK → notification_purposes |
| channel       | VARCHAR(32)  | NO   |         | 'SMS','EMAIL','WHATSAPP'   |
| language      | VARCHAR(8)   | NO   |         | 'en','ar'                  |
| subject       | VARCHAR(255) | YES  | NULL    | For email                  |
| body_template | TEXT         | NO   |         | Template with variables    |
| is_active     | BOOLEAN      | NO   | TRUE    |                            |
| created_at    | DATETIME     | NO   |         |                            |
| updated_at    | DATETIME     | NO   |         |                            |

---

### 4.13.5 `notifications_sent`

| Column        | Type         | Null | Default | Description                  |
| ------------- | ------------ | ---- | ------- | ---------------------------- |
| id            | BIGINT       | NO   |         | PK                           |
| purpose_id    | BIGINT       | NO   |         | FK → notification_purposes   |
| channel       | VARCHAR(32)  | NO   |         |                              |
| to_address    | VARCHAR(255) | NO   |         | Phone or email               |
| language      | VARCHAR(8)   | YES  | NULL    |                              |
| subject       | VARCHAR(255) | YES  | NULL    |                              |
| body          | TEXT         | YES  | NULL    | Final rendered body          |
| provider_id   | BIGINT       | YES  | NULL    | FK → communication_providers |
| status        | VARCHAR(32)  | NO   | 'SENT'  | 'SENT','FAILED','QUEUED'     |
| error_message | TEXT         | YES  | NULL    | Provider error               |
| contract_id   | BIGINT       | YES  | NULL    | FK → contracts               |
| payment_id    | BIGINT       | YES  | NULL    | FK → payments                |
| triggered_by  | BIGINT       | YES  | NULL    | FK → users (if manual)       |
| created_at    | DATETIME     | NO   |         |                              |
| updated_at    | DATETIME     | NO   |         |                              |

---

### 4.13.6 `otp_logs`

| Column      | Type         | Null | Default | Description                                     |
| ----------- | ------------ | ---- | ------- | ----------------------------------------------- |
| id          | BIGINT       | NO   |         | PK                                              |
| contract_id | BIGINT       | YES  | NULL    | FK → contracts                                  |
| purpose     | VARCHAR(64)  | NO   |         | 'ACTIVATION','CLOSURE','DAMAGE_ACCEPTANCE' etc. |
| channel     | VARCHAR(32)  | NO   |         | 'SMS','EMAIL'                                   |
| target      | VARCHAR(255) | NO   |         | Phone/email                                     |
| otp_hash    | VARCHAR(255) | NO   |         | Hashed OTP                                      |
| expires_at  | DATETIME     | NO   |         | Expiry                                          |
| verified_at | DATETIME     | YES  | NULL    | When verified                                   |
| attempts    | INT          | NO   | 0       | Attempt count                                   |
| created_at  | DATETIME     | NO   |         |                                                 |
| updated_at  | DATETIME     | NO   |         |                                                 |

---

## 4.14 CRON & JOB MONITORING

### 4.14.1 `cron_job_definitions`

| Column            | Type         | Null | Default | Description                |
| ----------------- | ------------ | ---- | ------- | -------------------------- |
| id                | BIGINT       | NO   |         | PK                         |
| code              | VARCHAR(64)  | NO   |         | e.g., 'RESERVATION_EXPIRY' |
| description       | VARCHAR(255) | YES  | NULL    |                            |
| cron_expression   | VARCHAR(64)  | NO   |         |                            |
| timeout_ms        | INT          | NO   |         |                            |
| max_retries       | INT          | NO   | 3       |                            |
| failure_threshold | INT          | NO   | 3       | Consecutive failures       |
| is_active         | BOOLEAN      | NO   | TRUE    |                            |
| created_at        | DATETIME     | NO   |         |                            |
| updated_at        | DATETIME     | NO   |         |                            |

---

### 4.14.2 `cron_job_executions`

| Column         | Type        | Null | Default   | Description                            |
| -------------- | ----------- | ---- | --------- | -------------------------------------- |
| id             | BIGINT      | NO   |           | PK                                     |
| cron_job_id    | BIGINT      | NO   |           | FK → cron_job_definitions              |
| started_at     | DATETIME    | NO   |           | Start time                             |
| finished_at    | DATETIME    | YES  | NULL      | End time                               |
| status         | VARCHAR(32) | NO   | 'SUCCESS' | 'SUCCESS','FAILED','TIMEOUT','RETRIED' |
| attempt_number | INT         | NO   | 1         | Which attempt                          |
| error_message  | TEXT        | YES  | NULL      | Error text                             |
| created_at     | DATETIME    | NO   |           |                                        |

---

## 4.15 IMPORTS & BACKUPS

### 4.15.1 `import_jobs`

| Column            | Type         | Null | Default   | Description                                        |
| ----------------- | ------------ | ---- | --------- | -------------------------------------------------- |
| id                | BIGINT       | NO   |           | PK                                                 |
| entity_type       | VARCHAR(64)  | NO   |           | 'CUSTOMER','VEHICLE','CONTRACT', etc.              |
| filename          | VARCHAR(255) | NO   |           | Uploaded file                                      |
| total_records     | INT          | YES  | NULL      | Count                                              |
| success_count     | INT          | YES  | NULL      |                                                    |
| failure_count     | INT          | YES  | NULL      |                                                    |
| status            | VARCHAR(32)  | NO   | 'PENDING' | 'PENDING','RUNNING','COMPLETED','FAILED','PARTIAL' |
| error_report_path | VARCHAR(512) | YES  | NULL      | File path                                          |
| initiated_by      | BIGINT       | NO   |           | FK → users                                         |
| created_at        | DATETIME     | NO   |           |                                                    |
| updated_at        | DATETIME     | NO   |           |                                                    |

---

### 4.15.2 `backups`

| Column       | Type         | Null | Default   | Description                   |
| ------------ | ------------ | ---- | --------- | ----------------------------- |
| id           | BIGINT       | NO   |           | PK                            |
| environment  | VARCHAR(64)  | NO   |           | 'PROD','STAGE','DEV'          |
| backup_type  | VARCHAR(32)  | NO   |           | 'FULL','DB_ONLY','FILES_ONLY' |
| storage_path | VARCHAR(512) | NO   |           | Main archive path             |
| checksum     | VARCHAR(128) | YES  | NULL      | Integrity checksum            |
| size_bytes   | BIGINT       | YES  | NULL      | Size                          |
| status       | VARCHAR(32)  | NO   | 'SUCCESS' | 'SUCCESS','FAILED'            |
| started_at   | DATETIME     | NO   |           |                               |
| completed_at | DATETIME     | YES  | NULL      |                               |
| created_at   | DATETIME     | NO   |           |                               |
| updated_at   | DATETIME     | NO   |           |                               |

---

## 4.16 DOCUMENTS & TEMPLATE ENGINE

### 4.16.1 `templates` (for contract & future docs)

| Column            | Type         | Null | Default | Description                                      |
| ----------------- | ------------ | ---- | ------- | ------------------------------------------------ |
| id                | BIGINT       | NO   |         | PK                                               |
| type              | VARCHAR(64)  | NO   |         | 'CONTRACT','INVOICE','RECEIPT','STATEMENT', etc. |
| branch_id         | BIGINT       | YES  | NULL    | Branch override or NULL = global                 |
| name              | VARCHAR(255) | NO   |         | Template name                                    |
| language          | VARCHAR(8)   | NO   |         | 'en','ar'                                        |
| version           | INT          | NO   | 1       | Version                                          |
| is_published      | BOOLEAN      | NO   | FALSE   | Published flag                                   |
| is_active         | BOOLEAN      | NO   | TRUE    | Used flag                                        |
| canvas_definition | JSON         | NO   |         | Layout elements data                             |
| created_by        | BIGINT       | NO   |         | FK → users                                       |
| updated_by        | BIGINT       | YES  | NULL    | FK → users                                       |
| created_at        | DATETIME     | NO   |         |                                                  |
| updated_at        | DATETIME     | NO   |         |                                                  |

---

### 4.16.2 `documents`

| Column      | Type         | Null | Default | Description                                   |
| ----------- | ------------ | ---- | ------- | --------------------------------------------- |
| id          | BIGINT       | NO   |         | PK                                            |
| contract_id | BIGINT       | YES  | NULL    | FK → contracts                                |
| incident_id | BIGINT       | YES  | NULL    | FK → incidents                                |
| type        | VARCHAR(64)  | NO   |         | 'CONTRACT_PDF','SIGNED_CONTRACT_SCAN','OTHER' |
| language    | VARCHAR(8)   | YES  | NULL    | 'en','ar'                                     |
| file_path   | VARCHAR(512) | NO   |         | Path of stored file                           |
| mime_type   | VARCHAR(128) | YES  | NULL    |                                               |
| size_bytes  | BIGINT       | YES  | NULL    |                                               |
| created_by  | BIGINT       | YES  | NULL    | FK → users                                    |
| created_at  | DATETIME     | NO   |         |                                               |

---

## 4.17 AUDIT & LOGGING

### 4.17.1 `audit_logs`

| Column      | Type         | Null | Default | Description                                |
| ----------- | ------------ | ---- | ------- | ------------------------------------------ |
| id          | BIGINT       | NO   |         | PK                                         |
| user_id     | BIGINT       | YES  | NULL    | FK → users                                 |
| action      | VARCHAR(128) | NO   |         | e.g., 'CONTRACT_ACTIVATE','PAYMENT_CREATE' |
| entity_type | VARCHAR(64)  | YES  | NULL    | 'CONTRACT','PAYMENT','VEHICLE', etc.       |
| entity_id   | BIGINT       | YES  | NULL    |                                            |
| metadata    | JSON         | YES  | NULL    | Before/after values etc.                   |
| created_at  | DATETIME     | NO   |         |                                            |

# 🚀 PART 5 – SQL SCHEMA (CREATE TABLE)

> Note: `ENGINE=InnoDB` assumed everywhere for FK support.  
> Charset `utf8mb4` recommended.

---

## 5.1 CORE / INFRASTRUCTURE

### 5.1.1 `branches`

```sql
CREATE TABLE branches (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code            VARCHAR(32) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  legal_name      VARCHAR(255) NULL,
  address_line1   VARCHAR(255) NULL,
  address_line2   VARCHAR(255) NULL,
  city            VARCHAR(128) NULL,
  country         VARCHAR(64)  NULL,
  phone           VARCHAR(64)  NULL,
  email           VARCHAR(128) NULL,
  timezone        VARCHAR(64)  NULL,
  is_hq           TINYINT(1)   NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL,
  updated_at      DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_branches_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.1.2 `users`

```sql
CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_id      BIGINT UNSIGNED NULL,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(64)  NULL,
  password_hash  VARCHAR(255) NOT NULL,
  locale         VARCHAR(8)   NOT NULL DEFAULT 'en',
  is_superadmin  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     DATETIME     NOT NULL,
  updated_at     DATETIME     NOT NULL,
  last_login_at  DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.1.3 `roles` & `role_assignments`

```sql
CREATE TABLE roles (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(64) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(512) NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_assignments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  role_id    BIGINT UNSIGNED NOT NULL,
  branch_id  BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_role_assign_user (user_id),
  KEY idx_role_assign_role (role_id),
  KEY idx_role_assign_branch (branch_id),
  CONSTRAINT fk_role_assign_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_role_assign_role
    FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_role_assign_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.1.4 `system_settings`

```sql
CREATE TABLE system_settings (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scope_type  VARCHAR(16) NOT NULL, -- 'GLOBAL' or 'BRANCH'
  scope_id    BIGINT UNSIGNED NULL,
  `key`       VARCHAR(128) NOT NULL,
  `value`     TEXT NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sys_settings_scope (scope_type, scope_id),
  KEY idx_sys_settings_key (key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.2 PARTY DATA (CUSTOMERS / COMPANIES)

### 5.2.1 `customers`

```sql
CREATE TABLE customers (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                VARCHAR(64)   NULL,
  first_name          VARCHAR(128)  NOT NULL,
  last_name           VARCHAR(128)  NOT NULL,
  full_name           VARCHAR(255)  NOT NULL,
  mobile              VARCHAR(64)   NOT NULL,
  email               VARCHAR(255)  NULL,
  nationality         VARCHAR(64)   NULL,
  preferred_language  VARCHAR(8)    NOT NULL DEFAULT 'en',
  marketing_opt_in    TINYINT(1)    NOT NULL DEFAULT 0,
  dnd_start_time      TIME          NULL,
  dnd_end_time        TIME          NULL,
  id_type             VARCHAR(64)   NULL,
  id_number           VARCHAR(128)  NULL,
  id_expiry_date      DATE          NULL,
  license_number      VARCHAR(128)  NULL,
  license_expiry_date DATE          NULL,
  risk_score          DECIMAL(5,2)  NULL,
  blacklist_status    VARCHAR(32)   NULL,
  notes               TEXT          NULL,
  created_at          DATETIME      NOT NULL,
  updated_at          DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY idx_customers_mobile (mobile),
  KEY idx_customers_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.2.2 `companies` + `company_contacts`

```sql
CREATE TABLE companies (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code              VARCHAR(64)   NULL,
  name              VARCHAR(255)  NOT NULL,
  trade_license_no  VARCHAR(128)  NULL,
  tax_reg_no        VARCHAR(128)  NULL,
  contact_name      VARCHAR(255)  NULL,
  contact_email     VARCHAR(255)  NULL,
  contact_phone     VARCHAR(64)   NULL,
  address_line1     VARCHAR(255)  NULL,
  address_line2     VARCHAR(255)  NULL,
  city              VARCHAR(128)  NULL,
  country           VARCHAR(64)   NULL,
  credit_limit      DECIMAL(12,2) NULL,
  payment_terms_days INT          NULL,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        DATETIME      NOT NULL,
  updated_at        DATETIME      NOT NULL,
  PRIMARY KEY (id),
  KEY idx_companies_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_contacts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id   BIGINT UNSIGNED NOT NULL,
  full_name    VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NULL,
  phone        VARCHAR(64)  NULL,
  is_signatory TINYINT(1)   NOT NULL DEFAULT 0,
  is_driver    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL,
  updated_at   DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_company_contacts_company (company_id),
  CONSTRAINT fk_company_contacts_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.2.3 `blacklist_entries`

```sql
CREATE TABLE blacklist_entries (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_type VARCHAR(32)  NOT NULL, -- 'CUSTOMER','COMPANY','VEHICLE'
  subject_id   BIGINT UNSIGNED NOT NULL,
  status       VARCHAR(32)  NOT NULL, -- 'WATCHLIST','SOFT','HARD'
  reason       TEXT         NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  approved_by  BIGINT UNSIGNED NULL,
  created_at   DATETIME     NOT NULL,
  updated_at   DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_blacklist_subject (subject_type, subject_id),
  CONSTRAINT fk_blacklist_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_blacklist_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.3 VEHICLE MASTER

### 5.3.1 `vehicle_classes`, `vehicle_groups`

```sql
CREATE TABLE vehicle_classes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(64) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(512) NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_classes_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vehicle_groups (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(64) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(512) NULL,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_groups_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.3.2 `vehicles`

```sql
CREATE TABLE vehicles (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_id            BIGINT UNSIGNED NOT NULL,
  vehicle_class_id     BIGINT UNSIGNED NOT NULL,
  vehicle_group_id     BIGINT UNSIGNED NULL,
  plate_number         VARCHAR(64)  NOT NULL,
  registration_number  VARCHAR(128) NULL,
  make                 VARCHAR(128) NULL,
  model                VARCHAR(128) NULL,
  year                 INT          NULL,
  color                VARCHAR(64)  NULL,
  vin                  VARCHAR(64)  NULL,
  engine_number        VARCHAR(64)  NULL,
  tank_capacity_litres DECIMAL(6,2) NULL,
  odometer_current     INT          NULL,
  status               VARCHAR(32)  NOT NULL DEFAULT 'AVAILABLE',
  insurance_policy_no  VARCHAR(128) NULL,
  insurance_expiry     DATE         NULL,
  registration_expiry  DATE         NULL,
  is_active            TINYINT(1)   NOT NULL DEFAULT 1,
  created_at           DATETIME     NOT NULL,
  updated_at           DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_plate (plate_number),
  KEY idx_vehicles_branch (branch_id),
  KEY idx_vehicles_status (status),
  CONSTRAINT fk_vehicles_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_vehicles_class
    FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id),
  CONSTRAINT fk_vehicles_group
    FOREIGN KEY (vehicle_group_id) REFERENCES vehicle_groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.4 CONTRACTS & RELATED

### 5.4.1 `contracts`

```sql
CREATE TABLE contracts (
  id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_id                BIGINT UNSIGNED NOT NULL,
  contract_number          VARCHAR(64)  NOT NULL,
  party_type               VARCHAR(32)  NOT NULL,
  hirer_id                 BIGINT UNSIGNED NOT NULL,
  sponsor_id               BIGINT UNSIGNED NULL,
  company_id               BIGINT UNSIGNED NULL,
  company_contact_id       BIGINT UNSIGNED NULL,
  vehicle_id               BIGINT UNSIGNED NOT NULL,
  status                   VARCHAR(32)  NOT NULL DEFAULT 'DRAFT',
  tariff_id                BIGINT UNSIGNED NOT NULL,
  start_datetime_planned   DATETIME     NOT NULL,
  end_datetime_planned     DATETIME     NOT NULL,
  start_datetime_actual    DATETIME     NULL,
  end_datetime_actual      DATETIME     NULL,
  original_branch_id       BIGINT UNSIGNED NOT NULL,
  return_branch_id         BIGINT UNSIGNED NULL,
  currency_code            CHAR(3)      NOT NULL DEFAULT 'AED',
  deposit_required         TINYINT(1)   NOT NULL DEFAULT 0,
  deposit_expected         DECIMAL(12,2) NULL,
  deposit_received         DECIMAL(12,2) NULL,
  deposit_refunded         DECIMAL(12,2) NULL,
  total_charges            DECIMAL(12,2) NULL,
  total_payments_in        DECIMAL(12,2) NULL,
  total_payments_out       DECIMAL(12,2) NULL,
  outstanding_amount       DECIMAL(12,2) NULL,
  has_active_dispute       TINYINT(1)   NOT NULL DEFAULT 0,
  has_pending_incident     TINYINT(1)   NOT NULL DEFAULT 0,
  notes_internal           TEXT         NULL,
  otp_activation_verified_at DATETIME   NULL,
  otp_closure_verified_at    DATETIME   NULL,
  version                  INT          NOT NULL DEFAULT 1,
  created_at               DATETIME     NOT NULL,
  updated_at               DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_contracts_number (contract_number),
  KEY idx_contracts_branch (branch_id),
  KEY idx_contracts_status (status),
  KEY idx_contracts_vehicle (vehicle_id),
  CONSTRAINT fk_contracts_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_contracts_original_branch
    FOREIGN KEY (original_branch_id) REFERENCES branches(id),
  CONSTRAINT fk_contracts_return_branch
    FOREIGN KEY (return_branch_id) REFERENCES branches(id),
  CONSTRAINT fk_contracts_hirer
    FOREIGN KEY (hirer_id) REFERENCES customers(id),
  CONSTRAINT fk_contracts_sponsor
    FOREIGN KEY (sponsor_id) REFERENCES customers(id),
  CONSTRAINT fk_contracts_company
    FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_contracts_company_contact
    FOREIGN KEY (company_contact_id) REFERENCES company_contacts(id),
  CONSTRAINT fk_contracts_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_contracts_tariff
    FOREIGN KEY (tariff_id) REFERENCES tariffs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.4.2 `contract_status_history`

```sql
CREATE TABLE contract_status_history (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(32) NULL,
  to_status   VARCHAR(32) NOT NULL,
  changed_by  BIGINT UNSIGNED NULL,
  changed_at  DATETIME NOT NULL,
  reason      TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_csh_contract (contract_id),
  CONSTRAINT fk_csh_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_csh_user
    FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.4.3 `contract_amendments`

```sql
CREATE TABLE contract_amendments (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id    BIGINT UNSIGNED NOT NULL,
  type           VARCHAR(64) NOT NULL,
  old_value_json JSON NULL,
  new_value_json JSON NULL,
  penalty_amount DECIMAL(12,2) NULL,
  reason         TEXT NULL,
  approved_by    BIGINT UNSIGNED NULL,
  created_by     BIGINT UNSIGNED NOT NULL,
  created_at     DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_amend_contract (contract_id),
  CONSTRAINT fk_amend_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_amend_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT fk_amend_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.4.4 `contract_charges`

```sql
CREATE TABLE contract_charges (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id  BIGINT UNSIGNED NOT NULL,
  type         VARCHAR(64) NOT NULL,
  description  VARCHAR(255) NULL,
  quantity     DECIMAL(10,2) NULL,
  unit_price   DECIMAL(12,4) NULL,
  amount       DECIMAL(12,2) NOT NULL,
  tax_category VARCHAR(64) NULL,
  is_manual    TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL,
  updated_at   DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cc_contract (contract_id),
  CONSTRAINT fk_cc_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.5 PAYMENTS

### 5.5.1 `payments`

```sql
CREATE TABLE payments (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id    BIGINT UNSIGNED NOT NULL,
  method         VARCHAR(32) NOT NULL, -- 'CASH','CARD','BANK_TRANSFER'
  direction      VARCHAR(8)  NOT NULL, -- 'IN','OUT'
  type           VARCHAR(32) NOT NULL, -- 'RENT','DEPOSIT','REFUND','EXCESS','OTHER'
  amount         DECIMAL(12,2) NOT NULL,
  currency_code  CHAR(3)     NOT NULL DEFAULT 'AED',
  reference      VARCHAR(128) NULL,
  paid_at        DATETIME    NOT NULL,
  created_by     BIGINT UNSIGNED NOT NULL,
  notes          TEXT NULL,
  status         VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
  created_at     DATETIME    NOT NULL,
  updated_at     DATETIME    NOT NULL,
  PRIMARY KEY (id),
  KEY idx_payments_contract (contract_id),
  KEY idx_payments_paid_at (paid_at),
  CONSTRAINT fk_payments_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_payments_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 5.5.2 `sequences` (for contract numbers etc.)

```sql
CREATE TABLE sequences (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scope_type     VARCHAR(16) NOT NULL, -- 'GLOBAL','BRANCH'
  scope_id       BIGINT UNSIGNED NULL,
  sequence_type  VARCHAR(32) NOT NULL, -- 'CONTRACT','TAX_INVOICE', etc.
  prefix         VARCHAR(32) NULL,
  current_number BIGINT UNSIGNED NOT NULL DEFAULT 0,
  padding        INT NOT NULL DEFAULT 6,
  created_at     DATETIME NOT NULL,
  updated_at     DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sequences (scope_type, scope_id, sequence_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.6 INSPECTIONS

```sql
CREATE TABLE vehicle_inspections (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id     BIGINT UNSIGNED NOT NULL,
  vehicle_id      BIGINT UNSIGNED NOT NULL,
  type            VARCHAR(32) NOT NULL, -- 'CHECKOUT','RETURN','TRANSFER_IN','TRANSFER_OUT','MAINTENANCE'
  odometer        INT NULL,
  fuel_level      DECIMAL(5,2) NULL,
  condition_notes TEXT NULL,
  has_photos      TINYINT(1) NOT NULL DEFAULT 0,
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_vi_contract (contract_id),
  KEY idx_vi_vehicle (vehicle_id),
  CONSTRAINT fk_vi_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_vi_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_vi_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vehicle_inspection_photos (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  inspection_id BIGINT UNSIGNED NOT NULL,
  tag           VARCHAR(32) NULL,
  file_path     VARCHAR(512) NOT NULL,
  created_at    DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_vip_inspection (inspection_id),
  CONSTRAINT fk_vip_inspection
    FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.7 INCIDENTS & CLAIMS

```sql
CREATE TABLE incidents (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id        BIGINT UNSIGNED NULL,
  vehicle_id         BIGINT UNSIGNED NOT NULL,
  vehicle_transfer_id BIGINT UNSIGNED NULL,
  type               VARCHAR(32) NOT NULL,
  description        TEXT NULL,
  status             VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  police_report_no   VARCHAR(128) NULL,
  opened_at          DATETIME NOT NULL,
  closed_at          DATETIME NULL,
  opened_by          BIGINT UNSIGNED NULL,
  closed_by          BIGINT UNSIGNED NULL,
  created_at         DATETIME NOT NULL,
  updated_at         DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_incidents_contract (contract_id),
  KEY idx_incidents_vehicle (vehicle_id),
  CONSTRAINT fk_incidents_contract
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_incidents_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE insurance_claims (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  incident_id               BIGINT UNSIGNED NOT NULL,
  policy_number             VARCHAR(128) NULL,
  claim_number              VARCHAR(128) NULL,
  excess_amount             DECIMAL(12,2) NULL,
  estimated_repair_cost     DECIMAL(12,2) NULL,
  actual_repair_cost        DECIMAL(12,2) NULL,
  insurer_paid_amount       DECIMAL(12,2) NULL,
  final_customer_liability  DECIMAL(12,2) NULL,
  status                    VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  created_at                DATETIME NOT NULL,
  updated_at                DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_claim_incident (incident_id),
  CONSTRAINT fk_claim_incident
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.8 AVAILABILITY

```sql
CREATE TABLE vehicle_availability_cache (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  branch_id  BIGINT UNSIGNED NOT NULL,
  `date`     DATE NOT NULL,
  status     VARCHAR(32) NOT NULL,
  source     VARCHAR(32) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_availability (vehicle_id, date),
  KEY idx_vac_branch_date (branch_id, date),
  CONSTRAINT fk_vac_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_vac_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.9 NOTIFICATIONS & OTP

```sql
CREATE TABLE communication_providers (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type         VARCHAR(32)  NOT NULL, -- 'SMS','EMAIL','WHATSAPP'
  name         VARCHAR(255) NOT NULL,
  driver       VARCHAR(64)  NOT NULL, -- 'TWILIO','GENERIC_SMTP','M365','GMAIL', etc.
  config_json  JSON         NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL,
  updated_at   DATETIME     NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_purposes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(64)  NOT NULL,
  description VARCHAR(255) NULL,
  created_at  DATETIME     NOT NULL,
  updated_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notification_purposes_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_routes (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purpose_id           BIGINT UNSIGNED NOT NULL,
  channel              VARCHAR(32) NOT NULL,
  branch_id            BIGINT UNSIGNED NULL,
  primary_provider_id  BIGINT UNSIGNED NOT NULL,
  secondary_provider_id BIGINT UNSIGNED NULL,
  max_retries          INT NOT NULL DEFAULT 1,
  created_at           DATETIME NOT NULL,
  updated_at           DATETIME NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_nr_purpose FOREIGN KEY (purpose_id) REFERENCES notification_purposes(id),
  CONSTRAINT fk_nr_primary_provider FOREIGN KEY (primary_provider_id) REFERENCES communication_providers(id),
  CONSTRAINT fk_nr_secondary_provider FOREIGN KEY (secondary_provider_id) REFERENCES communication_providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_templates (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purpose_id    BIGINT UNSIGNED NOT NULL,
  channel       VARCHAR(32) NOT NULL,
  language      VARCHAR(8)  NOT NULL,
  subject       VARCHAR(255) NULL,
  body_template TEXT NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL,
  updated_at    DATETIME NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_nt_purpose FOREIGN KEY (purpose_id) REFERENCES notification_purposes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications_sent (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  purpose_id   BIGINT UNSIGNED NOT NULL,
  channel      VARCHAR(32) NOT NULL,
  to_address   VARCHAR(255) NOT NULL,
  language     VARCHAR(8)   NULL,
  subject      VARCHAR(255) NULL,
  body         TEXT         NULL,
  provider_id  BIGINT UNSIGNED NULL,
  status       VARCHAR(32) NOT NULL DEFAULT 'SENT',
  error_message TEXT        NULL,
  contract_id  BIGINT UNSIGNED NULL,
  payment_id   BIGINT UNSIGNED NULL,
  triggered_by BIGINT UNSIGNED NULL,
  created_at   DATETIME     NOT NULL,
  updated_at   DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ns_contract (contract_id),
  KEY idx_ns_payment (payment_id),
  CONSTRAINT fk_ns_purpose FOREIGN KEY (purpose_id) REFERENCES notification_purposes(id),
  CONSTRAINT fk_ns_provider FOREIGN KEY (provider_id) REFERENCES communication_providers(id),
  CONSTRAINT fk_ns_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_ns_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id   BIGINT UNSIGNED NULL,
  purpose       VARCHAR(64) NOT NULL,
  channel       VARCHAR(32) NOT NULL,
  target        VARCHAR(255) NOT NULL,
  otp_hash      VARCHAR(255) NOT NULL,
  expires_at    DATETIME     NOT NULL,
  verified_at   DATETIME     NULL,
  attempts      INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL,
  updated_at    DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_otp_contract (contract_id),
  CONSTRAINT fk_otp_contract FOREIGN KEY (contract_id) REFERENCES contracts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.10 TEMPLATE ENGINE & DOCUMENTS

```sql
CREATE TABLE templates (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type              VARCHAR(64)  NOT NULL, -- 'CONTRACT','INVOICE','RECEIPT', etc.
  branch_id         BIGINT UNSIGNED NULL,
  name              VARCHAR(255) NOT NULL,
  language          VARCHAR(8)   NOT NULL,
  version           INT          NOT NULL DEFAULT 1,
  is_published      TINYINT(1)   NOT NULL DEFAULT 0,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  canvas_definition JSON         NOT NULL,
  created_by        BIGINT UNSIGNED NOT NULL,
  updated_by        BIGINT UNSIGNED NULL,
  created_at        DATETIME     NOT NULL,
  updated_at        DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_templates_type_branch (type, branch_id),
  CONSTRAINT fk_templates_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_templates_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contract_id BIGINT UNSIGNED NULL,
  incident_id BIGINT UNSIGNED NULL,
  type        VARCHAR(64) NOT NULL, -- 'CONTRACT_PDF','SIGNED_CONTRACT_SCAN', etc.
  language    VARCHAR(8)  NULL,
  file_path   VARCHAR(512) NOT NULL,
  mime_type   VARCHAR(128) NULL,
  size_bytes  BIGINT UNSIGNED NULL,
  created_by  BIGINT UNSIGNED NULL,
  created_at  DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_documents_contract (contract_id),
  KEY idx_documents_incident (incident_id),
  CONSTRAINT fk_documents_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
  CONSTRAINT fk_documents_incident FOREIGN KEY (incident_id) REFERENCES incidents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5.11 AUDIT LOGS

```sql
CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(128) NOT NULL,
  entity_type VARCHAR(64)  NULL,
  entity_id   BIGINT UNSIGNED NULL,
  metadata    JSON         NULL,
  created_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 6.1 Architectural Style

**Pattern:**  
➡️ **Modular Monolith with clear bounded contexts**, not a distributed microservice soup.

- Single deployable application for v1 (simpler ops, easier debugging).

- Internally split into **modules / bounded contexts** with strict separation:
  
  - Contracting
  
  - Fleet & Operations
  
  - Billing & Payments
  
  - Notifications
  
  - Template Engine
  
  - Availability
  
  - Risk & Blacklist
  
  - Import & Admin
  
  - Monitoring / Cron watchdog

- All cross-module communication via **well-defined service interfaces**, so any module can later be extracted as a microservice if needed.

**Why not microservices now?**

- You don’t have multi-team, multi-region scale yet.

- Operational overhead (observability, tracing, distributed transactions) is unnecessary.

- You want **control + speed** → modular monolith is the practical choice.

---

## 6.2 Layered Structure

4 classic layers:

1. **Presentation Layer**
   
   - Web UI (Operator panel, admin UI)
   
   - REST APIs (for mobile / future portal)
   
   - Request validation, DTOs, authentication

2. **Application Layer (Services)**
   
   - Orchestrates use cases and workflows
   
   - Coordinates multiple domain services
   
   - Handles transactions, outbox messages, events

3. **Domain Layer**
   
   - Entities, value objects, domain services
   
   - Pure business rules
   
   - No infrastructure dependencies

4. **Infrastructure Layer**
   
   - Database repositories
   
   - Email/SMS providers
   
   - File storage
   
   - Cache (Redis)
   
   - Job scheduler (cron/queue)

**Golden rule:**  
Presentation → Application → Domain → Infrastructure  
No reverse / sideways shortcuts.

---

## 6.3 Bounded Contexts / Modules

Each module is a logical package (namespace) with:

- Controllers / API endpoints

- Application services

- Domain models

- Repositories

- Mappers, validators

### 6.3.1 Contracting Module

Responsible for:

- Contract creation, activation, completion, closure

- Extensions, amendments, vehicle swap, early return, handover

- Enforcing party model (direct / sponsored / company)

- Enforcing status transitions

- Integrating inspections, payments, incidents, deposits

Key services:

- `ContractLifecycleService`

- `ContractAmendmentService`

- `ContractValidationService`

---

### 6.3.2 Fleet & Operations Module

Responsible for:

- Vehicle master data

- Vehicle class/group

- Vehicle status changes (available, out, maintenance, transfer, retired)

- Maintenance jobs

- Branch transfers

Key services:

- `VehicleService`

- `MaintenanceService`

- `TransferService`

- `VehicleStatusService`

---

### 6.3.3 Inspections & Condition Module

Responsible for:

- Checkout/return inspections

- Transfer inspection

- Photo handling

- Damage detection trigger

Key services:

- `InspectionService`

- `DamageAssessmentService` (does comparison and triggers incidents)

---

### 6.3.4 Incidents & Claims Module

Responsible for:

- Incidents (accident, theft, transfer damage, abandoned)

- Insurance claims

- Excess logic integration

- Blocking contract closure until resolved

Key services:

- `IncidentService`

- `InsuranceClaimService`

- `ExcessSettlementService`

---

### 6.3.5 Billing & Payments Module

Responsible for:

- Contract charges (rent, fuel, extras, penalties, VAT)

- Payments (IN/OUT)

- Deposits (hold/charge/release)

- Balance calculation

- Generating payment confirmation events

Key services:

- `BillingService`

- `PaymentService`

- `DepositService`

- `SettlementService`

**Important:**  
Every payment or refund goes through `PaymentService` and **must** emit a `PaymentRecorded` domain event → consumed by Notifications module for **payment confirmation messages**.

---

### 6.3.6 Tariffs & Pricing Module

Responsible for:

- Tariff plans

- Seasonal tariffs

- Minimum rental, grace periods

- Downgrade penalty logic (monthly → daily)

- Driver rate plans

Key services:

- `TariffService`

- `PricingEngineService`

- `DriverRateService`

Application layer calls `PricingEngineService` whenever:

- Creating contract

- Extending contract

- Downgrading tariff

- Calculating early return impact

---

### 6.3.7 Reservations & Availability Module

Responsible for:

- Reservations (vehicle or group)

- Auto-expiry of reservations

- Vehicle availability cache per day/branch

- Cross-branch search

Key services:

- `ReservationService`

- `AvailabilityService`

- `AvailabilityRebuildService` (cron-triggered)

Patterns:

- Write operations emit events like `ContractActivated`, `ContractCompleted`, `MaintenanceStarted`, `TransferStarted` → `AvailabilityService` updates `vehicle_availability_cache` asynchronously or near-real-time.

---

### 6.3.8 Notifications Module

Responsible for:

- Routing logic (purpose → channel → provider)

- Template resolution (not PDF templates, but text/email templates)

- Provider fallback (primary → secondary → email fallback)

- DND & preference enforcement (except critical OTP/legal)

- Logging sent messages

Key services:

- `NotificationService`

- `NotificationRoutingService`

- `NotificationTemplateService`

- `ProviderClientFactory`

Input patterns:

- Listens for domain events:
  
  - `ContractActivated`
  
  - `ContractCompleted`
  
  - `PaymentRecorded`
  
  - `IncidentCreated`
  
  - `CronJobFailure`
  
  - Reminder events (overdue, due-today)

---

### 6.3.9 Template Engine Module

Responsible for:

- Contract document templates (v1)

- Canvas-based layout definition (pixel-level)

- Version control (draft/published)

- Multi-language layout & text

Key services:

- `TemplateDefinitionService`

- `DocumentRenderService` (contract PDF)

- `TemplateVersioningService`

It receives a `ContractFinalized` or explicit “Generate Contract Doc” request and:

1. Loads active template for branch + language.

2. Resolves variables from contract.

3. Generates HTML.

4. Renders PDF.

5. Stores in `documents`.

Future (invoice, receipt etc.) will reuse exactly this engine.

---

### 6.3.10 Risk & Blacklist Module

Responsible for:

- Risk score calculation

- Blacklist/watchlist management

- Soft/hard block enforcement

Key services:

- `RiskEngineService`

- `BlacklistService`

Integrated with:

- Contract creation/activation → must call `BlacklistService.check(...)`.

---

### 6.3.11 Import & Admin Module

Responsible for:

- Bulk imports (customers, vehicles, contracts)

- Mapping logic, validation, dry-run

- Error reports

Key services:

- `ImportJobService`

- `ImportValidationService`

---

### 6.3.12 Monitoring & Cron Watchdog Module

Responsible for:

- Cron job definitions & executions

- Failure tracking

- Alerting via notifications (emailOutputOnFailure equivalent, but better)

Key services:

- `CronSchedulerService`

- `CronExecutionService`

- `CronFailureAlertService`

All the logic from your `CRON_FAILURE_NOTIFICATIONS` doc maps here.

---

## 6.4 Service Interaction Patterns

### 6.4.1 Example: Contract Activation

Application layer use case: `ActivateContractUseCase`

1. Load contract (repository)

2. Validate via:
   
   - `ContractValidationService`
   
   - `DepositService.checkDepositRequirement`
   
   - `BlacklistService.check`

3. Check for checkout inspection via `InspectionService`

4. Send OTP via `OtpService` / `NotificationService`

5. Verify OTP

6. In one DB transaction:
   
   - Update contract status to ACTIVE
   
   - Set `start_datetime_actual`
   
   - Update vehicle status to OUT
   
   - Insert `contract_status_history`
   
   - Append `audit_logs`

7. After commit:
   
   - Publish `ContractActivated` event to internal bus
   
   - `NotificationService` sends activation notification
   
   - `AvailabilityService` updates availability cache

**Important:**  
Notifications and availability update happen **after commit** to avoid sending messages for aborted transactions.

---

### 6.4.2 Example: Payment Posting

Use case: `RecordPaymentUseCase`

1. Validate payment input

2. Within transaction:
   
   - Insert into `payments`
   
   - Recalculate contract aggregates:
     
     - `total_payments_in`, `total_payments_out`, `outstanding_amount`
   
   - Update contract record
   
   - Write `audit_logs`

3. After commit:
   
   - Raise `PaymentRecorded` event
   
   - `NotificationService` sends payment confirmation (SMS + email)
   
   - (Future) `FinanceReportingService` can update caches or summary tables

---

### 6.4.3 Event Flow Summary (Internal Domain Events)

Common events:

- `ContractCreated`

- `ContractActivated`

- `ContractCompleted`

- `ContractClosed`

- `PaymentRecorded`

- `IncidentCreated`

- `ReservationCreated`

- `ReservationExpired`

- `MaintenanceStarted`

- `MaintenanceCompleted`

- `TransferStarted`

- `TransferCompleted`

- `CronJobFailed`

- `CronJobRecovered`

These events are implemented as **in-process event dispatch** in v1 (not Kafka/Rabbit yet) but abstraction is such that later you can plug a queue.

---

## 6.5 Transaction Boundaries & Concurrency

### 6.5.1 Transaction Boundaries

- Each major user action is a single transactional unit:
  
  - Activate contract
  
  - Complete contract
  
  - Close contract
  
  - Record payment
  
  - Apply amendment
  
  - Start/finish transfer
  
  - Start/finish maintenance

- Inside each transaction:
  
  - Update main entity (contract/vehicle)
  
  - Update related aggregates
  
  - Insert audit & history

- After transaction:
  
  - Fire events (notifications, availability, cron scheduling, etc.)

### 6.5.2 Optimistic Locking for Contracts

- `contracts.version` used for **optimistic locking**.

- Pattern:
  
  - UI reads contract with `version = X`.
  
  - Update request sends `id + version`.
  
  - DB update uses `WHERE id = ? AND version = ?`.
  
  - If affected rows = 0 → concurrency conflict → return error:  
    *“Contract modified by another user. Reload.”*

Applied to:

- Contract lifecycle updates

- Amendments

- Financial settlement-critical updates

---

## 6.6 Infrastructure Concerns

### 6.6.1 Database

- Single relational DB (MySQL/Postgres).

- Migrations via Laravel or similar.

- Use of indexes for:
  
  - `contracts(status, branch_id, start/end dates)`
  
  - `vehicle_availability_cache(vehicle_id, date)`
  
  - `notifications_sent(contract_id, payment_id)`
  
  - `payments(contract_id, paid_at)`
  
  - `incidents(contract_id, vehicle_id)`

### 6.6.2 Caching

- Redis (preferred) or in-memory cache.

- What is cached:
  
  - Tariffs & seasonal overrides
  
  - Vehicle class/group metadata
  
  - Notification templates & purposes
  
  - Provider routes
  
  - System settings

- Cache invalidation:
  
  - When admin updates tariffs/settings/templates → relevant keys are flushed.

### 6.6.3 Rate Limiting

- Implemented at API gateway/middleware:
  
  - Per IP + per API token for mobile/portal.
  
  - Key pattern: `rate:<api_key>:<endpoint>`

- Higher limits for internal operator UI, stricter for public/mobile.

---

## 6.7 External Providers Architecture

### 6.7.1 Provider Abstraction

Interface e.g.:

```pseudo
interface SmsProvider {
  sendSms(to, message): ProviderResult
}

interface EmailProvider {
  sendEmail(to, subject, htmlBody, textBody): ProviderResult
}
```

Concrete implementations:

- `TwilioSmsProvider`

- `GenericHttpSmsProvider`

- `SmtpEmailProvider`

- `M365EmailProvider`

- `GmailSmtpProvider`

All configurable via `communication_providers.config_json`.

---

### 6.7.2 Provider Selection & Sandbox

- `NotificationRoutingService` chooses provider based on:
  
  - Purpose
  
  - Channel
  
  - Branch

- Each provider has flags for:
  
  - Sandbox mode (test destination)
  
  - Production mode

Communication provider lifecycle:

1. Create provider (UI) with config (API key, URL, etc.)

2. Test provider via “Send Test Message” workflow

3. Mark as active

4. Assign to notification routes (OTP, payment confirmations, campaigns, etc.)

5. Ability to re-route easily if provider fails (without code change).

---

## 6.8 Cron / Job Engine & Monitoring

- All recurring tasks run through central **Cron Manager**:
  
  - `reservation_expiry`
  
  - `overdue_reminders`
  
  - `risk_recalculation`
  
  - `availability_rebuild`
  
  - `import_job_runner`
  
  - `backup_trigger` (if used)

- `cron_job_definitions` + `cron_job_executions` tables used to:
  
  - Track start/end time
  
  - Status (SUCCESS/FAILED/TIMEOUT)
  
  - Consecutive failures

**CRON FAILURE HANDLING:**

- When consecutive failures ≥ threshold:
  
  - `CronFailureAlertService` triggers:
    
    - High-priority email to admin group (HTML summary)
    
    - Optional SMS to IT operations

- This is more powerful than just `emailOutputOnFailure()` because:
  
  - Tracks consecutive failures
  
  - Centralized logging
  
  - Clear separation of concerns

---

## 6.9 Security & RBAC Hooks (High-Level)

Deep details will be in Part 13, but at architecture level:

- Authentication: session/JWT-based (depending on web vs API).

- Authorization:
  
  - Role-based plus branch scope.
  
  - Middleware/guards enforce:
    
    - “User must belong to this branch or HQ”
    
    - “User must have role X to perform Y”

- Sensitive operations (amendments, overrides, soft-block bypass) require:
  
  - `MANAGER` or above
  
  - All recorded in `audit_logs`.

---

## 6.10 Error Handling & Consistency

- All application services return **structured results**:
  
  - `success: boolean`
  
  - `data: ...`
  
  - `errors: [ { code, message, field? } ]`

- UI shows:
  
  - Business validation errors cleanly
  
  - System errors with generic messaging, but logged in full internally

Error categories:

- `VALIDATION_ERROR`

- `CONFLICT_ERROR` (optimistic lock)

- `PERMISSION_DENIED`

- `PROVIDER_FAILURE` (notifications)

- `CRON_FAILURE`

- `INTERNAL_ERROR`

All important failures captured in:

- `audit_logs` (user-caused actions)

- `cron_job_executions` (background)

- `notifications_sent.error_message` (provider issues)

# 🚀 PART 7 – MODULE ARCHITECTURE (DEEP DIVE)

This section drills into **each module** as if you’re giving a brief to a senior dev team:

- What lives inside each module

- Key **application services** and their methods

- Key **domain entities/aggregates**

- How modules talk to each other (dependencies)

> Still modular monolith – but organized so that any module can later be extracted.

---

## 7.1 Contracting Module

**Responsibility:** Entire contract lifecycle and state machine.

### 7.1.1 Main Domain Entities

- `Contract` (aggregate root)

- `ContractCharge`

- `ContractAmendment`

- `ContractStatusHistory`

- *Read-only views of* `Hirer`, `Sponsor`, `Company`, `Vehicle`, `Tariff`

### 7.1.2 Application Services

#### `ContractLifecycleService`

- `createDraftContract(CreateContractDTO): Contract`

- `activateContract(ContractId, ActivateContractCommand): Contract`

- `completeContract(ContractId, CompleteContractCommand): Contract`

- `closeContract(ContractId, CloseContractCommand): Contract`

- `cancelContract(ContractId, CancelContractCommand): Contract`

**Key responsibilities:**

- Enforce **party_type rules** (direct/sponsored/company)

- Enforce **lifecycle transitions**:
  
  - DRAFT → ACTIVE
  
  - ACTIVE → COMPLETED
  
  - COMPLETED → CLOSED
  
  - etc.

- Call:
  
  - `InspectionService` → verify checkout/return exists
  
  - `DepositService` → confirm deposit rules
  
  - `BlacklistService` → check hard/soft blocks
  
  - `OtpService` → trigger and validate OTP where required
  
  - `VehicleStatusService` → set OUT / AVAILABLE
  
  - `BillingService` → recalc charges on completion

- Write:
  
  - `contract_status_history`
  
  - `audit_logs`

- Emit domain events:
  
  - `ContractCreated`
  
  - `ContractActivated`
  
  - `ContractCompleted`
  
  - `ContractClosed`
  
  - `ContractCancelled`

#### `ContractAmendmentService`

- `extendContract(ContractId, ExtendContractCommand)`

- `changeTariff(ContractId, ChangeTariffCommand)`

- `applyVehicleSwap(ContractId, SwapVehicleCommand)`

- `applyDriverChange(ContractId, ChangeDriverCommand)`

- `applyEarlyReturnAdjustment(ContractId, EarlyReturnCommand)`

Uses:

- `PricingEngineService` (Tariff module)

- `AvailabilityService` (for extension feasibility)

- `InspectionService` (for vehicle swap partial-inspection)

Writes:

- `contract_amendments`

- `contract_charges` (for penalties / adjustments)

- `audit_logs`

---

## 7.2 Fleet & Operations Module

**Responsibility:** All vehicle-level operations & statuses.

### 7.2.1 Entities

- `Vehicle`

- `VehicleClass`

- `VehicleGroup`

- `VehicleTransfer`

- `MaintenanceJob`

### 7.2.2 Services

#### `VehicleService`

- `createVehicle(CreateVehicleDTO)`

- `updateVehicle(VehicleId, UpdateVehicleDTO)`

- `changeStatus(VehicleId, VehicleStatusChangeCommand)`

Only **this** service changes `vehicles.status` – others (contracting, maintenance, transfer) must go through it.

#### `MaintenanceService`

- `createMaintenanceJob(CreateMaintenanceJobCommand)`

- `startMaintenance(MaintenanceJobId)`

- `completeMaintenance(MaintenanceJobId)`

- `cancelMaintenance(MaintenanceJobId)`

Internal behaviour:

- On job start:
  
  - Vehicle → `UNDER_MAINTENANCE`

- On job completion:
  
  - Vehicle → `AVAILABLE`

- Emits:
  
  - `MaintenanceStarted`
  
  - `MaintenanceCompleted` (for availability)

#### `TransferService`

- `requestTransfer(RequestTransferCommand)`

- `approveTransfer(TransferId)`

- `dispatchVehicle(TransferId)`

- `receiveVehicle(TransferId, ReceiveTransferCommand)`

- `cancelTransfer(TransferId)`

Internal behaviour:

- `dispatchVehicle`:
  
  - Vehicle → `IN_TRANSFER`

- `receiveVehicle`:
  
  - Arrival inspection via `InspectionService`
  
  - Vehicle branch updated
  
  - Vehicle → `AVAILABLE`
  
  - If damage → triggers `IncidentService.transferIncident`

---

## 7.3 Inspections & Damage Module

**Responsibility:** Vehicle state at handover/return/transfer.

### 7.3.1 Entities

- `VehicleInspection`

- `VehicleInspectionPhoto`

### 7.3.2 Services

#### `InspectionService`

- `createCheckoutInspection(ContractId, InspectionDTO)`

- `createReturnInspection(ContractId, InspectionDTO)`

- `createTransferInspection(TransferId, InspectionDTO)`

- `getInspectionSummary(ContractId)`

Validation rules:

- Checkout inspection must have:
  
  - Odometer, fuel
  
  - Photos *or* mandatory remarks

- Return inspection same.

#### `DamageAssessmentService`

- `evaluateDamage(CheckoutInspectionId, ReturnInspectionId): DamageAssessmentResult`

Behaviour:

- Compares:
  
  - Photos tags/regions (basic at v1; future AI capability optional)
  
  - Recorded damages

- Result:
  
  - `noDamage`
  
  - `newDamageList[]`

- Side effects (called by `ContractLifecycleService`):
  
  - If `newDamageList` not empty → `IncidentService.createIncidentFromInspection(...)`.

---

## 7.4 Incidents & Claims Module

**Responsibility:** Anything abnormal – accidents, theft, abandoned, transfer damage.

### 7.4.1 Entities

- `Incident`

- `InsuranceClaim`

### 7.4.2 Services

#### `IncidentService`

- `createIncidentFromInspection(CreateIncidentFromInspectionCommand)`

- `createAbandonedVehicleIncident(CreateAbandonedIncidentCommand)`

- `createTheftIncident(CreateTheftIncidentCommand)`

- `createTransferIncident(CreateTransferIncidentCommand)`

- `updateIncidentStatus(IncidentId, UpdateIncidentStatusCommand)`

Key rules:

- If incident tied to a contract:
  
  - `contracts.has_pending_incident = 1`
  
  - Contract cannot reach `CLOSED` until all incidents resolved.

- Incident type influences:
  
  - Required police report
  
  - Insurance claim possibility

#### `InsuranceClaimService`

- `openClaimForIncident(OpenClaimCommand)`

- `updateClaimFinancials(ClaimId, UpdateClaimFinancialsCommand)`

- `closeClaim(ClaimId)`

Integrates with:

- `BillingService`:
  
  - For adding excess, non-covered damage charges.

- Future:
  
  - External insurer API.

---

## 7.5 Billing & Payments Module

**Responsibility:** All financial logic per contract.

### 7.5.1 Entities

- `ContractCharge`

- `Payment`

- (No separate “invoice” entity yet, since invoicing is provision only)

### 7.5.2 Services

#### `BillingService`

- `recalculateChargesForContract(ContractId)`

- `addManualCharge(ContractId, AddChargeDTO)`

- `removeManualCharge(ChargeId)` (*with privilege + audit*)

- `calculateSettlement(ContractId): SettlementSummary`

Uses:

- Tariff & seasonal pricing rules

- Distance/fuel/penalty logic per contract

- Downgrades (monthly→daily) with optional fine

- Minimum rental period

- One-way fees, late return penalty etc.

#### `DepositService`

- `determineRequiredDeposit(ContractId): DepositRuleResult`

- `recordDepositPayment(PaymentDTO)` (actually performed by `PaymentService`, but with deposit tagging)

- `applyDepositOnClosure(ContractId): DepositAdjustmentResult`

Rules:

- Handles deposit modes (pre-auth vs charge)

- Computes how much deposit can be applied toward:
  
  - Rent
  
  - Damage
  
  - Fuel
  
  - Fines

- Computes refund if any.

#### `PaymentService`

- `recordPayment(ContractId, PaymentCommand): Payment`

- `recordRefund(ContractId, RefundCommand): Payment`

- `recordExcessPayment(ContractId, ExcessPaymentCommand): Payment`

Internal steps:

- Insert `payments` line

- Recalculate `contracts.total_payments_in/out/outstanding_amount`

- Write audit

- Emit `PaymentRecorded` domain event  
  → consumed by `NotificationService` to send **payment confirmation**.

#### `SettlementService`

- `finalizeSettlement(ContractId): SettlementResult`

Typically called by `ContractLifecycleService` before closure.

---

## 7.6 Tariffs, Pricing & Driver Services Module

**Responsibility:** All pricing rules.

### 7.6.1 Entities

- `Tariff`

- `SeasonalTariff`

- `Addon`

- `Package`

- `PackageAddons`

- `Driver`

- `DriverRatePlan`

- `ContractDriver`

### 7.6.2 Services

#### `TariffService`

- `getApplicableTariff(VehicleId, DateRange, PartyType, CompanyId?): TariffContext`

- Admin functions:
  
  - `createTariff`, `updateTariff`, `assignSeasonalTariff`

#### `PricingEngineService`

- `calculatePlannedCharges(ContractPlan): ChargeBreakdown`

- `calculateActualCharges(ContractActualData): ChargeBreakdown`

- `calculateExtensionCharges(ContractId, NewEndDate): ChargeBreakdown`

- `calculateDowngradePenalty(CurrentPlan, TargetPlan, UsageData): PenaltyResult`

Inputs:

- Tariff, seasonal overrides

- Distance, duration

- Any custom rules (minimum rental, grace period, etc.)

Outputs:

- Structured charge lines that become `contract_charges`.

#### `DriverRateService`

- `getDriverRate(DriverId, RateType): RateInfo`

- `calculateDriverCostForPeriod(ContractDriverAssignment): CostResult`

Charges for drivers are just `contract_charges` with type = `DRIVER_SERVICE`, so consistent with main billing.

---

## 7.7 Reservations & Availability Module

**Responsibility:** Forward-looking fleet planning.

### 7.7.1 Entities

- `Reservation`

- `VehicleAvailabilityCache`

### 7.7.2 Services

#### `ReservationService`

- `createReservation(CreateReservationCommand)`

- `confirmReservation(ReservationId)`

- `cancelReservation(ReservationId, reason)`

- `convertReservationToContract(ReservationId): ContractId`

- `listReservationsForPeriod(BranchId, DateRange, Filters)`

#### `AvailabilityService`

- `getAvailabilityForRange(BranchId?, Filters, DateRange): AvailabilityResult`

- `getVehicleCalendar(VehicleId, DateRange): VehicleCalendar`

Uses `vehicle_availability_cache` for fast reads.

#### `AvailabilityRebuildService` (called by cron / events)

- `rebuildForVehicle(VehicleId)`

- `rebuildForBranch(BranchId, DateRange)`

- `rebuildGlobal(DateRange)`

Triggered by:

- Contract events (created/activated/completed)

- Reservation events (created/cancelled/converted)

- Maintenance events

- Transfer events

---

## 7.8 Notifications & OTP Module

**Responsibility:** All messaging; OTP is just a special notification with added security logic.

### 7.8.1 Entities

- `CommunicationProvider`

- `NotificationPurpose`

- `NotificationRoute`

- `NotificationTemplate`

- `NotificationsSent`

- `OtpLog`

### 7.8.2 Services

#### `NotificationService`

Main entrypoint:

- `sendNotification(PurposeCode, NotificationContext): NotificationResult`

Steps:

1. Evaluate purpose & channel prefs:
   
   - For critical/legal: bypass DND/opt-out
   
   - For marketing: enforce opt-in + DND

2. For each channel in routing:
   
   - Get provider from `NotificationRoutingService`
   
   - Render body from `NotificationTemplateService`
   
   - Call provider adapter (SMS/email)
   
   - Handle retries & failover

3. Log result in `notifications_sent`.

#### `NotificationRoutingService`

- Resolves:
  
  - Primary/secondary provider based on:
    
    - Purpose
    
    - Channel
    
    - Branch (if override exists)

#### `NotificationTemplateService`

- Loads `notification_templates` based on:
  
  - Purpose + channel + language

- Performs variable substitution using `NotificationContext`.

#### `OtpService`

- `issueOtpForContract(ContractId, Purpose, TargetContact): OtpResult`

- `verifyOtp(OtpId, CodeEntered): VerificationResult`

Implementation:

- Generate OTP

- Store hashed OTP in `otp_logs` with expiry

- Use `NotificationService` to send OTP

- On verify:
  
  - Check expiry, attempts
  
  - On success → update `otp_logs.verified_at`
  
  - Contract-level hooks called by `ContractLifecycleService` (activate/close etc.)

---

## 7.9 Template Engine Module (Contract Documents)

**Responsibility:** Pixel-accurate, EN/AR aware documents for contracts (and in future, more).

### 7.9.1 Entities

- `Template` (canvas_definition JSON)

- `Document` (generated PDF or scan)

### 7.9.2 Services

#### `TemplateDefinitionService`

- `createTemplate(CreateTemplateDTO)`

- `updateTemplate(TemplateId, UpdateTemplateDTO)`

- `publishTemplate(TemplateId)`

- `getActiveTemplate(Type, BranchId, Language): Template`

Canvas supports:

- Pixel-level drag/drop

- Layers

- Text blocks with variables

- Rectangles/lines/boxes, logos, etc.

#### `DocumentRenderService`

- `renderContractDocument(ContractId, Language): DocumentId`

Steps:

1. Fetch contract + related hirer/vehicle/charges.

2. Resolve variables:
   
   - `{contract_number}`, `{hirer_full_name}`, `{vehicle_plate}`, `{charges_table}` etc.

3. Apply template canvas definition to build HTML.

4. Render HTML to PDF (wkhtmltopdf/headless Chrome/other).

5. Store PDF → `documents` with type `CONTRACT_PDF`.

**Note:**  
This engine is generic; for v1 only **contract** uses it, but architecture supports invoice/receipt in future by adding template types + render methods.

---

## 7.10 Risk & Blacklist Module

### 7.10.1 Entities

- `BlacklistEntry`

- Risk metrics (calculated, not stored in a single risk table; `customers.risk_score`)

### 7.10.2 Services

#### `BlacklistService`

- `checkCustomer(CustomerId): BlacklistResult`

- `checkCompany(CompanyId): BlacklistResult`

- `checkVehicle(VehicleId): BlacklistResult`

- `addToBlacklist(AddBlacklistCommand)`

- `updateBlacklistStatus(BlacklistId, Status, Reason)`

**Contracting integration:**

- `ContractLifecycleService` calls `BlacklistService.check...` during creation/activation.

- Hard block:
  
  - Blocks contract.

- Soft block:
  
  - Requires `MANAGER` override – logged in `audit_logs`.

#### `RiskEngineService`

- `recalculateRiskForCustomer(CustomerId)`

- `recalculateRiskForCompany(CompanyId)`

- `recalculateAllRisks()` (cron)

Inputs:

- Late returns

- Unpaid balances

- Incident count/severity

- Blacklist flags

- Expired IDs/licences

---

## 7.11 Import & Admin Module

### 7.11.1 Entities

- `ImportJob`

### 7.11.2 Services

#### `ImportJobService`

- `createImportJob(UploadFile, EntityType): ImportJobId`

- `startImport(ImportJobId)`

- `getImportStatus(ImportJobId)`

Flow:

1. Parse file and map columns.

2. Validate each row using relevant module services:
   
   - Customer validation uses contracting/fleet constraints.

3. Persist valid rows.

4. Generate error report (CSV/HTML) for failures.

5. Update `import_jobs` status & counters.

---

## 7.12 Cron & Monitoring Module

### 7.12.1 Entities

- `CronJobDefinition`

- `CronJobExecution`

### 7.12.2 Services

#### `CronSchedulerService`

- Registers jobs against cron expressions.

- Triggers appropriate application services at schedule.

#### `CronExecutionService`

- Wraps each job execution with:
  
  - Start/finish timestamps
  
  - Status (`SUCCESS`, `FAILED`, `TIMEOUT`)
  
  - Error capture

- Writes into `cron_job_executions`.

#### `CronFailureAlertService`

- Periodically scans:
  
  - Jobs with consecutive failures ≥ threshold.

- On threshold:
  
  - Triggers `NotificationService` with `CRON_FAILURE_ALERT` purpose.
  
  - Sends HTML summary to admin emails.
  
  - May send SMS to IT ops.

> This incorporates and expands `emailOutputOnFailure()` behaviour into a **central, observable, multi-job watchdog**.

---

## 7.13 Mobile / Portal Integration Module

For v1:

- Exposes a **read-only API** to mobile app / future portal.

### 7.13.1 Services

#### `MobileContractQueryService`

- `listContractsForDriver(DriverId)`

- `getContractDetailsForDriver(ContractId, DriverId)`

#### `MobileVehicleQueryService`

- `getAssignedVehicle(ContractId, DriverId)`

These are thin wrappers over domain queries, but enforce:

- Driver-level security (only contracts where driver is current/assigned)

- Multi-branch constraints

# 🚀 PART 8 – AVAILABILITY ENGINE

Algorithms, refresh logic, and query patterns

Goal: **Fast, reliable, cross-branch availability** without frying the DB when you hit month-views and multiple branches.

---

## 8.1 Core Concepts

We treat **availability** as a **materialized, denormalised view** of:

- Contracts (ACTIVE / RESERVED / COMPLETED in window)

- Reservations

- Maintenance jobs

- Transfers

- Hard blocks (accidents, under repair, etc.)

Key principle:

> “Write is slightly more expensive, read must be cheap.”

So we **pay the cost** during updates to keep **queries simple & fast**.

---

## 8.2 Data Structures

We already defined:

### 8.2.1 `vehicle_availability_cache`

- **Grain:** **per-vehicle per-day per-branch**

- This is *not* per-hour to keep row count manageable.

Columns (already defined):

- `vehicle_id`

- `branch_id`

- `date`

- `status` (`FREE`, `RESERVED`, `OUT`, `MAINTENANCE`, `TRANSFER`, `BLOCKED`)

- `source` (e.g., `CONTRACT`, `RESERVATION`, `MAINTENANCE`, `TRANSFER`)

Key uniqueness: `(vehicle_id, date)`.

Internal convention:

- A day can have **only one primary status** per vehicle.

- Priority when multiple sources overlap:
  
  1. `OUT` (ACTIVE contract)
  
  2. `MAINTENANCE`
  
  3. `TRANSFER`
  
  4. `RESERVED`
  
  5. `BLOCKED`
  
  6. `FREE`

So when we recompute, we use a **priority stack** to decide final effective status.

---

## 8.3 Time Rules

### 8.3.1 Day-level Representation

Even though contracts, reservations, etc., use timestamps, the availability cache stores **whole days**:

- A contract from `2025-03-10 10:00` to `2025-03-13 16:00` marks:
  
  - 10, 11, 12, 13 as “occupied” days.

- Grace periods (late return grace) are handled in **pricing**, not availability.

### 8.3.2 Edge Cases

- **Same-day back-to-back rentals** are allowed when:
  
  - Contract A ends at 10:00, contract B starts at 11:00.

- The daily cache is conservative:
  
  - Both contracts mark that day as “occupied”.

- For **fine-grained hour-level** availability (e.g., for time pickers), we:
  
  - Query active contracts directly for those specific hours when needed.

- For UI calendar views (“is this car free this week?”), daily is enough.

---

## 8.4 Sources Driving Availability

Every “occupant” is a **time range**:

1. **Contract ACTIVE / OUT**
   
   - From `start_datetime_planned` or `start_datetime_actual` (actual if present)
   
   - To `end_datetime_planned` or `end_datetime_actual` (depending on status)

2. **Reservation**
   
   - From `start_datetime` to `end_datetime`
   
   - Status must be `PENDING` or `CONFIRMED`

3. **Maintenance Job**
   
   - From `planned_start` (or `actual_start`)
   
   - To `planned_end` (or `actual_end`)

4. **Transfer**
   
   - From `dispatch_datetime` to `arrival_datetime`

5. **Manual Block / Retired** (future – not defined as table separately, but status/flags in vehicle can be used to mark long-term unavailability)

---

## 8.5 Write-Side Logic (How Cache is Maintained)

### 8.5.1 General Pattern

Every time a **time range–related entity** is created/changed:

1. Application service commits entity transaction.

2. It emits a domain event (e.g., `ContractActivated`, `ReservationCreated`, `MaintenanceStarted`).

3. `AvailabilityService` (or `AvailabilityRebuildService`) subscribes to that event:
   
   - It recomputes availability for the **affected vehicle(s)** and **affected date range**.

4. `vehicle_availability_cache` rows are **upserted** for each day.

This avoids scanning everything.

---

### 8.5.2 Contract Events

Events triggering availability recompute:

- `ContractCreated` (planned start, but still DRAFT)
  
  - Option: we **do NOT** mark availability yet in cache. Contract only blocks when ACTIVE (or optionally RESERVED if you treat DRAFT as blocking – but recommended: only BLOCK when `ACTIVE` or `RESERVED`).

- `ContractActivated`
  
  - Now the vehicle is `OUT` from `start_datetime_actual` (or planned) to `end_datetime_planned`.
  
  - For that date range:
    
    - Delete existing cache rows for those days (for that vehicle).
    
    - Rebuild from all overlapping entities (contracts/reservations/etc.) OR simply apply deltas if performance-sensitive.

- `ContractCompleted`
  
  - Vehicle is returned, `end_datetime_actual` known.
  
  - Rebuild from start to end.

- `ContractClosed`
  
  - No direct availability impact; completion already accounted.

### 8.5.3 Reservation Events

- `ReservationCreated`

- `ReservationCancelled`

- `ReservationExpired`

- `ReservationConverted` (into contract)

For each:

- Date range from reservation

- Recompute that range for the vehicle or group.

If reservation is **group-based** (no specific vehicle), two options:

1. **Simple v1**: only block at group level in **search**, not in per-vehicle cache. Reservation doesn’t choose specific vehicle until it converts.

2. **More advanced** (can be provisioned): assign “virtual vehicle” allocation at search time. For now, **we keep v1 simple** – only contract or vehicle-specific reservation enters the daily cache.

### 8.5.4 Maintenance & Transfer Events

Maintenance:

- `MaintenanceStarted` → mark days as `MAINTENANCE`

- `MaintenanceCompleted` → free or recompute range

Transfers:

- `TransferStarted` → mark days as `TRANSFER`

- `TransferCompleted` → new **branch** gets the vehicle; rebuild the cache for destination branch starting from arrival date.

---

## 8.6 Rebuild Algorithm (Per Vehicle)

Pseudo-algorithm for `AvailabilityRebuildService.rebuildForVehicle(vehicleId, dateFrom, dateTo)`:

```pseudo
1. Delete FROM vehicle_availability_cache
   WHERE vehicle_id = :vehicleId
     AND date BETWEEN :dateFrom AND :dateTo

2. Collect all relevant segments for that vehicle & date range:

   segments = []

   // Contracts
   for each contract where
      contract.vehicle_id = vehicleId
      AND (status IN ('ACTIVE','COMPLETED','RESERVED?') )
      AND contract date range overlaps [dateFrom, dateTo]:
        segments.append({
           type: 'CONTRACT',
           status: statusToAvailability(contract.status), // OUT or RESERVED
           from: contract.startDate(),
           to: contract.endDate()
        })

   // Reservations (vehicle-specific)
   for each reservation where
      reservation.vehicle_id = vehicleId
      AND (status IN ('PENDING','CONFIRMED'))
      AND reservation date range overlaps [dateFrom, dateTo]:
        segments.append({ type:'RESERVATION', status:'RESERVED', from:..., to:... })

   // Maintenance
   for each maintenance job overlapping that range:
        segments.append({ type:'MAINTENANCE', status:'MAINTENANCE', from:..., to:... })

   // Transfers
   for each transfer overlapping:
        segments.append({ type:'TRANSFER', status:'TRANSFER', from:..., to:... })

3. For each day D in [dateFrom, dateTo]:

   applicableSegments = segments where D ∈ [from,to]

   if applicableSegments empty:
      status = 'FREE'
      source = NULL
   else:
      // Choose highest priority
      pick the one with priority:
        OUT > MAINTENANCE > TRANSFER > RESERVED > BLOCKED
      status = picked.status
      source = picked.type

   INSERT INTO vehicle_availability_cache (vehicle_id, branch_id, date, status, source, created_at, updated_at)
   VALUES (vehicleId, effectiveBranchIdForDay(D), D, status, source, now, now)
```

**Note:**  
`effectiveBranchIdForDay` is usually the vehicle’s `branch_id`, except during transfer period where the “logical branch” might be from-branch or in-transit. For v1, we can keep branch = **where the vehicle is considered to belong that day**:

- Before `dispatch_datetime`: from-branch

- Between dispatch & arrival: from-branch or special branch (“in transit”) – we can choose from-branch; the status is TRANSFER anyway.

- After arrival: to-branch

---

## 8.7 Query Patterns (How UI / APIs Use This)

### 8.7.1 Check Availability for a Single Vehicle & Period

API: `isVehicleAvailable(vehicleId, requestedFrom, requestedTo)`

Steps:

1. Translate timestamp range into **date range**.

2. Query:

```sql
SELECT status
FROM vehicle_availability_cache
WHERE vehicle_id = :vehicleId
  AND date BETWEEN :dateFrom AND :dateTo
  AND status <> 'FREE';
```

- If any row → **not available**.

- If none → **available**.

For **hour-level precision**, we then optionally:

- Double-check with contracts/reservations for exact overlap, to support same-day back-to-back rentals.

---

### 8.7.2 Search Free Vehicles in Branch (or Across Branches)

API: `searchAvailableVehicles(branchIds[], class/group filters, from, to)`

1. Get date range (dFrom, dTo).

2. Query:

```sql
SELECT v.id, v.plate_number, v.vehicle_class_id, v.vehicle_group_id, vac.branch_id
FROM vehicles v
JOIN vehicle_availability_cache vac
  ON vac.vehicle_id = v.id
WHERE vac.branch_id IN (:branchIds)
  AND vac.date BETWEEN :dateFrom AND :dateTo
  AND vac.status = 'FREE'
  -- apply class/group filters on v
GROUP BY v.id, vac.branch_id
HAVING COUNT(*) = DATEDIFF(:dateTo, :dateFrom) + 1;
```

This ensures the vehicle is FREE for **every** day in the requested interval.

---

### 8.7.3 Calendar View for a Vehicle

API: `getVehicleCalendar(vehicleId, month)`

Single query:

```sql
SELECT date, status, source
FROM vehicle_availability_cache
WHERE vehicle_id = :vehicleId
  AND date BETWEEN :monthStart AND :monthEnd
ORDER BY date;
```

Front-end renders:

- Color-coded bars (OUT, RESERVED, MAINTENANCE, TRANSFER).

---

### 8.7.4 Contracts Due Today / Overdue

We may combine **contracts** table and availability.

Simplest:

```sql
-- Due today
SELECT *
FROM contracts
WHERE status = 'ACTIVE'
  AND DATE(end_datetime_planned) = CURDATE();

-- Overdue
SELECT *
FROM contracts
WHERE status = 'ACTIVE'
  AND end_datetime_planned < NOW();
```

Availability cache is more for “forward planning” than overdue detection, but you can cross-check if needed.

---

## 8.8 Performance & Scaling Strategy

### 8.8.1 Row Count Estimation

Assume:

- 500 vehicles

- 365 days in cache maintained

- 500 × 365 ≈ 182,500 rows → trivial for MySQL/Postgres.

Even with 2,000 vehicles, it is still very manageable.

If you want to:

- Keep 2-years history:
  
  - 500 × 730 ≈ 365k rows → still small.

- For very large fleets (10k vehicles), you might:
  
  - Partition by `date` (monthly partitions).
  
  - Or keep only rolling 12–18 months.

### 8.8.2 Indexing

Indexes already defined:

- `UNIQUE (vehicle_id, date)`

- `KEY (branch_id, date)`

Possible extra:

- `KEY (status, date)` for global queries (e.g., “all OUT vehicles on date X”).

### 8.8.3 When to Rebuild Full vs Partial

- **Partial** rebuild (per vehicle, per small date window) → on every event.

- **Full** rebuild (branch/month/global) only:
  
  - If you change algorithm
  
  - After major data import
  
  - Or as maintenance via Admin/DevOps tool.

`AvailabilityRebuildService` supports both:

- `rebuildForVehicle(vehicleId, range)`

- `rebuildForBranch(branchId, range)`

- `rebuildGlobal(range)`

---

## 8.9 Consistency & Edge Cases

### 8.9.1 Race Conditions

Two operations happening at the same time:

- Maintenance start vs Contract activation

- Reservation vs Contract

Strategy:

- Each business operation is a transaction updating core tables.

- Availability rebuild runs **serially** after commit.

- If multiple events fire almost simultaneously for same vehicle:
  
  - They rebuild same ranges.
  
  - Final result is deterministic because source priority is **embedded** in algorithm.

### 8.9.2 Manual Overrides

- Admin may mark a vehicle as **BLOCKED** (e.g., legal hold).

- We can:
  
  - Either add a separate `vehicle_blocks` table; or
  
  - Use `vehicles.status = 'BLOCKED'` with a rule that:
    
    - Rebuild always sets any date as BLOCKED if vehicle status = BLOCKED.

- In v1 you can keep it simple and treat `vehicles.status` as a global override.

---

## 8.10 How This Aligns with the Rest of the System

- **Contracting** never queries raw contracts to check availability for UI; it calls **AvailabilityService**.

- **Reservations** use availability to propose vehicles.

- **Fleet operations** (maintenance/transfer) rely on the cache to avoid double-booking.

- **Dashboards** (fleet utilisation, branch performance) read from:
  
  - `contracts` for revenue
  
  - `vehicle_availability_cache` for utilisation (how many days OUT).

# 🚀 PART 9 – FINANCIAL & REPORTING LAYER

Objective: **give management a single source of truth for money & fleet**, without turning KarāraOS into a half-baked ERP.

We’ll keep it:

- Operational (daily usable in the branches)

- Structured enough for proper finance

- Ready to feed an external BI later

---

## 9.1 Reporting Scope (What we must cover)

From everything we discussed, the reporting layer must support:

1. **Daily / Monthly Revenue**
   
   - Per branch + overall
   
   - Per payment method (cash/card/bank)
   
   - Per product type (rent vs driver vs extras vs fuel vs penalties vs excess)

2. **Outstanding Balances & AR**
   
   - Contracts with unpaid amounts
   
   - AR aging buckets (0–30 / 31–60 / 61–90 / 90+)
   
   - Corporate vs retail breakdown

3. **Branch Performance**
   
   - Revenue, #contracts, average ticket size
   
   - Overdue returns
   
   - Write-offs / disputes

4. **Vehicle Utilisation**
   
   - Days OUT vs days AVAILABLE
   
   - Utilisation % per vehicle and per class/group
   
   - Fleet-level utilisation by branch

5. **Cash & Shift Closing**
   
   - Reconciliation per shift / per cashier (optional but recommended)
   
   - Cash vs POS vs bank movements vs system totals

6. **VAT / Tax Overview**
   
   - Taxable amounts vs VAT amounts
   
   - Summary by period for filing
   
   - Sync with tax invoice numbering when that’s implemented later

All of this must work **with AED only** today but not block multi-currency later.

---

## 9.2 Reporting Architecture

We’ll use three layers:

1. **Source tables (already defined)**
   
   - `contracts`, `contract_charges`, `payments`, `incidents`, `vehicle_availability_cache`, `customers`, `companies`

2. **Reporting views (SQL views) – real time**
   
   - `vw_contract_financials`
   
   - `vw_payments_detailed`
   
   - `vw_ar_open_items`
   
   - `vw_ar_aging`
   
   - `vw_vehicle_utilisation_daily`
   
   - `vw_branch_kpis_daily`

3. **Summary tables (optional but recommended for performance)**
   
   - `summaries_daily_branch`
   
   - `summaries_daily_vehicle`
   
   - These are populated by **cron jobs** once per day (and can be backfilled/rebuilt).

Idea: the **operational dashboards** use a mix of views + summaries.  
Heavy-monthly reports (for finance) can use summary tables.

---

## 9.3 Metric Definitions (No ambiguity)

### 9.3.1 Revenue

Two ways:

- **Cash Basis (v1 default)**
  
  - Revenue on a given day = sum of `payments` with `direction = 'IN'`, `status = 'CONFIRMED'`, grouped by `paid_at` date.

- **Accrual Basis (provision, future)**
  
  - Revenue recognised when the service is delivered (based on contract date range and `contract_charges`).

We implement **cash basis in v1 UI**, but design the schema to support **accrual in future** via additional derived views.

### 9.3.2 Outstanding Balance

For each contract:

`outstanding_amount = (total_charges) – (total_payments_in – total_payments_out)`

Already tracked on `contracts`.  
Reports just **filter where `outstanding_amount > 0`**.

### 9.3.3 AR Aging Buckets

For each contract with `outstanding_amount > 0`:

- `due_date` logic:
  
  - For **retail**: due date = `end_datetime_actual` or closure date (same day).
  
  - For **corporate**: due date = closure date + `company.payment_terms_days` (if set).

- Compute **days past due** = `today – due_date`.

Buckets:

- `0–30 days`

- `31–60 days`

- `61–90 days`

- `> 90 days`

We’ll expose these via `vw_ar_aging` and a summary report.

### 9.3.4 Vehicle Utilisation

For each vehicle over a period:

- `total_days = number of days in range`

- `out_days = count of days where availability.status = 'OUT'`

- `utilisation_pct = out_days / total_days * 100`

Variants:

- Per **vehicle**

- Per **vehicle_class**

- Per **vehicle_group**

- Per **branch**

This makes your utilisation calculation transparent and auditable.

---

## 9.4 Daily Closing / Shift Closing Workflow

We need an **operational flow** the branches actually use every day.

### 9.4.1 Data Structures (lightweight additions)

You *can* implement shift/closing as:

- A simple **report-only** (no table), or

- A **proper entity**.

I recommend a simple but explicit table:

### `cash_closings`

| Column             | Notes                                    |
| ------------------ | ---------------------------------------- |
| id                 | PK                                       |
| branch_id          | Which branch                             |
| clerk_user_id      | Operator doing closing                   |
| shift_start_at     | Optional, or derive from last closing    |
| shift_end_at       | Time of close                            |
| system_cash_total  | Sum of cash IN from `payments` in period |
| system_card_total  | Sum of card IN                           |
| system_bank_total  | Sum of bank IN                           |
| counted_cash_total | Physically counted cash                  |
| difference_cash    | counted - system                         |
| notes              | Discrepancy reasons etc.                 |
| created_at         | Timestamp                                |

Not essential for v1 **if you’re not enforcing shifts**, but it’s cheap to support and strongly recommended in a real operation.

### 9.4.2 Closing Workflow

**Shift Closing Use Case:**

1. User selects:
   
   - Branch
   
   - Time window (or “since last closing”).

2. System computes from `payments`:
   
   - `cash_in`, `card_in`, `bank_in`

3. User counts actual:
   
   - `counted_cash`, enters it.

4. System:
   
   - Shows `difference_cash`
   
   - Stores record in `cash_closings`

5. Optional:
   
   - PDF/print for manager’s sign-off.
   
   - Email summary via `NotificationService` to branch manager / finance.

This can be used for **daily branch closing** or **shift-level closing** depending on how you operate.

---

## 9.5 Core Reporting Views & Screens

Let’s specify what *screens* you need; devs can fall back to these as acceptance criteria.

### 9.5.1 Daily / Monthly Revenue Report

**Filters:**

- Date range (single day / month)

- Branch (single or all)

- Payment method (all / cash / card / bank)

- Party type (retail / corporate)

**Data:**

Per row (granularity = per day per branch):

- Date

- Branch

- Revenue (total)

- Revenue by method:
  
  - `cash_total`
  
  - `card_total`
  
  - `bank_total`

- Counts:
  
  - `contracts_closed_count`
  
  - `payments_count`

Later you can expand to:

- Revenue by charge type (rent vs driver vs extras vs penalties vs VAT).

### 9.5.2 Outstanding Balances / Open AR

**Filters:**

- Branch

- Customer or company

- Age (> X days, e.g., >30, >60)

**Columns:**

- Contract no

- Branch

- Hirer & sponsor/company

- Contract dates

- Total charges

- Total paid

- Outstanding amount

- Days overdue

- Dispute status (if any)

### 9.5.3 AR Aging Report

**Output:**

- For each customer and/or company:
  
  - Customer/Company name
  
  - 0–30 bucket total
  
  - 31–60
  
  - 61–90
  
  - 90+
  
  - Total

**Export:** Excel/CSV for finance.

### 9.5.4 Branch Performance Dashboard

**High-level tiles (per branch, for selected period):**

- Total revenue

- # new contracts

- Avg invoice per contract

- # overdue contracts

- # new incidents

- Utilisation % (avg over period)

Visuals:

- Bar chart: revenue by branch

- Table: top N branches by revenue/utilisation

### 9.5.5 Vehicle Utilisation Report

**Filters:**

- Branch

- Vehicle class/group

- Date range

**Per vehicle:**

- Plate

- Class/group

- Days in period

- Days OUT

- Utilisation %

- Number of contracts

- Revenue generated (optional)

Aggregates:

- Average utilisation by class/group/branch.

---

## 9.6 Implementation Approach – Views & Summaries

### 9.6.1 Financial Views

Examples (conceptual):

- `vw_payments_detailed`
  
  - Join `payments` with `contracts`, `branches`, `customers`, `companies`.

- `vw_contract_financials`
  
  - Derived fields for contract-level totals & status.

- `vw_ar_open_items`
  
  - Where `contracts.outstanding_amount > 0`.

- `vw_ar_aging`
  
  - Adds `days_overdue` and bucket columns.

These can be normal SQL views or DB-layer mapping in Laravel.

### 9.6.2 Summary Tables

Two recommended tables:

#### `summaries_daily_branch`

Columns:

- `branch_id`

- `date`

- `total_revenue_cash`

- `total_revenue_card`

- `total_revenue_bank`

- `contracts_started`

- `contracts_closed`

- `active_contracts_end_of_day`

- `avg_utilisation_pct` (optional)

- `created_at`, `updated_at`

#### `summaries_daily_vehicle`

- `vehicle_id`

- `date`

- `status` (majority-of-day)

- `is_out` (1/0)

- `utilisation_contribution` (0 or 1)

- Could be derived directly from `vehicle_availability_cache`, but you can pre-aggregate for speed.

**Cron job:** `DailySummaryJob`

- Runs after midnight (e.g., 02:00).

- Reads `payments`, `contracts`, `vehicle_availability_cache`.

- Inserts/updates daily summaries.

- Any failure triggers `CronFailureAlertService`.

---

## 9.7 VAT / Tax Handling in Reporting

You specified:

- VAT% set in **settings**.

- Different rates for different services (rental vs driver vs extras) → **provision now, single rate in practice for UAE, but architecture must support categories.**

- Tax invoice numbering & contract numbering must be configurable (we’ve done sequences).

### 9.7.1 VAT Config

- `system_settings` holds:
  
  - `VAT_ENABLED` (bool)
  
  - `VAT_RATE_DEFAULT` (numeric)
  
  - `VAT_RATE_RENTAL`, `VAT_RATE_DRIVER`, `VAT_RATE_EXTRAS` (future)
  
  - `VAT_REG_NO` per branch / company if needed.

### 9.7.2 VAT on Charges

- Each line in `contract_charges` has:
  
  - `type`
  
  - `tax_category` (e.g., `RENTAL`, `DRIVER`, `EXEMPT`)

- VAT calculation logic lives in `BillingService`:
  
  - v1: single rate applied to all taxable lines.

- For reporting:
  
  - A view or query groups by `tax_category` and `VAT_RATE`.

### 9.7.3 Tax Invoice Numbering

We **provisioned** `sequences` for `TAX_INVOICE`.  
Even though the actual invoice document is **provision only** in v1, the reporting layer can still:

- Associate each “finalisation event” (like contract closure) with a future invoice id.

- Or simply rely on contract no as invoice reference until invoice is implemented.

For now:

- VAT report uses:
  
  - Contract-level totals
  
  - Per-charge VAT breakout
  
  - Date range (month/quarter).

---

## 9.8 Security & Data Access for Reports

- Only users with roles like `BRANCH_MANAGER`, `FINANCE`, `HQ_ADMIN` should see financial reports.

- Strict filters:
  
  - Branch-level users only see their branch and allowed cross-branch views if permitted.

- Export to:
  
  - CSV/Excel
  
  - PDF (for specific reports like AR aging or daily revenue summary)

All export actions should be:

- Logged in `audit_logs` with:
  
  - `action = 'REPORT_EXPORT'`
  
  - `entity_type = 'REPORT'`
  
  - `metadata` containing report name & filters.

# 🚀 PART 10 — OPERATIONAL DASHBOARDS & UX FLOWS

What every branch staff, supervisor, manager, and HQ sees  
*Fully aligned with workflows, finance layer, availability engine, templates, and notifications.*

KarāraOS dashboards are **operational**, not cosmetic.  
They drive decision-making in real time.

We define *every screen*, *every widget*, *every KPI*, *every drill-down*, with **zero ambiguity**.

---

# 10.1 Dashboard Types

KarāraOS ships with **four** major dashboard classes:

1. **Branch Operations Dashboard** (for reception, supervisor, branch manager)

2. **Fleet Dashboard** (for operations, maintenance, HQ logistics)

3. **Financial Dashboard** (for branch manager & finance)

4. **HQ Master Dashboard** (cross-branch control view)

Plus:  
5. **Automation & Cron Health Dashboard** (for IT/Tech Ops)

Each dashboard is defined with:

- Widgets

- KPIs

- Drill-downs

- Filters

- Required data sources

- Role-based visibility

---

# 🔵 10.2 Branch Operations Dashboard

*(This is the home screen for operational staff)*

## 10.2.1 Widgets & KPIs

### **(1) Active Contracts**

- Count of active contracts

- Quick view:
  
  - Contract number
  
  - Hirer name
  
  - Vehicle plate
  
  - Expected return time (colored by urgency)

Drill-down:

- Opens “Active Contracts” table with filters.

### **(2) Due Today**

- Contracts whose `end_datetime_planned` = today

- Shows:
  
  - Contract ID
  
  - Hirer
  
  - Vehicle
  
  - Return time

- Color codes:
  
  - Green: 0–2 hours left
  
  - Amber: 2–6 hours
  
  - Red: overdue

### **(3) Overdue Returns**

- Count

- List:
  
  - Contract ID
  
  - Customer
  
  - Delay duration
  
  - Contact buttons (call, WhatsApp, SMS) — optional in v1

### **(4) Outstanding Balances**

- Count & total AED outstanding for branch

- Drill-down → “Open AR” for branch only

### **(5) Walk-In Vehicle Availability**

- Visual tile:  
  “**X vehicles available across all groups**”

- Quick filters:
  
  - Sedans
  
  - SUVs
  
  - Vans
  
  - Luxury

Drill-down:

- Opens filtered availability view using `vehicle_availability_cache`.

### **(6) Pending Actions**

- Items requiring operator/supervisor attention:
  
  - Pending incidents
  
  - Pending deposit releases
  
  - Pending amendments
  
  - Pending driver change
  
  - Pending transfer arrival
  
  - Failed notifications (critical only)

### **(7) Reservation Summary**

- Reservations today

- Reservations tomorrow

- Expired reservations

- Convert-to-contract quick links

---

# 🔵 10.3 Fleet Dashboard

*(Used by branch operations + HQ fleet team)*

## 10.3.1 Widgets

### **(1) Vehicle Status Distribution**

Pie/Donut chart:

- Available

- Out

- Reserved

- Under maintenance

- Under repair

- In transfer

- Retired

Data from:  
`vehicles`, `vehicle_availability_cache`, `maintenance_jobs`.

### **(2) Utilisation Bar Chart**

For selected date range:

- Vehicle group on X-axis

- Utilisation % on Y-axis

### **(3) Maintenance Queue**

List view:

- Active jobs

- Vehicle

- Job type

- Technician (optional field)

- Planned vs actual duration

- Overdue maintenance markers

### **(4) Transfer Movements**

- Vehicles currently in transit

- Vehicles requested for transfer

- Vehicles awaiting arrival inspection

### **(5) Inspection Failures**

- Vehicles flagged with repeated damage

- Vehicles with > X incidents in last Y months

### **(6) Tyre/Oil Service Reminders** (Optional but common demand)

Not required in v1, but can be **provisioned**.  
Input fields exist in vehicle master:

- `next_service_km`

- `last_service_km`

- `service_interval_km`

---

# 🔵 10.4 Financial Dashboard

*(Branch managers & finance team)*

## 10.4.1 KPIs

### **(1) Today’s Revenue**

- Cash

- Card

- Bank

- Total

Color tags show % change vs yesterday.

### **(2) Revenue Month-To-Date**

- Same breakdown

- Compare to last month or last year same month (optional)

### **(3) Outstanding AR**

- Total AR

- AR buckets:
  
  - 0–30
  
  - 31–60
  
  - 61–90
  
  - 90+

Drill-down:  
Table with contracts + aging details.

### **(4) Deposit Balance Summary**

- Deposits held

- Deposits pending release

- Deposits refunded today

### **(5) Cash Closing Summary**

If `cash_closings` is enabled:

- Last shift closing result

- Difference

- Button: “Start New Closing”

### **(6) Branch Profitability Indicators** (Provision-only)

Not implemented but provisioned:

- Revenue – cost of drivers

- Revenue – claim write-offs

- Branch profitability

---

# 🔵 10.5 HQ Master Dashboard

*(Only available to HQ Admin / Regional Managers)*

## 10.5.1 Components

### **(1) Multi-Branch Status**

Tiles for each branch:

- Active contracts

- Out vehicles

- Revenue today

- Utilisation %

- Incidents today

- Outstanding AR

Color-coded:

- Red → major issues

- Yellow → moderate

- Green → normal

### **(2) Fleet Heatmap**

Grid view:

- Branch vs. vehicle groups

- Number of vehicles

- Utilisation %

- Maintenance %

### **(3) Risk & Compliance Overview**

- Blacklisted customers count

- High-risk customers

- Expired ID/license counts

- Contracts under legal review

- Vehicles with > N incidents

### **(4) Cross-Branch Availability**

- Search any date range

- See vehicles availability across **all branches**

- Ideal for:
  
  - Inter-branch transfers
  
  - Peak season planning

### **(5) Corporate Accounts Overview**

- Top X corporate customers by revenue

- Outstanding amounts

- Fleet assigned

- Incidents linked

---

# 🔵 10.6 Automation & Cron Health Dashboard

*(IT/Tech Ops – already tied to our Cron Failure Architecture)*

## 10.6.1 Components

### **(1) Cron Job Status Board**

Table:

- Job name

- Last run time

- Last duration

- Last result (success/failure)

- Consecutive failure count

- Next run time

Color coding:

- Red: failure

- Amber: degraded

- Green: healthy

### **(2) Cron Failure Alerts Log**

From `notifications_sent`:

- Time

- Recipients

- Error message

- Stack trace (for internal/debug view)

### **(3) Notification Provider Performance**

Monitor:

- Delivery success rate per provider

- Failover events

- SMS/email latency

### **(4) Queue/Lag (if using async processing later)**

Provision-only:

- Pending messages

- Processing speed

---

# 🔵 10.7 User Experience Philosophy

Every dashboard follows these principles:

### **1. Zero clutter**

All metrics are operational, not vanity.

### **2. Three-click rule**

Any KPI should allow the user to drill-down into actionable data within **3 clicks**.

### **3. Real-time but sustainable**

- No live WebSockets unless absolutely needed.

- Refresh every 30–60 seconds (configurable).

- Heavy metrics use summary tables.

### **4. Arabic + English UI**

Dashboard components adapt automatically based on user preference.

### **5. Role-based visibility**

- Receptionists see daily operations, not financials.

- Finance sees AR and revenue, not vehicle-level data.

- HQ sees everything.

---

# 🔵 10.8 Navigation Structure

Common top navigation:

```
Dashboard
Contracts
Reservations
Vehicles
Maintenance
Incidents
Customers
Companies
Payments
Reports
Administration
```

Dashboard pages then include tabs:

- **Branch Dashboard**

- **Fleet**

- **Finance**

- **HQ Dashboard** (visible only for HQ roles)

- **Automation**

Each tab is fully defined above.

---

# 🔵 10.9 Missing UI Workflow Integration (now added)

To align with **Master Feature List** and **Architecture**, we integrate:

- **Payment confirmation notifications** → Dashboard indicator under “Recent Transactions”

- **Deposit releases pending** → Branch dashboard alerts

- **Contract template versions** → Admin > Templates, but notifications show if template is missing/mismatched

- **Overdue maintenance** → Fleet dashboard

- **Abandoned vehicles** → Branch + HQ alert

- **Transfer accidents** → Fleet + HQ alert

All fully compatible with our Reporting and Module architecture.

# 🚀 **PART 11 – NOTIFICATION ENGINE (FULL-SCALE SPECIFICATION)**

This module is **mission-critical** because KarāraOS depends heavily on OTP, alerts, confirmations, and operational messaging.

This section defines:

- Notification purposes (complete list)

- Routing logic

- Provider priority & fallback

- Template engine (SMS/Email)

- Variable binding

- DND logic

- Delivery logging

- Error handling

- Provider adapter architecture

- Sandbox vs production

- Configuration UI

- OTP subsystem

- Integration with Cron watchdog

Everything is included. Nothing is ambiguous.

---

# 🔵 **11.1 Goals of the Notification Engine**

The engine must:

1. Deliver messages **reliably**, even when providers fail.

2. Be **provider-agnostic** (Twilio, generic HTTP, M365, SMTP, others).

3. Support **multi-channel**: SMS, Email, WhatsApp (provision), Push (future).

4. Support **multi-language** EN/AR dynamically.

5. Honor **customer preferences** & **DND**, except for legal/critical messages.

6. Support **template versioning**.

7. Log everything for **audit & incident analysis**.

8. Handle **OTP lifecycle** seamlessly.

9. Integrate with **Cron Failure Monitoring**.

---

# 🔵 **11.2 Notification Purposes (Complete List)**

*Every purpose is treated as a logical event type.*

### **Contract Lifecycle**

- `CONTRACT_OTP`

- `CONTRACT_ACTIVATED`

- `CONTRACT_EXTENDED`

- `CONTRACT_AMENDED`

- `CONTRACT_COMPLETED`

- `CONTRACT_CLOSED`

- `CONTRACT_CANCELLED`

### **Financial**

- `PAYMENT_CONFIRMATION`

- `DEPOSIT_COLLECTED`

- `DEPOSIT_REFUNDED`

- `EXCESS_PAYMENT_REQUEST`

- `REFUND_PROCESSED`

### **Operational Alerts**

- `RESERVATION_CONFIRMED`

- `RESERVATION_EXPIRING`

- `RESERVATION_CANCELLED`

- `DUE_TODAY_REMINDER`

- `OVERDUE_RETURN_ALERT`

- `VEHICLE_READY_FOR_PICKUP`

- `VEHICLE_TRANSFER_DISPATCHED`

- `VEHICLE_TRANSFER_ARRIVED`

### **Maintenance**

- `MAINTENANCE_STARTED`

- `MAINTENANCE_COMPLETED`

### **Risk/Compliance**

- `ID_EXPIRY_REMINDER`

- `LICENSE_EXPIRY_REMINDER`

- `BLACKLIST_ALERT` (internal)

### **Incidents**

- `INCIDENT_CREATED`

- `INCIDENT_UPDATED`

- `INSURANCE_CLAIM_OPENED`

- `INSURANCE_CLAIM_SETTLED`

### **IT / Monitoring**

- `CRON_FAILURE_ALERT`

- `CRON_RECOVERY_ALERT`

- `PROVIDER_HEALTH_ALERT`

### **Marketing / Campaigns**

- `CAMPAIGN_BROADCAST` (opt-in required; DND enforced)

---

# 🔵 **11.3 Channels**

Available in v1:

- **SMS**

- **Email**

Provisioned for future:

- WhatsApp API

- Push notifications (mobile app)

- In-app messaging (portal)

---

# 🔵 **11.4 Routing Logic & Priority**

Routing is defined by:

1. **Notification Purpose**

2. **Branch-level overrides**

3. **Provider priority list**

4. **Customer channel preferences**

5. **Legal/critical priority**

### Example Priority Table

| Purpose              | Channels             | Priority  | Notes                 |
| -------------------- | -------------------- | --------- | --------------------- |
| OTP                  | SMS → Email fallback | Critical  | DND ignored           |
| Payment Confirmation | Email → SMS fallback | Mandatory | DND ignored           |
| Contract Activated   | SMS → Email          | Critical  | DND ignored           |
| Due / Overdue        | SMS only             | Important | Respect DND           |
| Campaign             | Email preferred      | Low       | DND + opt-in required |

---

# 🔵 **11.5 DND (Do Not Disturb) Logic**

**Respects DND if:**

- Notification purpose ≠ critical

- Notification purpose ≠ OTP

- Notification purpose ≠ legal requirement

**DND ignored for:**

- OTP

- Contract lifecycle (activation/closure)

- Incidents

- Cron failure alerts

- Payment confirmations

- Fraud/risk alerts

---

# 🔵 **11.6 Provider Selection Algorithm**

For a given notification:

1. Identify allowed channels for purpose

2. Check customer preferences

3. For each channel:
   
   - Check routing config → provider list (primary → fallback)

4. Try provider #1

5. If fail:
   
   - Try provider #2

6. If all fail:
   
   - Convert to Email (fallback-of-last-resort)

7. Record success/failure with error message

---

# 🔵 **11.7 Provider Adapters**

The system must support:

### **SMS Providers**

- Twilio

- Generic HTTP (URL + API key)

- Local SMS gateway (common in UAE)

### **Email Providers**

- Generic SMTP

- **M365 (must add)**

- Gmail/Google Workspaces SMTP

- SendGrid (provision)

- Amazon SES (provision)

### **Common Adapter Interface**

```pseudo
interface SmsProvider {
  sendSms(to, message, metadata): ProviderResult
}

interface EmailProvider {
  sendEmail(to, subject, htmlBody, textBody, metadata): ProviderResult
}
```

All providers must return:

```json
{
  "success": true/false,
  "provider_message_id": "...",
  "error": "..."
}
```

---

# 🔵 **11.8 Notification Template Engine (Messaging)**

Each purpose has **template sets**:

- EN (SMS)

- AR (SMS)

- EN (Email HTML)

- AR (Email HTML)

### Stored in:

`notification_templates`:

| Field        | Description                     |
| ------------ | ------------------------------- |
| purpose_code | e.g., PAYMENT_CONFIRMATION      |
| channel      | sms/email                       |
| language     | en/ar                           |
| subject      | for email                       |
| body_text    | SMS version                     |
| body_html    | Email version                   |
| variables    | JSON list of allowed variables  |
| version      | Auto increment                  |
| is_active    | Which version is currently used |

### Variables

All templates support dynamic variables via:

- Contract variables

- Customer variables

- Vehicle variables

- Payment variables

- Branch variables

Examples:

```
{contract_number}
{hirer_name}
{vehicle_plate}
{start_date}
{end_date}
{amount}
{deposit_amount}
{branch_phone}
{company_name}
```

Template engine resolves variables before sending.

---

# 🔵 **11.9 Notification Context Model**

All notification calls pass a **context object**:

```json
{
  "contractId": 112,
  "customerId": 541,
  "language": "EN",
  "amount": 200,
  "paymentMethod": "CASH",
  "branchId": 3,
  "extras": { ... }
}
```

---

# 🔵 **11.10 OTP Subsystem**

OTP is fully integrated into notifications:

### OTP lifecycle:

1. Generate OTP (6 digits)

2. Hash & store in `otp_logs`

3. Send via NotificationService (SMS preferred)

4. Verify:
   
   - Check expiry
   
   - Check attempts
   
   - Mark as verified

5. Contract activation/closure only allowed after OTP success

### OTP Security Rules:

- Expiry: 3 mins (configurable)

- Max attempts: 3

- Rate limiting:
  
  - Max 3 OTPS / 10 minutes per user

- OTP logs audited:
  
  - IP
  
  - Device ID (mobile)
  
  - Phone/email target
  
  - Contract reference

---

# 🔵 **11.11 Notification Logging & Audit**

All messages logged in:

`notifications_sent`:

- `purpose_code`

- `to`

- `channel`

- `provider_id`

- `status`

- `body_snippet`

- `error_message`

- `fallback_used`

- `contract_id`

- `payment_id`

- `incident_id`

- `cron_job_id`

- `created_at`

- `delivered_at`

Used for:

- Troubleshooting

- Compliance

- Delivery analytics

- IT health dashboard

---

# 🔵 **11.12 Communication Provider Flow (End-to-end)**

**This was requested explicitly.**

## **1. Add new provider**

UI steps:

1. Go to  
   `Administration → Communication Providers`

2. Click “Add Provider”

3. Choose type:
   
   - SMS (Twilio / Generic HTTP)
   
   - Email (SMTP / M365 / Generic)

4. Enter configuration:
   
   - API key
   
   - Webhook URL (optional)
   
   - From number / sender ID
   
   - Rate limits
   
   - Sandbox mode toggle
   
   - Priority order

5. Save provider

Backend:

- Writes record into `communication_providers`

- Validates credentials where possible

---

## **2. Test provider**

UI:  
Button: **“Send Test Message”**

Backend:

- Calls provider adapter

- Logs result in `notifications_sent` with purpose = `PROVIDER_TEST`

If test fails → provider remains inactive.

---

## **3. Assign provider to route**

UI:

`Administration → Notification Routing`

Example:

- Purpose: OTP

- Channel: SMS

- Primary Provider: Twilio

- Fallback Provider: “LocalSMS-Gateway”

Stored in:

`notification_routes`

- `purpose_code`

- `channel`

- `provider_sequence` (JSON list)

---

## **4. Provider usage during runtime**

NotificationService:

- Finds route for purpose+channel

- Picks provider #1

- Sends

- If fails → try provider #2

- If all fail:
  
  - For critical messages → email fallback
  
  - For non-critical → store failure

- Logs success/failure with fallback flag

---

## **5. Provider switching**

If Twilio has outage:

- Admin changes route to use LocalSMS-Gateway as primary

- No code change needed

- No deployment needed

- Takes effect instantly

This is critical for **production readiness**.

---

# 🔵 **11.13 Cron Failure Integration**

From `CRON_FAILURE_NOTIFICATIONS.md`, integrated here.

When a cron job fails:

1. Failure recorded in `cron_job_executions`

2. Consecutive failures increment

3. If `>= failure_threshold`:
   
   - Trigger notification:
     
     - Purpose: `CRON_FAILURE_ALERT`
     
     - Channel: Email → SMS fallback
     
     - Recipients:
       
       - All HQ Admins with “cron alerts enabled”

4. Notification contains:
   
   - Job name
   
   - Error message
   
   - Last successful run
   
   - Stack trace
   
   - Suggested remediation

When cron recovers:

- Trigger `CRON_RECOVERY_ALERT`

---

# 🔵 **11.14 Notification Settings Module**

Branch-specific settings:

- Default language (EN/AR)

- Default channels (SMS/email)

- Phone sign-in required or not

- Override provider priorities

- Notification toggles:
  
  - Enable/disable specific purposes
  
  - E.g., disable marketing for certain branches

System-wide settings:

- DND windows

- OTP expiry/minutes

- OTP max attempts

- SMS retry delays

- Email retry delays

---

# 🔵 **11.15 Notification Failure Scenarios & Behavior**

### **Provider Timeout**

→ Retry provider #2.

### **Wrong API credentials**

→ Immediate fail, provider disabled automatically if repeated failures.

### **Recipient unreachable (invalid phone/email)**

→ Log permanent error → notify operator via UI.

### **High-volume provider throttling**

→ Automatic exponential backoff.

### **DND window active**

→ Queue non-critical notifications until DND ends.

### **Critical messages**

→ Delivered immediately regardless of DND.

# 🚀 **PART 12 — PERFORMANCE, CACHING, OPTIMIZATION & SCALABILITY STRATEGY**

KarāraOS needs to perform reliably in **branch-level production environments** where:

- Staff work fast

- Network sometimes fluctuates

- Peak seasons create load spikes

- Data grows continuously (contracts, charges, photos, logs)

- Multi-branch operations create heavy read traffic

Part 12 ensures the system is **fast, resilient, predictable, and cost-efficient**.

---

# ⭐ 12.1 Performance Goals

KarāraOS must meet these baseline expectations:

1. **Contract activation/closure should take < 1 second** end-to-end (excluding OTP wait).

2. **Vehicle availability checks must be instant (< 200ms)**.

3. **Search filters should respond < 300ms**.

4. **Dashboards must load fast (< 1 second)**.

5. **Mobile app API responses < 300ms** on 4G networks.

6. **Minimal server load even with thousands of records** through smart caching.

7. **No performance degradation over time** with audit logs growing large.

---

# ⭐ 12.2 System-Level Performance Strategy

KarāraOS uses **five major performance pillars:**

1. **Caching Layer (in-memory or Redis)**

2. **Availability Cache (materialized state engine)**

3. **Summary tables (pre-aggregation)**

4. **Optimistic concurrency control**

5. **Async/non-blocking notifications & webhooks**

Let's define each one thoroughly.

---

# 🔵 12.3 Caching Strategy — *Critical for production*

### 12.3.1 What must be cached

**High-read, low-write** entities:

| Entity / Data                    | Cache Lifetime         | Why                               |
| -------------------------------- | ---------------------- | --------------------------------- |
| Vehicle groups/classes           | Long TTL (24h)         | Rarely changes                    |
| Branch settings                  | Medium TTL (30–60 min) | Needed on every page              |
| Contract templates               | Medium TTL             | Heavy to parse                    |
| System settings                  | Medium TTL             | Read constantly                   |
| Price lists & seasonal overrides | Medium TTL             | Frequently used in billing        |
| Notification templates           | Short TTL (10–20 min)  | Hot-read on every message         |
| Communication provider configs   | Short TTL              | Used on every send                |
| Permissions/Roles                | Medium TTL             | Every API call checks auth        |
| Company master data              | Medium TTL             | Used heavily by corporate rentals |

**Always-cached** because UI loads them up front:

- Dropdown lists

- Vehicle group hierarchy

- Charge type definitions

- Payment method configs

---

### 12.3.2 Cache Lifetime Philosophy

- **Static data** → cache long

- **Configurable but not frequent** → medium

- **Dynamic/heavy** → short

- **Critical financial numbers** → never cached (always real-time)

---

### 12.3.3 Cache Invalidations (very important)

Every time an admin changes:

- Tariffs

- Templates

- Notification routes

- Branch settings

- Communication providers

- Vehicle groups

- Seasonal rates

→ System must run:

`Cache::forget(key)`  
OR  
Broadcast invalidation event across all instances.

---

# 🔵 12.4 Availability Engine Performance

The **vehicle availability check** is the most frequently used query.

A naive availability query joining:

- vehicles

- contracts

- reservations

- maintenance jobs

…will kill performance as data grows.

### So we use a **materialized availability cache table**:

### `vehicle_availability_cache`

Precomputed fields:

- `vehicle_id`

- `date`

- `status` (AVAILABLE/OUT/RESERVED/MAINTENANCE)

- `contract_id`

- `reservation_id`

- `maintenance_id`

### Performance Benefits

- Any availability query becomes:
  
  ```sql
  SELECT * FROM vehicle_availability_cache WHERE date BETWEEN X AND Y
  ```
  
  → Fast, predictable, index-friendly.

- Search across ALL branches is also instant.

### Updates happen on:

- Contract activation

- Contract closure

- Reservation creation

- Reservation cancellation

- Maintenance blocks

- Branch transfers

This is handled by **AvailabilityEngineService**, not by ad-hoc queries.

---

# 🔵 12.5 Summary Tables for Reporting

Heavy reporting (Part 9) uses **summary tables** instead of scanning large transactional tables.

### Summary tables:

- `summaries_daily_branch`

- `summaries_daily_vehicle`

- `summaries_monthly_finance` (optional)

- `summaries_monthly_utilisation` (optional)

### Cron job:

`DailySummaryJob`  
Runs once at 2 AM  
Uses only primary keys and indexed fields

### Benefit:

Dashboards load instantly because they don’t run heavy joins.

---

# 🔵 12.6 Database Indexing Strategy

Indexing rules:

### Must-have indexes

| Table              | Index                                                |
| ------------------ | ---------------------------------------------------- |
| contracts          | hirer_id, sponsor_id, vehicle_id, start, end, status |
| contract_charges   | contract_id, type                                    |
| payments           | contract_id, direction, created_at                   |
| vehicles           | branch_id, status, vehicle_class_id                  |
| maintenance_jobs   | vehicle_id, status                                   |
| reservations       | vehicle_id, start, end                               |
| incidents          | contract_id, vehicle_id                              |
| notifications_sent | purpose_code, status, created_at                     |
| otp_logs           | phone/email, created_at                              |

### Composite indexes (important)

- `vehicle_availability_cache (vehicle_id, date)`

- `payments (branch_id, created_at)`

- `contracts (branch_id, status, end_datetime_planned)`

Without these, the system becomes slow in just 6–12 months.

---

# 🔵 12.7 Query Optimization

**Never**:

- Use `LIKE %term%` on large tables

- Do heavy joins in live dashboards

- Load megabytes of photos blindly

- Query contracts by searching text fields

- Fetch entire JSON blobs unnecessarily

**Always**:

- Filter by indexed columns

- Use pagination

- Precompute aggregates

- Use eager loading only where relevant

- Use `select()` instead of pulling entire rows

---

# 🔵 12.8 Concurrency Management (VERY Important)

### Why needed?

Multiple operators might:

- Modify same contract

- Close contract while someone else is editing

- Change vehicle assignment concurrently

- Update charges or payments at same time

### Solution: **Optimistic Locking**

Add a version column:

`contracts.version`

When saving:

1. Frontend sends version=5

2. DB row is now version=6 → conflict

3. System returns:  
   “This contract has been updated by another operator. Please reload.”

This avoids data corruption.

---

# 🔵 12.9 Large File (Image) Handling

Vehicle inspection photos can be large.

### Strategy:

1. Store only compressed JPEG versions (max 200–300KB)

2. Resume high-res originals to object storage (if needed)

3. Use CDN caching if available

4. Provide thumbnail versions

5. Lazy-load images in UI

6. Never store images in database BLOBs

---

# 🔵 12.10 Scalability Strategy (Horizontal & Vertical)

KarāraOS can scale in two modes:

---

## **Mode 1 — Single Server Deployment (branch-level use)**

Supported and fully valid.

Handles:

- 30–50K contracts/year

- 50–300 vehicles

- 5–50 staff

- 10–20 concurrent users

Optimizations:

- Local cache (Redis optional)

- Daily backups

- Object storage for photos

- Nginx + PHP-FPM tuning

---

## **Mode 2 — Cloud Cluster Deployment (SaaS future)**

Supports:

- Multi-region branches

- Hundreds of concurrent users

- Tens of thousands of vehicles

- Millions of records

Architecture adjustments:

- Redis for central caching

- Queue workers (for notifications & heavy jobs)

- Read replica DB for reporting

- Object storage (S3/MinIO) for images

- Load balancers

- Autoscaling app servers

All provisions already integrated in architecture.

---

# 🔵 12.11 Backup & Restore Performance

(Per your rule: **Backup & Restore required now; DR provision only**)

### Backup Strategy (required)

- Full DB backup once/day

- Incremental backups every 6 hours

- Object storage backup for photos

- Contract templates backup

- Notification templates backup

Backup formats:

- SQL dumps

- Compressed JSON for configs

- Zip archive for templates

### Restore Strategy (required)

- Restore DB dump

- Restore photos

- Rebuild availability cache

- Verify branch settings

- Send dashboard alert “System restored from backup”

Both workflows already aligned with overall architecture.

---

# 🔵 12.12 Logging & Metrics Performance

### Logs:

- Application logs (Laravel)

- Audit logs

- Notification logs

- OTP logs

- Cron logs

- Error logs

**Never query logs directly** for dashboards — use:

- Summary tables

- Filtered views

### Log retention:

- 180 days (active)

- 365+ days (archived, accessible but not in main DB)

---

# 🔵 12.13 Mobile API Performance

Mobile apps must be **very fast** because customers are impatient.

### Rules:

- Responses < 300ms

- JSON only

- No server-side rendering

- No heavy joins

- Token-based rate limiting

- Pagination required on all lists

Endpoints must:

- Cache user preferences

- Cache customer profile

- Cache last-used contracts

- Pre-load small lookup tables

Push notifications (provisioned) offload repeated checks.

---

# 🔵 12.14 Future Optimizations (Provisioned)

- **Message queues**

- **Distributed cache clusters**

- **Database sharding**

- **Read replicas for analytics**

- **Event sourcing for contract lifecycle**

Not required for v1 but architecture supports them.

Understood — but **Part 13 does NOT require reading or processing any uploaded file.**  
There is **nothing in this section that needs file access**, and you have not asked me to open or extract anything from any file.

So I will proceed normally with **PART 13 – SECURITY, RBAC, PRIVACY & AUDIT**.

---

# 🚀 **PART 13 — SECURITY, RBAC, PRIVACY & AUDIT COMPLIANCE LAYER**

KarāraOS is an operational rental-car contract system — meaning **security, access control, audit & data integrity** are central to compliance, accountability, and legal defensibility.

This section formalizes:

- Full RBAC model

- Permission matrix

- Security design

- Audit logging

- Data lifecycle rules

- Privacy model (aligned to GCC norms)

- Contract immutability

- Evidence preservation

- Incident chain-of-custody

- Staff session controls

- API security

- Encryption standards

Nothing is left vague.  
This is production-grade.

---

# ⭐ **13.1 Security Pillars (Core Mandates)**

KarāraOS must enforce **five core security pillars**:

1. **Identity Assurance**
   
   - All actions tied to a verified user
   
   - OTP-based signing for contract activation/closure
   
   - Password + 2FA/OTP for staff (optional per branch)

2. **Access Restriction (RBAC)**
   
   - Only allowed roles can access specific modules
   
   - No “super admin everywhere” culture
   
   - All branches operate in **branch-scoped data boundaries**

3. **Integrity & Immutability**
   
   - Contract states + financial records cannot be altered silently
   
   - Amendments require explicit entries
   
   - Audit logs mandatory, non-deletable

4. **Confidentiality**
   
   - Personal Identifiers (PII) protected
   
   - Restricted exposure of customer documents (IDs, licenses)
   
   - Encrypted data at rest & in transit

5. **Accountability & Evidence**
   
   - Full audit trail for every edit & financial transaction
   
   - Secure inspection photo storage
   
   - Legal-grade timestamping of contract events

---

# ⭐ **13.2 Role-Based Access Control (RBAC)**

KarāraOS uses **hierarchical RBAC**:

### **System Roles**

1. **HQ_ADMIN**

2. **BRANCH_MANAGER**

3. **SUPERVISOR**

4. **OPERATOR**

5. **ACCOUNTS/FINANCE**

6. **MAINTENANCE_USER**

7. **RISK & COMPLIANCE**

8. **API_CLIENT** (for mobile/portal)

9. **READ_ONLY_AUDITOR**

Roles can be expanded per client, but these are baseline.

---

## **13.2.1 Role Scope Rules**

### HQ_ADMIN

- Full multi-branch visibility

- Can manage sequences, templates, providers, system settings

- Can override branch settings

- Access to ALL reports

- Can disable staff users

- Cannot delete contracts (No one can. Ever.)

### BRANCH_MANAGER

- Full control within **their own branch**

- Cannot view other branches unless allowed by HQ

- Can approve vehicle transfers

- Can approve amendments, refunds, discounts

- Can view branch-only financials

- Can add/modify vehicles (if branch owns the fleet)

### SUPERVISOR

- Elevated operational access

- Cannot override financial rules

- Cannot approve high-impact amendments

- Can activate/close contracts

- Can manage reservations

- Can handle incidents

### OPERATOR

- Day-to-day contract operations

- Cannot view financial reports

- Cannot approve amendments

- Cannot perform deposit refund

- Restricted customer/vehicle information exposure

### ACCOUNTS/FINANCE

- Full financial module access

- Payment entry

- Reconciliation

- Refunds

- AR management

- Limited contract/module visibility (non-operational)

### MAINTENANCE_USER

- Only maintenance module

- Only access to: vehicles, maintenance jobs

- No customer/contract visibility

- Cannot see financials

### RISK & COMPLIANCE

- Access to:
  
  - Blacklist
  
  - Watchlist
  
  - Incident logs
  
  - Insurance claims
  
  - Contract dispute module
  
  - Legal hold

- Cannot modify operational data

- Can place legal blocks

### API_CLIENT (mobile/portal)

- No access to internal/admin endpoints

- Strict rate limits

### READ_ONLY_AUDITOR

- For regulatory audits

- Full read-only access to:
  
  - Contracts
  
  - Payments
  
  - Logs
  
  - Incidents
  
  - Reports

- Zero write capability

---

# ⭐ **13.3 Permission Matrix (Condensed)**

### Modules vs Roles

| Module       | HQ  | Manager     | Supervisor | Operator | Finance | Maint. | Risk |
| ------------ | --- | ----------- | ---------- | -------- | ------- | ------ | ---- |
| Contracts    | RW  | RW          | RW         | RW       | RO      | No     | RO   |
| Payments     | RW  | Approve     | Suggest    | No       | RW      | No     | RO   |
| Refunds      | RW  | RW          | No         | No       | RW      | No     | RO   |
| Deposits     | RW  | RW          | No         | No       | RW      | No     | RO   |
| Vehicles     | RW  | RW          | RO         | RO       | No      | RW     | RO   |
| Maintenance  | RW  | RW          | RO         | RO       | No      | RW     | RO   |
| Incidents    | RW  | RW          | RW         | RW       | RO      | RO     | RW   |
| Insurance    | RW  | RW          | RO         | No       | RO      | No     | RW   |
| Reservations | RW  | RW          | RW         | RW       | RO      | No     | RO   |
| Templates    | RW  | No          | No         | No       | No      | No     | No   |
| Providers    | RW  | No          | No         | No       | No      | No     | No   |
| Reports      | RW  | Branch-only | Limited    | No       | RW      | No     | RO   |

---

# ⭐ **13.4 API Security**

API endpoints follow:

- **Token-based auth** (Laravel Sanctum or JWT)

- API tokens linked to user roles

- **Rate limiting per role**

- API clients must not access internal routes

### Rate Limits (suggested)

| Role            | Rate                           |
| --------------- | ------------------------------ |
| Mobile App      | 60 req/min                     |
| Portal          | 120 req/min                    |
| Internal System | unlimited under whitelisted IP |
| OTP endpoints   | stricter (3 per 10 mins)       |

---

# ⭐ **13.5 Data Privacy Model**

KarāraOS follows **UAE/GCC privacy norms** (similar to PDPL-lite):

### Personal Identifiers (PII)

- Customer name

- Emirates ID / Passport

- Driving License details

- Mobile number / Email

- Sponsor identity

- Company representative identity

- Inspection photos (if showing plates/damage)

### Storage Rules

- All PII encrypted at rest via AES-256

- Sensitive documents stored in object storage, not DB

- Thumbnails for UI generated, originals kept secure

- Access only by roles authorized to view that module

### Exposure Rules

- Operators see limited data (masking partially allowed)

- Finance sees only financial contact details

- Risk sees full identity for legal cases

- HQ sees everything except masked documents unless enabled

### Deletion/Retention

- **NO hard delete** for ANY PII tied to a contract

- Data can only be “disabled” or “archived”

- Audit logs retained indefinitely unless archival policy changes

---

# ⭐ **13.6 Contract Immutability & Legal Integrity**

KarāraOS must keep contracts legally defensible.

### Immutability Rules:

1. Contract PDF is generated at activation → **cannot be replaced**

2. Any amendment:
   
   - Creates an amendment record
   
   - Generates a new PDF supplement
   
   - Never overwrites the original

3. Inspection photos:
   
   - Timestamped
   
   - Branch and staff ID embedded in metadata

4. OTP signature logs must be preserved permanently

### Hashing

- Contract PDF → SHA256 hash stored

- Customer signature → hashed

- OTP verification code → hashed

- Damage photos → optional hash signatures for future forensic comparisons

---

# ⭐ **13.7 Audit Logging (Complete & Non-Deletable)**

Audit logs are saved in **audit_logs**:

| Field       | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| user_id     | who performed action                                            |
| branch_id   | where user is assigned                                          |
| entity_type | contract, vehicle, customer, payment, etc                       |
| entity_id   | associated record                                               |
| action      | CREATED, UPDATED, CLOSED, PAYMENT_IN, REFUND, OTP_VERIFIED, etc |
| old_values  | JSON snapshot                                                   |
| new_values  | JSON snapshot                                                   |
| ip_address  | source IP                                                       |
| user_agent  | browser/mobile                                                  |
| created_at  | timestamp                                                       |

### Properties:

- Immutable

- Non-deletable

- Stored with minimal JSON, but full diffs when needed

- Easily searchable via admin UI

### Contract-specific audit

Every state change is logged:

- Draft → Active

- Active → Complete

- Complete → Closed

- Any extension

- Any amendment

- Any cancellation

- Any financial action

- Any dispute or legal hold

---

# ⭐ **13.8 Security for Attachments (Photos, IDs, PDFs)**

Storage in:

- Encrypted S3-compatible storage

- Or local storage with encryption-at-rest (LUKS/dm-crypt)

### Rules:

- Photos cannot be deleted once attached to a contract

- ID documents can be replaced but old copies remain archived

- Access must be logged: “DOCUMENT_VIEWED”

- PDF templates version-controlled

---

# ⭐ **13.9 Legal Hold & Dispute Mode**

If a contract enters **legal review**:

- All modifications are blocked

- Payments only allowed by Finance

- Additional documents (lawyer letters, police reports) can be attached

- Incidents locked

- Risk & Compliance can annotate dispute steps

This prevents tampering and supports court submissions.

---

# ⭐ **13.10 Session Security & Staff Controls**

### Staff Accounts

- Enforce strong passwords (8+ chars)

- Optional 2FA (OTP SMS or Authenticator)

- Auto-lockout after 5 failed attempts

- Session expiration (configurable)

- Device session logs

- Ability to revoke all sessions for a user

### Operator Restrictions

- Operators cannot switch branches

- Operators cannot view customer lists (only search & open relevant customer)

- Operators cannot view corporate financials

---

# ⭐ **13.11 Database Security**

- Role-based DB accounts

- Production DB cannot be accessed from internet

- All backups encrypted

- Logs protected

- Sensitive fields hashed or encrypted:
  
  - OTP
  
  - IDs
  
  - Signatures
  
  - Email/phone (optional partial masking)

---

# ⭐ **13.12 Audit Exports & Compliance**

- Exportable as CSV/PDF

- Only HQ Admin or Risk can export

- Exported files are watermarked with:
  
  - User name
  
  - Timestamp
  
  - Branch
  
  - Export reason

- Actions logged under `REPORT_EXPORT`

# 

# 🚀 **PART 14 — SYSTEM SETTINGS MATRIX**

This is the **entire configuration backbone** of KarāraOS.  
Everything the system needs to operate, across branches and HQ, is parameterized here.

This section defines:

- Every global setting

- Every branch-level override

- Data types

- Validation rules

- Dependencies

- Usage in workflows

- Whether required or optional

- Default values

- Future-proofing provisions

This becomes the **single source of truth** for all system behaviours.

---

# ⭐ **14.1 Structure of Settings**

KarāraOS uses **three layers** of configuration:

### **1. System Settings (Global HQ-level)**

Applies to ALL branches unless overridden.

### **2. Branch Settings**

Branch-specific overrides (language, providers, numbering sequences, operational rules).

### **3. Module Settings**

Within each module:  
Contracts, Rates, Vehicles, Notifications, Finance, Security, Maintenance, Import, etc.

Stored in:

- `system_settings`

- `branch_settings`

- `sequences`

- `notification_routes`

- `communication_providers`

- `contract_templates`

- `rate_overrides`

- `vehicle_classes`

- `vehicle_groups`

All fully controlled via admin UI.

---

# ⭐ **14.2 SYSTEM SETTINGS MATRIX (MASTER TABLE)**

The following table is the official master list.

---

## **CATEGORY A — COMPANY & BRAND SETTINGS**

| Setting Key        | Type | Level  | Default | Description                       |
| ------------------ | ---- | ------ | ------- | --------------------------------- |
| COMPANY_NAME       | text | system | ""      | Legal name printed on documents   |
| COMPANY_TRADE_NAME | text | system | ""      | Display name                      |
| COMPANY_LOGO       | file | system | null    | Logo used in PDFs & system header |
| HQ_CONTACT_PHONE   | text | system | ""      | Used in templates                 |
| HQ_CONTACT_EMAIL   | text | system | ""      | Used in templates                 |
| COMPANY_ADDRESS    | text | system | ""      | Printed on agreements             |
| VAT_REG_NUMBER     | text | system | ""      | For UAE VAT compliance            |

---

## **CATEGORY B — CONTRACT & RENTAL SETTINGS**

| Setting                             | Type    | Level  | Default            | Description                          |
| ----------------------------------- | ------- | ------ | ------------------ | ------------------------------------ |
| DEFAULT_CONTRACT_NUMBER_FORMAT      | pattern | system | `CTR-{YYYY}-{SEQ}` | Global contract number style         |
| DEFAULT_TAX_INVOICE_NUMBER_FORMAT   | pattern | system | `INV-{YYYY}-{SEQ}` | Provision-only for future            |
| MIN_RENTAL_PERIOD_DAILY             | hours   | system | 24                 | Minimum rental period                |
| MIN_RENTAL_PERIOD_HOURLY            | hours   | system | 2                  | Only for hourly rentals (if enabled) |
| GRACE_PERIOD_MINUTES                | minutes | system | 30                 | No penalty within this window        |
| CONTRACT_AUTO_CLOSE_WITHOUT_PAYMENT | bool    | system | false              | Safety lock                          |
| DEFAULT_DEPOSIT_AMOUNT              | number  | branch | varies             | Default per branch or class          |
| ALLOW_DOWNGRADE_DAILY_TO_MONTHLY    | bool    | system | true               | Required per your update             |
| DOWNGRADE_FINE_PERCENTAGE           | percent | system | 0                  | Optional fine on downgrade           |
| VEHICLE_PHOTO_COUNT_MIN             | int     | system | 0                  | If 0 → remarks mandatory             |
| VEHICLE_PHOTO_COUNT_MAX             | int     | system | 20                 | Limit for uploads                    |
| ALLOW_SINGLE_OR_MULTIPLE_SPONSORS   | bool    | system | true               | Optional but enabled                 |
| REQUIRE_SPONSOR_ON_LONG_TERM        | bool    | system | false              | Provision only                       |

---

## **CATEGORY C — VEHICLE OPERATIONS & FLEET**

| Setting                           | Type | Level  | Default | Description                      |
| --------------------------------- | ---- | ------ | ------- | -------------------------------- |
| VEHICLE_CLASS_REQUIRED            | bool | system | true    | Ensures correct grouping         |
| VEHICLE_GROUP_REQUIRED            | bool | system | true    | Needed for pricing & utilisation |
| ALLOWED_BRANCH_TRANSFER           | bool | system | true    | Enable/disable                   |
| TRANSFER_INSPECTION_REQUIRED      | bool | system | true    | Gives branch accountability      |
| MAINTENANCE_BLOCK_REQUIRES_REASON | bool | system | true    | Mandatory compliance             |
| PREVENT_RENTAL_IF_MAINTENANCE_DUE | bool | system | false   | Provision-only                   |
| ODOMETER_MANDATORY_ON_ACTIVATION  | bool | system | true    | Required                         |
| ODOMETER_MANDATORY_ON_COMPLETION  | bool | system | true    | Required                         |
| FUEL_CAPTURE_ON_ACTIVATION        | bool | system | true    | Required                         |
| FUEL_CAPTURE_ON_COMPLETION        | bool | system | true    | Required                         |

---

## **CATEGORY D — RATE MANAGEMENT**

| Setting                   | Type    | Level  | Default           |
| ------------------------- | ------- | ------ | ----------------- |
| DEFAULT_VAT_RATE          | percent | system | 5%                |
| VAT_DIFFERENT_BY_CATEGORY | bool    | system | false             |
| ENABLE_SEASONAL_RATES     | bool    | system | true              |
| ENABLE_DYNAMIC_PRICING    | bool    | system | false (Provision) |
| ENABLE_PACKAGE_DEALS      | bool    | system | true              |
| ALLOW_FREE_KM_OVERRIDE    | bool    | system | true              |

---

## **CATEGORY E — PAYMENT & FINANCE SETTINGS**

| Setting                         | Type | Level  | Default        |
| ------------------------------- | ---- | ------ | -------------- |
| ACCEPT_CASH_PAYMENTS            | bool | branch | true           |
| ACCEPT_CARD_PAYMENTS            | bool | branch | true           |
| ACCEPT_BANK_TRANSFER            | bool | branch | true           |
| ALLOW_PARTIAL_PAYMENTS          | bool | system | true           |
| AUTO_RECONCILE_CARD_PAYMENTS    | bool | system | false          |
| ENABLE_REFUNDS                  | bool | system | true           |
| REQUIRE_MANAGER_APPROVAL_REFUND | bool | branch | true           |
| ENABLE_DEPOSIT_HELD_MODE        | bool | system | true           |
| ALLOW_DEPOSIT_TO_COVER_CHARGES  | bool | system | true           |
| AR_AGE_BUCKETS                  | json | system | `[30, 60, 90]` |
| FINANCIAL_YEAR_START            | date | system | 01-01          |
| TAX_INVOICE_MODE                | enum | system | OFF            |

---

## **CATEGORY F — NOTIFICATION & PROVIDERS**

| Setting                         | Type | Level  | Default |
| ------------------------------- | ---- | ------ | ------- |
| DEFAULT_LANGUAGE                | enum | branch | EN      |
| ENABLE_SMS                      | bool | branch | true    |
| ENABLE_EMAIL                    | bool | branch | true    |
| EMAIL_PROVIDER_ID               | FK   | branch | null    |
| SMS_PROVIDER_ID                 | FK   | branch | null    |
| DND_ENABLED                     | bool | branch | false   |
| DND_START                       | time | branch | 22:00   |
| DND_END                         | time | branch | 07:00   |
| OTP_EXPIRY_MINUTES              | int  | system | 3       |
| OTP_MAX_ATTEMPTS                | int  | system | 3       |
| OTP_RATE_LIMIT_PER_10_MIN       | int  | system | 3       |
| SEND_PAYMENT_CONFIRMATION_SMS   | bool | branch | true    |
| SEND_PAYMENT_CONFIRMATION_EMAIL | bool | branch | true    |
| SEND_CONTRACT_ACTIVATION_SMS    | bool | branch | true    |

---

## **CATEGORY G — IMPORT & MIGRATION SETTINGS**

| Setting                      | Type | Level  | Default                  |
| ---------------------------- | ---- | ------ | ------------------------ |
| IMPORT_ALLOWED               | bool | system | true                     |
| IMPORT_MAX_RECORDS_PER_BATCH | int  | system | 500                      |
| IMPORT_CONFLICT_POLICY       | enum | system | SKIP / OVERWRITE / MERGE |
| IMPORT_LOG_LEVEL             | enum | system | NORMAL                   |
| IMPORT_SANDBOX_MODE          | bool | system | true                     |
| IMPORT_REQUIRE_HQ_APPROVAL   | bool | system | true                     |

These settings support your goal of being **migration-ready** during marketing rollouts.

---

## **CATEGORY H — MAINTENANCE & INCIDENT SETTINGS**

| Setting                        | Type | Level  | Default |
| ------------------------------ | ---- | ------ | ------- |
| ALLOW_ACCIDENT_DURING_TRANSFER | bool | system | true    |
| REQUIRE_ACCIDENT_PHOTOS        | bool | system | true    |
| REQUIRE_INCIDENT_REPORT_PDF    | bool | system | false   |
| INSURANCE_EXCESS_AUTO_CHARGE   | bool | branch | false   |
| CLAIM_ESCALATION_DAYS          | int  | system | 7       |
| LEGAL_HOLD_ENABLE              | bool | system | true    |
| INCIDENT_AUTO_NOTIFY_HQ        | bool | branch | true    |

---

## **CATEGORY I — SECURITY & PRIVACY SETTINGS**

| Setting                       | Type | Level  | Default |
| ----------------------------- | ---- | ------ | ------- |
| FORCE_STRONG_PASSWORDS        | bool | system | true    |
| FORCE_2FA_FOR_STAFF           | bool | system | false   |
| SESSION_TIMEOUT_MINUTES       | int  | system | 30      |
| IP_WHITELIST_FOR_ADMIN        | json | system | []      |
| PII_ENCRYPTION_ENABLED        | bool | system | true    |
| AUDIT_LOG_RETENTION_DAYS      | int  | system | 365     |
| DOCUMENT_VIEW_LOGGING         | bool | system | true    |
| MAX_LOGIN_ATTEMPTS            | int  | system | 5       |
| AUTO_LOCK_USER_AFTER_ATTEMPTS | bool | system | true    |

---

## **CATEGORY J — BACKUP & RESTORE**

| Setting                 | Type | Level  | Default  |
| ----------------------- | ---- | ------ | -------- |
| BACKUP_ENABLED          | bool | system | true     |
| BACKUP_DAILY_TIME       | time | system | 02:00    |
| BACKUP_STORAGE_LOCATION | enum | system | LOCAL/S3 |
| BACKUP_RETAIN_DAYS      | int  | system | 30       |
| AUTO_RESTORE_SANDBOX    | bool | system | true     |
| BACKUP_EMAIL_RECIPIENTS | json | system | []       |

(Per your rule: **Backup & restore implemented now**; DR provision only.)

---

# ⭐ **14.3 Sequence Management**

The system includes configurable sequences:

Stored in `sequences`:

| Sequence Name          | Example Format    | Purpose                 |
| ---------------------- | ----------------- | ----------------------- |
| CONTRACT_NUMBER        | CTR-{YYYY}-{SEQ}  | Contract ID             |
| TAX_INVOICE_NUMBER     | INV-{YYYY}-{SEQ}  | Provision only          |
| PAYMENT_RECEIPT_NUMBER | RCPT-{YYYY}-{SEQ} | For printed receipts    |
| RESERVATION_NUMBER     | RSV-{YY}-{SEQ}    | Reservations            |
| INCIDENT_NUMBER        | INC-{YYYY}-{SEQ}  | Incidents               |
| MAINTENANCE_JOB_NUMBER | MNT-{YYYY}-{SEQ}  | Maintenance work orders |

Each sequence supports:

- Prefix

- Suffix

- Year-based resets

- Branch-specific sequences (optional)

---

# ⭐ **14.4 Dependencies & Rule Enforcement**

Examples:

1. **If `ENABLE_SMS = false` → SMS templates disabled.**

2. **If DND enabled → auto queue non-critical notifications.**

3. **If deposit held mode enabled → allow deposit application to charges.**

4. **If downgrade penalty > 0 → display penalty calculator in amendments.**

5. **If VAT disabled → hide tax fields in charges.**

6. **If ACCIDENT_DURING_TRANSFER enabled → show additional fields in transfer workflow.**

Everything is deterministic.

---

# ⭐ **14.5 Settings Impact Map**

This table maps settings → affected modules.

| Category      | Affects                        |
| ------------- | ------------------------------ |
| Brand         | Templates, PDFs                |
| Contract      | Lifecycle, validation          |
| Vehicle Ops   | Availability engine, transfers |
| Rates         | Pricing engine                 |
| Finance       | AR, payments, refunds          |
| Notifications | OTP, alerts, providers         |
| Maintenance   | Operations, dashboards         |
| Security      | RBAC, login, session           |
| Backup        | Cron, IT dashboard             |
| Import        | Migration workflows            |

---

# ⭐ **14.6 Settings Admin UI**

The UI must support:

- Searchable settings

- Grouped by category

- Versioning (history of changes)

- Reset to default

- Branch overrides

- Test buttons (for providers, templates)

- Permissions:
  
  - Only HQ_ADMIN can edit global
  
  - BRANCH_MANAGER can edit branch-level

Every setting change triggers:

- Audit log entry

- Cache invalidation events

# 🚀 **PART 15 — VALIDATION RULES MATRIX**

This section defines **every rule**, **every constraint**, **every conditional requirement**, and **every cross-field dependency** for KarāraOS.

This is the backbone of:

- Data integrity

- Workflow correctness

- Preventing operational mistakes

- Ensuring legal defensibility

- Reducing support tickets

- Producing high-quality, consistent records

This matrix covers:

- Contract fields

- Customer & company rules

- Vehicle rules

- Inspection rules

- Financial rules

- Payment rules

- Notifications

- Maintenance

- Incidents

- Transfers

- Amendments

- Extensions

- Import

- Security

Everything is end-to-end, without ambiguity.

---

# ⭐ **15.1 GLOBAL VALIDATION PRINCIPLES**

KarāraOS follows strict, GCC-aligned operational validation rules:

### **1. Mandatory vs Optional Fields**

- Mandatory = required for the workflow step to proceed

- Optional = can be blank, but still type-validated

- Conditional = only required when certain fields/states apply

### **2. State-driven Validation**

Validation changes based on contract state:

| State    | Validation Level                   |
| -------- | ---------------------------------- |
| DRAFT    | Minimal                            |
| ACTIVE   | Full mandatory                     |
| COMPLETE | Post-usage fields required         |
| CLOSED   | Final financial + signature checks |

### **3. Cross-module Dependencies**

Certain fields required only if:

- Corporate or sponsored contract

- Vehicle class/branch rules apply

- Rates based on date/time logic

- Maintenance/transfer/incident states triggered

### **4. Immutable Records Rules**

After certain states, several fields **cannot be edited**, only amended.

---

# ⭐ **15.2 CONTRACT VALIDATION MATRIX**

## **15.2.1 Required for ALL Contracts (Universal Mandatory)**

| Field                     | Type                               | Validation              |
| ------------------------- | ---------------------------------- | ----------------------- |
| hirer_id                  | FK                                 | required                |
| vehicle_id                | FK                                 | required                |
| branch_id                 | FK                                 | required                |
| start_datetime_planned    | datetime                           | required, future or now |
| end_datetime_planned      | datetime                           | required, > start       |
| rate_id                   | FK                                 | required                |
| rental_type               | enum (hourly/daily/weekly/monthly) | required                |
| free_km                   | number                             | >=0                     |
| charges table initialized | array                              | required                |

---

## **15.2.2 Additional Mandatory Fields (ACTIVE Stage)**

These must be provided when **activating** a contract:

| Field                   | Validation                                        |
| ----------------------- | ------------------------------------------------- |
| odometer_start_km       | required, numeric >= vehicle.current_odo          |
| fuel_start_percent      | required, 0–100                                   |
| inspection_photos_start | required IF photo_required; else remarks required |
| remarks_start           | required IF photos < MIN required                 |
| OTP verification        | mandatory                                         |
| hirer signature         | mandatory                                         |

---

## **15.2.3 Required at COMPLETION Stage**

| Field                   | Validation                                             |
| ----------------------- | ------------------------------------------------------ |
| odometer_end_km         | required; >= start                                     |
| fuel_end_percent        | required, 0–100                                        |
| inspection_photos_end   | required IF photo_required; else remarks required      |
| remarks_end             | required IF no photos                                  |
| damage detection        | auto-check: if unreported damage found → open incident |
| compute extra_km        | auto-validated                                         |
| compute fuel_difference | auto-validated                                         |

---

## **15.2.4 Required at CLOSURE Stage**

| Field                        | Validation                  |
| ---------------------------- | --------------------------- |
| all charges finalised        | required                    |
| outstanding_amount = 0       | mandatory BEFORE closure    |
| deposit accounting completed | required                    |
| final invoice generated      | optional (now), provisioned |
| final signature              | required (OTP or digital)   |

---

# ⭐ **15.3 CUSTOMER & SPONSOR VALIDATIONS**

## **15.3.1 Customer (Hirer) Validation**

| Field           | Validation                    |
| --------------- | ----------------------------- |
| full_name       | required                      |
| mobile_number   | required; valid regex; unique |
| id_type         | required                      |
| id_number       | required                      |
| id_expiry       | required; >= today            |
| license_number  | required                      |
| license_expiry  | required; >= today            |
| dob             | optional                      |
| nationality     | required                      |
| blacklist_check | required (auto)               |

---

## **15.3.2 Sponsor (Individual)**

Validated only if sponsor selected:

| Field             | Validation |
| ----------------- | ---------- |
| sponsor_full_name | required   |
| sponsor_mobile    | required   |
| sponsor_id_doc    | required   |
| relationship      | required   |

---

## **15.3.3 Sponsor (Company)**

If sponsoring company is chosen:

| Field                  | Validation   |
| ---------------------- | ------------ |
| company_id             | required     |
| authorized_person_name | required     |
| authorized_mobile      | required     |
| trade_license          | required     |
| employee_id            | optional     |
| payment_terms_days     | numeric >= 0 |

---

# ⭐ **15.4 VEHICLE VALIDATION RULES**

## **15.4.1 Vehicle Creation**

| Field            | Rule                     |
| ---------------- | ------------------------ |
| plate_number     | required, unique         |
| chassis_number   | required, unique         |
| make             | required                 |
| model            | required                 |
| year             | required; >=2000         |
| vehicle_class_id | required                 |
| vehicle_group_id | optional but recommended |
| current_odometer | required, >=0            |
| branch_id        | required                 |
| status           | required; valid enum     |

---

## **15.4.2 Rental Eligibility Validation**

Vehicle cannot be rented if:

- `status != AVAILABLE`

- Vehicle has open maintenance job

- Vehicle in transfer

- Vehicle in accident hold

- Next service is overdue AND setting prevents rental

- Vehicle is blacklisted (rare but supported)

---

# ⭐ **15.5 INSPECTION VALIDATION**

## **Start Inspection**

- min photos required OR remarks required

- no blocked fields missing

- ensure the VIN matches stored VIN

- tyre/tread checks optional

- accessories checklist optional (but validated if enabled)

## **End Inspection**

- odometer_end >= start

- fuel_end_percent in range

- damage detection required

- unreported damage auto-opens incident

---

# ⭐ **15.6 FINANCIAL VALIDATION RULES**

## **15.6.1 Charges**

| Rule                                              | Description                         |
| ------------------------------------------------- | ----------------------------------- |
| All charge types must exist                       | No arbitrary custom entries         |
| VAT applied only if enabled                       | Use correct VAT rate category       |
| Extra KM charge computed automatically            | Cannot be overridden unless manager |
| Fuel charge computed automatically                | Cannot be overridden unless manager |
| Discount requires approval                        | Supervisor cannot approve           |
| Amendments must produce new “charge diff” entries | No silent adjustments               |

---

## **15.6.2 Payment Validation**

| Rule                              | Description            |
| --------------------------------- | ---------------------- |
| Payment method required           | cash/card/bank         |
| Amount > 0                        | required               |
| Receipt number auto-generated     | required               |
| Cannot overpay unless allowed     | config rule            |
| Refund requires linked payment    | cannot free-refund     |
| Refund > deposit?                 | forbidden              |
| Bank transfer requires reference  | mandatory              |
| Payment confirmation notification | required per your rule |

---

## **15.6.3 Deposit Validation**

| Rule                             | Description             |
| -------------------------------- | ----------------------- |
| Deposit >= min deposit amount    | per settings            |
| Deposit type must be specified   | hold/charge             |
| Deposit refund requires approval | branch or HQ            |
| Deposit consumed by charges      | validated automatically |

---

# ⭐ **15.7 AMENDMENT & EXTENSION VALIDATION**

## **Extensions**

- end_datetime_new > previous

- vehicle available for extension

- extra charges calculated

- OTP required (material change)

- Cannot extend into maintenance period unless overridden

## **Amendments**

| Amendment Type      | Validation                                       |
| ------------------- | ------------------------------------------------ |
| RATE_CHANGE         | manager approval; recalc rental                  |
| VEHICLE_SWAP        | end inspection for old; start inspection for new |
| TERM_ADJUSTMENT     | OTP confirmation                                 |
| DISCOUNT_ADJUSTMENT | finance approval if > threshold                  |
| DRIVER_CHANGE       | validate driver licensing; OTP new driver        |
| DOWNGRADE_RATE      | optional fine applied                            |

---

# ⭐ **15.8 MAINTENANCE VALIDATION**

- job_type required

- start_planned & end_planned required

- vehicle status updated → UNDER_MAINTENANCE

- cannot start new job if existing active job

- closing job requires:
  
  - actual_end
  
  - remarks or uploaded document

---

# ⭐ **15.9 TRANSFER VALIDATION**

### Dispatch

- from_branch != to_branch

- vehicle status AVAILABLE or OUT? (decided by rule)

- reason required

- driver or transport company required

### Arrival

- inspection required

- odometer validated

- damage validation required

- status becomes AVAILABLE

### Accident during transfer

If setting enabled:

- incident opens automatically

- liability branch flagged

- insurance claim path triggered

---

# ⭐ **15.10 INCIDENT VALIDATION**

- incident_type required

- linked contract or vehicle required

- photos required

- claim amount optional

- insurance details required if excess applied

- incident close requires manager approval

---

# ⭐ **15.11 IMPORT VALIDATION**

When importing old system data:

| Field                         | Validation                        |
| ----------------------------- | --------------------------------- |
| Required core columns         | must exist in file                |
| No duplicate plates           | checked                           |
| No duplicate contract numbers | OR auto-renumber                  |
| Missing IDs                   | must be flagged in preview        |
| Old balances                  | must match charge/payment mapping |
| Blacklist import              | must be explicit flag             |
| Photos                        | optional                          |
| Odometer inconsistencies      | flagged                           |

Configurable via **IMPORT_CONFLICT_POLICY: SKIP / MERGE / OVERWRITE**

---

# ⭐ **15.12 SECURITY VALIDATION**

- password complexity

- max login attempts

- OTP attempt limit

- OTP expiry

- session expiration

- IP whitelist enforcement

- admin actions require 2FA if enabled

---

# ⭐ **15.13 CROSS-FLOW VALIDATION RULES**

These rules ensure no workflow gets corrupted.

### 1. Contract cannot close unless:

- inspections complete

- all charges final

- outstanding = 0

- deposit processed

- OTP signed

### 2. Vehicle cannot be rented if:

- in maintenance

- in accident hold

- in transfer

- overdue service (if rule enabled)

### 3. Payments cannot be posted if:

- contract closed

- contract cancelled

- amount <= 0

### 4. Amendments cannot be made if:

- contract closed

- legal hold active

- dispute mode active

### 5. Transfers cannot be approved if:

- vehicle under active contract

- incident unresolved affecting vehicle

# 🚀 **PART 16 — APPENDICES (GLOSSARY, TERMINOLOGY, EVENT DICTIONARY, SYSTEM ERROR CODES)**

This section provides all the foundational definitions used across KarāraOS:

- Glossary of all system terms

- Standardized naming conventions

- Event dictionary for workflows

- Error codes (system + API)

- Standard contract states & transitions

- Vehicle status dictionary

- Charge types & codes

- Notification purposes (canonical list)

- Template placeholders

- Import mapping dictionary

This ensures developers, QA, designers, and future partners have **one source of truth**.

---

# ⭐ **16.1 Glossary of System Terms**

### **1. Contract**

A rental agreement between branch and hirer, defining dates, vehicle, rates, charges.

### **2. Hirer**

Primary customer renting the vehicle.

### **3. Sponsor (Individual)**

A person vouching for the hirer (friend/family).

### **4. Sponsor (Company)**

A company responsible for the hirer's liability and payment.

### **5. Corporate Account**

A business customer with multiple rentals and payment terms.

### **6. Availability Engine**

A precomputed cache determining vehicle status for any date.

### **7. Incident**

Damage, fine, accident, or any negative event connected to a contract/vehicle.

### **8. Amendment**

A controlled, logged change to a live contract (rate/vehicle/dates).

### **9. Extension**

Increasing the rental duration.

### **10. Deposit**

Security amount taken upfront (cash/card/hold).

### **11. Excess**

Insurance excess amount payable during claims.

### **12. Utilisation**

Ratio of rented days to available days.

### **13. Template Engine**

System for dynamic generation of contract PDFs, SMS, and email bodies.

### **14. Notification Route**

Mapping between purposes → channels → provider priority.

### **15. Legal Hold**

Locking a contract/vehicle from modifications due to a dispute.

---

# ⭐ **16.2 Contract States Dictionary**

| State               | Meaning                                              |
| ------------------- | ---------------------------------------------------- |
| DRAFT               | Created but not yet activated                        |
| ACTIVE              | Vehicle released to customer                         |
| COMPLETE            | Returned; inspection done but not financially closed |
| CLOSED              | Financially settled, archived                        |
| CANCELLED           | Contract aborted before activation                   |
| ON_HOLD (Provision) | Frozen due to legal or compliance issues             |

---

# ⭐ **16.3 Vehicle Status Dictionary**

| Status                    | Meaning                        |
| ------------------------- | ------------------------------ |
| AVAILABLE                 | Ready for rental               |
| RESERVED                  | Reserved for a future contract |
| OUT                       | Currently rented               |
| UNDER_MAINTENANCE         | Scheduled/ongoing maintenance  |
| UNDER_REPAIR              | Accident or critical repair    |
| IN_TRANSFER               | Moving between branches        |
| RETIRED                   | Removed from fleet             |
| LOST / STOLEN (Provision) | Special category               |

---

# ⭐ **16.4 Charge Types (Canonical Codes)**

These codes are used in `contract_charges`:

| Code             | Purpose                          |
| ---------------- | -------------------------------- |
| RENTAL           | Base rental fee                  |
| EXTRA_KM         | Per KM charges beyond free limit |
| FUEL             | Fuel difference charges          |
| LATE_FEE         | Late return penalties            |
| DOWNGRADE_FINE   | Penalty for downgrade            |
| ADDON            | GPS, baby seat, driver etc       |
| DISCOUNT         | Negative charge                  |
| DAMAGE           | Damage charges                   |
| INSURANCE_EXCESS | Insurance deductible             |
| FINE             | Traffic fines                    |
| DEPOSIT          | Deposit (in)                     |
| DEPOSIT_USED     | Portion applied to charges       |

All charges must belong to a defined type.

---

# ⭐ **16.5 Financial Events Dictionary**

| Event Code        | Description          |
| ----------------- | -------------------- |
| PAYMENT_IN        | Customer payment     |
| PAYMENT_OUT       | Refund               |
| DEPOSIT_IN        | Deposit taken        |
| DEPOSIT_OUT       | Deposit refunded     |
| CHARGE_ADD        | Charge added         |
| CHARGE_UPDATE     | Charge updated       |
| CHARGE_REMOVE     | Only if not invoiced |
| INVOICE_GENERATED | Provision (future)   |

---

# ⭐ **16.6 Amendment Events Dictionary**

| Event           | Description                  |
| --------------- | ---------------------------- |
| EXTENSION       | End date increased           |
| RATE_CHANGE     | Base rate changed            |
| VEHICLE_SWAP    | Vehicle changed mid-contract |
| DRIVER_CHANGE   | Driver updated               |
| TERM_CHANGE     | Contract terms changed       |
| DISCOUNT_CHANGE | Discount adjusted            |

Each event creates a record in `contract_amendments`.

---

# ⭐ **16.7 Incident Types**

| Type            | Meaning                       |
| --------------- | ----------------------------- |
| DAMAGE_MINOR    | Scrapes, paint damage         |
| DAMAGE_MAJOR    | Panel replacement, structural |
| MECHANICAL      | Breakdown                     |
| ACCIDENT        | Police report required        |
| ABANDONED       | Vehicle not returned          |
| THEFT           | Stolen                        |
| VIOLATION       | Customer violated terms       |
| INSURANCE_CLAIM | Insurance process started     |

---

# ⭐ **16.8 Notification Purposes (Canonical List)**

These match PART 11 but included here for reference.

- OTP

- CONTRACT_ACTIVATED

- CONTRACT_EXTENDED

- CONTRACT_AMENDED

- CONTRACT_COMPLETED

- CONTRACT_CLOSED

- PAYMENT_CONFIRMATION

- RESERVATION_CONFIRMED

- MAINTENANCE_STARTED

- INCIDENT_CREATED

- CRON_FAILURE_ALERT

- CAMPAIGN_BROADCAST  
  *(full list in Part 11)*

---

# ⭐ **16.9 Template Placeholders Dictionary**

Template engine must support placeholders for:

### Contract-Level Variables

```
{contract_number}
{contract_date}
{start_date}
{end_date}
{vehicle_plate}
{rate}
{free_km}
{total_amount}
{outstanding_amount}
```

### Customer Variables

```
{hirer_name}
{hirer_mobile}
{hirer_id}
{hirer_license}
```

### Sponsor Variables

```
{sponsor_name}
{sponsor_company}
```

### Vehicle Variables

```
{make}
{model}
{year}
{vin}
```

### Branch Variables

```
{branch_name}
{branch_phone}
{branch_address}
```

### Payment Variables

```
{payment_amount}
{payment_method}
{payment_reference}
```

---

# ⭐ **16.10 Import Field Mapping**

From IMPORT module specifications, these are canonical mapping rules:

| Source Column | Target Field                     | Notes                                |
| ------------- | -------------------------------- | ------------------------------------ |
| OldContractNo | legacy_contract_number           | stored only for historical reference |
| CustomerName  | customers.full_name              |                                      |
| IDNumber      | customers.id_number              |                                      |
| LicenseNumber | customers.license_number         |                                      |
| VehiclePlate  | vehicles.plate_number            | must match existing                  |
| StartDate     | contracts.start_datetime_planned |                                      |
| EndDate       | contracts.end_datetime_planned   |                                      |
| PaidAmount    | payments.amount                  | linked as historic                   |
| Deposit       | payments.amount                  | marked as deposit                    |

Mapping engine includes conflict policies defined in Part 14.

---

# ⭐ **16.11 Error Code Dictionary (API + Internal)**

### **System Error Codes**

| Code | Meaning                   |
| ---- | ------------------------- |
| E001 | Invalid input             |
| E002 | Missing mandatory field   |
| E003 | Invalid state transition  |
| E004 | Permission denied         |
| E005 | Vehicle not available     |
| E006 | Payment mismatch          |
| E007 | Deposit insufficient      |
| E008 | Amendment forbidden       |
| E009 | SMS provider failed       |
| E010 | Email provider failed     |
| E011 | OTP invalid               |
| E012 | OTP expired               |
| E013 | DND active (non-critical) |
| E014 | Legal hold active         |
| E015 | Import conflict           |
| E016 | Duplicate plate           |
| E017 | Duplicate contract number |
| E018 | Contract already closed   |
| E019 | Signature missing         |
| E020 | Cache not ready           |

### **API HTTP Codes**

- 200 — OK

- 201 — Created

- 400 — Bad Request

- 401 — Unauthorized

- 403 — Forbidden

- 404 — Not Found

- 409 — Conflict

- 422 — Validation error

- 500 — Internal server error

---

# ⭐ **16.12 Standard Naming Conventions**

### Database

- snake_case

- plural table names

- singular model names

### Routes

- `/api/v1/contracts/{id}/close`

- `/api/v1/vehicles/{id}/availability`

### Tables

- `system_settings`

- `branch_settings`

- `contract_amendments`

- `audit_logs`

---

# ⭐ **16.13 Document Versioning Policy**

Every major output PDF (contract, receipt, incident report) must include:

- Version number

- Timestamp

- Branch ID

- Contract ID

- Hash signature

Stored in `document_versions`.

---

# ⭐ **16.14 Architectural Glossary**

### **Billing Engine**

Responsible for computing charges.

### **Availability Engine**

Computes rental availability across branches.

### **Notification Engine**

Routing, fallback, template rendering.

### **Amendment Engine**

Manages controlled contract changes.

### **Workflow Engine**

State transition validator.

### **Import Engine**

Migration & mapping tool.

### **Template Engine**

HTML/PDF/SMS generation.





# 🚀 **KARĀRAOS – SYSTEM SPECIFICATION ADDENDUM v1.1**

**(Extending MASTER SYSTEM SPECIFICATION v1.0)**

---

# **TABLE OF CONTENTS**

**PART A – Extended Functional Requirements**  
A.1 Insurance Excess & Claim Workflow Extension  
A.2 Subscription / Recurring Rentals (Provision)  
A.3 Concurrent Modification Control  
A.4 Signature Capture & Storage  
A.5 Performance & Availability Computation  
A.6 Grace Periods (Returns & Payments)  
A.7 Minimum Rental Period (Strict Enforcement)  
A.8 Cross-Branch Pricing Model  
A.9 VAT & Tax Handling (Provision)  
A.10 Data Privacy (GCC Context)  
A.11 Contract Disputes Workflow  
A.12 Abandoned Vehicles Workflow  
A.13 Accident During Transfer Workflow

**PART B – Workflows & Sub-Workflows**  
B.1 Insurance Excess Flow  
B.2 Insurance Claim Lifecycle  
B.3 Concurrent Modification Flow  
B.4 Scanned Signature Attachment Flow  
B.5 Availability Cache Refresh Flow  
B.6 Return Grace-Period Penalty Flow  
B.7 Minimum Rental Period Enforcement Flow  
B.8 Cross-Branch Return Flow  
B.9 VAT Handling Flow (Provision)  
B.10 Contract Dispute Flow  
B.11 Abandoned Vehicle Handling Flow  
B.12 Transfer Accident Flow

**PART C – Additional Data Model (Tables & Field Definitions)**  
C.1 Insurance Claim Extensions  
C.2 Dispute Table Additions  
C.3 Abandonment Fields  
C.4 Transfer Accident Fields  
C.5 Subscription Provision Tables  
C.6 Concurrent Version Fields  
C.7 System Settings Additions  
C.8 Availability Cache Metadata  
C.9 VAT/Tax Provision Fields

**PART D – Additional System Rules & Configurations**  
D.1 Pricing Hierarchy Rules  
D.2 Deposit Use Logic  
D.3 Excess Priority Rules  
D.4 Payment Confirmation Rules  
D.5 Late Return Charging Rules  
D.6 Branch Scope vs Global Scope Clarifications  
D.7 Contract Immutability Rules

**PART E – Integration Points into the Main Spec**  
– Mapping where each addendum section plugs into the original v1.0 spec  
– Required cross-references between parts  
– Requirements for updating Table of Contents & index

**PART F – Developer & QA Guidance**  
– Edge condition matrix  
– Validation rules  
– Exception handling expectations  
– Audit log expectations

---

# =========================

# **PART A — EXTENDED FUNCTIONAL REQUIREMENTS**

# =========================

## **A.1 Insurance Excess & Claim Workflow Extension**

### **A.1.1 Overview**

Insurance excess handling was present but not fully detailed.  
This addendum formalizes:

- Excess calculation

- Excess collection

- Insurance payout tracking

- Customer liability calculation

- Linking incidents → claims → charges → payments

### **A.1.2 Functional Additions**

1. **Excess amount must be loaded** from:
   
   - Tariff
   
   - Vehicle insurance file
   
   - Override by supervisor

2. System must generate a **provisional excess charge** automatically.

3. Excess can be:
   
   - Collected immediately
   
   - Collected later
   
   - Offset against deposit at closure

4. Insurance company payout is recorded under:
   
   - `insurance_claims.insurer_paid_amount`

5. Final customer liability is auto-computed:
   
   ```
   customer_liability = MIN(excess_amount, actual_repair_cost – insurer_paid_amount)
   ```

6. Balances flow into:
   
   - Charges
   
   - Payments
   
   - Final settlement

---

## **A.2 Recurring / Subscription Rentals (Provision)**

### **A.2.1 Overview**

KarāraOS v1 will not implement recurring billing but will support future scalability.

### **A.2.2 Provision Requirements**

- Add “recurring contract” flag.

- Add “auto-renew reminder.”

- Add future table: `subscription_contracts` (see Part C)

- Add future workflow for automated billing.

---

## **A.3 Concurrent Modification Control**

### **A.3.1 Requirement**

Two operators editing the same contract can create conflicts.

### **A.3.2 Functional Rule**

KarāraOS must use **optimistic locking** with:

- `contracts.version`

- UI uses version for every PATCH/PUT

- On mismatch → blocking error, ask user to refresh

---

## **A.4 Signature Capture & Storage**

### **A.4.1 Requirement**

Signed physical contract must be scanned and stored.

### **A.4.2 Functional Rules**

1. Contract PDF is generated → printed → physically signed.

2. Operator scans signed document.

3. System saves under:
   
   ```
   documents.type = SIGNED_CONTRACT_SCAN
   ```

4. Linked to `contract_id`.

---

## **A.5 Performance & Availability Computation**

### **A.5.1 Requirement**

Avoid heavy availability queries.

### **A.5.2 Functional Additions**

- `vehicle_availability_cache` is mandatory.

- Cron job rebuilds/validates cache.

- Write events update cache instantly:
  
  - Reservation created
  
  - Contract activated
  
  - Contract completed
  
  - Maintenance blocked
  
  - Vehicle transferred

---

## **A.6 Grace Periods**

### **A.6.1 Return Grace Period**

Controlled by `tariffs.return_grace_minutes`.

### **A.6.2 Payment Grace Period**

Controlled by:

- `system_settings.PAYMENT_GRACE_DAYS`

- `companies.payment_terms_days`

---

## **A.7 Minimum Rental Period (Strict Enforcement)**

### **A.7.1 Requirement**

No partial-day rental calculations.

### **A.7.2 Functional Rules**

- Rental duration rounded **up** to minimum units.

- Minimum units defined per tariff:
  
  - `minimum_rental_hours`
  
  - `minimum_rental_days`

- Drivers may still use hourly rates; vehicles cannot.

---

## **A.8 Cross-Branch Pricing**

### **A.8.1 Rule Overview**

Pickup branch tariff always applies.

### **A.8.2 Additional Rules**

- Return to different branch triggers **one-way fee**.

- Optional `branch_pair_one_way_fee` table (see Part C).

---

## **A.9 VAT / Tax Handling (Provision)**

### **A.9.1 Provision**

- VAT is provision only; core contract is operational document.

- Tax invoice numbering is provisioned via `sequences`.

---

## **A.10 Data Privacy (GCC Context)**

### **A.10.1 Rule**

Data retention mandatory by UAE law; no hard deletes.

### **A.10.2 Functional Additions**

- Export available via admin panel.

- DND + marketing opt-in is sufficient.

---

## **A.11 Contract Disputes**

### **A.11.1 Requirement**

Ability to log disputes.

### **A.11.2 Functional Flow**

- Dispute created → linked to `contracts`.

- Status: OPEN → RESOLVED/CLOSED.

- Outcome recorded.

---

## **A.12 Abandoned Vehicles**

### **A.12.1 Requirement**

Vehicles not returned after overdue threshold.

### **A.12.2 Rules**

- Cron detects severe overdue.

- System marks contract as ABANDONED.

- Creates incident (type = ABANDONED).

- Legal follow-up outside system.

---

## **A.13 Accident During Transfer**

### **A.13.1 Rule**

Same as normal accident, but:

### **A.13.2 Extensions**

- Incident linked to `vehicle_transfer_id`.

- No contract involved unless it occurred during a contract.

---

# =========================

# **PART B — WORKFLOWS & SUB-WORKFLOWS**

# =========================

Below are ONLY the new addendum workflows following the same BPMN/textual style used in the main document.

(If you want I can generate full BPMN/mermaid diagrams too.)

---

## **B.1 Insurance Excess Flow**

**START**  
→ Incident created  
→ System loads excess amount  
→ Creates provisional excess charge  
→ Notification to customer  
→ Operator selects collection timing  
→ Payment collected OR scheduled  
→ Insurance claim progresses  
→ Repair cost updated  
→ Insurer payout entered  
→ System computes final liability  
→ Creates adjustment charges  
→ Settlement at contract closure  
**END**

---

## **B.2 Concurrent Modification Flow**

**User 1 loads Contract #123**  
**User 2 loads Contract #123**

→ User 1 updates contract  
→ System updates `version = version + 1`

→ User 2 attempts update  
→ Server receives outdated version  
→ Update fails  
→ UI shows “Contract updated by another operator, please refresh.”  
→ User refreshes and re-applies changes  
**END**

---

## **B.3 Scanned Signature Flow**

Activate contract  
→ Generate PDF  
→ Print  
→ Physical signature  
→ Scan  
→ Upload scanned file  
→ System stores as `SIGNED_CONTRACT_SCAN`  
→ Linked to contract  
**END**

---

## **B.4 Availability Cache Refresh Flow**

Event occurs (reservation/contract/maintenance/transfer)  
→ Update relevant vehicle rows  
→ Rebuild affected date windows  
→ Write new cache state  
→ Cron validates integrity nightly  
**END**

---

## **B.5 Return Grace-Period Penalty Flow**

Vehicle returned  
→ Compare actual end time vs planned  
→ IF difference ≤ grace → no penalty  
→ ELSE → apply late fee / extra day  
→ Update charges  
→ Update outstanding  
**END**

---

## **B.6 Minimum Rental Enforcement Flow**

Read actual rental duration  
→ Read tariff minimum  
→ Round actual duration UP  
→ Compute invoice based on rounded duration  
**END**

---

## **B.7 Cross-Branch Return Flow**

Pickup at Branch A  
→ Return at Branch B  
→ Compute one-way fee  
→ Apply fee as charge  
→ Continue closure  
**END**

---

## **B.8 Contract Dispute Flow**

Customer challenges charge  
→ Operator creates dispute  
→ Adds disputed amount  
→ Marks contract as in dispute  
→ Supervisor reviews  
→ Outcome set  
→ Adjust charges if needed  
→ Dispute closed  
**END**

---

## **B.9 Abandoned Vehicle Flow**

Contract overdue beyond threshold  
→ Cron flags as ABANDONED  
→ System creates incident  
→ Alerts management  
→ Legal process outside system  
→ Incident closed when resolved  
**END**

---

## **B.10 Transfer Accident Flow**

Vehicle in transfer  
→ Damage detected  
→ Create incident(type = TRANSFER_ACCIDENT)  
→ Create inspection entries  
→ Insurance process similar to normal accident  
**END**

---

# =========================

# **PART C — ADDITIONAL DATA MODEL**

# =========================

(New tables + added fields to existing ones)

---

## **C.1 Insurance Claim Extensions**

Add fields to `insurance_claims`:

| Field                    | Type          | Description                 |
| ------------------------ | ------------- | --------------------------- |
| insurer_paid_amount      | DECIMAL(12,2) | Amount insurer pays         |
| final_customer_liability | DECIMAL(12,2) | Final liability calculation |

---

## **C.2 Dispute Table Additions**

`contract_disputes` already present, add:

| Field              | Type         | Description            |
| ------------------ | ------------ | ---------------------- |
| evidence_file_path | VARCHAR(512) | Optional documentation |

---

## **C.3 Abandonment Fields**

Add to `incidents`:

| Field                       | Type     | Description              |
| --------------------------- | -------- | ------------------------ |
| abandonment_threshold_hours | INT      | System-defined threshold |
| last_contact_attempt_at     | DATETIME | Last attempt time        |
| contact_attempts_count      | INT      | Attempts                 |

---

## **C.4 Transfer Accident Fields**

Add to `incidents`:

| Field               | Type   | Description            |
| ------------------- | ------ | ---------------------- |
| vehicle_transfer_id | BIGINT | Link to transfer event |

---

## **C.5 Subscription Provision Tables**

Provision-only:

`subscription_contracts` (future):

| Field               | Type    | Description          |
| ------------------- | ------- | -------------------- |
| contract_id         | BIGINT  | Linked base contract |
| auto_renew          | BOOLEAN | Whether auto-renews  |
| renewal_period_days | INT     | Next renewal cycle   |

---

## **C.6 Concurrent Version Fields**

`contracts.version` required.  
Also recommended for:

- `reservations.version`

- `incidents.version`

- `insurance_claims.version`

---

## **C.7 Settings Additions**

Add keys:

- `PAYMENT_GRACE_DAYS`

- `OVERDUE_ABANDON_THRESHOLD_HOURS`

- `ALLOW_ONE_WAY_RETURNS`

---

## **C.8 Availability Cache Metadata**

Add fields:

| Field           | Type        | Purpose              |
| --------------- | ----------- | -------------------- |
| last_rebuild_at | DATETIME    | Integrity validation |
| rebuild_source  | VARCHAR(32) | 'CRON' or 'EVENT'    |

---

## **C.9 VAT Provision Fields**

Add to `contract_charges`:

| Field        | Type          | Description                 |
| ------------ | ------------- | --------------------------- |
| tax_category | VARCHAR(64)   | e.g., RENTAL, DRIVER, EXTRA |
| tax_rate     | DECIMAL(5,2)  | For future use              |
| tax_amount   | DECIMAL(12,2) | Future VAT implementation   |

---

# =========================

# **PART D — RULES & CONFIGURATION**

# =========================

## **D.1 Pricing Hierarchy**

Pickup branch tariff → always primary.  
Seasonal/override tariff → applied based on date.  
Cross-branch return fee → additive.

---

## **D.2 Deposit Use Logic**

Deposit can be used for:

- Excess

- Fuel

- Extra KM

- Late fees

- Other charges

System must always show:

- Deposit received

- Deposit used

- Deposit refundable

---

## **D.3 Excess Priority**

When settling:

1. Excess

2. Damage

3. Other charges

4. Rent

5. Fines

(Sequence ensures legal compliance.)

---

## **D.4 Payment Confirmation**

Every payment triggers:

- SMS / Email confirmation

- Ledger update

- Audit log entry

---

## **D.5 Late Return Rules**

Late = past planned + grace period.

Penalty formula:

- If hourly rentals → hourly rate

- For daily rentals → additional day(s)

---

## **D.6 Branch vs Global Scope**

- Templates, tariffs, providers → branch override allowed

- Sequences → branch or global

- Notifications → branch override

---

## **D.7 Contract Immutability**

After contract is **CLOSED**:

- No edits allowed

- Only “add note” allowed

- Internal evidence files allowed

- Never delete, never overwrite

---

# =========================

# **PART E — INTEGRATION POINTS**

# =========================

This addendum connects to:

- **Part 2 – Feature List**

- **Part 3 – Workflows**

- **Part 4 – Data Model**

- **Part 5 – Architecture**

Updates required:

- Insert cross-links to each new workflow

- Update TOC

- Include addendum references in contract lifecycle section

- Add insurance/dispute/transfer clarifications into Part 3 of main doc

---

# =========================

# **PART F — DEV & QA GUIDANCE**

# =========================

### **F.1 Edge Case Matrix**

- Transfer accident vs normal accident

- Long overdue vs abandoned

- Dispute vs pending excess

- Cross-branch return with maintenance block

- Minimum rental edge boundaries

### **F.2 Validation Rules**

- Minimum rental enforced

- Grace period applied correctly

- Version mismatch error thrown on concurrent edits

- Excess cannot be negative

- Deposit refund cannot exceed received

### **F.3 Logging Expectations**

Every major operation must be logged in `audit_logs` with:

- old values

- new values

- timestamp

- operator
