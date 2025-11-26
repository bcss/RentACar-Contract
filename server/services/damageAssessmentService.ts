import { db } from '../db';
import { vehicleInspections, incidents, vehicles, contracts, payments } from '@shared/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';

export interface DamageItem {
  category: 'body' | 'interior' | 'mechanical' | 'glass' | 'other';
  location: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'total_loss';
  estimatedCost: number;
  photoReference?: string;
}

export interface DamageAssessmentInput {
  contractId: string;
  returnInspectionId: string;
  damages: DamageItem[];
  assessorId: string;
  assessorNotes?: string;
}

export interface DamageAssessmentResult {
  success: boolean;
  totalAssessedCost: number;
  recommendedAction: 'no_action' | 'charge_customer' | 'insurance_claim' | 'dispute';
  chargeBreakdown: {
    laborCost: number;
    partsCost: number;
    adminFee: number;
    total: number;
  };
  incidentId?: string;
  error?: string;
}

export interface PhotoComparisonResult {
  angle: string;
  hasDifference: boolean;
  description?: string;
  checkoutPhoto?: string;
  returnPhoto?: string;
}

class DamageAssessmentService {
  private readonly ADMIN_FEE_PERCENTAGE = 0.15;
  private readonly LABOR_RATE_PER_HOUR = 150;
  private readonly INSURANCE_THRESHOLD = 2000;
  private readonly MINOR_DAMAGE_MAX = 500;
  private readonly MODERATE_DAMAGE_MAX = 2000;

  async evaluateDamage(input: DamageAssessmentInput): Promise<DamageAssessmentResult> {
    try {
      const [returnInspection] = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.id, input.returnInspectionId))
        .limit(1);

      if (!returnInspection) {
        return { 
          success: false, 
          totalAssessedCost: 0,
          recommendedAction: 'no_action',
          chargeBreakdown: { laborCost: 0, partsCost: 0, adminFee: 0, total: 0 },
          error: 'Return inspection not found' 
        };
      }

      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, input.contractId))
        .limit(1);

      if (!contract) {
        return { 
          success: false, 
          totalAssessedCost: 0,
          recommendedAction: 'no_action',
          chargeBreakdown: { laborCost: 0, partsCost: 0, adminFee: 0, total: 0 },
          error: 'Contract not found' 
        };
      }

      if (input.damages.length === 0) {
        return {
          success: true,
          totalAssessedCost: 0,
          recommendedAction: 'no_action',
          chargeBreakdown: { laborCost: 0, partsCost: 0, adminFee: 0, total: 0 },
        };
      }

      const partsCost = input.damages.reduce((sum, d) => sum + d.estimatedCost, 0);
      const laborHours = this.estimateLaborHours(input.damages);
      const laborCost = laborHours * this.LABOR_RATE_PER_HOUR;
      const subtotal = partsCost + laborCost;
      const adminFee = subtotal * this.ADMIN_FEE_PERCENTAGE;
      const totalCost = subtotal + adminFee;

      let recommendedAction: 'no_action' | 'charge_customer' | 'insurance_claim' | 'dispute' = 'charge_customer';
      
      if (totalCost === 0) {
        recommendedAction = 'no_action';
      } else if (totalCost >= this.INSURANCE_THRESHOLD) {
        recommendedAction = 'insurance_claim';
      }

      const hasMajorDamage = input.damages.some(d => 
        d.severity === 'major' || d.severity === 'total_loss'
      );

      if (hasMajorDamage && totalCost >= this.INSURANCE_THRESHOLD) {
        recommendedAction = 'insurance_claim';
      }

      const [incident] = await db
        .insert(incidents)
        .values({
          contractId: input.contractId,
          vehicleId: contract.vehicleId,
          incidentType: 'damage',
          incidentDate: new Date().toISOString().split('T')[0],
          description: input.assessorNotes || `Damage assessment: ${input.damages.length} items found`,
          isCustomerResponsible: true,
          assessedLiability: String(totalCost),
          estimatedCost: String(totalCost),
          status: totalCost >= this.INSURANCE_THRESHOLD ? 'insurance_pending' : 'pending',
          reportedBy: input.assessorId,
        })
        .returning();

      await db
        .update(vehicleInspections)
        .set({
          newDamagesFound: true,
          damageSeverity: this.getOverallSeverity(input.damages),
        })
        .where(eq(vehicleInspections.id, input.returnInspectionId));

      console.log(`[DamageAssessmentService] Damage assessment completed for contract ${input.contractId}: ${totalCost} AED`);

      return {
        success: true,
        totalAssessedCost: totalCost,
        recommendedAction,
        chargeBreakdown: {
          laborCost,
          partsCost,
          adminFee,
          total: totalCost,
        },
        incidentId: incident.id,
      };
    } catch (error) {
      console.error('[DamageAssessmentService] Error evaluating damage:', error);
      return {
        success: false,
        totalAssessedCost: 0,
        recommendedAction: 'no_action',
        chargeBreakdown: { laborCost: 0, partsCost: 0, adminFee: 0, total: 0 },
        error: error instanceof Error ? error.message : 'Failed to evaluate damage',
      };
    }
  }

  private estimateLaborHours(damages: DamageItem[]): number {
    let totalHours = 0;
    
    for (const damage of damages) {
      switch (damage.severity) {
        case 'minor':
          totalHours += 0.5;
          break;
        case 'moderate':
          totalHours += 2;
          break;
        case 'major':
          totalHours += 8;
          break;
        case 'total_loss':
          totalHours += 24;
          break;
      }

      if (damage.category === 'mechanical') {
        totalHours *= 1.5;
      }
    }
    
    return totalHours;
  }

  private getOverallSeverity(damages: DamageItem[]): string {
    if (damages.some(d => d.severity === 'total_loss')) return 'total_loss';
    if (damages.some(d => d.severity === 'major')) return 'major';
    if (damages.some(d => d.severity === 'moderate')) return 'moderate';
    return 'minor';
  }

  async compareInspections(
    contractId: string
  ): Promise<{ differences: PhotoComparisonResult[]; summary: string } | null> {
    try {
      const inspections = await db
        .select()
        .from(vehicleInspections)
        .where(eq(vehicleInspections.contractId, contractId))
        .orderBy(vehicleInspections.createdAt);

      const checkout = inspections.find(i => i.inspectionType === 'checkout');
      const returnInsp = inspections.find(i => i.inspectionType === 'return');

      if (!checkout || !returnInsp) {
        return null;
      }

      const checkoutPhotos = checkout.photos as Array<{ angle: string; data: string; description?: string }>;
      const returnPhotos = returnInsp.photos as Array<{ angle: string; data: string; description?: string }>;

      const differences: PhotoComparisonResult[] = [];
      const angles = ['front', 'back', 'left', 'right', 'top', 'dashboard'];

      for (const angle of angles) {
        const checkoutPhoto = checkoutPhotos.find(p => p.angle === angle);
        const returnPhoto = returnPhotos.find(p => p.angle === angle);

        differences.push({
          angle,
          hasDifference: !!returnInsp.newDamagesFound,
          description: returnPhoto?.description,
          checkoutPhoto: checkoutPhoto?.data,
          returnPhoto: returnPhoto?.data,
        });
      }

      const odometerDiff = returnInsp.odometerReading - checkout.odometerReading;
      const fuelDiff = returnInsp.fuelLevel - checkout.fuelLevel;

      const summary = [
        `Odometer: ${checkout.odometerReading} → ${returnInsp.odometerReading} (${odometerDiff} km)`,
        `Fuel Level: ${checkout.fuelLevel}% → ${returnInsp.fuelLevel}% (${fuelDiff}%)`,
        returnInsp.newDamagesFound ? `New damages found: ${returnInsp.damageSeverity || 'unspecified'}` : 'No new damages',
      ].join('\n');

      return { differences, summary };
    } catch (error) {
      console.error('[DamageAssessmentService] Error comparing inspections:', error);
      return null;
    }
  }

  async createDamageCharge(
    contractId: string,
    incidentId: string,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      const [payment] = await db
        .insert(payments)
        .values({
          contractId,
          amount: String(amount),
          type: 'damage_charge',
          method: 'pending',
          status: 'pending',
          description: description || `Damage charge - Incident ${incidentId}`,
          createdBy,
        })
        .returning();

      await db
        .update(incidents)
        .set({
          status: 'charge_created',
          updatedAt: new Date(),
        })
        .where(eq(incidents.id, incidentId));

      console.log(`[DamageAssessmentService] Damage charge created: ${amount} AED for contract ${contractId}`);

      return { success: true, paymentId: payment.id };
    } catch (error) {
      console.error('[DamageAssessmentService] Error creating damage charge:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create damage charge' 
      };
    }
  }

  async initiateInsuranceClaim(
    contractId: string,
    incidentId: string,
    claimDetails: {
      insurerName: string;
      policyNumber: string;
      claimAmount: number;
      claimDescription: string;
    },
    createdBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const [incident] = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, incidentId))
        .limit(1);

      if (!incident) {
        return { success: false, error: 'Incident not found' };
      }

      await db
        .update(incidents)
        .set({
          status: 'insurance_claim_filed',
          insuranceClaimNumber: `CLM-${Date.now()}`,
          updatedAt: new Date(),
        })
        .where(eq(incidents.id, incidentId));

      console.log(`[DamageAssessmentService] Insurance claim initiated for incident ${incidentId}`);

      return { success: true };
    } catch (error) {
      console.error('[DamageAssessmentService] Error initiating insurance claim:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initiate insurance claim' 
      };
    }
  }

  async getDamageHistory(vehicleId: string): Promise<any[]> {
    try {
      return await db
        .select({
          incidentId: incidents.id,
          contractId: incidents.contractId,
          incidentDate: incidents.incidentDate,
          description: incidents.description,
          estimatedCost: incidents.estimatedCost,
          status: incidents.status,
        })
        .from(incidents)
        .where(
          and(
            eq(incidents.vehicleId, vehicleId),
            eq(incidents.incidentType, 'damage')
          )
        )
        .orderBy(desc(incidents.incidentDate));
    } catch (error) {
      console.error('[DamageAssessmentService] Error getting damage history:', error);
      return [];
    }
  }
}

export const damageAssessmentService = new DamageAssessmentService();
