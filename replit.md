# Rental Car Contract Management System

## Overview

This is a bilingual (English/Arabic) rental car contract management system built with React, Express, and PostgreSQL. The application enables users to create, manage, and finalize rental contracts with role-based access control. Once finalized, contracts become immutable to ensure data integrity and compliance. The system includes comprehensive audit logging and supports Material Design principles with RTL/LTR layouts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **Forms:** React Hook Form with Zod validation
- **UI Components:** Radix UI primitives with shadcn/ui components
- **Styling:** Tailwind CSS with custom CSS variables for theming
- **Build Tool:** Vite

**Design System:**
- Material Design-inspired component library
- Dual theme support (light/dark mode) with CSS custom properties
- Bilingual support with i18next for internationalization
- RTL/LTR layout switching for Arabic/English
- Font families: Inter (Latin), Cairo (Arabic), JetBrains Mono (monospace)
- Comprehensive color palette with semantic colors for contract statuses

**Key Features:**
- Context-based theme and language management
- Custom hooks for authentication and authorization
- Form validation using Zod schemas shared with backend
- Responsive layouts with mobile support
- Print functionality with audit logging and bilingual support
- Contract lifecycle management (draft → finalized with immutability)

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Authentication:** Internal username/password authentication with Passport.js (passport-local strategy)
- **Session Management:** express-session with PostgreSQL store (connect-pg-simple)

**API Design:**
- RESTful endpoints under `/api` prefix
- Role-based middleware (isAuthenticated, requireAdmin, requireManagerOrAdmin)
- Centralized error handling
- Audit logging for all contract operations
- Request/response logging for debugging

**Key Architectural Decisions:**
- Middleware-based authentication flow with Passport.js local strategy
- Password security using bcrypt with 12+ rounds of hashing
- Storage abstraction layer (IStorage interface) for database operations
- Shared schema validation between client and server using Zod
- Atomic contract number generation using database counter

### Data Storage

**Database:** PostgreSQL (via Neon serverless)

**Schema Design:**

1. **Sessions Table** - Required for session persistence
2. **Users Table** - Stores user credentials (username, passwordHash) and profiles with role-based access (admin, manager, staff, viewer)
3. **Contracts Table** - Core entity with bilingual fields, status tracking (draft/finalized), and comprehensive rental details
4. **Audit Logs Table** - Immutable activity log for compliance and tracking
5. **Contract Counter Table** - Ensures unique, sequential contract numbers

**Key Design Decisions:**
- Draft vs. finalized status with immutability enforcement at application level
- Bilingual field storage (separate columns for English/Arabic content)
- Auto-incrementing contract numbers independent of primary keys
- Comprehensive audit trail including user ID, action type, IP address, and details

### Authentication & Authorization

**Authentication System:**
- **Type:** Internal username/password authentication (no external OAuth)
- **Strategy:** Passport.js with passport-local strategy
- **Password Security:** bcrypt hashing with 12+ rounds
- **Session Storage:** PostgreSQL-backed sessions via connect-pg-simple
- **Cookie Configuration:** httpOnly, secure, 1-week TTL
- **Super Admin:** Immutable admin account created at startup (username: "superadmin", default password: "Admin@123456")

**Authentication Flow:**
1. User submits username/password via POST /api/login
2. Passport verifies credentials against hashed passwords in database
3. Session created and stored in PostgreSQL
4. Session cookie set with httpOnly and secure flags
5. Subsequent requests authenticated via session middleware

**Authorization Model:**
- **Admin:** Full access including user management, contract finalization, audit logs
- **Manager:** Contract management and audit log viewing
- **Staff:** Contract creation and editing (own drafts)
- **Viewer:** Read-only access to contracts

**Security Measures:**
- Role-based middleware guards on routes
- Client-side role checking for UI rendering
- Session secret management via environment variables
- CSRF protection through session middleware
- Full proxy trust configuration for Replit environment (trust proxy: true)

**Recent Changes (October 2025):**

**Authentication System Overhaul:**
- **Replaced OAuth with Internal Authentication:** Completely removed Replit OAuth, implemented username/password authentication using Passport.js with bcrypt password hashing
- **Super Admin Account:** Created immutable super admin (username: "superadmin", default password: "Admin@123456") that cannot be deleted
- **User Management UI:** Built comprehensive admin interface for creating, editing, and deleting users with role assignment
- **Password Management:** Implemented secure password hashing, validation, and optional password changes during user edits
- **Database Schema Updates:** Added username, passwordHash, isImmutable, and lastPasswordChange fields to users table
- **Login Form:** Replaced OAuth button with username/password login form supporting both English and Arabic

**Previous Fixes:**
- Fixed Google login infinite loop by configuring Express to trust full Replit proxy chain (trust proxy: true)
- Fixed application loading state bug in useAuth hook to handle 401 responses gracefully
- Fixed date handling in contract forms to prevent "Invalid time value" errors
- Corrected CSS @page rule placement for proper 1cm print margins

### External Dependencies

**Third-Party Services:**
- **Neon Database:** Serverless PostgreSQL hosting
- **Google Fonts:** Inter, Cairo, and JetBrains Mono font families
- **Material Icons:** Icon library for UI elements

**Key NPM Packages:**
- **Database:** @neondatabase/serverless, drizzle-orm, drizzle-kit
- **Authentication:** passport, passport-local, bcrypt, express-session, connect-pg-simple
- **UI Components:** @radix-ui/* family, @tanstack/react-query
- **Form Handling:** react-hook-form, @hookform/resolvers, zod
- **Internationalization:** i18next, react-i18next
- **Styling:** tailwindcss, class-variance-authority, clsx

**Development Tools:**
- TypeScript for type safety across full stack
- Vite for fast development builds and HMR
- ESBuild for production server bundling
- Replit-specific plugins for development experience