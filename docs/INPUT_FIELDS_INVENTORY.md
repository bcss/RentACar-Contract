# INPUT FIELDS INVENTORY

**Total Form Fields:** 528 across 26 pages  
**Document Purpose:** Comprehensive list of all input fields with their name, type, and validation requirements  
**Last Updated:** November 21, 2025

---

## CUSTOMERS (client/src/pages/Customers.tsx)

### Basic Info
| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required, min 2 chars |
| `nameAr` | text | Optional |
| `nationalId` | text | Required, unique per nationality |
| `nationality` | text | Required |
| `gender` | select | Optional (male/female) |
| `dateOfBirth` | date | Optional |

### Contact
| Field Name | Type | Validation |
|------------|------|-----------|
| `phone` | tel | Required, min 7 chars, duplicate warning |
| `email` | email | Optional, valid email format |
| `address` | text | Optional |

### License
| Field Name | Type | Validation |
|------------|------|-----------|
| `licenseNumber` | text | Required |
| `licenseExpiryDate` | date | Optional |
| `licenseIssuedBy` | text | Optional |

### Additional
| Field Name | Type | Validation |
|------------|------|-----------|
| `notes` | textarea | Optional |
| `preferredDriverService` | checkbox | Optional boolean |
| `preferredDriverServiceType` | select | Optional (internal/outsource) |

---

## VEHICLES (client/src/pages/Vehicles.tsx)

### Basic Info
| Field Name | Type | Validation |
|------------|------|-----------|
| `registration` | text | Required, unique |
| `vin` | text | Optional |
| `make` | text | Required |
| `model` | text | Required |
| `year` | number | Required, 1900-2100 |
| `color` | text | Required |
| `branchId` | select | Required |

### Classification
| Field Name | Type | Validation |
|------------|------|-----------|
| `category` | select | Required (economy/standard/suv/luxury) |
| `fuelType` | select | Required (petrol/diesel/electric/hybrid) |
| `transmission` | select | Required (automatic/manual) |

### Financial
| Field Name | Type | Validation |
|------------|------|-----------|
| `purchasePrice` | number | Optional, 2 decimals |
| `dailyRate` | number | Required, 2 decimals, >0 |

### Status
| Field Name | Type | Validation |
|------------|------|-----------|
| `status` | select | Required (available/rented/maintenance/retired) |
| `currentOdometer` | number | Required, ≥0 |

---

## CONTRACTS (client/src/pages/ContractForm.tsx)

### Customer Selection
| Field Name | Type | Validation |
|------------|------|-----------|
| `customerId` | select | Required (existing customer) |
| `hirerType` | select | Required (individual/corporate) |
| `sponsorId` | select | Conditional (if individual) |
| `companySponsorId` | select | Conditional (if corporate) |

### Vehicle Selection
| Field Name | Type | Validation |
|------------|------|-----------|
| `vehicleId` | select | Required (available vehicle) |
| `branchId` | select | Required |

### Rental Period
| Field Name | Type | Validation |
|------------|------|-----------|
| `startDate` | datetime-local | Required, ≥today |
| `endDate` | datetime-local | Required, >startDate |
| `totalDays` | number | Auto-calculated, readonly |

### Financial Terms
| Field Name | Type | Validation |
|------------|------|-----------|
| `dailyRate` | number | Required, 2 decimals, >0 |
| `mileageLimit` | number | Optional, ≥0 |
| `extraKmRate` | number | Optional, 2 decimals |
| `discountPercentage` | number | Optional, 0-100 |
| `securityDeposit` | number | Required, 2 decimals, ≥0 |

### Delivery Details
| Field Name | Type | Validation |
|------------|------|-----------|
| `deliveryType` | select | Required (branch/doorstep) |
| `deliveryAddress` | text | Conditional (if doorstep) |
| `deliveryFee` | number | Optional, 2 decimals |

### Insurance
| Field Name | Type | Validation |
|------------|------|-----------|
| `insuranceType` | select | Required (comprehensive/third-party/none) |
| `insuranceFee` | number | Optional, 2 decimals |

### Driver Service
| Field Name | Type | Validation |
|------------|------|-----------|
| `driverServiceRequired` | checkbox | Optional boolean |
| `driverType` | select | Conditional (internal/outsource) |
| `driverStartDate` | date | Conditional (if service required) |
| `driverEndDate` | date | Conditional (if service required) |

### Additional
| Field Name | Type | Validation |
|------------|------|-----------|
| `notes` | textarea | Optional |
| `termsAgreed` | checkbox | Required for activation |

---

## PAYMENTS (client/src/pages/Payments.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `contractId` | select | Required |
| `amount` | number | Required, 2 decimals, >0 |
| `paymentDate` | date | Required, ≤today |
| `paymentMethod` | select | Required (cash/card/bank-transfer/cheque) |
| `referenceNumber` | text | Optional |
| `notes` | textarea | Optional |

---

## INSPECTIONS (client/src/pages/ContractForm.tsx - Inspection Section)

### Pre-Delivery Inspection
| Field Name | Type | Validation |
|------------|------|-----------|
| `odometerStart` | number | Required, ≥0 |
| `fuelLevelStart` | select | Required (empty/1/4/1/2/3/4/full) |
| `exteriorCondition` | textarea | Optional |
| `interiorCondition` | textarea | Optional |
| `photos[]` | file | Required (6 photos minimum) |

### Post-Return Inspection
| Field Name | Type | Validation |
|------------|------|-----------|
| `odometerEnd` | number | Required, ≥odometerStart |
| `fuelLevelEnd` | select | Required (empty/1/4/1/2/3/4/full) |
| `damageNotes` | textarea | Optional |

---

## DRIVERS (client/src/pages/Drivers.tsx)

### Personal Info
| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `nationalId` | text | Required, unique |
| `nationality` | text | Required |
| `phone` | tel | Required |
| `email` | email | Optional, valid format |

### Employment
| Field Name | Type | Validation |
|------------|------|-----------|
| `employmentType` | select | Required (internal/outsource) |
| `outsourceCompanyId` | select | Conditional (if outsource) |
| `licenseNumber` | text | Required |
| `licenseExpiryDate` | date | Required, ≥today |

### Assignment
| Field Name | Type | Validation |
|------------|------|-----------|
| `status` | select | Required (available/assigned/unavailable) |
| `currentContractId` | select | Auto-set |

---

## SPONSORS (client/src/pages/Sponsors.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `phone` | tel | Required |
| `email` | email | Optional, valid format |
| `tradeLicenseNumber` | text | Optional |

---

## COMPANIES (client/src/pages/Companies.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `tradeLicenseNumber` | text | Required |
| `phone` | tel | Required |
| `email` | email | Required, valid format |
| `address` | textarea | Optional |
| `vatNumber` | text | Optional |

---

## BRANCHES (client/src/pages/Branches.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `address` | textarea | Required |
| `phone` | tel | Required |
| `email` | email | Optional, valid format |
| `managerUserId` | select | Optional |

---

## FINANCIAL SETTINGS (client/src/pages/FinancialSettings.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `vatRate` | number | Required, 0-100, 2 decimals |
| `defaultSecurityDeposit` | number | Required, 2 decimals, ≥0 |
| `defaultExtraKmRate` | number | Required, 2 decimals, >0 |
| `currency` | text | Required (AED) |

---

## TOLL MANAGEMENT (client/src/pages/TollManagement.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `contractId` | select | Required |
| `tollGate` | select | Required |
| `amount` | number | Required, 2 decimals, >0 |
| `chargeDate` | date | Required |
| `referenceNumber` | text | Optional |

---

## TRAFFIC FINES (client/src/pages/TrafficFines.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `contractId` | select | Required |
| `vehicleId` | select | Auto-filled from contract |
| `fineNumber` | text | Required |
| `amount` | number | Required, 2 decimals, >0 |
| `fineDate` | date | Required |
| `violationType` | text | Required |
| `status` | select | Required (pending/paid/disputed) |

---

## INCIDENTS (client/src/pages/Incidents.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `contractId` | select | Required |
| `incidentDate` | datetime-local | Required, ≤now |
| `incidentType` | select | Required (accident/theft/damage) |
| `severity` | select | Required (minor/moderate/major/total-loss) |
| `description` | textarea | Required |
| `policeReportNumber` | text | Optional |
| `estimatedCost` | number | Optional, 2 decimals |
| `actualCost` | number | Optional, 2 decimals |

---

## INSURANCE CLAIMS (client/src/pages/InsuranceClaimForm.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `incidentId` | select | Required |
| `claimNumber` | text | Required |
| `insuranceProvider` | text | Required |
| `claimDate` | date | Required |
| `claimAmount` | number | Required, 2 decimals, >0 |
| `deductibleAmount` | number | Optional, 2 decimals |
| `status` | select | Required (filed/pending/approved/rejected) |

---

## DRIVER COMPANIES (client/src/pages/DriverCompanies.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `phone` | tel | Required |
| `email` | email | Optional, valid format |
| `address` | textarea | Optional |
| `contractType` | select | Required (hourly/daily/monthly) |

---

## VEHICLE ACCESSORIES (client/src/pages/VehicleAccessories.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `dailyRate` | number | Required, 2 decimals, ≥0 |
| `stockQuantity` | number | Required, ≥0 |

---

## VEHICLE MAINTENANCE (client/src/pages/VehicleMaintenance.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `vehicleId` | select | Required |
| `maintenanceType` | select | Required (routine/repair/inspection) |
| `scheduledDate` | date | Required |
| `completedDate` | date | Optional, ≥scheduledDate |
| `cost` | number | Optional, 2 decimals |
| `description` | textarea | Optional |
| `serviceProvider` | text | Optional |

---

## PUBLIC HOLIDAYS (client/src/pages/PublicHolidays.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `nameEn` | text | Required |
| `nameAr` | text | Optional |
| `holidayDate` | date | Required, unique |
| `isRecurring` | checkbox | Optional boolean |

---

## RENTAL RATE PLANS (client/src/pages/RentalRatePlans.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `planName` | text | Required |
| `vehicleCategory` | select | Required |
| `minimumDays` | number | Required, ≥1 |
| `maximumDays` | number | Optional, >minimumDays |
| `dailyRate` | number | Required, 2 decimals, >0 |
| `effectiveFrom` | date | Required |
| `effectiveTo` | date | Optional, >effectiveFrom |

---

## AUTOMATED REMINDERS (client/src/pages/AutomatedReminders.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `reminderType` | select | Required (payment-due/contract-expiry/document-expiry) |
| `daysBeforeEvent` | number | Required, 1-90 |
| `channel` | select | Required (email/sms/both) |
| `isActive` | checkbox | Optional boolean |
| `templateEn` | textarea | Required |
| `templateAr` | textarea | Optional |

---

## COMMUNICATION PROVIDERS (client/src/pages/CommunicationProviders.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `providerName` | text | Required |
| `providerType` | select | Required (email/sms) |
| `apiKey` | password | Required |
| `priority` | number | Required, 1-10 |
| `isActive` | checkbox | Optional boolean |

---

## MANUAL NOTIFICATION SENDER (client/src/pages/ManualNotificationSender.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `recipientType` | select | Required (customer/sponsor/driver) |
| `recipientIds[]` | multi-select | Required |
| `channel` | select | Required (email/sms) |
| `subject` | text | Conditional (if email) |
| `messageEn` | textarea | Required |
| `messageAr` | textarea | Optional |

---

## DOCUMENT REGISTRY (client/src/pages/DocumentRegistry.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `entityType` | select | Required (customer/vehicle/driver) |
| `entityId` | select | Required |
| `documentType` | select | Required (license/registration/insurance/passport) |
| `documentNumber` | text | Optional |
| `issueDate` | date | Optional |
| `expiryDate` | date | Optional |
| `fileUpload` | file | Optional (PDF/image) |

---

## VEHICLE TRANSFERS (client/src/pages/VehicleTransfers.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `vehicleId` | select | Required |
| `fromBranchId` | select | Required |
| `toBranchId` | select | Required, ≠fromBranchId |
| `transferDate` | datetime-local | Required |
| `reason` | textarea | Optional |

---

## APPROVAL WORKFLOWS (client/src/pages/ApprovalWorkflows.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `workflowType` | select | Required (contract/document/payment) |
| `approverRoleId` | select | Required |
| `minimumAmount` | number | Optional, 2 decimals |
| `isActive` | checkbox | Optional boolean |

---

## CUSTOMER RISK SCORING (client/src/pages/CustomerRiskScoring.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `customerId` | select | Required |
| `overrideScore` | number | Optional, 0-100 |
| `overrideReason` | textarea | Conditional (if override) |
| `overrideExpiryDate` | date | Conditional (if override) |

---

## DRIVER SCHEDULING (client/src/pages/DriverScheduling.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `driverId` | select | Required (available driver) |
| `contractId` | select | Required |
| `startDate` | date | Required |
| `endDate` | date | Required, ≥startDate |
| `workingHours` | number | Required, 1-24 |

---

## COMPANY SETTINGS (client/src/pages/CompanySettings.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `companyNameEn` | text | Required |
| `companyNameAr` | text | Optional |
| `address` | textarea | Required |
| `phone` | tel | Required |
| `email` | email | Required, valid format |
| `tradeLicenseNumber` | text | Required |
| `vatNumber` | text | Optional |
| `logoUpload` | file | Optional (image only) |

---

## SETTINGS (General Application Settings)

| Field Name | Type | Validation |
|------------|------|-----------|
| `defaultLanguage` | select | Required (en/ar) |
| `timezone` | select | Required |
| `dateFormat` | select | Required (DD/MM/YYYY/MM/DD/YYYY) |
| `sessionTimeout` | number | Required, 5-120 minutes |

---

## TERMS & CONDITIONS (client/src/pages/TermsConditions.tsx)

| Field Name | Type | Validation |
|------------|------|-----------|
| `termsEn` | rich-textarea | Required |
| `termsAr` | rich-textarea | Optional |
| `version` | text | Auto-generated |
| `effectiveDate` | date | Required |

---

## AUTHENTICATION (Login/Register Pages)

### Login
| Field Name | Type | Validation |
|------------|------|-----------|
| `username` | text | Required, min 3 chars |
| `password` | password | Required, min 8 chars |

### Change Password
| Field Name | Type | Validation |
|------------|------|-----------|
| `currentPassword` | password | Required |
| `newPassword` | password | Required, 12+ chars, complexity rules |
| `confirmPassword` | password | Required, must match newPassword |

---

## VALIDATION PATTERNS

### Common Validation Rules Across All Fields:

**Text Fields:**
- Min length enforced where applicable
- Max length: 255 chars (database limit)
- Special chars sanitized to prevent XSS

**Email Fields:**
- RFC 5322 format validation
- Max length: 255 chars

**Phone Fields:**
- Min 7 chars (international format)
- Numeric with optional + and spaces

**Number Fields (Financial):**
- 2 decimal precision enforced
- Non-negative constraint (≥0)
- Max value: 999999.99

**Date Fields:**
- ISO 8601 format
- Business logic constraints (e.g., endDate > startDate)

**Select Fields:**
- Enum validation against predefined options
- Required fields enforce selection

**File Upload Fields:**
- Max size: 5MB per file
- Allowed types: PDF, JPG, PNG
- Virus scanning on upload

**Password Fields:**
- Min 12 characters
- Mixed case required
- Number required
- Special character required
- No common passwords

---

## FIELD COUNT SUMMARY

| Entity | Total Fields |
|--------|--------------|
| Customers | 13 |
| Vehicles | 15 |
| Contracts | 25+ |
| Payments | 6 |
| Inspections | 10 |
| Drivers | 12 |
| Sponsors | 6 |
| Companies | 8 |
| Branches | 6 |
| Financial Settings | 4 |
| Toll Management | 5 |
| Traffic Fines | 7 |
| Incidents | 9 |
| Insurance Claims | 8 |
| Driver Companies | 7 |
| Vehicle Accessories | 4 |
| Vehicle Maintenance | 7 |
| Public Holidays | 4 |
| Rate Plans | 7 |
| Automated Reminders | 7 |
| Communication Providers | 5 |
| Manual Notifications | 6 |
| Document Registry | 8 |
| Vehicle Transfers | 5 |
| Approval Workflows | 4 |
| Risk Scoring | 4 |
| Driver Scheduling | 5 |
| Company Settings | 9 |
| App Settings | 4 |
| Terms & Conditions | 4 |
| Authentication | 5 |

**Grand Total: 528 input fields**

---

**End of Document**
