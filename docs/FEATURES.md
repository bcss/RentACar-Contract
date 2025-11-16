# RCCMS Features & Reports Catalog

## Overview
This document catalogs all features, reports, and analytics available in the Rental Car Contract Management System, including access requirements, data sources, and business value.

---

## Core System Features

### 1. Contract Management
**Access Level**: All authenticated users  
**Permissions**: Role-based access with additional toggles  
**Features**:
- 4-state lifecycle workflow (Draft → Active → Completed → Closed)
- Mandatory edit reason enforcement
- Comprehensive contract timeline (field edits + lifecycle events)
- Bilingual PDF generation with RTA compliance
- Automated fuel charge calculation
- Advance payment auto-adjustment
- Vehicle delivery & pickup service management

### 2. Vehicle Fleet Management
**Access Level**: Staff and above  
**Features**:
- Real-time availability tracking (Available, Rented, Maintenance, Damaged)
- Automatic status synchronization with contract lifecycle
- Enhanced vehicle inspection (6 mandatory angles + unlimited optional photos)
- Complete maintenance history
- Document expiry tracking (registration, insurance)

### 3. Customer Management
**Access Level**: Staff and above  
**Features**:
- Individual and corporate customer records
- Three hirer types: Direct, With Sponsor, From Company
- Reusable sponsor and company master data
- Complete rental history per customer
- License and document management

### 4. Payment Tracking
**Access Level**: Staff and above  
**Features**:
- Comprehensive payment history with conditional validation
- Mandatory final payment enforcement
- Deposit management (paid/refunded tracking)
- Payment status visualization
- Pending refund alerts

### 5. Insurance Claims Module
**Access Level**: Manager and above  
**Features**:
- Complete CRUD system for insurance claims
- Claim workflow (Pending → Under Review → Approved/Rejected → Closed)
- Vehicle and contract linkage
- Document attachment support

### 6. User & Role Management
**Access Level**: Admin only  
**Features**:
- Four core roles (Admin, Manager, Staff, Viewer)
- **NEW:** Granular report-level permissions
- Permission inheritance (Admin/Manager bypass all granular checks)
- Immutable system accounts protection
- Password complexity and rotation requirements

---

## Reporting & Analytics System

### Permission Structure

#### Legacy Permission (Deprecated in favor of granular permissions)
- **canAccessReports**: All-or-nothing reports access (superseded by granular permissions)

#### Granular Report Permissions
All Admin and Manager users have full access to ALL reports regardless of permission flags. Granular permissions only apply to Staff and Viewer roles.

**Analytical Reports Group**:
1. `canAccessRevenueTrends` - Revenue Trends Report
2. `canAccessFleetPerformance` - Fleet Performance Report  
3. `canAccessContractAnalytics` - Contract Analytics Report
4. `canAccessCollectionPerformance` - Collection Performance Report

**Standard Reports Group**:
5. `canAccessFinancialReports` - Financial Reports
6. `canAccessOperationalReports` - Operational Reports
7. `canAccessCustomerReports` - Customer Reports
8. `canAccessInsuranceReports` - Insurance Reports
9. `canAccessAuditReports` - Audit Reports
10. `canAccessUserActivityReports` - User Activity Reports

---

## Dashboard Analytics Cards

### Core KPI Cards (All Users)
**Permission**: Any authenticated user  
**Data Source**: Real-time contract and vehicle data  
**Metrics**:
- Total Contracts (by status: Draft, Active, Completed, Closed)
- Active Rentals count
- Overdue Returns count
- Vehicle Utilization percentage
- Monthly Revenue (current month)
- Payment Collection Rate

### Revenue Analytics (Admin/Manager Only)
**Permission**: Admin or Manager role  
**Data Source**: `/api/analytics/revenue`  
**Metrics**:
- Total Revenue (all-time)
- Average Contract Value
- Monthly Revenue (current month)
- Last Month Revenue
- Revenue Growth percentage

**Business Value**: Track financial performance, identify revenue trends, forecast future earnings

### Operational Analytics (Admin/Manager Only)
**Permission**: Admin or Manager role  
**Data Source**: `/api/analytics/operations`  
**Metrics**:
- Average Rental Duration (days)
- Contracts This Month
- Contracts Last Month
- Contract Growth percentage
- Most Active User (staff member)

**Business Value**: Monitor operational efficiency, staff performance, contract volume trends

### Customer Analytics (Admin/Manager Only)
**Permission**: Admin or Manager role  
**Data Source**: `/api/analytics/customers`  
**Metrics**:
- Total Customers (unique)
- Repeat Customers count
- Repeat Customer Rate percentage
- New Customers This Month

**Business Value**: Understand customer loyalty, acquisition trends, retention performance

### Fleet Status Distribution (NEW)
**Permission**: Any authenticated user  
**Data Source**: `/api/analytics/fleet-status`  
**Metrics**:
- Available vehicles count
- Rented vehicles count
- Maintenance vehicles count
- Damaged vehicles count

**Business Value**: Real-time fleet health monitoring, capacity planning, maintenance scheduling

### Geographic Distribution (NEW)
**Permission**: Any authenticated user  
**Data Source**: `/api/analytics/geographic-distribution`  
**Metrics**:
- Top 10 customer regions (by license licensing authority)
- Top 10 vehicle regions (by licensing authority)

**Business Value**: Market penetration analysis, expansion planning, regional service optimization

### Pending Actions (NEW)
**Permission**: Any authenticated user  
**Data Source**: `/api/analytics/pending-actions`  
**Metrics**:
- Overdue Returns count (active contracts past rental end date)
- Pending Refunds count (deposits not yet refunded)
- Unclosed Contracts count (completed but not closed)

**Business Value**: Action item tracking, operational bottleneck identification, workflow completion monitoring

### Top Performers (NEW)
**Permission**: Any authenticated user  
**Data Source**: `/api/analytics/top-performers`  
**Metrics**:
- Top 5 Vehicles by Revenue (registration, make, model, total revenue)
- Most Active Staff (top 5 by contract count)

**Business Value**: Fleet ROI analysis, staff recognition, resource allocation optimization

---

## Detailed Reports

### 1. Revenue Trends Report
**Permission**: `canAccessRevenueTrends` (or Admin/Manager)  
**Route**: `/reports/revenue-trends`  
**Data Source**: `/api/analytics/revenue-trend`  
**Time Range**: Last 12 months (configurable)  

**Metrics**:
- Monthly revenue breakdown
- Total Revenue per month
- Rental Fees
- Extra Charges
- Delivery Fees
- Contract Count per month

**Visualizations**:
- Line chart (revenue over time)
- Stacked area chart (revenue component breakdown)
- Trend indicators with month-over-month growth

**Business Value**: Identify seasonal trends, forecast future revenue, analyze revenue composition

### 2. Fleet Performance Report
**Permission**: `canAccessFleetPerformance` (or Admin/Manager)  
**Route**: `/reports/fleet-performance`  
**Data Source**: Backend aggregations over contracts + vehicles  

**Metrics** (Planned):
- Vehicle utilization rates (% time rented)
- Revenue per vehicle
- Average rental duration per vehicle
- Maintenance downtime analysis
- Top performing vehicles (by revenue and utilization)
- Underperforming vehicles

**Business Value**: Optimize fleet composition, identify vehicles to retire or acquire, maximize ROI

### 3. Contract Analytics Report
**Permission**: `canAccessContractAnalytics` (or Admin/Manager)  
**Route**: `/reports/contract-analytics`  
**Data Source**: Backend aggregations over contracts  

**Metrics** (Planned):
- Contract volume trends
- Average contract value
- Contract status distribution
- Contract lifecycle duration analysis
- Extra charges analysis
- Most common contract types (hirer types)

**Business Value**: Understand contract patterns, improve pricing strategies, streamline workflows

### 4. Collection Performance Report
**Permission**: `canAccessCollectionPerformance` (or Admin/Manager)  
**Route**: `/reports/collection-performance`  
**Data Source**: Backend aggregations over payments + contracts  

**Metrics** (Planned):
- Payment collection rate (% collected vs total due)
- Outstanding balances
- Overdue payments
- Deposit refund status
- Average payment delay
- Payment method distribution

**Business Value**: Improve cash flow, identify collection issues, reduce bad debt

### 5. Financial Reports
**Permission**: `canAccessFinancialReports` (or Admin/Manager)  
**Route**: `/reports/financial` (planned)  
**Data Source**: `/api/reports/financial`  

**Metrics**:
- Income statements
- Balance sheet data
- Cash flow analysis
- Tax reporting data

**Business Value**: Accounting compliance, financial planning, stakeholder reporting

### 6. Operational Reports
**Permission**: `canAccessOperationalReports` (or Admin/Manager)  
**Route**: `/reports/operational` (planned)  

**Metrics** (Planned):
- Staff efficiency metrics
- Contract processing time
- Vehicle turnaround time
- Customer wait times
- SLA compliance

**Business Value**: Process optimization, staff training needs, operational bottleneck identification

### 7. Customer Reports
**Permission**: `canAccessCustomerReports` (or Admin/Manager)  
**Route**: `/reports/customers` (planned)  

**Metrics** (Planned):
- Customer acquisition trends
- Customer lifetime value
- Churn analysis
- Customer segmentation
- Repeat rental patterns

**Business Value**: Marketing strategy, customer retention programs, loyalty initiatives

### 8. Insurance Reports
**Permission**: `canAccessInsuranceReports` (or Admin/Manager)  
**Route**: `/reports/insurance` (planned)  

**Metrics** (Planned):
- Claims frequency
- Claims severity (average value)
- Claims status distribution
- Time to resolution
- Vehicle-specific claim patterns

**Business Value**: Risk management, insurance policy optimization, vehicle safety improvements

### 9. Audit Reports
**Permission**: `canAccessAuditReports` (or Admin/Manager)  
**Route**: `/reports/audit` (planned)  

**Metrics**:
- User activity logs
- Contract edit history (field-level changes)
- Lifecycle event timeline
- System error logs
- Access control violations

**Business Value**: Compliance, security monitoring, fraud detection, regulatory reporting

### 10. User Activity Reports
**Permission**: `canAccessUserActivityReports` (or Admin/Manager)  
**Route**: `/reports/user-activity` (planned)  

**Metrics** (Planned):
- Login/logout patterns
- Actions per user
- Most active users
- Inactive users
- Failed login attempts

**Business Value**: Security monitoring, user productivity analysis, system usage optimization

---

## System Health & Monitoring

### Support & Help Center
**Access Level**: All authenticated users  
**Route**: `/support`  

**Features**:
- Real-time system health dashboard
  - Version information
  - Database connectivity status
  - Webserver status
  - Hardware metrics (CPU, Memory)
  - Storage tracking
- Documentation links
- FAQs
- Error reporting system
- Contact support (admin@rccms.local)

---

## Unclosed Contract Alerts
**Access Level**: Admin and Manager  
**Route**: `/reports/unclosed-contracts`  
**Data Source**: `/api/contracts/unclosed-alerts`  

**Purpose**: Identify completed contracts that have not been closed, allowing managers to track and complete pending administrative tasks.

**Metrics**:
- Contract number
- Customer name
- Vehicle details
- Completion date
- Days unclosed
- Outstanding balance (if any)

**Business Value**: Workflow completion, revenue realization, data hygiene

---

## API Endpoints Reference

### Analytics Endpoints
| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `/api/analytics/revenue` | Admin/Manager | Revenue analytics summary |
| `/api/analytics/operations` | Admin/Manager | Operational analytics summary |
| `/api/analytics/customers` | Admin/Manager | Customer analytics summary |
| `/api/analytics/revenue-trend` | Admin/Manager or `canAccessRevenueTrends` | Monthly revenue trend data |
| `/api/analytics/contract-volume` | Admin/Manager | Contract volume trends |
| `/api/analytics/fleet-status` | Authenticated | Fleet status distribution |
| `/api/analytics/geographic-distribution` | Authenticated | Geographic distribution data |
| `/api/analytics/pending-actions` | Authenticated | Pending action counts |
| `/api/analytics/top-performers` | Authenticated | Top performing vehicles and staff |

### Report Endpoints
| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `/api/reports/financial` | Admin/Manager or `canAccessFinancialReports` | Financial report data |
| `/api/contracts/unclosed-alerts` | Admin/Manager | Unclosed contracts list |

---

## Permission Best Practices

### For Administrators
- **Admin and Manager roles bypass ALL granular permissions** - They always have full access to all reports regardless of permission flags
- Use granular permissions to grant specific report access to Staff and Viewer roles
- Group permissions logically: Analytical Reports vs Standard Reports
- Consider business role when assigning: 
  - Sales staff: Customer Reports, Operational Reports
  - Finance staff: Financial Reports, Collection Performance
  - Operations staff: Fleet Performance, Operational Reports

### For Users
- Respect data privacy: Only access reports relevant to your role
- Report any unauthorized access attempts to administrators
- Contact your manager if you need additional report access

---

## Future Enhancements

### Planned Features
1. **Predictive Analytics**: Machine learning models for demand forecasting, maintenance prediction
2. **Mobile Dashboard**: Native iOS/Android apps for on-the-go monitoring
3. **Custom Report Builder**: Drag-and-drop interface for creating ad-hoc reports
4. **Scheduled Reports**: Email delivery of reports on a schedule
5. **Data Export**: Excel/CSV export for all reports
6. **Report Sharing**: Share report snapshots with external stakeholders

### Under Consideration
- Integration with external accounting systems (QuickBooks, Xero)
- Integration with fleet telematics providers
- Real-time notifications for critical alerts
- Advanced data visualization options (heatmaps, geographic maps)
- Multi-currency support
- Multi-company/franchise support

---

## Document History
- **v1.0** (2025-11-16): Initial comprehensive feature catalog
- Includes granular permission system documentation
- New dashboard analytics cards documented
- Report permission structure clarified

---

*For technical implementation details, see `/docs/TECHNICAL_ARCHITECTURE.md`*  
*For permission setup, see `/docs/ADMIN_GUIDE.md`*  
*For dashboard user guide, see `/docs/DASHBOARD_GUIDE.md`*
