# Document Storage Migration Guide

## Current Implementation (Development/Staging)

**Storage Backend:** Local filesystem (`attached_assets/documents/`)

**Security Features:**
- ✅ MIME type validation (PDF, images, Office docs only)
- ✅ File size limits (10MB max)
- ✅ CSRF protection on uploads
- ✅ Authentication required for all operations
- ✅ Audit logging for uploads and downloads
- ✅ Access controls (role-based permissions)
- ✅ UUID-based filenames (prevents path traversal)

**Current Endpoints:**
- `POST /api/documents/upload` - Upload with validation & audit log
- `GET /api/documents/:id/download` - Secure download with access control & audit log
- `POST /api/documents` - Create document registry entry
- `PATCH /api/documents/:id` - Update document metadata
- `POST /api/documents/:id/verify` - Verify document

**Limitations:**
- ❌ No encryption at rest
- ❌ No virus/malware scanning
- ❌ No content-addressable storage (checksums)
- ❌ No automated expiry/retention
- ❌ No CDN distribution for UAE regions
- ❌ Persistent file URLs (not time-limited signed URLs)

## Production Migration Path (S3/KMS)

### Phase 1: Infrastructure Setup

**1. S3-Compatible Storage (AWS S3, DigitalOcean Spaces, Backblaze B2)**

Recommended: AWS S3 in UAE region (me-central-1 - UAE)

```bash
# Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Set environment variables
AWS_REGION=me-central-1
AWS_S3_BUCKET=rccms-documents-production
AWS_ACCESS_KEY_ID=<from AWS IAM>
AWS_SECRET_ACCESS_KEY=<from AWS IAM>
AWS_KMS_KEY_ID=<from AWS KMS>
```

**2. Bucket Configuration**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::rccms-documents-production/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

Enable:
- Server-Side Encryption (SSE-KMS)
- Versioning
- Lifecycle policies (auto-delete after document expiry + 7 years)
- Block all public access

**3. Virus Scanning Integration**

Options:
- **ClamAV** (self-hosted, open-source)
- **AWS GuardDuty** (managed malware scanning)
- **CloudMersive Virus Scan API** (paid service)

### Phase 2: Schema Migration

Update `documentRegistry` table:

```typescript
export const documentRegistry = pgTable("document_registry", {
  // ... existing fields ...
  
  // Replace fileUrl with storage metadata
  storageProvider: varchar("storage_provider", { length: 20 }), // 's3', 'local'
  storageKey: text("storage_key"), // S3 object key
  storageRegion: varchar("storage_region", { length: 30 }), // me-central-1
  checksum: varchar("checksum", { length: 64 }), // SHA-256
  contentLength: integer("content_length"), // bytes
  encryptionStatus: varchar("encryption_status", { length: 20 }), // 'sse-kms', 'none'
  kmsKeyId: varchar("kms_key_id"),
  
  // Virus scanning metadata
  scanStatus: varchar("scan_status", { length: 20 }), // 'pending', 'clean', 'infected', 'failed'
  scannedAt: timestamp("scanned_at"),
  scanEngine: varchar("scan_engine", { length: 50 }), // 'clamav', 'guardduty'
  
  // Retention policy
  retentionPolicy: varchar("retention_policy", { length: 30 }), // 'standard_7yr', 'permanent'
  scheduledDeletionAt: timestamp("scheduled_deletion_at"),
  
  // Legacy: keep fileUrl for backward compatibility during migration
  fileUrl: text("file_url").deprecated(),
});
```

### Phase 3: Upload Flow

**New Upload Process:**

1. **Client requests upload token** → `POST /api/documents/upload-token`
2. **Server validates** → Check MIME type, size, user permissions
3. **Server generates presigned POST** → Time-limited (15 min), policy-enforced
4. **Client uploads directly to S3** → Bypass application server
5. **S3 triggers Lambda** → Virus scan + metadata extraction
6. **Server receives webhook** → Update registry with scan results
7. **Server generates download URL** → Signed URL (1 hour TTL)

**Code Example:**

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Generate presigned upload URL
app.post("/api/documents/upload-token", isAuthenticated, async (req, res) => {
  const { fileName, fileType, fileSize } = req.body;
  
  // Validate
  if (!allowedMimeTypes.includes(fileType)) {
    return res.status(400).json({ message: "Invalid file type" });
  }
  
  if (fileSize > 10 * 1024 * 1024) {
    return res.status(400).json({ message: "File too large" });
  }
  
  const storageKey = `documents/${randomUUID()}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: storageKey,
    ContentType: fileType,
    ServerSideEncryption: "aws:kms",
    SSEKMSKeyId: process.env.AWS_KMS_KEY_ID,
    Metadata: {
      uploadedBy: req.user.id,
      originalName: fileName,
    }
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  
  res.json({ uploadUrl, storageKey });
});
```

### Phase 4: Download Flow

**Secure Download Process:**

1. **User requests download** → `GET /api/documents/:id/download`
2. **Server checks access** → RBAC + entity ownership
3. **Server logs download** → Audit trail
4. **Server generates signed URL** → 1-hour TTL, specific to user
5. **Client redirects to S3** → Direct download from S3

**Code Example:**

```typescript
import { GetObjectCommand } from "@aws-sdk/client-s3";

app.get("/api/documents/:id/download", isAuthenticated, async (req, res) => {
  const document = await storage.getDocumentById(req.params.id);
  
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  
  // Access control check
  if (!canAccessDocument(req.user, document)) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  // Audit log
  await createAuditLog(req.user.id, 'document_downloaded', undefined, req,
    `Downloaded ${document.documentType} for ${document.entityType}`
  );
  
  // Generate signed URL
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: document.storageKey,
  });
  
  const downloadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600,
    ResponseContentDisposition: `attachment; filename="${document.fileName}"`,
  });
  
  res.json({ downloadUrl });
});
```

### Phase 5: Migration Script

```typescript
// scripts/migrate-to-s3.ts
import { db } from "./db";
import { documentRegistry } from "./schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import crypto from "crypto";

async function migrateDocumentsToS3() {
  const documents = await db.select().from(documentRegistry).where(
    eq(documentRegistry.storageProvider, null)
  );
  
  console.log(`Migrating ${documents.length} documents to S3...`);
  
  for (const doc of documents) {
    try {
      // Read file from local storage
      const filepath = join(process.cwd(), doc.fileUrl);
      const fileBuffer = readFileSync(filepath);
      
      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Upload to S3
      const storageKey = `migrated/${doc.id}/${doc.fileName}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: doc.fileType,
        ServerSideEncryption: "aws:kms",
        SSEKMSKeyId: process.env.AWS_KMS_KEY_ID,
      }));
      
      // Update registry
      await db.update(documentRegistry)
        .set({
          storageProvider: 's3',
          storageKey,
          storageRegion: process.env.AWS_REGION,
          checksum,
          contentLength: fileBuffer.length,
          encryptionStatus: 'sse-kms',
          kmsKeyId: process.env.AWS_KMS_KEY_ID,
        })
        .where(eq(documentRegistry.id, doc.id));
        
      console.log(`✅ Migrated: ${doc.fileName}`);
    } catch (error) {
      console.error(`❌ Failed: ${doc.fileName}`, error);
    }
  }
  
  console.log('Migration complete!');
}
```

### Phase 6: Compliance & Monitoring

**1. Compliance Requirements (UAE)**

- **PDPL (Personal Data Protection Law):** Encryption at rest + in transit
- **Central Bank Standards:** Tamper-proof audit logs, MFA for sensitive access
- **ISO 27001:** Access reviews, incident response procedures

**2. Monitoring & Alerts**

```typescript
// CloudWatch alarms
- Large file uploads (>5MB)
- Failed virus scans
- Download spikes (>100/hour)
- Encryption failures
- Access denied attempts (>10/hour)
```

**3. Retention Automation**

```typescript
// Lifecycle rule: Auto-delete 7 years after expiry
{
  "Rules": [
    {
      "Id": "auto-delete-expired-docs",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "documents/"
      },
      "Expiration": {
        "Days": 2555
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## Estimated Migration Effort

- **Phase 1-2:** 2-3 days (AWS setup, schema changes)
- **Phase 3-4:** 3-5 days (upload/download flow rewrite)
- **Phase 5:** 1-2 days (migration script + testing)
- **Phase 6:** 1-2 days (compliance audit + monitoring)

**Total:** ~10-14 days for complete production-grade migration

## Rollback Plan

If S3 migration fails:
1. Revert schema changes
2. Restore `fileUrl` field usage
3. Continue using local storage with current audit controls
4. Schedule retry after investigation

## Current Status

✅ **Development Ready:** Local storage with MIME validation, access controls, and audit logging  
⏳ **Production Pending:** S3/KMS migration required before UAE deployment
