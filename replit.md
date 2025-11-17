# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a production-ready, bilingual (English/Arabic) rental car management platform for multi-branch operations and driver services. It streamlines the entire rental lifecycle through a 4-state workflow (Draft → Active → Completed → Closed) and features role-based access control, robust security, dual audit trails, insurance claims tracking, and inter-branch vehicle transfers. The system includes a driver service module with emirate-aware surcharge calculations and extensive administrative configurations. RCCMS is designed for global deployment without source code modifications, integrates Material Design principles, supports RTL/LTR layouts, and its backend is prepared for future mobile applications. The project aims to provide a comprehensive, secure, and user-friendly solution for rental car businesses, enhancing operational efficiency and market reach.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter, TanStack Query, React Hook Form with Zod, Radix UI/shadcn/ui, Tailwind CSS, Vite.
- **Design System:** Material Design 3 (cyan-blue primary), dual theme (light/dark), i18next for English/Arabic with RTL/LTR, custom fonts.
- **UI/UX Decisions:** Hierarchical sidebar, bilingual tooltips, full RTL/LTR layout, data visualization (recharts), tabbed views, enhanced filtering, responsive design, context-based theme/language, custom authentication hooks, shared Zod schemas, print functionality.
- **Key Features:** Dashboard with personalized greetings and role badges, tabbed dialog forms for improved UX, advanced analytics, and reporting with PDF/Excel export.
- **Branch & Driver Management:** Full CRUD pages for Branches, Public Holidays, Drivers, Driver Companies, and Vehicle Transfers with tabbed dialogs, status filtering, and bilingual support. Integrated Driver Service placeholders in ContractForm and ContractView for future driver assignment functionality.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js, express-session with PostgreSQL store.
- **API Design:** RESTful endpoints, role-based middleware, centralized error handling, comprehensive audit logging.
- **Authentication & Authorization:** Internal username/password system with Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies, role-based access (Admin, Manager, Staff, Viewer).
- **Security Hardening:** Session fixation, CSRF protection, PII sanitization, password complexity/rotation, security headers (Helmet.js), robust business logic validation, GDPR, PCI-DSS, and OWASP Top 10:2021 standards.
- **Audit Trails:** `contractEdits` for field-level modifications and `auditLogs` for lifecycle events.
- **Drizzle ORM Patterns:** Enforces type safety and audit trails for all create operations.
- **Mobile Backend Infrastructure:** 29 RESTful endpoints prepared for future mobile apps, with customer-facing endpoints protected by `requireCustomerAuth` middleware.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for Users, Customers, Vehicles, Contracts, Payments, supporting a 4-state lifecycle, bilingual field storage, auto-incrementing identifiers, dual-layer audit trail, singleton pattern for global settings, and disable-only architecture.

### Core Features
- **Rental Lifecycle Management:** Streamlined 4-state workflow, hardened edit validation, contract timeline with ContractTimeline component.
- **Financials:** Automated calculations (fuel, advance payment), configurable financial settings, enhanced payment tracking.
- **Reporting & Analytics:** Comprehensive reporting with `recharts`, PDF/Excel export, including Revenue Trends, Fleet Performance, Contract Analytics, Collection Performance, Driver Utilization Report, and Driver Revenue vs. Cost Analysis. Real-time driver availability dashboard widget with lightweight analytics endpoint.
- **System Management:** Company settings management, dynamic system health monitoring, error logging, support & help center.
- **Vehicle Management:** Enhanced vehicle inspection, automatic vehicle status synchronization, inter-branch vehicle transfers with complete UI workflow (request, approve/reject, complete).
- **Driver Service Module:** Professional driver assignment backend infrastructure, UAE market compliance (surcharge calculation, public holidays), driver master data with full CRUD UI, outsource companies management page, rate cards, schedule management, and assignment tracking. Driver Service sections added to ContractForm and ContractView (placeholders for future full implementation). Complete driver reporting system with utilization tracking, revenue vs. cost analysis, and real-time availability monitoring. Active driver filtering ensures accurate KPIs across all reports and dashboards.
- **Branch Management System:** Multi-location operational support with comprehensive branch hierarchy UI, branch-scoped data access, and inter-branch vehicle transfer workflow with dedicated VehicleTransfers page (create, approve, reject, complete transfers).
- **Public Holidays Management:** Full CRUD interface for managing UAE public holidays with emirate selection and active status, integrated with driver surcharge calculations.
- **Security & Compliance:** App access logging with IP geolocation, granular role-based permissions for features and reports.
- **Data Handling:** Import data functionality (Superadmin Only) for bulk master data and contracts with transaction-based atomicity.
- **PDF Integration:** Professional bilingual PDF generation for rental contracts with RTA compliance fields.
- **Internationalization:** Complete English/Arabic translations for all Branch Management and Driver Service features via i18next.

## External Dependencies

### Third-Party Services
- **Neon Database:** Serverless PostgreSQL hosting.
- **Google Fonts:** Inter, Cairo, and JetBrains Mono.
- **Material Icons:** Icon library.

### Key NPM Packages
- **Database:** `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`.
- **Authentication:** `passport`, `passport-local`, `bcrypt`, `express-session`, `connect-pg-simple`.
- **UI Components:** `@radix-ui/*`, `@tanstack/react-query`.
- **Form Handling:** `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Internationalization:** `i18next`, `react-i18next`.
- **Styling:** `tailwindcss`, `class-variance-authority`, `clsx`.
- **Data Visualization:** `recharts`, `html2canvas`.
- **Export & Document Generation:** `jspdf`, `jspdf-autotable`, `xlsx`.