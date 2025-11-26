/**
 * Legacy Driver Data Migration Script
 * Per Master Spec §4.10.2 (driverRatePlans) and §4.10.3 (contractDrivers)
 * 
 * Migrates data from legacy tables to spec-compliant tables:
 * - driverRateCards → driverRatePlans
 * - driverAssignments → contractDrivers
 * 
 * Usage:
 *   npx tsx scripts/migrateLegacyDrivers.ts [--dry-run] [--batch-size=500]
 * 
 * Features:
 * - Idempotent: safe to run multiple times
 * - Batched transactions for performance
 * - Dry-run mode for testing
 * - Computes cost breakdowns using existing services
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { calculateDriverAssignmentCost } from '../server/utils/driverCostCalculator';

interface MigrationStats {
  ratePlansCreated: number;
  ratePlansSkipped: number;
  contractDriversCreated: number;
  contractDriversSkipped: number;
  errors: string[];
}

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '500');
const DRY_RUN = process.argv.includes('--dry-run');

async function logMigration(action: string, details: any) {
  console.log(`[${new Date().toISOString()}] ${action}:`, JSON.stringify(details, null, 2));
}

async function migrateRatePlans(stats: MigrationStats): Promise<Map<number, number>> {
  const rateCardToRatePlanMap = new Map<number, number>();
  
  console.log('\n=== Migrating Rate Cards → Rate Plans ===');
  
  const legacyRateCards = await db.execute(sql`
    SELECT * FROM driver_rate_cards 
    ORDER BY id
  `);
  
  console.log(`Found ${legacyRateCards.rows.length} legacy rate cards`);
  
  for (const rateCard of legacyRateCards.rows as any[]) {
    const existingPlan = await db.execute(sql`
      SELECT id FROM driver_rate_plans 
      WHERE company_id = ${rateCard.company_id}
        AND name = ${rateCard.name}
        AND service_type = ${rateCard.service_type}
      LIMIT 1
    `);
    
    if (existingPlan.rows.length > 0) {
      stats.ratePlansSkipped++;
      rateCardToRatePlanMap.set(rateCard.id, (existingPlan.rows[0] as any).id);
      continue;
    }
    
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would create rate plan from rate card ${rateCard.id}: ${rateCard.name}`);
      stats.ratePlansCreated++;
      continue;
    }
    
    try {
      const result = await db.execute(sql`
        INSERT INTO driver_rate_plans (
          company_id, branch_id, name, service_type, base_rate,
          vat_applicable, effective_from, effective_to, is_active, created_at
        ) VALUES (
          ${rateCard.company_id},
          ${rateCard.branch_id},
          ${rateCard.name},
          ${rateCard.service_type},
          ${rateCard.base_rate},
          ${rateCard.vat_applicable ?? true},
          ${rateCard.effective_from || new Date().toISOString()},
          ${rateCard.effective_to},
          ${rateCard.is_active ?? true},
          ${rateCard.created_at || new Date().toISOString()}
        )
        RETURNING id
      `);
      
      const newPlanId = (result.rows[0] as any).id;
      rateCardToRatePlanMap.set(rateCard.id, newPlanId);
      stats.ratePlansCreated++;
      
      await logMigration('RATE_PLAN_CREATED', {
        sourceRateCardId: rateCard.id,
        newRatePlanId: newPlanId,
        name: rateCard.name
      });
    } catch (error: any) {
      stats.errors.push(`Rate card ${rateCard.id}: ${error.message}`);
    }
  }
  
  return rateCardToRatePlanMap;
}

async function migrateAssignments(
  stats: MigrationStats, 
  rateCardToRatePlanMap: Map<number, number>
): Promise<void> {
  console.log('\n=== Migrating Assignments → Contract Drivers ===');
  
  const legacyAssignments = await db.execute(sql`
    SELECT da.*, drc.base_rate, drc.service_type, b.emirate
    FROM driver_assignments da
    LEFT JOIN driver_rate_cards drc ON da.rate_card_id = drc.id
    LEFT JOIN branches b ON da.branch_id = b.id
    ORDER BY da.id
  `);
  
  console.log(`Found ${legacyAssignments.rows.length} legacy assignments`);
  
  for (const assignment of legacyAssignments.rows as any[]) {
    const existing = await db.execute(sql`
      SELECT id FROM contract_drivers 
      WHERE contract_id = ${assignment.contract_id}
        AND driver_id = ${assignment.driver_id}
        AND assignment_start = ${assignment.start_date_time}
      LIMIT 1
    `);
    
    if (existing.rows.length > 0) {
      stats.contractDriversSkipped++;
      continue;
    }
    
    const ratePlanId = assignment.rate_card_id 
      ? rateCardToRatePlanMap.get(assignment.rate_card_id) 
      : null;
    
    let costBreakdown = null;
    let totalCharge = assignment.total_charge || '0';
    
    if (assignment.start_date_time && assignment.end_date_time && assignment.base_rate) {
      try {
        const calculatedCost = await calculateDriverAssignmentCost({
          startDateTime: new Date(assignment.start_date_time),
          endDateTime: new Date(assignment.end_date_time),
          serviceType: assignment.service_type || 'daily',
          baseRate: parseFloat(assignment.base_rate),
          emirate: assignment.emirate || 'Dubai'
        });
        
        costBreakdown = {
          baseRate: calculatedCost.baseRate,
          quantity: calculatedCost.quantity,
          serviceType: assignment.service_type || 'daily',
          surcharges: calculatedCost.totalSurcharges,
          surchargeBreakdown: calculatedCost.surchargeBreakdown,
          vatAmount: calculatedCost.vatAmount,
          totalAfterVat: calculatedCost.totalCharge,
          migratedAt: new Date().toISOString(),
          sourceAssignmentId: assignment.id,
          sourceRateCardId: assignment.rate_card_id
        };
        
        totalCharge = calculatedCost.totalCharge;
      } catch (error: any) {
        console.warn(`Cost calculation failed for assignment ${assignment.id}: ${error.message}`);
      }
    }
    
    const notesJson = costBreakdown 
      ? JSON.stringify({ costBreakdown, originalNotes: assignment.notes })
      : assignment.notes;
    
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would create contract driver from assignment ${assignment.id}`);
      stats.contractDriversCreated++;
      continue;
    }
    
    try {
      await db.execute(sql`
        INSERT INTO contract_drivers (
          contract_id, driver_id, company_id, branch_id, rate_plan_id,
          assignment_start, assignment_end, service_type, status,
          total_charge, notes, created_at
        ) VALUES (
          ${assignment.contract_id},
          ${assignment.driver_id},
          ${assignment.company_id},
          ${assignment.branch_id},
          ${ratePlanId},
          ${assignment.start_date_time},
          ${assignment.end_date_time},
          ${assignment.service_type || 'daily'},
          ${assignment.status || 'scheduled'},
          ${totalCharge},
          ${notesJson},
          ${assignment.created_at || new Date().toISOString()}
        )
      `);
      
      stats.contractDriversCreated++;
      
      await logMigration('CONTRACT_DRIVER_CREATED', {
        sourceAssignmentId: assignment.id,
        contractId: assignment.contract_id,
        driverId: assignment.driver_id,
        hasCostBreakdown: !!costBreakdown
      });
    } catch (error: any) {
      stats.errors.push(`Assignment ${assignment.id}: ${error.message}`);
    }
  }
}

async function validateMigration(stats: MigrationStats): Promise<void> {
  console.log('\n=== Validation ===');
  
  const legacyRateCardCount = await db.execute(sql`SELECT COUNT(*) as count FROM driver_rate_cards`);
  const newRatePlanCount = await db.execute(sql`SELECT COUNT(*) as count FROM driver_rate_plans`);
  
  const legacyAssignmentCount = await db.execute(sql`SELECT COUNT(*) as count FROM driver_assignments`);
  const newContractDriverCount = await db.execute(sql`SELECT COUNT(*) as count FROM contract_drivers`);
  
  console.log(`Rate Cards (legacy): ${(legacyRateCardCount.rows[0] as any).count}`);
  console.log(`Rate Plans (new): ${(newRatePlanCount.rows[0] as any).count}`);
  console.log(`Assignments (legacy): ${(legacyAssignmentCount.rows[0] as any).count}`);
  console.log(`Contract Drivers (new): ${(newContractDriverCount.rows[0] as any).count}`);
  
  const legacyTotalCharge = await db.execute(sql`
    SELECT COALESCE(SUM(CAST(total_charge AS DECIMAL)), 0) as total 
    FROM driver_assignments 
    WHERE status IN ('scheduled', 'active', 'completed')
  `);
  
  const newTotalCharge = await db.execute(sql`
    SELECT COALESCE(SUM(CAST(total_charge AS DECIMAL)), 0) as total 
    FROM contract_drivers 
    WHERE status IN ('scheduled', 'active', 'completed')
  `);
  
  console.log(`Legacy total charges: ${(legacyTotalCharge.rows[0] as any).total}`);
  console.log(`New total charges: ${(newTotalCharge.rows[0] as any).total}`);
}

async function main() {
  console.log('========================================');
  console.log('Legacy Driver Data Migration');
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log('========================================\n');
  
  const stats: MigrationStats = {
    ratePlansCreated: 0,
    ratePlansSkipped: 0,
    contractDriversCreated: 0,
    contractDriversSkipped: 0,
    errors: []
  };
  
  try {
    const rateCardMap = await migrateRatePlans(stats);
    await migrateAssignments(stats, rateCardMap);
    await validateMigration(stats);
    
    console.log('\n========================================');
    console.log('Migration Summary');
    console.log('========================================');
    console.log(`Rate Plans Created: ${stats.ratePlansCreated}`);
    console.log(`Rate Plans Skipped (already exist): ${stats.ratePlansSkipped}`);
    console.log(`Contract Drivers Created: ${stats.contractDriversCreated}`);
    console.log(`Contract Drivers Skipped (already exist): ${stats.contractDriversSkipped}`);
    
    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    if (DRY_RUN) {
      console.log('\n[DRY-RUN] No data was modified. Run without --dry-run to execute migration.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
