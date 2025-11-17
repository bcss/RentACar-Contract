import { calculateHourlySurcharge, calculateDailySurcharge } from './surchargeCalculator';

export interface DriverAssignmentCalculation {
  baseRate: string;
  quantity: string;
  surchargeBreakdown: {
    night: number;
    weekend: number;
    holiday: number;
  };
  totalSurcharges: string;
  totalCharge: string;
}

/**
 * Calculates complete cost breakdown for a driver assignment
 * Uses the surcharge calculator to determine night/weekend/holiday surcharges
 */
export async function calculateDriverAssignmentCost(
  params: {
    startDateTime: Date;
    endDateTime: Date;
    serviceType: 'daily' | 'hourly';
    baseRate: number; // From driver rate card
    emirate: string; // From branch location
  }
): Promise<DriverAssignmentCalculation> {
  
  const { startDateTime, endDateTime, serviceType, baseRate, emirate } = params;
  
  // Calculate time duration
  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationDays = durationHours / 24;
  
  // Determine quantity based on service type
  let quantity: number;
  let costBreakdown;
  
  if (serviceType === 'daily') {
    quantity = Math.ceil(durationDays); // Round up partial days
    // Calculate surcharges using the surcharge calculator
    costBreakdown = await calculateDailySurcharge(baseRate, startDateTime, endDateTime, emirate);
  } else {
    quantity = Math.ceil(durationHours); // Round up partial hours
    // Calculate surcharges using the surcharge calculator
    costBreakdown = await calculateHourlySurcharge(baseRate, startDateTime, endDateTime, emirate);
  }
  
  // Round values to 2 decimal places
  const roundedNight = Math.round(costBreakdown.nightSurcharge * 100) / 100;
  const roundedWeekend = Math.round(costBreakdown.weekendSurcharge * 100) / 100;
  const roundedHoliday = Math.round(costBreakdown.holidaySurcharge * 100) / 100;
  const totalSurcharges = roundedNight + roundedWeekend + roundedHoliday;
  
  return {
    baseRate: baseRate.toFixed(2),
    quantity: quantity.toFixed(serviceType === 'daily' ? 0 : 2), // Days are whole numbers, hours can be decimal
    surchargeBreakdown: {
      night: roundedNight,
      weekend: roundedWeekend,
      holiday: roundedHoliday,
    },
    totalSurcharges: totalSurcharges.toFixed(2),
    totalCharge: costBreakdown.totalBeforeVat.toFixed(2), // Use calculated total (without VAT as it's already in base)
  };
}

/**
 * Calculates total driver service costs for a contract
 * Sums up all driver assignments (scheduled, active, completed)
 */
export function calculateContractDriverCosts(driverAssignments: any[]): {
  totalDriverCharges: number;
  totalDriverSurcharges: number;
} {
  let totalDriverCharges = 0;
  let totalDriverSurcharges = 0;
  
  for (const assignment of driverAssignments) {
    // Only include scheduled, active, and completed assignments
    if (['scheduled', 'active', 'completed'].includes(assignment.status)) {
      const charge = parseFloat(assignment.totalCharge || '0');
      const surcharges = parseFloat(assignment.totalSurcharges || '0');
      
      if (isFinite(charge)) totalDriverCharges += charge;
      if (isFinite(surcharges)) totalDriverSurcharges += surcharges;
    }
  }
  
  return {
    totalDriverCharges: Math.round(totalDriverCharges * 100) / 100,
    totalDriverSurcharges: Math.round(totalDriverSurcharges * 100) / 100,
  };
}
