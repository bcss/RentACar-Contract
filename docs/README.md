# KarāraOS Documentation

**Last Updated:** November 27, 2025  
**Master Spec Compliance:** 100% (Parts 1-16 + A-F verified)

## Documentation Structure

This folder contains all technical and user documentation for KarāraOS (UAE Rental Car Contract Management Platform). Documents are organized by purpose for easy navigation.

---

## Quick Start

- **Overview:** Start with [replit.md](../replit.md) for system overview
- **Specification:** [Master System Specification](KARĀRAOS%20–%20MASTER%20SYSTEM%20SPECIFICATION%20v1.0.md)
- **Features:** [Master Feature List](MASTER_FEATURE_LIST.md)
- **New Users:** [User Guide](USER_GUIDE.md)
- **Administrators:** [Admin Guide](ADMIN_GUIDE.md)
- **Developers:** [Architecture](ARCHITECTURE.md) and [Technical Documentation](TECHNICAL_DOCUMENTATION.md)
- **Deployment:** [Production Deployment](PRODUCTION_DEPLOYMENT.md)

---

## Documentation Index

For complete documentation catalog, see **[DOCUMENT_INDEX.md](DOCUMENT_INDEX.md)**

### Core Documents

| Document | Purpose |
|----------|---------|
| [KARĀRAOS – MASTER SYSTEM SPECIFICATION v1.0.md](KARĀRAOS%20–%20MASTER%20SYSTEM%20SPECIFICATION%20v1.0.md) | Master specification (10,806 lines) |
| [MASTER_FEATURE_LIST.md](MASTER_FEATURE_LIST.md) | Comprehensive feature inventory |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design |
| [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) | Technical specifications |

### User Guides

| Document | Purpose |
|----------|---------|
| [USER_GUIDE.md](USER_GUIDE.md) | Complete user manual |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Administrator configuration |
| [DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md) | Dashboard features |
| [OPERATIONAL_RUNBOOK.md](OPERATIONAL_RUNBOOK.md) | Operations guide |

### Compliance & Quality

| Document | Purpose |
|----------|---------|
| [MASTER_SPEC_COMPLIANCE_COMPARISON.md](MASTER_SPEC_COMPLIANCE_COMPARISON.md) | 100% compliance verification |
| [MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md](MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md) | Implementation tracking |
| [PROJECT_AUDIT_NOV22_2025.md](PROJECT_AUDIT_NOV22_2025.md) | Latest system audit |
| [NON_COMPLIANT_DEPENDENCIES.md](NON_COMPLIANT_DEPENDENCIES.md) | Legacy code review |

### Testing & Deployment

| Document | Purpose |
|----------|---------|
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Testing procedures |
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Deployment guide |
| [CI_LOCAL_CHECKLIST.md](CI_LOCAL_CHECKLIST.md) | Pre-release checklist |

---

## System Overview

### Core Modules
1. **Contract Management** - 4-state lifecycle (Draft → Active → Completed → Closed)
2. **Customer Management** - Bilingual profiles with sponsorship support
3. **Vehicle Management** - Fleet tracking, inspections, transfers
4. **Payment Tracking** - Multi-payment support with allocation
5. **Branch Management** - Multi-location operations
6. **Driver Service** - Professional driver assignments with UAE compliance
7. **Reporting & Analytics** - Comprehensive business intelligence

### Technical Stack
- **Frontend:** React, TypeScript, Wouter, TanStack Query, Radix UI, Tailwind CSS
- **Backend:** Node.js, Express.js, Drizzle ORM, Passport.js
- **Database:** PostgreSQL (Neon serverless)
- **Build:** Vite
- **i18n:** i18next (English/Arabic with RTL/LTR)

---

## Archived Documents

Superseded and outdated documents are stored in `docs/archive/`. These are kept for historical reference but are no longer authoritative.

---

## Terminology

The system is officially named **KarāraOS** (previously referred to as "RCCMS" in older documentation). All active documents use the current terminology.
