import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateHourlySurcharge, calculateDailySurcharge, isNightShift, isWeekend } from '../../server/utils/surchargeCalculator';

// Mock database and company settings
vi.mock('../../server/db', () => ({
  db: {
    query: {
      companySettings: {
        findFirst: vi.fn().mockResolvedValue({
          driverNightShiftStartHour: '22',
          driverNightShiftEndHour: '06',
          driverNightSurchargeMultiplier: '1.5',
          driverWeekendSurchargeMultiplier: '1.3',
          driverHolidaySurchargeMultiplier: '2.0',
          driverServiceVatApplicable: true,
          vatPercentage: '5',
        }),
      },
      publicHolidays: {
        findFirst: vi.fn().mockResolvedValue(null), // No holidays by default
      },
    },
  },
}));

describe('Surcharge Calculator - Financial Integrity Tests', () => {
  describe('isNightShift', () => {
    it('should correctly identify night shift for cross-midnight hours (22:00-06:00)', () => {
      const nightStart = 22;
      const nightEnd = 6;

      // 23:00 should be night shift
      expect(isNightShift(new Date('2025-01-01T23:00:00'), nightStart, nightEnd)).toBe(true);
      
      // 03:00 should be night shift
      expect(isNightShift(new Date('2025-01-01T03:00:00'), nightStart, nightEnd)).toBe(true);
      
      // 12:00 should NOT be night shift
      expect(isNightShift(new Date('2025-01-01T12:00:00'), nightStart, nightEnd)).toBe(false);
      
      // 21:00 should NOT be night shift (before start)
      expect(isNightShift(new Date('2025-01-01T21:00:00'), nightStart, nightEnd)).toBe(false);
      
      // 07:00 should NOT be night shift (after end)
      expect(isNightShift(new Date('2025-01-01T07:00:00'), nightStart, nightEnd)).toBe(false);
    });

    it('should handle same-day night shifts', () => {
      const nightStart = 1;
      const nightEnd = 5;

      expect(isNightShift(new Date('2025-01-01T03:00:00'), nightStart, nightEnd)).toBe(true);
      expect(isNightShift(new Date('2025-01-01T00:30:00'), nightStart, nightEnd)).toBe(false);
      expect(isNightShift(new Date('2025-01-01T06:00:00'), nightStart, nightEnd)).toBe(false);
    });
  });

  describe('isWeekend - UAE Market Logic', () => {
    it('should identify Abu Dhabi weekend (Friday-Saturday)', () => {
      // Friday Jan 3, 2025
      const friday = new Date('2025-01-03');
      expect(isWeekend(friday, 'abu_dhabi')).toBe(true);
      
      // Saturday Jan 4, 2025
      const saturday = new Date('2025-01-04');
      expect(isWeekend(saturday, 'abu_dhabi')).toBe(true);
      
      // Sunday Jan 5, 2025
      const sunday = new Date('2025-01-05');
      expect(isWeekend(sunday, 'abu_dhabi')).toBe(false);
    });

    it('should identify Dubai weekend (Saturday-Sunday)', () => {
      // Friday Jan 3, 2025
      const friday = new Date('2025-01-03');
      expect(isWeekend(friday, 'dubai')).toBe(false);
      
      // Saturday Jan 4, 2025
      const saturday = new Date('2025-01-04');
      expect(isWeekend(saturday, 'dubai')).toBe(true);
      
      // Sunday Jan 5, 2025
      const sunday = new Date('2025-01-05');
      expect(isWeekend(sunday, 'dubai')).toBe(true);
    });
  });

  describe('calculateHourlySurcharge - Financial Formulas', () => {
    it('should calculate correct base charge for hourly service', async () => {
      const baseRate = 50; // AED 50/hour
      const startTime = new Date('2025-01-01T10:00:00'); // Wednesday 10 AM
      const endTime = new Date('2025-01-01T14:00:00'); // Wednesday 2 PM
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      // 4 hours * 50 AED = 200 AED base
      expect(result.baseCharge).toBe(200);
      expect(result.hours.total).toBe(4);
      
      // Regular weekday, no surcharges
      expect(result.nightSurcharge).toBe(0);
      expect(result.weekendSurcharge).toBe(0);
      expect(result.holidaySurcharge).toBe(0);
      
      // VAT 5%
      expect(result.vatAmount).toBe(10); // 200 * 0.05
      expect(result.totalAfterVat).toBe(210); // 200 + 10
    });

    it('should apply night surcharge correctly (1.5x multiplier)', async () => {
      const baseRate = 50;
      const startTime = new Date('2025-01-01T23:00:00'); // 11 PM
      const endTime = new Date('2025-01-02T03:00:00'); // 3 AM (4 hours, all night)
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      // Base: 4 hours * 50 = 200 AED
      expect(result.baseCharge).toBe(200);
      
      // All hours are night hours
      expect(result.hours.nightHours).toBeGreaterThan(3.9); // ~4 hours
      
      // Night surcharge: 200 * (1.5 - 1) = 100 AED
      expect(result.nightSurcharge).toBeGreaterThan(99);
      expect(result.nightSurcharge).toBeLessThan(101);
      
      // Total before VAT: 200 + 100 = 300
      expect(result.totalBeforeVat).toBeGreaterThan(299);
      expect(result.totalBeforeVat).toBeLessThan(301);
      
      // VAT: 300 * 0.05 = 15
      expect(result.vatAmount).toBeGreaterThan(14);
      expect(result.vatAmount).toBeLessThan(16);
      
      // Total: 315 AED
      expect(result.totalAfterVat).toBeGreaterThan(314);
      expect(result.totalAfterVat).toBeLessThan(316);
    });

    it('should apply weekend surcharge (1.3x multiplier)', async () => {
      const baseRate = 50;
      // Saturday in Dubai (weekend)
      const startTime = new Date('2025-01-04T10:00:00');
      const endTime = new Date('2025-01-04T14:00:00'); // 4 hours
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      // Base: 200 AED
      expect(result.baseCharge).toBe(200);
      
      // Weekend surcharge: 200 * (1.3 - 1) = 60 AED
      expect(result.weekendSurcharge).toBeCloseTo(60, 1);
      
      // Total before VAT: 260 AED
      expect(result.totalBeforeVat).toBe(260);
      
      // VAT: 13 AED
      expect(result.vatAmount).toBe(13);
      
      // Total: 273 AED
      expect(result.totalAfterVat).toBe(273);
    });
  });

  describe('calculateDailySurcharge - Financial Formulas', () => {
    it('should calculate correct base charge for daily service', async () => {
      const baseDailyRate = 200; // AED 200/day
      const startDate = new Date('2025-01-06'); // Monday
      const endDate = new Date('2025-01-09'); // Thursday (3 days)
      
      const result = await calculateDailySurcharge(baseDailyRate, startDate, endDate, 'dubai');
      
      // 3 days * 200 = 600 AED
      expect(result.baseCharge).toBe(600);
      
      // No weekends or holidays
      expect(result.weekendSurcharge).toBe(0);
      expect(result.holidaySurcharge).toBe(0);
      
      // VAT: 30 AED
      expect(result.vatAmount).toBe(30);
      
      // Total: 630 AED
      expect(result.totalAfterVat).toBe(630);
    });

    it('should calculate weekend surcharge for multi-day rental', async () => {
      const baseDailyRate = 200;
      // Fri-Sun (includes Sat-Sun weekend in Dubai)
      const startDate = new Date('2025-01-03'); // Friday
      const endDate = new Date('2025-01-06'); // Monday (3 days: Fri, Sat, Sun)
      
      const result = await calculateDailySurcharge(baseDailyRate, startDate, endDate, 'dubai');
      
      // 3 days base: 600 AED
      expect(result.baseCharge).toBe(600);
      
      // 2 weekend days (Sat, Sun) * 200 * (1.3 - 1) = 2 * 60 = 120 AED
      expect(result.weekendSurcharge).toBeCloseTo(120, 1);
      
      // Total before VAT: 720 AED
      expect(result.totalBeforeVat).toBe(720);
      
      // VAT: 36 AED
      expect(result.vatAmount).toBe(36);
      
      // Total: 756 AED
      expect(result.totalAfterVat).toBe(756);
    });
  });

  describe('Rounding and Precision', () => {
    it('should round to 2 decimal places correctly', async () => {
      const baseRate = 33.33; // Unusual rate to test rounding
      const startTime = new Date('2025-01-01T10:00:00');
      const endTime = new Date('2025-01-01T13:00:00'); // 3 hours
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      // Base: 99.99 AED (3 * 33.33)
      expect(result.baseCharge).toBeCloseTo(99.99, 2);
      
      // VAT should be close to expected value
      expect(result.vatAmount).toBeCloseTo(4.999, 2);
      expect(result.totalAfterVat).toBeCloseTo(104.989, 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle partial hour calculations correctly', async () => {
      const baseRate = 50;
      // 1.5 hours (90 minutes)
      const startTime = new Date('2025-01-01T10:00:00');
      const endTime = new Date('2025-01-01T11:30:00');
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      // 1.5 hours * 50 = 75 AED
      expect(result.baseCharge).toBe(75);
      expect(result.hours.total).toBe(1.5);
    });

    it('should handle zero-hour edge case', async () => {
      const baseRate = 50;
      const startTime = new Date('2025-01-01T10:00:00');
      const endTime = new Date('2025-01-01T10:00:00'); // Same time
      
      const result = await calculateHourlySurcharge(baseRate, startTime, endTime, 'dubai');
      
      expect(result.baseCharge).toBe(0);
      expect(result.totalAfterVat).toBe(0);
    });
  });
});
