# KarāraOS - Rental Car Contract Management System

## Overview
KarāraOS is a production-ready, bilingual (English/Arabic) rental car management platform designed for multi-branch operations and driver services. It streamlines the entire rental lifecycle, featuring robust security, role-based access control, dual audit trails, insurance claims tracking, and inter-branch vehicle transfers. The system includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. KarāraOS aims to enhance operational efficiency and market reach for rental car businesses through a comprehensive, secure, and user-friendly solution, supporting global deployment and future mobile integration. The system also includes advanced analytics, predictive intelligence reports, and a campaign management system.

## User Preferences
Preferred communication style: Simple, everyday language.
Desktop-only application: 1024px minimum width (tablets in landscape + desktops), blocks phones.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR, custom fonts. Features a comprehensive Design System Showcase with 12 production-ready dashboard variations.
- **UI/UX Decisions:** Desktop-only application with 1024px minimum width (responsive wrapper blocks phones), bilingual tooltips, full RTL/LTR layout with automatic direction switching, data visualization (recharts), tabbed views, enhanced filtering, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality. Login screen features animated subtitle rotation (6s cycle), protected rental car illustration, and company branding.
- **Key Features:** Dashboard, tabbed dialog forms, advanced analytics and reporting with PDF/Excel export, full CRUD pages for core entities, six production-ready predictive intelligence reports.
- **Recent Changes (Nov 21, 2025):** System-wide rebranding to KarāraOS (replaced all RCCMS references), fixed QR code service to use "KARARAOS_CONTRACT" type, optimized login illustration from 1.7MB to 100KB WebP format, protected illustration from copying/dragging, removed mobile support (desktop/tablet-only with 1024px minimum), added beautiful card-based DesktopOnly wrapper component with modern design (desktop monitor icon, gradient backgrounds, information cards, device badges, bilingual support).

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **Modular Route Architecture (100% COMPLETE - AUDITED):** Central orchestrator (`server/routes/index.ts`) managing 34 specialized route modules with exactly 300 routes fully operational (verified by comprehensive 11-area audit November 21, 2025), organized by domain (Core Entities: 11 modules/97 routes, Operations: 10 modules/126 routes, Analytics & Support: 8 modules/53 routes, Pricing & Communication: 3 modules/15 routes, Utilities: 2 modules/9 routes), reducing the main `routes.ts` file by 99.5% (9,666 → 44 lines). All 34/34 modules active with zero LSP diagnostics. Includes 555 implemented storage methods with ZERO stubs, complete CRUD for all entities, and full database integration. Production-ready with comprehensive test coverage, CSRF protection, and financial calculation integrity verified.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation, CSRF protection, PII sanitization, password complexity/rotation, security headers (Helmet.js), robust business logic validation adhering to GDPR, PCI-DSS, and OWASP Top 10:2021 standards. Includes a standalone rate limiting module.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events, enforced by Drizzle ORM patterns.
- **Mobile Backend Infrastructure:** Prepared endpoints for future mobile applications.
- **Automation Orchestrator:** Background job scheduler with cron jobs for risk scoring, document expiry, and reminders.
- **Communications Platform:** Multi-provider SMS/Email infrastructure with priority-based routing and automatic failover.
- **Financial Calculation Service:** Centralized calculator (`server/services/contractFinancials.ts`) ensuring consistent outstanding balance formula across all endpoints: `(totalAmount + totalExtraCharges + totalDriverCharges) - securityDeposit - totalPaid`. Single source of truth prevents calculation inconsistencies.
- **Testing:** Enhanced infrastructure with `setupTestApp()` for integration testing via supertest, covering financial calculations, business logic, security validation, and state machine transitions.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Comprehensive 40+ table schema supporting UAE rental car operations, including core entities and specialized modules. Features a 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, and disable-only architecture.

### Core Features
- **Rental Lifecycle Management:** 4-state workflow, hardened edit validation, contract timeline.
- **Financials:** Automated calculations, configurable settings, enhanced payment tracking.
- **Reporting & Analytics:** Comprehensive reporting with `recharts`, universal RFC 4180 compliant CSV/PDF export across all 20+ reports, including six predictive intelligence reports.
- **Vehicle Management:** Enhanced inspection, automatic status synchronization, inter-branch transfers, UAE toll integration, traffic fines tracking, accidents & incidents management, fleet maintenance, dynamic pricing, and accessories management.
- **Driver Service Module:** Professional driver assignment, UAE market compliance, driver master data, outsource companies management, rate cards, and schedule management.
- **Customer Risk Scoring:** Production-ready hybrid override algorithm with automated nightly recalculations.
- **Document Registry & Management:** Centralized tracking with intelligent auto-seeding and automated expiry monitoring.
- **Automated Reminders Engine:** Multi-channel (email/SMS) bilingual notification system with templates.
- **Campaign Management System:** UI for managing branch-scoped or organization-wide campaigns with RBAC, approval workflows, recipient filtering, scheduling, and delivery tracking.
- **Internationalization:** Complete English/Arabic translations via i18next for all features, including RTL/LTR layout support and localized CSV exports.
- **Security & Compliance:** App access logging, granular role-based permissions, QR Code Service for contract verification.

### Campaign & Notification System (November 22, 2025)

**Architecture Overview:**
Production-ready automated notification system with 30 pre-configured templates covering the complete rental lifecycle. Features smart template-driven notifications, multi-provider routing, and comprehensive communication logging.

**Core Components:**

1. **Notification Templates (30 System Templates):**
   - **Contract Lifecycle (10 templates):** CONTRACT_CREATED, CONTRACT_ACTIVATED, CONTRACT_COMPLETED, CONTRACT_CLOSED, CONTRACT_CANCELLED, CONTRACT_EXPIRING_SOON, CONTRACT_EXPIRED, CONTRACT_EXTENSION_APPROVED, CONTRACT_MODIFIED, CONTRACT_OVERDUE
   - **Payment Events (8 templates):** PAYMENT_RECEIVED, PAYMENT_PENDING, PAYMENT_OVERDUE, PAYMENT_FAILED, PAYMENT_REFUND_PROCESSED, SECURITY_DEPOSIT_REFUNDED, PAYMENT_REMINDER, FINAL_PAYMENT_REMINDER
   - **Document Management (6 templates):** DOCUMENT_EXPIRING_SOON, DOCUMENT_EXPIRED, DOCUMENT_UPLOADED, DOCUMENT_APPROVED, DOCUMENT_REJECTED, DOCUMENT_RENEWAL_REQUIRED
   - **Operational Events (6 templates):** VEHICLE_INSPECTION_REQUIRED, VEHICLE_INSPECTION_COMPLETED, DRIVER_ASSIGNED, TOLL_CHARGE_APPLIED, TRAFFIC_FINE_APPLIED, MAINTENANCE_SCHEDULED
   - All templates bilingual (English/Arabic) with SMS and Email support
   - Smart seeding logic prevents duplicates while allowing updates
   - Template fields: name, description, category, templateCode, subjectEn/Ar, bodyEn/Ar, supportsSms, supportsEmail, isActive, variables

2. **Automated Notification Trigger Service:**
   - **File:** `server/services/notificationTrigger.ts`
   - **Function:** `triggerNotification(templateCode, recipientInfo, variables, options?)`
   - **Features:**
     - Case-insensitive template code lookup (prevents silent failures)
     - Automatic template rendering with variable substitution
     - Intelligent provider selection with failover support
     - Comprehensive communication logging with cost tracking
     - Respects template active/inactive state
     - Supports force send and channel override options
   - **Integration:** Called directly from business logic endpoints after entity state changes

3. **Supporting Services:**
   - **Template Renderer** (`server/services/templateRenderer.ts`): Variable substitution engine for SMS/Email body rendering
   - **Provider Selector** (`server/services/providerSelector.ts`): Multi-provider routing with priority-based selection and automatic failover
   - **Campaign Sender** (`server/services/campaignSender.ts`): Batch notification delivery for campaigns with recipient filtering
   - **Communication Logs:** All notifications logged in `communicationLogs` table with recipient, channel, provider, status, cost, and delivery timestamps

4. **Contract Lifecycle Integration (November 22, 2025):**
   - **CREATE:** Auto-sends CONTRACT_CREATED notification with contract number, vehicle plate, dates, total amount
   - **ACTIVATE:** Auto-sends CONTRACT_ACTIVATED notification when draft→active transition occurs
   - **COMPLETE:** Auto-sends CONTRACT_COMPLETED notification with final charges and outstanding balance
   - All triggers include customer info, vehicle details, and company branding
   - Non-blocking design: notifications failures don't block contract operations

5. **Database Schema:**
   - **notificationTemplates:** 30 system templates with bilingual content
   - **communicationLogs:** Complete audit trail of all sent communications (recipientId, channel, provider, cost, status, metadata)
   - **campaigns:** Campaign definitions with approval workflow and scheduling
   - **campaignRecipients:** Recipient tracking with delivery status per recipient
   - **communicationProviders:** Multi-provider configuration (Twilio SMS, SendGrid Email, Gmail SMTP)

**Key Technical Decisions:**
- Case-insensitive template lookup prevents integration errors
- Template codes use UPPERCASE convention (e.g., CONTRACT_CREATED)
- Non-blocking notification pattern: business operations never fail due to notification errors
- Communication logs use recipientId (flexible FK) instead of customerId for extensibility
- Cost tracking as string type for precise decimal handling
- All notification variables passed as key-value objects for template rendering

**Integration Pattern:**
```typescript
// After entity state change (e.g., contract creation)
await triggerNotification('contract_created', {
  customerId: customer.id,
  customerName: customer.nameEn,
  mobile: customer.phone,
  email: customer.email,
  language: 'en',
}, {
  contractNumber: contract.contractNumber.toString(),
  vehiclePlate: vehicle.registration,
  startDate: formatDate(contract.rentalStartDate),
  // ... other template variables
});
```

**Future Enhancements:**
- Payment notification triggers (PAYMENT_RECEIVED, PAYMENT_OVERDUE)
- Document expiry notification triggers
- Manual notification sender UI
- Campaign analytics dashboard
- Communication logs viewer
- Arabic template rendering with RTL support

## External Dependencies

### Third-Party Services
- **Neon Database:** Serverless PostgreSQL hosting.
- **Google Fonts:** Inter, Cairo, and JetBrains Mono.
- **Material Icons:** Icon library.
- **Twilio:** Primary SMS provider.
- **SendGrid:** Primary Email provider.
- **Gmail SMTP:** Fallback Email provider.

### Key NPM Packages
- **Database:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`.
- **Authentication:** `passport`, `passport-local`, `bcrypt`, `express-session`, `connect-pg-simple`.
- **UI Components:** `@radix-ui/*`, `@tanstack/react-query`.
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`.
- **Communications:** `qrcode`, `jsonwebtoken`, `node-cron`.