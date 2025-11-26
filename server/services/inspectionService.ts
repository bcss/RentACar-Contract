import { db } from '../db';
import { vehicleInspections, vehicleInspectionPhotos, contracts, vehicles, incidents } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface InspectionDTO {
  odometerReading: number;
  fuelLevel: number;
  conditionNotes?: string;
  photos: Array<{
    angle: 'front' | 'back' | 'left' | 'right' | 'top' | 'dashboard' | 'extra';
    data: string;
    description?: string;
  }>;
  inspectorName: string;
  createdBy: string;
  newDamagesFound?: boolean;
  damageSeverity?: 'minor' | 'moderate' | 'major' | 'total_loss';
}

export interface InspectionResult {
  success: boolean;
  inspectionId?: string;
  error?: string;
}

export interface DamageComparisonResult {
  noDamage: boolean;
  newDamages: Array<{
    description: string;
    severity: string;
    photoEvidence?: string[];
  }>;
}

export interface InspectionSummary {
  contractId: string;
  checkoutInspection?: {
    id: string;
    odometerReading: number;
    fuelLevel: number;
    conditionNotes?: string;
    createdAt: Date;
  };
  returnInspection?: {
    id: string;
    odometerReading: number;
    fuelLevel: number;
    conditionNotes?: string;
    newDamagesFound: boolean;
    damageSeverity?: string;
    createdAt: Date;
  };
  odometerDifference?: number;
  fuelDifference?: number;
}

class InspectionService {
  async createCheckoutInspection(
    contractId: string,
    inspection: InspectionDTO
  ): Promise<InspectionResult> {
    try {
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (contract.status !== 'draft') {
        return { success: false, error: 'Checkout inspection can only be created for DRAFT contracts' };
      }

      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, contract.vehicleId))
        .limit(1);

      if (vehicle && vehicle.currentOdometerReading) {
        if (inspection.odometerReading < vehicle.currentOdometerReading) {
          return { 
            success: false, 
            error: `Odometer reading cannot be less than vehicle's last recorded reading (${vehicle.currentOdometerReading} km)` 
          };
        }
      }

      if (inspection.odometerReading < 0) {
        return { success: false, error: 'Odometer reading must be non-negative' };
      }

      const existingCheckout = await db
        .select()
        .from(vehicleInspections)
        .where(
          and(
            eq(vehicleInspections.contractId, contractId),
            eq(vehicleInspections.inspectionType, 'checkout')
          )
        )
        .limit(1);

      if (existingCheckout.length > 0) {
        return { success: false, error: 'Checkout inspection already exists for this contract' };
      }

      const requiredAngles = ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const providedAngles = inspection.photos.map(p => p.angle);
      const missingAngles = requiredAngles.filter(a => !providedAngles.includes(a as any));
      
      if (missingAngles.length > 0) {
        return { 
          success: false, 
          error: `Missing required photo angles: ${missingAngles.join(', ')}` 
        };
      }

      const [newInspection] = await db
        .insert(vehicleInspections)
        .values({
          contractId,
          vehicleId: contract.vehicleId,
          inspectionType: 'checkout',
          inspectorName: inspection.inspectorName,
          odometerReading: inspection.odometerReading,
          fuelLevel: inspection.fuelLevel,
          conditionNotes: inspection.conditionNotes || null,
          photos: inspection.photos,
          newDamagesFound: false,
          createdBy: inspection.createdBy,
        })
        .returning();

      await db
        .update(contracts)
        .set({
          lastCheckoutInspectionId: newInspection.id,
          vehicleCheckoutAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contractId));

      console.log(`[InspectionService] Checkout inspection created for contract ${contractId}`);
      
      return { success: true, inspectionId: newInspection.id };
    } catch (error) {
      console.error('[InspectionService] Error creating checkout inspection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout inspection',
      };
    }
  }

  async createReturnInspection(
    contractId: string,
    inspection: InspectionDTO
  ): Promise<InspectionResult> {
    try {
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (!['active', 'completed'].includes(contract.status)) {
        return { success: false, error: 'Return inspection can only be created for ACTIVE or COMPLETED contracts' };
      }

      const checkoutInspection = await db
        .select()
        .from(vehicleInspections)
        .where(
          and(
            eq(vehicleInspections.contractId, contractId),
            eq(vehicleInspections.inspectionType, 'checkout')
          )
        )
        .limit(1);

      if (checkoutInspection.length === 0) {
        return { success: false, error: 'Checkout inspection must exist before return inspection' };
      }

      const requiredAngles = ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const providedAngles = inspection.photos.map(p => p.angle);
      const missingAngles = requiredAngles.filter(a => !providedAngles.includes(a as any));
      
      if (missingAngles.length > 0) {
        return { 
          success: false, 
          error: `Missing required photo angles: ${missingAngles.join(', ')}` 
        };
      }

      if (inspection.odometerReading < checkoutInspection[0].odometerReading) {
        return { 
          success: false, 
          error: 'Return odometer reading cannot be less than checkout reading' 
        };
      }

      const [newInspection] = await db
        .insert(vehicleInspections)
        .values({
          contractId,
          vehicleId: contract.vehicleId,
          inspectionType: 'return',
          inspectorName: inspection.inspectorName,
          odometerReading: inspection.odometerReading,
          fuelLevel: inspection.fuelLevel,
          conditionNotes: inspection.conditionNotes || null,
          photos: inspection.photos,
          newDamagesFound: inspection.newDamagesFound || false,
          damageSeverity: inspection.damageSeverity || null,
          createdBy: inspection.createdBy,
        })
        .returning();

      await db
        .update(contracts)
        .set({
          lastReturnInspectionId: newInspection.id,
          vehicleReturnedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contractId));

      await db
        .update(vehicles)
        .set({
          currentOdometerReading: inspection.odometerReading,
          lastInspectionDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, contract.vehicleId));

      console.log(`[InspectionService] Return inspection created for contract ${contractId}`);
      
      return { success: true, inspectionId: newInspection.id };
    } catch (error) {
      console.error('[InspectionService] Error creating return inspection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create return inspection',
      };
    }
  }

  async createTransferInspection(
    transferId: string,
    vehicleId: string,
    inspectionType: 'transfer_out' | 'transfer_in',
    inspection: InspectionDTO
  ): Promise<InspectionResult> {
    try {
      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);

      if (!vehicle) {
        return { success: false, error: 'Vehicle not found' };
      }

      const requiredAngles = ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const providedAngles = inspection.photos.map(p => p.angle);
      const missingAngles = requiredAngles.filter(a => !providedAngles.includes(a as any));
      
      if (missingAngles.length > 0) {
        return { 
          success: false, 
          error: `Missing required photo angles: ${missingAngles.join(', ')}` 
        };
      }

      const [newInspection] = await db
        .insert(vehicleInspections)
        .values({
          contractId: transferId,
          vehicleId,
          inspectionType,
          inspectorName: inspection.inspectorName,
          odometerReading: inspection.odometerReading,
          fuelLevel: inspection.fuelLevel,
          conditionNotes: inspection.conditionNotes || null,
          photos: inspection.photos,
          newDamagesFound: inspection.newDamagesFound || false,
          damageSeverity: inspection.damageSeverity || null,
          createdBy: inspection.createdBy,
        })
        .returning();

      await db
        .update(vehicles)
        .set({
          currentOdometerReading: inspection.odometerReading,
          lastInspectionDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, vehicleId));

      console.log(`[InspectionService] ${inspectionType} inspection created for vehicle ${vehicleId}`);
      
      return { success: true, inspectionId: newInspection.id };
    } catch (error) {
      console.error('[InspectionService] Error creating transfer inspection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transfer inspection',
      };
    }
  }

  async getInspectionSummary(contractId: string): Promise<InspectionSummary | null> {
    try {
      const inspections = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.contractId, contractId))
        .orderBy(vehicleInspections.createdAt);

      if (inspections.length === 0) {
        return null;
      }

      const checkoutInspection = inspections.find(i => i.inspectionType === 'checkout');
      const returnInspection = inspections.find(i => i.inspectionType === 'return');

      const summary: InspectionSummary = {
        contractId,
      };

      if (checkoutInspection) {
        summary.checkoutInspection = {
          id: checkoutInspection.id,
          odometerReading: checkoutInspection.odometerReading,
          fuelLevel: checkoutInspection.fuelLevel,
          conditionNotes: checkoutInspection.conditionNotes || undefined,
          createdAt: new Date(checkoutInspection.createdAt!),
        };
      }

      if (returnInspection) {
        summary.returnInspection = {
          id: returnInspection.id,
          odometerReading: returnInspection.odometerReading,
          fuelLevel: returnInspection.fuelLevel,
          conditionNotes: returnInspection.conditionNotes || undefined,
          newDamagesFound: returnInspection.newDamagesFound,
          damageSeverity: returnInspection.damageSeverity || undefined,
          createdAt: new Date(returnInspection.createdAt!),
        };
      }

      if (checkoutInspection && returnInspection) {
        summary.odometerDifference = returnInspection.odometerReading - checkoutInspection.odometerReading;
        summary.fuelDifference = returnInspection.fuelLevel - checkoutInspection.fuelLevel;
      }

      return summary;
    } catch (error) {
      console.error('[InspectionService] Error getting inspection summary:', error);
      return null;
    }
  }

  async getInspectionsByContract(contractId: string): Promise<any[]> {
    try {
      return await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.contractId, contractId))
        .orderBy(desc(vehicleInspections.createdAt));
    } catch (error) {
      console.error('[InspectionService] Error getting inspections:', error);
      return [];
    }
  }

  async getInspectionById(inspectionId: string): Promise<any | null> {
    try {
      const [inspection] = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.id, inspectionId))
        .limit(1);

      return inspection || null;
    } catch (error) {
      console.error('[InspectionService] Error getting inspection:', error);
      return null;
    }
  }

  async hasCheckoutInspection(contractId: string): Promise<boolean> {
    try {
      const [inspection] = await db
        .select({ id: vehicleInspections.id })
        .from(vehicleInspections)
        .where(
          and(
            eq(vehicleInspections.contractId, contractId),
            eq(vehicleInspections.inspectionType, 'checkout')
          )
        )
        .limit(1);

      return !!inspection;
    } catch (error) {
      console.error('[InspectionService] Error checking checkout inspection:', error);
      return false;
    }
  }

  async hasReturnInspection(contractId: string): Promise<boolean> {
    try {
      const [inspection] = await db
        .select({ id: vehicleInspections.id })
        .from(vehicleInspections)
        .where(
          and(
            eq(vehicleInspections.contractId, contractId),
            eq(vehicleInspections.inspectionType, 'return')
          )
        )
        .limit(1);

      return !!inspection;
    } catch (error) {
      console.error('[InspectionService] Error checking return inspection:', error);
      return false;
    }
  }
}

export const inspectionService = new InspectionService();
