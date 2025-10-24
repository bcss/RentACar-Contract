# MARMAR Rental Car Contract Management System - Testing Guide

## Document Purpose
This guide is designed for testers with no prior knowledge of the MARMAR rental car contract management system. It provides detailed, step-by-step instructions to test all features comprehensively.

**Client**: MARMAR Rent-a-Car Company  
**Developed By**: AKN Consulting  
**Contact**: +919400750821 | rccms@akn-consulting.com | rccms@akn-consulting.in  
**Address**: Muttathu, Thattayil, Pathanamthitta - 691525

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Test User Accounts](#test-user-accounts)
4. [Testing Checklist](#testing-checklist)
5. [Detailed Testing Procedures](#detailed-testing-procedures)
6. [Bug Reporting Template](#bug-reporting-template)
7. [Expected Behaviors](#expected-behaviors)

---

## System Overview

### What is This System?
This is a comprehensive bilingual (English/Arabic) rental car contract management system developed by **AKN Consulting** for **MARMAR Rent-a-Car Company**. The system helps manage the complete lifecycle of car rental contracts from creation to closure.

### Key Capabilities
- **Contract Management**: Create, edit, and track rental contracts through 5 lifecycle states
- **Master Data**: Manage customers, vehicles, sponsors, and companies
- **Financial Tracking**: Record payments, deposits, refunds, and extra charges
- **Reporting**: Generate financial, operational, and customer reports with charts
- **Audit Trail**: Complete history of all changes and contract events
- **Bilingual Support**: Full functionality in English and Arabic with RTL/LTR layouts

### User Roles
1. **Admin**: Full system access including settings and user management
2. **Manager**: Can manage contracts, master data, and view reports
3. **Staff**: Can create and manage contracts, limited settings access
4. **Viewer**: Read-only access to contracts and reports

---

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Published application URL (provided separately)
- Test credentials (see below)

### Initial Login
1. Navigate to the application URL
2. You should see a landing page with "MARMAR Contract Management System"
3. Click the **"Log In to Continue"** button
4. Enter your test credentials
5. Click **"Log In"**
6. You should be redirected to the Dashboard

---

## Test User Accounts

### Default Superadmin Account
- **Username**: `superadmin`
- **Password**: `Admin@123456`
- **Role**: Admin (full access)

### Creating Additional Test Users
Once logged in as superadmin, you can create additional test users:
1. Navigate to **Users** page from the sidebar
2. Click **"Create User"** button
3. Fill in required fields
4. Select role: Admin, Manager, Staff, or Viewer
5. Click **"Create"**

**Recommended Test Users**:
- Manager: username `manager1`, password `Manager@123`
- Staff: username `staff1`, password `Staff@123`
- Viewer: username `viewer1`, password `Viewer@123`

---

## Testing Checklist

Use this checklist to track your testing progress:

### ✅ Basic System Tests
- [ ] Login/Logout functionality
- [ ] Language switching (English ↔ Arabic)
- [ ] Theme switching (Light ↔ Dark)
- [ ] Sidebar navigation
- [ ] Dashboard loading and metrics

### ✅ Master Data Management
- [ ] Customers: Create, Edit, Disable, Enable, Search
- [ ] Vehicles: Create, Edit, Disable, Enable, Search
- [ ] Sponsors: Create, Edit, Disable, Enable, Search (Admin/Manager only)
- [ ] Companies: Create, Edit, Disable, Enable, Search (Admin/Manager only)

### ✅ Contract Management
- [ ] Create new contract (draft)
- [ ] Edit draft contract
- [ ] Confirm contract (draft → confirmed)
- [ ] Activate contract (confirmed → active)
- [ ] Complete contract with vehicle return (active → completed)
- [ ] Close contract (completed → closed)
- [ ] Record payments (deposit, final payment)
- [ ] Record refunds
- [ ] View contract timeline

### ✅ Financial Features
- [ ] Configure financial settings (Admin only)
- [ ] Automatic fuel charge calculation
- [ ] Extra charges (km, fuel, damage, etc.)
- [ ] Payment tracking
- [ ] Financial reports with charts

### ✅ Reporting & Analytics
- [ ] Financial Reports (revenue, payments, outstanding)
- [ ] Operational Reports (vehicle utilization, contract status)
- [ ] Customer Reports (top customers, retention)
- [ ] Audit Reports (contract modifications, lifecycle events)
- [ ] Export reports to PDF
- [ ] Export reports to Excel

### ✅ Admin Functions
- [ ] User management (create, edit, disable, enable)
- [ ] Company settings (bilingual info)
- [ ] Financial settings (rates, fees, fuel pricing)
- [ ] Terms & conditions management
- [ ] System error acknowledgment

### ✅ Security & Permissions
- [ ] Admin-only pages blocked for non-admins
- [ ] Manager-only features blocked for staff/viewers
- [ ] Read-only mode for viewers
- [ ] Contract immutability after confirmation

---

## Detailed Testing Procedures

## 1. Authentication & Navigation Testing

### 1.1 Login Flow
**Objective**: Verify users can log in successfully

**Steps**:
1. Navigate to application URL
2. Click "Log In to Continue" on landing page
3. Enter username: `superadmin`
4. Enter password: `Admin@123456`
5. Click "Log In" button

**Expected Results**:
- ✅ Success toast appears: "Login successful"
- ✅ Redirected to Dashboard
- ✅ User name displayed in header or profile area
- ✅ Sidebar shows navigation options

**Test Invalid Login**:
1. Enter username: `wronguser`
2. Enter password: `wrongpass`
3. Click "Log In"

**Expected Results**:
- ✅ Error toast appears: "Invalid username or password"
- ✅ User remains on login page

---

### 1.2 Language Switching
**Objective**: Verify bilingual support works correctly

**Steps**:
1. Log in to the system
2. Locate the language toggle button in the header (flag icon or "EN"/"AR")
3. Click the language toggle button
4. Observe the page content

**Expected Results**:
- ✅ Page content switches from English to Arabic (or vice versa)
- ✅ Layout changes to RTL (right-to-left) for Arabic
- ✅ Sidebar moves to the right side in Arabic
- ✅ All text, buttons, and labels translate correctly
- ✅ Numbers and dates format appropriately

**Switch Back**:
1. Click language toggle again
2. Verify everything returns to English/LTR layout

---

### 1.3 Theme Switching
**Objective**: Verify dark/light mode toggle works

**Steps**:
1. Log in to the system
2. Locate the theme toggle button in header (sun/moon icon)
3. Click the theme toggle button

**Expected Results**:
- ✅ Page switches from light to dark theme (or vice versa)
- ✅ All colors invert appropriately
- ✅ Text remains readable
- ✅ Charts and graphs update colors
- ✅ Preference persists after page reload

---

### 1.4 Sidebar Navigation
**Objective**: Test navigation between pages

**Steps**:
1. Log in as superadmin
2. Click "Masters" section in sidebar
3. Observe it expands to show subsections
4. Click "Customers" under Masters
5. Verify Customers page loads
6. Click "Reports" section in sidebar
7. Click "Financial Reports"
8. Verify Financial Reports page loads
9. Click sidebar toggle button in header

**Expected Results**:
- ✅ Sidebar sections expand/collapse correctly
- ✅ Active page is highlighted in sidebar
- ✅ Pages load without errors
- ✅ Sidebar can be collapsed/expanded with toggle button
- ✅ Collapsed state persists when navigating

---

### 1.5 Logout Flow
**Objective**: Verify users can log out

**Steps**:
1. While logged in, locate user profile/menu in header
2. Click on your username or profile icon
3. Click "Log Out" option

**Expected Results**:
- ✅ User is logged out successfully
- ✅ Redirected to login page
- ✅ Cannot access protected pages without logging back in

---

## 2. Dashboard Testing

### 2.1 Dashboard Metrics
**Objective**: Verify dashboard displays correct metrics

**Steps**:
1. Log in as Admin or Manager
2. Navigate to Dashboard (should be default after login)
3. Observe the metric cards displayed

**Expected Metrics**:
- ✅ Active Rentals (number of currently rented vehicles)
- ✅ Monthly Revenue (revenue for current month)
- ✅ Overdue Returns (contracts past return date)
- ✅ Pending Refunds (security deposits awaiting refund)
- ✅ Vehicle Utilization (percentage of fleet in use)
- ✅ Payment Collection Rate (percentage collected)

**Verify**:
- ✅ Numbers display correctly
- ✅ Icons match the metric type
- ✅ Tooltips appear on hover
- ✅ No loading errors

---

### 2.2 System Errors Widget
**Objective**: Test system error acknowledgment

**Steps**:
1. On Dashboard, locate "Unacknowledged System Errors" section
2. If errors are present, click "Acknowledge All" button
3. Confirm the acknowledgment dialog

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ After confirmation, errors are cleared
- ✅ Success toast appears
- ✅ Widget updates to show no pending errors

---

## 3. Customer Management Testing

### 3.1 Create Customer
**Objective**: Test customer creation functionality

**Steps**:
1. Navigate to **Customers** page from sidebar (under Masters)
2. Ensure you're on "Active Customers" tab
3. Click **"Create Customer"** button
4. Fill in the form:
   - **English Name**: `John Smith`
   - **Arabic Name**: `جون سميث` (optional)
   - **Phone**: `+971501234567`
   - **National ID**: `784-1990-1234567-1`
   - **Gender**: `Male`
   - **Email**: `john.smith@example.com` (optional)
   - **License Number**: `12345678`
   - **License Issued By**: `UAE`
   - **Nationality**: `American`
5. Click **"Create"** button

**Expected Results**:
- ✅ Success toast appears: "Customer created successfully"
- ✅ Dialog closes automatically
- ✅ New customer appears in the customer list
- ✅ Customer data displays correctly in the table

**Test Phone Duplicate Warning**:
1. Click "Create Customer" again
2. Enter the same phone number: `+971501234567`
3. Fill other required fields with different data

**Expected Results**:
- ✅ Warning message appears: "This phone number is used by 1 other customer(s)"
- ✅ Shows the existing customer name(s)
- ✅ Can still proceed to create (non-blocking warning)

---

### 3.2 Edit Customer
**Objective**: Test customer editing functionality

**Steps**:
1. From the Customers list, locate "John Smith"
2. Click the **Edit** button (pencil icon) for that customer
3. Modify the email: `john.updated@example.com`
4. Click **"Save Changes"**

**Expected Results**:
- ✅ Success toast appears: "Customer updated successfully"
- ✅ Dialog closes
- ✅ Customer list updates with new email

---

### 3.3 Disable Customer
**Objective**: Test customer disable functionality

**Steps**:
1. From the Customers list, find "John Smith"
2. Click the **Disable** button (ban icon)
3. Confirm the disable action in the dialog

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ After confirmation, success toast appears
- ✅ Customer is removed from "Active Customers" tab
- ✅ Customer appears in "Disabled Customers" tab

---

### 3.4 Enable Customer
**Objective**: Test customer re-enable functionality

**Steps**:
1. Switch to **"Disabled Customers"** tab
2. Locate "John Smith" in the disabled list
3. Click the **Enable** button (check icon)
4. Confirm the enable action

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Success toast appears after confirmation
- ✅ Customer returns to "Active Customers" tab
- ✅ Customer is removed from "Disabled Customers" tab

---

### 3.5 Search Customers
**Objective**: Test customer search functionality

**Steps**:
1. In the Customers page, locate the search box
2. Type: `John`
3. Observe the table

**Expected Results**:
- ✅ Table filters to show only customers with "John" in their name
- ✅ Search is case-insensitive
- ✅ Clearing search shows all customers again

---

## 4. Vehicle Management Testing

### 4.1 Create Vehicle
**Objective**: Test vehicle creation

**Steps**:
1. Navigate to **Vehicles** page (under Masters)
2. Click **"Create Vehicle"** button
3. Fill in the form:
   - **Registration (Plate)**: `ABC-123`
   - **Make**: `Toyota`
   - **Model**: `Camry`
   - **Year**: `2023`
   - **Color**: `Silver`
   - **Daily Rate**: `150`
   - **Fuel Type**: `Petrol`
   - **Tank Capacity**: `60` (liters)
   - **Odometer**: `5000` (km)
   - **Weekly Rate**: `900` (optional)
   - **Monthly Rate**: `3000` (optional)
4. Click **"Create"**

**Expected Results**:
- ✅ Success toast appears
- ✅ Vehicle appears in active vehicles list
- ✅ Status shows as "Available"
- ✅ All data displays correctly

---

### 4.2 Edit Vehicle
**Objective**: Test vehicle editing

**Steps**:
1. Find the Toyota Camry in the list
2. Click **Edit** button
3. Change Daily Rate to `160`
4. Click **"Save Changes"**

**Expected Results**:
- ✅ Success toast appears
- ✅ Updated rate displays in the list

---

### 4.3 Disable and Enable Vehicle
**Objective**: Test vehicle disable/enable

**Steps**:
1. Find Toyota Camry
2. Click **Disable** button
3. Confirm the action
4. Switch to "Disabled Vehicles" tab
5. Find the vehicle and click **Enable**
6. Confirm the action

**Expected Results**:
- ✅ Vehicle moves between Active and Disabled tabs correctly
- ✅ Success toasts appear for both actions

---

## 5. Sponsors Management Testing

### 5.1 Create Sponsor (Admin/Manager Only)
**Objective**: Test sponsor creation

**Steps**:
1. Navigate to **Sponsors** page
2. Click **"Create Sponsor"** button
3. Fill in:
   - **English Name**: `Ahmed Al-Sayed`
   - **Arabic Name**: `أحمد السيد`
   - **Nationality**: `Emirati`
   - **Passport ID**: `AE12345678`
   - **Mobile**: `+971501111111`
   - **License Number**: `87654321`
   - **Relation**: `Friend`
4. Click **"Create"**

**Expected Results**:
- ✅ Sponsor created successfully
- ✅ Appears in active sponsors list

**Test with Non-Admin User**:
1. Log out and log in as Staff or Viewer
2. Try to access Sponsors page

**Expected Results**:
- ✅ Sponsors page is not visible in sidebar OR
- ✅ Shows "No permission" message when accessed

---

### 5.2 Edit, Disable, Enable Sponsor
**Objective**: Test sponsor management operations

**Steps**:
1. Log in as Admin or Manager
2. Edit a sponsor's mobile number
3. Disable the sponsor
4. Re-enable the sponsor

**Expected Results**:
- ✅ All operations complete successfully
- ✅ Sponsor moves between Active/Disabled tabs correctly

---

## 6. Companies Management Testing

### 6.1 Create Company (Admin/Manager Only)
**Objective**: Test company creation

**Steps**:
1. Navigate to **Companies** page
2. Click **"Create Company"** button
3. Fill in:
   - **English Name**: `Al Noor Trading LLC`
   - **Arabic Name**: `شركة النور للتجارة`
   - **Registration Number**: `CR-123456`
   - **Tax Number**: `TAX-789012` (optional)
   - **Contact Person**: `Mohammed Hassan`
   - **Phone**: `+971502222222`
   - **Email**: `info@alnoor.ae` (optional)
4. Click **"Create"**

**Expected Results**:
- ✅ Company created successfully
- ✅ All bilingual fields display correctly

---

### 6.2 Company Operations
**Objective**: Test edit, disable, enable operations

**Steps**:
1. Edit company email
2. Disable company
3. Re-enable company

**Expected Results**:
- ✅ All operations work as expected
- ✅ Success toasts appear

---

## 7. Contract Management Testing (Core Feature)

### 7.1 Create New Contract (Draft)
**Objective**: Test contract creation with all hirer types

**Steps**:
1. Navigate to **Contracts** page
2. Click **"Create Contract"** button
3. **Select Customer**:
   - Click "Select Customer" dropdown
   - Search for "John Smith"
   - Click to select
4. **Select Vehicle**:
   - Click "Select Vehicle" dropdown
   - Search for "Toyota Camry"
   - Click to select
5. **Enter Rental Dates**:
   - Start Date: Today's date
   - End Date: 7 days from today
6. **Odometer Start**: `5000`
7. **Fuel Level Start**: `100%`
8. **Hirer Type**: Select `Direct` (customer is renting directly)
9. Review auto-populated rates from Financial Settings
10. Click **"Create Contract"**

**Expected Results**:
- ✅ Success toast appears: "Contract created successfully"
- ✅ Redirected to contract view page
- ✅ Contract status shows "Draft"
- ✅ Contract number is auto-generated
- ✅ All entered data displays correctly
- ✅ Rates are auto-populated from financial settings

---

### 7.2 Create Contract with Sponsor
**Objective**: Test "with_sponsor" hirer type

**Steps**:
1. Create new contract
2. Select customer and vehicle
3. **Hirer Type**: Select `With Sponsor`
4. **Select Sponsor**: Choose "Ahmed Al-Sayed" from dropdown
5. Complete rental dates and other fields
6. Click "Create Contract"

**Expected Results**:
- ✅ Contract created successfully
- ✅ Sponsor information displays in contract view
- ✅ Sponsor name appears in both English and Arabic

---

### 7.3 Create Contract from Company
**Objective**: Test "from_company" hirer type

**Steps**:
1. Create new contract
2. Select customer and vehicle
3. **Hirer Type**: Select `From Company`
4. **Select Company**: Choose "Al Noor Trading LLC"
5. Complete other fields
6. Click "Create Contract"

**Expected Results**:
- ✅ Contract created successfully
- ✅ Company information displays in contract view

---

### 7.4 Edit Draft Contract
**Objective**: Verify draft contracts can be edited

**Steps**:
1. From Contracts list, find a draft contract
2. Click the contract to view details
3. Click **"Edit"** button
4. Modify the end date (extend by 2 days)
5. Click **"Save Changes"**

**Expected Results**:
- ✅ Contract updated successfully
- ✅ Changes reflected immediately
- ✅ Edit is recorded in contract timeline with reason

---

### 7.5 Confirm Contract (Draft → Confirmed)
**Objective**: Test contract confirmation lifecycle transition

**Steps**:
1. Open a draft contract
2. Click **"Confirm Contract"** button
3. Read the confirmation warning: "This action makes the contract immutable"
4. Click **"Confirm"** in the dialog

**Expected Results**:
- ✅ Success toast appears
- ✅ Contract status changes to "Confirmed"
- ✅ Edit button becomes disabled
- ✅ "Activate Contract" button appears
- ✅ Vehicle status changes to "Rented"
- ✅ Timeline shows "Contract Confirmed" event

**Try to Edit Confirmed Contract**:
1. Try clicking Edit button (should be disabled)
2. Verify you cannot modify the contract

**Expected Results**:
- ✅ Edit functionality is blocked
- ✅ Contract is now immutable

---

### 7.6 Activate Contract (Confirmed → Active)
**Objective**: Test contract activation

**Steps**:
1. Open a confirmed contract
2. Click **"Activate Contract"** button
3. Confirm the action

**Expected Results**:
- ✅ Status changes to "Active"
- ✅ "Complete Contract" button appears
- ✅ Vehicle remains "Rented"
- ✅ Timeline updated

---

### 7.7 Record Deposit Payment
**Objective**: Test payment recording

**Steps**:
1. Open an active contract
2. Locate the "Payments" section
3. Click **"Record Deposit"** button
4. Fill in:
   - **Amount**: `500`
   - **Payment Method**: `Cash`
   - **Currency**: `SAR`
5. Click **"Record Payment"**

**Expected Results**:
- ✅ Success toast appears
- ✅ Payment appears in payments history
- ✅ "Paid" amount updates
- ✅ "Outstanding" amount decreases
- ✅ Timeline shows payment event

---

### 7.8 Complete Contract with Vehicle Return (Active → Completed)
**Objective**: Test vehicle return workflow and automatic fuel charge calculation

**Steps**:
1. Open an active contract
2. Click **"Complete Contract"** button
3. In the return dialog, fill in:
   - **Final Odometer**: `5500` (driven 500 km)
   - **Final Fuel Level**: `50%` (half tank)
   - **Vehicle Condition Notes**: `Minor scratch on rear bumper`
   - **Fuel Charge**: (should auto-calculate) - verify the amount
   - **Damage Charge**: `100` (for the scratch)
4. Review calculated fuel charge:
   - Tank capacity: 60 liters
   - Fuel used: 50% (100% start - 50% end)
   - Liters consumed: 30 liters
   - Fuel type: Petrol (check pricing from financial settings)
   - Expected charge: 30 liters × petrol price per liter
5. Click **"Complete"**

**Expected Results**:
- ✅ Contract status changes to "Completed"
- ✅ Fuel charge auto-calculated correctly based on fuel consumed
- ✅ Extra charges (fuel + damage) are added to total
- ✅ Final odometer and fuel level recorded
- ✅ Vehicle status changes to "Available"
- ✅ "Close Contract" button appears
- ✅ Timeline shows completion event

---

### 7.9 Record Final Payment
**Objective**: Test final payment recording

**Steps**:
1. Open a completed contract
2. Click **"Record Final Payment"** button
3. Fill in:
   - **Amount**: (the outstanding amount)
   - **Payment Method**: `Card`
   - **Currency**: `SAR`
4. Click **"Record Payment"**

**Expected Results**:
- ✅ Payment recorded successfully
- ✅ Outstanding amount becomes 0
- ✅ Payment collection rate = 100%

---

### 7.10 Close Contract (Completed → Closed)
**Objective**: Test final contract closure

**Steps**:
1. Open a completed contract
2. Click **"Close Contract"** button
3. Confirm the action

**Expected Results**:
- ✅ Status changes to "Closed"
- ✅ No further actions available
- ✅ Timeline shows closure event
- ✅ Contract is fully finalized

---

### 7.11 Record Refund
**Objective**: Test security deposit refund

**Steps**:
1. Open a closed contract that has a security deposit
2. Click **"Record Refund"** button
3. Fill in:
   - **Amount**: `500` (or security deposit amount)
   - **Refund Method**: `Cash`
4. Click **"Record Refund"**

**Expected Results**:
- ✅ Refund recorded successfully
- ✅ Appears in payments history as negative/refund
- ✅ Timeline updated

---

### 7.12 View Contract Timeline
**Objective**: Verify complete audit trail

**Steps**:
1. Open any contract that has gone through multiple states
2. Scroll to the "Contract Timeline" section
3. Review all events

**Expected Results**:
- ✅ All lifecycle transitions recorded (Created, Confirmed, Activated, Completed, Closed)
- ✅ All payments shown
- ✅ All field edits shown with before/after values
- ✅ User who performed each action is recorded
- ✅ Timestamps are accurate
- ✅ Events displayed in chronological order

---

### 7.13 Disable/Enable Contract
**Objective**: Test contract disable functionality

**Steps**:
1. From Contracts list, find any contract
2. Click **Disable** button
3. Confirm action
4. Go to URL parameter `?status=disabled` or filter
5. Find contract and **Enable** it

**Expected Results**:
- ✅ Contract can be disabled/enabled
- ✅ Appears in appropriate filter view

---

## 8. Financial Settings Testing (Admin Only)

### 8.1 Configure Financial Settings
**Objective**: Test financial settings configuration

**Steps**:
1. Navigate to **Settings → Financial Settings**
2. Modify the following:
   - **Default Daily Rate**: `150`
   - **Default Weekly Rate**: `900`
   - **Default Monthly Rate**: `3000`
   - **Insurance Per Day**: `25`
   - **GPS Per Day**: `15`
   - **Baby Seat Per Day**: `20`
   - **Additional Driver Fee**: `50`
   - **Default Extra KM Rate**: `1.5`
   - **Default Security Deposit**: `1500`
   - **Petrol Price/Liter**: `3.5`
   - **Diesel Price/Liter**: `3.2`
3. Click **"Save Settings"**

**Expected Results**:
- ✅ Success toast appears
- ✅ Settings saved successfully
- ✅ New contracts auto-populate with these values

**Test Auto-Population**:
1. Create a new contract
2. Verify all rates match the financial settings configured above

**Expected Results**:
- ✅ All rates auto-populate correctly
- ✅ Can manually override before confirmation

---

### 8.2 Test Fuel Charge Calculation
**Objective**: Verify automatic fuel charge calculation

**Setup**:
1. Ensure Petrol price is set to `3.5` SAR/liter
2. Create a contract with a vehicle that has:
   - Fuel Type: Petrol
   - Tank Capacity: 60 liters
3. Start fuel level: 100%
4. Complete contract with end fuel level: 25%

**Calculation**:
- Fuel consumed: 100% - 25% = 75%
- Liters used: 60 × 0.75 = 45 liters
- Expected charge: 45 × 3.5 = 157.5 SAR

**Expected Results**:
- ✅ Fuel charge auto-calculates to 157.5 SAR
- ✅ Can manually override if needed

---

## 9. Company Settings Testing (Admin Only)

### 9.1 Update Company Information
**Objective**: Test company settings management

**Steps**:
1. Navigate to **Settings → Company Settings**
2. Update bilingual company information:
   - **Company Name (EN)**: `MARMAR Car Rental`
   - **Company Name (AR)**: `تأجير السيارات مرمر`
   - **Address (EN)**: `123 Sheikh Zayed Road, Dubai, UAE`
   - **Address (AR)**: `123 شارع الشيخ زايد، دبي، الإمارات`
   - **Phone**: `+971-4-1234567`
   - **Email**: `info@marmar.ae`
   - **Website**: `www.marmar.ae`
3. Click **"Save Settings"**

**Expected Results**:
- ✅ Settings saved successfully
- ✅ Both English and Arabic fields updated
- ✅ Information appears on printed contracts

---

## 10. Terms & Conditions Testing (Admin Only)

### 10.1 Manage Terms & Conditions
**Objective**: Test terms management

**Steps**:
1. Navigate to **Settings → Terms & Conditions**
2. Add/Edit terms in both languages
3. Click **"Save Terms"**

**Expected Results**:
- ✅ Terms saved successfully
- ✅ Appear in contract PDFs

---

## 11. User Management Testing (Admin Only)

### 11.1 Create User
**Objective**: Test user creation

**Steps**:
1. Navigate to **Users** page
2. Click **"Create User"** button
3. Fill in:
   - **Username**: `testmanager`
   - **Password**: `Manager@123`
   - **First Name**: `Test`
   - **Last Name**: `Manager`
   - **Email**: `test.manager@marmar.ae`
   - **Role**: `Manager`
4. Click **"Create"**

**Expected Results**:
- ✅ User created successfully
- ✅ Appears in active users list

---

### 11.2 Edit User
**Objective**: Test user editing

**Steps**:
1. Find the newly created user
2. Click **Edit**
3. Change email to `manager.updated@marmar.ae`
4. Click **"Save"**

**Expected Results**:
- ✅ User updated successfully

---

### 11.3 Disable/Enable User
**Objective**: Test user disable/enable

**Steps**:
1. Disable the test user
2. Verify user appears in "Disabled Users" tab
3. Re-enable the user

**Expected Results**:
- ✅ User moves between tabs correctly
- ✅ Disabled user cannot log in

**Test Login with Disabled User**:
1. Log out
2. Try to log in with disabled user credentials

**Expected Results**:
- ✅ Login fails with appropriate error message

---

## 12. Financial Reports Testing

### 12.1 View Financial Reports
**Objective**: Test financial reporting features

**Steps**:
1. Navigate to **Reports → Financial Reports**
2. View the **Revenue Summary** tab
3. Observe:
   - Total Revenue metric
   - Monthly Revenue Trend chart
   - Revenue by Status chart
   - Monthly breakdown table

**Expected Results**:
- ✅ All charts render correctly
- ✅ Data matches contracts in the system
- ✅ Charts are responsive
- ✅ Colors are consistent with theme

---

### 12.2 Filter Reports by Date
**Objective**: Test date filtering

**Steps**:
1. On Financial Reports page
2. Set **Date From**: First day of current month
3. Set **Date To**: Today's date
4. Click **"Apply Filters"** (if needed) or observe auto-update

**Expected Results**:
- ✅ Reports update to show only data within date range
- ✅ Charts re-render with filtered data
- ✅ Metrics recalculate correctly

---

### 12.3 Export Financial Report to PDF
**Objective**: Test PDF export with embedded charts

**Steps**:
1. On Financial Reports page
2. Ensure charts are visible
3. Click **"Export PDF"** button
4. Wait for export to complete (5-10 seconds)

**Expected Results**:
- ✅ Success toast appears: "Report exported successfully"
- ✅ PDF file downloads automatically
- ✅ Open PDF and verify:
  - ✅ Report title and date range
  - ✅ Summary metrics table
  - ✅ Charts embedded as images
  - ✅ All data is readable
  - ✅ Bilingual content if Arabic was selected

---

### 12.4 Export Financial Report to Excel
**Objective**: Test Excel export

**Steps**:
1. On Financial Reports page
2. Click **"Export Excel"** button
3. Wait for export to complete

**Expected Results**:
- ✅ Excel file downloads
- ✅ Open Excel and verify:
  - ✅ Multiple sheets (Revenue Summary, Breakdown, Charts metadata)
  - ✅ Data is properly formatted
  - ✅ Headers are clear
  - ✅ Chart metadata sheet contains chart information

---

### 12.5 Test Other Report Tabs
**Objective**: Verify all report tabs work

**Steps**:
1. Click **Payment Collection** tab
2. Verify collection rate, collected amount, outstanding amount
3. View payment methods chart
4. Click **Outstanding Payments** tab
5. Verify outstanding payments table

**Expected Results**:
- ✅ All tabs load correctly
- ✅ Data is accurate
- ✅ Charts render properly

---

## 13. Operational Reports Testing

### 13.1 View Operational Reports
**Objective**: Test operational reporting

**Steps**:
1. Navigate to **Reports → Operational Reports**
2. View **Vehicle Utilization** tab
3. Observe:
   - Fleet utilization percentage
   - Vehicle utilization chart
   - Utilization table

**Expected Results**:
- ✅ Utilization calculated correctly (active contracts ÷ total vehicles)
- ✅ Chart shows utilization by vehicle
- ✅ Table shows days rented and available

---

### 13.2 Contract Status Summary
**Objective**: Test contract status reporting

**Steps**:
1. Click **Contract Status Summary** tab
2. Observe:
   - Total contracts metric
   - Contract status distribution chart
   - Average duration

**Expected Results**:
- ✅ Chart shows correct distribution of draft/confirmed/active/completed/closed
- ✅ Average duration calculated correctly

---

### 13.3 Extra Charges Report
**Objective**: Test extra charges reporting

**Steps**:
1. Click **Extra Charges Report** tab
2. View charges breakdown

**Expected Results**:
- ✅ Shows total extra charges
- ✅ Breakdown by type (fuel, km, damage, etc.)
- ✅ Lists contracts with charges

---

### 13.4 Export Operational Reports
**Objective**: Test operational report exports

**Steps**:
1. Export to PDF
2. Export to Excel
3. Verify both files

**Expected Results**:
- ✅ Both exports work correctly
- ✅ Charts embedded in PDF
- ✅ Data tables in Excel

---

## 14. Customer Reports Testing

### 14.1 View Customer Reports
**Objective**: Test customer analytics

**Steps**:
1. Navigate to **Reports → Customer Reports**
2. View **Customer Activity** tab
3. Observe:
   - Top customers by revenue chart
   - Customer activity table

**Expected Results**:
- ✅ Chart shows customers ranked by total revenue
- ✅ Table shows contract count and revenue per customer

---

### 14.2 Customer Retention Analysis
**Objective**: Test retention reporting

**Steps**:
1. Click **Retention Analysis** tab
2. View retention metrics and chart

**Expected Results**:
- ✅ Shows new vs repeat customers
- ✅ Retention rate calculated
- ✅ Donut chart displays correctly

---

### 14.3 Export Customer Reports
**Objective**: Test customer report exports

**Steps**:
1. Export to PDF
2. Export to Excel

**Expected Results**:
- ✅ Both exports successful
- ✅ Charts and data included

---

## 15. Audit Reports Testing

### 15.1 View Audit Reports
**Objective**: Test audit trail reporting

**Steps**:
1. Navigate to **Reports → Audit Reports**
2. View **Contract Modifications** tab
3. Observe field-level edit history

**Expected Results**:
- ✅ Shows all contract edits
- ✅ Displays before/after values
- ✅ Shows editor and timestamp
- ✅ Edit reasons included

---

### 15.2 Lifecycle Events
**Objective**: Test lifecycle audit trail

**Steps**:
1. Click **Lifecycle Events** tab
2. View contract status transitions

**Expected Results**:
- ✅ Shows all status changes
- ✅ Displays actor and timestamp
- ✅ Chronological order

---

### 15.3 Filter Audit Logs
**Objective**: Test audit filtering

**Steps**:
1. Filter by date range
2. Filter by action type (if available)
3. Search by contract number

**Expected Results**:
- ✅ Filters work correctly
- ✅ Results update in real-time

---

### 15.4 Export Audit Reports
**Objective**: Test audit export

**Steps**:
1. Export to PDF
2. Export to Excel

**Expected Results**:
- ✅ Both exports work
- ✅ All audit data included

---

## 16. System Errors Testing (Admin Only)

### 16.1 View System Errors
**Objective**: Test error logging and acknowledgment

**Steps**:
1. Navigate to **System Errors** page
2. View unacknowledged errors (if any)

**Expected Results**:
- ✅ Errors listed with details
- ✅ Shows error message, stack trace, timestamp
- ✅ User who triggered error

---

### 16.2 Acknowledge Individual Error
**Objective**: Test single error acknowledgment

**Steps**:
1. Click **Acknowledge** on a specific error
2. Confirm action

**Expected Results**:
- ✅ Error marked as acknowledged
- ✅ Moves to acknowledged list

---

### 16.3 Acknowledge All Errors
**Objective**: Test bulk acknowledgment

**Steps**:
1. Click **"Acknowledge All"** button
2. Confirm action

**Expected Results**:
- ✅ All errors acknowledged
- ✅ List clears

---

## 17. Audit Logs Testing (Admin/Manager)

### 17.1 View Audit Logs
**Objective**: Test general audit log viewing

**Steps**:
1. Navigate to **Audit Logs** page
2. Review the log entries

**Expected Results**:
- ✅ All actions logged (CREATE, UPDATE, DISABLE, ENABLE)
- ✅ Shows entity type, action, actor, timestamp
- ✅ Can filter and search

---

## 18. Permission Testing

### 18.1 Test Admin Permissions
**Objective**: Verify admin has full access

**Steps**:
1. Log in as superadmin
2. Verify access to:
   - All navigation items visible
   - Users management
   - All settings pages
   - All reports
   - All master data

**Expected Results**:
- ✅ Full access to all features

---

### 18.2 Test Manager Permissions
**Objective**: Verify manager restrictions

**Steps**:
1. Create a Manager user (if not exists)
2. Log out and log in as Manager
3. Check access:
   - ✅ Can access: Contracts, Customers, Vehicles, Sponsors, Companies, Reports, Audit Logs
   - ❌ Cannot access: Users, Financial Settings, Company Settings, Terms & Conditions, System Errors

**Expected Results**:
- ✅ Settings pages show "No permission" or are hidden
- ✅ User management not accessible

---

### 18.3 Test Staff Permissions
**Objective**: Verify staff limitations

**Steps**:
1. Create a Staff user
2. Log in as Staff
3. Check access:
   - ✅ Can access: Contracts, Customers, Vehicles
   - ❌ Cannot access: Sponsors, Companies, Users, Settings, Audit Logs (Admin only), System Errors

**Expected Results**:
- ✅ Limited to core contract management
- ✅ No access to administrative features

---

### 18.4 Test Viewer Permissions
**Objective**: Verify read-only access

**Steps**:
1. Create a Viewer user
2. Log in as Viewer
3. Attempt to:
   - View contracts (should work)
   - Create contract (should be blocked)
   - Edit contract (should be blocked)
   - View reports (should work)

**Expected Results**:
- ✅ Can view data only
- ✅ All create/edit/delete buttons disabled or hidden
- ✅ Appropriate "No permission" messages

---

## 19. Contract Immutability Testing

### 19.1 Verify Draft Editability
**Objective**: Confirm drafts can be edited freely

**Steps**:
1. Create a draft contract
2. Edit any field
3. Save changes

**Expected Results**:
- ✅ Draft can be edited without restrictions

---

### 19.2 Verify Confirmed Contract Immutability
**Objective**: Confirm confirmed contracts cannot be edited

**Steps**:
1. Confirm a draft contract
2. Try to edit the contract

**Expected Results**:
- ✅ Edit button is disabled
- ✅ Form fields are read-only
- ✅ Cannot modify contract details

---

### 19.3 Test Status Transition Rules
**Objective**: Verify lifecycle cannot be skipped

**Steps**:
1. Create a draft contract
2. Try to activate it without confirming (if UI allows)

**Expected Results**:
- ✅ Cannot skip confirmation step
- ✅ Must follow: Draft → Confirmed → Active → Completed → Closed

---

## 20. Vehicle Status Synchronization Testing

### 20.1 Test Vehicle Status on Confirmation
**Objective**: Verify vehicle becomes "Rented" when contract confirmed

**Steps**:
1. Note the vehicle status before creating contract (should be "Available")
2. Create and confirm a contract with that vehicle
3. Check vehicle status

**Expected Results**:
- ✅ Vehicle status changes to "Rented"
- ✅ Vehicle cannot be selected for another contract while rented

---

### 20.2 Test Vehicle Status on Completion
**Objective**: Verify vehicle returns to "Available" when contract completed

**Steps**:
1. Complete an active contract
2. Check vehicle status

**Expected Results**:
- ✅ Vehicle status changes to "Available"
- ✅ Vehicle can be rented again

---

## 21. Data Validation Testing

### 21.1 Test Required Fields
**Objective**: Verify form validation

**Steps**:
1. Try to create a customer without required fields
2. Try to submit form

**Expected Results**:
- ✅ Form validation errors appear
- ✅ Required fields highlighted
- ✅ Cannot submit until valid

---

### 21.2 Test Email Validation
**Objective**: Verify email format validation

**Steps**:
1. Enter invalid email: `notanemail`
2. Try to save

**Expected Results**:
- ✅ Email validation error appears
- ✅ Form cannot be submitted

---

### 21.3 Test Phone Number Duplication
**Objective**: Verify duplicate phone detection

**Steps**:
1. Create customer with phone: `+971501111111`
2. Create another customer with same phone
3. Observe warning

**Expected Results**:
- ✅ Warning appears showing existing customer(s)
- ✅ Can still proceed (non-blocking)

---

## 22. UI/UX Testing

### 22.1 Test Responsive Design
**Objective**: Verify app works on different screen sizes

**Steps**:
1. Resize browser window to mobile size (375px width)
2. Navigate through pages
3. Resize to tablet size (768px)
4. Resize to desktop (1920px)

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ All buttons accessible
- ✅ Tables scroll horizontally on mobile

---

### 22.2 Test Loading States
**Objective**: Verify loading indicators work

**Steps**:
1. Navigate to a data-heavy page (Contracts, Reports)
2. Observe while page loads
3. Refresh the page

**Expected Results**:
- ✅ Skeleton loaders or loading spinners appear
- ✅ Content loads smoothly
- ✅ No flash of empty state

---

### 22.3 Test Empty States
**Objective**: Verify empty state messages

**Steps**:
1. Filter contracts with criteria that returns no results
2. View a report tab with no data

**Expected Results**:
- ✅ Friendly "No results found" message
- ✅ Icon or illustration shown
- ✅ Helpful text explaining why empty

---

### 22.4 Test Error Handling
**Objective**: Verify errors are handled gracefully

**Steps**:
1. Disconnect internet (if possible)
2. Try to load data
3. Reconnect

**Expected Results**:
- ✅ Error toast appears
- ✅ Error message is user-friendly
- ✅ Can retry or recover

---

## 23. Performance Testing

### 23.1 Test Page Load Times
**Objective**: Measure page performance

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to different pages
4. Note load times

**Expected Results**:
- ✅ Pages load within 2-3 seconds
- ✅ No excessive network requests
- ✅ Resources cached appropriately

---

### 23.2 Test with Large Data Sets
**Objective**: Verify performance with many records

**Steps**:
1. Create 50+ contracts (if possible)
2. Navigate to Contracts page
3. Test search and filtering
4. Generate reports

**Expected Results**:
- ✅ Page remains responsive
- ✅ Search is fast
- ✅ Tables paginate or virtualize
- ✅ Reports generate within 10 seconds

---

## 24. Cross-Browser Testing

### 24.1 Test in Multiple Browsers
**Objective**: Verify compatibility

**Test in**:
- Google Chrome
- Mozilla Firefox
- Safari (Mac/iOS)
- Microsoft Edge

**Expected Results**:
- ✅ App works in all modern browsers
- ✅ Layouts are consistent
- ✅ All features functional

---

## 25. Localization Testing

### 25.1 Test Arabic Translation Completeness
**Objective**: Verify all text is translated

**Steps**:
1. Switch to Arabic language
2. Navigate through all pages
3. Look for untranslated text (English keys showing)

**Expected Results**:
- ✅ All UI text translated
- ✅ All buttons translated
- ✅ All error messages translated
- ✅ No literal translation keys visible (e.g., "common.processing")

---

### 25.2 Test RTL Layout
**Objective**: Verify right-to-left layout works

**Steps**:
1. Switch to Arabic
2. Check:
   - Sidebar position (right side)
   - Text alignment (right-aligned)
   - Icons and buttons (mirrored where appropriate)
   - Tables (columns flow right-to-left)

**Expected Results**:
- ✅ Complete RTL layout
- ✅ Navigation flows right-to-left
- ✅ Forms properly aligned

---

### 25.3 Test Number and Date Formatting
**Objective**: Verify localization of numbers/dates

**Steps**:
1. View contracts and reports in both languages
2. Check date formats
3. Check number formats

**Expected Results**:
- ✅ Dates formatted appropriately for locale
- ✅ Numbers readable in both languages
- ✅ Currency symbols correct

---

## Bug Reporting Template

When you find a bug, please report it using this template:

### Bug Report

**Bug ID**: [Unique identifier, e.g., BUG-001]

**Severity**: 
- [ ] Critical (System crash, data loss)
- [ ] Major (Feature broken, blocks workflow)
- [ ] Minor (UI issue, typo)
- [ ] Cosmetic (Visual inconsistency)

**Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Screenshots/Videos**: [Attach if applicable]

**Environment**:
- Browser: 
- Browser Version: 
- Operating System: 
- Screen Size: 
- Language: 
- User Role: 

**Additional Notes**:

---

## Expected Behaviors Summary

### Contract Lifecycle
- ✅ Lifecycle must follow: Draft → Confirmed → Active → Completed → Closed
- ✅ Cannot skip states
- ✅ Cannot go backwards
- ✅ Draft is editable
- ✅ Confirmed onwards is immutable

### Vehicle Status
- ✅ Available → Rented (on confirm)
- ✅ Rented → Available (on complete)

### Permissions
- ✅ Admin: Full access
- ✅ Manager: No settings/users access
- ✅ Staff: Core contracts only
- ✅ Viewer: Read-only

### Bilingual Support
- ✅ Complete translation in both languages
- ✅ RTL layout for Arabic
- ✅ Sidebar switches sides
- ✅ All content translates

### Financial Calculations
- ✅ Rates auto-populate from settings
- ✅ Fuel charge auto-calculates
- ✅ Can manually override before confirmation
- ✅ Extra charges add to total

### Audit Trail
- ✅ All actions logged
- ✅ Timeline shows complete history
- ✅ Before/after values captured
- ✅ Actors and timestamps recorded

### Exports
- ✅ PDF includes charts as images
- ✅ Excel includes data tables and chart metadata
- ✅ Exports respect date filters
- ✅ Bilingual content in exports

---

## Testing Completion Checklist

Once you've completed all tests, verify:

- [ ] All features tested at least once
- [ ] All user roles tested
- [ ] Both languages tested
- [ ] Both themes tested
- [ ] Exports tested (PDF and Excel)
- [ ] Complete contract lifecycle tested
- [ ] All master data CRUD operations tested
- [ ] All reports viewed and exported
- [ ] Permissions verified for all roles
- [ ] Bugs documented with template
- [ ] Screenshots/videos captured where needed

---

## Support & Questions

If you encounter issues or have questions during testing:

1. Document the issue using the bug report template
2. Take screenshots or screen recordings
3. Note the exact steps that led to the issue
4. Include your user role and language setting
5. Report to the development team

### Contact Development Team
**AKN Consulting**  
📧 Email: rccms@akn-consulting.com / rccms@akn-consulting.in  
📱 Phone: +919400750821  
📍 Address: Muttathu, Thattayil, Pathanamthitta - 691525

---

**Document Version**: 1.0  
**Last Updated**: October 24, 2025  
**Client**: MARMAR Rent-a-Car Company  
**Developed By**: AKN Consulting  
**System**: MARMAR Rental Car Contract Management System  

---

Thank you for testing! Your feedback helps improve the system.
