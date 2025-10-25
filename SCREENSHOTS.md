# RCCMS - Complete Screenshot Documentation

**Rental Car Contract Management System - Visual Guide**

This document provides a comprehensive visual tour of RCCMS with detailed explanations of every screen and feature. Each screenshot is referenced by filename for easy identification.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Contract Management](#3-contract-management)
4. [Master Data Management](#4-master-data-management)
5. [Reports & Analytics](#5-reports--analytics)
6. [Administration & Settings](#6-administration--settings)
7. [Bilingual Support (Arabic/RTL)](#7-bilingual-support-arabicrtl)
8. [UI/UX Features](#8-uiux-features)

---

## 1. Authentication

### Login Page
**Screenshot:** `01-login-page.png`

**Description:**
The login page is the entry point to RCCMS. It features clean Material Design 3 styling with the MARMAR branding and professional rental car imagery.

**Key Elements:**
- **RCCMS Logo & Branding:** "MARMAR - Contract Management System" header
- **Login Form:**
  - Username field (data-testid="input-username")
  - Password field (data-testid="input-password")  
  - Login button (data-testid="button-login")
- **Theme Toggle:** Light/dark mode switcher in top-right corner
- **Language Toggle:** Switch between English and Arabic (عربي button)
- **Responsive Design:** Works on desktop, tablet, and mobile devices

**Security Features:**
- Session-based authentication with PostgreSQL-backed sessions
- Password hashing with bcrypt
- httpOnly secure cookies
- Automatic redirect after authentication

**Default Credentials:**
- Username: `superadmin`
- Password: `Admin@123456`
- Role: Admin (full system access)

---

## 2. Dashboard

### Main Dashboard - English
**Screenshot:** `02-dashboard-english.png`

**Description:**
The dashboard provides an at-a-glance view of critical business metrics. It's the landing page after successful login and shows real-time statistics for rental operations.

**Key Metrics Cards:**

1. **Active Rentals**
   - Icon: Car icon
   - Shows current number of active rental contracts
   - Quick indicator of operational workload

2. **Total Revenue (Month)**
   - Icon: Currency/money icon
   - Displays current month's revenue in AED
   - Real-time calculation from completed contracts

3. **Overdue Returns**
   - Icon: Clock/alert icon
   - Highlights contracts past their return date
   - Enables proactive customer follow-up

4. **Available Vehicles**
   - Icon: Check/available icon
   - Shows count of vehicles ready to rent
   - Real-time sync with contract status

**UI Features:**
- **Sidebar Navigation:** Left side (in English), hierarchical menu structure
- **Header Bar:**
  - Sidebar toggle button
  - Dark/light theme toggle
  - Language toggle (English ↔ Arabic)
  - User profile with role badge (Admin)
- **Material Design 3:** Cyan-blue primary color, elevated cards
- **Responsive Grid:** Metrics cards adapt to screen size

**Navigation Options:**
- Dashboard (current)
- Masters: Customers, Vehicles, Sponsors, Companies
- Contracts
- Reports: Financial, Operational, Customer
- Logs & Errors: Audit, System Errors
- Settings: Company Settings, Financial Settings, Users

---

## 3. Contract Management

### Contracts List View
**Screenshot:** `03-contracts-list.png`

**Description:**
The contracts list page displays all rental contracts in a searchable, filterable table. This is the central hub for contract management operations.

**Table Columns:**
- **Contract Number:** Auto-generated unique ID (e.g., RC-00001)
- **Customer Name:** English and Arabic names displayed
- **Vehicle:** Make, model, and plate number
- **Start Date:** Contract start date
- **End Date:** Contract end date
- **Status Badge:** Color-coded status indicators
  - Draft (grey)
  - Confirmed (blue)
  - Active (green)
  - Completed (purple)
  - Closed (dark grey)
- **Total Amount:** Contract value in AED
- **Actions:** View, Edit, Delete buttons

**Features:**
- **Search Bar:** Filter contracts by customer name, contract number, or vehicle
- **New Contract Button:** (data-testid="button-new-contract") - Creates new rental
- **Pagination:** Table pagination for large datasets
- **Sort Columns:** Click column headers to sort
- **Status Filters:** Filter by contract status
- **Export Options:** Export to PDF or Excel

**Sidebar Context:**
- Shows "Contracts" as active menu item
- Quick access to create new contract

---

### New Contract Form
**Screenshot:** `04-new-contract-form.png`

**Description:**
The contract creation form is a comprehensive multi-section form that captures all rental details. It guides users through the complete rental setup process.

**Form Sections:**

#### 1. Customer Information
- **Select Customer:** Dropdown with search (Select2 style)
- **Create New Customer:** Quick-add button opens customer modal
- **Customer Details Display:** Shows selected customer info

#### 2. Hirer Type / نوع المستأجر (Bilingual Labels)
- **Direct / مباشر:** Customer rents directly
- **With Sponsor / مع كفيل:** Individual sponsor required
- **From Company / من شركة:** Corporate rental
- **Sponsor/Company Selection:** Conditional fields based on hirer type

#### 3. Vehicle Selection
- **Select Vehicle:** Dropdown showing available vehicles only
- **Vehicle Details:** Make, model, year, plate number
- **Availability Check:** Real-time vehicle availability validation
- **Tank Capacity Display:** Shows fuel tank size for calculations

#### 4. Rental Period
- **Start Date:** Date picker with time
- **End Date:** Date picker with time
- **Duration Calculation:** Automatic calculation of rental days
- **Rate Selection:** Daily/weekly/monthly rates auto-applied

#### 5. Inspection Details
- **Odometer Start:** Starting mileage reading
- **Fuel Level Start:** Dropdown (Full, 3/4, 1/2, 1/4, Empty)
- **Vehicle Condition Notes:** Text area for pre-rental inspection

#### 6. Financial Details
- **Rental Rate:** Auto-populated based on duration
- **Addons:**
  - Insurance (daily rate)
  - GPS rental
  - Baby seat
  - Additional driver
  - Airport pickup/delivery
- **Deposit Amount:** Required deposit
- **VAT Calculation:** Automatic 5% UAE VAT
- **Total Amount:** Real-time calculation

#### 7. Contract Terms
- **Terms & Conditions:** Bilingual contract clauses
- **Special Notes:** Free-text field for custom terms

**Action Buttons:**
- **Save as Draft:** (data-testid="button-save-draft") - Save without finalizing
- **Confirm Contract:** (data-testid="button-confirm") - Move to confirmed status
- **Cancel:** Return to contracts list
- **Back:** (data-testid="button-back") - Navigate back

**Validation:**
- Required field validation (red borders)
- Phone number format validation
- Date range validation (end > start)
- Deposit amount validation (min/max limits)

**UX Features:**
- Form auto-save (draft mode)
- Progressive disclosure (sections expand as needed)
- Inline field validation
- Loading states for async operations
- Success/error toast notifications

---

### Contract Details View
**Screenshot:** `05-contract-details.png`

**Description:**
The contract details page shows complete information about a specific rental contract with full audit trail and timeline visualization.

**Page Layout:**

#### Header Section
- **Contract Number:** Large prominent display (e.g., RC-00042)
- **Status Badge:** Current contract status with color coding
- **Action Buttons:**
  - **Print PDF:** Generate contract PDF in English or Arabic
  - **Edit:** Modify contract (if status allows)
  - **Delete:** Remove contract (draft only)
  - **State Transitions:**
    - Confirm (draft → confirmed)
    - Activate (confirmed → active)
    - Complete (active → completed)
    - Close (completed → closed)

#### Customer & Vehicle Information Card
- **Customer Details:**
  - Name (English & Arabic)
  - Phone number
  - National ID
  - Email
- **Vehicle Details:**
  - Make, Model, Year
  - Plate number
  - Color
  - Tank capacity
  - Fuel type
- **Hirer Information:**
  - Hirer type (Direct/Sponsor/Company)
  - Sponsor/Company details if applicable

#### Rental Period & Inspection Card
- **Dates:**
  - Start date & time
  - End date & time
  - Total duration (days/hours)
- **Inspection Details:**
  - Odometer start
  - Fuel level start
  - Vehicle condition notes
- **Return Details:** (if completed)
  - Odometer end
  - Fuel level end
  - Return condition notes

#### Financial Summary Card
- **Rental Charges:**
  - Base rental amount
  - Insurance fees
  - GPS/addon charges
  - Subtotal
- **Extra Charges:** (if any)
  - Fuel charge (auto-calculated)
  - Extra mileage
  - Late return penalty
  - Damage charges
- **Discounts:** (with reason)
- **VAT (5%):** Calculated amount
- **Grand Total:** Final amount
- **Payment Status:**
  - Deposit paid
  - Balance due
  - Fully paid indicator

#### Payment History Card
- **Payment List Table:**
  - Date & time
  - Amount
  - Payment method (cash/card/bank transfer)
  - Currency
  - Notes
  - Created by (user name)
  - Delete button (admin only)
- **Add Payment Button:** Record new payment
- **Total Paid:** Running total

#### Contract Timeline
**Screenshot:** `06-contract-timeline.png`

**Description:**
Visual timeline showing complete contract history with all lifecycle events and field-level edits.

**Timeline Events:**

1. **Lifecycle Events** (Primary Timeline)
   - **Contract Created:** Initial creation with creator name and timestamp
   - **Contract Confirmed:** Transition to confirmed status
   - **Rental Activated:** Vehicle handed over to customer
   - **Contract Completed:** Vehicle returned
   - **Contract Closed:** Final closure
   - **Icons:** Each event has distinct icon (create, check, car, complete, close)
   - **Color Coding:** Events color-coded by type

2. **Field-Level Edits** (Detailed Audit)
   - **Edit Event Card:**
     - Timestamp (exact date/time)
     - User name and role
     - Edit reason (required)
     - Before/After comparison for each field changed
   - **Fields Tracked:**
     - Customer information
     - Vehicle selection
     - Dates and times
     - Financial amounts
     - Status changes
     - All contract fields
   - **Visual Indicators:**
     - Old value in red strikethrough
     - New value in green highlight
     - Field name in bold

**Timeline Features:**
- **Chronological Order:** Most recent at top
- **Expandable Details:** Click to expand full edit information
- **Filter Options:** Filter by event type, user, date range
- **Export:** Download audit report as PDF
- **Immutability Indicator:** Lock icon for finalized contracts

**Data Integrity:**
- Complete audit trail per compliance requirements
- Forensic-level detail for dispute resolution
- Immutable after finalization (post-confirm)
- Edit reasons mandatory

---

### Vehicle Return Workflow
**Screenshot:** `07-vehicle-return-dialog.png`

**Description:**
When an active contract is completed, the vehicle return dialog captures all return details and automatically calculates extra charges.

**Return Dialog Sections:**

#### 1. Return Inspection
- **Odometer End:** Final mileage reading
- **Fuel Level End:** Dropdown (Full, 3/4, 1/2, 1/4, Empty)
- **Vehicle Condition:** Text area for damage notes

#### 2. Automatic Fuel Charge Calculation
- **Fuel Consumed Calculation:**
  - Formula: `(Tank Capacity × (Start% - End%) / 100 × Price/Liter)`
  - Example: `60L × (100% - 25%) / 100 × 4.50 AED = 202.50 AED`
- **Calculation Breakdown Display:**
  - Shows: "Auto-calculated: 45.0L @ 4.50 AED/L = 202.50 AED"
  - Manual override option
- **Fuel Type Pricing:**
  - Petrol price from company settings
  - Diesel price from company settings
  - Electric charging fee (if applicable)

#### 3. Extra Mileage Calculation
- **Allowed KM:** Based on rental duration
  - Daily: 250 km/day
  - Monthly: 5000 km/month
- **Excess KM:** Odometer End - Start - Allowed
- **Charge:** Excess KM × Price per KM (from settings)
- **Example:** "Drove 2,500 km, allowed 1,750 km = 750 km × 0.50 AED = 375 AED"

#### 4. Additional Charges
- **Damage Charges:** Free-text amount with notes
- **Late Return Penalty:**
  - Hours late × hourly penalty rate
  - Full day charge if > 6 hours late
- **Other Charges:** Miscellaneous fees

#### 5. Summary
- **Total Extra Charges:** Sum of all return charges
- **Previous Balance:** Outstanding amount
- **New Total Due:** Updated balance
- **Action Buttons:**
  - Complete Return (saves all data, moves to completed status)
  - Cancel

**UX Features:**
- Real-time calculation updates
- Clear breakdown of all charges
- Validation for required fields
- Confirmation dialog before finalizing
- Automatic vehicle status update (rented → available)

---

## 4. Master Data Management

### Customers List
**Screenshot:** `08-customers-list.png`

**Description:**
Customer master data management with tabbed interface showing active and disabled customers.

**Page Features:**

#### Tabs
- **Active Customers:** (default) Shows enabled customers
- **Disabled Customers:** Shows archived/disabled customers

#### Table Columns
- **Name (English):** Customer name in Latin script
- **Name (Arabic):** Customer name in Arabic script
- **Phone Number:** Contact number with validation
- **National ID:** Emirates ID or passport
- **Email:** Email address (optional)
- **Customer Type:** Individual/Corporate badge
- **Actions:**
  - View/Edit button
  - Disable/Enable toggle
  - Delete button (admin only, draft-related only)

#### Action Buttons
- **New Customer:** (data-testid="button-new-customer") Opens customer form
- **Search:** Filter customers by name, phone, or ID
- **Export:** Export customer list to Excel/PDF

#### Quick Stats
- Total active customers count
- Total disabled customers count
- New customers this month

---

### Customer Form (Modal)
**Screenshot:** `09-customer-form.png`

**Description:**
Customer creation/edit form with bilingual fields and validation.

**Form Fields:**

#### Basic Information
- **Name (English):** Required, Latin characters
- **Name (Arabic):** Required, Arabic characters
- **Phone Number:** Required, with format validation
  - Duplicate phone warning (non-blocking)
- **Email:** Optional, email format validation
- **National ID / Passport:** Required, unique validation

#### Address Information (Bilingual)
- **Address (English):** Street address
- **Address (Arabic):** Arabic address
- **City (English/Arabic):** City name
- **Country (English/Arabic):** Country selection

#### Additional Details
- **Date of Birth:** Date picker (for age verification)
- **Nationality:** Dropdown selection
- **Customer Type:** Individual/Corporate radio buttons
- **Notes:** Free-text notes field

**Validation:**
- Required field indicators (red asterisk)
- Phone number duplicate warning:
  - "Warning: A customer with this phone number already exists"
  - Non-blocking (allows save with confirmation)
- Email format validation
- National ID uniqueness check

**Action Buttons:**
- **Save:** (data-testid="button-save-customer") Create/update customer
- **Cancel:** Close form without saving

**UX Features:**
- Side-by-side bilingual fields
- Auto-save draft (for new customers)
- Real-time validation feedback
- Success toast on save
- Error messages for failures

---

### Vehicles List
**Screenshot:** `10-vehicles-list.png`

**Description:**
Vehicle inventory management with active/disabled tabs and real-time availability status.

**Table Columns:**
- **Make & Model:** Vehicle brand and model (e.g., Toyota Camry)
- **Year:** Manufacturing year
- **Plate Number:** Registration plate (unique identifier)
- **Color (EN/AR):** Vehicle color in both languages
- **Fuel Type:** Petrol/Diesel/Electric badge
- **Tank Capacity:** Liters (for fuel calculations)
- **Status Badge:**
  - Available (green) - Ready to rent
  - Rented (orange) - Currently in active contract
  - Maintenance (red) - Under repair
  - Disabled (grey) - Archived
- **Daily Rate:** Rental price per day (AED)
- **Actions:**
  - View/Edit
  - Disable/Enable
  - Delete (admin only)

**Features:**
- **New Vehicle Button:** Add new vehicle to fleet
- **Status Filters:** Filter by availability status
- **Search:** Search by make, model, or plate
- **Sort:** Click columns to sort
- **Real-time Status Sync:** Status auto-updates when contracts activate/complete

---

### Vehicle Form
**Screenshot:** `11-vehicle-form.png`

**Description:**
Vehicle master data form with technical specifications and pricing.

**Form Sections:**

#### Basic Information
- **Make (English/Arabic):** Vehicle brand
- **Model (English/Arabic):** Vehicle model
- **Year:** Manufacturing year (dropdown)
- **Plate Number:** Unique registration number
- **Color (English/Arabic):** Vehicle color
- **VIN Number:** Vehicle identification number (optional)

#### Technical Specifications
- **Fuel Type:** Dropdown (Petrol, Diesel, Electric, Hybrid)
- **Tank Capacity:** Liters (required for fuel calculations)
- **Transmission:** Manual/Automatic
- **Seats:** Number of seats
- **Category:** Economy/Standard/Luxury/SUV

#### Rental Rates
- **Daily Rate (AED):** Price per day
- **Weekly Rate (AED):** Price per week (7+ days)
- **Monthly Rate (AED):** Price per month (30+ days)
- **Allowed KM/Day:** Daily mileage limit (e.g., 250 km)
- **Allowed KM/Month:** Monthly mileage limit (e.g., 5000 km)
- **Extra KM Charge (AED):** Price per excess kilometer

#### Inspection Defaults
- **Initial Fuel Level:** Default starting fuel level
- **Insurance per Day (AED):** Daily insurance fee
- **GPS Rental per Day (AED):** GPS device rental fee

**Validation:**
- Plate number uniqueness check
- Positive number validation for rates
- Tank capacity required (for fuel calculations)

---

### Sponsors List
**Screenshot:** `12-sponsors-list.png`

**Description:**
Individual sponsors who can guarantee rental contracts for customers.

**Table Columns:**
- **Name (English/Arabic):** Sponsor full name
- **Phone Number:** Contact number
- **National ID:** Emirates ID
- **Email:** Contact email
- **Total Contracts:** Count of contracts sponsored
- **Actions:** View/Edit, Disable/Enable

**Use Case:**
Sponsors are individuals who guarantee rental contracts when:
- Customer doesn't have local ID
- Corporate policy requires guarantor
- Risk management requires additional security

---

### Companies List
**Screenshot:** `13-companies-list.png`

**Description:**
Corporate entities that rent vehicles (B2B rentals).

**Table Columns:**
- **Company Name (English/Arabic):** Corporate name
- **Trade License:** Business registration number
- **Contact Person:** Company representative
- **Phone/Email:** Primary contact details
- **Total Contracts:** Number of corporate rentals
- **Credit Limit (AED):** Maximum outstanding balance
- **Actions:** View/Edit, Disable/Enable

**Use Case:**
Companies are used for:
- Corporate fleet rentals
- Long-term business contracts
- Monthly billing arrangements
- B2B rental agreements

---

## 5. Reports & Analytics

### Financial Report
**Screenshot:** `14-financial-report.png`

**Description:**
Comprehensive financial analytics with interactive charts showing revenue trends, payment methods, and contract status breakdown.

**Report Sections:**

#### 1. Filter Controls
- **Date Range Selector:**
  - Start Date picker
  - End Date picker
  - Quick filters: This Month, Last Month, This Quarter, This Year
- **Apply Filters Button:** Refresh data
- **Export Buttons:**
  - Export to PDF (with charts embedded)
  - Export to Excel (with chart image)

#### 2. Summary Metrics Cards
- **Total Revenue:** Sum of all contract values in date range
- **Collected Payments:** Total payments received
- **Outstanding Balance:** Pending amounts
- **Number of Contracts:** Count of contracts in period

#### 3. Revenue Trend Chart (Line Chart)
**Chart Type:** Line graph using recharts
- **X-Axis:** Time period (daily/weekly/monthly based on range)
- **Y-Axis:** Revenue amount (AED)
- **Data Points:** Clickable points showing exact values
- **Tooltip:** Hover to see date and exact amount
- **Colors:** Cyan-blue primary color matching theme
- **Responsive:** Adapts to screen size

**Insights:**
- Revenue growth trends
- Seasonal patterns
- Peak/low periods identification

#### 4. Revenue by Status (Pie Chart)
**Chart Type:** Pie chart with percentages
- **Segments:**
  - Draft contracts (grey)
  - Confirmed contracts (blue)
  - Active rentals (green)
  - Completed contracts (purple)
  - Closed contracts (dark grey)
- **Labels:** Show percentage and AED amount
- **Legend:** Status names with color indicators
- **Interactive:** Click segments to highlight

**Insights:**
- Revenue distribution by contract stage
- Completion rate analysis
- Work-in-progress value

#### 5. Payment Method Breakdown (Pie Chart)
**Chart Type:** Pie chart showing payment distribution
- **Segments:**
  - Cash (green)
  - Card (blue)
  - Bank Transfer (purple)
- **Values:** Total amount per method
- **Percentages:** % of total payments

**Insights:**
- Preferred payment methods
- Cash vs electronic payment ratio
- Payment method trends

#### 6. Monthly Revenue Comparison (Bar Chart)
**Chart Type:** Vertical bar chart
- **X-Axis:** Months
- **Y-Axis:** Revenue (AED)
- **Bars:** Color-coded by month
- **Data Labels:** Show exact amounts on bars
- **Comparison:** Year-over-year if applicable

**Export Features:**
- **PDF Export:**
  - Charts captured as images (html2canvas)
  - Embedded in professional PDF layout
  - Bilingual support (English/Arabic)
  - Company branding
  - Date range and filters shown
- **Excel Export:**
  - Data in tabular format
  - Charts as images in separate sheet
  - Formulas for calculations
  - Pivot table ready data

---

### Operational Report
**Screenshot:** `15-operational-report.png`

**Description:**
Operational metrics and vehicle utilization analytics for fleet management.

**Report Sections:**

#### 1. Operational Metrics Cards
- **Fleet Utilization Rate:** Percentage of vehicles actively rented
- **Average Rental Duration:** Mean days per rental
- **Vehicle Turnover Rate:** Rentals per vehicle per month
- **Maintenance Downtime:** Days vehicles in maintenance

#### 2. Vehicle Utilization Chart (Bar Chart)
**Chart Type:** Horizontal bar chart
- **Y-Axis:** Vehicle names (Make Model - Plate)
- **X-Axis:** Utilization percentage (0-100%)
- **Bars:** Color-coded by utilization level
  - High (>80%): Green
  - Medium (50-80%): Yellow
  - Low (<50%): Red
- **Data Labels:** Exact percentage on bars
- **Sort:** By utilization (highest to lowest)

**Insights:**
- Identify underutilized vehicles
- Optimize fleet composition
- Plan vehicle acquisition/disposal

#### 3. Contract Status Distribution (Pie Chart)
**Chart Type:** Pie chart with contract counts
- **Segments:** Draft, Confirmed, Active, Completed, Closed
- **Values:** Number of contracts per status
- **Percentages:** Distribution across statuses

**Insights:**
- Pipeline health
- Conversion rates (draft → confirmed → active)
- Completion efficiency

#### 4. Average Rental Duration by Vehicle Type (Column Chart)
**Chart Type:** Grouped column chart
- **Categories:** Economy, Standard, Luxury, SUV
- **Values:** Average rental days
- **Comparison:** Side-by-side comparison

**Insights:**
- Popular vehicle categories
- Rental duration patterns by type
- Pricing strategy validation

---

### Customer Report
**Screenshot:** `16-customer-report.png`

**Description:**
Customer analytics showing top customers, retention metrics, and revenue contribution.

**Report Sections:**

#### 1. Customer Metrics Cards
- **Total Active Customers:** Count of active customers
- **New Customers This Month:** Recent additions
- **Repeat Customer Rate:** Percentage returning
- **Average Customer Lifetime Value:** Revenue per customer

#### 2. Top Customers by Revenue (Bar Chart)
**Chart Type:** Horizontal bar chart
- **Y-Axis:** Customer names
- **X-Axis:** Total revenue (AED)
- **Bars:** Gradient color (darker = higher revenue)
- **Top 10:** Showing highest revenue customers
- **Data Labels:** Exact revenue amounts

**Insights:**
- VIP customer identification
- Revenue concentration analysis
- Targeted marketing opportunities

#### 3. Customer Retention Analysis (Donut Chart)
**Chart Type:** Donut chart
- **Segments:**
  - One-time customers
  - Repeat customers (2-5 rentals)
  - Loyal customers (6+ rentals)
- **Center Number:** Total customer count
- **Percentages:** Distribution across segments

**Insights:**
- Customer loyalty metrics
- Retention program effectiveness
- Churn risk identification

#### 4. Customer Acquisition Trend (Line Chart)
**Chart Type:** Line graph over time
- **X-Axis:** Months
- **Y-Axis:** New customers count
- **Line:** Smooth curve showing growth
- **Trend Line:** Linear regression showing trend

**Insights:**
- Growth trajectory
- Marketing campaign effectiveness
- Seasonality patterns

---

### Audit Log
**Screenshot:** `17-audit-log.png`

**Description:**
Complete system audit trail showing all CREATE, UPDATE, DELETE/disable operations across all entities.

**Table Columns:**
- **Timestamp:** Exact date and time of action
- **User:** Full name and role of user who performed action
- **Action Type:** Badge-coded actions
  - CREATE (green)
  - UPDATE (blue)
  - DELETE (red)
  - DISABLE (orange)
  - ENABLE (cyan)
- **Entity Type:** What was modified (Contract, Customer, Vehicle, etc.)
- **Entity ID:** Unique identifier of modified record
- **Details:** Summary of what changed
- **View Details:** Expand to see full before/after comparison

**Features:**
- **Search:** Filter by user, entity type, or action
- **Date Range Filter:** Show logs for specific period
- **Export:** Download audit log as Excel/PDF
- **Pagination:** Handle large audit datasets
- **Real-time Updates:** New logs appear automatically

**Compliance:**
- Meets legal requirements for audit trails
- Supports dispute resolution
- Demonstrates accountability
- Enables forensic analysis

---

## 6. Administration & Settings

### Users List
**Screenshot:** `18-users-list.png`

**Description:**
User management page for creating staff accounts and assigning roles (Admin only).

**Table Columns:**
- **Username:** Login username
- **Full Name:** User's complete name
- **Role Badge:** Color-coded role indicators
  - Admin (red) - Full system access
  - Manager (blue) - Contract approval, reports
  - Staff (green) - Create/edit contracts
  - Viewer (grey) - Read-only access
- **Status:** Active/Disabled
- **Last Login:** Last authentication timestamp
- **Actions:**
  - Edit user
  - Reset password
  - Disable/Enable
  - Delete (if no activity)

**Features:**
- **New User Button:** Create staff account
- **Role-Based Access Control (RBAC):**
  - Admin: All permissions
  - Manager: Approve contracts, view reports, manage masters
  - Staff: Create contracts, manage customers
  - Viewer: Read-only access to all data

---

### User Form
**Screenshot:** `19-user-form.png`

**Description:**
Create/edit user accounts with role assignment.

**Form Fields:**
- **Username:** Unique login identifier
- **Full Name:** User's complete name
- **Password:** Strong password (creation only)
- **Role Selection:** Dropdown with role options
- **Email:** User email (optional)
- **Active Status:** Enable/disable toggle

**Validation:**
- Username uniqueness
- Password strength requirements
- Role selection required

---

### Company Settings
**Screenshot:** `20-company-settings.png`

**Description:**
Configure company information and contract clauses (Admin only). This makes RCCMS truly generic - any company can use it by updating these settings.

**Form Sections:**

#### 1. Company Identity (Bilingual)
- **Company Name (English):** Legal business name
- **Company Name (Arabic):** Arabic legal name
- **Trade License Number:** Business registration
- **Tax Registration Number:** VAT registration (if applicable)

#### 2. Contact Information (Bilingual)
- **Address (English/Arabic):** Complete address
- **City (English/Arabic):** City name
- **Country (English/Arabic):** Country name
- **P.O. Box:** Postal box number
- **Phone Number:** Primary contact
- **Email:** Business email
- **Website:** Company website URL

#### 3. Contract Clauses (Bilingual)
- **Terms & Conditions (English):** Full contract terms
- **Terms & Conditions (Arabic):** Arabic contract terms
- **Clause 1-10 (English/Arabic):** Individual contract clauses
- **Footer Text (English/Arabic):** Contract footer disclaimer

#### 4. Branding
- **Logo Upload:** Company logo for PDFs
- **Primary Color:** Brand color (hex code)
- **Secondary Color:** Accent color

**Action Buttons:**
- **Save Settings:** (data-testid="button-save-settings") Update configuration
- **Preview PDF:** See how contract PDF will look
- **Reset to Defaults:** Restore MARMAR defaults

**Generic System Note:**
RCCMS comes with MARMAR Rent-a-Car as default company data. Any rental car company can customize these settings to make the system their own. The system is completely generic and reusable.

---

### Financial Settings
**Screenshot:** `21-financial-settings.png`

**Description:**
Configure all financial parameters and pricing (Admin only). Centralized control of all rates and fees.

**Settings Categories:**

#### 1. Fuel Pricing
- **Petrol Price per Liter (AED):** Current petrol price
- **Diesel Price per Liter (AED):** Current diesel price
- **Electric Charging Fee (AED):** EV charging cost
- **Last Updated:** Timestamp of last fuel price update

**Usage:** These prices are used in automatic fuel charge calculations during vehicle return.

#### 2. Default Rental Rates
**Note:** These are defaults; vehicle-specific rates override these.
- **Economy Daily Rate (AED):** Default for economy cars
- **Standard Daily Rate (AED):** Default for standard cars
- **Luxury Daily Rate (AED):** Default for luxury cars
- **SUV Daily Rate (AED):** Default for SUVs
- **Weekly Discount (%):** Percentage off for 7+ day rentals
- **Monthly Discount (%):** Percentage off for 30+ day rentals

#### 3. Addon Fees
- **Insurance per Day (AED):** Daily insurance cost
- **GPS Rental per Day (AED):** GPS device fee
- **Baby Seat per Day (AED):** Child seat rental
- **Additional Driver Fee (AED):** Extra driver cost (one-time or per-day)
- **Airport Pickup Fee (AED):** Delivery to airport
- **Airport Dropoff Fee (AED):** Return from airport

#### 4. Mileage Limits & Charges
- **Default KM per Day:** Daily mileage allowance (e.g., 250 km)
- **Default KM per Month:** Monthly allowance (e.g., 5000 km)
- **Extra KM Charge (AED):** Price per excess kilometer

#### 5. Late Return Penalties
- **Grace Period (Minutes):** Free delay time (e.g., 60 min)
- **Hourly Penalty (AED):** Charge per hour late (up to 6 hours)
- **Full Day Charge After (Hours):** Switch to full day rate (e.g., 6 hours)

#### 6. VAT & Tax
- **VAT Rate (%):** Current VAT percentage (e.g., 5% in UAE)
- **VAT Registration Number:** Tax registration (from Company Settings)
- **Apply VAT to:** Checkboxes for which items are taxable

**Action Buttons:**
- **Save Financial Settings:** Update all pricing
- **Import Fuel Prices:** Auto-update from external source (future feature)
- **Pricing History:** View historical rate changes

**Impact:**
These settings directly affect:
- Automatic fuel charge calculations
- Contract total amount calculations
- Extra charges on vehicle return
- PDF contract generation
- Financial reports

---

## 7. Bilingual Support (Arabic/RTL)

### Dashboard - Arabic
**Screenshot:** `22-dashboard-arabic.png`

**Description:**
The dashboard in full Arabic mode showing complete RTL (Right-to-Left) layout transformation.

**Key Differences from English:**

#### Layout Changes
- **Sidebar Position:** Moved from left to right side
- **Text Alignment:** All text right-aligned
- **Icons:** Mirrored appropriately (arrows, navigation elements)
- **Cards:** Flow from right to left
- **Reading Order:** Natural Arabic reading direction

#### Typography
- **Font Family:** Cairo font (Arabic-optimized Google Font)
- **Character Rendering:** Proper Arabic ligatures and joining
- **Diacritical Marks:** Correctly positioned
- **Mixed Content:** Numbers remain LTR within RTL text

#### Translation Quality
- **Professional Translation:** Native speaker translations, not Google Translate
- **Context-Aware:** Financial vs. legal terminology
- **Cultural Adaptation:** UAE-specific terms
- **Consistency:** Same terminology across all screens

**Language Toggle:**
- Button shows "English" when in Arabic mode
- Instant switch with smooth animation
- No page reload required
- Preference persisted in localStorage

---

### Contracts List - Arabic
**Screenshot:** `23-contracts-arabic.png`

**Description:**
Contracts list in Arabic showing RTL table layout.

**RTL Table Features:**
- **Column Order:** Reversed (actions on left, contract number on right)
- **Text Alignment:** All text right-aligned
- **Headers:** Arabic column names
- **Status Badges:** Arabic status labels (مسودة، مؤكد، نشط، etc.)
- **Sort Icons:** Mirrored for RTL
- **Pagination:** RTL orientation

**Bilingual Data Display:**
- Customer names show Arabic version
- Vehicle names in Arabic
- Status labels translated
- Dates in Arabic locale format

---

### New Contract Form - Arabic
**Screenshot:** `24-new-contract-arabic.png`

**Description:**
Contract creation form in Arabic showing bilingual field labels and RTL form layout.

**Form Features:**

#### Bilingual Labels
Example: **"Customer Information / معلومات العميل"**
- English label first
- Arabic label after slash
- Both visible simultaneously
- Helps bilingual staff

#### Field Labels in Section Headers
- **"Hirer Type / نوع المستأجر"** - Shows both languages
- **"Direct / مباشر"** - Radio button options bilingual
- **"With Sponsor / مع كفيل"** - Dropdown options bilingual

#### Form Layout
- **Labels:** Right-aligned
- **Input Fields:** RTL text entry
- **Dropdowns:** Options in Arabic
- **Date Pickers:** Arabic month names
- **Buttons:** Arabic text, right-to-left order

#### Data Entry
- **Arabic Input:** Accepts Arabic characters
- **Name Fields:** Separate English/Arabic fields
- **Phone Numbers:** LTR within RTL form
- **Amounts:** Numbers remain LTR

**Validation Messages:**
- Error messages in Arabic
- Tooltip help text in Arabic
- Success notifications in Arabic

---

### Financial Report - Arabic
**Screenshot:** `25-financial-report-arabic.png`

**Description:**
Financial report in Arabic showing RTL charts and bilingual axis labels.

**Chart Adaptations:**

#### Line Chart (Revenue Trend)
- **X-Axis Labels:** Arabic month names (يناير، فبراير، etc.)
- **Y-Axis Label:** "الإيرادات (درهم)" (Revenue in Dirhams)
- **Tooltip:** Arabic text with RTL number formatting
- **Legend:** Arabic status labels

#### Pie Charts
- **Labels:** Arabic segment names
- **Percentages:** Arabic numerals option
- **Legend Position:** Right side for RTL
- **Colors:** Same color scheme (theme consistent)

#### Data Tables
- **Column Headers:** Arabic
- **Row Data:** Bilingual customer/vehicle names
- **Alignment:** RTL throughout
- **Totals:** Arabic labels

**Export in Arabic:**
- PDF export respects RTL layout
- Arabic fonts embedded in PDF
- Chart images captured with Arabic labels
- Excel export with Arabic headers

---

## 8. UI/UX Features

### Theme Toggle - Dark Mode
**Screenshot:** `26-dark-mode-dashboard.png`

**Description:**
The same dashboard in dark mode showing Material Design 3 dark theme implementation.

**Dark Mode Features:**

#### Color Adaptation
- **Background:** Dark grey (#1e1e1e)
- **Cards:** Elevated dark surface (#2d2d2d)
- **Text:** Light grey/white for readability
- **Primary Color:** Cyan-blue (maintains brand)
- **Accent Colors:** Adjusted for dark background
- **Borders:** Subtle grey borders

#### Contrast Ratios
- **Text Contrast:** WCAG AAA compliance
- **Button Contrast:** Clear hover states
- **Chart Colors:** Optimized for dark background
- **Status Badges:** Readable in dark mode

#### Persistence
- Theme choice saved to localStorage
- Remembers preference across sessions
- Per-user preference
- System default detection option

**Toggle Location:** Sun/Moon icon button in header (top-right)

---

### Sidebar Navigation
**Screenshot:** `27-sidebar-collapsed.png`

**Description:**
The collapsible hierarchical sidebar in collapsed state showing icon-only navigation.

**Sidebar Features:**

#### Hierarchical Structure
- **Top Level:**
  - Dashboard
  - Masters (collapsible group)
  - Contracts
  - Reports (collapsible group)
  - Logs & Errors (collapsible group)
  - Settings (collapsible group)

#### Collapsed State
- **Icon Only:** Shows only icons
- **Width:** Narrow (~60px)
- **Tooltips:** Hover to see full label
- **Active Indicator:** Highlighted icon for current page

#### Expanded State
- **Full Labels:** Icons + text labels
- **Nested Items:** Indented sub-menu items
- **Expand/Collapse Icons:** Chevron indicators
- **Active Highlight:** Full background highlight

#### Collapse Behavior
- **Toggle Button:** (data-testid="button-sidebar-toggle") Hamburger menu in header
- **Persistence:** State saved to localStorage
- **Default:** Collapsed on first visit
- **Smooth Animation:** CSS transition for expand/collapse

#### RTL Adaptation
- **English:** Sidebar on left, expands right
- **Arabic:** Sidebar on right, expands left
- **Icons:** Mirrored for RTL
- **Text:** Right-aligned in Arabic

---

### Responsive Design - Mobile View
**Screenshot:** `28-mobile-contracts-list.png`

**Description:**
RCCMS on mobile device showing responsive adaptations.

**Mobile Features:**

#### Navigation
- **Sidebar:** Overlay drawer (swipe from edge)
- **Header:** Compact with hamburger menu
- **User Profile:** Icon only, expandable

#### Tables
- **Card View:** Tables become cards on mobile
- **Vertical Layout:** Each row is a card
- **Key Info:** Show most important fields only
- **Expand:** Tap to see full details

#### Forms
- **Single Column:** All fields stack vertically
- **Full Width:** Input fields span full width
- **Touch-Friendly:** Larger touch targets
- **Date Pickers:** Native mobile date pickers

#### Charts
- **Responsive:** Charts resize to fit screen
- **Touch Interactions:** Pinch to zoom, swipe to scroll
- **Simplified:** Fewer data points on small screens

**Breakpoints:**
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

---

### Loading States & Skeletons
**Screenshot:** `29-loading-skeletons.png`

**Description:**
Loading state showing skeleton screens while data fetches.

**Skeleton Components:**
- **Card Skeletons:** Placeholder cards with pulse animation
- **Table Skeletons:** Row placeholders
- **Chart Skeletons:** Graph outline placeholders
- **Text Skeletons:** Line placeholders for text

**UX Benefits:**
- **Perceived Performance:** Appears faster
- **Layout Stability:** No layout shift when data loads
- **Professional:** Better than blank screens or spinners

---

### Toast Notifications
**Screenshot:** `30-toast-notifications.png`

**Description:**
Example success and error toast notifications.

**Toast Types:**

#### Success Toast (Green)
- **Icon:** Checkmark
- **Title:** "Success"
- **Message:** "Contract created successfully"
- **Duration:** 3 seconds
- **Position:** Bottom-right

#### Error Toast (Red)
- **Icon:** X circle
- **Title:** "Error"
- **Message:** "Unable to save contract. Please check required fields."
- **Duration:** 5 seconds (longer for errors)
- **Position:** Bottom-right

#### Info Toast (Blue)
- **Icon:** Info circle
- **Title:** "Information"
- **Message:** "Draft saved automatically"

**Features:**
- **Bilingual:** Messages in selected language
- **Dismissible:** Click X to close
- **Auto-dismiss:** Fade out automatically
- **Stack:** Multiple toasts stack vertically
- **Non-blocking:** Doesn't prevent user actions

---

## Screenshot Naming Convention

All screenshots follow this naming pattern:
```
{number}-{screen-name}-{language/variant}.png

Examples:
01-login-page.png
02-dashboard-english.png
14-financial-report.png
22-dashboard-arabic.png
26-dark-mode-dashboard.png
```

**Filename Components:**
- **Number (01-30):** Sequence number for ordering
- **Screen Name:** Descriptive kebab-case name
- **Language/Variant:** (optional) -english, -arabic, -dark-mode

---

## Using Screenshots in Documentation

### In Marketing Materials
- Use login page and dashboard to show professional UI
- Include financial reports to highlight analytics capabilities
- Show Arabic screens to demonstrate true bilingual support
- Feature contract timeline for audit trail selling point

### In User Guides
- Reference screenshots by number: "See Screenshot 03-contracts-list.png"
- Step-by-step tutorials with corresponding screens
- Annotated screenshots with callouts for key features
- Before/after examples for state transitions

### In Sales Presentations
- Dashboard showing metrics (Screenshot 02)
- Financial charts (Screenshot 14)
- Bilingual comparison (Screenshots 02 vs 22)
- Timeline audit trail (Screenshot 06)

### In Technical Documentation
- API integration examples with UI context
- Database schema mapped to UI screens
- User role examples showing permission differences
- Error handling examples with toast notifications

---

## Screenshot Quality Standards

All screenshots were captured at:
- **Resolution:** 1920x1080 (Full HD)
- **Browser:** Chrome/Firefox latest version
- **Zoom:** 100% (no browser zoom)
- **Format:** PNG (lossless)
- **Color Space:** sRGB
- **Annotations:** None (clean screenshots)

---

## Additional Resources

For more information about RCCMS features, see:
- **PRODUCTION_READINESS_REPORT.md** - Complete feature documentation
- **one-pager-data.md** - Marketing one-pager
- **compelling-features.md** - Detailed feature descriptions
- **DOCKER_DEPLOYMENT_GUIDE.md** - Deployment instructions
- **VPS_DEPLOYMENT_GUIDE.md** - VPS deployment steps

---

## Contact & Support

**Developer:** AKN Consulting  
**Email:** rccms@akn-consulting.com  
**Phone:** +91 9400750821  
**Address:** Muttathu, Thattayil, Pathanamthitta - 691525, Kerala, India

---

*This screenshot documentation was generated for RCCMS (Rental Car Contract Management System). All screenshots show the system with sample data for demonstration purposes.*

**Last Updated:** October 24, 2025  
**RCCMS Version:** 1.0.0  
**Documentation Version:** 1.0
