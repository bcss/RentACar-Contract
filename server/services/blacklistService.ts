/**
 * File: server/services/blacklistService.ts
 * @area Risk, Blacklist & Watchlist
 * @checklist §3.35, §3.36, §3.37, Part 11
 * @purpose Customer/Company/Sponsor blacklist enforcement per Master Spec Part 11
 * 
 * @behaviour
 *  - Three blocking levels: HARD_BLOCK, SOFT_BLOCK, WATCH
 *  - HARD_BLOCK: Prevents all contract operations (§3.35)
 *  - SOFT_BLOCK: Requires manager approval/override (§3.36)
 *  - WATCH: Warning only, no operational blocking (§3.37)
 *  - Branch-specific or global blacklist scope
 *  - Effective date range support (effectiveFrom, effectiveUntil)
 * 
 * @services
 *  - checkBlacklist(entityType, entityId, action, branchId?): Returns blocking status
 *  - addToBlacklist(command): Creates blacklist entry with audit
 *  - removeFromBlacklist(entryId): Deactivates entry
 *  - requestOverride(entryId, managerId, reason): Manager override workflow
 * 
 * @integration
 *  - Contract creation: Checked before saving draft (§3.1)
 *  - Contract activation: Checked before OTP generation (§3.3)
 *  - Customer schema: blacklistStatus field (CLEAR/FLAGGED/BLOCKED)
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§3.35-3.37, Part 11)
 */

import { db } from "../db";
import { 
  blacklistEntries, 
  customers, 
  companies, 
  sponsors,
  contracts,
  auditLogs,
  type BlacklistEntry,
  type InsertBlacklistEntry
} from "@shared/schema";
import { eq, and, or, isNull, gte, lte, inArray } from "drizzle-orm";
import { storage } from "../storage";

// Blacklist status levels per Master Spec
export enum BlacklistStatus {
  NONE = 'none',
  WATCH = 'watch',
  SOFT_BLOCK = 'soft_block',
  HARD_BLOCK = 'hard_block'
}

// Entity types that can be blacklisted
export type BlacklistEntityType = 'customer' | 'company' | 'sponsor';

// Blocked action types
export type BlockedAction = 'new_contract' | 'extension' | 'activation' | 'all';

// Check result interface
export interface BlacklistCheckResult {
  isBlocked: boolean;
  status: BlacklistStatus;
  requiresManagerOverride: boolean;
  reason?: string;
  reasonAr?: string;
  blockedActions: string[];
  entries: BlacklistEntry[];
}

// Override result interface
export interface OverrideResult {
  success: boolean;
  overrideToken?: string;
  error?: string;
}

class BlacklistService {
  /**
   * Per Master Spec §3.35 - Check if entity is blacklisted
   * Returns blocking status and whether manager override is possible
   */
  async checkBlacklist(
    entityType: BlacklistEntityType,
    entityId: string,
    action: BlockedAction = 'new_contract',
    branchId?: string
  ): Promise<BlacklistCheckResult> {
    try {
      const now = new Date();
      
      // Build conditions for active blacklist entries
      const conditions = [
        eq(blacklistEntries.entityType, entityType),
        eq(blacklistEntries.entityId, entityId),
        eq(blacklistEntries.isActive, true),
        // Check effective period
        or(
          isNull(blacklistEntries.effectiveUntil),
          gte(blacklistEntries.effectiveUntil, now)
        ),
        lte(blacklistEntries.effectiveFrom, now),
      ];

      // Check for global or branch-specific entries
      if (branchId) {
        conditions.push(
          or(
            isNull(blacklistEntries.branchId),
            eq(blacklistEntries.branchId, branchId)
          )
        );
      }

      const entries = await db.query.blacklistEntries.findMany({
        where: and(...conditions),
        orderBy: (b, { desc }) => [desc(b.createdAt)]
      });

      if (entries.length === 0) {
        return {
          isBlocked: false,
          status: BlacklistStatus.NONE,
          requiresManagerOverride: false,
          blockedActions: [],
          entries: []
        };
      }

      // Get highest severity status
      let highestStatus = BlacklistStatus.NONE;
      let blockedActions: string[] = [];
      let primaryReason: string | undefined;
      let primaryReasonAr: string | undefined;

      for (const entry of entries) {
        const entryStatus = entry.blacklistStatus as BlacklistStatus;
        
        // Track highest severity
        if (this.getStatusSeverity(entryStatus) > this.getStatusSeverity(highestStatus)) {
          highestStatus = entryStatus;
          primaryReason = entry.reason || undefined;
          primaryReasonAr = entry.reasonAr || undefined;
        }

        // Merge blocked actions (use Array.from for compatibility)
        if (entry.blockedActions) {
          const combined = [...blockedActions, ...(entry.blockedActions as string[])];
          blockedActions = Array.from(new Set(combined));
        }
      }

      // Check if the requested action is blocked
      const isActionBlocked = blockedActions.includes('all') || blockedActions.includes(action);
      
      // Determine blocking based on status and action
      let isBlocked = false;
      let requiresManagerOverride = false;

      if (highestStatus === BlacklistStatus.HARD_BLOCK) {
        isBlocked = isActionBlocked;
        requiresManagerOverride = false; // Hard block cannot be overridden
      } else if (highestStatus === BlacklistStatus.SOFT_BLOCK) {
        isBlocked = isActionBlocked;
        requiresManagerOverride = isActionBlocked; // Soft block can be overridden by manager
      } else if (highestStatus === BlacklistStatus.WATCH) {
        isBlocked = false;
        requiresManagerOverride = false;
        // Watch status just shows a warning, doesn't block
      }

      return {
        isBlocked,
        status: highestStatus,
        requiresManagerOverride,
        reason: primaryReason,
        reasonAr: primaryReasonAr,
        blockedActions,
        entries
      };
    } catch (error) {
      console.error('[BlacklistService] checkBlacklist error:', error);
      // On error, allow operation to proceed but log
      return {
        isBlocked: false,
        status: BlacklistStatus.NONE,
        requiresManagerOverride: false,
        blockedActions: [],
        entries: []
      };
    }
  }

  /**
   * Per Master Spec §3.35 - Comprehensive pre-contract check
   * Checks customer, associated company, and sponsor
   */
  async checkPreContractBlacklist(
    customerId: string,
    companyId?: string,
    sponsorId?: string,
    branchId?: string
  ): Promise<{
    canProceed: boolean;
    requiresOverride: boolean;
    blockedEntities: { type: BlacklistEntityType; result: BlacklistCheckResult }[];
    warnings: { type: BlacklistEntityType; result: BlacklistCheckResult }[];
  }> {
    const blockedEntities: { type: BlacklistEntityType; result: BlacklistCheckResult }[] = [];
    const warnings: { type: BlacklistEntityType; result: BlacklistCheckResult }[] = [];

    // Check customer
    const customerCheck = await this.checkBlacklist('customer', customerId, 'new_contract', branchId);
    if (customerCheck.isBlocked) {
      blockedEntities.push({ type: 'customer', result: customerCheck });
    } else if (customerCheck.status === BlacklistStatus.WATCH) {
      warnings.push({ type: 'customer', result: customerCheck });
    }

    // Check company if provided
    if (companyId) {
      const companyCheck = await this.checkBlacklist('company', companyId, 'new_contract', branchId);
      if (companyCheck.isBlocked) {
        blockedEntities.push({ type: 'company', result: companyCheck });
      } else if (companyCheck.status === BlacklistStatus.WATCH) {
        warnings.push({ type: 'company', result: companyCheck });
      }
    }

    // Check sponsor if provided
    if (sponsorId) {
      const sponsorCheck = await this.checkBlacklist('sponsor', sponsorId, 'new_contract', branchId);
      if (sponsorCheck.isBlocked) {
        blockedEntities.push({ type: 'sponsor', result: sponsorCheck });
      } else if (sponsorCheck.status === BlacklistStatus.WATCH) {
        warnings.push({ type: 'sponsor', result: sponsorCheck });
      }
    }

    // Determine overall result
    const hasHardBlock = blockedEntities.some(
      e => e.result.status === BlacklistStatus.HARD_BLOCK
    );
    const hasSoftBlock = blockedEntities.some(
      e => e.result.status === BlacklistStatus.SOFT_BLOCK
    );

    return {
      canProceed: blockedEntities.length === 0 || (!hasHardBlock && hasSoftBlock),
      requiresOverride: hasSoftBlock && !hasHardBlock,
      blockedEntities,
      warnings
    };
  }

  /**
   * Per Master Spec §3.36 - Add entity to blacklist
   */
  async addToBlacklist(
    entry: Omit<InsertBlacklistEntry, 'id' | 'createdAt' | 'updatedAt'>,
    addedByUserId: string
  ): Promise<{ success: boolean; entry?: BlacklistEntry; error?: string }> {
    try {
      // Validate entity exists
      const entityExists = await this.validateEntityExists(
        entry.entityType as BlacklistEntityType,
        entry.entityId
      );

      if (!entityExists) {
        return { success: false, error: `${entry.entityType} not found` };
      }

      const [newEntry] = await db.insert(blacklistEntries).values({
        entityType: entry.entityType,
        entityId: entry.entityId,
        blacklistStatus: entry.blacklistStatus,
        reason: entry.reason,
        reasonAr: entry.reasonAr,
        evidenceDocuments: entry.evidenceDocuments as string[],
        blockedActions: entry.blockedActions as string[],
        effectiveFrom: entry.effectiveFrom,
        effectiveUntil: entry.effectiveUntil,
        addedBy: addedByUserId,
        notes: entry.notes,
        branchId: entry.branchId,
        isActive: true,
      }).returning();

      // Create audit log per Master Spec dual audit trail
      await storage.createAuditLog({
        userId: addedByUserId,
        action: 'BLACKLIST_ADDED',
        details: JSON.stringify({
          entryId: newEntry.id,
          entityType: entry.entityType,
          entityId: entry.entityId,
          status: entry.blacklistStatus,
          reason: entry.reason,
        })
      });

      return { success: true, entry: newEntry };
    } catch (error: any) {
      console.error('[BlacklistService] addToBlacklist error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.36 - Update blacklist entry
   */
  async updateBlacklistEntry(
    entryId: string,
    updates: Partial<InsertBlacklistEntry>,
    updatedByUserId: string
  ): Promise<{ success: boolean; entry?: BlacklistEntry; error?: string }> {
    try {
      const existing = await db.query.blacklistEntries.findFirst({
        where: eq(blacklistEntries.id, entryId)
      });

      if (!existing) {
        return { success: false, error: 'Blacklist entry not found' };
      }

      const [updatedEntry] = await db.update(blacklistEntries)
        .set({
          blacklistStatus: updates.blacklistStatus ?? existing.blacklistStatus,
          reason: updates.reason ?? existing.reason,
          reasonAr: updates.reasonAr ?? existing.reasonAr,
          evidenceDocuments: updates.evidenceDocuments as string[] ?? existing.evidenceDocuments,
          blockedActions: updates.blockedActions as string[] ?? existing.blockedActions,
          effectiveFrom: updates.effectiveFrom ?? existing.effectiveFrom,
          effectiveUntil: updates.effectiveUntil ?? existing.effectiveUntil,
          notes: updates.notes ?? existing.notes,
          branchId: updates.branchId ?? existing.branchId,
          isActive: updates.isActive ?? existing.isActive,
          updatedAt: new Date(),
        })
        .where(eq(blacklistEntries.id, entryId))
        .returning();

      // Create audit log per Master Spec dual audit trail
      await storage.createAuditLog({
        userId: updatedByUserId,
        action: 'BLACKLIST_UPDATED',
        details: JSON.stringify({
          entryId,
          oldStatus: existing.blacklistStatus,
          newStatus: updates.blacklistStatus || existing.blacklistStatus,
          changes: updates,
        })
      });

      return { success: true, entry: updatedEntry };
    } catch (error: any) {
      console.error('[BlacklistService] updateBlacklistEntry error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.36 - Remove from blacklist (deactivate)
   */
  async removeFromBlacklist(
    entryId: string,
    removedByUserId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const existing = await db.query.blacklistEntries.findFirst({
        where: eq(blacklistEntries.id, entryId)
      });

      if (!existing) {
        return { success: false, error: 'Blacklist entry not found' };
      }

      await db.update(blacklistEntries)
        .set({
          isActive: false,
          reviewedBy: removedByUserId,
          reviewedAt: new Date(),
          notes: reason ? `${existing.notes || ''}\nRemoved: ${reason}` : existing.notes,
          updatedAt: new Date(),
        })
        .where(eq(blacklistEntries.id, entryId));

      // Create audit log per Master Spec dual audit trail
      await storage.createAuditLog({
        userId: removedByUserId,
        action: 'BLACKLIST_REMOVED',
        details: JSON.stringify({
          entryId,
          entityType: existing.entityType,
          entityId: existing.entityId,
          previousStatus: existing.blacklistStatus,
          removalReason: reason,
        })
      });

      return { success: true };
    } catch (error: any) {
      console.error('[BlacklistService] removeFromBlacklist error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.36 - Manager override for soft blocks
   * Generates a time-limited override token
   */
  async requestManagerOverride(
    entryId: string,
    managerId: string,
    contractId: string,
    reason: string
  ): Promise<OverrideResult> {
    try {
      const entry = await db.query.blacklistEntries.findFirst({
        where: eq(blacklistEntries.id, entryId)
      });

      if (!entry) {
        return { success: false, error: 'Blacklist entry not found' };
      }

      // Only soft blocks can be overridden
      if (entry.blacklistStatus !== BlacklistStatus.SOFT_BLOCK) {
        return { success: false, error: 'Only soft block entries can be overridden' };
      }

      // Generate override token (valid for 24 hours)
      const overrideToken = `OVERRIDE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Create audit log for override request per Master Spec dual audit trail
      await storage.createAuditLog({
        userId: managerId,
        action: 'BLACKLIST_OVERRIDE_GRANTED',
        contractId,
        details: JSON.stringify({
          entryId,
          reason,
          overrideToken,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
      });

      return { success: true, overrideToken };
    } catch (error: any) {
      console.error('[BlacklistService] requestManagerOverride error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all active blacklist entries for an entity
   */
  async getEntityBlacklistHistory(
    entityType: BlacklistEntityType,
    entityId: string
  ): Promise<BlacklistEntry[]> {
    try {
      return await db.query.blacklistEntries.findMany({
        where: and(
          eq(blacklistEntries.entityType, entityType),
          eq(blacklistEntries.entityId, entityId)
        ),
        orderBy: (b, { desc }) => [desc(b.createdAt)]
      });
    } catch (error) {
      console.error('[BlacklistService] getEntityBlacklistHistory error:', error);
      return [];
    }
  }

  /**
   * Get all active blacklist entries (for admin dashboard)
   */
  async getActiveBlacklistEntries(branchId?: string): Promise<BlacklistEntry[]> {
    try {
      const conditions = [
        eq(blacklistEntries.isActive, true),
        or(
          isNull(blacklistEntries.effectiveUntil),
          gte(blacklistEntries.effectiveUntil, new Date())
        )
      ];

      if (branchId) {
        conditions.push(
          or(
            isNull(blacklistEntries.branchId),
            eq(blacklistEntries.branchId, branchId)
          )
        );
      }

      return await db.query.blacklistEntries.findMany({
        where: and(...conditions),
        orderBy: (b, { desc }) => [desc(b.createdAt)]
      });
    } catch (error) {
      console.error('[BlacklistService] getActiveBlacklistEntries error:', error);
      return [];
    }
  }

  /**
   * Helper to validate entity exists
   */
  private async validateEntityExists(
    entityType: BlacklistEntityType,
    entityId: string
  ): Promise<boolean> {
    try {
      let result: any;
      
      switch (entityType) {
        case 'customer':
          result = await db.query.customers.findFirst({
            where: eq(customers.id, entityId)
          });
          break;
        case 'company':
          result = await db.query.companies.findFirst({
            where: eq(companies.id, entityId)
          });
          break;
        case 'sponsor':
          result = await db.query.sponsors.findFirst({
            where: eq(sponsors.id, entityId)
          });
          break;
      }

      return !!result;
    } catch (error) {
      console.error('[BlacklistService] validateEntityExists error:', error);
      return false;
    }
  }

  /**
   * Get status severity for comparison
   */
  private getStatusSeverity(status: BlacklistStatus): number {
    switch (status) {
      case BlacklistStatus.HARD_BLOCK: return 3;
      case BlacklistStatus.SOFT_BLOCK: return 2;
      case BlacklistStatus.WATCH: return 1;
      default: return 0;
    }
  }
}

export const blacklistService = new BlacklistService();
