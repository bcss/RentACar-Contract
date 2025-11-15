# 🚗 RCCMS Mobile App – Refined Features List (v2026)

**System:** RCCMS – Rental Car Contract Management System  
**Scope:** Features Only (Staff App, Customer App, Dashboard)  
**Prepared By:** AKN Consulting  
**Version:** 2026.01-FEATURES  
**Status:** Feature List Ready for Procedures Definition

---

## 📋 DOCUMENT STRUCTURE

- **SECTION 1:** Staff Mobile App Features
- **SECTION 2:** Customer Mobile App Features  
- **SECTION 3:** Web Dashboard Features
- **SECTION 4:** Feature Boundary Matrix
- **SECTION 5:** Summary

---

---

## 1. 📱 STAFF MOBILE APP FEATURES

### Authentication & Access
- ✅ Login with admin-provisioned credentials
- ✅ Role-based access (Inspector, Operations Manager, Branch Manager)
- ✅ Password reset via OTP/email
- ✅ Auto-logout after inactivity

### Vehicle Inspections
- ✅ Pre-delivery inspection workflow
- ✅ Post-return inspection workflow
- ✅ Capture 6 mandatory photos (front, back, left, right, top, dashboard)
- ✅ Auto-compress photos to 1920×1080 max
- ✅ Add bilingual notes to inspections
- ✅ Submit inspections with GPS timestamp

### Damage & Accident Reporting
- ✅ Record new damage events
- ✅ Record accident events
- ✅ Capture accident photos
- ✅ Upload police/insurance documents
- ✅ Select accident severity (Minor / Moderate / Major)
- ✅ Link incidents to contract ID automatically
- ✅ View incident history timeline per contract

### Fines & Violations
- ✅ Upload RTA fines
- ✅ Upload police fines
- ✅ Upload violation documents (PDF/JPEG/PNG)
- ✅ Tag vehicle registration number
- ✅ Tag branch location
- ✅ Add notes/comments

### Fuel & Odometer Readings
- ✅ Enter fuel level (% or liters)
- ✅ Enter odometer reading
- ✅ Upload photo proof if needed
- ✅ Submit readings before activation (pre-delivery)
- ✅ Submit readings before completion (post-return)

### Search & Navigation
- ✅ Search contracts by Contract ID
- ✅ Search contracts by Vehicle Registration
- ✅ View assigned contracts list
- ✅ View incident tracker (accidents, damages, fines)
- ✅ View inspection history per vehicle

### Document Management
- ✅ Upload photos (camera or file)
- ✅ Upload PDFs
- ✅ Upload PNGs
- ✅ Auto-rename files by contract ID + timestamp

### Location & Consent
- ✅ GPS capture with photos/uploads (optional)
- ✅ Request location consent before first use
- ✅ Allow staff to disable location anytime

### Notifications
- ✅ Receive push notifications for assigned inspections
- ✅ Receive push notifications for overdue returns
- ✅ Receive push notifications for missing documentation
- ✅ Receive email notifications

### Language & Accessibility
- ✅ English/Arabic bilingual interface
- ✅ RTL/LTR automatic layout switching
- ✅ Accessible text contrast (WCAG AA)
- ✅ Clear iconography

### Connectivity
- ✅ Require internet connection (no offline mode)
- ✅ Show error message if connection lost
- ✅ Auto-retry failed uploads (3 attempts)
- ✅ Manual "Retry" button for failed uploads

---

---

## 2. 📲 CUSTOMER MOBILE APP FEATURES

### Authentication & Access
- ✅ Login with admin-provisioned credentials
- ✅ Password reset via OTP/email
- ✅ Biometric unlock (fingerprint/face ID) – optional
- ✅ Auto-logout after inactivity

### View Rentals
- ✅ View active rentals
- ✅ View upcoming rentals
- ✅ View closed/past rentals
- ✅ View rental details (dates, vehicle, terms)
- ✅ View bilingual contracts
- ✅ View pre-delivery inspection photos
- ✅ View post-return inspection photos

### Search & Filter
- ✅ Search rentals by Contract ID
- ✅ Search rentals by Vehicle Registration
- ✅ Search rentals by Date Range
- ✅ Filter by status (Active / Upcoming / Closed / All)
- ✅ Sort rentals (newest first)
- ✅ View recent searches

### Closed Contracts
- ✅ View closed contract details (read-only)
- ✅ View closed contract inspection photos
- ✅ View closed contract incident timeline
- ✅ View settlement status (Settled / Pending)
- ✅ View historical balance information
- ✅ Cannot upload to closed contracts
- ✅ Cannot request renewal on closed contracts

### Renewal Requests
- ✅ Submit renewal request
- ✅ Propose new end date
- ✅ Add optional note with renewal request
- ✅ View renewal request status (Pending / Approved / Declined)
- ✅ View approval reason (if approved)
- ✅ View decline reason (if declined)
- ✅ Resubmit renewal after decline (if temporary)

### Accident Reporting
- ✅ Upload accident photos (auto-compressed)
- ✅ Upload police documents
- ✅ Upload insurance documents
- ✅ Tag incident to contract ID
- ✅ Tag incident date
- ✅ Add notes/comments
- ✅ View submission confirmation

### Fine & Violation Reporting
- ✅ Upload fine screenshots
- ✅ Upload fine PDFs
- ✅ Upload SMS captures
- ✅ Upload traffic violation documents
- ✅ Add comments with fine report
- ✅ View submission confirmation

### Document Management
- ✅ Upload ID/Passport/License
- ✅ Upload Insurance documents
- ✅ Upload License documents
- ✅ Re-upload rejected documents
- ✅ View document rejection reason
- ✅ View document verification status (Pending / Approved / Rejected)
- ✅ Upload general attachments (receipts, correspondence)
- ✅ Auto-rename documents by contract ID + user ID

### View Contract Information
- ✅ View outstanding balance (information only)
- ✅ View incident timeline (accidents, fines, damage)
- ✅ View fuel and odometer readings

### Profile & KYC
- ✅ View/update contact information
- ✅ Upload ID document
- ✅ Upload License document
- ✅ Upload Insurance document
- ✅ View verification status
- ✅ View KYC approval/rejection reason

### Support & Communication
- ✅ WhatsApp integration (deep link)
- ✅ Call hotline (tap-to-call)
- ✅ GPS-based nearest branch suggestion
- ✅ Create support tickets
- ✅ Select ticket category (Accident / Fine / Renewal / Other)
- ✅ View ticket status

### Notifications
- ✅ Receive push notifications for rental return reminders
- ✅ Receive push notifications for renewals
- ✅ Receive push notifications for fine alerts
- ✅ Receive push notifications for document expiry (30 days before)
- ✅ Receive email notifications
- ✅ Receive SMS alerts (optional)

### Language & Accessibility
- ✅ English/Arabic bilingual interface
- ✅ RTL/LTR automatic layout switching
- ✅ English/Arabic language toggle
- ✅ Accessible text contrast (WCAG AA)
- ✅ Contextual help tooltips
- ✅ Clear iconography

### Connectivity
- ✅ Require internet connection (no offline mode)
- ✅ Show error message if connection lost
- ✅ Auto-retry failed uploads (3 attempts)
- ✅ Manual "Retry" button for failed uploads

---

---

## 3. 📊 WEB DASHBOARD FEATURES (Staff View)

### Real-Time Alerts & Popups
- ✅ Display renewal request pending alerts
- ✅ Display document rejection alerts
- ✅ Display accident report alerts
- ✅ Display overdue return alerts
- ✅ Display pending fine verification alerts
- ✅ Display expiring document alerts (< 7 days)
- ✅ Display high-severity damage alerts (Major incidents)
- ✅ Display multiple accident reports for same contract

### Renewal Request Management
- ✅ View pending renewal requests
- ✅ Approve renewal requests
- ✅ Decline renewal requests with reason
- ✅ Set auto-escalation (24-48 hours)
- ✅ View renewal request history

### Document Management
- ✅ View pending KYC documents
- ✅ Approve KYC documents (ID, License, Insurance)
- ✅ Reject KYC documents with reason
- ✅ View document verification status
- ✅ View document history (all versions)
- ✅ View document expiry alerts

### Accident/Incident Management
- ✅ View accident reports
- ✅ Review damage photos
- ✅ Flag duplicate incidents
- ✅ Escalate major incidents to insurance team
- ✅ View incident timeline per contract
- ✅ Mark incident as resolved

### Fine Management
- ✅ View uploaded fines
- ✅ Verify fines against RTA database
- ✅ Approve fines
- ✅ Flag disputed fines
- ✅ View fine upload history

### Contract Management
- ✅ View all contracts
- ✅ Search contracts by ID
- ✅ Search contracts by vehicle registration
- ✅ View contract status (Active / Closed / Overdue)
- ✅ View contract details
- ✅ View inspection records per contract
- ✅ Mark contract as closed/settled

### Staff Inspection Monitoring
- ✅ View completed inspections
- ✅ View inspection photos
- ✅ View inspection status per vehicle
- ✅ Track inspection completion rate
- ✅ View fuel/odometer readings

### Payment Settlement
- ✅ Record payment received (office transaction)
- ✅ Mark contract as "Settled"
- ✅ View outstanding balance per customer
- ✅ View payment history

### Reports & Analytics
- ✅ View contract status breakdown
- ✅ View renewal approval rate
- ✅ View document rejection reasons
- ✅ View incident frequency
- ✅ View staff productivity (uploads/day)

### User Management
- ✅ View staff members
- ✅ Assign inspections to staff
- ✅ View staff activity logs

### Notifications & Communication
- ✅ Send push notifications to customers (system-generated)
- ✅ Send email notifications to customers
- ✅ View notification history
- ✅ Manually contact customer (if needed)

### Language Support
- ✅ English/Arabic bilingual interface
- ✅ RTL/LTR layout support

---

---

## 4. 🚦 FEATURE BOUNDARY MATRIX

| **Feature/Action** | **Staff App** | **Customer App** | **Dashboard** |
|-----------|-----------|-----------|-----------|
| **Authentication** | | | |
| Login | ✅ | ✅ | N/A |
| Biometric Unlock | ❌ | ✅ (Optional) | N/A |
| | | | |
| **Contract Access** | | | |
| View Assigned Contracts | ✅ | ✅ (Own Only) | ✅ (All) |
| Search Contracts | ✅ | ✅ (Own Only) | ✅ (All) |
| View Contract Details | ✅ | ✅ | ✅ |
| Create Contract | ❌ | ❌ | ✅ (Not Mobile) |
| Close Contract | ❌ | ❌ | ✅ (Not Mobile) |
| | | | |
| **Inspections** | | | |
| Perform Pre-Delivery Inspection | ✅ | ❌ | ❌ |
| Perform Post-Return Inspection | ✅ | ❌ | ❌ |
| Capture 6 Photos | ✅ | ❌ | ❌ |
| View Inspection Photos | ✅ | ✅ | ✅ |
| | | | |
| **Accidents & Damage** | | | |
| Report Accident | ✅ | ✅ | ❌ |
| Upload Accident Photos | ✅ | ✅ | ❌ |
| View Accident Reports | ✅ | ✅ | ✅ |
| Escalate Major Incidents | ❌ | ❌ | ✅ |
| | | | |
| **Fines & Violations** | | | |
| Upload Fine Documents | ✅ | ✅ | ❌ |
| View Fines | ✅ | ✅ | ✅ |
| Verify Fines | ❌ | ❌ | ✅ |
| | | | |
| **Fuel & Odometer** | | | |
| Enter Fuel Reading | ✅ | ❌ | ❌ |
| Enter Odometer Reading | ✅ | ❌ | ❌ |
| View Readings | ✅ | ✅ | ✅ |
| | | | |
| **Documents & KYC** | | | |
| Upload ID/License/Insurance | ✅ | ✅ | ❌ |
| View Documents | ✅ | ✅ | ✅ |
| Approve Documents | ❌ | ❌ | ✅ |
| Reject Documents | ❌ | ❌ | ✅ |
| Add Rejection Reason | ❌ | ❌ | ✅ |
| | | | |
| **Renewals** | | | |
| Submit Renewal Request | ❌ | ✅ | ❌ |
| View Renewal Requests | ✅ | ✅ | ✅ |
| Approve Renewal | ❌ | ❌ | ✅ |
| Decline Renewal | ❌ | ❌ | ✅ |
| | | | |
| **Support & Communication** | | | |
| WhatsApp Link | ✅ | ✅ | ❌ |
| Call Hotline | ✅ | ✅ | ❌ |
| Create Support Ticket | ✅ | ✅ | ❌ |
| | | | |
| **Notifications** | | | |
| Receive Push Alerts | ✅ | ✅ | N/A |
| Send Notifications | ❌ | ❌ | ✅ |
| | | | |
| **Payments** | | | |
| View Outstanding Balance | ❌ | ✅ (Info Only) | ✅ |
| Make Payment | ❌ | ❌ | ❌ (Offline) |
| Record Payment (Office) | ❌ | ❌ | ✅ |
| Mark as Settled | ❌ | ❌ | ✅ |
| | | | |
| **Language Support** | | | |
| English/Arabic | ✅ | ✅ | ✅ |
| RTL/LTR | ✅ | ✅ | ✅ |

---

---

## 5. ✅ SUMMARY

### Staff Mobile App
- **Total Features:** 32
- **Core Capabilities:** Inspections, accident reporting, fine uploads, fuel/odometer entry, document uploads, search

### Customer Mobile App
- **Total Features:** 41
- **Core Capabilities:** View rentals, search contracts, renewal requests, accident/fine reporting, document uploads, profile management, support

### Web Dashboard
- **Total Features:** 28
- **Core Capabilities:** Real-time alerts, renewal management, document approval, incident management, fine verification, contract management, reporting

### Overall System
- **Total Features Across All Apps:** 101
- **Shared Features (All 3):** View contracts, view documents, view incidents, notifications, language support
- **Exclusive to Staff App:** Inspections, fuel/odometer entry
- **Exclusive to Customer App:** Renewal requests, profile/KYC updates
- **Exclusive to Dashboard:** Approvals, escalations, payment settlement, reporting

---

---

## 📝 WHAT'S NEXT

This is the **FEATURES LIST ONLY**.

**Next Phase (Procedures & Processes):**
- How contract lifecycle works (procedure)
- How payment settlement works (procedure)
- How photo validation works (procedure)
- How search algorithm works (procedure)
- How notifications are sent (procedure)
- etc.

**Return to me with:**
- ✅ Any features to ADD
- ✅ Any features to REMOVE
- ✅ Any features to MODIFY

Once features are locked, we create the **Procedures & Implementation Guide** based on these features.

---

**Document prepared by:** AKN Consulting  
📧 rccms@akn-consulting.com   📞 +91 9400750821  
© 2026 AKN Consulting – All Rights Reserved

**Version History:**
- v2026.01-FEATURES: Clean feature list (November 2025)

**Status:** Ready for Feature Refinement
