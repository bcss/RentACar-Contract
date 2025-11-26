/**
 * Daily Summary Job
 * Per Master Spec Part 9.6.2 - Daily Branch & Vehicle Summary Reports
 * 
 * This service generates daily summaries for reporting performance:
 * - summaries_daily_branch: Branch-level financial and operational metrics
 * - summaries_daily_vehicle: Vehicle-level status and utilization tracking
 */

import { db } from '../db';
import { 
  contracts, payments, vehicles, branches, incidents, reservations,
  summariesDailyBranch, summariesDailyVehicle 
} from '@shared/schema';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';

interface BranchSummary {
  branchId: string;
  date: string;
  totalRevenueCash: string;
  totalRevenueCard: string;
  totalRevenueBank: string;
  totalRevenue: string;
  contractsStarted: number;
  contractsClosed: number;
  activeContractsEndOfDay: number;
  reservationsCreated: number;
  reservationsConverted: number;
  reservationsExpired: number;
  paymentsInCount: number;
  paymentsInTotal: string;
  paymentsOutCount: number;
  paymentsOutTotal: string;
  outstandingBalance: string;
  vehiclesAvailable: number;
  vehiclesRented: number;
  vehiclesMaintenance: number;
  avgUtilisationPct: string;
  newIncidents: number;
}

interface VehicleSummary {
  vehicleId: string;
  date: string;
  status: string;
  isOut: boolean;
  utilisationContribution: number;
  contractId: string | null;
  reservationId: string | null;
  maintenanceJobId: string | null;
  branchId: string;
  revenueGenerated: string | null;
}

class DailySummaryJobService {
  /**
   * Generate daily summaries for all branches
   * Per Master Spec Part 9.6.2
   */
  async generateDailySummaries(targetDate?: Date): Promise<{ 
    success: boolean; 
    branchSummaries: number; 
    vehicleSummaries: number; 
    error?: string 
  }> {
    const date = targetDate || new Date();
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`[DailySummaryJob] Generating summaries for date: ${dateStr}`);
    
    try {
      const allBranches = await db.select().from(branches).where(eq(branches.isActive, true));
      let branchSummaries = 0;
      let vehicleSummaries = 0;
      
      for (const branch of allBranches) {
        try {
          await this.generateBranchSummary(branch.id, date, dateStr);
          branchSummaries++;
        } catch (error) {
          console.error(`[DailySummaryJob] Error generating branch summary for ${branch.id}:`, error);
        }
        
        const branchVehicles = await db.select()
          .from(vehicles)
          .where(eq(vehicles.branchId, branch.id));
          
        for (const vehicle of branchVehicles) {
          try {
            await this.generateVehicleSummary(vehicle.id, branch.id, date, dateStr);
            vehicleSummaries++;
          } catch (error) {
            console.error(`[DailySummaryJob] Error generating vehicle summary for ${vehicle.id}:`, error);
          }
        }
      }
      
      console.log(`[DailySummaryJob] Generated ${branchSummaries} branch summaries and ${vehicleSummaries} vehicle summaries`);
      
      return { success: true, branchSummaries, vehicleSummaries };
    } catch (error) {
      console.error('[DailySummaryJob] Error generating daily summaries:', error);
      return { 
        success: false, 
        branchSummaries: 0, 
        vehicleSummaries: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Generate summary for a single branch
   */
  private async generateBranchSummary(branchId: string, date: Date, dateStr: string): Promise<void> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayPayments = await db.select()
      .from(payments)
      .where(
        and(
          eq(payments.branchId, branchId),
          eq(payments.status, 'completed'),
          gte(payments.createdAt, dayStart),
          lte(payments.createdAt, dayEnd)
        )
      );
    
    let totalRevenueCash = 0;
    let totalRevenueCard = 0;
    let totalRevenueBank = 0;
    let paymentsInCount = 0;
    let paymentsInTotal = 0;
    let paymentsOutCount = 0;
    let paymentsOutTotal = 0;
    
    for (const payment of dayPayments) {
      const amount = parseFloat(payment.amount) || 0;
      
      if (payment.type === 'refund' || amount < 0) {
        paymentsOutCount++;
        paymentsOutTotal += Math.abs(amount);
      } else {
        paymentsInCount++;
        paymentsInTotal += amount;
        
        if (payment.method === 'cash') totalRevenueCash += amount;
        else if (payment.method === 'card') totalRevenueCard += amount;
        else if (payment.method === 'bank') totalRevenueBank += amount;
      }
    }
    
    const totalRevenue = totalRevenueCash + totalRevenueCard + totalRevenueBank;
    
    const contractsStartedResult = await db.select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.branchId, branchId),
          gte(contracts.vehicleCheckoutAt, dayStart),
          lte(contracts.vehicleCheckoutAt, dayEnd)
        )
      );
    const contractsStarted = contractsStartedResult[0]?.count || 0;
    
    const contractsClosedResult = await db.select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.branchId, branchId),
          eq(contracts.status, 'completed'),
          gte(contracts.vehicleReturnedAt, dayStart),
          lte(contracts.vehicleReturnedAt, dayEnd)
        )
      );
    const contractsClosed = contractsClosedResult[0]?.count || 0;
    
    const activeContractsResult = await db.select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.branchId, branchId),
          eq(contracts.status, 'active')
        )
      );
    const activeContractsEndOfDay = activeContractsResult[0]?.count || 0;
    
    const outstandingResult = await db.select({
      total: sql<string>`COALESCE(SUM(CAST(${contracts.outstandingBalance} AS DECIMAL(12,2))), 0)`
    })
      .from(contracts)
      .where(
        and(
          eq(contracts.branchId, branchId),
          eq(contracts.status, 'active')
        )
      );
    const outstandingBalance = outstandingResult[0]?.total || '0';
    
    const branchVehicles = await db.select().from(vehicles).where(eq(vehicles.branchId, branchId));
    let vehiclesAvailable = 0;
    let vehiclesRented = 0;
    let vehiclesMaintenance = 0;
    
    for (const vehicle of branchVehicles) {
      if (vehicle.status === 'available') vehiclesAvailable++;
      else if (vehicle.status === 'rented') vehiclesRented++;
      else if (vehicle.status === 'maintenance') vehiclesMaintenance++;
    }
    
    const totalVehicles = branchVehicles.length;
    const avgUtilisationPct = totalVehicles > 0 
      ? ((vehiclesRented / totalVehicles) * 100).toFixed(2)
      : '0.00';
    
    const incidentsResult = await db.select({ count: count() })
      .from(incidents)
      .where(
        and(
          gte(incidents.createdAt, dayStart),
          lte(incidents.createdAt, dayEnd)
        )
      );
    const newIncidents = incidentsResult[0]?.count || 0;
    
    const existing = await db.select()
      .from(summariesDailyBranch)
      .where(
        and(
          eq(summariesDailyBranch.branchId, branchId),
          eq(summariesDailyBranch.date, dateStr)
        )
      )
      .limit(1);
    
    const summaryData = {
      branchId,
      date: dateStr,
      totalRevenueCash: totalRevenueCash.toFixed(2),
      totalRevenueCard: totalRevenueCard.toFixed(2),
      totalRevenueBank: totalRevenueBank.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      contractsStarted,
      contractsClosed,
      activeContractsEndOfDay,
      reservationsCreated: 0,
      reservationsConverted: 0,
      reservationsExpired: 0,
      paymentsInCount,
      paymentsInTotal: paymentsInTotal.toFixed(2),
      paymentsOutCount,
      paymentsOutTotal: paymentsOutTotal.toFixed(2),
      outstandingBalance,
      vehiclesAvailable,
      vehiclesRented,
      vehiclesMaintenance,
      avgUtilisationPct,
      newIncidents,
    };
    
    if (existing.length > 0) {
      await db.update(summariesDailyBranch)
        .set({ ...summaryData, updatedAt: new Date() })
        .where(eq(summariesDailyBranch.id, existing[0].id));
    } else {
      await db.insert(summariesDailyBranch).values(summaryData);
    }
  }
  
  /**
   * Generate summary for a single vehicle
   */
  private async generateVehicleSummary(vehicleId: string, branchId: string, date: Date, dateStr: string): Promise<void> {
    const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
    if (!vehicle.length) return;
    
    const vehicleData = vehicle[0];
    
    let contractId: string | null = null;
    let revenueGenerated: string | null = null;
    
    if (vehicleData.status === 'rented') {
      const activeContract = await db.select()
        .from(contracts)
        .where(
          and(
            eq(contracts.vehicleId, vehicleId),
            eq(contracts.status, 'active')
          )
        )
        .limit(1);
      
      if (activeContract.length > 0) {
        contractId = activeContract[0].id;
        const dailyRate = parseFloat(activeContract[0].agreedDailyRate || '0');
        revenueGenerated = dailyRate.toFixed(2);
      }
    }
    
    const existing = await db.select()
      .from(summariesDailyVehicle)
      .where(
        and(
          eq(summariesDailyVehicle.vehicleId, vehicleId),
          eq(summariesDailyVehicle.date, dateStr)
        )
      )
      .limit(1);
    
    const summaryData = {
      vehicleId,
      date: dateStr,
      status: vehicleData.status || 'unknown',
      isOut: vehicleData.status === 'rented',
      utilisationContribution: vehicleData.status === 'rented' ? 1 : 0,
      contractId,
      reservationId: null,
      maintenanceJobId: null,
      branchId,
      revenueGenerated,
    };
    
    if (existing.length > 0) {
      await db.update(summariesDailyVehicle)
        .set({ ...summaryData, updatedAt: new Date() })
        .where(eq(summariesDailyVehicle.id, existing[0].id));
    } else {
      await db.insert(summariesDailyVehicle).values(summaryData);
    }
  }
  
  /**
   * Get branch summary for a specific date
   */
  async getBranchSummary(branchId: string, date: string): Promise<BranchSummary | null> {
    const [summary] = await db.select()
      .from(summariesDailyBranch)
      .where(
        and(
          eq(summariesDailyBranch.branchId, branchId),
          eq(summariesDailyBranch.date, date)
        )
      )
      .limit(1);
    
    return summary || null;
  }
  
  /**
   * Get branch summaries for a date range
   */
  async getBranchSummariesRange(branchId: string, startDate: string, endDate: string): Promise<BranchSummary[]> {
    return db.select()
      .from(summariesDailyBranch)
      .where(
        and(
          eq(summariesDailyBranch.branchId, branchId),
          gte(summariesDailyBranch.date, startDate),
          lte(summariesDailyBranch.date, endDate)
        )
      );
  }
  
  /**
   * Get vehicle summary for a specific date
   */
  async getVehicleSummary(vehicleId: string, date: string): Promise<VehicleSummary | null> {
    const [summary] = await db.select()
      .from(summariesDailyVehicle)
      .where(
        and(
          eq(summariesDailyVehicle.vehicleId, vehicleId),
          eq(summariesDailyVehicle.date, date)
        )
      )
      .limit(1);
    
    return summary || null;
  }
  
  /**
   * Get utilization metrics for a date range
   */
  async getUtilizationMetrics(branchId: string, startDate: string, endDate: string): Promise<{
    avgUtilization: number;
    totalRevenue: number;
    totalDays: number;
    vehicleDays: number;
    rentedDays: number;
  }> {
    const summaries = await db.select()
      .from(summariesDailyBranch)
      .where(
        and(
          eq(summariesDailyBranch.branchId, branchId),
          gte(summariesDailyBranch.date, startDate),
          lte(summariesDailyBranch.date, endDate)
        )
      );
    
    if (summaries.length === 0) {
      return { avgUtilization: 0, totalRevenue: 0, totalDays: 0, vehicleDays: 0, rentedDays: 0 };
    }
    
    const totalDays = summaries.length;
    let totalRevenue = 0;
    let totalUtilization = 0;
    let totalVehicleDays = 0;
    let totalRentedDays = 0;
    
    for (const summary of summaries) {
      totalRevenue += parseFloat(summary.totalRevenue || '0');
      totalUtilization += parseFloat(summary.avgUtilisationPct || '0');
      totalVehicleDays += (summary.vehiclesAvailable || 0) + (summary.vehiclesRented || 0) + (summary.vehiclesMaintenance || 0);
      totalRentedDays += summary.vehiclesRented || 0;
    }
    
    return {
      avgUtilization: totalDays > 0 ? totalUtilization / totalDays : 0,
      totalRevenue,
      totalDays,
      vehicleDays: totalVehicleDays,
      rentedDays: totalRentedDays,
    };
  }
}

export const dailySummaryJob = new DailySummaryJobService();

/**
 * Execute daily summary generation
 * Called by automation orchestrator
 */
export async function executeDailySummaryJob(): Promise<void> {
  console.log('[DailySummaryJob] Starting daily summary generation...');
  const result = await dailySummaryJob.generateDailySummaries();
  
  if (result.success) {
    console.log(`[DailySummaryJob] Completed: ${result.branchSummaries} branch summaries, ${result.vehicleSummaries} vehicle summaries`);
  } else {
    throw new Error(result.error || 'Failed to generate daily summaries');
  }
}
