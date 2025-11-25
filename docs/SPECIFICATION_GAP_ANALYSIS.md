# SPECIFICATION GAP ANALYSIS
## KarāraOS vs Master System Specification v1.0

**Analysis Date:** November 25, 2025  
**Current Status:** Production-ready with critical gaps identified  
**Priority:** Address critical gaps before market deployment

---

## EXECUTIVE SUMMARY

This document identifies discrepancies between the current KarāraOS implementation and the Master System Specification v1.0. The analysis covers database schema, business logic, workflow enforcement, and UI/UX requirements.

### Summary Statistics

| Category | Spec Requirement | Implemented | Gap |
|----------|------------------|-------------|-----|
| Database Tables | 63+ | ~45 | ~18 tables |
| API Routes | 300+ | 280+ | ~20 routes |
| Settings Options | 100+ | ~30 | ~70 options |
| Notification Templates | 30 | 25 | 5 templates |
| Contract States | 6 | 4 | 2 states |

### Critical Priority Matrix

| Gap ID | Component | Severity | Effort | Impact |
|--------|-----------|----------|--------|--------|
| GAP-001 | OTP System | CRITICAL | Medium | Blocks contract signing |
| GAP-002 | Availability Engine | HIGH | Medium | Performance/reliability |
| GAP-003 | Settings Matrix | HIGH | High | Configuration flexibility |
| GAP-004 | Contract Status Enhancement | MEDIUM | Low | Damage workflow |
| GAP-005 | Inspection Enforcement | HIGH | Medium | Workflow integrity |
| GAP-006 | Deposit Automation | MEDIUM | Medium | Financial accuracy |
| GAP-007 | Payment Notifications | HIGH | Low | Compliance |

---

## GAP-001: OTP SYSTEM (CRITICAL)

### Specification Requirement
Per Master Spec Section 9.5-9.6:
- OTP required for contract activation (hirer signature)
- OTP required for contract closure (final signature)
- OTP required for material amendments (rate change, vehicle swap)
- OTP required for extensions
- OTP delivery via SMS with email fallback
- OTP expiry: configurable (default 5 minutes)
- OTP retry limit: configurable (default 3 attempts)
- OTP verification logged in audit trail

### Current Implementation
**STATUS: NOT IMPLEMENTED**

No OTP system exists in the codebase:
- No `otp_verifications` table
- No OTP generation service
- No OTP validation middleware
- No OTP delivery integration

### Required Implementation

#### Database Schema
```typescript
// Add to shared/schema.ts
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { length: 30 }).notNull(), // contract, amendment, extension
  entityId: varchar("entity_id").notNull(),
  purpose: varchar("purpose", { length: 50 }).notNull(), // activation, closure, amendment_approval
  recipientType: varchar("recipient_type", { length: 20 }).notNull(), // hirer, sponsor
  recipientId: varchar("recipient_id").notNull(),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  otpCode: varchar("otp_code", { length: 10 }).notNull(), // Hashed
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  deliveryChannel: varchar("delivery_channel", { length: 10 }).notNull(), // sms, email, both
  deliveryStatus: varchar("delivery_status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
});
```

#### Service Implementation
```typescript
// server/services/otpService.ts
export class OTPService {
  async generateOTP(params: GenerateOTPParams): Promise<OTPResult>;
  async validateOTP(params: ValidateOTPParams): Promise<ValidationResult>;
  async resendOTP(verificationId: string): Promise<ResendResult>;
  async expireOTP(verificationId: string): Promise<void>;
}
```

#### API Routes Required
- `POST /api/otp/generate` - Generate and send OTP
- `POST /api/otp/validate` - Validate OTP code
- `POST /api/otp/resend` - Resend OTP
- `GET /api/otp/:entityType/:entityId/status` - Check verification status

### Files to Modify
- `shared/schema.ts` - Add OTP table
- `server/services/otpService.ts` - New file
- `server/routes/otpRoutes.ts` - New file
- `server/routes/contractRoutes.ts` - Add OTP validation to activate/close
- `client/src/components/OTPVerificationModal.tsx` - New UI component

---

## GAP-002: AVAILABILITY ENGINE (HIGH)

### Specification Requirement
Per Master Spec Section 8.2:
- Precomputed cache table `vehicle_availability_cache`
- Fast availability queries for contract creation
- Real-time updates on contract state changes
- Support for future reservations
- Maintenance blackout periods
- Transfer period blocking

### Current Implementation
**STATUS: NOT IMPLEMENTED**

Current system queries vehicles directly:
- No availability cache table
- No precomputed availability windows
- Availability checked via real-time joins

### Required Implementation

#### Database Schema
```typescript
export const vehicleAvailabilityCache = pgTable("vehicle_availability_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  date: date("date").notNull(),
  status: varchar("status", { length: 30 }).notNull(), // available, reserved, rented, maintenance, transfer
  blockingEntityType: varchar("blocking_entity_type", { length: 30 }), // contract, maintenance, transfer
  blockingEntityId: varchar("blocking_entity_id"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  vehicleDateIdx: uniqueIndex("idx_vehicle_availability_vehicle_date").on(table.vehicleId, table.date),
  branchDateIdx: index("idx_vehicle_availability_branch_date").on(table.branchId, table.date),
  statusIdx: index("idx_vehicle_availability_status").on(table.status),
}));
```

#### Service Implementation
```typescript
// server/services/availabilityEngine.ts
export class AvailabilityEngine {
  async rebuildCache(vehicleId?: string): Promise<void>;
  async getAvailableVehicles(params: AvailabilityQuery): Promise<Vehicle[]>;
  async checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean>;
  async onContractStateChange(contractId: string, newState: string): Promise<void>;
  async onMaintenanceScheduled(maintenanceId: string): Promise<void>;
  async onTransferInitiated(transferId: string): Promise<void>;
}
```

### Files to Modify
- `shared/schema.ts` - Add cache table
- `server/services/availabilityEngine.ts` - New file
- `server/routes/vehicleRoutes.ts` - Use engine for availability queries
- `server/services/automationOrchestrator.ts` - Add nightly cache rebuild

---

## GAP-003: SETTINGS MATRIX (HIGH)

### Specification Requirement
Per Master Spec Part 14:
- 100+ configurable settings
- System-level, organization-level, and branch-level overrides
- 10 categories: Brand, Contract, Vehicle, Rates, Finance, Notifications, Import, Maintenance, Security, Backup
- Settings versioning and history
- Reset to default capability
- Permission-based access (HQ_ADMIN for global, BRANCH_MANAGER for branch)

### Current Implementation
**STATUS: PARTIALLY IMPLEMENTED**

Current system has:
- `branchDefaults` table with ~20 settings per branch
- `organizationSettings` not implemented
- No system-wide settings table
- No settings versioning or history
- Limited to branch-level configuration

### Required Implementation

#### Database Schema
```typescript
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 30 }).notNull(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  valueType: varchar("value_type", { length: 20 }).notNull(), // string, int, bool, json, enum
  enumOptions: text("enum_options"), // JSON array if enum type
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const branchSettings = pgTable("branch_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  overridesSystem: boolean("overrides_system").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const settingsHistory = pgTable("settings_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingLevel: varchar("setting_level", { length: 20 }).notNull(), // system, branch
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  branchId: varchar("branch_id"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  changedBy: varchar("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
});
```

### Settings Categories Required

| Category | Required Settings | Currently Implemented |
|----------|-------------------|----------------------|
| Brand | 10 | 5 |
| Contract | 15 | 8 |
| Vehicle | 12 | 4 |
| Rates | 10 | 6 |
| Finance | 18 | 7 |
| Notifications | 12 | 8 |
| Import | 8 | 0 |
| Maintenance | 7 | 3 |
| Security | 12 | 5 |
| Backup | 6 | 0 |

---

## GAP-004: CONTRACT STATUS ENHANCEMENT (MEDIUM)

### Specification Requirement
Per Master Spec Section 16.2:
- DRAFT - Created but not activated
- ACTIVE - Vehicle released to customer
- COMPLETE - Returned, inspection done, not financially closed
- **COMPLETED_PENDING_ACCIDENT** - Has unresolved damage/incident
- CLOSED - Financially settled, archived
- CANCELLED - Aborted before activation
- ON_HOLD (Provision) - Frozen for legal/compliance

### Current Implementation
**STATUS: PARTIAL**

Current statuses in `contracts.status`:
- draft
- active
- completed
- closed

**MISSING:**
- `completed_pending_accident` - Critical for damage workflows
- `cancelled` - For pre-activation aborts
- `on_hold` - For legal freezes

### Required Implementation

1. Update enum definition in schema comments
2. Add status transition validation
3. Update frontend status displays
4. Add automatic status change triggers (incident opens → COMPLETED_PENDING_ACCIDENT)

---

## GAP-005: INSPECTION WORKFLOW ENFORCEMENT (HIGH)

### Specification Requirement
Per Master Spec Section 15.5:
- **Cannot activate contract** without pre-delivery inspection
- **Cannot complete contract** without return inspection
- Minimum photos OR remarks required
- Damage detection auto-opens incident
- VIN verification recommended
- Accessories checklist optional but validated if enabled

### Current Implementation
**STATUS: PARTIAL**

Current system has:
- `vehicleInspections` table exists
- Inspection CRUD routes exist
- No workflow enforcement

**MISSING:**
- Activation blocked without start inspection
- Completion blocked without return inspection
- Damage comparison logic
- Auto-incident creation for unreported damage

### Required Implementation

#### Contract Routes Enhancement
```typescript
// In contractRoutes.ts activate endpoint
async function activateContract(contractId: string) {
  // 1. Check for pre-delivery inspection
  const startInspection = await storage.getInspectionByContract(contractId, 'pre_delivery');
  if (!startInspection) {
    throw new Error('Pre-delivery inspection required before activation');
  }
  
  // 2. Validate inspection completeness
  if (!startInspection.photos?.length && !startInspection.remarks) {
    throw new Error('Inspection must have photos or remarks');
  }
  
  // 3. Continue with activation...
}
```

---

## GAP-006: DEPOSIT WORKFLOW AUTOMATION (MEDIUM)

### Specification Requirement
Per Master Spec Section 15.6.3:
- Deposit >= minimum amount per settings
- Deposit type: hold vs charge
- Deposit refund requires approval
- Deposit can be consumed by charges
- Automatic deposit application workflow

### Current Implementation
**STATUS: PARTIAL**

Current system has:
- Basic deposit fields on contracts (securityDeposit, depositPaid, depositRefunded)
- No held deposit tracking
- No automatic application to charges
- No approval workflow for refunds

### Required Implementation

#### Enhanced Deposit Fields
```typescript
// Add to contracts table
depositType: varchar("deposit_type", { length: 20 }), // hold, charge
depositHoldReference: varchar("deposit_hold_reference", { length: 100 }), // Card auth reference
depositAppliedToCharges: varchar("deposit_applied_to_charges").default("0"),
depositRefundApprovalId: varchar("deposit_refund_approval_id"),
```

---

## GAP-007: PAYMENT CONFIRMATION NOTIFICATIONS (HIGH)

### Specification Requirement
Per Master Spec Section 15.6.2:
> "Payment confirmation notification: **required per your rule**"

Every payment must trigger:
- SMS notification to payer
- Email notification if email available
- Receipt number included
- Outstanding balance updated

### Current Implementation
**STATUS: NEEDS VERIFICATION**

NotificationService exists but payment trigger integration needs confirmation.

### Required Implementation

Verify or implement:
```typescript
// In payment routes POST handler
await notificationService.sendNotification({
  templateCode: 'PAYMENT_CONFIRMATION',
  channel: 'both',
  recipientType: 'customer',
  recipientId: contract.hirerId,
  variables: {
    receiptNumber: payment.receiptNumber,
    amount: payment.amount,
    contractNumber: contract.contractNumber,
    outstandingBalance: calculated.outstandingBalance,
  },
});
```

---

## ADDITIONAL GAPS (Lower Priority)

### GAP-008: Import Engine
- STATUS: NOT IMPLEMENTED
- Requirement: CSV/Excel import for legacy data migration
- Impact: Marketing rollout readiness

### GAP-009: Cron Job Manager
- STATUS: PARTIAL
- Requirement: Full automation orchestrator with failure notifications
- Impact: Operational automation

### GAP-010: Rate Engine Validation
- STATUS: NEEDS VERIFICATION
- Requirement: Rate selection validation, upgrade/downgrade penalties
- Impact: Pricing accuracy

### GAP-011: Transfer Workflow
- STATUS: PARTIAL
- Requirement: Full dispatch/arrival workflow with inspection
- Impact: Multi-branch operations

### GAP-012: Amendment System
- STATUS: PARTIAL
- Requirement: Rate change, vehicle swap, term adjustment with OTP
- Impact: Contract flexibility

---

## IMPLEMENTATION PRIORITY ORDER

### Phase 1 - Critical (Week 1)
1. GAP-001: OTP System - Blocks contract signing
2. GAP-007: Payment Notifications - Compliance requirement

### Phase 2 - High Priority (Week 2)
3. GAP-005: Inspection Enforcement - Workflow integrity
4. GAP-002: Availability Engine - Performance critical

### Phase 3 - Medium Priority (Week 3)
5. GAP-003: Settings Matrix - Configuration flexibility
6. GAP-004: Contract Status Enhancement - Damage workflow

### Phase 4 - Enhancement (Week 4)
7. GAP-006: Deposit Automation - Financial accuracy
8. Remaining lower priority gaps

---

## VERIFICATION CHECKLIST

Before deployment, verify:

- [ ] OTP system tested end-to-end
- [ ] Availability engine handles concurrent requests
- [ ] All 100+ settings configurable
- [ ] Payment notifications trigger correctly
- [ ] Inspection enforcement blocks invalid transitions
- [ ] Deposit workflow handles all edge cases
- [ ] Contract status transitions validated
- [ ] All notification templates seeded
- [ ] Cron jobs running with failure alerts

---

## DOCUMENT MAINTENANCE

This document should be updated as gaps are addressed:
- Mark completed items with ✅
- Add new gaps as discovered
- Update severity based on user feedback
- Track implementation progress per phase

**Next Review:** After each implementation phase completion
