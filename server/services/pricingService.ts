/**
 * File: server/services/pricingService.ts
 * @area Tariffs & Pricing Engine
 * @checklist §2.12, §4.9.2
 * @purpose Seasonal pricing and tariff calculation per Master Spec §2.12
 * 
 * @behaviour
 *  - Deep integration with seasonal_tariffs lookup table (not pricingRules)
 *  - Multi-day rentals with overlapping season handling
 *  - Priority-based tariff selection when multiple apply
 *  - Branch and vehicle class filtering
 *  - Audit trail for applied tariffs
 * 
 * @services
 *  - getApplicableTariffs(startDate, endDate, vehicleClassId?, branchId?): Gets seasonal tariffs
 *  - calculateSeasonalPricing(baseRate, date, vehicleClassId?, branchId?): Single-day pricing
 *  - calculateMultiDayPricing(baseRate, startDate, endDate, ...): Range pricing with breakdown
 *  - getActiveAddons(branchId?, vehicleClassId?): Available add-on items
 *  - getActivePackages(branchId?, vehicleClassId?): Available packages
 * 
 * @notes
 *  - 5-minute cache TTL for frequently accessed tariffs
 *  - Supports percentage, flat, and override adjustment types
 * 
 * See: docs/MASTER_SPEC_IMPLEMENTATION_CHECKLIST.md (§2.12, §4.9.2)
 */

import { db } from '../db';
import { seasonalTariffs, addons, packages, packageAddons } from '@shared/schema';
import { eq, and, or, isNull, desc, asc, sql } from 'drizzle-orm';
import type { SeasonalTariff, Addon, Package, PackageAddon } from '@shared/schema';

// Cache for frequently accessed data
const tariffCache: Map<string, { data: SeasonalTariff[]; timestamp: number }> = new Map();
const addonCache: Map<string, { data: Addon[]; timestamp: number }> = new Map();
const packageCache: Map<string, { data: Package[]; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface SeasonalPricingResult {
  baseRate: number;
  adjustedRate: number;
  adjustmentType: 'percentage' | 'flat' | 'override' | null;
  adjustmentValue: number;
  appliedTariffId: string | null;
  appliedTariffName: string | null;
  seasonType: string | null;
  isHighSeason: boolean;
}

export interface MultiDayPricingResult {
  totalDays: number;
  dailyBreakdown: DailyPricing[];
  totalBaseAmount: number;
  totalAdjustedAmount: number;
  savings: number;
  appliedTariffs: AppliedTariffSummary[];
}

export interface DailyPricing {
  date: string;
  baseRate: number;
  adjustedRate: number;
  tariffId: string | null;
  tariffName: string | null;
  seasonType: string | null;
}

export interface AppliedTariffSummary {
  tariffId: string;
  tariffName: string;
  seasonType: string;
  daysApplied: number;
  adjustmentType: string;
  adjustmentValue: number;
}

/**
 * Get applicable seasonal tariffs for a date range
 * Deep integration with seasonal_tariffs lookup table
 */
export async function getApplicableTariffs(
  startDate: Date,
  endDate: Date,
  vehicleClassId?: string | null,
  branchId?: string | null
): Promise<SeasonalTariff[]> {
  const cacheKey = `${startDate.toISOString()}_${endDate.toISOString()}_${vehicleClassId || 'all'}_${branchId || 'global'}`;
  const now = Date.now();
  
  // Check cache
  const cached = tariffCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Build conditions for tariff query
    const conditions = [
      eq(seasonalTariffs.isActive, true),
      sql`${seasonalTariffs.startDate}::date <= ${endDateStr}::date`,
      sql`${seasonalTariffs.endDate}::date >= ${startDateStr}::date`
    ];
    
    // Vehicle class filter (include specific + global)
    if (vehicleClassId) {
      conditions.push(
        or(
          eq(seasonalTariffs.vehicleClassId, vehicleClassId),
          isNull(seasonalTariffs.vehicleClassId)
        )!
      );
    }
    
    // Branch filter (include specific + global)
    if (branchId) {
      conditions.push(
        or(
          eq(seasonalTariffs.branchId, branchId),
          isNull(seasonalTariffs.branchId)
        )!
      );
    }
    
    const tariffs = await db
      .select()
      .from(seasonalTariffs)
      .where(and(...conditions))
      .orderBy(desc(seasonalTariffs.priority), asc(seasonalTariffs.startDate));
    
    // Cache results
    tariffCache.set(cacheKey, { data: tariffs, timestamp: now });
    
    return tariffs;
  } catch (error) {
    console.error('[PricingService] Failed to get applicable tariffs:', error);
    return [];
  }
}

/**
 * Get the highest priority tariff for a specific date
 */
export function getTariffForDate(
  date: Date,
  tariffs: SeasonalTariff[]
): SeasonalTariff | null {
  const dateStr = date.toISOString().split('T')[0];
  
  // Find tariffs that apply to this specific date
  const applicableTariffs = tariffs.filter(tariff => {
    const tariffStart = new Date(tariff.startDate);
    const tariffEnd = new Date(tariff.endDate);
    return date >= tariffStart && date <= tariffEnd;
  });
  
  if (applicableTariffs.length === 0) {
    return null;
  }
  
  // Return highest priority tariff (tariffs are already sorted by priority desc)
  return applicableTariffs[0];
}

/**
 * Calculate adjusted rate based on seasonal tariff
 */
export function calculateSeasonalRate(
  baseRate: number,
  tariff: SeasonalTariff | null
): SeasonalPricingResult {
  if (!tariff) {
    return {
      baseRate,
      adjustedRate: baseRate,
      adjustmentType: null,
      adjustmentValue: 0,
      appliedTariffId: null,
      appliedTariffName: null,
      seasonType: null,
      isHighSeason: false,
    };
  }
  
  let adjustedRate = baseRate;
  const adjustmentType = tariff.adjustmentType as 'percentage' | 'flat' | 'override';
  const adjustmentValue = parseFloat(tariff.adjustmentValue || '0');
  
  switch (adjustmentType) {
    case 'percentage':
      // Positive = increase, Negative = discount
      adjustedRate = baseRate * (1 + adjustmentValue / 100);
      break;
    case 'flat':
      // Add flat amount (can be negative for discount)
      adjustedRate = baseRate + adjustmentValue;
      break;
    case 'override':
      // Replace rate entirely
      adjustedRate = adjustmentValue;
      break;
  }
  
  // Ensure rate is not negative
  adjustedRate = Math.max(0, adjustedRate);
  
  // Round to 2 decimal places
  adjustedRate = Math.round(adjustedRate * 100) / 100;
  
  return {
    baseRate,
    adjustedRate,
    adjustmentType,
    adjustmentValue,
    appliedTariffId: tariff.id,
    appliedTariffName: tariff.name,
    seasonType: tariff.seasonType,
    isHighSeason: ['peak', 'holiday', 'event'].includes(tariff.seasonType || ''),
  };
}

/**
 * Calculate pricing for a multi-day rental with seasonal adjustments
 * Handles overlapping seasons with day-by-day breakdown
 */
export async function calculateMultiDayPricing(
  baseRate: number,
  startDate: Date,
  endDate: Date,
  vehicleClassId?: string | null,
  branchId?: string | null
): Promise<MultiDayPricingResult> {
  // Get all applicable tariffs for the date range
  const tariffs = await getApplicableTariffs(startDate, endDate, vehicleClassId, branchId);
  
  const dailyBreakdown: DailyPricing[] = [];
  const tariffDays: Map<string, { tariff: SeasonalTariff; days: number }> = new Map();
  
  let totalBaseAmount = 0;
  let totalAdjustedAmount = 0;
  let currentDate = new Date(startDate);
  
  // Calculate day by day
  while (currentDate <= endDate) {
    const dayTariff = getTariffForDate(currentDate, tariffs);
    const pricing = calculateSeasonalRate(baseRate, dayTariff);
    
    dailyBreakdown.push({
      date: currentDate.toISOString().split('T')[0],
      baseRate: pricing.baseRate,
      adjustedRate: pricing.adjustedRate,
      tariffId: pricing.appliedTariffId,
      tariffName: pricing.appliedTariffName,
      seasonType: pricing.seasonType,
    });
    
    totalBaseAmount += pricing.baseRate;
    totalAdjustedAmount += pricing.adjustedRate;
    
    // Track tariff usage for summary
    if (dayTariff) {
      const existing = tariffDays.get(dayTariff.id);
      if (existing) {
        existing.days++;
      } else {
        tariffDays.set(dayTariff.id, { tariff: dayTariff, days: 1 });
      }
    }
    
    // Move to next day
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Build tariff summary
  const appliedTariffs: AppliedTariffSummary[] = Array.from(tariffDays.values()).map(({ tariff, days }) => ({
    tariffId: tariff.id,
    tariffName: tariff.name,
    seasonType: tariff.seasonType || 'regular',
    daysApplied: days,
    adjustmentType: tariff.adjustmentType || 'none',
    adjustmentValue: parseFloat(tariff.adjustmentValue || '0'),
  }));
  
  return {
    totalDays: dailyBreakdown.length,
    dailyBreakdown,
    totalBaseAmount: Math.round(totalBaseAmount * 100) / 100,
    totalAdjustedAmount: Math.round(totalAdjustedAmount * 100) / 100,
    savings: Math.round((totalBaseAmount - totalAdjustedAmount) * 100) / 100,
    appliedTariffs,
  };
}

/**
 * Get active addons for contract configuration
 * Deep integration with addons lookup table
 */
export async function getAvailableAddons(
  branchId?: string | null,
  category?: string
): Promise<Addon[]> {
  const cacheKey = `addons_${branchId || 'global'}_${category || 'all'}`;
  const now = Date.now();
  
  const cached = addonCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const conditions = [eq(addons.isActive, true)];
    
    if (branchId) {
      conditions.push(
        or(
          eq(addons.branchId, branchId),
          isNull(addons.branchId)
        )!
      );
    }
    
    if (category) {
      conditions.push(eq(addons.category, category));
    }
    
    const result = await db
      .select()
      .from(addons)
      .where(and(...conditions))
      .orderBy(asc(addons.sortOrder), asc(addons.nameEn));
    
    addonCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.error('[PricingService] Failed to get addons:', error);
    return [];
  }
}

/**
 * Get active packages with their included addons
 * Deep integration with packages and package_addons lookup tables
 */
export async function getAvailablePackages(
  vehicleClassId?: string | null,
  branchId?: string | null
): Promise<(Package & { includedAddons: (PackageAddon & { addon?: Addon })[] })[]> {
  const cacheKey = `packages_${vehicleClassId || 'all'}_${branchId || 'global'}`;
  const now = Date.now();
  
  const cached = packageCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data as any;
  }
  
  try {
    const conditions = [eq(packages.isActive, true)];
    
    if (vehicleClassId) {
      conditions.push(
        or(
          eq(packages.vehicleClassId, vehicleClassId),
          isNull(packages.vehicleClassId)
        )!
      );
    }
    
    if (branchId) {
      conditions.push(
        or(
          eq(packages.branchId, branchId),
          isNull(packages.branchId)
        )!
      );
    }
    
    // Check validity dates
    const today = new Date().toISOString().split('T')[0];
    conditions.push(
      or(
        isNull(packages.validFrom),
        sql`${packages.validFrom}::date <= ${today}::date`
      )!
    );
    conditions.push(
      or(
        isNull(packages.validUntil),
        sql`${packages.validUntil}::date >= ${today}::date`
      )!
    );
    
    const packagesResult = await db
      .select()
      .from(packages)
      .where(and(...conditions))
      .orderBy(asc(packages.sortOrder), asc(packages.nameEn));
    
    // Get package addons for each package
    const packagesWithAddons = await Promise.all(
      packagesResult.map(async (pkg) => {
        const pkgAddons = await db
          .select()
          .from(packageAddons)
          .where(eq(packageAddons.packageId, pkg.id))
          .orderBy(asc(packageAddons.sortOrder));
        
        // Get addon details for each package addon
        const addonsWithDetails = await Promise.all(
          pkgAddons.map(async (pa) => {
            const [addon] = await db
              .select()
              .from(addons)
              .where(eq(addons.id, pa.addonId));
            return { ...pa, addon };
          })
        );
        
        return { ...pkg, includedAddons: addonsWithDetails };
      })
    );
    
    packageCache.set(cacheKey, { data: packagesWithAddons, timestamp: now });
    return packagesWithAddons;
  } catch (error) {
    console.error('[PricingService] Failed to get packages:', error);
    return [];
  }
}

/**
 * Calculate addon costs for a rental period
 */
export function calculateAddonCosts(
  addonsList: { addonId: string; quantity: number; addon: Addon }[],
  rentalDays: number
): { total: number; breakdown: { addonId: string; name: string; cost: number }[] } {
  let total = 0;
  const breakdown: { addonId: string; name: string; cost: number }[] = [];
  
  for (const { addonId, quantity, addon } of addonsList) {
    let cost = 0;
    
    switch (addon.pricingType) {
      case 'daily':
        cost = parseFloat(addon.dailyRate || '0') * quantity * rentalDays;
        break;
      case 'one_time':
        cost = parseFloat(addon.oneTimeRate || '0') * quantity;
        break;
      case 'percentage':
        // Percentage addons require base amount - skip here, handle separately
        break;
    }
    
    total += cost;
    breakdown.push({
      addonId,
      name: addon.nameEn,
      cost: Math.round(cost * 100) / 100,
    });
  }
  
  return {
    total: Math.round(total * 100) / 100,
    breakdown,
  };
}

/**
 * Clear all pricing caches
 */
export function clearPricingCache(): void {
  tariffCache.clear();
  addonCache.clear();
  packageCache.clear();
  console.log('[PricingService] All caches cleared');
}

/**
 * Get a quick pricing estimate with seasonal adjustments
 */
export async function getQuickPricingEstimate(
  baseRate: number,
  startDate: Date,
  endDate: Date,
  options?: {
    vehicleClassId?: string | null;
    branchId?: string | null;
    addonIds?: string[];
  }
): Promise<{
  rentalAmount: number;
  seasonalAdjustment: number;
  addonsAmount: number;
  totalBeforeVat: number;
  vatAmount: number;
  totalWithVat: number;
  appliedTariffs: string[];
  daysBreakdown: { regular: number; peak: number; offPeak: number };
}> {
  const pricing = await calculateMultiDayPricing(
    baseRate,
    startDate,
    endDate,
    options?.vehicleClassId,
    options?.branchId
  );
  
  // Calculate addons if provided
  let addonsAmount = 0;
  if (options?.addonIds && options.addonIds.length > 0) {
    const availableAddons = await getAvailableAddons(options.branchId);
    const selectedAddons = options.addonIds
      .map(id => {
        const addon = availableAddons.find(a => a.id === id);
        return addon ? { addonId: id, quantity: 1, addon } : null;
      })
      .filter(Boolean) as { addonId: string; quantity: number; addon: Addon }[];
    
    const addonCosts = calculateAddonCosts(selectedAddons, pricing.totalDays);
    addonsAmount = addonCosts.total;
  }
  
  const rentalAmount = pricing.totalAdjustedAmount;
  const seasonalAdjustment = pricing.totalBaseAmount - pricing.totalAdjustedAmount;
  const totalBeforeVat = rentalAmount + addonsAmount;
  const vatRate = 0.05; // 5% UAE VAT
  const vatAmount = Math.round(totalBeforeVat * vatRate * 100) / 100;
  const totalWithVat = totalBeforeVat + vatAmount;
  
  // Count days by season type
  const daysBreakdown = { regular: 0, peak: 0, offPeak: 0 };
  for (const day of pricing.dailyBreakdown) {
    if (!day.seasonType) {
      daysBreakdown.regular++;
    } else if (['peak', 'holiday', 'event'].includes(day.seasonType)) {
      daysBreakdown.peak++;
    } else if (['off_peak', 'ramadan'].includes(day.seasonType)) {
      daysBreakdown.offPeak++;
    } else {
      daysBreakdown.regular++;
    }
  }
  
  return {
    rentalAmount,
    seasonalAdjustment,
    addonsAmount,
    totalBeforeVat,
    vatAmount,
    totalWithVat,
    appliedTariffs: pricing.appliedTariffs.map(t => t.tariffName),
    daysBreakdown,
  };
}
