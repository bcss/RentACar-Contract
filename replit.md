# KarāraOS - Rental Car Contract Management System

## Overview
KarāraOS is a production-ready, bilingual (English/Arabic) rental car management platform designed for multi-branch operations and driver services. It streamlines the entire rental lifecycle, offering robust security, role-based access, dual audit trails, insurance claims management, and inter-branch vehicle transfers. The system includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. KarāraOS aims to enhance operational efficiency, expand market reach, and supports global deployment, future mobile integration, advanced analytics, predictive intelligence, and campaign management.

## User Preferences
- **Communication Style:** Simple, everyday language.
- **Desktop-Only Application:** 1024px minimum width (tablets in landscape + desktops), blocks phones.
- **Button Style:** Square buttons with `rounded-none` class (not rounded corners).
- **Type-Ahead Search:** All dropdown selections use beautiful type-ahead search with Popover + Command pattern instead of traditional dropdown lists.

## System Architecture

### UI/UX Decisions
The application is a desktop-only platform with a minimum width of 1024px. It features a Material Design 3 (cyan-blue primary) aesthetic with dual light/dark themes and square buttons (`rounded-none`). The UI supports full RTL/LTR layouts for English and Arabic, including bilingual tooltips, automatic direction switching, and localized CSV exports. Data visualization is handled by Recharts. All selection fields consistently use a type-ahead search pattern (Shadcn Popover + Command) instead of traditional dropdowns, featuring real-time client-side filtering and rich result displays. Input fields follow a consistent inline icon pattern with a transparent background and a bottom border only. A dedicated "Sample Menu" (Admin/Manager only) provides access to a Design System Showcase, Dashboard Design Samples, Component Showcases, and a Contract Form Sample for testing and design comparison.

### Technical Implementations
The frontend is built with React, TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, and Tailwind CSS, powered by Vite. The backend uses Node.js with TypeScript, Express.js, and Drizzle ORM. Authentication is handled internally via Passport.js with express-session and a PostgreSQL store. The system utilizes a modular route architecture, comprising 34 specialized modules and 300+ routes. Security hardening includes CSRF protection, PII sanitization, and robust business logic validation adhering to GDPR, PCI-DSS, and OWASP standards. Dual audit trails (`contractEdits` and `auditLogs`) are enforced by Drizzle ORM. A centralized financial calculation service ensures consistent balance calculations. React lazy loading with Suspense is implemented for optimal performance.

### Deep Database Integrations (Master Spec Compliant)
- **Automation Orchestrator:** Database-driven cron job scheduling via `cron_job_definitions` table. Jobs are read from database with runtime configuration of schedules, enable/disable, and execution tracking. Status updates (lastRunAt, lastRunStatus, runCount, failureCount) persist to database. Hot-reload capability without server restart.
- **Sequences System:** Contract/invoice/receipt numbering via `sequences` table with configurable prefixes (KR-, INV-, RCP-), year inclusion, padding, and branch-specific or global scopes. Replaces legacy contract_counter.
- **Lookup Tables (12 total):** blacklist_entries, vehicle_classes, vehicle_groups, seasonal_tariffs, notification_purposes, notification_routes, cron_job_definitions, sequences, maintenance_jobs, addons, packages, package_addons - all with full CRUD APIs at /api/lookup/*

### Feature Specifications
The system manages the full rental lifecycle with a 4-state workflow, automated financial calculations, and comprehensive reporting with universal RFC 4180 compliant CSV/PDF export. Key features include enhanced vehicle management (inspection, status sync, inter-branch transfers, UAE toll/fine tracking), a professional driver service module compliant with the UAE market, a customer risk scoring system, a document registry with automated expiry monitoring, and an automated multi-channel (email/SMS) bilingual reminders engine. A Campaign Management System allows for UI-driven, branch-scoped or organization-wide campaigns with RBAC and approval workflows. A production-ready automated notification system includes 30 pre-configured bilingual templates, smart template-driven notifications, multi-provider routing with failover, and comprehensive communication logging.

### System Design Choices
The architecture emphasizes modularity, security, and scalability. The database schema is designed for UAE rental car operations, including 63+ tables, a 4-state lifecycle, bilingual field storage, dual-layer audit trails, and a disable-only architecture. The backend is designed to support future mobile application integration. The automation orchestrator handles background jobs with a production-ready failure notification system. A robust communications platform provides multi-provider SMS/Email infrastructure with priority-based routing and automatic failover, using a non-blocking pattern for notifications. Consistent design system elements include square buttons, inline icons, bottom-bordered input fields, a standardized elevation system, and optimized popover widths.

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
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`, `drizzle-zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`, `papaparse`.
- **Communications:** `@sendgrid/mail`, `nodemailer`, `twilio`.
- **Automation:** `node-cron`, `qrcode`, `jsonwebtoken`.