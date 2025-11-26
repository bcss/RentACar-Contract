/**
 * IncidentService - Per Master Spec §7.4
 * Handles incident automation workflow including:
 * - createIncidentFromInspection(CreateIncidentFromInspectionCommand)
 * - createAbandonedVehicleIncident(CreateAbandonedIncidentCommand)
 * - createTheftIncident(CreateTheftIncidentCommand)
 * - createTransferIncident(CreateTransferIncidentCommand)
 * - updateIncidentStatus(IncidentId, UpdateIncidentStatusCommand)
 * 
 * Key rules per spec:
 * - If incident tied to a contract: contracts.has_pending_incident = 1
 * - Contract cannot reach CLOSED until all incidents resolved
 * - Damage detected during return inspection auto-opens incident
 */

import { db } from "../db";
import { incidents, contracts, vehicles, inspections, auditLogs, sequences } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Types per spec
export interface CreateIncidentFromInspectionCommand {
  contractId: string;
  vehicleId: string;
  inspectionId: string;
  damageType: 'SCRATCHES' | 'DENTS' | 'WINDSHIELD' | 'TYRE' | 'MECHANICAL' | 'INTERIOR' | 'OTHER';
  damageDescription: string;
  damageDescriptionAr?: string;
  damagePhotos?: string[];
  estimatedCost?: number;
  createdBy: string;
}

export interface CreateAbandonedIncidentCommand {
  vehicleId: string;
  lastKnownLocation?: string;
  lastKnownLatitude?: number;
  lastKnownLongitude?: number;
  abandonedDate: Date;
  notes?: string;
  createdBy: string;
}

export interface CreateTheftIncidentCommand {
  vehicleId: string;
  contractId?: string;
  theftDate: Date;
  theftLocation?: string;
  policeReportNumber?: string;
  notes?: string;
  createdBy: string;
}

export interface CreateTransferIncidentCommand {
  vehicleId: string;
  fromBranchId: string;
  toBranchId: string;
  damageDescription: string;
  damagePhotos?: string[];
  estimatedCost?: number;
  createdBy: string;
}

export interface UpdateIncidentStatusCommand {
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  resolutionNotes?: string;
  resolutionCost?: number;
  updatedBy: string;
}

export interface IncidentResult {
  success: boolean;
  incidentId?: string;
  incidentNumber?: string;
  message: string;
}

class IncidentService {
  /**
   * Generate incident number using sequences table (ATOMIC - thread-safe)
   * Per Master Spec §5.5.2 - Uses sequences for reliable ID generation
   * Uses INSERT ON CONFLICT DO UPDATE (UPSERT) for guaranteed uniqueness
   */
  private async generateIncidentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INC-${year}-`;
    const scopeId = year.toString();
    
    // ATOMIC UPSERT: Guarantees unique sequential numbers even under concurrency
    // Uses (entity_type, scope_type, scope_id) as conflict key
    const result = await db.execute(sql`
      INSERT INTO sequences (entity_type, scope_type, scope_id, prefix, current_value, padding_length, include_year, is_active, created_at, updated_at)
      VALUES ('incident', 'YEAR', ${scopeId}, 'INC', 1, 6, true, true, NOW(), NOW())
      ON CONFLICT (entity_type) 
      DO UPDATE SET 
        current_value = sequences.current_value + 1,
        updated_at = NOW()
      RETURNING current_value
    `);
    
    const nextValue = (result.rows[0] as any).current_value;
    return `${prefix}${nextValue.toString().padStart(6, '0')}`;
  }

  /**
   * Per Master Spec §7.4.2 - Create incident from return inspection damage detection
   * Auto-opens incident when damage is detected during return inspection
   */
  async createIncidentFromInspection(command: CreateIncidentFromInspectionCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      // Create incident
      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId: command.contractId,
        inspectionId: command.inspectionId,
        incidentNumber,
        incidentType: 'DAMAGE',
        status: 'OPEN',
        dateReported: new Date(),
        description: command.damageDescription,
        descriptionAr: command.damageDescriptionAr,
        damageType: command.damageType,
        estimatedCost: command.estimatedCost?.toString(),
        photos: command.damagePhotos,
        createdBy: command.createdBy,
      }).returning();

      // Update contract to flag pending incident
      if (command.contractId) {
        await db.update(contracts)
          .set({
            hasPendingIncident: true,
            updatedAt: new Date(),
          })
          .where(eq(contracts.id, command.contractId));
      }

      // Log audit
      await this.logAudit({
        entityType: 'INCIDENT',
        entityId: newIncident.id,
        action: 'CREATE',
        userId: command.createdBy,
        newValues: { incidentNumber, status: 'OPEN', type: 'DAMAGE' },
      });

      return {
        success: true,
        incidentId: newIncident.id,
        incidentNumber,
        message: `Damage incident ${incidentNumber} created from inspection`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to create incident: ${message}`
      };
    }
  }

  /**
   * Per Master Spec §7.4.2 - Create abandoned vehicle incident
   */
  async createAbandonedVehicleIncident(command: CreateAbandonedIncidentCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      // Get vehicle's current contract if any
      const vehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, command.vehicleId)
      });

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId: vehicle?.currentContractId,
        incidentNumber,
        incidentType: 'ABANDONED',
        status: 'OPEN',
        dateReported: new Date(),
        incidentDate: command.abandonedDate,
        description: command.notes ?? 'Abandoned vehicle incident',
        location: command.lastKnownLocation,
        latitude: command.lastKnownLatitude?.toString(),
        longitude: command.lastKnownLongitude?.toString(),
        createdBy: command.createdBy,
      }).returning();

      // Update vehicle status to IMPOUND_PENDING
      await db.update(vehicles)
        .set({
          status: 'IMPOUND_PENDING',
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, command.vehicleId));

      // Update contract if exists
      if (vehicle?.currentContractId) {
        await db.update(contracts)
          .set({
            hasPendingIncident: true,
            updatedAt: new Date(),
          })
          .where(eq(contracts.id, vehicle.currentContractId));
      }

      await this.logAudit({
        entityType: 'INCIDENT',
        entityId: newIncident.id,
        action: 'CREATE',
        userId: command.createdBy,
        newValues: { incidentNumber, status: 'OPEN', type: 'ABANDONED' },
      });

      return {
        success: true,
        incidentId: newIncident.id,
        incidentNumber,
        message: `Abandoned vehicle incident ${incidentNumber} created`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to create abandoned incident: ${message}`
      };
    }
  }

  /**
   * Per Master Spec §7.4.2 - Create theft incident
   */
  async createTheftIncident(command: CreateTheftIncidentCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId: command.contractId,
        incidentNumber,
        incidentType: 'THEFT',
        status: 'OPEN',
        dateReported: new Date(),
        incidentDate: command.theftDate,
        description: command.notes ?? 'Vehicle theft incident',
        location: command.theftLocation,
        policeReportNumber: command.policeReportNumber,
        createdBy: command.createdBy,
      }).returning();

      // Update vehicle status to STOLEN
      await db.update(vehicles)
        .set({
          status: 'STOLEN',
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, command.vehicleId));

      // Update contract if exists
      if (command.contractId) {
        await db.update(contracts)
          .set({
            hasPendingIncident: true,
            updatedAt: new Date(),
          })
          .where(eq(contracts.id, command.contractId));
      }

      await this.logAudit({
        entityType: 'INCIDENT',
        entityId: newIncident.id,
        action: 'CREATE',
        userId: command.createdBy,
        newValues: { incidentNumber, status: 'OPEN', type: 'THEFT' },
      });

      return {
        success: true,
        incidentId: newIncident.id,
        incidentNumber,
        message: `Theft incident ${incidentNumber} created - Police report: ${command.policeReportNumber || 'Not filed'}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to create theft incident: ${message}`
      };
    }
  }

  /**
   * Per Master Spec §7.4.2 - Create transfer damage incident
   */
  async createTransferIncident(command: CreateTransferIncidentCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        incidentNumber,
        incidentType: 'TRANSFER_DAMAGE',
        status: 'OPEN',
        dateReported: new Date(),
        description: command.damageDescription,
        estimatedCost: command.estimatedCost?.toString(),
        photos: command.damagePhotos,
        fromBranchId: command.fromBranchId,
        toBranchId: command.toBranchId,
        createdBy: command.createdBy,
      }).returning();

      await this.logAudit({
        entityType: 'INCIDENT',
        entityId: newIncident.id,
        action: 'CREATE',
        userId: command.createdBy,
        newValues: { incidentNumber, status: 'OPEN', type: 'TRANSFER_DAMAGE' },
      });

      return {
        success: true,
        incidentId: newIncident.id,
        incidentNumber,
        message: `Transfer damage incident ${incidentNumber} created`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to create transfer incident: ${message}`
      };
    }
  }

  /**
   * Per Master Spec §7.4.2 - Update incident status
   */
  async updateIncidentStatus(incidentId: string, command: UpdateIncidentStatusCommand): Promise<IncidentResult> {
    try {
      // Get current incident
      const currentIncident = await db.query.incidents.findFirst({
        where: eq(incidents.id, incidentId)
      });

      if (!currentIncident) {
        return {
          success: false,
          message: `Incident not found: ${incidentId}`
        };
      }

      const oldStatus = currentIncident.status;

      // Update incident
      await db.update(incidents)
        .set({
          status: command.status,
          resolutionNotes: command.resolutionNotes,
          resolvedCost: command.resolutionCost?.toString(),
          resolvedAt: command.status === 'RESOLVED' || command.status === 'CLOSED' ? new Date() : undefined,
          resolvedBy: command.status === 'RESOLVED' || command.status === 'CLOSED' ? command.updatedBy : undefined,
          updatedAt: new Date(),
        })
        .where(eq(incidents.id, incidentId));

      // If incident is resolved/closed, update contract flag
      if ((command.status === 'RESOLVED' || command.status === 'CLOSED') && currentIncident.contractId) {
        // Check if there are other pending incidents for this contract
        const otherIncidents = await db.query.incidents.findMany({
          where: and(
            eq(incidents.contractId, currentIncident.contractId),
            sql`${incidents.id} != ${incidentId}`,
            sql`${incidents.status} NOT IN ('RESOLVED', 'CLOSED')`
          )
        });

        // If no other pending incidents, clear the flag
        if (otherIncidents.length === 0) {
          await db.update(contracts)
            .set({
              hasPendingIncident: false,
              updatedAt: new Date(),
            })
            .where(eq(contracts.id, currentIncident.contractId));
        }
      }

      await this.logAudit({
        entityType: 'INCIDENT',
        entityId: incidentId,
        action: 'UPDATE_STATUS',
        userId: command.updatedBy,
        oldValues: { status: oldStatus },
        newValues: { status: command.status, resolutionNotes: command.resolutionNotes },
      });

      return {
        success: true,
        incidentId,
        incidentNumber: currentIncident.incidentNumber,
        message: `Incident status updated from ${oldStatus} to ${command.status}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to update incident: ${message}`
      };
    }
  }

  /**
   * Detect and create incident from return inspection
   * Per Master Spec §15.2.3 - damage detection auto-check
   */
  async detectDamageFromInspection(
    inspectionId: string,
    checkoutInspectionId: string,
    createdBy: string
  ): Promise<IncidentResult | null> {
    try {
      // Get return inspection
      const returnInspection = await db.query.inspections.findFirst({
        where: eq(inspections.id, inspectionId)
      });

      if (!returnInspection) {
        throw new Error(`Return inspection not found: ${inspectionId}`);
      }

      // Get checkout inspection for comparison
      const checkoutInspection = await db.query.inspections.findFirst({
        where: eq(inspections.id, checkoutInspectionId)
      });

      if (!checkoutInspection) {
        throw new Error(`Checkout inspection not found: ${checkoutInspectionId}`);
      }

      // Compare damage arrays to detect new damage
      const checkoutDamage = new Set((checkoutInspection.damageAreas as string[]) || []);
      const returnDamage = (returnInspection.damageAreas as string[]) || [];
      
      const newDamage = returnDamage.filter(d => !checkoutDamage.has(d));

      // If no new damage detected, return null
      if (newDamage.length === 0 && !returnInspection.remarksEnd) {
        return null;
      }

      // Check for damage notes in remarks
      const hasDamageRemarks = returnInspection.remarksEnd?.toLowerCase().includes('damage') ||
                               returnInspection.remarksEnd?.toLowerCase().includes('scratch') ||
                               returnInspection.remarksEnd?.toLowerCase().includes('dent');

      if (newDamage.length === 0 && !hasDamageRemarks) {
        return null;
      }

      // Create incident for detected damage
      const damageDescription = newDamage.length > 0 
        ? `New damage detected during return inspection: ${newDamage.join(', ')}`
        : `Damage noted in inspection remarks: ${returnInspection.remarksEnd}`;

      const result = await this.createIncidentFromInspection({
        contractId: returnInspection.contractId!,
        vehicleId: returnInspection.vehicleId!,
        inspectionId,
        damageType: 'OTHER',
        damageDescription,
        damagePhotos: returnInspection.photosEnd as string[],
        createdBy,
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Damage detection failed: ${message}`
      };
    }
  }

  /**
   * Check if contract has pending incidents (blocks closure)
   */
  async hasPendingIncidents(contractId: string): Promise<boolean> {
    const pendingIncidents = await db.query.incidents.findMany({
      where: and(
        eq(incidents.contractId, contractId),
        sql`${incidents.status} NOT IN ('RESOLVED', 'CLOSED')`
      )
    });

    return pendingIncidents.length > 0;
  }

  /**
   * Get all incidents for a contract
   */
  async getContractIncidents(contractId: string) {
    return db.query.incidents.findMany({
      where: eq(incidents.contractId, contractId),
      orderBy: (incidents, { desc }) => [desc(incidents.createdAt)]
    });
  }

  /**
   * Log audit trail for incident actions
   */
  private async logAudit(params: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }) {
    try {
      await db.insert(auditLogs).values({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        oldValues: params.oldValues,
        newValues: params.newValues,
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}

export const incidentService = new IncidentService();
