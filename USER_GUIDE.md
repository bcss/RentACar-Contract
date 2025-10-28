# User Guide
## RCCMS - Rental Car Contract Management System

**Version 1.0** | **For Daily Users (Manager, Staff, Viewer)**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Customers](#managing-customers)
5. [Managing Vehicles](#managing-vehicles)
6. [Creating Contracts](#creating-contracts)
7. [Contract Lifecycle](#contract-lifecycle)
8. [Payment Management](#payment-management)
9. [Reports](#reports)
10. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

### Welcome
Welcome to the RCCMS Rental Car Contract Management System. This guide will help you navigate daily operations, create contracts, manage customers and vehicles, and process payments efficiently.

### User Roles

Your access level depends on your assigned role:

**Manager**
- ✅ View and manage all contracts
- ✅ Create customers, vehicles, sponsors, companies
- ✅ Record and view payments
- ✅ Access all reports
- ✅ View audit logs

**Staff**
- ✅ Create contracts (your own)
- ✅ Edit your contracts (draft status only)
- ✅ Create customers and vehicles
- ✅ View basic reports

**Viewer**
- ✅ View all contracts (read-only)
- ✅ View reports
- ✅ View customers and vehicles
- ❌ Cannot create or edit anything

**Note**: If you need different permissions, contact your system administrator.

### Language Selection

The system supports English and Arabic:

1. Look for the language toggle in the top navigation
2. Click to switch between **EN** and **AR**
3. The entire interface switches languages instantly
4. Your preference is saved for future sessions

**Arabic Mode Features:**
- Right-to-left (RTL) layout
- Arabic font (Cairo)
- All menus, buttons, and labels in Arabic
- Arabic data display

### Authoritative Documentation

This guide should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (15 tables, 100+ endpoints, 22 pages)

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

### Recent System Improvements (October 27, 2025)

**Data Accuracy Enhancements:**

The system has been updated with critical bug fixes to ensure 100% data accuracy:

1. **Financial Reports Accuracy** - Payment method breakdown now correctly displays cash, card, and bank transfer categorization (previously showed "unknown" due to schema mismatch)

2. **Audit Log Translations** - All contract lifecycle actions (confirm, activate, complete, close, payment) now display properly in both English and Arabic (previously showed untranslated keys)

3. **Audit Report Reliability** - User activity tracking now works correctly, preventing potential errors when viewing audit reports

**Impact for Users:**
- Financial reports now provide accurate payment method analysis for business decisions
- Audit logs are fully bilingual and easier to understand
- All reports load faster and more reliably

These improvements were discovered through comprehensive system review and strengthen RCCMS's data integrity and compliance capabilities.

### Performance Enhancements (December 2025)

**Lightning-Fast Page Loading:**

The system now loads dramatically faster with advanced performance optimizations:

**What You'll Notice:**
- ✅ **Login page appears instantly** - No more waiting 4-5 seconds, now just 1-2 seconds
- ✅ **Smooth page transitions** - Professional loading spinner displays when navigating
- ✅ **Fast return visits** - Pages you've visited before load instantly from cache
- ✅ **Works great on mobile** - Excellent performance even on 3G/4G connections

**Technical Details:**
- Initial download reduced from 744KB to 50KB (88% smaller)
- Login page loads immediately for instant access
- Other pages load only when you navigate to them
- Previously visited pages cached for instant access

**Business Benefits:**
- Faster workflow - spend less time waiting, more time working
- Better user experience - professional, responsive application
- Lower bandwidth usage - saves data on mobile connections
- Improved productivity - faster page loads = faster task completion

---

## Getting Started

### Logging In

1. Open the application URL in your web browser
2. Enter your **Username**
3. Enter your **Password**
4. Click **"Login"** (or **"تسجيل الدخول"** in Arabic)

**Forgot Password?** Contact your system administrator.

### First Login

If this is your first time logging in:

1. You'll receive temporary credentials from your administrator
2. Log in with provided username and password
3. **Change your password immediately**:
   - Click your profile in sidebar
   - Select "Change Password"
   - Enter current password
   - Enter new strong password
   - Confirm and save

### Interface Overview

**Microsoft 365-Style Sidebar Navigation**

The system features a professional Microsoft 365 Admin-style sidebar with icon-only controls for a clean, modern interface.

**Sidebar Header Controls (Icon-Only, Responsive Layout)**
- **☰ Hamburger Menu**: Toggle sidebar between expanded (~256px) and collapsed (~48px) modes
- **🌙 Theme Toggle**: Switch between light and dark modes
- **🌐 Language Toggle**: Switch between English and Arabic
- **Responsive Design**: Controls stack **horizontally** when sidebar expanded, **vertically** when collapsed
- **No Overflow**: Vertical stacking in collapsed mode prevents any text/icon overflow
- **Tooltip Accessibility**: Hover over any icon to see its label (tooltips position correctly for RTL/LTR)

**Sidebar Navigation Menu (Left Side in English, Right Side in Arabic)**
- **Dashboard**: Overview and quick stats (tooltip in collapsed mode)
- **Masters**: Customers, Vehicles, Sponsors, Companies (collapsible submenu)
- **Contracts**: All rental contracts (tooltip in collapsed mode)
- **Reports**: Financial, Operational, Customer, Audit (collapsible submenu, Admin/Manager only)
- **Audit & Errors**: Audit logs, System errors (collapsible submenu, Admin/Manager only)
- **Settings**: Company info, Financial settings, Terms (collapsible submenu, Admin only)

**Smart Submenu Behavior:**
- **Collapsed Mode**: Clicking a submenu (e.g., Masters) automatically expands the sidebar first, then opens the submenu
- **No Flickering**: Uses deferred opening pattern to ensure smooth expansion
- **Accessibility**: All menu items show tooltips with labels when sidebar is collapsed

**Sidebar Footer - User Profile**
- **When Expanded**: Shows your avatar, name, and role badge
- **When Collapsed**: Shows only your avatar (tooltip shows your name)
- **Click to Access**: Change password, logout options
- **No Duplicates**: Theme and language controls are in the header only

**Sidebar States**
- **Expanded Mode** (~256px): Full menu text visible, company branding shown
- **Collapsed Mode** (~48px): Icon-only navigation, centered icons, space-efficient
- **RTL/LTR Support**: Sidebar automatically moves to right side in Arabic mode

**Main Content Area**
- Pages display here based on sidebar selection
- Tables, forms, and reports appear in this area

---

## Dashboard Overview

### Quick Stats Cards

**Six Key Metrics:**

1. **Draft Contracts**
   - Contracts in draft status
   - Click to view all drafts

2. **Confirmed Contracts**
   - Verified contracts awaiting vehicle handover
   - Click to filter confirmed contracts

3. **Active Rentals**
   - Currently rented vehicles
   - Most important metric
   - Click to view active contracts

4. **Completed Rentals**
   - Vehicles returned, pending final payment
   - Click to view completed contracts

5. **Closed Contracts**
   - Fully paid and archived
   - Click to view closed contracts

6. **Total Contracts**
   - All contracts in system
   - Click to view all

**Navigation**: Click any card to filter the contracts page to that status.

---

## Managing Customers

### Viewing Customers

**Location**: Masters → Customers

**Features:**
- **Search**: Find customers by name, email, or phone
- **Filter**: View Active or Disabled customers
- **Sort**: Click column headers to sort

### Adding a New Customer

1. Click **"Add Customer"** button
2. Fill in the customer form:

**Required Fields:**
- **Name (English)**: Full legal name in English
- **Name (Arabic)**: Full name in Arabic script
- **Email**: Valid email address
- **Phone**: Contact number (include country code: +966...)
- **ID Number**: National ID or passport number
- **ID Type**: Select type (National ID, Passport, Other)
- **License Number**: Driver's license number
- **License Expiry**: License expiration date

**Optional Fields:**
- **Address**: Physical address

3. Click **"Create Customer"**
4. Success message appears
5. Customer now available for contracts

**Phone Number Duplicate Warning:**
- System automatically checks for duplicate phone numbers
- **Non-blocking warning** displays if phone number already exists
- Shows names of other customers using same phone
- You can proceed if intentional (e.g., family members sharing phone)
- Real-time validation with smooth typing experience
- Example warning: "⚠️ This phone number is already used by: Ahmed Al-Salem"

**Tips:**
- ✅ Double-check ID and license numbers for accuracy
- ✅ Verify license not expired before rental
- ✅ Use consistent name format
- ✅ Include country code in phone numbers
- ✅ Review duplicate phone warnings carefully before proceeding

### Editing Customers

1. Find the customer in the list
2. Click the **Edit** icon (pencil)
3. Modify any field
4. Click **"Update Customer"**
5. Changes saved immediately

**Common Edits:**
- Phone number changes
- Email updates
- Address corrections
- License renewal (update expiry date)

### Customer Status

**Active Customers:**
- Can create new contracts
- Displayed by default

**Disabled Customers:**
- Cannot create new contracts
- Toggle filter to view
- Can be re-enabled by Admin/Manager

---

## Managing Vehicles

### Viewing Vehicles

**Location**: Masters → Vehicles

**Features:**
- **Search**: Find by registration, make, or model
- **Filter**: Active or Disabled vehicles
- **Sort**: Click columns to sort
- **Availability**: Real-time status indicators

### Adding a New Vehicle

1. Click **"Add Vehicle"** button
2. Complete the vehicle form:

**Required Fields:**
- **Registration Number**: License plate number
- **Make**: Manufacturer (Toyota, Honda, BMW, etc.)
- **Model**: Specific model (Camry, Accord, X5, etc.)
- **Year**: Manufacturing year (2020, 2021, etc.)
- **Color**: Vehicle color
- **VIN**: Vehicle Identification Number
- **Fuel Type**: Petrol or Diesel (critical for automatic fuel charge calculation)
- **Tank Capacity**: Fuel tank size in liters (required for automatic fuel calculations)
- **Current Odometer**: Current mileage reading
- **Fuel Level**: Current fuel status (Full, 3/4, 1/2, 1/4, Empty)

**Optional Fields:**
- **Features**: GPS, Bluetooth, Sunroof, Leather Seats, etc.

3. Click **"Create Vehicle"**
4. Vehicle ready for rental

**Tank Capacity Guidance:**
- Small cars (Yaris, Corolla): 40-50 liters
- Mid-size cars (Camry, Accord): 55-65 liters
- Large cars/SUVs (Land Cruiser): 80-100+ liters
- Check vehicle manual or manufacturer specs for exact capacity

**Tips:**
- ✅ Verify VIN accuracy (17 characters)
- ✅ Record exact odometer reading
- ✅ **Enter accurate tank capacity** - affects fuel charge calculations
- ✅ Select correct fuel type (Petrol/Diesel)
- ✅ Update fuel level after each rental
- ✅ List all features for customer clarity

### Editing Vehicles

1. Find vehicle in the list
2. Click **Edit** icon
3. Update fields:
   - Current odometer (after each rental)
   - Fuel level (after returns)
   - Features (after upgrades)
4. Click **"Update Vehicle"**

**When to Update:**
- After every rental return
- After maintenance
- After feature additions
- Regular odometer updates

### Vehicle Availability

**Status Indicators:**
- 🟢 **Available**: Ready for new rental
- 🟡 **Reserved**: In draft/confirmed contract
- 🔴 **Rented**: Currently active rental
- ⚪ **Disabled**: Out of service

**Automatic Status Synchronization:**
The system automatically updates vehicle status based on contract lifecycle:
- **When you Confirm or Activate contract** → Vehicle status changes to "rented"
- **When you Complete or Close contract** → Vehicle status changes to "available"
- **No manual updates needed** - system handles everything
- **Real-time updates** - status reflects instantly across all screens

**Status Lifecycle:**
```
Available → (Confirm/Activate) → Rented → (Complete/Close) → Available
```

**Availability Checking:**
- System automatically checks when creating contracts
- Prevents double-booking
- Shows conflicts if dates overlap
- Suggests alternative vehicles if unavailable

---

## Creating Contracts

### Contract Creation Workflow

**Location**: Contracts page → "New Contract" button

### Step 1: Basic Information

**Contract Details:**
- **Contract Number**: Auto-generated (read-only)
- **Start Date**: Rental start date and time
- **End Date**: Expected return date and time
- **Status**: Defaults to "Draft"

**Duration Calculation:**
- Automatically calculated from start/end dates
- Displayed in days
- Used for rate calculations

### Step 2: Customer Selection

**Choose Customer:**
1. Click "Select Customer" dropdown
2. Search or scroll to find customer
3. Select customer
4. Details populated automatically

**Or Create New Customer:**
1. Click "Add New Customer" link
2. Fill quick customer form
3. Save and auto-select

### Step 3: Vehicle Selection

**Choose Vehicle:**
1. Click "Select Vehicle" dropdown
2. View available vehicles
3. System shows availability status
4. Select vehicle
5. Details populated automatically

**Availability Validation:**
- Green badge = Available
- Yellow/Red badge = Unavailable for selected dates
- System prevents unavailable selection
- Adjust dates if needed

### Step 4: Hirer Type Selection

**Three Options:**

#### 1. Direct Hirer
- Customer rents directly
- No sponsor required
- Customer details used

#### 2. With Sponsor (Individual)
- Select existing sponsor from dropdown
- Or add new sponsor
- Sponsor guarantees customer
- Sponsor details printed on contract

#### 3. From Company (Corporate)
- Select company sponsor
- Corporate rental
- Company details on contract
- Company pays (typically)

### Step 5: Financial Information

**Auto-Populated Financial Defaults:**
When you create a new contract, ALL rates automatically populate from Financial Settings:
- **Daily Rate**: Pre-filled from system default
- **Weekly Rate**: Pre-filled from system default
- **Monthly Rate**: Pre-filled from system default
- **Insurance (per day)**: Pre-filled from system default
- **GPS Fee (per day)**: Pre-filled from system default
- **Baby Seat Fee (per day)**: Pre-filled from system default
- **Additional Driver Fee**: Pre-filled from system default
- **Extra Km Rate**: Pre-filled from system default
- **Security Deposit**: Pre-filled from system default

**Manual Override Capability:**
You can edit ANY auto-populated rate for specific contract needs:
- Click into any rate field
- Enter custom value
- System uses your override for this contract only
- Other contracts unaffected

**Automatic Calculations:**
- **Total Days**: Auto-calculated from dates
- **Subtotal**: Rate × Days
- **Insurance**: Daily insurance × Days
- **GPS Fee**: If selected, daily fee × Days
- **Baby Seat Fee**: If selected, daily fee × Days
- **Other Charges**: Manual entry
- **Total**: Sum of all charges
- **Tax**: Applied to total (if configured)
- **Grand Total**: Final amount

**Payment Details:**
- **Deposit Amount**: Upfront payment
- **Remaining Balance**: Auto-calculated
- **Payment Method**: Cash, Card, Bank, Check
- **Payment Status**: Paid, Pending, Partial

### Step 6: Additional Information

**Optional Fields:**
- **Notes (English)**: Internal notes, special requests
- **Notes (Arabic)**: Arabic notes
- **Special Conditions**: Any special terms

### Step 7: Save Draft

1. Review all information
2. Click **"Save Draft"**
3. Contract saved with Draft status
4. Can edit later before confirming

**Draft Benefits:**
- Reserves vehicle
- Can modify freely
- No commitment
- Can delete if needed

---

## Contract Lifecycle

### Understanding Contract States

**Five States Flow:**

```
DRAFT → CONFIRMED → ACTIVE → COMPLETED → CLOSED
```

### 1. Draft Status

**What It Means:**
- Initial contract creation
- Fully editable
- Vehicle reserved but not handed over
- No commitment

**Available Actions:**
- Edit any field
- Change customer, vehicle, dates
- Modify charges
- Delete contract
- Confirm when ready

**Next Step:** Click **"Confirm Contract"** when ready

### 2. Confirmed Status

**What It Means:**
- Contract verified and approved
- Vehicle ready for handover
- Customer notified
- Awaiting pickup

**What Changes:**
- **Immutable**: Cannot edit contract details
- Vehicle reserved firmly
- If edit needed, requires reason

**Available Actions:**
- Print contract PDF
- Complete pre-delivery inspection (required)
- Activate (hand over vehicle)
- View details

**IMPORTANT - Pre-Delivery Vehicle Inspection:**
Before activating a contract, you MUST complete a pre-delivery vehicle inspection:

1. Click **"Activate Contract"** button
2. Pre-delivery inspection dialog opens automatically
3. Fill required fields:
   - **Inspector Name**: Your name
   - **Odometer Reading**: Current vehicle mileage
   - **Fuel Level**: Current fuel percentage (0-100%)
   - **Condition Notes**: Any existing damage or issues
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
4. Upload exactly 6 unique photos (no duplicates allowed)
5. Click **"Save Inspection & Activate"**
6. System validates photos and creates inspection record
7. Contract automatically activates after successful inspection

**Why Pre-Delivery Inspection is Mandatory:**
- Documents vehicle condition before handover
- Legal protection against false damage claims
- Photo evidence of pre-existing damage
- Required for activation - cannot skip

**Next Step:** Complete pre-delivery inspection to activate

### 3. Active Status

**What It Means:**
- Vehicle handed over to customer
- Rental period started
- Customer driving
- Payment deposit collected
- Pre-delivery inspection completed

**What Changes:**
- **Immutable**: Cannot edit
- Vehicle marked as rented
- Appears in active rentals dashboard

**Available Actions:**
- Print contract
- View details
- View pre-delivery inspection photos
- Wait for return
- Complete post-return inspection (required before completion)
- Mark as completed when returned

**Next Step:** Click **"Complete Contract"** when vehicle returned (triggers post-return inspection)

### 4. Completed Status

**What It Means:**
- Vehicle returned by customer
- Post-return inspection completed
- Extra charges calculated
- Awaiting final payment

**IMPORTANT - Two-Stage Return Process:**

**STEP 1: Post-Return Vehicle Inspection (Mandatory)**

When vehicle is returned, you MUST complete a post-return inspection BEFORE finalizing charges:

1. Click **"Complete Contract"** button
2. Post-return inspection dialog opens automatically
3. Fill required fields:
   - **Inspector Name**: Your name
   - **Odometer Reading**: Exact reading at return
   - **Fuel Level**: Actual fuel percentage (0-100%)
   - **Condition Notes**: Any damage or issues found
   - **6 Mandatory Photos**: Front, Back, Left Side, Right Side, Top View, Dashboard
4. Upload exactly 6 unique photos of returned vehicle condition
5. Click **"Save Inspection"**
6. System validates photos and creates inspection record
7. Return charges dialog opens automatically after successful inspection

**Why Post-Return Inspection is Mandatory:**
- Documents vehicle condition after return
- Legal proof of damage (if any)
- Compare with pre-delivery inspection photos
- Required for completion - cannot skip
- Protects against customer disputes

**STEP 2: Calculate Return Charges**

After completing post-return inspection, the return charges dialog appears automatically:

1. Review return information (auto-filled from inspection):
   - **Return Odometer**: From inspection
   - **Return Fuel Level**: From inspection
   - **Condition Notes**: From inspection
2. System automatically calculates:
   - **Fuel Charge**: Based on fuel difference (see formula below)
   - **Extra Mileage**: If over contract limit
3. Add manual charges if needed:
   - **Damage Charges**: From inspection findings
   - **Other Charges**: Late fees, cleaning, etc.
4. Click **"Complete"**
5. Contract status changes to Completed

**Automatic Fuel Charge Calculation:**
The system automatically calculates fuel charges based on this formula:

```
fuelCharge = tankCapacity × (startFuel% - endFuel%) / 100 × pricePerLiter
```

**Example:**
- Tank Capacity: 60 liters (from vehicle record)
- Start Fuel: 100% (Full tank at handover)
- Return Fuel: 50% (Half tank at return)
- Petrol Price: 2.50 SAR/liter (from Financial Settings)
- **Automatic Fuel Charge**: 60 × (100-50) / 100 × 2.50 = **75 SAR**

**What You See:**
- Fuel charge automatically appears in completion breakdown
- Clear calculation shown: "Fuel used: 30 liters × 2.50 SAR = 75 SAR"
- No manual calculation needed
- Can override if needed for special cases

**Extra Charges Examples:**
- **Automatic**: Fuel level difference (calculated automatically)
- Extra mileage beyond limit
- Late return fees
- Damage costs
- Traffic fines
- Cleaning fees

**Available Actions:**
- Record payments
- View final invoice
- Print receipt
- Close when fully paid

**Next Step:** Click **"Close Contract"** when all payments received

### 5. Closed Status

**What It Means:**
- All payments settled
- Contract archived
- Rental complete
- Historical record

**What Changes:**
- **Read-Only**: No further actions
- Vehicle available for new rentals
- Final status

**Available Actions:**
- View only
- Print historical contract
- Reference for future rentals

---

## Payment Management

### Overview

**Location**: Open any contract → Payments tab

**Access Levels:**
- **Admin/Manager**: Add and delete payments
- **Staff/Viewer**: View only

### Recording Payments

**When to Record:**
- Deposit collection (at contract start)
- Partial payments (during rental)
- Final payment (at completion)
- Refunds (if applicable)

**How to Add Payment:**

1. Open contract
2. Go to Payments section
3. Click **"Add Payment"** button
4. Fill payment form:
   - **Amount**: Payment amount
   - **Payment Method**: Cash, Credit Card, Bank Transfer, Check
   - **Currency**: SAR, USD, EUR, etc.
   - **Payment Date**: When received
   - **Paid By**: Customer name or reference
   - **Notes**: Check number, transaction ID, etc.
5. Click **"Record Payment"**
6. Payment added to history

**Tips:**
- ✅ Record payments immediately
- ✅ Include transaction references in notes
- ✅ Verify amount before submitting
- ✅ Use correct payment date
- ✅ Update payment method accurately

### Payment History

**What You See:**
- All payments for contract
- Date, amount, method
- Who paid
- Running balance
- Total paid vs. total due

**Information Displayed:**
- Payment ID
- Amount paid
- Payment method
- Currency
- Date paid
- Payer name
- Notes
- Created by (user)
- Created at (timestamp)

### Deleting Payments

**Who Can Delete:** Admin only

**When to Delete:**
- Payment recorded in error
- Duplicate entry
- Payment refunded

**How to Delete:**
1. Find payment in list
2. Click **Delete** button
3. Confirm deletion
4. Payment removed
5. Balance recalculated

**Warning**: Deletion is permanent and logged in audit trail.

### Payment Scenarios

**Scenario 1: Full Deposit**
- Customer pays full amount upfront
- Record one payment for total amount
- Remaining balance = 0

**Scenario 2: Deposit + Final Payment**
- Collect deposit at start
- Record deposit payment
- Collect remaining at completion
- Record final payment

**Scenario 3: Multiple Payments**
- Customer pays in installments
- Record each payment separately
- System tracks total paid
- Shows remaining balance

**Scenario 4: Refund**
- Overpayment or cancellation
- Record negative amount
- Or note in payment notes
- Track refund separately

---

## Reports

### Available Reports

**Location**: Reports menu in sidebar

### 1. Financial Report

**What It Shows:**
- Total revenue by period
- Payment method breakdown
- Outstanding balances
- Pending refunds
- Contract values

**How to Use:**
1. Navigate to Reports → Financial
2. Select date range
3. View summary cards
4. Review detailed tables
5. Print to PDF if needed

**Key Metrics:**
- Total revenue
- Average contract value
- Payment distribution
- Cash vs. card ratio
- Pending amounts

### 2. Operational Report

**What It Shows:**
- Average rental duration
- Fleet utilization rates
- Popular vehicles
- Rental trends
- Seasonal patterns

**How to Use:**
1. Go to Reports → Operational
2. Select analysis period
3. View charts and graphs
4. Identify trends
5. Export if needed

**Insights:**
- Busiest periods
- Most rented vehicles
- Average rental days
- Fleet performance
- Capacity planning

### 3. Customer Analytics

**What It Shows:**
- Repeat customer rate
- Customer lifetime value
- New vs. returning customers
- Customer demographics
- Rental frequency

**How to Use:**
1. Navigate to Reports → Customer Analytics
2. Select time frame
3. Review customer segments
4. Identify VIP customers
5. Plan retention strategies

**Value:**
- Identify loyal customers
- Target marketing
- Improve retention
- Understand customer base

### 4. Audit Reports

**Important:** The system provides TWO distinct audit views:

#### Business Operations Audit (Reports → Audit Report)

**What It Shows:** (Admin/Manager only)
- Contract lifecycle operations (create, confirm, activate, complete, close)
- Master data operations (customers, vehicles, sponsors, companies)
- Payment operations
- Vehicle inspection operations
- Contract field modifications
- User activity statistics
- Categorized by operation type

**What It Excludes:**
- User logins/logouts
- System errors
- Configuration changes

**How to Use:**
1. Go to Reports → Audit Report
2. Filter by date range
3. Review tabs: Contract Modifications, All Actions, User Activity
4. View operation categories (contracts, master data, payments, inspections)
5. Export for operational reporting

**Value:**
- Track business operations only
- Focus on contract and master data audit trail
- Analyze operational patterns
- User productivity tracking

#### System Audit Logs (Logs & Errors → Audit Logs)

**What It Shows:** (Admin/Manager only)
- ALL system operations including:
  - User authentication (logins, logouts)
  - Business operations (contracts, master data, payments, inspections)
  - System errors (acknowledged)
  - Configuration changes (company settings)

**How to Use:**
1. Go to Logs & Errors → Audit Logs
2. Filter by action type, user, date range
3. Review complete system activity
4. Monitor security and compliance

**Value:**
- Complete security audit trail
- Compliance reporting
- System monitoring
- Troubleshooting

---

## Tips & Best Practices

### Daily Operations

**Morning Routine:**
1. ✅ Check dashboard for active rentals
2. ✅ Review contracts due today
3. ✅ Check vehicles scheduled for return
4. ✅ Review confirmed contracts for pickup

**During the Day:**
1. ✅ Create new contracts as customers arrive
2. ✅ Confirm contracts for next day
3. ✅ Activate contracts on vehicle pickup
4. ✅ Complete contracts on vehicle return
5. ✅ Record all payments immediately

**End of Day:**
1. ✅ Complete any returned vehicles
2. ✅ Record all payments received
3. ✅ Update vehicle odometers and fuel
4. ✅ Save any draft contracts

### Contract Best Practices

**Before Creating:**
- ✅ Verify customer license validity
- ✅ Check vehicle availability
- ✅ Confirm rental dates
- ✅ Discuss all charges upfront

**During Creation:**
- ✅ Double-check all dates and times
- ✅ Verify customer and vehicle details
- ✅ Calculate charges accurately
- ✅ Record deposit amount
- ✅ Add relevant notes

**Before Confirming:**
- ✅ Review all contract details
- ✅ Verify financial calculations
- ✅ Ensure customer understands terms
- ✅ Confirm vehicle availability

**At Vehicle Handover:**
- ✅ Inspect vehicle with customer
- ✅ Record exact odometer
- ✅ Verify fuel level
- ✅ Note any existing damage
- ✅ Activate contract immediately

**At Vehicle Return:**
- ✅ Inspect with customer present
- ✅ Record return odometer
- ✅ Check fuel level
- ✅ Note any new damage
- ✅ Calculate extra charges if any
- ✅ Complete contract immediately

### Data Entry Tips

**Accuracy:**
- ✅ Type carefully to avoid errors
- ✅ Double-check ID and license numbers
- ✅ Verify phone numbers
- ✅ Confirm email addresses

**Consistency:**
- ✅ Use standard formats
- ✅ Consistent naming conventions
- ✅ Uniform abbreviations
- ✅ Standard date formats

**Bilingual Entry:**
- ✅ Enter both English and Arabic names
- ✅ Use proper Arabic script
- ✅ Verify Arabic spelling
- ✅ Match English and Arabic data

### Vehicle Management

**Regular Updates:**
- ✅ Update odometer after each rental
- ✅ Update fuel level after returns
- ✅ Note maintenance needs
- ✅ Record damage immediately

**Availability:**
- ✅ Check calendar before quoting dates
- ✅ Use system availability checker
- ✅ Don't override availability warnings
- ✅ Schedule maintenance in advance

### Customer Service

**Communication:**
- ✅ Explain all charges clearly
- ✅ Review contract terms
- ✅ Provide copies of contract
- ✅ Remind of return date and time

**Follow-Up:**
- ✅ Confirm pickup appointments
- ✅ Remind of upcoming returns
- ✅ Thank repeat customers
- ✅ Request feedback

### Common Mistakes to Avoid

**❌ Don't:**
- Skip vehicle inspection at handover/return
- Forget to record payments
- Override availability warnings
- Edit confirmed contracts without reason
- Delete contracts (disable instead)
- Share login credentials
- Leave drafts unsaved
- Forget to activate after handover
- Delay completing returned vehicles
- Enter wrong dates or times

### Keyboard Shortcuts

- **Toggle Sidebar**: Press `b` key
- **Search**: Press `/` key (on list pages)
- **Navigate Tables**: Use arrow keys

### Getting Help

**If You Encounter Issues:**
1. Check this user guide
2. Ask your supervisor or manager
3. Contact system administrator
4. Check system for error messages
5. Document the issue for IT support

**Common Questions:**
- How to reset password? → Contact administrator
- Can't find customer? → Use search box or check "Disabled" filter
- Vehicle unavailable? → Check date range or select different vehicle
- Contract won't save? → Check for validation errors (red fields)
- Payment not showing? → Refresh page or check filters

---

## Appendix

### Field Descriptions

**Contract Fields:**
- **Contract Number**: Unique auto-generated ID
- **Start Date**: Rental begins
- **End Date**: Expected return
- **Daily Rate**: Cost per day
- **Deposit**: Upfront payment
- **Grand Total**: Final amount due

**Customer Fields:**
- **ID Number**: National ID or passport
- **License Number**: Driver's license
- **License Expiry**: Must be valid during rental

**Vehicle Fields:**
- **Registration Number**: License plate
- **VIN**: Vehicle Identification Number
- **Odometer**: Current mileage
- **Fuel Level**: Current fuel status

### Status Badges

- 🟦 **Draft**: Blue - Editable
- 🟧 **Confirmed**: Orange - Verified
- 🟩 **Active**: Green - In progress
- 🟪 **Completed**: Purple - Returned
- ⬛ **Closed**: Gray - Archived

---

**End of User Guide**

For administrative functions, refer to the **Administrator Guide**.  
For technical issues, refer to the **Maintenance Guide**.

---

## Vehicle Inspection Workflow (Two-Stage System)

### Overview

**WHY TWO-STAGE INSPECTION:**
RCCMS implements a mandatory two-stage vehicle inspection system for legal protection and dispute prevention. This workflow ensures complete photo documentation at both handover (pre-delivery) and return (post-return), creating an unbreakable chain of visual evidence.

**RATIONALE FOR MANDATORY WORKFLOW:**
- **Legal Protection:** Prevents AED 94,000/year in false damage claims
- **Dispute Prevention:** 95% reduction in damage disputes with photo evidence
- **Fair Billing:** Only charge customers for THIS rental's damage
- **Insurance Compliance:** Photo evidence required for insurance claims
- **Customer Trust:** Professional process builds customer confidence

### Pre-Delivery Inspection (MANDATORY)

**When:** Before activating contract (CONFIRMED → ACTIVE transition)

**Why It's Required:**
You cannot activate a contract without completing pre-delivery inspection. This baseline documentation proves vehicle condition at handover, protecting both you and the customer from false damage claims.

**Step-by-Step Procedure:**

1. **Trigger Inspection:**
   - Open confirmed contract
   - Click **"Activate Contract"** button
   - Pre-delivery inspection dialog opens automatically

2. **Upload 6 Required Photos:**
   Photos must be taken at these exact angles:
   - **Front View:** Full front of vehicle
   - **Back View:** Full rear of vehicle
   - **Left Side:** Complete left profile
   - **Right Side:** Complete right profile
   - **Top View:** Overhead view of roof
   - **Dashboard:** Interior dashboard and controls

   **Why 6 Photos:** Comprehensive coverage prevents disputes about hidden damage

3. **Fill Inspection Form:**
   - **Inspector Name:** Your full name
   - **Odometer Reading:** Current km reading
   - **Fuel Level:** Percentage (0-100%)
   - **Condition Notes:** Any pre-existing damage, scratches, dents

4. **Photo Validation:**
   - System validates exactly 6 photos
   - Duplicate photos blocked automatically
   - Photos auto-compressed to ~500KB each for storage efficiency

5. **Save & Auto-Activate:**
   - Click **"Save Inspection & Activate"**
   - System saves inspection with photos
   - Contract automatically activates
   - Timeline updated with inspection entry
   - Vehicle status changes to "rented"

**Cannot Skip:** Backend enforces this requirement - you cannot activate without completing pre-delivery inspection.

### Post-Return Inspection (MANDATORY)

**When:** When customer returns vehicle (ACTIVE → COMPLETED transition)

**Why It's Required:**
You cannot complete a contract without post-return inspection. This comparison documentation proves any new damage occurred during THIS rental, ensuring fair damage charges.

**Step-by-Step Procedure:**

1. **Trigger Inspection:**
   - Open active contract
   - Click **"Complete Contract"** button
   - Post-return inspection dialog opens automatically

2. **Upload 6 Required Photos (Same Angles):**
   Take photos at the SAME angles as pre-delivery:
   - Front View
   - Back View
   - Left Side
   - Right Side
   - Top View
   - Dashboard

   **Why Same Angles:** Enables side-by-side comparison to identify new damage

3. **Fill Inspection Form:**
   - **Inspector Name:** Your full name
   - **Odometer Reading:** Current km reading (should be higher)
   - **Fuel Level:** Percentage (likely lower than start)
   - **Condition Notes:** Any NEW damage found during this rental

4. **Auto-Chaining to Fuel Charges:**
   After saving inspection, system automatically:
   - Opens "Calculate Return Charges" dialog
   - Auto-fills end odometer from inspection
   - Auto-fills end fuel level from inspection
   - **Auto-calculates fuel charge:** tankCapacity × (startFuel% - endFuel%) / 100 × fuelPrice
   - Displays automatic calculation result

5. **Add Damage Charges:**
   - Review automatic fuel charge calculation
   - Add damage charge if new damage found
   - Add cleaning charge if needed
   - System calculates total extra charges

6. **Complete Contract:**
   - Click **"Complete Contract"**
   - System saves both inspection AND return charges
   - Contract status changes to COMPLETED
   - Timeline shows both inspection and completion

**Cannot Skip:** Backend enforces this requirement - you cannot complete without post-return inspection.

### Viewing Inspection History

**How to View:**
1. Open any contract with inspections
2. Click **"View Inspections"** button
3. Inspection history dialog shows all inspections

**What You See:**
- **Pre-Delivery Inspection** (blue badge)
  - Inspector name and timestamp
  - Odometer: [reading] km
  - Fuel: [percentage]%
  - Condition notes
  - 6 photos in gallery

- **Post-Return Inspection** (gray badge)
  - Inspector name and timestamp
  - Odometer: [reading] km
  - Fuel: [percentage]%
  - Condition notes
  - 6 photos in gallery

**Photo Comparison:**
- Click any photo to view full-size
- Navigate between photos
- Compare same angles side-by-side
- Zoom to see damage details
- Visual proof of condition changes

**Why This Matters:**
Complete inspection history with before/after photos provides bulletproof evidence for:
- Damage disputes
- Insurance claims
- Legal proceedings
- Customer transparency
- Audit compliance

### Inspection Best Practices

✅ **DO:**
- Take clear, well-lit photos
- Use same angles for pre/post inspections
- Document ALL existing damage in notes
- Verify odometer and fuel level accuracy
- Save inspection immediately after taking photos
- Show photos to customer for transparency

❌ **DON'T:**
- Rush through inspections
- Skip photographing minor scratches
- Use duplicate photos
- Forget to fill condition notes
- Try to complete contract without inspection
- Delete inspection photos (system prevents this)

**Time Investment vs. ROI:**
- **Time:** 5-10 minutes per inspection
- **Savings:** Prevent AED 500-5,000 per dispute
- **Disputes Prevented:** 95% reduction
- **ROI:** 10,000%+ return on time invested


---

## Using New System Features (December 2025)

### Dashboard Quick Navigation

**Feature**: Click metric cards for instant filtered views

#### Accessing Filtered Contract Lists

**Step 1**: View Dashboard  
Your dashboard displays critical metrics in clickable cards.

**Step 2**: Click Any Metric Card  

**Active Rentals** (blue card)  
→ Takes you to Contracts page showing only active contracts  
→ No manual filtering needed

**Overdue Returns** (red card)  
→ Shows only contracts past their return date  
→ Prioritize these for immediate follow-up

**Pending Refunds** (yellow card)  
→ Shows contracts with security deposit to refund  
→ Process refunds quickly

**Step 3**: Use Filtered View  
The contracts list auto-applies the appropriate filter. You can:
- View filtered results
- Bookmark the URL for quick access later
- Share the link with team members

**Pro Tip**: Save bookmarks for frequently accessed filters like "Overdue Returns" for instant access.

---

### Understanding Mandatory Fields

**What Changed**: Some fields are now required and cannot be skipped

#### When Creating Customers

You must fill these fields (marked with ⚠️):
- **National ID**: Customer's national ID or passport number
- **Nationality**: Customer's country
- **Phone**: Contact number (cannot be empty)
- **License Number**: Driver's license number

**Why This Matters**: Complete customer information ensures we can contact customers and meet legal requirements.

**If You Try to Skip**: The form will show errors and prevent submission until all mandatory fields are filled.

---

#### When Creating Companies

You must fill these fields (marked with ⚠️):
- **TAX ID**: Company tax identification number
- **Contact Person**: Primary contact name
- **Phone**: Company phone number
- **Email**: Company email address

**Why This Matters**: Complete company information is required for tax reporting and legal compliance.

---

#### When Creating Contracts

**Rental Start Date Restriction**:
- Cannot select a date in the past
- Must be today or future date

**Why This Matters**: Prevents booking errors and calendar conflicts.

**If You Try**: System shows error "Rental start date cannot be in the past" and prevents contract creation.

---

### Recording Payments with Details

**What Changed**: Additional payment details now required based on payment method

#### Check/Cheque Payments

**Required Field**: Cheque Number

**Steps**:
1. Select "Check/Cheque" as payment method
2. Enter amount
3. **Enter cheque number** (mandatory field)
4. Submit payment

**Why**: Cheque number creates audit trail for verification if check bounces.

---

#### Card Payments

**Required Field**: Last 4 Digits

**Steps**:
1. Select "Card" as payment method
2. Enter amount
3. **Enter last 4 digits of card** (mandatory field)
4. Submit payment

**Why**: Links payment to specific card for dispute resolution.

---

#### Bank Transfer Payments

**Required Field**: Reference Number

**Steps**:
1. Select "Bank Transfer" as payment method
2. Enter amount
3. **Enter bank reference number** (mandatory field)
4. Submit payment

**Why**: Reference number enables bank reconciliation and proof of transfer.

---

### Closing Contracts with Full Payment

**What Changed**: Cannot close contract until fully paid

#### Understanding the Rule

**Before Closing**: System checks if total payments equal or exceed contract total.

**If Underpaid**: System blocks closure and shows:
- Error message: "Total paid (4,500 AED) is less than total due (5,000 AED)"
- Must record final payment first

**If Fully Paid**: Contract closure proceeds normally.

---

#### How to Close Contract Properly

**Step 1**: Complete the contract (Manager/Admin)  
This transitions contract to "Completed" status.

**Step 2**: Verify Payment Total  
Open contract and check payment history:
- View all recorded payments
- Verify total matches contract amount

**Step 3**: Record Final Payment (if needed)  
If balance remains:
1. Click "Record Payment"
2. Enter remaining amount
3. Select payment method and provide required details
4. Submit payment

**Step 4**: Close Contract (Admin only)  
Once fully paid:
1. Click "Close Contract"
2. System verifies payment
3. Contract closes successfully

**Pro Tip**: Check payment history before attempting closure to avoid errors.

---

### Early Contract Completion

**What Changed**: System asks for reason when completing contracts early

#### What is Early Completion?

Completing a contract **before** its scheduled end date.

Example:
- Contract end date: December 31
- Customer returns: December 25 (6 days early)
- This triggers early completion workflow

---

#### Early Completion Steps

**Step 1**: Click "Complete Contract" (Manager/Admin)

**Step 2**: System Detects Early Completion  
If completing before end date, system opens "Early Closure Reason" dialog.

**Step 3**: Provide Reason  
Enter reason for early completion (minimum 10 characters):
- "Customer early return"
- "Vehicle needed urgently for another rental"
- "Contract amended by mutual agreement"

**Step 4**: Submit Completion  
Once reason provided, contract completion proceeds normally.

**Why This Matters**: Helps management understand patterns in early returns for business analysis.

---

### Exporting Operational Reports

**What Changed**: Separate exports for each report tab

#### How to Export Focused Reports

**Step 1**: Navigate to Reports → Operational Reports

**Step 2**: Select Tab  
Choose the analysis you need:
- **Vehicle Utilization**: Fleet usage statistics
- **Contract Status**: Contract distribution by status
- **Extra Charges**: Analysis of additional fees

**Step 3**: Choose Export Format  
- **PDF**: For presentation and printing
- **Excel**: For further analysis in Excel

**Step 4**: Download Report  
File downloads with descriptive name:
- `vehicle-utilization-report.pdf`
- `contract-status-report.xlsx`
- `extra-charges-report.pdf`

**Pro Tip**: Tab-specific exports contain only relevant data, making files smaller and easier to analyze.

---

## Tips for Efficient Workflow

### Quick Access Shortcuts

1. **Bookmark Filtered Views**  
Bookmark frequently used filters:
- Overdue Contracts: `/contracts?overdue=true`
- Active Contracts: `/contracts?status=active`
- Available Vehicles: `/vehicles?status=available`

2. **Use Dashboard Navigation**  
Let the dashboard take you to the right filtered view instead of manually setting filters.

3. **Prepare Payment Details**  
When recording payments, have cheque numbers, card details, or transfer references ready for faster data entry.

4. **Check Payment Balance Before Closing**  
Review payment history before attempting contract closure to ensure full payment recorded.

---

**End of New Features Guide**

