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

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Authentication:** Replit Auth with OpenID Connect
- **Session Management:** express-session with PostgreSQL store (connect-pg-simple)

**API Design:**
- RESTful endpoints under `/api` prefix
- Role-based middleware (isAuthenticated, requireAdmin, requireManagerOrAdmin)
- Centralized error handling
- Audit logging for all contract operations
- Request/response logging for debugging

**Key Architectural Decisions:**
- Middleware-based authentication flow integrated with Replit's OAuth
- Storage abstraction layer (IStorage interface) for database operations
- Shared schema validation between client and server using Zod
- Atomic contract number generation using database counter

### Data Storage

**Database:** PostgreSQL (via Neon serverless)

**Schema Design:**

1. **Sessions Table** - Required for Replit Auth session persistence
2. **Users Table** - Stores user profiles with role-based access (admin, manager, staff, viewer)
3. **Contracts Table** - Core entity with bilingual fields, status tracking (draft/finalized), and comprehensive rental details
4. **Audit Logs Table** - Immutable activity log for compliance and tracking
5. **Contract Counter Table** - Ensures unique, sequential contract numbers

**Key Design Decisions:**
- Draft vs. finalized status with immutability enforcement at application level
- Bilingual field storage (separate columns for English/Arabic content)
- Auto-incrementing contract numbers independent of primary keys
- Comprehensive audit trail including user ID, action type, IP address, and details

### Authentication & Authorization

**Authentication Flow:**
- Replit OAuth integration using OpenID Connect
- Automatic user creation/update on first login
- Session-based authentication with PostgreSQL backing store
- Secure cookie configuration (httpOnly, secure, 1-week TTL)

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

### External Dependencies

**Third-Party Services:**
- **Neon Database:** Serverless PostgreSQL hosting
- **Replit Auth:** OAuth-based authentication provider
- **Google Fonts:** Inter, Cairo, and JetBrains Mono font families
- **Material Icons:** Icon library for UI elements

**Key NPM Packages:**
- **Database:** @neondatabase/serverless, drizzle-orm, drizzle-kit
- **Authentication:** openid-client, passport, express-session, connect-pg-simple
- **UI Components:** @radix-ui/* family, @tanstack/react-query
- **Form Handling:** react-hook-form, @hookform/resolvers, zod
- **Internationalization:** i18next, react-i18next
- **Styling:** tailwindcss, class-variance-authority, clsx

**Development Tools:**
- TypeScript for type safety across full stack
- Vite for fast development builds and HMR
- ESBuild for production server bundling
- Replit-specific plugins for development experience