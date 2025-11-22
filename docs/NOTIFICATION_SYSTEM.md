# KarāraOS Notification & Campaign System

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [System Components](#system-components)
4. [Notification Templates](#notification-templates)
5. [Communication Providers](#communication-providers)
6. [Automated Triggers](#automated-triggers)
7. [Manual Notifications](#manual-notifications)
8. [Campaign Management](#campaign-management)
9. [Analytics & Monitoring](#analytics--monitoring)
10. [API Reference](#api-reference)
11. [Configuration Guide](#configuration-guide)
12. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Overview

The KarāraOS Notification & Campaign System is a production-ready, automated communication platform that handles all customer, driver, and staff notifications across the rental car lifecycle. The system features 30 pre-configured bilingual templates, multi-provider routing with automatic failover, comprehensive logging, and campaign analytics.

### Key Features

✅ **30 Pre-Configured Templates** covering Contract, Payment, Document, and Operational events  
✅ **Bilingual Support** (English/Arabic) with RTL/LTR layout awareness  
✅ **Multi-Provider Architecture** with automatic failover (Twilio SMS, SendGrid Email, Gmail SMTP)  
✅ **Automated Triggers** integrated into Contract, Payment, and Document lifecycles  
✅ **Manual Notification Sender** UI for ad-hoc communications  
✅ **Campaign Management** with approval workflow and scheduling  
✅ **Analytics Dashboard** with KPIs, charts, and provider health monitoring  
✅ **Communication Logs** with complete audit trail and delivery tracking  
✅ **Cost Tracking** for SMS and Email communications  
✅ **Non-Blocking Design** ensures business operations never fail due to notification errors

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Business Operations                       │
│         (Contract Create, Payment Record, etc.)              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ Non-Blocking Trigger
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Notification Trigger Service                    │
│  (Template Lookup, Variable Substitution, Rendering)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ Template Rendering
                 │
┌────────────────▼────────────────────────────────────────────┐
│            Enhanced Provider Selector                        │
│  (Priority Selection, Health Monitoring, Failover)           │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌───────────────┐  ┌───────────────┐
│  SMS Provider │  │ Email Provider│
│   (Twilio)    │  │  (SendGrid)   │
└───────┬───────┘  └───────┬───────┘
        │                  │
        ▼                  ▼
┌───────────────────────────────────┐
│     Communication Logs            │
│  (Audit Trail, Delivery Status)   │
└───────────────────────────────────┘
```

### Design Principles

1. **Non-Blocking**: Notification failures never block core business operations
2. **Fail-Safe**: Automatic provider failover ensures delivery reliability
3. **Auditable**: Every notification logged with complete metadata
4. **Extensible**: Template-driven system allows easy addition of new notification types
5. **Cost-Aware**: Provider selection considers cost alongside reliability

---

## System Components

### 1. Notification Templates (`server/seedNotificationTemplates.ts`)

**Purpose**: Defines 30 system-wide notification templates with bilingual content

**Template Structure**:
```typescript
{
  name: string;              // Display name
  description: string;       // Purpose description
  category: string;          // CONTRACT | PAYMENT | DOCUMENT | OPERATIONAL
  templateCode: string;      // Unique identifier (UPPERCASE)
  subjectEn: string;         // Email subject (English)
  subjectAr: string;         // Email subject (Arabic)
  bodyEn: string;            // Message body (English) with {{variables}}
  bodyAr: string;            // Message body (Arabic) with {{variables}}
  supportsSms: boolean;      // Can be sent via SMS
  supportsEmail: boolean;    // Can be sent via Email
  isActive: boolean;         // Template enabled/disabled
  variables: string[];       // Required template variables
}
```

**Template Categories**:
- **CONTRACT** (10 templates): Created, Activated, Completed, Closed, Cancelled, Expiring Soon, Expired, Extension Approved, Modified, Overdue
- **PAYMENT** (8 templates): Received, Pending, Overdue, Failed, Refund Processed, Security Deposit Refunded, Payment Reminder, Final Payment Reminder
- **DOCUMENT** (6 templates): Expiring Soon, Expired, Uploaded, Approved, Rejected, Renewal Required
- **OPERATIONAL** (6 templates): Vehicle Inspection Required, Inspection Completed, Driver Assigned, Toll Charge Applied, Traffic Fine Applied, Maintenance Scheduled

### 2. Notification Trigger Service (`server/services/notificationTrigger.ts`)

**Purpose**: Central orchestrator for sending notifications based on template codes

**Function Signature**:
```typescript
triggerNotification(
  templateCode: string,        // Template code (case-insensitive)
  recipientInfo: {             // Recipient details
    customerId?: string;
    customerName?: string;
    mobile?: string;
    email?: string;
    language?: 'en' | 'ar';
  },
  variables: Record<string, string>,  // Template variable values
  options?: {
    forceSend?: boolean;       // Override active status check
    channelOverride?: 'sms' | 'email' | 'both';
  }
): Promise<void>
```

**Features**:
- Case-insensitive template code lookup (prevents integration errors)
- Automatic template rendering with variable substitution
- Intelligent provider selection with failover support
- Comprehensive communication logging with cost tracking
- Respects template active/inactive state
- Non-blocking execution (logs errors but doesn't throw)

### 3. Template Renderer (`server/services/templateRenderer.ts`)

**Purpose**: Renders notification templates with variable substitution

**Functionality**:
- Replaces `{{variableName}}` with actual values
- Supports both English and Arabic templates
- Handles missing variables gracefully (keeps placeholder)
- Escapes special characters for SMS/Email compatibility

### 4. Enhanced Provider Selector (`server/services/enhancedProviderSelector.ts`)

**Purpose**: Intelligently selects communication providers with automatic failover

**Selection Algorithm**:
1. Filter providers by channel (SMS/Email), active status, and health
2. Sort by priority (ascending) and health status
3. Select highest priority healthy provider
4. If all providers unhealthy, select highest priority and log warning
5. Automatic failover on provider failure

**Health Monitoring**:
- Tracks success/failure rates
- Circuit breaker pattern prevents cascading failures
- Automatic recovery when provider health improves

### 5. Communication Providers

#### Twilio SMS Provider (`server/services/providers/twilioSmsProvider.ts`)

**Features**:
- Production-ready Twilio integration
- E.164 phone number formatting with libphonenumber-js
- Retry logic with exponential backoff (3 attempts)
- Delivery status tracking via webhooks
- Circuit breaker pattern (opens after 5 consecutive failures)
- Health monitoring and automatic recovery
- Cost tracking per message
- Comprehensive error handling

**Configuration**:
```typescript
{
  apiKey: process.env.TWILIO_ACCOUNT_SID,
  apiSecret: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
  webhookUrl: process.env.TWILIO_WEBHOOK_URL  // Optional
}
```

#### SendGrid Email Provider (`server/services/providers/sendgridEmailProvider.ts`)

**Features**:
- Production-ready SendGrid integration
- Dynamic template support with variable substitution
- Bulk sending capabilities (up to 1000 recipients)
- Retry logic with exponential backoff
- Delivery tracking via webhooks
- Circuit breaker pattern
- Health monitoring
- Cost tracking per email
- Comprehensive error handling

**Configuration**:
```typescript
{
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.SENDGRID_FROM_EMAIL,
  fromName: process.env.SENDGRID_FROM_NAME  // Optional
}
```

### 6. Campaign Sender (`server/services/campaignSender.ts`)

**Purpose**: Batch notification delivery for marketing campaigns

**Features**:
- Recipient filtering by branch, customer type, risk score
- Scheduled delivery
- Batch processing with rate limiting
- Progress tracking
- Delivery status per recipient
- Automatic retry for failed deliveries

---

## Notification Templates

### Template Variables

Templates use `{{variableName}}` syntax for dynamic content. Common variables:

**Contract Variables**:
- `{{contractNumber}}` - Contract identifier
- `{{vehiclePlate}}` - Vehicle registration number
- `{{startDate}}` - Rental start date
- `{{endDate}}` - Rental end date
- `{{totalAmount}}` - Total contract amount
- `{{currency}}` - Currency (AED)

**Payment Variables**:
- `{{paymentAmount}}` - Payment amount
- `{{paymentMethod}}` - Payment method (cash, card, etc.)
- `{{outstandingBalance}}` - Remaining balance
- `{{dueDate}}` - Payment due date

**Document Variables**:
- `{{documentType}}` - Document type (passport, license, etc.)
- `{{documentNumber}}` - Document identifier
- `{{expiryDate}}` - Document expiration date

**Common Variables**:
- `{{customerName}}` - Customer name
- `{{companyName}}` - Company name (KarāraOS)

### Template Management

Templates are seeded automatically on system startup via `server/seedNotificationTemplates.ts`. The seeding process:
1. Checks if template with same `templateCode` exists
2. If exists, updates content (allows template improvements without breaking integrations)
3. If not exists, creates new template
4. Never deletes templates (safe for production)

To add a new template:
1. Add template definition to `server/seedNotificationTemplates.ts`
2. Restart application (templates auto-seed on startup)
3. Use template via `triggerNotification(templateCode, ...)`

---

## Automated Triggers

### Contract Lifecycle Triggers (`server/routes/contractRoutes.ts`)

**1. CONTRACT_CREATED** - Triggered when new contract is created
```typescript
// Variables provided
{
  contractNumber: string,
  vehiclePlate: string,
  startDate: string,
  endDate: string,
  totalAmount: string,
  currency: string,
  companyName: string
}
```

**2. CONTRACT_ACTIVATED** - Triggered when draft → active transition
```typescript
// Variables provided
{
  contractNumber: string,
  vehiclePlate: string,
  activationDate: string,
  companyName: string
}
```

**3. CONTRACT_COMPLETED** - Triggered when contract marked complete
```typescript
// Variables provided
{
  contractNumber: string,
  completionDate: string,
  totalCharges: string,
  outstandingBalance: string,
  currency: string,
  companyName: string
}
```

### Payment Triggers (`server/routes/paymentRoutes.ts`)

**1. PAYMENT_RECEIVED** - Triggered after successful payment recording
```typescript
// Variables provided
{
  contractNumber: string,
  paymentAmount: string,
  paymentMethod: string,
  currency: string,
  companyName: string
}
```

**2. PAYMENT_REFUND_PROCESSED** - Triggered after refund processing
```typescript
// Variables provided
{
  contractNumber: string,
  refundAmount: string,
  refundMethod: string,
  currency: string,
  companyName: string
}
```

### Document Triggers (`server/routes/documentRoutes.ts`)

**1. DOCUMENT_UPLOADED** - Triggered when document uploaded for customer
```typescript
// Variables provided
{
  documentType: string,
  documentNumber: string,
  companyName: string
}
```

**2. DOCUMENT_EXPIRING_SOON** - Triggered by cron job (30 days before expiry)
```typescript
// Variables provided
{
  documentType: string,
  documentNumber: string,
  expiryDate: string,
  daysRemaining: string,
  companyName: string
}
```

**3. DOCUMENT_EXPIRED** - Triggered by cron job on expiry date
```typescript
// Variables provided
{
  documentType: string,
  documentNumber: string,
  expiryDate: string,
  companyName: string
}
```

### Integration Pattern

All triggers follow this pattern:
```typescript
// After successful business operation
const customer = await storage.getCustomer(customerId);
if (customer) {
  const settings = await storage.getCompanySettings();
  
  // Non-blocking trigger (errors logged, don't block operation)
  triggerNotification('TEMPLATE_CODE', {
    customerName: customer.nameEn || customer.nameAr || 'Customer',
    mobile: customer.phone,
    email: customer.email,
    language: customer.preferredLanguage || 'en',
  }, {
    // Template variables
    contractNumber: contract.contractNumber.toString(),
    // ... other variables
    companyName: settings.companyNameEn || 'KarāraOS',
  }).catch(err => console.error('[Context] Notification failed:', err));
}
```

---

## Manual Notifications

### Manual Notification Sender UI (`client/src/pages/ManualNotificationSender.tsx`)

**Purpose**: Allows admins to send ad-hoc notifications to customers, drivers, or staff

**Features**:
- Template selection with live preview
- Recipient selection by type (customer, driver, user)
- Variable input with validation
- Channel selection (SMS, Email, or Both)
- Real-time template rendering preview
- Send confirmation and tracking

**API Endpoint**: `POST /api/notifications/send-manual`

**Request Body**:
```typescript
{
  templateCode: string;
  recipientType: 'customer' | 'driver' | 'user';
  recipientId: string;
  channel: 'sms' | 'email' | 'both';
  variables: Record<string, string>;
  language: 'en' | 'ar';
}
```

---

## Campaign Management

### Campaign Workflow

1. **Campaign Creation**: Admin creates campaign with name, description, target audience
2. **Approval**: Manager/Admin approves campaign
3. **Scheduling**: Campaign scheduled for specific date/time
4. **Execution**: Campaign sender processes recipients in batches
5. **Tracking**: Delivery status tracked per recipient
6. **Analytics**: Campaign performance analyzed in dashboard

### Campaign Recipient Filtering

Campaigns support filtering by:
- Branch location
- Customer type (individual/corporate)
- Risk score range
- Contract status
- Last rental date range

---

## Analytics & Monitoring

### Campaign Analytics Dashboard (`client/src/pages/CampaignAnalytics.tsx`)

**Features**:
- **KPI Cards**: Total Sent, Success Rate, Total Failed, Pending
- **Delivery Trend Chart**: 7-day line chart showing sent/failed trends
- **Channel Distribution**: Pie chart showing SMS vs Email breakdown
- **Campaign Status Distribution**: Bar chart showing campaign status counts
- **Provider Health Monitoring**: Real-time provider status with metrics
- **Recent Campaigns**: List of latest campaign activity

**Metrics Tracked**:
- Total notifications sent
- Success rate (sent/(sent+failed))
- Total failures
- Pending notifications
- SMS vs Email distribution
- Provider health status
- Cost tracking per provider
- Last provider usage timestamp

### Communication Logs Viewer (`client/src/pages/CommunicationLogs.tsx`)

**Features**:
- **Search**: Full-text search across recipient, subject, message
- **Filtering**: By channel (SMS/Email), status (sent/delivered/failed/pending)
- **Export**: CSV export with RFC 4180 compliance
- **Status Badges**: Visual status indicators
- **Delivery Tracking**: Timestamps for sent, delivered, failed
- **Provider Metadata**: Provider name, cost, error messages

**Log Fields**:
- Recipient (phone/email)
- Channel (SMS/Email)
- Subject (Email only)
- Message body
- Status (pending/sent/delivered/failed)
- Provider name
- Cost
- Error message (if failed)
- Created timestamp
- Delivered timestamp

---

## API Reference

### Notification Templates

**GET /api/notification-templates** - List all templates
```typescript
Response: NotificationTemplate[]
```

**GET /api/notification-templates/:id** - Get template by ID
```typescript
Response: NotificationTemplate
```

### Communication Logs

**GET /api/communication-logs** - List all logs
```typescript
Query Parameters:
  - channel?: 'sms' | 'email'
  - status?: 'pending' | 'sent' | 'delivered' | 'failed'
  - startDate?: ISO8601 date
  - endDate?: ISO8601 date

Response: CommunicationLog[]
```

### Communication Providers

**GET /api/communication-providers** - List all providers
```typescript
Response: CommunicationProvider[]
```

**GET /api/communication-providers/health** - Get provider health status
```typescript
Response: ProviderHealthStatus[]
{
  id: string;
  name: string;
  type: 'sms' | 'email';
  provider: string;
  healthStatus: 'healthy' | 'degraded' | 'down';
  totalSent: number;
  totalFailed: number;
  lastUsed: ISO8601 timestamp;
}
```

### Manual Notifications

**POST /api/notifications/send-manual** - Send manual notification
```typescript
Request Body:
{
  templateCode: string;
  recipientType: 'customer' | 'driver' | 'user';
  recipientId: string;
  channel: 'sms' | 'email' | 'both';
  variables: Record<string, string>;
  language: 'en' | 'ar';
}

Response: { success: boolean; logId: string; }
```

### Campaigns

**GET /api/campaigns** - List all campaigns
```typescript
Response: Campaign[]
```

**POST /api/campaigns** - Create new campaign
```typescript
Request Body:
{
  name: string;
  description: string;
  templateId: string;
  targetAudience: RecipientFilters;
  scheduledFor?: ISO8601 timestamp;
}

Response: Campaign
```

---

## Configuration Guide

### Environment Variables

**Required for SMS (Twilio)**:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/twilio  # Optional
```

**Required for Email (SendGrid)**:
```bash
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=KarāraOS  # Optional
```

**Optional for Email Fallback (Gmail SMTP)**:
```bash
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### Provider Configuration

Providers are configured in the database via `communicationProviders` table:

```typescript
{
  name: string;              // Display name
  type: 'sms' | 'email';     // Provider type
  provider: string;          // Provider identifier (twilio, sendgrid, gmail)
  config: JSON;              // Provider-specific config
  priority: number;          // Lower = higher priority (1 = highest)
  isActive: boolean;         // Enable/disable provider
  isHealthy: boolean;        // Health status (auto-updated)
}
```

### Adding a New Provider

1. Create provider class implementing `ICommunicationProvider` interface
2. Add provider configuration to `communicationProviders` table
3. Register provider in `enhancedProviderSelector.ts`
4. Test with manual notification sender

---

## Testing & Troubleshooting

### Testing Checklist

✅ **Template Rendering**: Verify variables replaced correctly  
✅ **Provider Selection**: Confirm failover works when primary fails  
✅ **Delivery Tracking**: Check communication logs for status  
✅ **Cost Tracking**: Verify cost recorded per message  
✅ **Automated Triggers**: Test contract/payment/document events  
✅ **Manual Sender**: Send test notification via UI  
✅ **Campaign Execution**: Create and execute test campaign  
✅ **Analytics**: Verify dashboard shows correct metrics  

### Common Issues

**Issue**: Notifications not sending  
**Solution**: Check provider configuration, verify environment variables, check provider health status in dashboard

**Issue**: Template variables not replaced  
**Solution**: Ensure variable names match exactly (case-sensitive), verify variables passed to triggerNotification

**Issue**: High failure rate  
**Solution**: Check provider health dashboard, verify phone numbers in E.164 format, validate email addresses

**Issue**: SMS not delivered  
**Solution**: Verify phone number in E.164 format (+971501234567), check Twilio account balance, verify webhook URL configured

**Issue**: Email not delivered  
**Solution**: Check SendGrid API key, verify sender email verified, check spam folder, review SendGrid dashboard for bounces

### Debugging

Enable debug logging:
```bash
DEBUG=notification:* npm run dev
```

Check communication logs:
```sql
SELECT * FROM communication_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

Check provider health:
```sql
SELECT * FROM communication_providers 
WHERE is_healthy = false;
```

---

## Future Enhancements

- [ ] WhatsApp Business integration
- [ ] Push notifications for mobile app
- [ ] A/B testing for campaign templates
- [ ] Advanced segmentation (ML-based customer clustering)
- [ ] Predictive send time optimization
- [ ] Multi-language template management UI
- [ ] Template version control
- [ ] Scheduled notification queue management
- [ ] Real-time delivery status webhooks
- [ ] Campaign ROI tracking

---

## Summary

The KarāraOS Notification & Campaign System provides a production-ready, scalable communication platform with:

✅ 30 pre-configured bilingual notification templates  
✅ Automated triggers integrated into business operations  
✅ Multi-provider architecture with automatic failover  
✅ Comprehensive analytics and monitoring  
✅ Manual notification sender for ad-hoc communications  
✅ Campaign management with approval workflow  
✅ Complete audit trail with delivery tracking  
✅ Cost tracking and provider health monitoring  

The system is designed to scale with your business, ensuring reliable customer communication across the entire rental car lifecycle.
