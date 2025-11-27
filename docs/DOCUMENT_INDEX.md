# KarāraOS Documentation Index

**Document Version:** 2.0  
**Last Updated:** November 27, 2025  
**Documentation Cleanup:** Complete (18+ superseded documents archived)  
**Master Spec Compliance:** 100% (Parts 1-16 + A-F verified)

---

## Authoritative Documentation Hierarchy

### Tier 1: Master Specification (CANONICAL - DO NOT MODIFY)
| Document | Purpose | Status |
|----------|---------|--------|
| **KARĀRAOS – MASTER SYSTEM SPECIFICATION v1.0.md** | THE authoritative specification (10,806 lines) | Primary Source of Truth |

### Tier 2: Compliance Tracking
| Document | Purpose | Status |
|----------|---------|--------|
| **MASTER_SPEC_COMPLIANCE_COMPARISON.md** | 100% compliance verification | Current |
| **MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md** | Implementation tracking checklist | Current |

### Tier 3: System Reference
| Document | Purpose | Status |
|----------|---------|--------|
| **replit.md** | System architecture, user preferences, technical decisions | Current |
| **MASTER_FEATURE_LIST.md** | Comprehensive feature inventory | Current (v3.0) |

---

## Documentation Categories

### System Architecture & Technical Design

| Document | Purpose | Priority |
|----------|---------|----------|
| **ARCHITECTURE.md** | System architecture overview (DB, API, frontend) | Primary |
| **TECHNICAL_DOCUMENTATION.md** | Technical specifications | Supplementary |
| **CONTRACT_FLOW.md** | Contract 4-state lifecycle workflow | Primary |
| **ROLE_PERMISSIONS.md** | RBAC matrix and permissions | Primary |
| **design_guidelines.md** | Material Design 3, UI/UX standards | Primary |
| **TABBED_DIALOGS_GUIDE.md** | Tabbed form UI patterns | Supplementary |

### User & Admin Guides

| Document | Purpose | Priority |
|----------|---------|----------|
| **USER_GUIDE.md** | Complete user manual | Primary |
| **ADMIN_GUIDE.md** | Administrator configuration | Primary |
| **DASHBOARD_GUIDE.md** | Dashboard features and analytics | Supplementary |
| **MAINTENANCE_GUIDE.md** | System maintenance procedures | Primary |
| **OPERATIONAL_RUNBOOK.md** | Operations and troubleshooting | Primary |

### Deployment & Infrastructure

| Document | Purpose | Priority |
|----------|---------|----------|
| **PRODUCTION_DEPLOYMENT.md** | Production deployment procedures | Primary |
| **REDIS_SETUP_GUIDE.md** | Redis caching configuration | Supplementary |
| **APM_SETUP_GUIDE.md** | Application performance monitoring | Supplementary |
| **DOCUMENT_STORAGE_MIGRATION_GUIDE.md** | S3/KMS document storage migration | Reference |
| **ENVIRONMENT_VARIABLES_CATALOG.md** | Environment variable reference | Reference |

### Testing & Quality Assurance

| Document | Purpose | Priority |
|----------|---------|----------|
| **TESTING_GUIDE.md** | Testing strategy and procedures | Primary |
| **RTL_LTR_TESTING_CHECKLIST.md** | Bilingual RTL/LTR testing checklist | Primary |
| **CI_LOCAL_CHECKLIST.md** | Pre-release testing checklist | Primary |

### System Features & Communications

| Document | Purpose | Priority |
|----------|---------|----------|
| **NOTIFICATION_SYSTEM.md** | Notification architecture | Primary |
| **NOTIFICATION_TOUCHPOINTS.md** | Notification trigger points | Supplementary |
| **BILINGUAL_IMPLEMENTATION.md** | English/Arabic i18n implementation | Primary |
| **CRON_FAILURE_NOTIFICATIONS.md** | Cron job failure alerting | Supplementary |

### Specialized Documentation

| Document | Purpose | Priority |
|----------|---------|----------|
| **MOBILE_APP_PROVISIONS.md** | Future mobile app provisions | Reference |
| **MOBILE_CODE_REMOVAL_AUDIT.md** | Desktop-only transition audit | Reference |
| **IMPORT_DATA.md** | Data import procedures | Supplementary |
| **REPORTS_CATALOG.md** | Reports inventory | Supplementary |
| **SCREEN_FIELD_SEGREGATION.md** | Field visibility matrix | Reference |
| **INPUT_FIELDS_INVENTORY.md** | Form field inventory | Reference |

### UI/UX Standards

| Document | Purpose | Priority |
|----------|---------|----------|
| **UI_CONSISTENCY_STANDARDS.md** | UI consistency guidelines | Primary |

### Security & Audit

| Document | Purpose | Priority |
|----------|---------|----------|
| **PROJECT_AUDIT_NOV22_2025.md** | Comprehensive system audit (current) | Primary |
| **SECURITY_CHANGELOG.md** | Security change log | Reference |

### Planning & Roadmap

| Document | Purpose | Priority |
|----------|---------|----------|
| **FEATURE_ROADMAP.md** | Future development roadmap | Reference |

---

## Archived Documents

All superseded, outdated, or consolidated documents have been moved to `docs/archive/`:

### November 2025 Superseded (docs/archive/nov2025_superseded/)
- Gap analysis documents (superseded by 100% compliance)
- Old audit reports using "RCCMS" terminology
- Status reports superseded by Master Spec compliance verification
- Supabase migration guide (system uses Neon/Drizzle)

### Previously Archived
- Session documents (docs/archive/nov2025_session_docs/)
- Consolidation documents (docs/archive/nov2025_consolidation/)
- Legacy system documents

---

## Reading Order for New Users

1. **Start:** `replit.md` - System overview and preferences
2. **Specification:** `KARĀRAOS – MASTER SYSTEM SPECIFICATION v1.0.md` - Master authority
3. **Features:** `MASTER_FEATURE_LIST.md` - Feature inventory
4. **Role-Based:**
   - Operations Staff: `USER_GUIDE.md`
   - Administrators: `ADMIN_GUIDE.md`
5. **Technical:** `ARCHITECTURE.md` + `TECHNICAL_DOCUMENTATION.md`

---

## Terminology Note

As of November 2025, the system name is **KarāraOS** (previously referred to as "RCCMS"). All active documentation has been updated to use the current terminology. Archived documents may still reference the old name.

---

## Documentation Maintenance

- **Master Spec**: Do not modify without formal approval process
- **Compliance Docs**: Update as implementation changes
- **User Guides**: Update when UI/features change
- **Technical Docs**: Keep synchronized with codebase

**For discrepancies:** Master System Specification takes precedence.
