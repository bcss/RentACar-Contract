/**
 * Lookup Tables Routes - API routes for Master Spec lookup tables
 * 
 * Handles CRUD operations for:
 * - vehicle_classes - Vehicle classification hierarchy
 * - vehicle_groups - Vehicle model groups
 * - notification_purposes - Notification purpose definitions
 * - notification_routes - Channel routing configuration
 * - cron_job_definitions - Scheduled job definitions
 * - sequences - Number sequence generators
 * - blacklist_entries - Entity blacklist management
 * - seasonal_tariffs - Seasonal pricing adjustments
 * - maintenance_jobs - Vehicle maintenance workflow
 */

import { Router } from 'express';
import { db } from '../db';
import { 
  vehicleClasses, vehicleGroups, notificationPurposes, notificationRoutes,
  cronJobDefinitions, sequences, blacklistEntries, seasonalTariffs, maintenanceJobs
} from '@shared/schema';
import { eq, and, desc, asc, isNull, or, like, sql } from 'drizzle-orm';

const router = Router();

// ============================================================================
// VEHICLE CLASSES
// ============================================================================

// GET /api/lookup/vehicle-classes - List all vehicle classes
router.get('/vehicle-classes', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const classes = await db.select().from(vehicleClasses)
      .where(includeInactive ? undefined : eq(vehicleClasses.isActive, true))
      .orderBy(asc(vehicleClasses.sortOrder));
    res.json(classes);
  } catch (error) {
    console.error('Error fetching vehicle classes:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle classes' });
  }
});

// GET /api/lookup/vehicle-classes/:id
router.get('/vehicle-classes/:id', async (req, res) => {
  try {
    const [vehicleClass] = await db.select().from(vehicleClasses)
      .where(eq(vehicleClasses.id, req.params.id));
    if (!vehicleClass) {
      return res.status(404).json({ error: 'Vehicle class not found' });
    }
    res.json(vehicleClass);
  } catch (error) {
    console.error('Error fetching vehicle class:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle class' });
  }
});

// POST /api/lookup/vehicle-classes - Create vehicle class
router.post('/vehicle-classes', async (req, res) => {
  try {
    const [newClass] = await db.insert(vehicleClasses).values({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating vehicle class:', error);
    res.status(500).json({ error: 'Failed to create vehicle class' });
  }
});

// PATCH /api/lookup/vehicle-classes/:id
router.patch('/vehicle-classes/:id', async (req, res) => {
  try {
    const [updated] = await db.update(vehicleClasses)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(vehicleClasses.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle class not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating vehicle class:', error);
    res.status(500).json({ error: 'Failed to update vehicle class' });
  }
});

// ============================================================================
// VEHICLE GROUPS
// ============================================================================

// GET /api/lookup/vehicle-groups - List all vehicle groups
router.get('/vehicle-groups', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const classId = req.query.classId as string;
    
    let query = db.select().from(vehicleGroups);
    const conditions = [];
    
    if (!includeInactive) {
      conditions.push(eq(vehicleGroups.isActive, true));
    }
    if (classId) {
      conditions.push(eq(vehicleGroups.vehicleClassId, classId));
    }
    
    const groups = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(vehicleGroups.sortOrder));
    res.json(groups);
  } catch (error) {
    console.error('Error fetching vehicle groups:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle groups' });
  }
});

// GET /api/lookup/vehicle-groups/:id
router.get('/vehicle-groups/:id', async (req, res) => {
  try {
    const [group] = await db.select().from(vehicleGroups)
      .where(eq(vehicleGroups.id, req.params.id));
    if (!group) {
      return res.status(404).json({ error: 'Vehicle group not found' });
    }
    res.json(group);
  } catch (error) {
    console.error('Error fetching vehicle group:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle group' });
  }
});

// POST /api/lookup/vehicle-groups
router.post('/vehicle-groups', async (req, res) => {
  try {
    const [newGroup] = await db.insert(vehicleGroups).values({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating vehicle group:', error);
    res.status(500).json({ error: 'Failed to create vehicle group' });
  }
});

// PATCH /api/lookup/vehicle-groups/:id
router.patch('/vehicle-groups/:id', async (req, res) => {
  try {
    const [updated] = await db.update(vehicleGroups)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(vehicleGroups.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle group not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating vehicle group:', error);
    res.status(500).json({ error: 'Failed to update vehicle group' });
  }
});

// ============================================================================
// NOTIFICATION PURPOSES
// ============================================================================

// GET /api/lookup/notification-purposes
router.get('/notification-purposes', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const category = req.query.category as string;
    
    const conditions = [];
    if (!includeInactive) {
      conditions.push(eq(notificationPurposes.isActive, true));
    }
    if (category) {
      conditions.push(eq(notificationPurposes.category, category));
    }
    
    const purposes = await db.select().from(notificationPurposes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(notificationPurposes.category), asc(notificationPurposes.code));
    res.json(purposes);
  } catch (error) {
    console.error('Error fetching notification purposes:', error);
    res.status(500).json({ error: 'Failed to fetch notification purposes' });
  }
});

// GET /api/lookup/notification-purposes/:id
router.get('/notification-purposes/:id', async (req, res) => {
  try {
    const [purpose] = await db.select().from(notificationPurposes)
      .where(eq(notificationPurposes.id, req.params.id));
    if (!purpose) {
      return res.status(404).json({ error: 'Notification purpose not found' });
    }
    res.json(purpose);
  } catch (error) {
    console.error('Error fetching notification purpose:', error);
    res.status(500).json({ error: 'Failed to fetch notification purpose' });
  }
});

// POST /api/lookup/notification-purposes
router.post('/notification-purposes', async (req, res) => {
  try {
    const [newPurpose] = await db.insert(notificationPurposes).values({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newPurpose);
  } catch (error) {
    console.error('Error creating notification purpose:', error);
    res.status(500).json({ error: 'Failed to create notification purpose' });
  }
});

// PATCH /api/lookup/notification-purposes/:id
router.patch('/notification-purposes/:id', async (req, res) => {
  try {
    const [updated] = await db.update(notificationPurposes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(notificationPurposes.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Notification purpose not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating notification purpose:', error);
    res.status(500).json({ error: 'Failed to update notification purpose' });
  }
});

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================

// GET /api/lookup/notification-routes
router.get('/notification-routes', async (req, res) => {
  try {
    const purposeId = req.query.purposeId as string;
    const channel = req.query.channel as string;
    
    const conditions = [];
    if (purposeId) {
      conditions.push(eq(notificationRoutes.purposeId, purposeId));
    }
    if (channel) {
      conditions.push(eq(notificationRoutes.channel, channel));
    }
    
    const routes = await db.select().from(notificationRoutes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(notificationRoutes.priority));
    res.json(routes);
  } catch (error) {
    console.error('Error fetching notification routes:', error);
    res.status(500).json({ error: 'Failed to fetch notification routes' });
  }
});

// POST /api/lookup/notification-routes
router.post('/notification-routes', async (req, res) => {
  try {
    const [newRoute] = await db.insert(notificationRoutes).values({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newRoute);
  } catch (error) {
    console.error('Error creating notification route:', error);
    res.status(500).json({ error: 'Failed to create notification route' });
  }
});

// PATCH /api/lookup/notification-routes/:id
router.patch('/notification-routes/:id', async (req, res) => {
  try {
    const [updated] = await db.update(notificationRoutes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(notificationRoutes.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Notification route not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating notification route:', error);
    res.status(500).json({ error: 'Failed to update notification route' });
  }
});

// DELETE /api/lookup/notification-routes/:id
router.delete('/notification-routes/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(notificationRoutes)
      .where(eq(notificationRoutes.id, req.params.id))
      .returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Notification route not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification route:', error);
    res.status(500).json({ error: 'Failed to delete notification route' });
  }
});

// ============================================================================
// CRON JOB DEFINITIONS
// ============================================================================

// GET /api/lookup/cron-jobs
router.get('/cron-jobs', async (req, res) => {
  try {
    const includeDisabled = req.query.includeDisabled === 'true';
    
    const jobs = await db.select().from(cronJobDefinitions)
      .where(includeDisabled ? undefined : eq(cronJobDefinitions.isEnabled, true))
      .orderBy(asc(cronJobDefinitions.name));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    res.status(500).json({ error: 'Failed to fetch cron jobs' });
  }
});

// GET /api/lookup/cron-jobs/:id
router.get('/cron-jobs/:id', async (req, res) => {
  try {
    const [job] = await db.select().from(cronJobDefinitions)
      .where(eq(cronJobDefinitions.id, req.params.id));
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching cron job:', error);
    res.status(500).json({ error: 'Failed to fetch cron job' });
  }
});

// PATCH /api/lookup/cron-jobs/:id - Update cron job (enable/disable, change schedule)
router.patch('/cron-jobs/:id', async (req, res) => {
  try {
    const [updated] = await db.update(cronJobDefinitions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(cronJobDefinitions.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating cron job:', error);
    res.status(500).json({ error: 'Failed to update cron job' });
  }
});

// POST /api/lookup/cron-jobs/:id/run - Manually trigger a cron job
router.post('/cron-jobs/:id/run', async (req, res) => {
  try {
    const [job] = await db.select().from(cronJobDefinitions)
      .where(eq(cronJobDefinitions.id, req.params.id));
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    // Record run attempt
    await db.update(cronJobDefinitions)
      .set({ 
        lastRunAt: new Date(),
        lastRunStatus: 'running',
        runCount: sql`${cronJobDefinitions.runCount} + 1`
      })
      .where(eq(cronJobDefinitions.id, req.params.id));
    
    res.json({ success: true, message: `Job ${job.name} triggered` });
  } catch (error) {
    console.error('Error triggering cron job:', error);
    res.status(500).json({ error: 'Failed to trigger cron job' });
  }
});

// ============================================================================
// SEQUENCES
// ============================================================================

// GET /api/lookup/sequences
router.get('/sequences', async (req, res) => {
  try {
    const seqs = await db.select().from(sequences)
      .where(eq(sequences.isActive, true))
      .orderBy(asc(sequences.sequenceType));
    res.json(seqs);
  } catch (error) {
    console.error('Error fetching sequences:', error);
    res.status(500).json({ error: 'Failed to fetch sequences' });
  }
});

// GET /api/lookup/sequences/:type/next - Get next value for a sequence type
router.get('/sequences/:type/next', async (req, res) => {
  try {
    const sequenceType = req.params.type;
    const branchId = req.query.branchId as string;
    
    // Find the sequence
    const conditions = [
      eq(sequences.sequenceType, sequenceType),
      eq(sequences.isActive, true)
    ];
    if (branchId) {
      conditions.push(eq(sequences.branchId, branchId));
    } else {
      conditions.push(isNull(sequences.branchId));
    }
    
    const [seq] = await db.select().from(sequences)
      .where(and(...conditions));
    
    if (!seq) {
      return res.status(404).json({ error: `Sequence ${sequenceType} not found` });
    }
    
    // Increment and return next value
    const nextValue = seq.currentValue + seq.incrementBy;
    const [updated] = await db.update(sequences)
      .set({ 
        currentValue: nextValue,
        updatedAt: new Date()
      })
      .where(eq(sequences.id, seq.id))
      .returning();
    
    // Format the number
    const paddedValue = String(nextValue).padStart(seq.paddingLength, '0');
    let formattedNumber = seq.prefix;
    
    if (seq.includeYear) {
      const year = new Date().getFullYear();
      if (seq.yearFormat === 'YYYY') {
        formattedNumber += year;
      } else if (seq.yearFormat === 'YY') {
        formattedNumber += String(year).slice(-2);
      } else if (seq.yearFormat === 'YYMM') {
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        formattedNumber += String(year).slice(-2) + month;
      }
    }
    
    formattedNumber += paddedValue + seq.suffix;
    
    res.json({ 
      number: formattedNumber,
      rawValue: nextValue,
      sequenceId: seq.id
    });
  } catch (error) {
    console.error('Error getting next sequence:', error);
    res.status(500).json({ error: 'Failed to get next sequence number' });
  }
});

// PATCH /api/lookup/sequences/:id
router.patch('/sequences/:id', async (req, res) => {
  try {
    const [updated] = await db.update(sequences)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(sequences.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating sequence:', error);
    res.status(500).json({ error: 'Failed to update sequence' });
  }
});

// ============================================================================
// BLACKLIST ENTRIES
// ============================================================================

// GET /api/lookup/blacklist
router.get('/blacklist', async (req, res) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;
    const status = req.query.status as string;
    
    const conditions = [eq(blacklistEntries.isActive, true)];
    
    if (entityType) {
      conditions.push(eq(blacklistEntries.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(blacklistEntries.entityId, entityId));
    }
    if (status) {
      conditions.push(eq(blacklistEntries.blacklistStatus, status));
    }
    
    const entries = await db.select().from(blacklistEntries)
      .where(and(...conditions))
      .orderBy(desc(blacklistEntries.createdAt));
    res.json(entries);
  } catch (error) {
    console.error('Error fetching blacklist entries:', error);
    res.status(500).json({ error: 'Failed to fetch blacklist entries' });
  }
});

// GET /api/lookup/blacklist/check/:entityType/:entityId - Check if entity is blacklisted
router.get('/blacklist/check/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const [entry] = await db.select().from(blacklistEntries)
      .where(and(
        eq(blacklistEntries.entityType, entityType),
        eq(blacklistEntries.entityId, entityId),
        eq(blacklistEntries.isActive, true)
      ))
      .orderBy(desc(blacklistEntries.createdAt))
      .limit(1);
    
    if (!entry) {
      return res.json({ blacklisted: false, status: 'none' });
    }
    
    // Check if entry has expired
    if (entry.effectiveUntil && new Date(entry.effectiveUntil) < new Date()) {
      return res.json({ blacklisted: false, status: 'expired', entry });
    }
    
    res.json({ 
      blacklisted: entry.blacklistStatus === 'blocked',
      status: entry.blacklistStatus,
      entry
    });
  } catch (error) {
    console.error('Error checking blacklist:', error);
    res.status(500).json({ error: 'Failed to check blacklist status' });
  }
});

// POST /api/lookup/blacklist
router.post('/blacklist', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const [newEntry] = await db.insert(blacklistEntries).values({
      ...req.body,
      addedBy: userId,
      effectiveFrom: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating blacklist entry:', error);
    res.status(500).json({ error: 'Failed to create blacklist entry' });
  }
});

// PATCH /api/lookup/blacklist/:id
router.patch('/blacklist/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const [updated] = await db.update(blacklistEntries)
      .set({ 
        ...req.body, 
        reviewedBy: req.body.blacklistStatus ? userId : undefined,
        reviewedAt: req.body.blacklistStatus ? new Date() : undefined,
        updatedAt: new Date() 
      })
      .where(eq(blacklistEntries.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Blacklist entry not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating blacklist entry:', error);
    res.status(500).json({ error: 'Failed to update blacklist entry' });
  }
});

// ============================================================================
// SEASONAL TARIFFS
// ============================================================================

// GET /api/lookup/seasonal-tariffs
router.get('/seasonal-tariffs', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const tariffs = await db.select().from(seasonalTariffs)
      .where(includeInactive ? undefined : eq(seasonalTariffs.isActive, true))
      .orderBy(desc(seasonalTariffs.priority), asc(seasonalTariffs.startDate));
    res.json(tariffs);
  } catch (error) {
    console.error('Error fetching seasonal tariffs:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal tariffs' });
  }
});

// GET /api/lookup/seasonal-tariffs/applicable - Get applicable tariffs for a date range
router.get('/seasonal-tariffs/applicable', async (req, res) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const vehicleClassId = req.query.vehicleClassId as string;
    const branchId = req.query.branchId as string;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const conditions = [
      eq(seasonalTariffs.isActive, true),
      sql`${seasonalTariffs.startDate} <= ${endDate}::date`,
      sql`${seasonalTariffs.endDate} >= ${startDate}::date`
    ];
    
    if (vehicleClassId) {
      conditions.push(or(
        eq(seasonalTariffs.vehicleClassId, vehicleClassId),
        isNull(seasonalTariffs.vehicleClassId)
      )!);
    }
    if (branchId) {
      conditions.push(or(
        eq(seasonalTariffs.branchId, branchId),
        isNull(seasonalTariffs.branchId)
      )!);
    }
    
    const tariffs = await db.select().from(seasonalTariffs)
      .where(and(...conditions))
      .orderBy(desc(seasonalTariffs.priority));
    
    res.json(tariffs);
  } catch (error) {
    console.error('Error fetching applicable tariffs:', error);
    res.status(500).json({ error: 'Failed to fetch applicable tariffs' });
  }
});

// POST /api/lookup/seasonal-tariffs
router.post('/seasonal-tariffs', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const [newTariff] = await db.insert(seasonalTariffs).values({
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newTariff);
  } catch (error) {
    console.error('Error creating seasonal tariff:', error);
    res.status(500).json({ error: 'Failed to create seasonal tariff' });
  }
});

// PATCH /api/lookup/seasonal-tariffs/:id
router.patch('/seasonal-tariffs/:id', async (req, res) => {
  try {
    const [updated] = await db.update(seasonalTariffs)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(seasonalTariffs.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Seasonal tariff not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating seasonal tariff:', error);
    res.status(500).json({ error: 'Failed to update seasonal tariff' });
  }
});

// ============================================================================
// MAINTENANCE JOBS
// ============================================================================

// GET /api/lookup/maintenance-jobs
router.get('/maintenance-jobs', async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId as string;
    const status = req.query.status as string;
    const branchId = req.query.branchId as string;
    
    const conditions = [];
    if (vehicleId) {
      conditions.push(eq(maintenanceJobs.vehicleId, vehicleId));
    }
    if (status) {
      conditions.push(eq(maintenanceJobs.status, status));
    }
    if (branchId) {
      conditions.push(eq(maintenanceJobs.branchId, branchId));
    }
    
    const jobs = await db.select().from(maintenanceJobs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(maintenanceJobs.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching maintenance jobs:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance jobs' });
  }
});

// GET /api/lookup/maintenance-jobs/:id
router.get('/maintenance-jobs/:id', async (req, res) => {
  try {
    const [job] = await db.select().from(maintenanceJobs)
      .where(eq(maintenanceJobs.id, req.params.id));
    if (!job) {
      return res.status(404).json({ error: 'Maintenance job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching maintenance job:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance job' });
  }
});

// POST /api/lookup/maintenance-jobs
router.post('/maintenance-jobs', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const [newJob] = await db.insert(maintenanceJobs).values({
      ...req.body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating maintenance job:', error);
    res.status(500).json({ error: 'Failed to create maintenance job' });
  }
});

// PATCH /api/lookup/maintenance-jobs/:id
router.patch('/maintenance-jobs/:id', async (req, res) => {
  try {
    const [updated] = await db.update(maintenanceJobs)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(maintenanceJobs.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Maintenance job not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating maintenance job:', error);
    res.status(500).json({ error: 'Failed to update maintenance job' });
  }
});

// POST /api/lookup/maintenance-jobs/:id/complete
router.post('/maintenance-jobs/:id/complete', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const [updated] = await db.update(maintenanceJobs)
      .set({ 
        status: 'completed',
        actualEndDate: new Date(),
        completedBy: userId,
        completionNotes: req.body.completionNotes,
        totalCost: req.body.totalCost,
        updatedAt: new Date()
      })
      .where(eq(maintenanceJobs.id, req.params.id))
      .returning();
    if (!updated) {
      return res.status(404).json({ error: 'Maintenance job not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error completing maintenance job:', error);
    res.status(500).json({ error: 'Failed to complete maintenance job' });
  }
});

export default router;
