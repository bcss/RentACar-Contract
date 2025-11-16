# RCCMS Role-Based Permissions System

## Overview

RCCMS implements a flexible role-based access control (RBAC) system with granular permission toggles. This system balances simplicity with flexibility by providing 4 core roles, enhanced with 3 targeted permission toggles that allow administrators to grant additional capabilities to users as needed.

## Core Roles

### 1. Admin (Administrator)
**Full system access with administrative privileges**

- ✅ All system operations including user management
- ✅ Company settings and financial settings configuration
- ✅ Full contract lifecycle management (create, edit, confirm, activate, complete, close)
- ✅ Reports and analytics access
- ✅ Master data management (customers, vehicles, sponsors, companies)
- ✅ Payment recording and tracking
- ✅ Vehicle inspection workflows
- ✅ Audit logs and system error viewing
- ✅ User enable/disable operations
- ✅ Permission toggle management for other users

**Default Permission Toggles:**
- `canAccessReports`: ✅ true
- `canCloseContracts`: ✅ true
- `canViewAllContracts`: ✅ true

### 2. Manager
**Business operations manager with reporting access**

- ✅ Full contract lifecycle management (create, edit, confirm, activate, complete, close)
- ✅ Reports and analytics access
- ✅ Master data management (customers, vehicles, sponsors, companies)
- ✅ Payment recording and tracking
- ✅ Vehicle inspection workflows
- ✅ Audit logs and business operations viewing
- ❌ User management (cannot create/edit/disable users)
- ❌ Company settings and financial settings (read-only)
- ❌ Permission toggle management

**Default Permission Toggles:**
- `canAccessReports`: ✅ true
- `canCloseContracts`: ✅ true
- `canViewAllContracts`: ✅ true

### 3. Staff
**Operational staff with flexible permissions**

Base staff permissions provide full operational workflow access without administrative capabilities. Permission toggles can be enabled to grant additional access as needed.

**Base Permissions:**
- ✅ Contract creation and editing (draft status)
- ✅ Contract confirmation (requireEditor middleware)
- ✅ Contract activation and completion (requireEditor middleware)
- ✅ Payment recording (deposits, final payments, refunds)
- ✅ Vehicle inspection workflows (pre-delivery and post-return)
- ✅ Master data management (customers, vehicles, sponsors, companies - create, edit)
- ❌ Contract closure (requires canCloseContracts toggle)
- ❌ Reports and analytics access (requires canAccessReports toggle)
- ❌ User management
- ❌ Company/financial settings
- ❌ View all contracts (by default sees only own contracts, requires canViewAllContracts toggle)

**Default Permission Toggles:**
- `canAccessReports`: ❌ false (can be granted)
- `canCloseContracts`: ❌ false (can be granted)
- `canViewAllContracts`: ❌ false (can be granted)

**Permission Toggle Use Cases:**
- **Staff with Reports Access:** Enable `canAccessReports` for staff members who need to generate reports and analyze business metrics
- **Senior Staff:** Enable `canCloseContracts` for senior staff authorized to finalize completed contracts
- **Cross-Department Staff:** Enable `canViewAllContracts` for staff who need to see all contracts (not just their own)

### 4. Viewer
**Read-only access for auditing and monitoring**

- ✅ View contracts (own contracts only by default)
- ✅ View customers, vehicles, sponsors, companies
- ✅ View company settings (read-only)
- ❌ Create or modify any data
- ❌ Payment operations
- ❌ Contract lifecycle operations
- ❌ Reports access (unless granted via toggle)
- ❌ User management
- ❌ System settings

**Default Permission Toggles:**
- `canAccessReports`: ❌ false (can be granted for audit/compliance roles)
- `canCloseContracts`: ❌ false (N/A - viewers cannot modify contracts)
- `canViewAllContracts`: ❌ false (can be granted for full visibility)

**Note:** Viewers typically don't need canCloseContracts since they have read-only access, but the toggle can technically be enabled if their role is elevated in the future.

## Permission Toggles

### 1. canAccessReports
**Grants access to reports and analytics pages**

**Who has it by default:**
- ✅ Admin
- ✅ Manager
- ❌ Staff (can be granted)
- ❌ Viewer (can be granted)

**What it enables:**
- Access to Reports menu in sidebar
- View Financial Reports page
- View Operational Reports (vehicle utilization, contract status, extra charges)
- Export reports to PDF and Excel
- View analytics dashboards and charts

**Use cases:**
- Grant to senior staff members responsible for business analysis
- Grant to viewer accounts used for compliance/audit reporting
- Grant to department heads who need metrics visibility

**Backend enforcement:**
- `requireReportsAccess` middleware on report routes
- Checks: `isAdmin || isManager || user.canAccessReports`

**Frontend behavior:**
- Reports menu item hidden in sidebar if access denied
- Direct navigation to report pages blocked by backend

### 2. canCloseContracts
**Grants permission to close completed contracts**

**Who has it by default:**
- ✅ Admin
- ✅ Manager
- ❌ Staff (can be granted)
- ❌ Viewer (not applicable)

**What it enables:**
- Close Contract button appears on completed contracts
- Ability to finalize contracts after payment verification
- Move contracts from 'completed' to 'closed' status

**Requirements:**
- Contract must be in 'completed' status
- All payments must be settled (outstanding balance = 0 OR final payment received)
- User must have close permission (Admin, Manager, or canCloseContracts=true)

**Use cases:**
- Grant to senior staff authorized to finalize contracts
- Grant to accounting staff responsible for payment verification
- Use for staff who handle end-to-end contract completion

**Backend enforcement:**
- `requireContractCloseAccess` middleware on close endpoint
- Checks: `isAdmin || isManager || user.canCloseContracts`
- Additional validation ensures payments are complete

**Frontend behavior:**
- Close Contract button hidden if permission denied
- Dialog title: "Close Contract" (no longer Admin-only)

### 3. canViewAllContracts
**Grants ability to view all contracts (not just own)**

**Who has it by default:**
- ✅ Admin
- ✅ Manager
- ❌ Staff (can be granted)
- ❌ Viewer (can be granted)

**What it enables:**
- View all contracts in the system (not filtered by creator)
- Search and access contracts created by other users
- Full visibility into business operations

**Use cases:**
- Grant to staff who coordinate across multiple departments
- Grant to senior staff responsible for oversight
- Grant to viewer accounts used for full system auditing
- Use for customer service staff who need to see all customer contracts

**Backend enforcement:**
- Contract listing endpoints filter by creator unless user has view-all permission
- Checks: `isAdmin || isManager || user.canViewAllContracts`

**Frontend behavior:**
- Contracts page shows all contracts if permission granted
- Without permission, only contracts where `createdBy = user.id` are visible

## Permission Matrix

| Feature | Admin | Manager | Staff | Staff + Reports | Staff + Close | Staff + All Toggles | Viewer | Viewer + Reports |
|---------|-------|---------|-------|----------------|---------------|-------------------|--------|------------------|
| **Contract Management** |
| Create draft contracts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit draft contracts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Confirm contracts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Activate rentals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Complete rentals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Close contracts | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| View all contracts | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View own contracts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Disable contracts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Payments** |
| Record deposits | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Record final payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Record refunds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Inspections** |
| Pre-delivery inspection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Post-return inspection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Master Data** |
| Create customers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit customers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Disable customers | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create vehicles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit vehicles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Disable vehicles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage sponsors | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage companies | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reports & Analytics** |
| Access reports menu | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Financial reports | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Operational reports | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Export reports | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Administration** |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit permission toggles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Company settings | ✅ | View | View | View | View | View | View | View |
| Financial settings | ✅ | View | View | View | View | View | View | View |
| Audit logs (system) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit logs (business) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System errors | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Workflow Examples

### Example 1: Basic Staff Member
**Role:** Staff  
**Toggles:** All disabled (default)  
**Use case:** Day-to-day rental operations

**Can do:**
1. Create rental contracts
2. Manage customers and vehicles
3. Confirm contracts
4. Activate rentals with pre-delivery inspection
5. Complete rentals with post-return inspection
6. Record payments (deposits, final payments)
7. View only their own contracts

**Cannot do:**
- Close contracts (needs Admin/Manager approval)
- Access reports (no business intelligence access)
- View other staff members' contracts

### Example 2: Senior Staff with Close Permission
**Role:** Staff  
**Toggles:** `canCloseContracts` = true  
**Use case:** Experienced staff authorized to finalize contracts

**Additional capabilities:**
- Close completed contracts after payment verification
- Complete the full rental lifecycle independently
- Handle end-to-end customer service

**Still cannot:**
- Access reports and analytics
- View other staff members' contracts

### Example 3: Staff with Reports Access
**Role:** Staff  
**Toggles:** `canAccessReports` = true  
**Use case:** Department head or senior staff with analytics needs

**Additional capabilities:**
- Access all reports and analytics pages
- Generate and export financial reports
- View operational metrics and dashboards
- Monitor business performance

**Still cannot:**
- Close contracts (needs separate permission)
- View all contracts (sees only own)

### Example 4: Cross-Department Staff
**Role:** Staff  
**Toggles:** `canViewAllContracts` = true  
**Use case:** Customer service or coordination role

**Additional capabilities:**
- View all contracts in the system
- Search and access any customer's contracts
- Assist customers with contracts created by other staff
- Coordinate across departments

**Still cannot:**
- Access reports
- Close contracts

### Example 5: Senior Staff (All Permissions)
**Role:** Staff  
**Toggles:** All enabled (canAccessReports, canCloseContracts, canViewAllContracts)  
**Use case:** Senior team member with broad operational authority

**Capabilities:**
- Effectively operates at Manager level for contracts
- Full operational workflow (create → close)
- Access to reports and analytics
- View all contracts across the system
- Complete autonomy for day-to-day operations

**Still cannot:**
- Manage users or permission toggles
- Modify company/financial settings

### Example 6: Audit Viewer
**Role:** Viewer  
**Toggles:** `canAccessReports` = true, `canViewAllContracts` = true  
**Use case:** Compliance or audit account

**Capabilities:**
- View all contracts (read-only)
- Access reports for compliance monitoring
- Export data for audit purposes
- Full visibility without modification ability

### Example 7: Basic Manager
**Role:** Manager  
**Toggles:** All enabled by default  
**Use case:** Department manager or operations lead

**Capabilities:**
- Full contract lifecycle management
- Reports and analytics access
- View and manage all business operations
- Close contracts and finalize deals
- Master data management

**Cannot do:**
- Create or edit users
- Modify permission toggles
- Change company or financial settings

## How to Configure User Permissions (Admin Guide)

### Granting Permission Toggles

1. **Navigate to User Management**
   - Access via sidebar: Settings → Users

2. **Edit User**
   - Click Edit button on the user you want to modify
   - Only Admin role can edit permission toggles

3. **Configure Permission Toggles**
   - **Can access reports and analytics:** Check to grant reports access
   - **Can close contracts:** Check to enable contract closure
   - **Can view all contracts:** Check to grant system-wide contract visibility

4. **Save Changes**
   - Click "Update User" to apply the new permissions
   - Changes take effect immediately on next page load

### Best Practices

**Principle of Least Privilege:**
- Only grant permissions that users need for their job function
- Start with minimum access and add permissions as needed
- Review permissions regularly

**Permission Toggle Guidelines:**
- **canAccessReports:** Grant to users who need business intelligence, metrics, or compliance reporting
- **canCloseContracts:** Grant to senior staff authorized to finalize contracts and verify payments
- **canViewAllContracts:** Grant to coordination roles, customer service, or oversight positions

**Role Selection:**
- **Admin:** System administrators and IT managers only
- **Manager:** Department managers, operations leads, senior management
- **Staff:** Day-to-day operational staff, front-desk personnel
- **Viewer:** Audit accounts, monitoring systems, compliance reviewers

**Common Combinations:**
```
Junior Staff:      Staff role, no toggles
Senior Staff:      Staff + canCloseContracts
Department Head:   Staff + canAccessReports + canViewAllContracts
Team Lead:         Staff + all toggles
Manager:           Manager role (has all toggles by default)
Auditor:           Viewer + canAccessReports + canViewAllContracts
```

## Technical Implementation

### Backend Middleware

**Role-based middleware:**
- `requireAdmin` - Admin only
- `requireAdminOrManager` - Admin or Manager only
- `requireEditor` - Admin, Manager, or Staff (excludes Viewer)
- `requireAuthenticated` - Any authenticated user

**Toggle-based middleware:**
- `requireReportsAccess` - Checks: `isAdmin || isManager || canAccessReports`
- `requireContractCloseAccess` - Checks: `isAdmin || isManager || canCloseContracts`

**Contract visibility:**
- Listing endpoints automatically filter by creator unless user has `canViewAllContracts`
- Backend query: `WHERE createdBy = user.id OR user.canViewAllContracts = true`

### Frontend Implementation

**useAuth Hook:**
```typescript
const { 
  user, 
  isAdmin, 
  isManager, 
  isStaff, 
  isViewer,
  canAccessReports,
  canCloseContracts,
  canViewAllContracts 
} = useAuth();
```

**Conditional Rendering:**
```typescript
// Show Reports menu
{(isAdmin || isManager || canAccessReports) && <ReportsMenu />}

// Show Close button
{canCloseContract && <CloseButton />}

// Where canCloseContract is:
const canCloseContract = 
  contract.status === 'completed' && 
  paymentsSettled &&
  (isAdmin || isManager || hasClosePermission);
```

### Database Schema

```sql
-- users table columns
canAccessReports BOOLEAN DEFAULT false,
canCloseContracts BOOLEAN DEFAULT false,
canViewAllContracts BOOLEAN DEFAULT false
```

**Default values by role:**
- Admin: all true
- Manager: all true
- Staff: all false (can be granted)
- Viewer: all false (can be granted)

## Security Considerations

1. **Defense in Depth:**
   - Frontend checks for UX (hide buttons/menus)
   - Backend middleware for enforcement (API protection)
   - Database constraints for data integrity

2. **Permission Inheritance:**
   - Admin and Manager always have toggle permissions
   - Toggles can only elevate Staff/Viewer access, not restrict Admin/Manager

3. **Immutable Permissions:**
   - Super admin account permissions cannot be modified
   - Role changes require Admin privileges

4. **Audit Trail:**
   - All permission changes logged in audit logs
   - User edits record who made the change and when

## Migration Notes

**Existing users:**
- Admin: All toggles set to true automatically
- Manager: All toggles set to true automatically
- Staff: All toggles set to false (requires manual grant if needed)
- Viewer: All toggles set to false (requires manual grant if needed)

**No breaking changes:**
- Existing functionality preserved
- Admin and Manager roles unchanged
- Staff role enhanced (can now activate/complete contracts, record payments)
- Viewer role unchanged (read-only)

## Summary

The RCCMS permission system provides:
- **4 Core Roles** - Clear hierarchy from Admin to Viewer
- **3 Permission Toggles** - Flexible access control for specific capabilities
- **Enhanced Staff Role** - Full operational workflow capability
- **Granular Control** - Administrators can fine-tune access for each user
- **Backward Compatible** - Existing workflows and permissions preserved

This balance of simplicity and flexibility allows organizations to:
- Grant appropriate access without creating excessive roles
- Promote staff members with targeted permissions
- Maintain security with least-privilege principle
- Scale permissions as the organization grows

For questions or permission requests, contact your system administrator.
