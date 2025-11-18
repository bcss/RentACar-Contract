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

## Specialized Operational Modules

### 11. Toll Management System
**Access Level**: Staff and above  
**Route**: `/toll-management`  
**Data Source**: `/api/toll-systems`, `/api/toll-gates`, `/api/toll-passes`  

**Features**:
- Complete UAE toll system integration (Salik, Darb, Aber)
- Toll system master data (system name, operator, active status)
- Gate-level tracking with individual pricing
- Vehicle toll pass assignment and management
- Automatic fee assignment to contracts
- Billing integration

**Business Value**: Accurate toll expense tracking, automated billing, compliance with UAE RTA requirements

### 12. Traffic Fines & Violations
**Access Level**: Staff and above  
**Route**: `/traffic-fines`  
**Data Source**: `/api/traffic-fines`  

**Features**:
- RTA-compliant traffic violation tracking
- Black points management (cumulative tracking)
- Fine status tracking (Pending, Paid, Disputed, Waived)
- Payment tracking with receipt documentation
- Vehicle and contract linkage
- Driver accountability assignment
- Document attachments (fine notices, receipts)

**Business Value**: RTA compliance, customer billing accuracy, driver performance tracking, legal documentation

### 13. Accidents & Incidents Management
**Access Level**: Manager and above  
**Route**: `/incidents`  
**Data Source**: `/api/incidents`  

**Features**:
- Comprehensive incident tracking
- Incident type classification (Minor Accident, Major Accident, Theft, Vandalism, etc.)
- Insurance claim integration
- Police report documentation
- Cost estimation (repair + liability)
- Fault party determination
- Vehicle and contract linkage
- Claim progress updates

**Business Value**: Risk management, insurance claim processing, legal protection, cost recovery

### 14. Fleet Maintenance & Service
**Access Level**: Staff and above  
**Route**: `/vehicle-maintenance`  
**Data Source**: `/api/vehicle-service-records`  

**Features**:
- Complete maintenance history per vehicle
- Service type tracking (Oil Change, Tire Replacement, Brake Service, etc.)
- Odometer tracking at service time
- Service cost logging
- Next service scheduling based on km or date
- Depreciation tracking
- Service provider documentation
- Preventive maintenance alerts

**Business Value**: Fleet health optimization, cost control, downtime reduction, asset value preservation

### 15. Rental Rate Plans (Dynamic Pricing)
**Access Level**: Manager and above  
**Route**: `/rental-rate-plans`  
**Data Source**: `/api/rental-rate-plans`  

**Features**:
- Dynamic pricing system
- Rate plan creation (daily/weekly/monthly rates)
- Seasonal pricing variations
- Promotional discount configuration
- Vehicle category-specific rates
- Date range applicability
- Priority ordering for rate selection
- Automatic rate application to contracts

**Business Value**: Revenue optimization, competitive pricing, promotional flexibility, market adaptation

### 16. Vehicle Accessories & Upsell
**Access Level**: Staff and above  
**Route**: `/vehicle-accessories`  
**Data Source**: `/api/vehicle-accessories`, `/api/contract-accessories`  

**Features**:
- Master accessory catalog
- Accessory types (GPS, Baby Seat, Insurance, Additional Driver, etc.)
- Inventory tracking (quantity available/assigned)
- Per-day or fixed pricing
- Contract-level accessory assignment
- Automatic charge calculation
- Availability validation
- Upsell revenue tracking

**Business Value**: Additional revenue streams, customer convenience, inventory management

### 17. Driver Service Module
**Access Level**: Staff and above  
**Routes**: `/drivers`, `/driver-companies`, `/driver-scheduling`  
**Data Sources**: Multiple driver-related endpoints  

**Features**:
- Professional driver master data (bilingual)
- Driver licensing and certification tracking
- Employment type (In-House vs Outsourced)
- Outsource company management
- Driver availability status (Available, On Assignment, Off Duty, On Leave)
- Rate cards (hourly/daily/monthly pricing)
- Schedule management with shift blocks
- Check-in/check-out attendance tracking
- Overtime calculation
- Contract-level driver assignments
- Public holiday surcharge calculation (UAE market compliance)
- Driver performance tracking
- Cost vs revenue analysis

**Business Value**: Professional driver service offering, additional revenue stream, UAE market differentiation, operational efficiency

### 18. Branch Management System
**Access Level**: Manager and above  
**Routes**: `/branches`, `/vehicle-transfers`  
**Data Sources**: `/api/branches`, `/api/branch-transfers`  

**Features**:
- Multi-location branch master data
- Branch hierarchy (HQ vs Branch)
- Inter-branch vehicle transfer workflow
- Transfer request creation
- Approval workflow (Manager/Admin approval required)
- Transfer status tracking (Requested → Approved → In Transit → Completed)
- Transfer rejection with reason
- Branch-scoped RBAC (Staff/Manager see only their branch)
- Branch performance analytics
- Vehicle allocation optimization

**Business Value**: Multi-location operations support, fleet optimization, operational flexibility, regional expansion capability

### 19. Public Holidays Management
**Access Level**: Admin only  
**Route**: `/public-holidays`  
**Data Source**: `/api/public-holidays`  

**Features**:
- UAE public holiday configuration
- Emirate-specific holiday selection (National vs Emirate-specific)
- All 7 emirates supported (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah)
- Holiday type classification (National, Emirate-Specific, Religious)
- Date configuration
- Bilingual holiday names
- Driver service surcharge integration
- Contract calculation integration

**Business Value**: Driver service compliance, accurate pricing, UAE market alignment, customer transparency

### 20. Document Registry & Management
**Access Level**: Staff and above  
**Route**: `/document-registry`  
**Data Source**: `/api/documents`  

**Features**:
- Centralized document tracking
- Intelligent auto-seeding from 8+ entity types
- Document types (License, Insurance, Registration, ID, Contract, etc.)
- Entity linkage (Customer, Vehicle, Driver, Sponsor, Company, etc.)
- Expiry date tracking
- Automated expiry monitoring (30-day alerts via cron job)
- Document verification workflow
- Status tracking (Valid, Expiring Soon, Expired)
- Renewal reminder automation
- Audit trail for document updates

**Business Value**: Compliance management, risk mitigation, automated alerts, operational efficiency

### 21. Customer Risk Scoring
**Access Level**: Manager and above  
**Route**: `/customer-risk-scoring`  
**Data Source**: `/api/customer-risk-scores`, `/api/automation/high-risk-customers`  

**Features**:
- Production-ready hybrid risk algorithm
- Automated nightly calculation (2 AM cron job)
- Risk categories (Low, Medium, High, Critical)
- Multi-factor scoring:
  - Payment history analysis
  - Contract violation tracking
  - Incident/accident history
  - Traffic fine compliance
  - Document validity
  - Identity verification
- Escalation overrides for severe issues
- Historical risk score tracking
- Trend analysis over time
- High-risk customer alerts
- Manual risk override capability

**Business Value**: Risk mitigation, informed decision-making, credit policy enforcement, loss prevention

### 22. Approval Workflows
**Access Level**: Varies by workflow  
**Route**: `/approval-workflows`  
**Data Sources**: `/api/approval-requests`, `/api/approval-logs`  

**Features**:
- Multi-level authorization system
- Approval request creation for high-value transactions
- Request types (Campaign, Contract Modification, Vehicle Transfer, etc.)
- Approval routing based on role and amount thresholds
- Approval/rejection with mandatory reason
- Status tracking (Pending → Approved/Rejected)
- Approval logs audit trail
- Email/SMS notification integration
- Escalation for overdue approvals

**Business Value**: Financial control, fraud prevention, accountability, compliance

---

## Communications Platform (Phase 3)

### 23. Communication Providers Management
**Access Level**: Admin only  
**Route**: `/communication-providers`  
**Data Source**: `/api/communication-providers`  

**Features**:
- Multi-provider SMS/Email configuration
- Supported SMS Providers: Twilio (primary), Mock (testing)
- Supported Email Providers: SendGrid (primary), Gmail SMTP (fallback), Mock (testing)
- Provider priority ordering (primary/fallback)
- Health monitoring and circuit breaking
- Provider credentials management
- Active/inactive status control
- Automatic failover on provider failure
- Cost tracking per provider

**Business Value**: Communication reliability, cost optimization, vendor independence, fault tolerance

### 24. Communication Logs
**Access Level**: Manager and above  
**Route**: `/communication-logs`  
**Data Source**: `/api/communication-logs`  

**Features**:
- Complete delivery tracking
- Communication type (Email, SMS)
- Delivery status (Pending, Sent, Delivered, Failed, Bounced)
- Provider used for delivery
- Recipient information
- Message content logging
- Error tracking and retry attempts
- Timestamp tracking
- Cost per communication
- Filtering by status, type, date range
- Resend failed communications

**Business Value**: Delivery accountability, troubleshooting, audit trail, cost analysis

### 25. Notification Templates
**Access Level**: Manager and above  
**Route**: `/automated-reminders`  
**Data Source**: `/api/notification-templates`  

**Features**:
- 12 default bilingual reminder templates
- Template categories (Transactional, Promotional, Reminder, Alert)
- Email and SMS channel support
- Template variables/placeholders (customer name, contract number, etc.)
- Bilingual content (English + Arabic)
- Template activation/deactivation
- Channel preferences per template (email/SMS/both)
- Cost-per-send configuration
- Template performance analytics
- System-managed vs user-managed templates

**Business Value**: Communication consistency, personalization, bilingual support, operational efficiency

### 26. Manual Notification Sender
**Access Level**: Manager and above  
**Route**: `/manual-notification-sender`  
**Data Source**: `/api/notifications/send`  

**Features**:
- Ad-hoc notification sending
- Template selection or custom message
- Recipient selection (individual or bulk)
- Channel selection (Email/SMS/Both)
- Preview before sending
- Send confirmation
- Immediate delivery
- Testing tool for template validation
- Cost estimation before send

**Business Value**: Operational flexibility, urgent communications, testing capability, customer service

### 27. Campaign Management System (Phase 4)
**Access Level**: Staff and above (RBAC-enforced)  
**Route**: `/campaign-management`  
**Data Sources**: `/api/campaigns`, `/api/campaigns/estimate-recipients`  

**Features**:
- RBAC-enforced campaign creation:
  - Staff: Branch-scoped only, auto-require approval
  - Manager: Branch-scoped only, optional approval
  - Admin: Organization-wide, multi-branch selection, optional approval
- Campaign status workflow (Draft → Pending Approval → Approved → Sent)
- Recipient filtering:
  - Customer segments (active, repeat, high-value)
  - Contract status (active, completed)
  - Risk level filtering
  - Location/branch filtering
  - Custom date ranges
- Channel selection (Email/SMS/Both)
- Recipient count estimation
- Delivery tracking:
  - Total recipients
  - Successful deliveries
  - Failed deliveries
  - Bounce/unsubscribe tracking
- Cost estimation and budgeting
- Campaign scheduling (immediate or scheduled)
- Bilingual campaign creation (English/Arabic)
- Campaign templates
- Campaign approval workflow integration
- Campaign analytics and ROI tracking

**Business Value**: Marketing automation, customer engagement, revenue generation, targeted communications, RBAC compliance

---

## Predictive Intelligence Reports (Phase 5 - Fully Bilingual)

### 28. Revenue Forecast Report
**Access Level**: Manager and above  
**Route**: `/reports/revenue-forecast`  
**Data Source**: `/api/reports/revenue-forecast`  

**Features**:
- ML-based revenue predictions
- Time-series forecasting with trend analysis
- Confidence intervals (upper/lower bounds)
- Historical revenue comparison
- Seasonal pattern detection
- Revenue component breakdown (rental fees, extras, drivers)
- Filters: Date ranges, branches, vehicle types
- Recharts visualizations (line charts with confidence bands)
- CSV export with localized headers
- Summary statistics cards
- Warning thresholds for revenue targets
- Fully bilingual (English/Arabic)
- RTL/LTR layout support

**Business Value**: Strategic planning, budget forecasting, growth targets, investment decisions

### 29. Fleet Utilization Forecast
**Access Level**: Manager and above  
**Route**: `/reports/fleet-utilization-forecast`  
**Data Source**: `/api/reports/fleet-utilization-forecast`  

**Features**:
- Capacity planning predictions
- Vehicle type utilization forecasting
- Occupancy rate trends
- Peak demand identification
- Vehicle acquisition recommendations
- Utilization optimization suggestions
- Filters: Date ranges, vehicle types, branches
- Recharts visualizations (bar and line charts)
- CSV export with localized headers
- Fully bilingual (English/Arabic)
- RTL/LTR layout support

**Business Value**: Fleet optimization, acquisition planning, capacity management, cost reduction

### 30. Customer Churn Risk Report
**Access Level**: Manager and above  
**Route**: `/reports/customer-churn-risk`  
**Data Source**: `/api/reports/customer-churn-risk`  

**Features**:
- Customer churn probability predictions
- Risk scoring (Low, Medium, High, Critical)
- Payment history analysis
- Rental frequency trends
- Customer lifetime value calculation
- Churn factors identification
- Retention recommendations
- Filters: Risk levels, customer segments, date ranges
- Recharts visualizations (pie and bar charts)
- CSV export with localized headers
- Fully bilingual (English/Arabic)
- RTL/LTR layout support

**Business Value**: Customer retention, loyalty programs, proactive engagement, revenue protection

### 31. Maintenance Cost Forecast
**Access Level**: Manager and above  
**Route**: `/reports/maintenance-cost-forecast`  
**Data Source**: `/api/reports/maintenance-cost-forecast`  

**Features**:
- Vehicle age/mileage-based cost predictions
- Service history pattern analysis
- Annual cost projections
- Budget planning insights
- Vehicle replacement recommendations
- Maintenance schedule optimization
- Filters: Date ranges, vehicle types, age ranges
- Recharts visualizations (line and scatter charts)
- CSV export with localized headers
- Fully bilingual (English/Arabic)
- RTL/LTR layout support

**Business Value**: Budget planning, fleet replacement strategy, cost control, asset management

### 32. Payment Default Prediction
**Access Level**: Manager and above  
**Route**: `/reports/payment-default-prediction`  
**Data Source**: `/api/reports/payment-default-prediction`  

**Features**:
- Overdue payment risk analysis
- Customer payment behavior patterns
- Default probability per contract
- Collection priority recommendations
- Payment delay trend analysis
- Risk-based collection strategies
- Filters: Risk levels, payment methods, date ranges
- Recharts visualizations (donut and bar charts)
- CSV export with localized headers
- Fully bilingual (English/Arabic)
- RTL/LTR layout support

**Business Value**: Cash flow optimization, bad debt reduction, collection efficiency, credit policy refinement

### 33. Location Demand Forecast
**Access Level**: Manager and above  
**Route**: `/reports/location-demand-forecast`  
**Data Source**: `/api/reports/demand-forecast`  

**Features**:
- Emirate-based demand trends (all 7 UAE emirates)
- Geographic demand patterns
- Seasonal demand forecasting
- Location-specific recommendations
- Branch expansion insights
- Vehicle allocation optimization
- Filters: Date ranges, emirates, vehicle types
- Recharts visualizations (map-style bar charts)
- CSV export with localized headers
- Fully bilingual (English/Arabic) including emirate names
- RTL/LTR layout support

**Business Value**: Regional expansion planning, resource allocation, market penetration, competitive positioning

---

## Automation & Background Jobs

### 34. Automation Orchestrator
**Access Level**: System (Background Jobs)  
**Implementation**: `server/services/automationOrchestrator.ts`  

**Active Cron Jobs:**

1. **Nightly Risk Score Calculation** - Daily at 2:00 AM
   - Recalculates risk scores for all active customers
   - Updates customer_risk_scores table
   - Triggers elevated risk notifications

2. **Document Expiry Check** - Daily at 8:00 AM
   - Scans document_registry for documents expiring within 30 days
   - Creates automated reminder entries
   - Triggers notifications to responsible parties

3. **Contract Expiry Reminders** - Daily at 9:00 AM
   - Identifies contracts expiring in 7 days
   - Sends customer notifications
   - Logs reminder delivery

4. **Payment Due Reminders** - Daily at 10:00 AM
   - Identifies overdue payments
   - Sends payment reminder notifications
   - Tracks reminder delivery status

**Manual Triggers:**
- `POST /api/automation/calculate-risk-scores` - On-demand risk calculation
- `POST /api/automation/seed-documents` - Document auto-seeding
- `POST /api/automation/seed-notification-templates` - Template seeding

**Business Value**: Operational automation, proactive notifications, compliance management, customer service

---

## Implemented Features (Previously "Future")

### ✅ Completed Features

1. **✅ Predictive Analytics** - COMPLETE (6 predictive intelligence reports implemented)
2. **✅ Data Export** - COMPLETE (CSV export on all reports with bilingual support)
3. **✅ Real-time Notifications** - COMPLETE (11 automated notification touchpoints)
4. **✅ Advanced Data Visualization** - COMPLETE (Recharts integration across all reports)

### 🔜 Planned Features

1. **Mobile Dashboard**: Native iOS/Android apps for on-the-go monitoring
2. **Custom Report Builder**: Drag-and-drop interface for creating ad-hoc reports
3. **Scheduled Reports**: Email delivery of reports on a schedule
4. **Report Sharing**: Share report snapshots with external stakeholders

### Under Consideration

- Integration with external accounting systems (QuickBooks, Xero)
- Integration with fleet telematics providers
- Real-time GPS tracking for fleet
- Multi-currency support (currently AED only)
- Multi-company/franchise support
- Mobile app for customers (self-service portal)
- Online booking and reservation system

---

## Authoritative Documentation

This features catalog should be read in conjunction with:
- **replit.md** - Authoritative source for system architecture, user preferences, and technical decisions
- **MASTER_FEATURE_LIST.md** - Comprehensive feature inventory (63 tables, 120+ endpoints, 66 pages)

For any discrepancies, replit.md and MASTER_FEATURE_LIST.md take precedence.

---

## Document History

- **v1.0** (2025-11-16): Initial comprehensive feature catalog
  - Granular permission system documentation
  - New dashboard analytics cards documented
  - Report permission structure clarified

- **v2.0** (2025-11-18): Major update with Phase 4 & 5 implementation
  - Added 23 specialized operational modules
  - Added Communications Platform (Phase 3)
  - Added Campaign Management System (Phase 4)
  - Added 6 Predictive Intelligence Reports (Phase 5)
  - Added Automation Orchestrator documentation
  - Updated "Future Enhancements" to reflect completed features
  - Cross-reference to updated MASTER_FEATURE_LIST.md (63 tables, 120+ endpoints, 66 pages)

---

*For technical implementation details, see `/docs/TECHNICAL_DOCUMENTATION.md`*  
*For permission setup, see `/docs/ADMIN_GUIDE.md`*  
*For dashboard user guide, see `/docs/USER_GUIDE.md`*
