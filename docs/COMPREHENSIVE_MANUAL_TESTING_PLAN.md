# KarāraOS Comprehensive Manual Testing Plan
**Version:** 1.0  
**Date:** November 30, 2025  
**Purpose:** Complete system validation from scratch after atomic database reset

---

## Table of Contents
1. [Pre-Testing Setup](#1-pre-testing-setup)
2. [Phase 1: Authentication & Access Control](#phase-1-authentication--access-control)
3. [Phase 2: Master Data Setup](#phase-2-master-data-setup)
4. [Phase 3: Core Entity Management](#phase-3-core-entity-management)
5. [Phase 4: Contract Lifecycle](#phase-4-contract-lifecycle)
6. [Phase 5: Financial Operations](#phase-5-financial-operations)
7. [Phase 6: Driver Services](#phase-6-driver-services)
8. [Phase 7: Fleet Operations](#phase-7-fleet-operations)
9. [Phase 8: Notifications & Communications](#phase-8-notifications--communications)
10. [Phase 9: Reporting & Analytics](#phase-9-reporting--analytics)
11. [Phase 10: System Administration](#phase-10-system-administration)
12. [Phase 11: UI/UX & Design Validation](#phase-11-uiux--design-validation)
13. [Phase 12: RTL/LTR & Internationalization](#phase-12-rtlltr--internationalization)

---

## How to Use This Testing Plan

1. **Start the Testing Documentation Tool:** Navigate to `/test-documentation` in the app
2. **Create a New Session:** Name it with the current date (e.g., "Full System Test - Nov 30, 2025")
3. **For Each Test Step:**
   - Capture a screenshot (drag & drop, paste Ctrl+V, or browse)
   - Enter the test subject
   - Add remarks about what you observed
   - Mark status (Passed/Failed/Blocked/Documented)
4. **Export:** Click "Finish Session" then "Export HTML" to save the complete report

---

## 1. Pre-Testing Setup

### 1.1 Environment Verification
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1.1 | Open the application URL | Login page displays | |
| 1.1.2 | Verify page title shows "KarāraOS" | Title visible in browser tab | |
| 1.1.3 | Check minimum width (1024px) | Desktop-only message if narrower | |
| 1.1.4 | Verify light/dark theme toggle | Theme switches correctly | |

### 1.2 Initial Login
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.2.1 | Enter username: `superadmin` | Username accepted | |
| 1.2.2 | Enter password: `Admin@123456` | Password field filled | |
| 1.2.3 | Click Login button | Redirected to Dashboard | |
| 1.2.4 | Verify sidebar navigation loads | All menu items visible | |
| 1.2.5 | Check user profile in sidebar | Shows "Super Admin" | |

---

## Phase 1: Authentication & Access Control

### 1.1 User Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1.1 | Navigate to Settings → Users | Users page loads | |
| 1.1.2 | Click "Add User" button | User form dialog opens | |
| 1.1.3 | Create Manager user with full name | Form accepts all fields | |
| 1.1.4 | Set role to "Manager" | Role dropdown works | |
| 1.1.5 | Set branch access permissions | Permissions save correctly | |
| 1.1.6 | Save the user | User appears in list | |
| 1.1.7 | Create Staff user | Second user created | |
| 1.1.8 | Create Viewer user | Third user created | |

### 1.2 Role Permissions Testing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.2.1 | Logout and login as Manager | Dashboard loads | |
| 1.2.2 | Verify Manager can access all features | No access denied errors | |
| 1.2.3 | Logout and login as Staff | Dashboard loads | |
| 1.2.4 | Verify Staff has limited permissions | Some menus hidden | |
| 1.2.5 | Logout and login as Viewer | Dashboard loads | |
| 1.2.6 | Verify Viewer is read-only | Create/Edit buttons disabled | |
| 1.2.7 | Login back as superadmin | Full access restored | |

### 1.3 Password Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.3.1 | Click on profile in sidebar | Profile menu opens | |
| 1.3.2 | Click "Change Password" | Password form opens | |
| 1.3.3 | Enter current password | Field accepts input | |
| 1.3.4 | Enter new password (strong) | Validation passes | |
| 1.3.5 | Confirm new password | Passwords match | |
| 1.3.6 | Save changes | Password updated successfully | |

---

## Phase 2: Master Data Setup

### 2.1 Company Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1.1 | Navigate to Settings → Company | Company settings page loads | |
| 2.1.2 | Enter company name (EN) | Field accepts text | |
| 2.1.3 | Enter company name (AR) | Arabic text accepted | |
| 2.1.4 | Enter address details | All address fields work | |
| 2.1.5 | Enter VAT/Tax registration | Tax ID saved | |
| 2.1.6 | Upload company logo | Logo preview shown | |
| 2.1.7 | Save company settings | Settings saved successfully | |

### 2.2 Branch Setup
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.2.1 | Navigate to Settings → Branches | Branches page loads | |
| 2.2.2 | Click "Add Branch" | Branch form opens | |
| 2.2.3 | Enter branch name "Main Branch" (EN) | Field accepts text | |
| 2.2.4 | Enter branch name (AR) | Arabic text accepted | |
| 2.2.5 | Select emirate (Dubai) | Dropdown works | |
| 2.2.6 | Enter contact details | All fields work | |
| 2.2.7 | Set operating hours | Time pickers work | |
| 2.2.8 | Save branch | Branch created | |
| 2.2.9 | Create second branch (Abu Dhabi) | Multiple branches work | |

### 2.3 Vehicle Classes
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.3.1 | Navigate to Settings → Vehicle Classes | Vehicle classes page loads | |
| 2.3.2 | Click "Add Vehicle Class" | Form dialog opens | |
| 2.3.3 | Enter class name "Economy" (EN) | Field accepts text | |
| 2.3.4 | Enter class name (AR) | Arabic text accepted | |
| 2.3.5 | Set daily rate (100 AED) | Numeric field works | |
| 2.3.6 | Set weekly rate (600 AED) | Rate saved | |
| 2.3.7 | Set monthly rate (2000 AED) | Rate saved | |
| 2.3.8 | Save vehicle class | Class created | |
| 2.3.9 | Create additional classes (Standard, Luxury, SUV) | Multiple classes work | |

### 2.4 Vehicle Groups
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.4.1 | Navigate to Settings → Vehicle Groups | Vehicle groups page loads | |
| 2.4.2 | Click "Add Vehicle Group" | Form dialog opens | |
| 2.4.3 | Enter group name "Toyota Yaris" | Field accepts text | |
| 2.4.4 | Select vehicle class (Economy) | Type-ahead works | |
| 2.4.5 | Enter specifications | All fields work | |
| 2.4.6 | Save vehicle group | Group created | |
| 2.4.7 | Create additional groups | Multiple groups work | |

### 2.5 Addons & Packages
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.5.1 | Navigate to Settings → Addons | Addons page loads | |
| 2.5.2 | Create addon "GPS Navigation" | Addon created | |
| 2.5.3 | Set daily charge (25 AED) | Price saved | |
| 2.5.4 | Create addon "Child Seat" | Second addon created | |
| 2.5.5 | Navigate to Packages | Packages page loads | |
| 2.5.6 | Create package with bundled addons | Package created | |

---

## Phase 3: Core Entity Management

### 3.1 Customer Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1.1 | Navigate to Customers | Customers page loads | |
| 3.1.2 | Click "Add Customer" | Customer form opens | |
| 3.1.3 | Select customer type (Individual) | Type selected | |
| 3.1.4 | Enter first name | Field accepts text | |
| 3.1.5 | Enter last name | Field accepts text | |
| 3.1.6 | Enter Emirates ID | ID validated | |
| 3.1.7 | Enter license number | License accepted | |
| 3.1.8 | Set license expiry date | Date picker works | |
| 3.1.9 | Enter phone number | Phone validated | |
| 3.1.10 | Enter email address | Email validated | |
| 3.1.11 | Enter address | Address saved | |
| 3.1.12 | Save customer | Customer created | |
| 3.1.13 | Create corporate customer | Corporate type works | |
| 3.1.14 | Search for customer | Search works | |
| 3.1.15 | Edit customer details | Edit mode works | |

### 3.2 Vehicle Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.2.1 | Navigate to Vehicles | Vehicles page loads | |
| 3.2.2 | Click "Add Vehicle" | Vehicle form opens | |
| 3.2.3 | Enter plate number | Plate validated | |
| 3.2.4 | Select vehicle group | Type-ahead works | |
| 3.2.5 | Enter VIN number | VIN accepted | |
| 3.2.6 | Enter model year | Year validated | |
| 3.2.7 | Enter color | Color saved | |
| 3.2.8 | Set current odometer | Numeric field works | |
| 3.2.9 | Enter insurance details | Insurance saved | |
| 3.2.10 | Set registration expiry | Date picker works | |
| 3.2.11 | Assign to branch | Branch selected | |
| 3.2.12 | Save vehicle | Vehicle created | |
| 3.2.13 | Create 5 more vehicles | Multiple vehicles work | |
| 3.2.14 | Filter by status | Status filter works | |
| 3.2.15 | Filter by branch | Branch filter works | |

### 3.3 Sponsor Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.3.1 | Navigate to Sponsors | Sponsors page loads | |
| 3.3.2 | Click "Add Sponsor" | Sponsor form opens | |
| 3.3.3 | Enter sponsor name | Name saved | |
| 3.3.4 | Enter company details | Details saved | |
| 3.3.5 | Enter contact information | Contact saved | |
| 3.3.6 | Save sponsor | Sponsor created | |

---

## Phase 4: Contract Lifecycle

### 4.1 Contract Creation (Draft)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1.1 | Navigate to Contracts | Contracts page loads | |
| 4.1.2 | Click "New Contract" | Contract form opens | |
| 4.1.3 | Select customer (type-ahead) | Customer selected | |
| 4.1.4 | Select vehicle (type-ahead) | Vehicle selected | |
| 4.1.5 | Set rental start date | Date picker works | |
| 4.1.6 | Set rental end date | Date calculated | |
| 4.1.7 | Verify rate calculation | Rate displays correctly | |
| 4.1.8 | Add addon (GPS) | Addon added | |
| 4.1.9 | Set deposit amount | Deposit calculated | |
| 4.1.10 | Select payment method | Method selected | |
| 4.1.11 | Save as Draft | Contract saved | |
| 4.1.12 | Verify contract number generated | Number format correct | |
| 4.1.13 | View draft contract | Contract details display | |

### 4.2 Contract Activation
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.2.1 | Open draft contract | Contract view opens | |
| 4.2.2 | Click "Activate Contract" | Activation dialog opens | |
| 4.2.3 | Perform pre-delivery inspection | Inspection form opens | |
| 4.2.4 | Check all inspection items | Items checkable | |
| 4.2.5 | Add inspection photos | Photos upload | |
| 4.2.6 | Enter starting odometer | Reading recorded | |
| 4.2.7 | Enter fuel level | Level recorded | |
| 4.2.8 | Sign inspection form | Signature captured | |
| 4.2.9 | Complete activation | Status changes to Active | |
| 4.2.10 | Verify vehicle status updated | Vehicle shows "Rented" | |

### 4.3 Contract Completion
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.3.1 | Open active contract | Contract view opens | |
| 4.3.2 | Click "Complete Contract" | Completion dialog opens | |
| 4.3.3 | Perform post-return inspection | Inspection form opens | |
| 4.3.4 | Check all inspection items | Items checkable | |
| 4.3.5 | Upload return photos | Photos upload | |
| 4.3.6 | Enter ending odometer | Reading recorded | |
| 4.3.7 | Enter return fuel level | Level recorded | |
| 4.3.8 | Note any damages | Damage fields work | |
| 4.3.9 | Complete return | Status changes to Completed | |
| 4.3.10 | Verify vehicle status | Vehicle shows "Available" | |
| 4.3.11 | Review final charges | Charges display correctly | |

### 4.4 Contract Closure
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.4.1 | Open completed contract | Contract view opens | |
| 4.4.2 | Click "Close Contract" | Closure dialog opens | |
| 4.4.3 | Verify OTP required | OTP dialog displays | |
| 4.4.4 | Enter OTP code | OTP validated | |
| 4.4.5 | Confirm closure | Status changes to Closed | |
| 4.4.6 | Verify contract locked | No edits allowed | |
| 4.4.7 | Check audit trail | Closure logged | |

### 4.5 Contract Edit Flow
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.5.1 | Create new draft contract | Contract created | |
| 4.5.2 | Click Edit button | Edit form opens | |
| 4.5.3 | Modify rental dates | Dates updated | |
| 4.5.4 | Enter edit reason | Reason required | |
| 4.5.5 | Save changes | Changes saved | |
| 4.5.6 | Verify edit history | Edit log shows changes | |

---

## Phase 5: Financial Operations

### 5.1 Payment Processing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1.1 | Open active contract | Contract view opens | |
| 5.1.2 | Click "Add Payment" | Payment form opens | |
| 5.1.3 | Select payment method (Cash) | Method selected | |
| 5.1.4 | Enter payment amount | Amount accepted | |
| 5.1.5 | Enter reference number | Reference saved | |
| 5.1.6 | Submit payment | Payment recorded | |
| 5.1.7 | Verify balance updated | Balance reduced | |
| 5.1.8 | Test card payment | Card method works | |
| 5.1.9 | Test bank transfer | Transfer method works | |

### 5.2 Deposit Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.2.1 | View contract with deposit | Deposit shown | |
| 5.2.2 | Click "Collect Deposit" | Deposit dialog opens | |
| 5.2.3 | Record deposit collection | Deposit marked collected | |
| 5.2.4 | Complete contract | Proceed to completion | |
| 5.2.5 | Click "Refund Deposit" | Refund dialog opens | |
| 5.2.6 | Process deposit refund | Refund recorded | |

### 5.3 Additional Charges
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.3.1 | Open active contract | Contract view opens | |
| 5.3.2 | Click "Add Charge" | Charge form opens | |
| 5.3.3 | Select charge type (Fuel) | Type selected | |
| 5.3.4 | Enter charge amount | Amount accepted | |
| 5.3.5 | Enter description | Description saved | |
| 5.3.6 | Submit charge | Charge added | |
| 5.3.7 | Verify balance updated | Balance includes charge | |

---

## Phase 6: Driver Services

### 6.1 Driver Setup
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1.1 | Navigate to Drivers | Drivers page loads | |
| 6.1.2 | Click "Add Driver" | Driver form opens | |
| 6.1.3 | Enter driver details | All fields work | |
| 6.1.4 | Enter license information | License saved | |
| 6.1.5 | Set driver rate | Rate configured | |
| 6.1.6 | Save driver | Driver created | |

### 6.2 Driver Companies
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.2.1 | Navigate to Driver Companies | Page loads | |
| 6.2.2 | Add outsource company | Company created | |
| 6.2.3 | Set company rates | Rates saved | |

### 6.3 Driver Assignment
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.3.1 | Open active contract | Contract view opens | |
| 6.3.2 | Click "Assign Driver" | Driver dialog opens | |
| 6.3.3 | Select driver | Driver selected | |
| 6.3.4 | Set driver rate | Rate calculated | |
| 6.3.5 | Confirm assignment | Driver assigned | |
| 6.3.6 | Verify charges updated | Driver charges added | |

---

## Phase 7: Fleet Operations

### 7.1 Vehicle Inspection
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1.1 | Navigate to vehicle | Vehicle details open | |
| 7.1.2 | View inspection history | History displays | |
| 7.1.3 | View inspection photos | Photos load | |

### 7.2 Vehicle Transfers
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.2.1 | Navigate to Vehicle Transfers | Transfers page loads | |
| 7.2.2 | Click "New Transfer" | Transfer form opens | |
| 7.2.3 | Select vehicle | Vehicle selected | |
| 7.2.4 | Select destination branch | Branch selected | |
| 7.2.5 | Enter transfer reason | Reason saved | |
| 7.2.6 | Submit transfer | Transfer initiated | |
| 7.2.7 | Complete transfer | Vehicle branch updated | |

### 7.3 Toll Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.3.1 | Navigate to Toll Management | Page loads | |
| 7.3.2 | View toll systems | Systems displayed | |
| 7.3.3 | Record toll charge | Toll recorded | |

### 7.4 Traffic Fines
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.4.1 | Navigate to Traffic Fines | Page loads | |
| 7.4.2 | Record traffic fine | Fine recorded | |
| 7.4.3 | Link to contract | Contract linked | |

### 7.5 Incidents
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.5.1 | Navigate to Incidents | Page loads | |
| 7.5.2 | Report new incident | Incident form opens | |
| 7.5.3 | Upload incident photos | Photos uploaded | |
| 7.5.4 | Save incident | Incident recorded | |

### 7.6 Insurance Claims
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.6.1 | Navigate to Insurance Claims | Page loads | |
| 7.6.2 | Create new claim | Claim form opens | |
| 7.6.3 | Link to incident | Incident linked | |
| 7.6.4 | Upload documents | Documents uploaded | |
| 7.6.5 | Submit claim | Claim created | |

---

## Phase 8: Notifications & Communications

### 8.1 Communication Providers
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1.1 | Navigate to Communication Providers | Page loads | |
| 8.1.2 | View configured providers | Providers displayed | |

### 8.2 Manual Notifications
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.2.1 | Navigate to Send Notification | Page loads | |
| 8.2.2 | Select recipient | Recipient selected | |
| 8.2.3 | Select template | Template selected | |
| 8.2.4 | Preview message | Preview displays | |
| 8.2.5 | Send notification | Notification sent | |

### 8.3 Campaign Management
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.3.1 | Navigate to Campaigns | Page loads | |
| 8.3.2 | Create new campaign | Campaign created | |
| 8.3.3 | Set target audience | Audience selected | |
| 8.3.4 | Schedule campaign | Schedule set | |

---

## Phase 9: Reporting & Analytics

### 9.1 Financial Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.1.1 | Navigate to Financial Reports | Page loads | |
| 9.1.2 | Generate Revenue Report | Report displays | |
| 9.1.3 | Set date range | Filter applies | |
| 9.1.4 | Export to CSV | File downloads | |
| 9.1.5 | Export to PDF | File downloads | |

### 9.2 Operational Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.2.1 | Navigate to Operational Reports | Page loads | |
| 9.2.2 | View Fleet Utilization | Report displays | |
| 9.2.3 | View Contract Analytics | Report displays | |

### 9.3 Customer Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.3.1 | Navigate to Customer Reports | Page loads | |
| 9.3.2 | View customer statistics | Stats display | |
| 9.3.3 | View risk scoring | Risk data displays | |

### 9.4 Audit Reports
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 9.4.1 | Navigate to Audit Reports | Page loads | |
| 9.4.2 | View audit trail | Trail displays | |
| 9.4.3 | Filter by user | Filter works | |
| 9.4.4 | Filter by date | Filter works | |

---

## Phase 10: System Administration

### 10.1 Audit Logs
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.1.1 | Navigate to Audit Logs | Page loads | |
| 10.1.2 | View recent actions | Actions displayed | |
| 10.1.3 | Filter by action type | Filter works | |
| 10.1.4 | Search by user | Search works | |

### 10.2 System Errors
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.2.1 | Navigate to System Errors | Page loads | |
| 10.2.2 | View error log | Errors displayed | |
| 10.2.3 | Filter by severity | Filter works | |

### 10.3 Automated Jobs
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.3.1 | Navigate to Settings → Automation | Page loads | |
| 10.3.2 | View scheduled jobs | Jobs displayed | |
| 10.3.3 | View job execution history | History displayed | |

### 10.4 Import/Export
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 10.4.1 | Navigate to Import Data | Page loads | |
| 10.4.2 | Download template | Template downloads | |
| 10.4.3 | Test import validation | Validation works | |

---

## Phase 11: UI/UX & Design Validation

### 11.1 Design System
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.1.1 | Verify primary color (#137fec) | Color correct | |
| 11.1.2 | Verify background color (#f6f7f8) | Color correct | |
| 11.1.3 | Verify text color (#101922) | Color correct | |
| 11.1.4 | Verify square buttons (rounded-none) | No rounded corners | |
| 11.1.5 | Verify type-ahead dropdowns | Popover pattern used | |
| 11.1.6 | Verify inline icon inputs | Icons with bottom border | |

### 11.2 Responsive Design (1280x800)
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.2.1 | Set browser to 1280x800 | Layout adapts | |
| 11.2.2 | Verify sidebar collapses | Collapsible works | |
| 11.2.3 | Verify content fits | No horizontal scroll | |
| 11.2.4 | Verify tables scroll | Horizontal scroll in tables | |

### 11.3 Theme Switching
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 11.3.1 | Switch to dark mode | Colors invert properly | |
| 11.3.2 | Verify all components adapt | No contrast issues | |
| 11.3.3 | Switch back to light mode | Original colors restored | |
| 11.3.4 | Verify theme persists | Theme saved on refresh | |

---

## Phase 12: RTL/LTR & Internationalization

### 12.1 Language Switching
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.1.1 | Switch to Arabic | UI language changes | |
| 12.1.2 | Verify all labels translated | No missing translations | |
| 12.1.3 | Switch to English | UI language changes | |
| 12.1.4 | Verify all labels translated | No missing translations | |

### 12.2 RTL Layout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.2.1 | Switch to Arabic | Layout flips to RTL | |
| 12.2.2 | Verify sidebar position | Sidebar on right | |
| 12.2.3 | Verify text alignment | Text right-aligned | |
| 12.2.4 | Verify form labels | Labels right-aligned | |
| 12.2.5 | Verify icons direction | Icons flipped properly | |
| 12.2.6 | Verify table layout | Tables adapt to RTL | |

### 12.3 Bilingual Data Entry
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.3.1 | Enter Arabic customer name | Arabic text saved | |
| 12.3.2 | View in Arabic UI | Arabic text displayed | |
| 12.3.3 | View in English UI | English equivalent shown | |

### 12.4 CSV Export
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 12.4.1 | Export report in English | English CSV generated | |
| 12.4.2 | Verify column headers | Headers in English | |
| 12.4.3 | Export report in Arabic | Arabic CSV generated | |
| 12.4.4 | Verify column headers | Headers in Arabic | |

---

## Testing Completion Checklist

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Authentication | | |
| Phase 2: Master Data | | |
| Phase 3: Core Entities | | |
| Phase 4: Contract Lifecycle | | |
| Phase 5: Financial Operations | | |
| Phase 6: Driver Services | | |
| Phase 7: Fleet Operations | | |
| Phase 8: Notifications | | |
| Phase 9: Reporting | | |
| Phase 10: Administration | | |
| Phase 11: UI/UX Design | | |
| Phase 12: RTL/LTR | | |

---

## Issue Tracking Template

When you find an issue during testing, document it with:

| Field | Description |
|-------|-------------|
| **Issue ID** | Unique identifier (e.g., ISS-001) |
| **Phase** | Testing phase where found |
| **Step** | Specific test step number |
| **Severity** | Critical / High / Medium / Low |
| **Description** | What happened |
| **Expected** | What should have happened |
| **Screenshot** | Captured in testing tool |
| **Steps to Reproduce** | 1. 2. 3. |

---

## Quick Reference

### Login Credentials
- **Superadmin:** `superadmin` / `Admin@123456`

### Key URLs
- **Application:** `/` (redirects to login or dashboard)
- **Testing Tool:** `/test-documentation`
- **Dashboard:** `/dashboard`

### Testing Documentation Tool
1. Go to `/test-documentation`
2. Create new session
3. For each test: Add entry with screenshot + remarks
4. Finish session and export HTML

---

**End of Testing Plan**
