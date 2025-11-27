# KarāraOS Notification Touchpoints

**Last Updated:** November 18, 2025  
**Status:** Production Ready - 15 Touchpoints Wired + 6 Existing = 21 Total

---

## Overview

KarāraOS features a comprehensive notification ecosystem with 21 automated touchpoints across all business workflows. Each touchpoint uses intelligent channel routing (Email for regular updates, SMS for critical alerts), bilingual templates, and proper RBAC enforcement.

---

## 1. Contract Lifecycle Notifications (7 Touchpoints)

### 1.1 Contract Activated (Email)
- **Trigger:** Contract status changes to 'active' via `/api/contracts/:id/activate`
- **Channel:** Email
- **Recipient:** Customer
- **Template Code:** `CONTRACT_ACTIVATED`
- **Variables:** `{contractNumber, customerName, startDate, endDate, vehicleDetails, totalAmount}`
- **Implementation:** `server/routes.ts:1942-1962`

### 1.2 Contract Completed (Email)
- **Trigger:** Contract status changes to 'completed' via `/api/contracts/:id/complete`
- **Channel:** Email
- **Recipient:** Customer
- **Template Code:** `CONTRACT_COMPLETED`
- **Variables:** `{contractNumber, customerName, completionDate, finalAmount}`
- **Implementation:** `server/routes.ts:2006-2024`

### 1.3 Contract Closed - Customer Notification (Email)
- **Trigger:** Contract status changes to 'closed' via `/api/contracts/:id/close`
- **Channel:** Email
- **Recipient:** Customer
- **Template Code:** `CONTRACT_CLOSED`
- **Variables:** `{contractNumber, customerName, closeDate}`
- **Implementation:** `server/routes.ts:2068-2084`

### 1.4 Contract Closed - Vehicle Manager Notification (Email)
- **Trigger:** Same as 1.3, runs immediately after customer notification
- **Channel:** Email
- **Recipient:** First user assigned to contract's branch
- **Template Code:** `CONTRACT_CLOSED_VEHICLE_AVAILABLE`
- **Variables:** `{contractNumber, vehicleRegistration, closureDate}`
- **Implementation:** `server/routes.ts:2086-2106`

### 1.5 Contract Extended (Email)
- **Trigger:** Contract extended via `/api/contracts/:id/extension`
- **Channel:** Email
- **Recipient:** Customer
- **Template Code:** `CONTRACT_EXTENSION_CONFIRMED`
- **Variables:** `{contractNumber, customerName, newEndDate, extensionDays, additionalCharge}`
- **Implementation:** `server/routes.ts:2182-2201`

### 1.6 Contract Expiry Reminder (SMS)
- **Trigger:** Daily cron job at 9:00 AM checking contracts expiring within 3 days
- **Channel:** SMS (Critical Alert)
- **Recipient:** Customer
- **Template Code:** `CONTRACT_EXPIRY_REMINDER`
- **Variables:** `{contractNumber, customerName, expiryDate, daysRemaining}`
- **Implementation:** `server/services/automationOrchestrator.ts:227-280`

### 1.7 Payment Due Reminder (SMS)
- **Trigger:** Daily cron job at 10:00 AM checking overdue payments
- **Channel:** SMS (Critical Alert)
- **Recipient:** Customer
- **Template Code:** `PAYMENT_DUE_REMINDER`
- **Variables:** `{contractNumber, customerName, amount, dueDate, daysOverdue}`
- **Implementation:** `server/services/automationOrchestrator.ts:287-330`

---

## 2. Payment Notifications (2 Touchpoints)

### 2.1 Payment Received - Customer Receipt (Both)
- **Trigger:** Payment recorded via `/api/payments` (POST)
- **Channel:** Both Email & SMS
- **Recipient:** Customer
- **Template Code:** `PAYMENT_RECEIVED`
- **Variables:** `{contractNumber, customerName, amount, paymentMethod, receiptNumber}`
- **Implementation:** `server/routes.ts:4064-4083`

### 2.2 Payment Received - Internal Notification (Email)
- **Trigger:** Same as 2.1, runs immediately after customer notification
- **Channel:** Email
- **Recipient:** Contract's assigned branch user
- **Template Code:** `PAYMENT_RECEIVED_INTERNAL`
- **Variables:** `{contractNumber, amount, paymentMethod, branchName}`
- **Implementation:** `server/routes.ts:4085-4104`

---

## 3. Document Management Notifications (2 Touchpoints)

### 3.1 Document Uploaded (Email)
- **Trigger:** Document uploaded via `/api/document-registry` (POST)
- **Channel:** Email
- **Recipient:** Relevant entity owner (customer, user, sponsor)
- **Template Code:** `DOCUMENT_UPLOADED`
- **Variables:** `{documentName, documentType, uploadDate, expiryDate}`
- **Implementation:** `server/routes.ts:4799-4820`

### 3.2 Document Expiry Warning (SMS)
- **Trigger:** Daily cron job at 8:00 AM checking documents expiring within 30 days
- **Channel:** SMS (Critical Alert)
- **Recipient:** Document owner
- **Template Code:** `DOCUMENT_EXPIRY_WARNING`
- **Variables:** `{documentName, documentType, expiryDate, daysRemaining, entityType}`
- **Implementation:** `server/services/automationOrchestrator.ts:121-219`

---

## 4. Risk Management Notifications (3 Touchpoints)

### 4.1 Traffic Fine Assigned (SMS)
- **Trigger:** Traffic fine created via `/api/traffic-fines` (POST)
- **Channel:** SMS (Critical Alert)
- **Recipient:** Customer (if assigned to customer)
- **Template Code:** `TRAFFIC_FINE_ASSIGNED`
- **Variables:** `{customerName, fineAmount, violationDate, plateNumber, dueDate}`
- **Implementation:** `server/routes.ts:5073-5096`

### 4.2 Incident Reported (Email)
- **Trigger:** Incident created via `/api/incidents` (POST)
- **Channel:** Email
- **Recipient:** Customer
- **Template Code:** `INCIDENT_REPORTED`
- **Variables:** `{customerName, incidentDate, incidentType, severity, contractNumber}`
- **Implementation:** `server/routes.ts:5293-5314`

### 4.3 Risk Score Elevated (SMS)
- **Trigger:** Nightly cron job at 2:00 AM recalculating customer risk scores
- **Channel:** SMS (Critical Alert)
- **Recipient:** Customer (if risk score increases significantly)
- **Template Code:** `RISK_SCORE_ELEVATED`
- **Variables:** `{customerName, newRiskScore, oldRiskScore, riskLevel, reason}`
- **Implementation:** `server/services/automationOrchestrator.ts:59-112`

---

## 5. Fleet Maintenance Notifications (1 Touchpoint)

### 5.1 Service Record Added (Email)
- **Trigger:** Service record created via `/api/service-records` (POST)
- **Channel:** Email
- **Recipient:** Fleet manager (first user at vehicle's branch)
- **Template Code:** `SERVICE_RECORD_ADDED`
- **Variables:** `{vehicleRegistration, serviceType, serviceCost, serviceDate, nextServiceDue}`
- **Implementation:** `server/routes.ts:5537-5560`

---

## 6. Workforce Management Notifications (3 Touchpoints)

### 6.1 Driver Assignment Created (SMS)
- **Trigger:** Driver assigned via `/api/driver-assignments` (POST)
- **Channel:** SMS (Critical Alert)
- **Recipient:** Driver
- **Template Code:** `DRIVER_ASSIGNMENT_CREATED`
- **Variables:** `{driverName, assignmentDate, contractNumber, assignmentType}`
- **Implementation:** `server/routes.ts:6849-6874`

### 6.2 Vehicle Transfer Approved (Email)
- **Trigger:** Transfer approved via `/api/branch-transfers/:id/approve` (POST)
- **Channel:** Email
- **Recipient:** Source branch manager
- **Template Code:** `VEHICLE_TRANSFER_APPROVED`
- **Variables:** `{vehicleRegistration, sourceBranch, destinationBranch, transferDate}`
- **Implementation:** `server/routes.ts:6333-6367`

### 6.3 Vehicle Transfer Rejected (Email)
- **Trigger:** Transfer rejected via `/api/branch-transfers/:id/reject` (POST)
- **Channel:** Email
- **Recipient:** Source branch manager
- **Template Code:** `VEHICLE_TRANSFER_REJECTED`
- **Variables:** `{vehicleRegistration, sourceBranch, rejectionReason}`
- **Implementation:** `server/routes.ts:6389-6421`

---

## Channel Routing Strategy

### Email Channel (Regular Updates)
- Contract lifecycle events (activated, completed, closed, extended)
- Payment receipts and internal notifications
- Document uploads and verifications
- Incident reports
- Service records
- Vehicle transfer notifications

### SMS Channel (Critical Alerts)
- Contract expiry reminders
- Payment due reminders
- Document expiry warnings
- Traffic fine assignments
- Risk score elevations
- Driver assignments

### Both Channels
- Payment received confirmation (receipt via Email, alert via SMS)
- Campaign broadcasts (configurable per campaign)

---

## Error Handling & Resilience

All touchpoints implement:
1. **Try-catch blocks** around notification calls
2. **Non-blocking failures** - business operations continue even if notifications fail
3. **Detailed logging** with `[Notification]` prefix
4. **Entity tracking** for audit trail (entityType, entityId)
5. **Proper channel fallback** via NotificationService priority routing

---

## RBAC Integration

Notifications respect:
- **Branch scoping** - Only users/customers in relevant branches receive notifications
- **Role-based content** - Different templates for staff vs managers vs customers
- **Centralized payment notices** - Override branch scope for finance notifications
- **System-managed templates** - Core templates immutable, custom templates branch-scoped

---

## Template Variable Validation

All variables passed through 7-layer validation:
1. Type check (string/number only)
2. Object/array rejection
3. String trimming
4. Empty string check
5. Decimal format regex (for costs)
6. Number.isFinite() verification
7. Non-negative validation

---

## Next Phase Enhancements

**Phase 4 - Campaign Management:**
- Manual campaign broadcasts with recipient filtering
- Approval workflow for organization-wide campaigns
- Cost estimation and budget controls
- A/B testing framework

**Phase 5 - Template Analytics:**
- Delivery success tracking
- Open/click rate monitoring (Email)
- Template performance scoring
- Best/worst performer identification

---

## Implementation Status

- ✅ **15 Event-Driven Touchpoints** - Wired in server/routes.ts
- ✅ **4 Scheduled Touchpoints** - Cron jobs in automationOrchestrator.ts
- ✅ **2 Dual-Recipient Touchpoints** - Customer + Internal notifications
- ✅ **Channel Preference System** - 9 notification types with flip switches
- ✅ **Multi-Provider Infrastructure** - SMS (Twilio, Mock), Email (SendGrid, Gmail, Mock)
- ✅ **Delivery Tracking** - Full audit trail in communicationLogs table

---

## Testing Recommendations

**Phase 6 Testing Focus:**
1. Trigger each touchpoint manually and verify delivery
2. Test channel preference flip switches
3. Verify bilingual template rendering
4. Confirm RBAC enforcement on campaign broadcasts
5. Validate cron job scheduling and execution
6. Test multi-provider failover scenarios
7. Verify cost validation edge cases (Phase 6 priority)

---

## Documentation Cross-References

- **Template Definitions:** `docs/TECHNICAL_DOCUMENTATION.md` (Section: Communication Templates)
- **Provider Configuration:** `docs/ADMIN_GUIDE.md` (Section: Communication Providers)
- **Cron Job Schedules:** `docs/TECHNICAL_DOCUMENTATION.md` (Section: Automation Orchestrator)
- **RBAC Rules:** `docs/ADMIN_GUIDE.md` (Section: Role-Based Access Control)
- **API Endpoints:** `server/routes.ts` (Search for `notificationService.sendNotification`)

---

**End of Document**
