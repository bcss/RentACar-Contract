# RCCMS Environment Variables Catalog

**Document Version:** 1.0  
**Last Updated:** November 20, 2025  
**Purpose:** Complete catalog of all environment variables used in RCCMS  
**Status:** ✅ COMPREHENSIVE - ALL VARIABLES DOCUMENTED

---

## Executive Summary

This document catalogs all environment variables required for RCCMS deployment, development, and operation. Environment variables are used for configuration, secrets management, and deployment-specific settings.

### Variable Summary

**Total Environment Variables:** 12  
**Required Variables:** 3  
**Optional Variables:** 9  
**Security Secrets:** 3 (SESSION_SECRET, DATABASE_URL, SUPER_ADMIN_PASSWORD)

**Categories:**
- Database Configuration (1 variable)
- Authentication & Security (5 variables)
- Replit Platform (4 variables)
- Application Configuration (2 variables)

---

## 1. Required Environment Variables ⚠️

These variables MUST be set for the application to function:

### 1.1 DATABASE_URL

**Category:** Database Configuration  
**Type:** Secret (Connection String)  
**Required:** ✅ YES  
**Default:** None (will throw error if missing)

**Purpose:**  
PostgreSQL database connection string for Neon serverless database.

**Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
DATABASE_URL=postgresql://user:pass@ep-cool-forest-123456.us-east-1.aws.neon.tech/rccms?sslmode=require
```

**Usage Locations:**
- `server/db.ts` (line 8-14) - Database connection pool initialization
- `server/auth/localAuth.ts` (line 31) - Session store configuration
- `server/replitAuth.ts` (line 46) - Session store configuration

**Error if Missing:**
```
Error: DATABASE_URL environment variable is not set
```

**Related Variables:**  
PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGUSER (auto-extracted from DATABASE_URL)

---

### 1.2 SESSION_SECRET

**Category:** Authentication & Security  
**Type:** Secret (Random String)  
**Required:** ✅ YES  
**Default:** None (will throw error if missing)

**Purpose:**  
Secret key for encrypting session cookies. Must be a strong random string.

**Format:**
```
SESSION_SECRET=[64-character random hex string]
```

**Example:**
```
SESSION_SECRET=a1b2c3d4e5f6789012345678901234567890abcdefabcdef1234567890abcdef
```

**Generation:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Usage Locations:**
- `server/auth/localAuth.ts` (line 37) - Express session configuration
- `server/replitAuth.ts` (line 52) - Express session configuration
- `server/services/qrCodeService.ts` (line 12) - JWT secret fallback

**Security:**
- MUST be unique per environment
- MUST NOT be committed to version control
- MUST be at least 32 bytes (64 hex characters)
- Changing this invalidates all existing sessions

**Error if Missing:**
```
TypeError: Cannot read property 'SESSION_SECRET' of undefined
```

---

### 1.3 SUPER_ADMIN_PASSWORD

**Category:** Authentication & Security  
**Type:** Secret (Password)  
**Required:** ✅ YES (in production)  
**Default:** "Admin@123456" (development only)

**Purpose:**  
Password for the super admin account created on first startup.

**Format:**
```
SUPER_ADMIN_PASSWORD=[strong password]
```

**Example:**
```
SUPER_ADMIN_PASSWORD=MyStr0ng@AdminP@ssw0rd!2025
```

**Security Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Usage Locations:**
- `server/auth/seedSuperAdmin.ts` (line 9, 18, 30, 52) - Super admin account creation

**Behavior:**
- **Production:** REQUIRED - Application logs warning if not set
- **Development:** OPTIONAL - Falls back to "Admin@123456" with console warning

**Console Warnings:**
```
⚠️  WARNING: SUPER_ADMIN_PASSWORD not set in production! Using default password.
⚠️  Please set SUPER_ADMIN_PASSWORD environment variable for production security.
```

---

## 2. Optional Environment Variables (Platform-Specific)

### 2.1 REPLIT_DOMAINS

**Category:** Replit Platform  
**Type:** String (comma-separated domains)  
**Required:** ❌ NO (Replit auto-injects)  
**Default:** None (auto-provided by Replit)

**Purpose:**  
Comma-separated list of allowed domains for Replit OAuth callback URLs.

**Format:**
```
REPLIT_DOMAINS=app1.replit.dev,app2.replit.dev
```

**Usage Locations:**
- `server/replitAuth.ts` (line 11) - OAuth redirect URI validation

**Behavior:**
- If missing: Falls back to internal OAuth if ISSUER_URL exists
- Auto-injected by Replit platform on deployment

**Notes:**
- Only relevant when using Replit Authentication
- Not needed for local development with internal auth

---

### 2.2 ISSUER_URL

**Category:** Replit Platform  
**Type:** URL  
**Required:** ❌ NO (Replit auto-injects)  
**Default:** "https://replit.com/oidc"

**Purpose:**  
OIDC issuer URL for Replit authentication.

**Format:**
```
ISSUER_URL=https://replit.com/oidc
```

**Usage Locations:**
- `server/replitAuth.ts` (line 18) - OIDC client configuration

**Behavior:**
- If missing: Falls back to "https://replit.com/oidc"
- Auto-injected by Replit platform on deployment

---

### 2.3 REPL_ID

**Category:** Replit Platform  
**Type:** String (UUID)  
**Required:** ❌ NO (Replit auto-injects)  
**Default:** None (auto-provided by Replit)

**Purpose:**  
Unique identifier for the Replit application (used as OAuth client_id).

**Format:**
```
REPL_ID=12345678-1234-1234-1234-123456789abc
```

**Usage Locations:**
- `server/replitAuth.ts` (line 19, 138) - OIDC client ID

**Behavior:**
- Auto-injected by Replit platform on deployment
- Not needed for local development with internal auth

---

### 2.4 REPLIT_DEV_DOMAIN

**Category:** Replit Platform  
**Type:** String (domain)  
**Required:** ❌ NO (Replit auto-injects)  
**Default:** None (auto-provided by Replit)

**Purpose:**  
Replit development domain for QR code URL generation.

**Format:**
```
REPLIT_DEV_DOMAIN=myapp.username.replit.dev
```

**Usage Locations:**
- `server/services/qrCodeService.ts` (line 14-15) - QR code base URL

**Behavior:**
- If missing: QR code URLs use relative paths
- Auto-injected by Replit platform on deployment

---

## 3. Optional Environment Variables (Application)

### 3.1 PORT

**Category:** Application  
**Type:** Integer  
**Required:** ❌ NO  
**Default:** 5000

**Purpose:**  
HTTP server port for the Express backend.

**Format:**
```
PORT=5000
```

**Example:**
```
PORT=3000
```

**Usage Locations:**
- `server/index.ts` (line 161) - Server startup

**Behavior:**
- If missing: Defaults to 5000
- Must be an integer between 1024-65535

**Notes:**
- Frontend MUST bind to port 5000 (hardcoded in Vite config)
- Changing this may break frontend/backend communication

---

### 3.2 NODE_ENV

**Category:** Application  
**Type:** String (enum)  
**Required:** ❌ NO  
**Default:** "development"

**Purpose:**  
Application environment mode (affects logging, error handling, defaults).

**Format:**
```
NODE_ENV=production
```

**Valid Values:**
- `production` - Production mode
- `development` - Development mode
- `test` - Testing mode

**Usage Locations:**
- `server/auth/seedSuperAdmin.ts` (line 5) - Super admin password validation

**Behavior:**
- **production:** Enforces strong SUPER_ADMIN_PASSWORD requirement
- **development:** Allows default passwords with warnings
- **test:** Similar to development

**Example:**
```bash
# Production deployment
NODE_ENV=production npm start

# Local development
NODE_ENV=development npm run dev
```

---

## 4. Optional Environment Variables (Authentication & Security)

### 4.1 SESSION_MAX_AGE

**Category:** Authentication & Security  
**Type:** Integer (milliseconds)  
**Required:** ❌ NO  
**Default:** 3600000 (1 hour)

**Purpose:**  
Maximum session lifetime in milliseconds.

**Format:**
```
SESSION_MAX_AGE=3600000
```

**Example Values:**
```
SESSION_MAX_AGE=1800000   # 30 minutes
SESSION_MAX_AGE=3600000   # 1 hour (default)
SESSION_MAX_AGE=7200000   # 2 hours
SESSION_MAX_AGE=86400000  # 24 hours
```

**Usage Locations:**
- `server/auth/localAuth.ts` (line 14, 21) - Session cookie maxAge
- `server/replitAuth.ts` (line 29, 36) - Session cookie maxAge

**Behavior:**
- If missing: Defaults to 3600000ms (1 hour)
- If invalid (non-numeric): Logs warning and defaults to 1 hour

**Console Warnings:**
```
⚠️  Invalid SESSION_MAX_AGE: abc. Using default: 1 hour (3600000ms)
```

**Security Considerations:**
- Shorter sessions = better security (reduces hijacking window)
- Longer sessions = better UX (less frequent re-authentication)
- Recommended range: 1-4 hours for production

---

### 4.2 JWT_SECRET

**Category:** Authentication & Security  
**Type:** Secret (Random String)  
**Required:** ❌ NO  
**Default:** Falls back to SESSION_SECRET

**Purpose:**  
Secret key for signing JWT tokens used in QR code contract verification.

**Format:**
```
JWT_SECRET=[64-character random hex string]
```

**Example:**
```
JWT_SECRET=fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
```

**Usage Locations:**
- `server/services/qrCodeService.ts` (line 12) - JWT signing/verification

**Behavior:**
- If missing: Falls back to SESSION_SECRET
- If both missing: Falls back to hardcoded default (NOT SECURE)

**Fallback Chain:**
```
JWT_SECRET → SESSION_SECRET → 'rccms-jwt-secret-change-in-production'
```

**Security:**
- SHOULD be set separately from SESSION_SECRET for separation of concerns
- MUST be set in production (do not rely on fallback)
- Changing this invalidates all existing QR code tokens

---

### 4.3 SUPER_ADMIN_USERNAME

**Category:** Authentication & Security  
**Type:** String  
**Required:** ❌ NO  
**Default:** "superadmin"

**Purpose:**  
Username for the super admin account created on first startup.

**Format:**
```
SUPER_ADMIN_USERNAME=admin
```

**Example:**
```
SUPER_ADMIN_USERNAME=ceo
SUPER_ADMIN_USERNAME=systemadmin
```

**Usage Locations:**
- `server/auth/seedSuperAdmin.ts` (line 6) - Super admin account creation

**Behavior:**
- If missing: Defaults to "superadmin"
- Used only on first startup (if no super admin exists)

---

## 5. PostgreSQL Connection Details (Platform-Provided, Not Used by Application)

**Note:** The following variables are available in the Replit environment but are **NOT referenced by the application code**. The application uses `DATABASE_URL` directly.

These variables are automatically extracted from `DATABASE_URL` by the Replit platform and may be useful for external tools (e.g., psql CLI), but RCCMS does not read them:

- **PGDATABASE** - Database name (from DATABASE_URL)
- **PGHOST** - Server hostname (from DATABASE_URL)
- **PGPASSWORD** - User password (from DATABASE_URL)
- **PGPORT** - Server port (from DATABASE_URL)
- **PGUSER** - Username (from DATABASE_URL)

**Application Usage:** ❌ NONE (application uses DATABASE_URL directly via Drizzle ORM)  
**External Tool Usage:** ✅ Available for psql CLI, pgAdmin, etc.

---

## 6. Environment Variable Security

### 6.1 Secret Variables (Never Commit!)

| Variable | Sensitivity | Risk if Exposed |
|----------|-------------|----------------|
| `DATABASE_URL` | 🔴 CRITICAL | Complete database access |
| `SESSION_SECRET` | 🔴 CRITICAL | Session hijacking |
| `SUPER_ADMIN_PASSWORD` | 🔴 CRITICAL | Admin account takeover |
| `JWT_SECRET` | 🟠 HIGH | QR code forgery |
| `PG*` variables | 🔴 CRITICAL | Database access |

### 6.2 Security Best Practices

**DO:**
- ✅ Use strong random secrets (min 32 bytes)
- ✅ Use different secrets per environment (dev/staging/prod)
- ✅ Rotate secrets periodically (quarterly)
- ✅ Store secrets in Replit Secrets or environment vault
- ✅ Use .env.local for local development (gitignored)

**DON'T:**
- ❌ Commit secrets to version control (.env files)
- ❌ Share secrets via email/chat
- ❌ Use weak or default passwords in production
- ❌ Reuse secrets across environments
- ❌ Log secret values in application logs

---

## 7. Environment Setup

### 7.1 Replit Deployment (Recommended)

**Automatic Platform Variables:**
Replit automatically injects these platform-specific variables:
- `REPLIT_DOMAINS`, `REPL_ID`, `ISSUER_URL`, `REPLIT_DEV_DOMAIN` (for Replit Auth)
- `PG*` variables (extracted from DATABASE_URL for CLI tools)

**Required Manual Setup in Replit Secrets:**
You MUST manually configure these secrets:
```
DATABASE_URL=postgresql://... (from Neon integration)
SESSION_SECRET=generate-with-crypto-randomBytes
SUPER_ADMIN_PASSWORD=your-strong-password
```

**Optional Manual Setup:**
```
JWT_SECRET=your-jwt-secret (optional, fallsback to SESSION_SECRET)
SESSION_MAX_AGE=3600000 (optional, defaults to 1 hour)
SUPER_ADMIN_USERNAME=admin (optional, defaults to "superadmin")
NODE_ENV=production (optional, defaults to "development")
```

### 7.2 Local Development

Create `.env.local` file (gitignored):
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/rccms

# Security
SESSION_SECRET=generate-with-crypto-randomBytes-32-hex
SUPER_ADMIN_PASSWORD=Admin@123456

# Optional
PORT=5000
NODE_ENV=development
SESSION_MAX_AGE=3600000
SUPER_ADMIN_USERNAME=superadmin
```

**Load with:**
```bash
# Using dotenv
npm install dotenv
node -r dotenv/config server/index.ts
```

### 7.3 Production Deployment (Non-Replit)

**Required Secrets:**
```bash
# CRITICAL - Must be set
DATABASE_URL=postgresql://...
SESSION_SECRET=<64-char-hex>
SUPER_ADMIN_PASSWORD=<strong-password>

# Recommended
NODE_ENV=production
JWT_SECRET=<64-char-hex>
SESSION_MAX_AGE=3600000
```

**Environment Variables:**
```bash
# Application
PORT=5000
NODE_ENV=production

# Optional
SUPER_ADMIN_USERNAME=admin
```

---

## 8. Variable Usage Matrix

### 8.1 By File

| File | Variables Used |
|------|---------------|
| `server/index.ts` | PORT |
| `server/db.ts` | DATABASE_URL |
| `server/auth/localAuth.ts` | DATABASE_URL, SESSION_SECRET, SESSION_MAX_AGE |
| `server/replitAuth.ts` | REPLIT_DOMAINS, ISSUER_URL, REPL_ID, DATABASE_URL, SESSION_SECRET, SESSION_MAX_AGE |
| `server/auth/seedSuperAdmin.ts` | NODE_ENV, SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD |
| `server/services/qrCodeService.ts` | JWT_SECRET, SESSION_SECRET, REPLIT_DEV_DOMAIN |

### 8.2 By Category

**Database (1 variable):**
- DATABASE_URL (required)

**Note:** PG* variables (PGDATABASE, PGHOST, etc.) are platform-provided but NOT used by application

**Authentication & Security (5 variables):**
- SESSION_SECRET (required)
- SUPER_ADMIN_PASSWORD (required in production)
- JWT_SECRET (optional)
- SESSION_MAX_AGE (optional)
- SUPER_ADMIN_USERNAME (optional)

**Replit Platform (4 variables):**
- REPLIT_DOMAINS (auto)
- ISSUER_URL (auto)
- REPL_ID (auto)
- REPLIT_DEV_DOMAIN (auto)

**Application (2 variables):**
- PORT (optional)
- NODE_ENV (optional)

**Authentication & Security (3 variables):**
- SESSION_MAX_AGE (optional)
- JWT_SECRET (optional)
- SUPER_ADMIN_USERNAME (optional)

---

## 9. Frontend Environment Variables

**Status:** ❌ NONE CURRENTLY USED

The frontend currently uses NO environment variables (no `import.meta.env.*` references found).

**Future Considerations:**
If frontend environment variables are needed, they MUST be prefixed with `VITE_`:
```
VITE_API_URL=https://api.example.com
VITE_FEATURE_FLAG_NEW_UI=true
```

**Access in Frontend:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Security Warning:**
- Frontend env vars are PUBLIC (embedded in client bundle)
- NEVER put secrets in VITE_* variables
- All Vite env vars are visible to users in browser

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue:** "DATABASE_URL environment variable is not set"  
**Solution:** Set DATABASE_URL in Replit Secrets or .env.local

**Issue:** "Session secret must be set"  
**Solution:** Set SESSION_SECRET (64-char random hex)

**Issue:** Invalid SESSION_MAX_AGE warning  
**Solution:** Use numeric value in milliseconds (e.g., 3600000)

**Issue:** Super admin password too weak in production  
**Solution:** Set strong SUPER_ADMIN_PASSWORD meeting complexity requirements

**Issue:** QR codes don't work  
**Solution:** Set JWT_SECRET or ensure SESSION_SECRET is set

---

### 10.2 Verification Checklist

**Pre-Deployment:**
- [ ] DATABASE_URL set and valid
- [ ] SESSION_SECRET set (64-char hex)
- [ ] SUPER_ADMIN_PASSWORD set and strong (production)
- [ ] NODE_ENV=production
- [ ] JWT_SECRET set (recommended)
- [ ] SESSION_MAX_AGE configured appropriately
- [ ] No secrets in version control
- [ ] All secrets unique per environment

**Post-Deployment:**
- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Super admin account created
- [ ] Sessions work correctly
- [ ] QR codes generate properly

---

## 11. Security Audit Trail

### 11.1 Secret Rotation Schedule

| Secret | Last Rotation | Next Rotation | Frequency |
|--------|--------------|---------------|-----------|
| SESSION_SECRET | N/A | Q1 2026 | Quarterly |
| JWT_SECRET | N/A | Q1 2026 | Quarterly |
| SUPER_ADMIN_PASSWORD | N/A | As needed | On compromise |
| DATABASE_URL | N/A | As needed | On migration |

### 11.2 Access Control

**Who Can Access Secrets:**
- Super Admin: All secrets
- DevOps Team: All secrets
- Developers: Development secrets only
- End Users: None

**Secret Storage:**
- Replit: Replit Secrets (encrypted at rest)
- Local: .env.local (gitignored, local only)
- Production: Environment vault / KMS

---

## 12. Future Enhancements

### 12.1 Planned Environment Variables

**Phase 1: Communications (Q1 2026)**
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
```

**Phase 2: External Services (Q2 2026)**
```
STRIPE_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

**Phase 3: Monitoring (Q3 2026)**
```
SENTRY_DSN=...
LOG_LEVEL=info
DATADOG_API_KEY=...
```

---

## Changelog

### Version 1.1 (November 20, 2025)
- Fixed categorization: Separated Application variables from Auth/Security variables
- Reorganized Section 3 (Application: PORT, NODE_ENV)
- Created Section 4 (Auth/Security: SESSION_MAX_AGE, JWT_SECRET, SUPER_ADMIN_USERNAME)
- Corrected variable counts in summary (2 Application + 3 Auth/Security = 5 optional auth variables total)

### Version 1.0 (November 20, 2025)
- Initial environment variables catalog
- Documented all 12 environment variables
- Categorized by purpose and requirement level
- Added security best practices
- Created setup guides for Replit and local development
- Added troubleshooting section
- Established secret rotation schedule

---

**Document Status:** ✅ CURRENT AND ACCURATE  
**Next Review:** February 20, 2026 (Quarterly Review)  
**Maintained By:** RCCMS DevOps Team  
**Last Verified:** November 20, 2025

---

**Related Documents:**
- `SECURITY_AUDIT.md` - Security controls and compliance
- `DOCUMENT_INDEX.md` - Complete documentation catalog
- `.gitignore` - Ensure .env files are excluded
