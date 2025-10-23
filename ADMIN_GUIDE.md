# Administrator Guide
## MARMAR Rental Car Contract Management System

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
This guide provides comprehensive instructions for system administrators managing the MARMAR Rental Car Contract Management System. It covers all administrative functions, security settings, user management, and system monitoring.

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
   - **Email**: Valid email address
   - **Phone**: Contact number with country code
   - **Address**: Physical address
   - **ID Number**: National ID or passport number
   - **ID Type**: Type of identification
   - **License Number**: Driver's license number
   - **License Expiry**: License expiration date
3. Click **"Create Customer"**

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
   - **Tax ID**: Tax identification number
   - **Contact Person**: Primary contact name
   - **Email**: Company email
   - **Phone**: Company phone
   - **Address**: Business address
3. Click **"Create Company"**

**Usage**: Companies can be selected for "From Company" hirer type contracts.

---

## Audit Logs & Monitoring

### Accessing Audit Logs

**Location**: Logs & Errors → Audit Logs

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
