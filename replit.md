# KarāraOS - Rental Car Contract Management System

## Overview
KarāraOS is a production-ready, bilingual (English/Arabic) rental car management platform for multi-branch operations and driver services. It streamlines the entire rental lifecycle, offering robust security, role-based access, dual audit trails, insurance claims, and inter-branch vehicle transfers. It includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. KarāraOS aims to boost operational efficiency and market reach for rental car businesses through a comprehensive, secure, and user-friendly solution, supporting global deployment and future mobile integration. The system also includes advanced analytics, predictive intelligence reports, and a campaign management system.

## User Preferences
Preferred communication style: Simple, everyday language.
Desktop-only application: 1024px minimum width (tablets in landscape + desktops), blocks phones.

## System Architecture

### UI/UX Decisions
The application is desktop-only with a minimum width of 1024px, ensuring a consistent experience on tablets (landscape) and desktops. It features a Material Design 3 (cyan-blue primary) aesthetic with dual light/dark themes. The UI supports full RTL/LTR layouts for English and Arabic, including bilingual tooltips, automatic direction switching, and localized CSV exports. Data visualization is handled by Recharts, offering enhanced filtering and tabbed views. Key UI components include a comprehensive Design System Showcase with 12 dashboard variations. The login screen features an animated subtitle rotation, a protected rental car illustration, and company branding.

### Technical Implementations
The frontend is built with React, TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, and Tailwind CSS, powered by Vite. The backend uses Node.js with TypeScript, Express.js, and Drizzle ORM. Authentication is internal via Passport.js with express-session and a PostgreSQL store. A modular route architecture, comprising 34 specialized modules and 300 routes, ensures maintainability and scalability. The system implements comprehensive security hardening, including CSRF protection, PII sanitization, and robust business logic validation adhering to GDPR, PCI-DSS, and OWASP standards. Dual audit trails (`contractEdits` and `auditLogs`) are enforced by Drizzle ORM. A centralized financial calculation service (`contractFinancials.ts`) ensures consistent outstanding balance calculations.

### Feature Specifications
The system manages the full rental lifecycle with a 4-state workflow, automated financial calculations, and comprehensive reporting with universal RFC 4180 compliant CSV/PDF export. Key features include enhanced vehicle management (inspection, status sync, inter-branch transfers, UAE toll/fine tracking), a professional driver service module with UAE market compliance, a customer risk scoring system, document registry with automated expiry monitoring, and an automated multi-channel (email/SMS) bilingual reminders engine. A Campaign Management System allows for UI-driven, branch-scoped or organization-wide campaigns with RBAC and approval workflows. A production-ready automated notification system includes 30 pre-configured bilingual templates, smart template-driven notifications, multi-provider routing with failover, and comprehensive communication logging.

### System Design Choices
The architecture emphasizes modularity, security, and scalability. The database schema, designed for UAE rental car operations, includes 40+ tables, a 4-state lifecycle, bilingual field storage, dual-layer audit trails, and a disable-only architecture. The backend is designed to support future mobile application integration. An automation orchestrator handles background jobs for risk scoring, document expiry, and reminders. A robust communications platform provides multi-provider SMS/Email infrastructure with priority-based routing and automatic failover. The notification system uses a non-blocking pattern, ensuring business operations are not hindered by notification failures.

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