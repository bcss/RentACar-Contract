import { db } from '../db';
import { companySettings, publicHolidays } from '@shared/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

/**
 * UAE Market Configuration
 * Abu Dhabi has Friday-Saturday weekend, other emirates have Saturday-Sunday
 */
const UAE_WEEKEND_CONFIG: Record<string, number[]> = {
  abu_dhabi: [5, 6], // Friday (5) and Saturday (6)
  dubai: [6, 0], // Saturday (6) and Sunday (0)
  sharjah: [6, 0],
  ajman: [6, 0],
  umm_al_quwain: [6, 0],
  ras_al_khaimah: [6, 0],
  fujairah: [6, 0],
};

export interface SurchargeSettings {
  nightShiftStartHour: number;
  nightShiftEndHour: number;
  nightSurchargeMultiplier: number;
  weekendSurchargeMultiplier: number;
  holidaySurchargeMultiplier: number;
  vatApplicable: boolean;
  vatRate: number;
}

export interface SurchargeBreakdown {
  baseCharge: number;
  nightSurcharge: number;
  weekendSurcharge: number;
  holidaySurcharge: number;
  totalBeforeVat: number;
  vatAmount: number;
  totalAfterVat: number;
  appliedMultipliers: {
    night: boolean;
    weekend: boolean;
    holiday: boolean;
  };
  hours: {
    total: number;
    nightHours: number;
    regularHours: number;
  };
}

/**
 * Fetches company settings for driver service surcharge calculation
 */
export async function getSurchargeSettings(): Promise<SurchargeSettings> {
  const settings = await db.query.companySettings.findFirst();
  
  if (!settings) {
    throw new Error('Company settings not found');
  }

  return {
    nightShiftStartHour: parseInt(settings.driverNightShiftStartHour),
    nightShiftEndHour: parseInt(settings.driverNightShiftEndHour),
    nightSurchargeMultiplier: parseFloat(settings.driverNightSurchargeMultiplier),
    weekendSurchargeMultiplier: parseFloat(settings.driverWeekendSurchargeMultiplier),
    holidaySurchargeMultiplier: parseFloat(settings.driverHolidaySurchargeMultiplier),
    vatApplicable: settings.driverServiceVatApplicable,
    vatRate: parseFloat(settings.vatPercentage),
  };
}

/**
 * Checks if a given date is a public holiday
 * Uses day-range check to handle holidays stored at any time
 */
export async function isPublicHoliday(date: Date): Promise<boolean> {
  // Normalize to start of day in local timezone
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const holiday = await db.query.publicHolidays.findFirst({
    where: and(
      gte(publicHolidays.holidayDate, startOfDay),
      lte(publicHolidays.holidayDate, endOfDay)
    ),
  });
  
  return !!holiday;
}

/**
 * Checks if a given date/time falls within night shift hours
 * Handles cross-midnight shifts (e.g., 22:00 to 06:00)
 */
export function isNightShift(dateTime: Date, nightStart: number, nightEnd: number): boolean {
  const hour = dateTime.getHours();
  
  // Cross-midnight shift (e.g., 22:00 to 06:00)
  if (nightStart > nightEnd) {
    return hour >= nightStart || hour < nightEnd;
  }
  
  // Same-day shift (e.g., 01:00 to 05:00)
  return hour >= nightStart && hour < nightEnd;
}

/**
 * Checks if a given date is a weekend in the specified emirate
 */
export function isWeekend(date: Date, emirate: string): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const weekendDays = UAE_WEEKEND_CONFIG[emirate] || UAE_WEEKEND_CONFIG.dubai; // Default to Dubai
  return weekendDays.includes(dayOfWeek);
}

/**
 * Calculates the number of night shift hours within a time range
 * Handles partial hours correctly by computing exact overlaps
 */
function calculateNightHours(
  startTime: Date,
  endTime: Date,
  nightStart: number,
  nightEnd: number
): number {
  const totalMillis = endTime.getTime() - startTime.getTime();
  const totalHours = totalMillis / (1000 * 60 * 60);
  let nightMillis = 0;
  
  // Create copy to iterate
  const current = new Date(startTime);
  
  // Iterate through each minute to count night time accurately
  while (current < endTime) {
    const nextMinute = new Date(current);
    nextMinute.setMinutes(current.getMinutes() + 1);
    
    // Don't go past endTime
    const segmentEnd = nextMinute > endTime ? endTime : nextMinute;
    
    // Check if this minute is in night shift
    if (isNightShift(current, nightStart, nightEnd)) {
      nightMillis += segmentEnd.getTime() - current.getTime();
    }
    
    current.setTime(segmentEnd.getTime());
  }
  
  const nightHours = nightMillis / (1000 * 60 * 60);
  return Math.min(nightHours, totalHours);
}

/**
 * Calculates surcharge for hourly driver service
 * 
 * @param baseHourlyRate - Base hourly rate from company settings
 * @param startTime - Service start date/time
 * @param endTime - Service end date/time
 * @param emirate - Emirates where service is provided (for weekend calculation)
 * @returns Detailed surcharge breakdown
 */
export async function calculateHourlySurcharge(
  baseHourlyRate: number,
  startTime: Date,
  endTime: Date,
  emirate: string
): Promise<SurchargeBreakdown> {
  const settings = await getSurchargeSettings();
  
  // Calculate total hours
  const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Calculate night hours
  const nightHours = calculateNightHours(
    startTime,
    endTime,
    settings.nightShiftStartHour,
    settings.nightShiftEndHour
  );
  const regularHours = totalHours - nightHours;
  
  // Check if any part of the service is on a weekend
  const isWeekendService = isWeekend(startTime, emirate) || isWeekend(endTime, emirate);
  
  // Check if any part of the service is on a public holiday
  const isHolidayService = await isPublicHoliday(startTime) || await isPublicHoliday(endTime);
  
  // Calculate base charge
  const baseCharge = baseHourlyRate * totalHours;
  
  // Calculate surcharges (mutually exclusive - highest multiplier wins)
  let nightSurcharge = 0;
  let weekendSurcharge = 0;
  let holidaySurcharge = 0;
  
  let appliedNight = false;
  let appliedWeekend = false;
  let appliedHoliday = false;
  
  if (isHolidayService) {
    // Holiday has highest priority
    holidaySurcharge = baseCharge * (settings.holidaySurchargeMultiplier - 1);
    appliedHoliday = true;
  } else if (isWeekendService) {
    // Weekend has second priority
    weekendSurcharge = baseCharge * (settings.weekendSurchargeMultiplier - 1);
    appliedWeekend = true;
  } else if (nightHours > 0) {
    // Night shift surcharge only on night hours
    const nightBaseCharge = baseHourlyRate * nightHours;
    nightSurcharge = nightBaseCharge * (settings.nightSurchargeMultiplier - 1);
    appliedNight = true;
  }
  
  // Calculate totals
  const totalBeforeVat = baseCharge + nightSurcharge + weekendSurcharge + holidaySurcharge;
  const vatAmount = settings.vatApplicable ? totalBeforeVat * (settings.vatRate / 100) : 0;
  const totalAfterVat = totalBeforeVat + vatAmount;
  
  return {
    baseCharge,
    nightSurcharge,
    weekendSurcharge,
    holidaySurcharge,
    totalBeforeVat,
    vatAmount,
    totalAfterVat,
    appliedMultipliers: {
      night: appliedNight,
      weekend: appliedWeekend,
      holiday: appliedHoliday,
    },
    hours: {
      total: totalHours,
      nightHours,
      regularHours,
    },
  };
}

/**
 * Calculates surcharge for daily driver service
 * 
 * @param baseDailyRate - Base daily rate from company settings
 * @param startDate - Service start date
 * @param endDate - Service end date
 * @param emirate - Emirates where service is provided (for weekend calculation)
 * @returns Detailed surcharge breakdown
 */
export async function calculateDailySurcharge(
  baseDailyRate: number,
  startDate: Date,
  endDate: Date,
  emirate: string
): Promise<SurchargeBreakdown> {
  const settings = await getSurchargeSettings();
  
  // Normalize dates to midnight for consistent calculation
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  // Calculate total days (inclusive of start, exclusive of end)
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Count weekend and holiday days (iterate from start to end-1 day to avoid double-counting)
  let weekendDays = 0;
  let holidayDays = 0;
  
  const currentDate = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    if (await isPublicHoliday(currentDate)) {
      holidayDays++;
    } else if (isWeekend(currentDate, emirate)) {
      weekendDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const regularDays = totalDays - weekendDays - holidayDays;
  
  // Calculate charges
  const baseCharge = baseDailyRate * totalDays;
  const weekendSurcharge = baseDailyRate * weekendDays * (settings.weekendSurchargeMultiplier - 1);
  const holidaySurcharge = baseDailyRate * holidayDays * (settings.holidaySurchargeMultiplier - 1);
  
  // Calculate totals
  const totalBeforeVat = baseCharge + weekendSurcharge + holidaySurcharge;
  const vatAmount = settings.vatApplicable ? totalBeforeVat * (settings.vatRate / 100) : 0;
  const totalAfterVat = totalBeforeVat + vatAmount;
  
  return {
    baseCharge,
    nightSurcharge: 0, // Not applicable for daily rates
    weekendSurcharge,
    holidaySurcharge,
    totalBeforeVat,
    vatAmount,
    totalAfterVat,
    appliedMultipliers: {
      night: false,
      weekend: weekendDays > 0,
      holiday: holidayDays > 0,
    },
    hours: {
      total: totalDays * 24,
      nightHours: 0,
      regularHours: regularDays * 24,
    },
  };
}
