# RCCMS - Rental Car Contract Management System

## Overview
RCCMS (Rental Car Contract Management System) is a generic, bilingual (English/Arabic) rental car contract management system built with React, Express, and PostgreSQL. It enables rental car companies to create, manage, and finalize rental contracts. It features role-based access control, immutability for finalized contracts, comprehensive audit logging, and Material Design principles with RTL/LTR layouts. The system supports a full rental lifecycle, from draft to closed, including payment tracking, vehicle return workflows, detailed company settings management, and complete contract timeline visualization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React with TypeScript, Wouter for routing, TanStack Query for state management, React Hook Form with Zod validation, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Design System:** Material Design 3 with cyan-blue primary, dual theme (light/dark), i18next for bilingual support (English/Arabic) with RTL/LTR switching, and specific font families (Inter, Cairo, JetBrains Mono).
- **UI/UX Decisions:** Hierarchical sidebar with collapsible sections (Masters, Reports, Audit, Settings) with localStorage state persistence (default collapsed on first visit), bilingual tooltips on header buttons (sidebar toggle, theme toggle, language toggle), full RTL/LTR layout with dynamic sidebar positioning (right side in Arabic, left side in English), comprehensive data visualization with recharts in all report pages, tabbed views for active/disabled lists, enhanced filtering, system error acknowledgment, full English/Arabic translations, Material Design 3 styling, semantic chart colors for status badges, and responsive design.
- **Key Features:** Context-based theme/language, custom hooks for authentication, shared Zod schemas, print functionality, contract lifecycle management, comprehensive timeline visualization, and route protection.

### Backend
- **Technology Stack:** Node.js with TypeScript, Express.js, Drizzle ORM, internal username/password authentication with Passport.js (passport-local), and express-session with PostgreSQL store.
- **API Design:** RESTful endpoints with `/api` prefix, role-based middleware, centralized error handling, and comprehensive audit logging for all contract operations.
- **Authentication & Authorization:** Internal username/password system, Passport.js, PostgreSQL-backed sessions, httpOnly/secure cookies. Role-based access (Admin, Manager, Staff, Viewer).
- **Security:** Role-based middleware, client-side role checks, environment variable for session secret, CSRF protection, and full proxy trust for Replit.
- **Audit Trails:** `contractEdits` table for field-level modifications with reason and before/after snapshots; `auditLogs` table for lifecycle events.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema Design:** Tables for `Sessions`, `Users`, `Customers`, `Vehicles`, `Sponsors`, `Companies`, `Contracts`, `Payments`, `Vehicle Inspections`, `Audit Logs`, `Contract Edits`, `Contract Counter`, `System Errors`, and `Company Settings`.
- **Key Design Decisions:** Draft vs. finalized status with immutability, bilingual field storage, auto-incrementing contract numbers, dual-layer audit trail, singleton pattern for global settings, master data pattern for key entities, and separate payment tracking.
- **Disable-Only Architecture:** Replaced all delete operations with disable/enable functionality for key entities, tracking `disabled`, `disabledBy`, `disabledAt` fields.

### Core Features
- **Comprehensive Rental Lifecycle:** Five states: `draft` → `confirmed` → `active` → `completed` → `closed`.
- **Contract Timeline:** Displays complete history with field edits and lifecycle events.
- **Automatic Fuel Charge Calculation:** Calculates fuel charges based on tank capacity, fuel type, and configurable pricing. Supports manual override.
- **Comprehensive Financial Settings:** Admin-only centralized configuration for rental rates, addon fees, and fuel pricing.
- **Automatic Vehicle Status Synchronization:** Real-time vehicle availability management integrated with contract lifecycle (rented/available).
- **Vehicle Return Workflow:** Captures odometer, fuel levels, condition notes, and calculates extra charges.
- **Payment Tracking System:** Comprehensive payment history with separate `payments` table for deposits, final payments, and refunds.
- **Customer Phone Validation:** Non-blocking duplicate phone number detection with warnings.
- **Complete Audit Logging:** Comprehensive audit trail for all CREATE, UPDATE, DELETE/disable/enable operations, and contract lifecycle events.
- **Company Settings Management:** Admin-only page for configuring bilingual company information and contract clauses.
- **Dashboard:** Displays critical metrics like active rentals, monthly revenue, overdue returns.
- **Advanced Analytics & Reporting:** Comprehensive reporting with data visualization using recharts library. Financial Reports include monthly revenue trends (line chart), revenue by status (pie chart), and payment method breakdown (pie chart). Operational Reports feature vehicle utilization analysis (bar chart) and contract status distribution (pie chart). Customer Reports display top customers by revenue (bar chart) and customer retention analysis (donut chart). All charts are responsive, bilingual-ready, and theme-compatible.
- **Report Export Functionality:** Full PDF and Excel export support for all four report types (Financial, Operational, Customer, Audit). Exports respect date range filters and include bilingual support (English/Arabic). Backend uses jsPDF v3.x with proper named export for PDF generation and xlsx library for Excel files. **Chart Visualization in Exports:** Charts from recharts are captured as images using html2canvas on the frontend, sent to backend via POST requests, and embedded in PDF exports (full images) and Excel exports (metadata sheet). Request body size limit increased to 10MB to accommodate base64-encoded chart images. Each report page has dedicated export buttons generating downloadable files with proper extensions (.pdf, .xlsx).
- **Sponsors & Companies Master Data:** Reusable records for individual and corporate sponsors.
- **Three Hirer Types:** Direct, with_sponsor (individual), from_company (corporate).
- **Professional PDF Integration:** Professional PDF generation for rental contracts with bilingual support.
- **Vehicle Inspection System:** Comprehensive pre-delivery and post-return vehicle inspection workflow with mandatory photo documentation. **Key Features:**
  - **Mandatory Pre-Delivery Inspection:** Contract activation requires completion of pre-delivery inspection with 6 mandatory photos (front, back, left, right, top, dashboard view)
  - **Strict Photo Validation:** Enforces exactly 6 unique photos at different angles - no duplicates allowed, validated on frontend and backend
  - **Automatic Photo Compression:** All photos automatically compressed to 1920x1080 resolution, 0.85 quality, JPEG format for optimal storage
  - **Inspection History View:** Complete inspection timeline with photo gallery, zoom capabilities, and inspection details (inspector name, odometer reading, fuel level, condition notes)
  - **Bilingual Support:** Full English/Arabic translations for all inspection labels, messages, and photo angles
  - **Comprehensive Audit Logging:** All inspection actions logged with full details (type, odometer, fuel level, photo count)
  - **JSONB Photo Storage:** Base64-encoded photos stored in JSONB column (MVP approach, ready for migration to object storage for scale)
  - **Inspector Tracking:** Automatic capture of inspector name, timestamp, and user authentication
  - **API Endpoints:** POST /api/contracts/:id/inspections (create), GET /api/contracts/:id/inspections (list), GET /api/inspections/:id (details)

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
- **Data Visualization:** `recharts` for responsive charts and graphs, `html2canvas` for capturing chart visualizations as images for export.
- **Export & Document Generation:** `jspdf` (v3.x with named export), `jspdf-autotable`, `xlsx` for PDF and Excel report exports.
## Generic System Architecture

**Important:** RCCMS is a completely generic rental car management system designed to be deployed for any rental car company worldwide.

### System Customization
- **Company Settings:** All company-specific information is configurable through the admin panel (Company Settings page)
- **Bilingual Fields:** Company name, address, and contract clauses can be set in both English and Arabic
- **No Code Changes Required:** Any rental car company can deploy and customize RCCMS without modifying source code
- **Default Data:** The system includes sample data for demonstration purposes only

### Configuration Options
Companies can configure:
- Company legal name (English & Arabic)
- Business registration numbers
- Contact information (address, phone, email, website)
- Contract terms and conditions (bilingual)
- Rental rates and pricing
- Fuel pricing by type
- Contract PDF branding and layout

**Developer Information:**
- **Developer:** AKN Consulting
- **Support:** +91 9400750821, rccms@akn-consulting.com
- **Location:** Muttathu, Thattayil, Pathanamthitta - 691525, Kerala, India
