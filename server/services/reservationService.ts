/**
 * Reservation Service - Per Master Spec §3.24-3.25
 * 
 * Handles vehicle and group reservations:
 * - Create reservations for specific vehicles or vehicle groups
 * - Auto-expiry of unclaimed reservations (cron job integration)
 * - Convert reservation to contract
 * - Manage reservation lifecycle
 */

import { db } from "../db";
import { 
  reservations, 
  vehicles, 
  customers,
  contracts,
  branches,
  tariffs,
  vehicleGroups,
  type Reservation,
  type InsertReservation
} from "@shared/schema";
import { eq, and, or, sql, lt, gte, lte, inArray, isNull } from "drizzle-orm";
import { createAuditLog } from "../utils/auditLogger";
import { blacklistService, BlacklistStatus } from "./blacklistService";
import { triggerNotification } from "./notificationTrigger";

// Reservation statuses per Master Spec
export const ReservationStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  CONVERTED: 'converted',
  NO_SHOW: 'no_show'
} as const;

export type ReservationStatusType = typeof ReservationStatus[keyof typeof ReservationStatus];

// Vehicle status constants
export const VehicleStatus = {
  AVAILABLE: 'available',
  OUT: 'out',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
  PENDING_INSPECTION: 'pending_inspection',
} as const;

// Result types
export interface ReservationResult {
  success: boolean;
  reservation?: Reservation;
  error?: string;
  warnings?: string[];
}

// Command DTOs
export interface CreateReservationCommand {
  branchId: string;
  hirerId: string;
  vehicleId?: string; // Specific vehicle or...
  vehicleGroupId?: string; // ...vehicle group for flexibility
  tariffId?: string;
  startDatetime: Date;
  endDatetime: Date;
  depositExpected?: number;
  notes?: string;
  createdBy: string;
}

export interface ConvertToContractCommand {
  reservationId: string;
  vehicleId?: string; // Override vehicle if group reservation
  convertedBy: string;
}

class ReservationService {
  /**
   * Per Master Spec §3.24 - Create Reservation
   * Reserves a specific vehicle or vehicle group for future rental.
   */
  async createReservation(command: CreateReservationCommand): Promise<ReservationResult> {
    const warnings: string[] = [];

    try {
      // Validate hirer exists
      const hirer = await db.query.customers.findFirst({
        where: eq(customers.id, command.hirerId)
      });

      if (!hirer) {
        return { success: false, error: 'Customer not found' };
      }

      // Check blacklist status
      const blacklistCheck = await blacklistService.checkBlacklist(
        'customer',
        command.hirerId,
        'new_contract',
        command.branchId
      );

      if (blacklistCheck.isBlocked && blacklistCheck.status === BlacklistStatus.HARD_BLOCK) {
        return { success: false, error: `Customer is blacklisted: ${blacklistCheck.reason || 'Cannot create reservations'}` };
      }

      if (blacklistCheck.requiresManagerOverride) {
        warnings.push(`Customer has soft-block status - manager approval may be required: ${blacklistCheck.reason}`);
      }

      // Validate dates
      const startDate = new Date(command.startDatetime);
      const endDate = new Date(command.endDatetime);
      const now = new Date();

      if (startDate < now) {
        return { success: false, error: 'Reservation start date cannot be in the past' };
      }

      if (endDate <= startDate) {
        return { success: false, error: 'End date must be after start date' };
      }

      // Validate branch
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, command.branchId)
      });

      if (!branch) {
        return { success: false, error: 'Branch not found' };
      }

      let vehicleId = command.vehicleId;

      // If specific vehicle, validate availability
      if (vehicleId) {
        const vehicle = await db.query.vehicles.findFirst({
          where: eq(vehicles.id, vehicleId)
        });

        if (!vehicle) {
          return { success: false, error: 'Vehicle not found' };
        }

        // Check if vehicle is available for the period
        const isAvailable = await this.checkVehicleAvailability(
          vehicleId,
          startDate,
          endDate
        );

        if (!isAvailable) {
          return { success: false, error: 'Vehicle is not available for the requested period' };
        }
      } else if (command.vehicleGroupId) {
        // Group reservation - find any available vehicle in group
        const availableVehicle = await this.findAvailableVehicleInGroup(
          command.vehicleGroupId,
          command.branchId,
          startDate,
          endDate
        );

        if (availableVehicle) {
          warnings.push(`Vehicle will be assigned at pickup from group ${command.vehicleGroupId}`);
        } else {
          warnings.push('No vehicles currently available in group - availability will be verified at pickup');
        }
      } else {
        return { success: false, error: 'Either vehicleId or vehicleGroupId is required' };
      }

      // Generate reservation number
      const reservationNumber = await this.generateReservationNumber();

      // Create reservation
      const [reservation] = await db.insert(reservations).values({
        reservationNumber,
        branchId: command.branchId,
        hirerId: command.hirerId,
        vehicleId: vehicleId || null,
        vehicleGroupId: command.vehicleGroupId,
        tariffId: command.tariffId,
        startDatetime: startDate,
        endDatetime: endDate,
        status: ReservationStatus.PENDING,
        depositExpected: command.depositExpected?.toString(),
        notes: command.notes,
        createdBy: command.createdBy,
      }).returning();

      // If specific vehicle, mark it as reserved
      if (vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.RESERVED,
            updatedAt: new Date(),
          })
          .where(eq(vehicles.id, vehicleId));
      }

      // Create audit log
      await createAuditLog(
        'reservations',
        reservation.id,
        'RESERVATION_CREATED',
        command.createdBy,
        {
          reservationNumber,
          hirerId: command.hirerId,
          vehicleId: vehicleId || command.vehicleGroupId,
          period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
        }
      );

      // Trigger confirmation notification
      await triggerNotification('RESERVATION_CREATED', {
        reservationId: reservation.id,
        customerId: command.hirerId,
        reservationNumber,
        startDatetime: startDate.toISOString(),
        endDatetime: endDate.toISOString(),
      });

      return {
        success: true,
        reservation,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error: any) {
      console.error('[ReservationService] createReservation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.24 - Confirm Reservation
   * Confirms a pending reservation after payment/deposit.
   */
  async confirmReservation(
    reservationId: string,
    depositReceived: number,
    confirmedBy: string
  ): Promise<ReservationResult> {
    try {
      const reservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, reservationId)
      });

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      if (reservation.status !== ReservationStatus.PENDING) {
        return { success: false, error: `Reservation cannot be confirmed from ${reservation.status} status` };
      }

      const [updatedReservation] = await db.update(reservations)
        .set({
          status: ReservationStatus.CONFIRMED,
          depositReceived: depositReceived.toString(),
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, reservationId))
        .returning();

      await createAuditLog(
        'reservations',
        reservationId,
        'RESERVATION_CONFIRMED',
        confirmedBy,
        { depositReceived }
      );

      return { success: true, reservation: updatedReservation };
    } catch (error: any) {
      console.error('[ReservationService] confirmReservation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.25 - Convert Reservation to Contract
   * Creates a contract from an existing reservation.
   */
  async convertToContract(command: ConvertToContractCommand): Promise<{
    success: boolean;
    contractId?: string;
    error?: string;
  }> {
    try {
      const reservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, command.reservationId)
      });

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      if (reservation.status !== ReservationStatus.CONFIRMED && 
          reservation.status !== ReservationStatus.PENDING) {
        return { success: false, error: `Reservation cannot be converted from ${reservation.status} status` };
      }

      // Determine vehicle to use
      let vehicleId = command.vehicleId || reservation.vehicleId;

      if (!vehicleId && reservation.vehicleGroupId) {
        // Find available vehicle from group
        const availableVehicle = await this.findAvailableVehicleInGroup(
          reservation.vehicleGroupId,
          reservation.branchId,
          new Date(reservation.startDatetime),
          new Date(reservation.endDatetime)
        );

        if (availableVehicle) {
          vehicleId = availableVehicle.id;
        } else {
          return { success: false, error: 'No available vehicle in group for this reservation' };
        }
      }

      if (!vehicleId) {
        return { success: false, error: 'No vehicle available for conversion' };
      }

      // Import contract lifecycle service to create the contract
      const { contractLifecycleService } = await import('./contractLifecycleService');
      
      const contractResult = await contractLifecycleService.createDraftContract({
        branchId: reservation.branchId,
        customerId: reservation.hirerId,
        vehicleId,
        tariffId: reservation.tariffId || undefined,
        partyType: 'DIRECT',
        startDatetime: new Date(reservation.startDatetime),
        endDatetime: new Date(reservation.endDatetime),
        depositExpected: reservation.depositExpected ? parseFloat(reservation.depositExpected) : undefined,
        notes: `Converted from reservation #${reservation.reservationNumber}`,
        createdBy: command.convertedBy,
      });

      if (!contractResult.success) {
        return { success: false, error: contractResult.error };
      }

      // Update reservation status to CONVERTED
      await db.update(reservations)
        .set({
          status: ReservationStatus.CONVERTED,
          contractId: contractResult.contract.id,
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, command.reservationId));

      // If vehicle was reserved, keep it reserved for the new contract
      // The contract activation will handle vehicle status change

      await createAuditLog(
        'reservations',
        command.reservationId,
        'RESERVATION_CONVERTED',
        command.convertedBy,
        {
          contractId: contractResult.contract.id,
          contractNumber: contractResult.contract.contractNumber,
        }
      );

      return {
        success: true,
        contractId: contractResult.contract.id
      };
    } catch (error: any) {
      console.error('[ReservationService] convertToContract error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(
    reservationId: string,
    reason: string,
    cancelledBy: string
  ): Promise<ReservationResult> {
    try {
      const reservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, reservationId)
      });

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      if (reservation.status === ReservationStatus.CONVERTED) {
        return { success: false, error: 'Cannot cancel a converted reservation' };
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        return { success: false, error: 'Reservation is already cancelled' };
      }

      const [updatedReservation] = await db.update(reservations)
        .set({
          status: ReservationStatus.CANCELLED,
          cancellationReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, reservationId))
        .returning();

      // Release vehicle if it was reserved
      if (reservation.vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.AVAILABLE,
            updatedAt: new Date(),
          })
          .where(eq(vehicles.id, reservation.vehicleId));
      }

      await createAuditLog(
        'reservations',
        reservationId,
        'RESERVATION_CANCELLED',
        cancelledBy,
        { reason }
      );

      return { success: true, reservation: updatedReservation };
    } catch (error: any) {
      console.error('[ReservationService] cancelReservation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Per Master Spec §3.24 - Expire unclaimed reservations
   * Called by cron job to automatically expire old pending/confirmed reservations.
   */
  async expireUnclaimed(expiryHours: number = 24): Promise<{
    success: boolean;
    expiredCount: number;
    error?: string;
  }> {
    try {
      const expiryThreshold = new Date(Date.now() - expiryHours * 60 * 60 * 1000);

      // Find reservations that have passed their start time without conversion
      const expirableReservations = await db.query.reservations.findMany({
        where: and(
          inArray(reservations.status, [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
          lt(reservations.startDatetime, new Date()), // Past start time
          isNull(reservations.contractId) // Not converted
        )
      });

      let expiredCount = 0;

      for (const reservation of expirableReservations) {
        await db.update(reservations)
          .set({
            status: ReservationStatus.EXPIRED,
            updatedAt: new Date(),
          })
          .where(eq(reservations.id, reservation.id));

        // Release vehicle
        if (reservation.vehicleId) {
          await db.update(vehicles)
            .set({
              status: VehicleStatus.AVAILABLE,
              updatedAt: new Date(),
            })
            .where(eq(vehicles.id, reservation.vehicleId));
        }

        // Trigger expiry notification
        await triggerNotification('RESERVATION_EXPIRED', {
          reservationId: reservation.id,
          customerId: reservation.hirerId,
          reservationNumber: reservation.reservationNumber,
        });

        expiredCount++;
      }

      console.log(`[ReservationService] Expired ${expiredCount} unclaimed reservations`);
      return { success: true, expiredCount };
    } catch (error: any) {
      console.error('[ReservationService] expireUnclaimed error:', error);
      return { success: false, expiredCount: 0, error: error.message };
    }
  }

  /**
   * Mark reservation as no-show
   */
  async markNoShow(
    reservationId: string,
    markedBy: string
  ): Promise<ReservationResult> {
    try {
      const reservation = await db.query.reservations.findFirst({
        where: eq(reservations.id, reservationId)
      });

      if (!reservation) {
        return { success: false, error: 'Reservation not found' };
      }

      const [updatedReservation] = await db.update(reservations)
        .set({
          status: ReservationStatus.NO_SHOW,
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, reservationId))
        .returning();

      // Release vehicle
      if (reservation.vehicleId) {
        await db.update(vehicles)
          .set({
            status: VehicleStatus.AVAILABLE,
            updatedAt: new Date(),
          })
          .where(eq(vehicles.id, reservation.vehicleId));
      }

      await createAuditLog(
        'reservations',
        reservationId,
        'RESERVATION_NO_SHOW',
        markedBy,
        {}
      );

      return { success: true, reservation: updatedReservation };
    } catch (error: any) {
      console.error('[ReservationService] markNoShow error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get reservations for a branch/period
   */
  async getReservations(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: ReservationStatusType
  ): Promise<Reservation[]> {
    try {
      const conditions = [];

      if (branchId) {
        conditions.push(eq(reservations.branchId, branchId));
      }

      if (startDate) {
        conditions.push(gte(reservations.startDatetime, startDate));
      }

      if (endDate) {
        conditions.push(lte(reservations.startDatetime, endDate));
      }

      if (status) {
        conditions.push(eq(reservations.status, status));
      }

      return await db.query.reservations.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: (r, { desc }) => [desc(r.startDatetime)]
      });
    } catch (error) {
      console.error('[ReservationService] getReservations error:', error);
      return [];
    }
  }

  /**
   * Check vehicle availability for a period
   */
  private async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: string
  ): Promise<boolean> {
    try {
      // Check for overlapping reservations
      const conditions = [
        eq(reservations.vehicleId, vehicleId),
        inArray(reservations.status, [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        sql`(${reservations.startDatetime} < ${endDate.toISOString()}::timestamp 
            AND ${reservations.endDatetime} > ${startDate.toISOString()}::timestamp)`,
      ];

      if (excludeReservationId) {
        // Need to exclude by ID separately since we can't use ne directly
      }

      const overlapping = await db.query.reservations.findFirst({
        where: and(...conditions)
      });

      if (overlapping && (!excludeReservationId || overlapping.id !== excludeReservationId)) {
        return false;
      }

      // Check for overlapping contracts
      const { contracts: contractsTable } = await import('@shared/schema');
      const overlappingContract = await db.query.contracts.findFirst({
        where: and(
          eq(contractsTable.vehicleId, vehicleId),
          inArray(contractsTable.status, ['draft', 'active']),
          sql`(${contractsTable.startDatetime}::timestamp < ${endDate.toISOString()}::timestamp 
              AND ${contractsTable.endDatetime}::timestamp > ${startDate.toISOString()}::timestamp)`,
        )
      });

      return !overlappingContract;
    } catch (error) {
      console.error('[ReservationService] checkVehicleAvailability error:', error);
      return false;
    }
  }

  /**
   * Find an available vehicle in a group
   */
  private async findAvailableVehicleInGroup(
    groupId: string,
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ id: string } | null> {
    try {
      // Get all vehicles in the group that are at the branch
      const groupVehicles = await db.query.vehicles.findMany({
        where: and(
          eq(vehicles.vehicleGroupId, groupId),
          eq(vehicles.branchId, branchId),
          eq(vehicles.status, VehicleStatus.AVAILABLE)
        )
      });

      // Find the first vehicle that is available for the period
      for (const vehicle of groupVehicles) {
        const isAvailable = await this.checkVehicleAvailability(
          vehicle.id,
          startDate,
          endDate
        );
        if (isAvailable) {
          return { id: vehicle.id };
        }
      }

      return null;
    } catch (error) {
      console.error('[ReservationService] findAvailableVehicleInGroup error:', error);
      return null;
    }
  }

  /**
   * Generate sequential reservation number
   */
  private async generateReservationNumber(): Promise<number> {
    try {
      // Get max reservation number
      const result = await db.execute(sql`
        SELECT COALESCE(MAX(reservation_number), 0) + 1 as next_number 
        FROM reservations
      `);
      return (result.rows[0] as any)?.next_number || 1;
    } catch (error) {
      console.error('[ReservationService] generateReservationNumber error:', error);
      return Date.now(); // Fallback to timestamp
    }
  }
}

export const reservationService = new ReservationService();
