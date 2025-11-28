/**
 * File: server/services/availabilityEngine.ts
 * @area Availability Engine
 * @checklist §2.18, §3.26, Appendix C.8
 * @purpose High-performance vehicle availability tracking per Master Spec §2.18
 * 
 * @behaviour
 *  - Materialized availability via vehicle_availability_cache table
 *  - Event-driven updates on: reservation, cancellation, activation, completion, transfer, maintenance
 *  - Indexed queries for real-time multi-branch fleet visibility
 *  - Cache metadata: lastRebuildAt, rebuildSource per Appendix C.8
 * 
 * @services
 *  - updateVehicleAvailability(vehicleId, dates, status): Updates cache entries
 *  - clearVehicleAvailability(vehicleId, dates): Resets to 'available'
 *  - getVehicleAvailability(vehicleId, dateRange): Queries availability
 *  - getBranchAvailability(branchId): Aggregate branch metrics
 *  - rebuildCacheForVehicle(vehicleId): Full cache rebuild
 * 
 * @triggers (per §3.26)
 *  - Reservation created/cancelled
 *  - Contract activated/completed/closed/cancelled
 *  - Vehicle transferred between branches
 *  - Maintenance job started/completed
 * 
 * @notes
 *  - Uses UPSERT for conflict resolution (vehicleId + date)
 *  - Cache TTL managed by CACHE_VALIDATION cron job
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.18, §3.26, Appendix C.8)
 */

import { db } from '../db';
import { vehicleAvailabilityCache, vehicles, contracts, branches } from '@shared/schema';
import { eq, and, gte, lte, inArray, sql, or, not, isNull } from 'drizzle-orm';
import { addDays, format, startOfDay } from 'date-fns';

export type AvailabilityStatus = 'available' | 'reserved' | 'rented' | 'maintenance' | 'transfer' | 'damaged' | 'blocked';

export const AVAILABILITY_STATUSES: AvailabilityStatus[] = ['available', 'reserved', 'rented', 'maintenance', 'transfer', 'damaged', 'blocked'];

export interface AvailabilityQuery {
  vehicleId?: string;
  branchId?: string;
  startDate: Date;
  endDate: Date;
  status?: AvailabilityStatus;
  includeRented?: boolean;
}

export interface AvailabilityEntry {
  vehicleId: string;
  branchId: string;
  date: string;
  status: AvailabilityStatus;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface VehicleAvailability {
  vehicleId: string;
  branchId: string;
  isAvailable: boolean;
  status: AvailabilityStatus;
  blockedDates: string[];
  nextAvailableDate?: string;
}

export interface BranchAvailability {
  branchId: string;
  totalVehicles: number;
  availableCount: number;
  rentedCount: number;
  maintenanceCount: number;
  transferCount: number;
  damagedCount: number;
  blockedCount: number;
  availabilityRate: number;
}

class AvailabilityEngine {
  async updateVehicleAvailability(
    vehicleId: string,
    branchId: string,
    startDate: Date,
    endDate: Date,
    status: AvailabilityStatus,
    entityType?: string,
    entityId?: string,
    notes?: string
  ): Promise<void> {
    try {
      const dates = this.getDateRange(startDate, endDate);
      
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        
        await db
          .insert(vehicleAvailabilityCache)
          .values({
            vehicleId,
            branchId,
            date: dateStr,
            status,
            relatedEntityType: entityType || null,
            relatedEntityId: entityId || null,
            notes: notes || null,
          })
          .onConflictDoUpdate({
            target: [vehicleAvailabilityCache.vehicleId, vehicleAvailabilityCache.date],
            set: {
              status,
              branchId,
              relatedEntityType: entityType || null,
              relatedEntityId: entityId || null,
              notes: notes || null,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });
      }

      console.log(`[AvailabilityEngine] Updated availability for vehicle ${vehicleId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')} as ${status}`);
    } catch (error) {
      console.error('[AvailabilityEngine] Error updating availability:', error);
      throw error;
    }
  }

  async clearVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    newStatus: AvailabilityStatus = 'available'
  ): Promise<void> {
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      await db
        .update(vehicleAvailabilityCache)
        .set({
          status: newStatus,
          relatedEntityType: null,
          relatedEntityId: null,
          notes: null,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(vehicleAvailabilityCache.vehicleId, vehicleId),
            gte(vehicleAvailabilityCache.date, startStr),
            lte(vehicleAvailabilityCache.date, endStr)
          )
        );

      console.log(`[AvailabilityEngine] Cleared availability for vehicle ${vehicleId} from ${startStr} to ${endStr}`);
    } catch (error) {
      console.error('[AvailabilityEngine] Error clearing availability:', error);
      throw error;
    }
  }

  async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<VehicleAvailability> {
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      const entries = await db
        .select()
        .from(vehicleAvailabilityCache)
        .where(
          and(
            eq(vehicleAvailabilityCache.vehicleId, vehicleId),
            gte(vehicleAvailabilityCache.date, startStr),
            lte(vehicleAvailabilityCache.date, endStr)
          )
        )
        .orderBy(vehicleAvailabilityCache.date);

      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);

      if (!vehicle.length) {
        throw new Error('Vehicle not found');
      }

      const blockedDates: string[] = [];
      let currentStatus: AvailabilityStatus = 'available';
      
      for (const entry of entries) {
        if (entry.status !== 'available') {
          blockedDates.push(entry.date);
          currentStatus = entry.status as AvailabilityStatus;
        }
      }

      const isAvailable = blockedDates.length === 0;

      let nextAvailableDate: string | undefined;
      if (!isAvailable) {
        const futureEntries = await db
          .select()
          .from(vehicleAvailabilityCache)
          .where(
            and(
              eq(vehicleAvailabilityCache.vehicleId, vehicleId),
              gte(vehicleAvailabilityCache.date, format(endDate, 'yyyy-MM-dd')),
              eq(vehicleAvailabilityCache.status, 'available')
            )
          )
          .orderBy(vehicleAvailabilityCache.date)
          .limit(1);

        if (futureEntries.length > 0) {
          nextAvailableDate = futureEntries[0].date;
        }
      }

      return {
        vehicleId,
        branchId: vehicle[0].branchId || '',
        isAvailable,
        status: currentStatus,
        blockedDates,
        nextAvailableDate,
      };
    } catch (error) {
      console.error('[AvailabilityEngine] Error checking availability:', error);
      throw error;
    }
  }

  async getAvailableVehicles(
    branchId: string,
    startDate: Date,
    endDate: Date,
    vehicleType?: string
  ): Promise<string[]> {
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      const allVehicles = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(
          and(
            eq(vehicles.branchId, branchId),
            eq(vehicles.status, 'available'),
            vehicleType ? eq(vehicles.vehicleType, vehicleType) : undefined
          )
        );

      if (allVehicles.length === 0) {
        return [];
      }

      const vehicleIds = allVehicles.map(v => v.id);

      const blockedEntries = await db
        .select({ vehicleId: vehicleAvailabilityCache.vehicleId })
        .from(vehicleAvailabilityCache)
        .where(
          and(
            inArray(vehicleAvailabilityCache.vehicleId, vehicleIds),
            gte(vehicleAvailabilityCache.date, startStr),
            lte(vehicleAvailabilityCache.date, endStr),
            not(eq(vehicleAvailabilityCache.status, 'available'))
          )
        )
        .groupBy(vehicleAvailabilityCache.vehicleId);

      const blockedVehicleIds = new Set(blockedEntries.map(e => e.vehicleId));
      
      return vehicleIds.filter(id => !blockedVehicleIds.has(id));
    } catch (error) {
      console.error('[AvailabilityEngine] Error getting available vehicles:', error);
      throw error;
    }
  }

  async getBranchAvailability(
    branchId: string,
    date: Date
  ): Promise<BranchAvailability> {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const branchVehicles = await db
        .select({ id: vehicles.id, status: vehicles.status })
        .from(vehicles)
        .where(eq(vehicles.branchId, branchId));

      const totalVehicles = branchVehicles.length;
      
      if (totalVehicles === 0) {
        return {
          branchId,
          totalVehicles: 0,
          availableCount: 0,
          rentedCount: 0,
          maintenanceCount: 0,
          transferCount: 0,
          damagedCount: 0,
          blockedCount: 0,
          availabilityRate: 0,
        };
      }

      const vehicleIds = branchVehicles.map(v => v.id);

      const cacheEntries = await db
        .select()
        .from(vehicleAvailabilityCache)
        .where(
          and(
            inArray(vehicleAvailabilityCache.vehicleId, vehicleIds),
            eq(vehicleAvailabilityCache.date, dateStr)
          )
        );

      const cacheMap = new Map(cacheEntries.map(e => [e.vehicleId, e.status]));

      const counts: Record<string, number> = {
        available: 0,
        reserved: 0,
        rented: 0,
        maintenance: 0,
        transfer: 0,
        damaged: 0,
        blocked: 0,
      };

      for (const vehicle of branchVehicles) {
        const cacheStatus = cacheMap.get(vehicle.id);
        
        if (cacheStatus) {
          counts[cacheStatus] = (counts[cacheStatus] || 0) + 1;
        } else {
          if (vehicle.status === 'available') {
            counts.available++;
          } else if (vehicle.status === 'maintenance') {
            counts.maintenance++;
          } else if (vehicle.status === 'damaged') {
            counts.damaged++;
          } else if (vehicle.status === 'rented') {
            counts.rented++;
          } else {
            counts.available++;
          }
        }
      }

      return {
        branchId,
        totalVehicles,
        availableCount: counts.available,
        rentedCount: counts.rented + counts.reserved,
        maintenanceCount: counts.maintenance,
        transferCount: counts.transfer,
        damagedCount: counts.damaged,
        blockedCount: counts.blocked,
        availabilityRate: totalVehicles > 0 ? (counts.available / totalVehicles) * 100 : 0,
      };
    } catch (error) {
      console.error('[AvailabilityEngine] Error getting branch availability:', error);
      throw error;
    }
  }

  async getAllBranchesAvailability(date: Date): Promise<BranchAvailability[]> {
    try {
      const allBranches = await db
        .select({ id: branches.id })
        .from(branches)
        .where(eq(branches.isActive, true));

      const results: BranchAvailability[] = [];
      
      for (const branch of allBranches) {
        const availability = await this.getBranchAvailability(branch.id as string, date);
        results.push(availability);
      }

      return results;
    } catch (error) {
      console.error('[AvailabilityEngine] Error getting all branches availability:', error);
      throw error;
    }
  }

  async rebuildVehicleCache(vehicleId: string, daysAhead: number = 90): Promise<void> {
    try {
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);

      if (!vehicle.length) {
        throw new Error('Vehicle not found');
      }

      const startDate = startOfDay(new Date());
      const endDate = addDays(startDate, daysAhead);

      const activeContracts = await db
        .select()
        .from(contracts)
        .where(
          and(
            eq(contracts.vehicleId, vehicleId),
            inArray(contracts.status, ['reserved', 'active']),
            or(
              and(
                lte(contracts.rentalStartDate, endDate),
                gte(contracts.rentalEndDate, startDate)
              )
            )
          )
        );

      const dates = this.getDateRange(startDate, endDate);
      
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        let status: AvailabilityStatus = 'available';
        let relatedEntityType: string | null = null;
        let relatedEntityId: string | null = null;

        for (const contract of activeContracts) {
          const contractStart = new Date(contract.rentalStartDate);
          const contractEnd = new Date(contract.rentalEndDate);

          if (date >= contractStart && date <= contractEnd) {
            status = contract.status === 'reserved' ? 'reserved' : 'rented';
            relatedEntityType = 'contract';
            relatedEntityId = contract.id;
            break;
          }
        }

        if (vehicle[0].status === 'maintenance') {
          status = 'maintenance';
        } else if (vehicle[0].status === 'damaged') {
          status = 'damaged';
        }

        await db
          .insert(vehicleAvailabilityCache)
          .values({
            vehicleId,
            branchId: vehicle[0].branchId || '',
            date: dateStr,
            status,
            relatedEntityType,
            relatedEntityId,
          })
          .onConflictDoUpdate({
            target: [vehicleAvailabilityCache.vehicleId, vehicleAvailabilityCache.date],
            set: {
              status,
              branchId: vehicle[0].branchId || '',
              relatedEntityType,
              relatedEntityId,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            },
          });
      }

      console.log(`[AvailabilityEngine] Rebuilt cache for vehicle ${vehicleId} for ${daysAhead} days`);
    } catch (error) {
      console.error('[AvailabilityEngine] Error rebuilding vehicle cache:', error);
      throw error;
    }
  }

  async rebuildBranchCache(branchId: string, daysAhead: number = 90): Promise<void> {
    try {
      const branchVehicles = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(eq(vehicles.branchId, branchId));

      for (const vehicle of branchVehicles) {
        await this.rebuildVehicleCache(vehicle.id, daysAhead);
      }

      console.log(`[AvailabilityEngine] Rebuilt cache for branch ${branchId} (${branchVehicles.length} vehicles)`);
    } catch (error) {
      console.error('[AvailabilityEngine] Error rebuilding branch cache:', error);
      throw error;
    }
  }

  async validateCacheIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Use SQL date casting to avoid timezone issues with date-only comparisons
      const vehiclesWithContracts = await db
        .select({
          vehicleId: contracts.vehicleId,
          contractId: contracts.id,
          status: contracts.status,
        })
        .from(contracts)
        .where(
          and(
            inArray(contracts.status, ['active']),
            sql`DATE(${contracts.rentalStartDate}) <= DATE(${today})`,
            sql`DATE(${contracts.rentalEndDate}) >= DATE(${today})`
          )
        );

      for (const contract of vehiclesWithContracts) {
        const cacheEntry = await db
          .select()
          .from(vehicleAvailabilityCache)
          .where(
            and(
              eq(vehicleAvailabilityCache.vehicleId, contract.vehicleId),
              eq(vehicleAvailabilityCache.date, today)
            )
          )
          .limit(1);

        if (cacheEntry.length === 0) {
          issues.push(`Vehicle ${contract.vehicleId} has active contract ${contract.contractId} but no cache entry for today`);
        } else if (cacheEntry[0].status !== 'rented') {
          issues.push(`Vehicle ${contract.vehicleId} has active contract but cache shows status '${cacheEntry[0].status}' instead of 'rented'`);
        }
      }

      console.log(`[AvailabilityEngine] Cache validation complete. ${issues.length} issues found.`);
      return { valid: issues.length === 0, issues };
    } catch (error) {
      console.error('[AvailabilityEngine] Error validating cache:', error);
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, issues };
    }
  }

  async handleContractActivation(contractId: string): Promise<void> {
    try {
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Use canonical startDatetime/endDatetime if available, fallback to rentalStartDate/rentalEndDate
      const startDate = new Date(contract.startDatetime || contract.rentalStartDate);
      const endDate = new Date(contract.endDatetime || contract.rentalEndDate);

      await this.updateVehicleAvailability(
        contract.vehicleId!,
        contract.branchId || '',
        startDate,
        endDate,
        'rented',
        'contract',
        contractId,
        `Contract ${contract.contractNumber}`
      );
    } catch (error) {
      console.error('[AvailabilityEngine] Error handling contract activation:', error);
      throw error;
    }
  }

  async handleContractClosure(contractId: string): Promise<void> {
    try {
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contract) {
        throw new Error('Contract not found');
      }

      const today = startOfDay(new Date());
      const originalEndDate = new Date(contract.endDatetime || contract.rentalEndDate);
      const endDate = originalEndDate > today ? originalEndDate : today;

      await this.clearVehicleAvailability(
        contract.vehicleId,
        today,
        endDate,
        'available'
      );
    } catch (error) {
      console.error('[AvailabilityEngine] Error handling contract closure:', error);
      throw error;
    }
  }

  async handleReservationCreation(
    vehicleId: string,
    branchId: string,
    startDate: Date,
    endDate: Date,
    reservationId: string
  ): Promise<void> {
    await this.updateVehicleAvailability(
      vehicleId,
      branchId,
      startDate,
      endDate,
      'reserved',
      'reservation',
      reservationId
    );
  }

  async handleReservationCancellation(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await this.clearVehicleAvailability(vehicleId, startDate, endDate, 'available');
  }

  async handleMaintenanceStart(
    vehicleId: string,
    branchId: string,
    startDate: Date,
    endDate: Date,
    maintenanceId: string
  ): Promise<void> {
    await this.updateVehicleAvailability(
      vehicleId,
      branchId,
      startDate,
      endDate,
      'maintenance',
      'maintenance',
      maintenanceId
    );
  }

  async handleMaintenanceEnd(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await this.clearVehicleAvailability(vehicleId, startDate, endDate, 'available');
  }

  async handleVehicleTransfer(
    vehicleId: string,
    fromBranchId: string,
    toBranchId: string,
    transferDate: Date,
    transferId: string
  ): Promise<void> {
    await this.updateVehicleAvailability(
      vehicleId,
      fromBranchId,
      transferDate,
      transferDate,
      'transfer',
      'transfer',
      transferId,
      `Transferring to ${toBranchId}`
    );

    const futureDate = addDays(transferDate, 1);
    const farFuture = addDays(transferDate, 90);
    
    await this.updateVehicleAvailability(
      vehicleId,
      toBranchId,
      futureDate,
      farFuture,
      'available',
      undefined,
      undefined,
      `Transferred from ${fromBranchId}`
    );
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = startOfDay(startDate);
    const end = startOfDay(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }
}

export const availabilityEngine = new AvailabilityEngine();
