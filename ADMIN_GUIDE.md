# Administrator Guide
## RCCMS - Rental Car Contract Management System

**Version 1.0** | **For System Administrators**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Access](#system-access)
3. [User Management](#user-management)
4. [System Settings](#system-settings)
5. [Master Data Management](#master-data-management)
6. [Audit Logs & Monitoring](#audit-logs--monitoring)
7. [System Errors](#system-errors)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

### Purpose
This guide provides comprehensive instructions for system administrators managing the RCCMS Rental Car Contract Management System. It covers all administrative functions, security settings, user management, and system monitoring.

### Administrator Role
As an administrator, you have full access to:
- User account management
- System configuration
- Master data (customers, vehicles, sponsors, companies)
- All contracts and payments
- Audit logs and system errors
- Company settings and financial configuration

### Key Responsibilities
- ✅ Managing user accounts and permissions
- ✅ Configuring system settings
- ✅ Monitoring system health and errors
- ✅ Reviewing audit logs for compliance
- ✅ Maintaining master data integrity
- ✅ Ensuring data backup and security

### Authoritative Documentation

This guide should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (15 tables, 100+ endpoints, 22 pages)
- **PROJECT_ANALYSIS.md** - Complete system analysis including bug fixes and prevention strategies

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

### Recent System Updates (October 27, 2025)

**Critical Bug Fixes & Data Integrity Improvements:**

The system has been hardened with important fixes discovered during comprehensive documentation review:

**1. Financial Reporting Accuracy**
- **Issue Fixed**: Payment method field access corrected (`payment.paymentMethod` vs incorrect `payment.method`)
- **Impact**: Financial reports now accurately categorize payments by method (cash/card/bank_transfer)
- **Admin Benefit**: Revenue analysis by payment method is now 100% accurate for business intelligence

**2. Audit Log Bilingual Support**
- **Issue Fixed**: Added 26 missing translation keys for contract lifecycle and master data operations
- **Actions Now Translated**: confirm, activate, complete, close, payment, enable, disable, plus all customer/vehicle/sponsor/company CRUD operations
- **Admin Benefit**: Full audit trail compliance with bilingual support for regulatory requirements

**3. Audit Report Reliability**
- **Issue Fixed**: Implemented missing `userActivity` calculation and removed non-existent `fieldName` property access
- **Impact**: Audit reports now load without errors and provide accurate user activity statistics
- **Admin Benefit**: Complete audit trail for compliance and user accountability tracking

**4. Schema Validation Framework**
- **Prevention Strategy**: Established TypeScript strict checks and LSP diagnostics review process
- **Admin Benefit**: Future schema changes will be caught before deployment

**Technical Details:**
- All fixes applied to `server/storage.ts` and `client/src/lib/i18n.ts`
- No database migrations required - code-only fixes
- Full backward compatibility maintained
- Complete documentation in PROJECT_ANALYSIS.md

**Administrative Action Required:**
✅ None - All fixes are automatic and transparent to users. System reliability and data accuracy improved without any configuration changes needed.

### Performance Optimizations (December 2025)

**Frontend Performance Enhancement:**

The system has been optimized with route-based lazy loading for dramatically improved initial load times:

**5. Application Performance**
- **Optimization**: Implemented React.lazy() and Suspense for all 21 application pages (except Login)
- **Initial Bundle Size**: Reduced from ~744KB to ~50KB (88% reduction)
- **Load Time**: Improved from 4-5 seconds to 1-2 seconds (3-4x faster)
- **User Experience**: Login page loads instantly, subsequent pages show professional loading spinner
- **Smart Caching**: Previously visited pages load instantly from browser cache
- **Admin Benefit**: Faster system access, reduced bandwidth usage, improved user satisfaction

**Technical Details:**
- Lazy-loaded pages: Dashboard, Contracts, Customers, Vehicles, Users, Settings, Reports, Audit Logs, etc.
- Professional loading experience with animated Loader2 spinner
- Login page eager-loaded for immediate access
- Zero configuration required - optimization is automatic

**Administrative Action Required:**
✅ None - Performance improvements are automatic. Users will immediately experience faster loading times without any action needed.

---

## System Access

### First Login

**Default Super Admin Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **CRITICAL**: Change the default password immediately after first login.

### Changing Your Password

1. Click on your profile in the sidebar footer
2. Select **"Change Password"**
3. Enter your current password
4. Enter new password (minimum 8 characters)
5. Confirm new password
6. Click **"Change Password"**

### Password Requirements
- **Minimum Length**: 8 characters
- **Recommended**: Mix of uppercase, lowercase, numbers, and symbols
- **Avoid**: Common words, personal information, sequential characters

### Session Management
- **Session Duration**: 7 days (automatic expiration)
- **Auto-Logout**: After 7 days of inactivity
- **Security**: Sessions stored in PostgreSQL database
- **Multiple Devices**: Can log in from multiple locations

### Administrative Interface Overview

**Microsoft 365-Style Sidebar Controls**

The RCCMS features a professional Microsoft 365 Admin-style sidebar interface optimized for administrators:

**Icon-Only Control Cluster (Sidebar Header)**
- **☰ Hamburger Menu**: Toggle between expanded (~256px) and collapsed (~48px) modes
- **🌙 Theme Toggle**: Switch between light and dark modes for extended sessions
- **🌐 Language Toggle**: Switch between English and Arabic interfaces instantly
- **Design Rationale**: Icon-only buttons prevent text overflow in both English and Arabic
- **Accessibility**: Tooltips display labels on hover for all controls

**User Profile Footer (Adaptive)**
- **Expanded State**: Avatar + full name + role badge + dropdown caret
- **Collapsed State**: Avatar icon only (tooltip shows your name)
- **Dropdown Menu**: Change password, logout (no duplicate theme/language buttons)
- **Design Benefit**: Maximizes screen space when sidebar collapsed

**Sidebar Navigation States**
- **Expanded Mode**: Full menu text, company branding, detailed user information
- **Collapsed Mode**: Icon-only navigation, centered icons, minimal footprint
- **RTL/LTR Support**: Sidebar automatically mirrors to right side in Arabic mode
- **Persistent State**: Your sidebar preference (expanded/collapsed) is saved

**Why This Design Matters for Administrators:**
- **Efficiency**: Icon-only controls provide consistent layout in both languages
- **Professional**: Matches enterprise software standards (Microsoft 365 Admin)
- **Space Management**: Collapsed mode maximizes screen real estate for data tables
- **Bilingual Excellence**: No text overflow issues regardless of language choice

---

## User Management

### Overview
User management is accessed via **Settings → System Users** in the sidebar.

### User Roles

#### 1. **Administrator (admin)**
**Full System Access**
- Create, edit, disable/enable all users
- Access all contracts regardless of creator
- Modify system settings
- View and manage all master data
- Delete payments
- Access audit logs and system errors
- Configure company and financial settings

#### 2. **Manager (manager)**
**Operational Management**
- View all contracts
- Create and manage contracts (all statuses)
- Access audit logs
- Manage payments (create, view)
- View all master data
- Cannot: delete users, modify system settings, delete payments

#### 3. **Staff (staff)**
**Daily Operations**
- Create contracts (own contracts only)
- Edit contracts they created
- View customers and vehicles
- Basic reporting access
- Cannot: access other users' contracts, modify settings, delete anything

#### 4. **Viewer (viewer)**
**Read-Only Access**
- View contracts (all)
- View reports
- View master data
- Cannot: create, edit, or delete anything
- Ideal for: accountants, supervisors, auditors

### Creating a New User

1. Navigate to **Settings → System Users**
2. Click **"Add User"** button
3. Fill in user details:
   - **Username**: Unique identifier (lowercase, no spaces)
   - **Email**: Valid email address
   - **First Name**: User's first name (English)
   - **Last Name**: User's last name (English)
   - **Role**: Select from dropdown (admin/manager/staff/viewer)
   - **Password**: Temporary password (user should change on first login)
   - **Confirm Password**: Re-enter password
4. Click **"Create User"**
5. Inform the user of their credentials securely

**Best Practices:**
- ✅ Use company email addresses
- ✅ Assign the least privileged role needed
- ✅ Create a unique username (first.last format recommended)
- ✅ Generate strong temporary passwords
- ✅ Require password change on first login

### Editing User Roles

1. Go to **Settings → System Users**
2. Find the user in the list
3. Click the **Edit** icon
4. Change the **Role** dropdown
5. Click **"Update User"**

**Note**: The super admin account (username: admin) cannot have its role changed.

### Disabling Users

**When to Disable:**
- Employee termination
- Extended leave
- Security concerns
- Account compromise

**How to Disable:**
1. Navigate to **Settings → System Users**
2. Find the user
3. Click **"Disable"** button
4. Confirm the action

**Effects:**
- User immediately logged out
- Cannot log in again
- User data preserved
- Can be re-enabled later

### Re-Enabling Users

1. Filter to show **Disabled Users** (toggle filter)
2. Find the user
3. Click **"Enable"** button
4. User can now log in again

### Immutable Super Admin

The system includes one protected administrator account:
- **Username**: `admin`
- **Cannot be disabled**
- **Cannot be deleted**
- **Role cannot be changed**
- **Password can be changed**
- **Purpose**: Ensures system access recovery

---

## System Settings

### Company Settings

**Location**: Settings → Company

#### Configuration Options

**Company Information (Bilingual)**
- **Company Name (English)**: Official English business name
- **Company Name (Arabic)**: Official Arabic business name (displayed in RTL)
- **Commercial Registration**: Business registration number
- **Tax ID**: Tax identification number
- **Phone**: Primary contact number
- **Email**: Official company email
- **Address (English)**: Physical address in English
- **Address (Arabic)**: Physical address in Arabic
- **Website**: Company website URL (optional)

**How to Update:**
1. Navigate to **Settings → Company**
2. Edit any field
3. Click **"Save Settings"**
4. Changes apply immediately to new contracts

**Important Notes:**
- ✅ Company name appears in sidebar header
- ✅ Used in PDF contract generation
- ✅ Displayed on all reports
- ✅ Visible to all users

### Financial Settings

**Location**: Settings → Financials (Admin-only access)

This comprehensive financial configuration page contains 11 default settings that automatically populate all new contracts, streamlining contract creation while allowing per-contract customization.

#### Default Rates Configuration

**Base Rental Rates**
- **Daily Rate**: Default charge per day
- **Weekly Rate**: Discounted weekly rate
- **Monthly Rate**: Discounted monthly rate

**Additional Charges**
- **Insurance (Daily)**: Insurance cost per day
- **GPS Fee (Daily)**: GPS device rental per day
- **Baby Seat Fee (Daily)**: Child seat rental per day
- **Additional Driver Fee**: One-time fee for extra drivers
- **Extra Km Rate**: Charge per kilometer beyond included mileage

**Financial Defaults**
- **Security Deposit**: Default deposit amount required from customers

**Fuel Pricing** (Critical for automatic fuel charge calculation)
- **Petrol Price per Liter**: Current petrol/gasoline price per liter
- **Diesel Price per Liter**: Current diesel price per liter

**How Auto-Population Works:**
1. Administrator configures all 11 defaults in Financial Settings
2. When creating new contract, all rates automatically populate form fields
3. User can override any rate for specific contract if needed
4. Updated financial settings only affect NEW contracts (existing contracts unchanged)

**Fuel Charge Calculation:**
The system automatically calculates fuel charges when completing contracts using this formula:

```
fuelCharge = tankCapacity × (startFuelLevel% - endFuelLevel%) / 100 × pricePerLiter
```

**Example:**
- Tank Capacity: 60 liters
- Start Fuel: 100% (Full)
- End Fuel: 50% (Half)
- Petrol Price: 2.50 SAR/liter
- Calculation: 60 × (100 - 50) / 100 × 2.50 = 60 × 0.5 × 2.50 = 75 SAR

**How to Configure:**
1. Navigate to **Settings → Financials**
2. Update all 11 financial defaults:
   - defaultDailyRate
   - defaultWeeklyRate
   - defaultMonthlyRate
   - insurancePerDay
   - gpsPerDay
   - babySeatPerDay
   - additionalDriverFee
   - defaultExtraKmRate
   - defaultSecurityDeposit
   - petrolPricePerLiter (important for automatic fuel calculations)
   - dieselPricePerLiter (important for automatic fuel calculations)
3. Click **"Save Financial Settings"**
4. All new contracts will use these defaults

**Best Practices:**
- ✅ Update fuel prices weekly or when market rates change
- ✅ Review all defaults monthly to ensure competitive pricing
- ✅ Set realistic security deposit amounts
- ✅ Keep daily/weekly/monthly rates proportional
- ✅ Document price changes for audit purposes

**Important Notes:**
- Changes affect **new contracts only** - existing contracts retain original rates
- Per-contract override capability preserved
- Fuel price accuracy critical for fair customer billing
- All rates stored in company's primary currency

### Terms & Conditions

**Location**: Settings → Terms & Conditions

#### Customizable Contract Clauses

**Default Sections Included:**
1. Rental terms and duration
2. Payment obligations
3. Vehicle condition and inspection
4. Insurance coverage
5. Driver requirements
6. Prohibited uses
7. Fuel policy
8. Return conditions
9. Late fees
10. Liability and damages

**How to Customize:**
1. Navigate to **Settings → Terms & Conditions**
2. Edit the **English Terms** textarea
3. Edit the **Arabic Terms** textarea
4. Click **"Save Terms"**
5. Terms appear in all new contracts

**Best Practices:**
- ✅ Keep terms clear and concise
- ✅ Ensure Arabic translation matches English
- ✅ Review with legal counsel
- ✅ Update when regulations change
- ✅ Version control (maintain change history separately)

---

## Master Data Management

### Customers

**Location**: Masters → Customers

#### Adding Customers

1. Click **"Add Customer"** button
2. Fill required fields:
   - **Name (English)**: Full customer name in English
   - **Name (Arabic)**: Full customer name in Arabic
   - **National ID**: ⚠️ **MANDATORY** - National ID or passport number (enforced at frontend + backend)
   - **Nationality**: ⚠️ **MANDATORY** - Customer nationality (enforced at frontend + backend)
   - **Phone**: ⚠️ **MANDATORY** - Contact number with country code (enforced at frontend + backend)
   - **License Number**: ⚠️ **MANDATORY** - Driver's license number (enforced at frontend + backend)
   - **Email**: Valid email address
   - **Address**: Physical address
   - **License Expiry**: License expiration date
3. Click **"Create Customer"**

**⚠️ Mandatory Field Enforcement:**
- **Dual-Layer Validation:** All mandatory fields enforced at BOTH frontend (Zod schema) AND backend (API validation)
- **Cannot Bypass:** Backend validation prevents API-level bypass of frontend validation
- **Phone Validation:** Required `.min(1)` in addition to `.notNull()` to prevent empty string submissions
- **Data Integrity:** Ensures complete customer records for contract creation and legal compliance

**Phone Number Validation:**
- System automatically checks for duplicate phone numbers
- **Non-blocking warning** displayed if duplicate found
- Shows names of other customers with same phone
- User can proceed if intentional (e.g., family members, shared numbers)
- Real-time validation with 500ms debounce for smooth data entry
- Warning examples:
  * "This phone number is already used by: Ahmed Al-Salem"
  * "This phone number is already used by: 2 other customers"

#### Customer Management

**Search & Filter:**
- Use search box to find by name, email, or phone
- Toggle to view Active or Disabled customers

**Editing Customers:**
1. Click Edit icon on customer row
2. Modify any field
3. Click "Update Customer"

**Disabling Customers:**
- For inactive or problematic customers
- Preserves all historical data
- Can be re-enabled later
- Cannot create new contracts while disabled

### Vehicles

**Location**: Masters → Vehicles

#### Adding Vehicles

1. Click **"Add Vehicle"** button
2. Enter vehicle details:
   - **Registration Number**: License plate
   - **Make**: Manufacturer (Toyota, Honda, etc.)
   - **Model**: Vehicle model
   - **Year**: Manufacturing year
   - **Color**: Vehicle color
   - **VIN**: Vehicle Identification Number
   - **Fuel Type**: Petrol or Diesel (critical for fuel charge calculation)
   - **Tank Capacity**: Fuel tank size in liters (critical for automatic fuel charge calculation)
   - **Current Odometer**: Current mileage
   - **Fuel Level**: Current fuel level (Full, 3/4, 1/2, 1/4, Empty)
   - **Features**: GPS, Bluetooth, etc. (optional)
3. Click **"Create Vehicle"**

**Tank Capacity Configuration:**
- Tank capacity (in liters) is REQUIRED for automatic fuel charge calculation
- System uses this value in formula: `fuelCharge = tankCapacity × (startFuel% - endFuel%) / 100 × pricePerLiter`
- Common tank capacities:
  * Small cars (Yaris, Corolla): 40-50 liters
  * Mid-size cars (Camry, Accord): 55-65 liters
  * Large cars/SUVs (Land Cruiser, Suburban): 80-100+ liters
- Verify tank capacity from vehicle manual or manufacturer specifications
- Incorrect tank capacity leads to inaccurate fuel charge calculations

#### Vehicle Availability

**Real-Time Checking:**
- System automatically validates vehicle availability
- Checks for overlapping rental dates
- Prevents double-booking
- Shows availability status badges

**Automatic Status Synchronization:**
- **Contract Confirm/Activate**: Vehicle status automatically changes to "rented"
- **Contract Complete/Close**: Vehicle status automatically changes to "available"
- **Seamless Integration**: No manual status updates required
- **Real-Time Updates**: Status reflects instantly across system
- **Error Prevention**: Eliminates manual status update errors

**Managing Out-of-Service Vehicles:**
1. Disable vehicle temporarily
2. Prevents new contract creation
3. Existing contracts unaffected
4. Re-enable when repaired/serviced

**Status Lifecycle:**
```
Available → (Confirm/Activate) → Rented → (Complete/Close) → Available
```

### Sponsors

**Location**: Masters → Sponsors

**Purpose**: Individual guarantors for customer contracts

#### Adding Sponsors

1. Click **"Add Sponsor"** button
2. Fill sponsor details:
   - **Name (English)**: Full name in English
   - **Name (Arabic)**: Full name in Arabic
   - **Email**: Contact email
   - **Phone**: Contact number
   - **ID Number**: National ID
   - **ID Type**: Type of ID
3. Click **"Create Sponsor"**

**Usage**: Sponsors can be selected when creating contracts with "With Sponsor" hirer type.

### Companies

**Location**: Masters → Companies

**Purpose**: Corporate sponsors for business rentals

#### Adding Companies

1. Click **"Add Company"** button (Admin/Manager only)
2. Enter company details:
   - **Company Name (English)**
   - **Company Name (Arabic)**
   - **Registration Number**: Business registration
   - **Tax ID**: ⚠️ **MANDATORY** - Tax identification number (enforced at frontend + backend)
   - **Contact Person**: ⚠️ **MANDATORY** - Primary contact name (enforced at frontend + backend)
   - **Phone**: ⚠️ **MANDATORY** - Company phone (enforced at frontend + backend)
   - **Email**: ⚠️ **MANDATORY** - Company email (enforced at frontend + backend)
   - **Address**: Business address
3. Click **"Create Company"**

**⚠️ Mandatory Field Enforcement:**
- **Dual-Layer Validation:** TAX ID, Contact Person, Phone, Email enforced at BOTH frontend AND backend
- **Cannot Bypass:** Backend validation prevents API-level bypass
- **Business Compliance:** Ensures complete corporate records for tax reporting and legal compliance

**Usage**: Companies can be selected for "From Company" hirer type contracts.

---

## Vehicle Inspection Management

### Overview

**Location**: View inspections within each contract's detail page

**Access Level**: Admin and Manager can view all inspections; Staff/Viewer can view only

### Two-Stage Inspection System

RCCMS implements a mandatory two-stage vehicle inspection workflow to protect both the rental company and customers from disputes:

**Stage 1: Pre-Delivery Inspection**
- **When**: Required before contract activation
- **Purpose**: Document vehicle condition before handover to customer
- **Gating**: Contract cannot be activated without pre-delivery inspection

**Stage 2: Post-Return Inspection**
- **When**: Required before contract completion
- **Purpose**: Document vehicle condition after customer returns vehicle
- **Gating**: Contract cannot be completed without post-return inspection

### Pre-Delivery Inspection Process

**Administrator/Manager Workflow:**

1. Contract must be in **Confirmed** status
2. User clicks **"Activate Contract"** button
3. System automatically opens **Pre-Delivery Inspection** dialog
4. Inspector (staff member) must complete:
   - **Inspector Name**: Full name of person conducting inspection
   - **Odometer Reading**: Current vehicle mileage
   - **Fuel Level**: Exact fuel percentage (0-100%)
   - **Condition Notes**: Document any existing scratches, dents, or damage
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
5. System validates:
   - All fields filled
   - Exactly 6 photos uploaded
   - Each photo is unique (no duplicates)
   - Photos meet size requirements (< 10MB each)
6. Photos automatically compressed to 1920x1080, 0.85 quality, JPEG format
7. Click **"Save Inspection & Activate"**
8. Contract automatically activates after successful inspection creation

**What is Stored:**
- Inspector name and timestamp
- Complete vehicle condition documentation
- 6 photos in JSONB format (base64-encoded)
- Odometer and fuel readings for comparison at return

**Why This Matters:**
- Legal proof of vehicle condition before handover
- Protects against false damage claims
- Photo evidence of pre-existing damage
- Required by insurance and legal compliance
- Cannot activate contract without this step

### Post-Return Inspection Process

**Administrator/Manager Workflow:**

1. Contract must be in **Active** status
2. User clicks **"Complete Contract"** button
3. System automatically opens **Post-Return Inspection** dialog
4. Inspector must complete:
   - **Inspector Name**: Full name of person conducting inspection
   - **Odometer Reading**: Current vehicle mileage at return
   - **Fuel Level**: Exact fuel percentage at return (0-100%)
   - **Condition Notes**: Document any NEW damage found
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
5. System validates same requirements as pre-delivery
6. Click **"Save Inspection"**
7. System automatically opens **Return Charges** dialog
8. Inspector reviews auto-filled data and adds damage charges if needed
9. Contract completes after finalizing charges

**What is Stored:**
- Same fields as pre-delivery inspection
- Allows comparison of before/after condition
- Photo evidence of return condition
- Automatic fuel charge calculation based on difference

**Why This Matters:**
- Legal proof of vehicle condition after return
- Compare with pre-delivery photos to identify new damage
- Justifies damage charges with photo evidence
- Required for contract completion
- Cannot complete contract without this step

### Inspection History View

**Location**: Open any contract → Inspection History card

**What You See:**
- Chronological list of all inspections for that contract
- Visual badges showing inspection type:
  - **Pre-Delivery**: Blue badge with truck icon
  - **Post-Return**: Gray badge with checkmark icon
- For each inspection:
  - Inspection date and time
  - Inspector name
  - Odometer reading
  - Fuel level
  - Condition notes
  - 6 photos in gallery with zoom capability
- Click any photo to view full-size

**Comparison View:**
- Admins can compare pre-delivery vs post-return photos side-by-side
- Easily identify new damage
- Justify charges with visual proof

### Photo Storage & Management

**Technical Details:**
- Photos stored as base64-encoded JSONB in PostgreSQL
- Each photo includes:
  - `angle`: front, back, left, right, top, dashboard
  - `data`: base64 image data
- Automatic compression reduces storage needs
- Photos permanently stored with contract
- Cannot be deleted (audit trail)

**Storage Considerations:**
- Each inspection: ~6MB compressed (6 photos × 1MB average)
- 1000 inspections: ~6GB database storage
- **Future Migration Path**: Can move to object storage (S3, R2, etc.) for scale
- Current JSONB approach sufficient for MVP and medium-scale operations

**Backup Requirements:**
- Ensure PostgreSQL backups include large JSONB data
- Test restore process with photo data
- Monitor database size growth
- Plan migration to object storage at ~5,000 active contracts

### Inspection Audit Logging

All inspection operations are fully logged:

**Pre-Delivery Inspection Created:**
- Action: `CREATE`
- Entity: `inspection` (type: pre_delivery)
- Details: Inspector name, odometer, fuel level, photo count
- Timestamp and user who created

**Post-Return Inspection Created:**
- Action: `CREATE`
- Entity: `inspection` (type: post_return)
- Details: Same as pre-delivery
- Links to contract completion event

**Audit Log Location**: Logs & Errors → Audit Logs → All Actions tab

### Best Practices for Administrators

**Photo Quality:**
- ✅ Ensure good lighting conditions
- ✅ Capture all angles clearly
- ✅ Document damage close-up AND wide shots
- ✅ Use consistent photo angles for before/after comparison
- ❌ Don't accept blurry or dark photos
- ❌ Don't skip any of the 6 required angles

**Inspection Timing:**
- ✅ Conduct pre-delivery inspection immediately before customer pickup
- ✅ Conduct post-return inspection immediately when customer returns
- ✅ Don't delay inspections (conditions may change)
- ✅ Ensure customer present for transparency

**Documentation:**
- ✅ Be thorough in condition notes
- ✅ Document even minor scratches
- ✅ Use specific language ("2cm scratch on rear bumper")
- ❌ Don't use vague descriptions ("some damage")

**Damage Disputes:**
- ✅ Compare pre vs post photos immediately
- ✅ Show customer side-by-side comparison
- ✅ Document customer acknowledgment
- ✅ Keep inspection records for minimum 2 years
- ✅ Use inspection photos as legal evidence if needed

### Troubleshooting Inspection Issues

**Problem: "Upload Failed" Error**
- **Cause**: Photo too large (>10MB)
- **Solution**: Use lower resolution camera or compress photos before upload

**Problem: "Duplicate Photo" Error**
- **Cause**: Same photo uploaded twice
- **Solution**: Ensure 6 unique photos from different angles

**Problem**: Cannot activate/complete contract
- **Cause**: Missing required inspection
- **Solution**: Complete inspection dialog before attempting activation/completion

**Problem**: Photos not displaying
- **Cause**: Browser cache or large JSONB data
- **Solution**: Refresh page, check database connection

---

## Audit Logs & Monitoring

### Dual Audit System Architecture

**Important:** RCCMS provides TWO distinct audit views for different purposes:

#### 1. System Audit Logs (Logs & Errors → Audit Logs)

**Purpose:** Complete system-wide security and compliance logging

**Endpoint:** `/api/audit-logs`

**Scope:** ALL operations including:
- User authentication (logins, logouts)
- Business operations (contracts, master data, payments, inspections)
- System errors (acknowledged errors)
- Configuration changes (company settings updates)

**Use Cases:**
- Security audits and monitoring
- Compliance reporting
- System troubleshooting
- User behavior analysis

#### 2. Business Operations Audit (Reports → Audit Report)

**Purpose:** Business operations audit trail only

**Endpoint:** `/api/reports/audit`

**Scope:** ONLY business operations:
- Contract lifecycle (create, confirm, activate, complete, close)
- Master data operations (customers, vehicles, sponsors, companies)
- Payment operations (create_payment)
- Inspection operations (create_inspection)
- Contract field modifications

**Excludes:**
- user_login, user_logout
- system_error_acknowledged
- update_company_settings

**Use Cases:**
- Operational reporting
- Contract audit trails
- Business analytics
- User productivity tracking

**Key Difference:**
- System Audit Logs = Comprehensive (for security/compliance)
- Business Operations Audit = Filtered (for operational reporting)

### Accessing Audit Logs

**Location**: Logs & Errors → Audit Logs (System-Wide) OR Reports → Audit Report (Business Operations)

**Access Level**: Admin and Manager only

### What is Logged

**User Actions:**
- Login / Logout events
- Password changes
- User creation, modification, disabling

**Master Data:**
- Customer create, update, disable/enable
- Vehicle create, update, disable/enable
- Sponsor create, update, disable/enable
- Company create, update, disable/enable
- **Complete UPDATE tracking** - All field-level changes logged with before/after values

**Contract Operations:**
- Contract creation
- Contract editing (with reason)
- Status changes (confirm, activate, complete, close)
- Contract printing
- Contract disable/enable

**Payment Operations:**
- Payment creation
- Payment deletion (admin only)

**System Changes:**
- Settings modifications
- System error acknowledgment

### Audit Log Information

Each log entry includes:
- **Action**: Type of operation performed
- **User**: Who performed the action
- **Contract**: Related contract (if applicable)
- **Location**: Country, city, region (geolocation)
- **Timestamp**: Exact date and time
- **Details**: Description of the action
- **User Agent**: Browser and device information (in details)
- **IP Address**: Network location
- **Session ID**: Session identifier

### Filtering Audit Logs

**Available Filters:**
- **Action Type**: Filter by specific actions (login, create, edit, etc.)
- **User**: Filter by specific user
- **Date From**: Start date
- **Date To**: End date

**How to Filter:**
1. Go to **Logs & Errors → Audit Logs**
2. Use filter dropdowns and date pickers
3. View filtered results in table

### Reviewing Audit Logs

**Daily Monitoring:**
- Check for suspicious login attempts
- Review recent modifications
- Verify user activities
- Monitor geolocation for unusual access

**Compliance Audits:**
- Export relevant date ranges
- Review specific user actions
- Track contract modifications
- Verify payment operations

**Investigation:**
- Use session ID to correlate actions
- Track user behavior patterns
- Identify security incidents
- Investigate data discrepancies

---

## System Errors

### Overview

**Location**: Logs & Errors → System Errors

**Access Level**: Admin only

### Error Types

**Database Errors:**
- Connection failures
- Query timeouts
- Constraint violations
- Migration issues

**Application Errors:**
- Server crashes
- API failures
- Validation errors
- Authentication issues

**Integration Errors:**
- External API failures
- Payment gateway issues
- Geolocation service errors

### Error Information

Each error log contains:
- **Error Type**: Category of error
- **Error Message**: Detailed description
- **Stack Trace**: Technical debugging information
- **Endpoint**: API route where error occurred
- **User**: User who encountered the error (if applicable)
- **Timestamp**: When error occurred
- **Acknowledged**: Whether admin has reviewed
- **Acknowledged By**: Admin who acknowledged
- **Acknowledged At**: When acknowledged

### Managing System Errors

**Reviewing Errors:**
1. Navigate to **Logs & Errors → System Errors**
2. Filter to **Unacknowledged Errors** (default)
3. Review error details
4. Investigate root cause

**Acknowledging Errors:**
1. Review the error details
2. Take corrective action if needed
3. Click **"Acknowledge"** button
4. Error moves to acknowledged list

**Best Practices:**
- ✅ Check system errors daily
- ✅ Investigate unacknowledged errors immediately
- ✅ Document recurring issues
- ✅ Escalate critical errors
- ✅ Keep error logs for analysis

---

## Security Best Practices

### User Account Security

**Password Policy:**
- ✅ Minimum 8 characters
- ✅ Regular password changes (every 90 days recommended)
- ✅ No password sharing
- ✅ Unique passwords per user
- ✅ No default passwords in production

**Access Control:**
- ✅ Assign minimum required role
- ✅ Disable unused accounts immediately
- ✅ Review user list monthly
- ✅ Remove terminated employees immediately
- ✅ Monitor admin account usage

### Session Security

**Best Practices:**
- ✅ Always log out after use
- ✅ Don't save passwords in browser
- ✅ Use HTTPS only (production)
- ✅ Clear browser cache on shared computers
- ✅ Don't share session cookies

### Data Protection

**Sensitive Information:**
- ✅ Customer ID numbers encrypted
- ✅ Payment information protected
- ✅ Audit logs preserved
- ✅ Regular database backups
- ✅ Secure environment variables

**Access Monitoring:**
- ✅ Review audit logs regularly
- ✅ Monitor login attempts
- ✅ Check geolocation for unusual access
- ✅ Investigate multiple failed logins
- ✅ Track session patterns

### System Hardening

**Production Environment:**
- ✅ Change default admin password
- ✅ Use strong SESSION_SECRET
- ✅ Enable HTTPS/SSL
- ✅ Configure firewall rules
- ✅ Keep software updated
- ✅ Regular security audits

---

## Troubleshooting

### Common Issues

#### Users Cannot Log In

**Possible Causes:**
1. Incorrect password
2. Account disabled
3. Session expired
4. Database connection issue

**Solutions:**
1. Verify username and password
2. Check if account is disabled (Settings → System Users)
3. Clear browser cache and cookies
4. Check database connectivity
5. Review system errors for authentication failures

#### Contracts Not Saving

**Possible Causes:**
1. Validation errors
2. Missing required fields
3. Database constraints
4. Permission issues

**Solutions:**
1. Check form validation messages
2. Ensure all required fields filled
3. Review system errors
4. Verify user has correct role
5. Check vehicle availability

#### Audit Logs Not Appearing

**Possible Causes:**
1. Geolocation service timeout
2. Database write failure
3. Network issues

**Solutions:**
1. Audit logs still created even if geolocation fails
2. Check system errors for audit log failures
3. Verify database connectivity
4. Location data may be null (not critical)

#### PDF Generation Failing

**Possible Causes:**
1. Missing contract data
2. Template rendering error
3. Server memory issues

**Solutions:**
1. Verify contract has all required data
2. Check system errors for PDF failures
3. Review server logs
4. Ensure company settings configured

### Getting Help

**Before Contacting Support:**
1. Check system errors log
2. Review audit logs for relevant actions
3. Verify user permissions
4. Test with different browser
5. Clear browser cache

**Information to Provide:**
- Error message (exact text)
- Steps to reproduce
- User role and username
- Browser and version
- Screenshot of issue
- Relevant system error logs

---

## Appendix

### Keyboard Shortcuts

- **Sidebar Toggle**: `b` key
- **Search Focus**: `/` key (on list pages)
- **Navigation**: Arrow keys (in tables)

### Data Export

**Audit Logs:**
- No built-in export currently
- Use browser print to PDF
- Or copy table data

**Reports:**
- Print to PDF functionality available
- Filter before printing

### System Maintenance

**Regular Tasks:**
- **Daily**: Check system errors, review new audit logs
- **Weekly**: Review user list, check disabled accounts
- **Monthly**: Password reminders, user role review
- **Quarterly**: Full audit log review, security audit
- **Annually**: Terms & conditions update, rate review

---

**End of Administrator Guide**

For technical deployment and maintenance issues, refer to the **Maintenance Guide** and deployment guides (VPS/Docker).

---

## Vehicle Inspection System Administration

### Overview

**System Feature:** Two-Stage Vehicle Inspection Workflow
**Admin Responsibility:** Monitor inspection compliance, manage photo storage, review audit logs

**RATIONALE FOR ADMIN OVERSIGHT:**
- **Legal Compliance:** Ensure all contracts have required photo documentation
- **Storage Management:** Monitor photo storage usage and compression
- **Audit Trail:** Verify inspection logs for compliance and disputes
- **Quality Control:** Review inspection completeness and photo quality

### Inspection System Architecture

**Technical Implementation:**
- **Two Inspection Types:** Pre-delivery (before activation) and Post-return (before completion)
- **Photo Requirements:** Exactly 6 photos per inspection (no duplicates allowed)
- **Storage:** JSONB column in `vehicle_inspections` table
- **Compression:** Automatic client-side compression to ~500KB per photo
- **Workflow Gates:** Backend enforces inspections before state transitions

**Database Tables:**
```sql
-- vehicle_inspections table
CREATE TABLE vehicle_inspections (
  id UUID PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contracts(id),
  inspection_type VARCHAR(20) NOT NULL, -- 'pre_delivery' or 'post_return'
  inspector_name VARCHAR(255) NOT NULL,
  odometer_reading INTEGER NOT NULL,
  fuel_level INTEGER NOT NULL,
  condition_notes TEXT,
  photos JSONB NOT NULL, -- Array of 6 base64 photos
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Monitoring Inspection Compliance

**Check Contracts Without Inspections:**
```sql
-- Find ACTIVE contracts without pre-delivery inspection
SELECT c.id, c.contract_number, c.status
FROM contracts c
LEFT JOIN vehicle_inspections vi ON c.id = vi.contract_id AND vi.inspection_type = 'pre_delivery'
WHERE c.status = 'active' AND vi.id IS NULL;

-- Find COMPLETED contracts without post-return inspection
SELECT c.id, c.contract_number, c.status
FROM contracts c
LEFT JOIN vehicle_inspections vi ON c.id = vi.contract_id AND vi.inspection_type = 'post_return'
WHERE c.status = 'completed' AND vi.id IS NULL;
```

**Expected Result:** Zero rows (all contracts should have required inspections due to workflow gates)

**If Any Found:** Indicates workflow bypass bug - report immediately to developer

### Photo Storage Management

**Monitor Storage Usage:**
```sql
-- Check total inspection photo storage
SELECT 
  COUNT(*) as total_inspections,
  COUNT(*) * 6 as total_photos,
  pg_size_pretty(pg_total_relation_size('vehicle_inspections')) as table_size
FROM vehicle_inspections;
```

**Expected Storage Per Inspection:**
- 6 photos × 500KB = ~3MB per inspection (compressed)
- 100 inspections ≈ 300MB
- 1,000 inspections ≈ 3GB

**Storage Growth Calculation:**
```
Monthly Contracts: [X]
Inspections per Contract: 2 (pre + post)
Storage per Month: X × 2 × 3MB = [Y] MB/month
Annual Storage: Y × 12 MB/year
```

**RATIONALE FOR JSONB STORAGE:**
- **Simplicity:** No separate photo storage service needed (MVP approach)
- **Atomicity:** Photos stored with inspection metadata
- **Backup:** Photos included in database backups automatically
- **Migration Path:** Can migrate to object storage (S3) when scale requires

**When to Migrate to Object Storage:**
- Database size > 50GB due to photos
- Backup/restore time >30 minutes
- Photo retrieval latency >2s
- Cost of database storage > object storage cost

### Audit Log Review

**Inspection Creation Logs:**
```sql
-- View all inspection creation events
SELECT 
  al.action,
  al.contract_id,
  al.user_id,
  u.username,
  al.details,
  al.timestamp
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.action = 'INSPECTION_CREATED'
ORDER BY al.timestamp DESC
LIMIT 50;
```

**Verify Inspection Details:**
- Check `details` JSONB column contains:
  - `inspection_type`: "pre_delivery" or "post_return"
  - `inspector_name`: Staff member name
  - `odometer_reading`: Reasonable value
  - `fuel_level`: 0-100
  - `photo_count`: Always 6

**Red Flags to Investigate:**
- ❌ Photo count ≠ 6 (indicates validation bypass)
- ❌ Duplicate odometer readings across inspections
- ❌ Fuel level outside 0-100 range
- ❌ Missing inspector name
- ❌ Pre-delivery inspection after activation (wrong order)

### Troubleshooting Inspection Issues

**Issue 1: User Cannot Upload Photos**

**Symptoms:**
- Photo upload fails
- Error: "Photo too large"
- Browser freezes during upload

**Diagnosis:**
```sql
-- Check recent system errors
SELECT * FROM system_errors 
WHERE error_message ILIKE '%photo%' OR error_message ILIKE '%inspection%'
ORDER BY created_at DESC LIMIT 10;
```

**Solutions:**
- Verify photo file size <10MB original (compression handles reduction)
- Check browser JavaScript enabled
- Clear browser cache and reload
- Try different browser
- Check server request size limit (should be 10MB in routes.ts)

**Issue 2: Workflow Gate Not Enforcing**

**Symptoms:**
- Contract activated without pre-delivery inspection
- Contract completed without post-return inspection

**Diagnosis:**
```sql
-- Find contracts that bypassed inspection requirement
SELECT c.id, c.contract_number, c.status, 
  COUNT(vi.id) FILTER (WHERE vi.inspection_type = 'pre_delivery') as pre_count,
  COUNT(vi.id) FILTER (WHERE vi.inspection_type = 'post_return') as post_count
FROM contracts c
LEFT JOIN vehicle_inspections vi ON c.id = vi.contract_id
WHERE c.status IN ('active', 'completed', 'closed')
GROUP BY c.id, c.contract_number, c.status
HAVING 
  (c.status IN ('active', 'completed', 'closed') AND COUNT(vi.id) FILTER (WHERE vi.inspection_type = 'pre_delivery') = 0)
  OR
  (c.status IN ('completed', 'closed') AND COUNT(vi.id) FILTER (WHERE vi.inspection_type = 'post_return') = 0);
```

**If Found:** CRITICAL BUG - Backend validation bypassed
**Action:** Contact developer immediately, provide contract IDs

**Issue 3: Photos Not Loading in Inspection History**

**Symptoms:**
- Inspection list shows, but photos blank
- "Loading..." never completes
- Browser console errors

**Diagnosis:**
- Check browser console (F12) for JavaScript errors
- Verify photos exist in database:
```sql
SELECT id, contract_id, jsonb_array_length(photos) as photo_count
FROM vehicle_inspections
WHERE id = '[inspection-id]';
```

**Solutions:**
- If photo_count ≠ 6: Data corruption, review audit logs
- If photos exist but don't display: Frontend issue, check browser compatibility
- Clear browser cache and reload

### Best Practices for Admins

✅ **Weekly Checks:**
- Review inspection completion rate (should be 100%)
- Monitor photo storage growth
- Check for system errors related to inspections
- Verify audit log entries for all inspections

✅ **Monthly Reviews:**
- Database size analysis
- Backup/restore test including photos
- Staff compliance with inspection procedures
- Customer feedback on inspection process

✅ **Quarterly Actions:**
- Storage optimization review
- Consider object storage migration if >50GB
- Review and update inspection photo requirements
- Staff training on inspection best practices

**ADMIN REMINDER:**
The inspection system is a LEGAL PROTECTION feature. Incomplete inspections = lost disputes. Ensure 100% compliance through monitoring and staff training.


---

## Recent System Enhancements (December 2025)

### Dashboard Context-Aware Navigation

**Feature:** One-click filtered navigation from dashboard metric cards

**How It Works:**
1. Dashboard displays critical metrics:
   - Active Rentals (contracts in active status)
   - Monthly Revenue (current month's total)
   - Overdue Returns (contracts past end date)
   - Pending Refunds (contracts with security deposit balance)

2. Click any metric card to navigate to filtered view:
   - **Active Rentals** → Contracts page filtered to active status
   - **Overdue Returns** → Contracts page with `?overdue=true` parameter
   - **Pending Refunds** → Contracts page with `?pendingRefunds=true` parameter  
   - **Vehicle Utilization** → Vehicles page with `?status=active` or `?status=rented`

**Technical Implementation:**
- URL parameters preserve filter state across navigation
- Deep-linking enables bookmarkable filtered views
- Contracts page auto-applies filters on mount based on query parameters
- Vehicles page supports `?status=` filtering for dashboard integration

**Administrator Benefit:**
- Zero-click access to critical contract lists
- Instant visibility into overdue contracts requiring action
- Quick access to pending refund processing
- Streamlined workflow for high-priority operations

---

### Separate Operational Report Exports

**Feature:** Individual PDF/Excel exports for each operational report tab

**Previous Behavior:**
- Single generic operational report export combining all data
- Confusing filenames like `operational-report.pdf`
- Mixed content not focused on specific analysis

**Enhanced Behavior:**
- **Vehicle Utilization Tab** → Exports only vehicle statistics
  - Filename: `vehicle-utilization-report.pdf` / `.xlsx`
  - Content: Vehicle Utilization Summary + Vehicle Statistics table
  - Charts: Utilization pie chart included in export

- **Contract Status Tab** → Exports only contract status data
  - Filename: `contract-status-report.pdf` / `.xlsx`
  - Content: Contract Status Distribution only
  - Charts: Status bar chart included in export

- **Extra Charges Tab** → Exports only extra charges analysis
  - Filename: `extra-charges-report.pdf` / `.xlsx`
  - Content: Extra Charges Summary + Contracts with Charges table
  - Charts: Charges breakdown chart included in export

**Technical Implementation:**
- Frontend passes `activeTab` parameter to export endpoint (`?activeTab=utilization|status|charges`)
- Backend conditionally includes only relevant sections based on tab
- Descriptive filenames improve organization and file management
- Legacy clients without `activeTab` continue receiving generic report

**Administrator Benefit:**
- Focused exports for specific analysis needs
- Clear filenames for report archiving and organization
- Reduced file sizes (only relevant data included)
- Professional presentation for stakeholders and management

---

### Enhanced Data Validation

**Feature:** Dual-layer mandatory field enforcement (frontend + backend)

**Mandatory Customer Fields:**
- National ID ⚠️
- Nationality ⚠️
- Phone ⚠️ (with `.min(1)` to prevent empty strings)
- License Number ⚠️

**Mandatory Company Fields:**
- TAX ID ⚠️
- Contact Person ⚠️
- Phone ⚠️
- Email ⚠️

**Mandatory Contract Rules:**
- Rental start date cannot be in the past
- Uses midnight-normalized comparison for timezone safety
- Validated at both frontend (form) and backend (API) levels

**Why Dual-Layer Validation:**
- **Frontend Validation:** Immediate user feedback, prevents form submission with missing data
- **Backend Validation:** Security layer prevents API-level bypass (e.g., Postman, curl)
- **Data Integrity:** Ensures complete records for legal compliance and contract creation
- **Cannot Bypass:** Backend returns 400 error if validation fails, regardless of frontend state

**Technical Details:**
- Phone validation: `text().notNull().min(1, "Phone required")` prevents both NULL and empty string ""
- Date validation: `startDate >= today` compared at midnight UTC for consistency
- Schema validation: `insertCustomerSchema.parse()` enforces rules server-side

---

### Enhanced Payment Validation

**Feature:** Conditional payment details + final payment enforcement

**Payment Method Details (Conditional Requirements):**

1. **Check/Cheque Payments:**
   - Requires: Cheque Number (mandatory field)
   - Validation: Cannot submit payment without cheque number

2. **Card Payments:**
   - Requires: Last 4 Digits of card (mandatory field)
   - Validation: Must be exactly 4 digits

3. **Bank Transfer Payments:**
   - Requires: Reference Number (mandatory field)
   - Validation: Cannot submit without transfer reference

**Contract Closure Enforcement:**
- **Cannot Close Contract** until final payment recorded
- Backend verification: `totalPaid >= totalDue` (rounded to currency precision)
- Error message displays: "Total paid (X) is less than total due (Y). Please record final payment before closing."
- Admin/Manager can view payment history to verify balance
- Prevents premature contract closure with outstanding balances

**Why This Matters:**
- **Audit Trail:** Complete payment method details for financial reporting
- **Financial Accuracy:** Cannot close contracts with unpaid balances
- **Fraud Prevention:** Cheque/card/transfer details tracked for verification
- **Compliance:** Payment details required for tax reporting and audits

---

### Early Closure Reason Tracking

**Feature:** Mandatory reason when completing contracts before end date

**Trigger Condition:**
- Contract completed before `rentalEndDate`
- System detects: `completionDate < rentalEndDate`

**Workflow:**
1. User clicks "Complete Contract" before end date
2. System opens Early Closure Reason Dialog (cannot be dismissed)
3. User must provide reason (text area, minimum 10 characters)
4. Examples: "Customer early return", "Vehicle needed urgently", "Contract amendment"
5. Reason stored in `contracts.earlyClosureReason` field
6. Contract completion proceeds only after reason provided

**Why Track Early Closures:**
- **Business Intelligence:** Understand patterns in early returns
- **Revenue Analysis:** Calculate lost revenue from shortened rentals
- **Customer Satisfaction:** Identify if early returns indicate service issues
- **Operational Planning:** Adjust inventory and scheduling based on patterns

**Reporting Integration:**
- Early closure reasons included in operational reports
- Filter contracts by early closure status
- Analyze frequency and reasons for business improvements

---

**End of Recent Enhancements Section**

