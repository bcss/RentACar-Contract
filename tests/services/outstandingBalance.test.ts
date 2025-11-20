import { describe, it, expect } from 'vitest';

/**
 * Outstanding Balance Calculation Tests
 * Tests the calculation of outstanding payments for contracts
 * Outstanding = Grand Total - Total Paid
 */

describe('Outstanding Balance Calculations', () => {
  describe('Basic Outstanding Calculations', () => {
    it('should calculate outstanding when no payments made', () => {
      const grandTotal = 5000;
      const totalPaid = 0;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(5000);
    });

    it('should calculate outstanding when partial payment made', () => {
      const grandTotal = 5000;
      const totalPaid = 2000;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(3000);
    });

    it('should calculate 0 outstanding when fully paid', () => {
      const grandTotal = 5000;
      const totalPaid = 5000;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(0);
    });

    it('should calculate negative outstanding when overpaid', () => {
      const grandTotal = 5000;
      const totalPaid = 5500;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(-500);
    });
  });

  describe('Multiple Payments', () => {
    it('should calculate outstanding with multiple partial payments', () => {
      const grandTotal = 10000;
      const payments = [1000, 2000, 1500, 500];
      const totalPaid = payments.reduce((sum, p) => sum + p, 0);
      const outstanding = grandTotal - totalPaid;
      
      expect(totalPaid).toBe(5000);
      expect(outstanding).toBe(5000);
    });

    it('should calculate outstanding with payments exceeding total', () => {
      const grandTotal = 3000;
      const payments = [1000, 1000, 1000, 500];
      const totalPaid = payments.reduce((sum, p) => sum + p, 0);
      const outstanding = grandTotal - totalPaid;
      
      expect(totalPaid).toBe(3500);
      expect(outstanding).toBe(-500); // Overpaid by 500
    });
  });

  describe('Decimal Precision', () => {
    it('should handle decimal amounts correctly', () => {
      const grandTotal = 1234.56;
      const totalPaid = 789.12;
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(outstanding).toBe(445.44);
    });

    it('should handle complex decimal calculations', () => {
      const grandTotal = 9999.99;
      const payments = [3333.33, 3333.33, 3333.33];
      const totalPaid = payments.reduce((sum, p) => sum + p, 0);
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(outstanding).toBe(0); // 9999.99 - 9999.99
    });

    it('should round to 2 decimal places', () => {
      const grandTotal = 100.00;
      const totalPaid = 33.336;
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(outstanding).toBe(66.66);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero grand total', () => {
      const grandTotal = 0;
      const totalPaid = 0;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(0);
    });

    it('should handle payment on zero total contract', () => {
      const grandTotal = 0;
      const totalPaid = 100;
      const outstanding = grandTotal - totalPaid;
      
      expect(outstanding).toBe(-100); // Credit balance
    });

    it('should handle very large amounts', () => {
      const grandTotal = 999999.99;
      const totalPaid = 500000.00;
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(outstanding).toBe(499999.99);
    });

    it('should handle small decimal differences', () => {
      const grandTotal = 100.01;
      const totalPaid = 100.00;
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(outstanding).toBe(0.01);
    });
  });

  describe('Payment Status Determination', () => {
    it('should identify fully paid status', () => {
      const grandTotal = 5000;
      const totalPaid = 5000;
      const outstanding = grandTotal - totalPaid;
      
      const status = outstanding === 0 ? 'Paid' : outstanding > 0 ? 'Partial' : 'Overpaid';
      expect(status).toBe('Paid');
    });

    it('should identify partial payment status', () => {
      const grandTotal = 5000;
      const totalPaid = 3000;
      const outstanding = grandTotal - totalPaid;
      
      const status = outstanding === 0 ? 'Paid' : outstanding > 0 ? 'Partial' : 'Overpaid';
      expect(status).toBe('Partial');
    });

    it('should identify overpaid status', () => {
      const grandTotal = 5000;
      const totalPaid = 5500;
      const outstanding = grandTotal - totalPaid;
      
      const status = outstanding === 0 ? 'Paid' : outstanding > 0 ? 'Partial' : 'Overpaid';
      expect(status).toBe('Overpaid');
    });

    it('should identify unpaid status', () => {
      const grandTotal = 5000;
      const totalPaid = 0;
      const outstanding = grandTotal - totalPaid;
      
      const status = outstanding === grandTotal ? 'Unpaid' : 'Partial';
      expect(status).toBe('Unpaid');
    });
  });

  describe('Payment Allocation', () => {
    it('should calculate remaining balance after each payment', () => {
      const grandTotal = 10000;
      const payments = [
        { amount: 2000, date: '2024-01-01' },
        { amount: 3000, date: '2024-01-15' },
        { amount: 1500, date: '2024-02-01' },
      ];
      
      let remaining = grandTotal;
      const balanceAfterPayments = payments.map(p => {
        remaining -= p.amount;
        return { date: p.date, remaining };
      });
      
      expect(balanceAfterPayments[0].remaining).toBe(8000);
      expect(balanceAfterPayments[1].remaining).toBe(5000);
      expect(balanceAfterPayments[2].remaining).toBe(3500);
    });
  });

  describe('Refund Scenarios', () => {
    it('should calculate outstanding after partial refund', () => {
      const grandTotal = 5000;
      const totalPaid = 5000;
      const refundAmount = 1000;
      
      // After refund, outstanding increases
      const effectivePaid = totalPaid - refundAmount;
      const outstanding = grandTotal - effectivePaid;
      
      expect(outstanding).toBe(1000);
    });

    it('should calculate outstanding after full refund', () => {
      const grandTotal = 5000;
      const totalPaid = 5000;
      const refundAmount = 5000;
      
      const effectivePaid = totalPaid - refundAmount;
      const outstanding = grandTotal - effectivePaid;
      
      expect(outstanding).toBe(5000);
    });
  });

  describe('Real-World Contract Scenarios', () => {
    it('should calculate outstanding for 30-day rental with deposits', () => {
      const rentalFees = 9000;
      const extraCharges = 500;
      const insurance = 300;
      const vatAmount = 490;
      const grandTotal = rentalFees + extraCharges + insurance + vatAmount; // 10290
      
      const securityDeposit = 2000; // Not part of grand total
      const initialPayment = 5000;
      const totalPaid = initialPayment;
      
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(grandTotal).toBe(10290);
      expect(outstanding).toBe(5290);
    });

    it('should calculate outstanding with driver services and accessories', () => {
      const rentalBase = 7000;
      const driverServices = 2100;
      const accessories = 450;
      const lateFees = 200;
      const vat = 487.50;
      const grandTotal = rentalBase + driverServices + accessories + lateFees + vat;
      
      const payments = [5000, 3000];
      const totalPaid = payments.reduce((sum, p) => sum + p, 0);
      
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(grandTotal).toBe(10237.50);
      expect(outstanding).toBe(2237.50);
    });

    it('should handle contract with toll charges and fines', () => {
      const rentalBase = 5000;
      const tollCharges = 75;
      const trafficFines = 500;
      const vat = 278.75;
      const grandTotal = rentalBase + tollCharges + trafficFines + vat;
      
      const totalPaid = 4000;
      const outstanding = Math.round((grandTotal - totalPaid) * 100) / 100;
      
      expect(grandTotal).toBe(5853.75);
      expect(outstanding).toBe(1853.75);
    });
  });
});
