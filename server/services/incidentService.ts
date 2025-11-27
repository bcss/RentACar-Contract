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
import { incidents, contracts, vehicles, vehicleInspections, auditLogs, sequences } from "@shared/schema";
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
   * Generate incident number using sequences table (ATOMIC + YEAR-SCOPED)
   * Per Master Spec §5.5.2 - Uses sequences for reliable ID generation
   * Uses INSERT ON CONFLICT (sequence_type, scope_type, scope_id) for:
   * - Thread-safe atomic increment
   * - Annual reset (new row per year resets counter to 1)
   */
  private async generateIncidentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const scopeId = year.toString();
    
    // ATOMIC UPSERT with year-scoped conflict key per Master Spec §5.5.2
    // Creates new row per year (resetting to 1) or increments existing
    const result = await db.execute(sql`
      INSERT INTO sequences (sequence_type, scope_type, scope_id, prefix, current_value, padding_length, include_year, is_active, created_at, updated_at)
      VALUES ('incident', 'YEAR', ${scopeId}, 'INC', 1, 6, true, true, NOW(), NOW())
      ON CONFLICT (sequence_type, scope_type, scope_id) 
      DO UPDATE SET 
        current_value = sequences.current_value + 1,
        updated_at = NOW()
      RETURNING current_value, prefix, padding_length
    `);
    
    const row = result.rows[0] as any;
    const nextValue = row.current_value;
    const prefix = row.prefix || 'INC';
    const padding = row.padding_length || 6;
    
    // Format: INC-YYYY-NNNNNN (year-scoped, resets annually)
    return `${prefix}-${year}-${nextValue.toString().padStart(padding, '0')}`;
  }

  /**
   * Per Master Spec §7.4.2 - Create incident from return inspection damage detection
   * Auto-opens incident when damage is detected during return inspection
   */
  async createIncidentFromInspection(command: CreateIncidentFromInspectionCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      // Create incident - aligned with incidents table schema
      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId: command.contractId,
        incidentType: 'damage', // Maps to schema's 'accident, theft, damage, breakdown'
        severity: 'minor', // Default severity
        status: 'reported', // Maps to schema's 'reported, under_investigation, claim_filed, resolved, closed'
        incidentDate: new Date(),
        description: `${command.damageType}: ${command.damageDescription}${command.damageDescriptionAr ? ` | ${command.damageDescriptionAr}` : ''}`,
        estimatedCost: command.estimatedCost?.toString(),
        photoUrls: command.damagePhotos,
        notes: `Inspection ID: ${command.inspectionId}, Damage type: ${command.damageType}`,
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
        incidentNumber, // Returned for tracking but stored in notes
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

      // contractId is required per schema - use current or fail if no contract
      const contractId = vehicle?.currentContractId;
      if (!contractId) {
        return {
          success: false,
          message: 'Cannot create abandoned incident: Vehicle has no active contract'
        };
      }

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId,
        incidentType: 'breakdown', // Use 'breakdown' as closest match for ABANDONED
        severity: 'major',
        status: 'reported',
        incidentDate: command.abandonedDate,
        description: command.notes ?? 'Abandoned vehicle incident',
        location: command.lastKnownLocation,
        notes: `Incident #: ${incidentNumber}, Last known location: ${command.lastKnownLocation || 'Unknown'}, Lat/Lng: ${command.lastKnownLatitude || 'N/A'}/${command.lastKnownLongitude || 'N/A'}`,
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

      // contractId is required per schema
      if (!command.contractId) {
        return {
          success: false,
          message: 'Cannot create theft incident: Contract ID is required'
        };
      }

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId: command.contractId,
        incidentType: 'theft',
        severity: 'total_loss',
        status: 'reported',
        incidentDate: command.theftDate,
        description: command.notes ?? 'Vehicle theft incident',
        location: command.theftLocation,
        policeReportNumber: command.policeReportNumber,
        notes: `Incident #: ${incidentNumber}`,
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
   * Note: Transfer incidents require a dummy/system contract or must be linked to an existing contract
   */
  async createTransferIncident(command: CreateTransferIncidentCommand): Promise<IncidentResult> {
    try {
      // Generate incident number using sequences table (thread-safe)
      const incidentNumber = await this.generateIncidentNumber();

      // Get vehicle's current contract - required per schema
      const vehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, command.vehicleId)
      });

      const contractId = vehicle?.currentContractId;
      if (!contractId) {
        return {
          success: false,
          message: 'Cannot create transfer incident: Vehicle has no active contract'
        };
      }

      const [newIncident] = await db.insert(incidents).values({
        vehicleId: command.vehicleId,
        contractId,
        incidentType: 'damage', // Transfer damage
        severity: 'minor',
        status: 'reported',
        incidentDate: new Date(),
        description: command.damageDescription,
        estimatedCost: command.estimatedCost?.toString(),
        photoUrls: command.damagePhotos,
        notes: `Incident #: ${incidentNumber}, Transfer from branch ${command.fromBranchId} to ${command.toBranchId}`,
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

      // Map status to schema values: 'reported', 'under_investigation', 'claim_filed', 'resolved', 'closed'
      const statusMap: Record<string, string> = {
        'OPEN': 'reported',
        'UNDER_INVESTIGATION': 'under_investigation',
        'RESOLVED': 'resolved',
        'CLOSED': 'closed',
        'ESCALATED': 'under_investigation', // Map escalated to under_investigation
      };

      // Update incident - use schema-compliant fields
      await db.update(incidents)
        .set({
          status: statusMap[command.status] || command.status.toLowerCase(),
          notes: command.resolutionNotes ? `Resolution: ${command.resolutionNotes}` : undefined,
          actualCost: command.resolutionCost?.toString(),
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
      const returnInspection = await db.query.vehicleInspections.findFirst({
        where: eq(vehicleInspections.id, inspectionId)
      });

      if (!returnInspection) {
        throw new Error(`Return inspection not found: ${inspectionId}`);
      }

      // Get checkout inspection for comparison
      const checkoutInspection = await db.query.vehicleInspections.findFirst({
        where: eq(vehicleInspections.id, checkoutInspectionId)
      });

      if (!checkoutInspection) {
        throw new Error(`Checkout inspection not found: ${checkoutInspectionId}`);
      }

      // Check if new damages were found during return
      if (!returnInspection.newDamagesFound) {
        return null;
      }

      // Create incident for detected damage
      const damageDescription = returnInspection.conditionNotes 
        ? `Damage detected during return inspection: ${returnInspection.conditionNotes}`
        : 'New damage detected during return inspection';

      const result = await this.createIncidentFromInspection({
        contractId: returnInspection.contractId,
        vehicleId: returnInspection.vehicleId,
        inspectionId,
        damageType: 'OTHER',
        damageDescription,
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
        action: params.action,
        userId: params.userId,
        details: JSON.stringify({
          entityType: params.entityType,
          entityId: params.entityId,
          oldValues: params.oldValues,
          newValues: params.newValues,
        }),
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}

export const incidentService = new IncidentService();
