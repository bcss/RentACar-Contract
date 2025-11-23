# KarāraOS - Rental Car Contract Management System

## Overview
KarāraOS is a production-ready, bilingual (English/Arabic) rental car management platform for multi-branch operations and driver services. It streamlines the entire rental lifecycle, offering robust security, role-based access, dual audit trails, insurance claims, and inter-branch vehicle transfers. It includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. KarāraOS aims to boost operational efficiency and market reach for rental car businesses through a comprehensive, secure, and user-friendly solution, supporting global deployment and future mobile integration. The system also includes advanced analytics, predictive intelligence reports, a campaign management system, and a comprehensive Sample menu for design comparison and testing.

## User Preferences
- **Communication Style:** Simple, everyday language.
- **Desktop-Only Application:** 1024px minimum width (tablets in landscape + desktops), blocks phones.
- **Button Style:** Square buttons with `rounded-none` class (not rounded corners).
- **Type-Ahead Search:** All dropdown selections use beautiful type-ahead search with Popover + Command pattern instead of traditional dropdown lists.

## System Architecture

### UI/UX Decisions
The application is desktop-only with a minimum width of 1024px, ensuring a consistent experience on tablets (landscape) and desktops. It features a Material Design 3 (cyan-blue primary) aesthetic with dual light/dark themes and **square buttons (rounded-none)**. The UI supports full RTL/LTR layouts for English and Arabic, including bilingual tooltips, automatic direction switching, and localized CSV exports. Data visualization is handled by Recharts, offering enhanced filtering and tabbed views. Key UI components include a comprehensive Design System Showcase with 12 dashboard variations and a **Sample Menu** housing all mock/demo screens for design comparison. The login screen features an animated subtitle rotation, a protected rental car illustration, and company branding.

#### Sample Menu Infrastructure
A dedicated **Sample** section in the sidebar (Admin/Manager only) provides access to:
- **Design System Showcase** (`/design-system-showcase`) - Comprehensive design pattern library with 12 dashboard variations
- **Dashboard Design Samples** (`/dashboard-samples`) - Interactive dashboard design gallery with 12+ layout variations (Clean Modern, Bold Minimal, etc.)
- **Design Samples** (`/design-samples`) - Component showcase organized by category: Dashboards, Forms, Tables, Cards, Components
- **Contract Form Sample** (`/contract-form-sample`) - Full-featured contract form with type-ahead search implementation
- **Provider Comparison** (`/provider-comparison`) - Communication provider comparison tools
- **Field Style Showcase** (`/field-style-showcase`) - Input field styling patterns

The Sample menu uses localStorage persistence for open/close state and supports both expanded and collapsed sidebar modes with intelligent tooltip positioning.

#### Type-Ahead Search Pattern
All selection fields use a consistent **type-ahead search implementation** instead of traditional dropdowns:
- **Technology Stack:** Shadcn Popover + Command components
- **UX Pattern:** 
  - Trigger button with inline icon (left), text/selection (center), chevron indicator (right)
  - Click to open popover with instant search input
  - Real-time client-side filtering
  - Rich result displays with multiple data fields
  - Check icon for selected items
  - Auto-close on selection
  - Query clearing when popover closes
- **Styling Consistency:**
  - Icon on left: `h-4 w-4 text-muted-foreground`
  - Bottom border only: `border-b border-border pb-2`
  - Hover elevation: `hover-elevate` class
  - Active elevation: `active-elevate-2` class
  - Optimized popover widths (300-450px based on content)
- **Implementation Examples:**
  - Customer search: 400px popover, searches name (En/Ar), phone, email
  - Vehicle search: 450px popover, searches registration, make, model, year
  - Branch/Sponsor/Company search: 350px popover, searches bilingual names

#### Field Styling Pattern
All input fields follow a consistent inline icon pattern:
- Icon positioned on the left with muted foreground color
- Transparent input background
- Bottom border only (no full border)
- Proper spacing and alignment
- Consistent with type-ahead search triggers

### Technical Implementations
The frontend is built with React, TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, and Tailwind CSS, powered by Vite. The backend uses Node.js with TypeScript, Express.js, and Drizzle ORM. Authentication is internal via Passport.js with express-session and a PostgreSQL store. A modular route architecture, comprising 34 specialized modules and 300+ routes, ensures maintainability and scalability. The system implements comprehensive security hardening, including CSRF protection, PII sanitization, and robust business logic validation adhering to GDPR, PCI-DSS, and OWASP standards. Dual audit trails (`contractEdits` and `auditLogs`) are enforced by Drizzle ORM. A centralized financial calculation service (`contractFinancials.ts`) ensures consistent outstanding balance calculations.

#### Lazy Loading & Code Splitting
All pages (except Login) use React lazy loading with Suspense for optimal performance:
- Professional loading skeleton with spinner and text
- Protected route wrapper with authentication checks
- Automatic redirects for unauthenticated users
- Minimal initial bundle size

#### Cron Job Management
A production-ready **Automation Orchestrator** (`server/services/automationOrchestrator.ts`) manages 4 scheduled background jobs:
1. **Nightly Risk Score Calculation** (2:00 AM daily)
2. **Document Expiry Check** (8:00 AM daily)
3. **Contract Expiry Reminders** (9:00 AM daily)
4. **Payment Due Reminders** (10:00 AM daily)

**Laravel-Style Failure Notifications:** Comprehensive implementation guide available in `docs/CRON_FAILURE_NOTIFICATIONS.md` providing:
- Automatic failure detection with retry logic (exponential backoff)
- Professional HTML email notifications to system administrators
- Detailed stack traces, execution duration, and error diagnostics
- Multi-provider email support (SendGrid + Gmail SMTP failover)
- Consecutive failure tracking and configurable notification thresholds
- Timeout protection and graceful degradation
- **More features than Laravel's `emailOutputOnFailure()`** including retry logic, failure statistics, and timeout protection

### Feature Specifications
The system manages the full rental lifecycle with a 4-state workflow, automated financial calculations, and comprehensive reporting with universal RFC 4180 compliant CSV/PDF export. Key features include enhanced vehicle management (inspection, status sync, inter-branch transfers, UAE toll/fine tracking), a professional driver service module with UAE market compliance, a customer risk scoring system, document registry with automated expiry monitoring, and an automated multi-channel (email/SMS) bilingual reminders engine. A Campaign Management System allows for UI-driven, branch-scoped or organization-wide campaigns with RBAC and approval workflows. A production-ready automated notification system includes 30 pre-configured bilingual templates, smart template-driven notifications, multi-provider routing with failover, and comprehensive communication logging.

#### Sample & Demo Features
- **Complete Type-Ahead Search Implementation:** All 5 selection fields (Customer, Vehicle, Branch, Sponsor, Company) in ContractFormSample use Popover + Command pattern with consistent styling
- **Design Comparison Tools:** Card-based vs split-screen layout comparison with identical field styling patterns
- **Interactive Showcases:** Live demonstrations of design system components, field patterns, and provider configurations
- **Admin/Manager Access Only:** Sample menu restricted via RBAC for internal testing and design evaluation

### System Design Choices
The architecture emphasizes modularity, security, and scalability. The database schema, designed for UAE rental car operations, includes 63+ tables, a 4-state lifecycle, bilingual field storage, dual-layer audit trails, and a disable-only architecture. The backend is designed to support future mobile application integration. An automation orchestrator handles background jobs for risk scoring, document expiry, and reminders with **production-ready failure notification system**. A robust communications platform provides multi-provider SMS/Email infrastructure with priority-based routing and automatic failover. The notification system uses a non-blocking pattern, ensuring business operations are not hindered by notification failures.

#### Design System Consistency
- **Square Buttons:** All buttons use `rounded-none` for consistent Material Design 3 aesthetic
- **Inline Icons:** Left-aligned icons with muted foreground color throughout the application
- **Bottom Borders:** Input fields use bottom border only (no full border) for clean, modern appearance
- **Elevation System:** Consistent hover (`hover-elevate`) and active (`active-elevate-2`) states across all interactive elements
- **Popover Widths:** Optimized based on content complexity (300-450px range)

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
- **UI Components:** `@radix-ui/*` (Dialog, Popover, Command, etc.), `@tanstack/react-query`.
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`, `drizzle-zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`, `papaparse`.
- **Communications:** `@sendgrid/mail`, `nodemailer`, `twilio`.
- **Automation:** `node-cron`, `qrcode`, `jsonwebtoken`.

## Documentation Structure

### Primary Documentation
- **replit.md** (this file) - System architecture, user preferences, and technical decisions (authoritative source)
- **docs/MASTER_FEATURE_LIST.md** - Comprehensive feature catalog with 63+ database tables and 300+ API routes
- **docs/IMPLEMENTATION_STATUS.md** - Phase-by-phase implementation tracking and completion status

### Technical Guides
- **docs/CRON_FAILURE_NOTIFICATIONS.md** - Laravel-style cron job failure notification implementation guide
- **docs/ARCHITECTURE.md** - Detailed system architecture and design patterns
- **docs/TECHNICAL_DOCUMENTATION.md** - API specifications and technical details
- **docs/design_guidelines.md** - Frontend design system and styling guidelines

### Operational Documentation
- **docs/ADMIN_GUIDE.md** - System administrator guide
- **docs/USER_GUIDE.md** - End-user documentation
- **docs/OPERATIONAL_RUNBOOK.md** - Production operations guide
- **docs/MAINTENANCE_GUIDE.md** - System maintenance procedures

### Audit & Compliance
- **docs/COMPREHENSIVE_SYSTEM_AUDIT.md** - Complete system audit report
- **docs/SECURITY_AUDIT.md** - Security compliance and hardening report
- **docs/PRODUCTION_READINESS_REPORT.md** - Production deployment readiness assessment

## Recent Updates (November 2025)

### Type-Ahead Search Implementation
- ✅ Complete replacement of dropdown lists with searchable type-ahead fields
- ✅ Implemented in ContractFormSample for Customer, Vehicle, Branch, Sponsor, and Company selections
- ✅ 100% styling consistency across all 5 search implementations
- ✅ E2E tested and verified with playwright

### Cron Job Failure Notifications
- ✅ Comprehensive implementation guide created (docs/CRON_FAILURE_NOTIFICATIONS.md)
- ✅ Production-ready CronJobManager class with retry logic and timeout protection
- ✅ HTML email notifications with stack traces and diagnostics
- ✅ Integration with existing NotificationService for multi-provider email support
- ✅ Consecutive failure tracking and configurable thresholds

### Sample Menu Infrastructure
- ✅ Dedicated Sample section in sidebar with localStorage persistence
- ✅ Admin/Manager-only access control
- ✅ 6 demo pages for design comparison and testing (includes Dashboard Samples and Design Samples)
- ✅ Dashboard Design Samples: Interactive gallery with 12+ layout variations
- ✅ Design Samples: Component showcase (Dashboards, Forms, Tables, Cards, Components)
- ✅ Intelligent tooltip positioning for collapsed sidebar mode
- ✅ Bilingual navigation labels (English/Arabic)

### UI/UX Enhancements
- ✅ Square buttons (rounded-none) enforced across all components
- ✅ Consistent inline icon pattern with bottom borders
- ✅ Hover and active elevation states standardized
- ✅ Optimized popover widths for type-ahead searches
