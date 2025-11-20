import { describe, it, expect } from 'vitest';
import { calculateContractDriverCosts } from '../../server/utils/driverCostCalculator';

describe('Driver Cost Calculator', () => {
  describe('calculateContractDriverCosts - Basic Calculations', () => {
    it('should return 0 for empty assignments array', () => {
      const result = calculateContractDriverCosts([]);
      
      expect(result.totalDriverCharges).toBe(0);
      expect(result.totalDriverSurcharges).toBe(0);
      expect(result.totalDriverVat).toBe(0);
    });

    it('should calculate single assignment cost', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: '500.00',
        totalSurcharges: '50.00',
        vatAmount: '27.50',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(500);
      expect(result.totalDriverSurcharges).toBe(50);
      expect(result.totalDriverVat).toBe(27.50);
    });

    it('should calculate multiple assignments cost', () => {
      const assignments = [
        {
          id: 'assign1',
          status: 'completed',
          totalCharge: '500.00',
          totalSurcharges: '50.00',
          vatAmount: '27.50',
        },
        {
          id: 'assign2',
          status: 'active',
          totalCharge: '300.00',
          totalSurcharges: '30.00',
          vatAmount: '16.50',
        },
        {
          id: 'assign3',
          status: 'scheduled',
          totalCharge: '450.00',
          totalSurcharges: '45.00',
          vatAmount: '24.75',
        },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(1250); // 500 + 300 + 450
      expect(result.totalDriverSurcharges).toBe(125); // 50 + 30 + 45
      expect(result.totalDriverVat).toBe(68.75); // 27.50 + 16.50 + 24.75
    });
  });

  describe('Status Filtering', () => {
    it('should only include scheduled, active, and completed assignments', () => {
      const assignments = [
        {
          id: 'assign1',
          status: 'completed',
          totalCharge: '500.00',
          totalSurcharges: '50.00',
          vatAmount: '27.50',
        },
        {
          id: 'assign2',
          status: 'cancelled',
          totalCharge: '300.00',
          totalSurcharges: '30.00',
          vatAmount: '16.50',
        },
        {
          id: 'assign3',
          status: 'active',
          totalCharge: '450.00',
          totalSurcharges: '45.00',
          vatAmount: '24.75',
        },
        {
          id: 'assign4',
          status: 'void',
          totalCharge: '200.00',
          totalSurcharges: '20.00',
          vatAmount: '11.00',
        },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      // Should only include completed and active (not cancelled or void)
      expect(result.totalDriverCharges).toBe(950); // 500 + 450
      expect(result.totalDriverSurcharges).toBe(95); // 50 + 45
      expect(result.totalDriverVat).toBe(52.25); // 27.50 + 24.75
    });

    it('should include scheduled status assignments', () => {
      const assignments = [{
        id: 'assign1',
        status: 'scheduled',
        totalCharge: '600.00',
        totalSurcharges: '60.00',
        vatAmount: '33.00',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(600);
      expect(result.totalDriverSurcharges).toBe(60);
      expect(result.totalDriverVat).toBe(33);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing numeric fields (default to 0)', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        // Missing totalCharge, totalSurcharges, vatAmount
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(0);
      expect(result.totalDriverSurcharges).toBe(0);
      expect(result.totalDriverVat).toBe(0);
    });

    it('should handle null/undefined numeric values', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: null,
        totalSurcharges: undefined,
        vatAmount: null,
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(0);
      expect(result.totalDriverSurcharges).toBe(0);
      expect(result.totalDriverVat).toBe(0);
    });

    it('should handle invalid numeric strings', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: 'invalid',
        totalSurcharges: 'abc',
        vatAmount: 'xyz',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(0);
      expect(result.totalDriverSurcharges).toBe(0);
      expect(result.totalDriverVat).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: '333.333',
        totalSurcharges: '33.333',
        vatAmount: '18.333',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(333.33);
      expect(result.totalDriverSurcharges).toBe(33.33);
      expect(result.totalDriverVat).toBe(18.33);
    });

    it('should handle very large numbers', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: '99999.99',
        totalSurcharges: '9999.99',
        vatAmount: '5499.99',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(99999.99);
      expect(result.totalDriverSurcharges).toBe(9999.99);
      expect(result.totalDriverVat).toBe(5499.99);
    });

    it('should handle zero values', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: '0',
        totalSurcharges: '0',
        vatAmount: '0',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(0);
      expect(result.totalDriverSurcharges).toBe(0);
      expect(result.totalDriverVat).toBe(0);
    });

    it('should handle negative values (though not realistic)', () => {
      const assignments = [{
        id: 'assign1',
        status: 'completed',
        totalCharge: '-100',
        totalSurcharges: '-10',
        vatAmount: '-5.50',
      }];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(-100);
      expect(result.totalDriverSurcharges).toBe(-10);
      expect(result.totalDriverVat).toBe(-5.50);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate 30-day contract with multiple driver assignments', () => {
      const assignments = [
        {
          id: 'assign1',
          status: 'completed',
          totalCharge: '12000.00',
          totalSurcharges: '600.00',
          vatAmount: '630.00',
        },
        {
          id: 'assign2',
          status: 'completed',
          totalCharge: '9000.00',
          totalSurcharges: '450.00',
          vatAmount: '472.50',
        },
        {
          id: 'assign3',
          status: 'active',
          totalCharge: '3500.00',
          totalSurcharges: '175.00',
          vatAmount: '183.75',
        },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(24500); // 12000 + 9000 + 3500
      expect(result.totalDriverSurcharges).toBe(1225); // 600 + 450 + 175
      expect(result.totalDriverVat).toBe(1286.25); // 630 + 472.50 + 183.75
    });

    it('should exclude cancelled assignments from total', () => {
      const assignments = [
        {
          id: 'assign1',
          status: 'completed',
          totalCharge: '5000.00',
          totalSurcharges: '500.00',
          vatAmount: '275.00',
        },
        {
          id: 'assign2',
          status: 'cancelled',
          totalCharge: '3000.00',
          totalSurcharges: '300.00',
          vatAmount: '165.00',
        },
        {
          id: 'assign3',
          status: 'active',
          totalCharge: '4000.00',
          totalSurcharges: '400.00',
          vatAmount: '220.00',
        },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(9000); // Only completed + active
      expect(result.totalDriverSurcharges).toBe(900);
      expect(result.totalDriverVat).toBe(495);
    });

    it('should handle mix of completed, active, scheduled, and cancelled', () => {
      const assignments = [
        { id: '1', status: 'completed', totalCharge: '1000', totalSurcharges: '100', vatAmount: '55' },
        { id: '2', status: 'active', totalCharge: '2000', totalSurcharges: '200', vatAmount: '110' },
        { id: '3', status: 'scheduled', totalCharge: '1500', totalSurcharges: '150', vatAmount: '82.50' },
        { id: '4', status: 'cancelled', totalCharge: '500', totalSurcharges: '50', vatAmount: '27.50' },
        { id: '5', status: 'void', totalCharge: '300', totalSurcharges: '30', vatAmount: '16.50' },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      // Should include completed, active, scheduled (not cancelled or void)
      expect(result.totalDriverCharges).toBe(4500); // 1000 + 2000 + 1500
      expect(result.totalDriverSurcharges).toBe(450); // 100 + 200 + 150
      expect(result.totalDriverVat).toBe(247.50); // 55 + 110 + 82.50
    });
  });

  describe('Decimal Precision', () => {
    it('should handle complex decimal calculations and round correctly', () => {
      const assignments = [
        {
          id: 'assign1',
          status: 'completed',
          totalCharge: '333.336', // Should round to 333.34
          totalSurcharges: '33.336', // Should round to 33.34
          vatAmount: '18.336', // Should round to 18.34
        },
        {
          id: 'assign2',
          status: 'active',
          totalCharge: '666.664', // Should round to 666.66
          totalSurcharges: '66.664', // Should round to 66.66
          vatAmount: '36.664', // Should round to 36.66
        },
      ];
      
      const result = calculateContractDriverCosts(assignments);
      
      expect(result.totalDriverCharges).toBe(1000); // 333.34 + 666.66
      expect(result.totalDriverSurcharges).toBe(100); // 33.34 + 66.66
      expect(result.totalDriverVat).toBe(55); // 18.34 + 36.66
    });
  });
});
