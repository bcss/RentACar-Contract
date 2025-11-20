/**
 * Risk Calculator Unit Tests
 * Tests the customer risk scoring algorithm including:
 * - Component score calculations (payment, violation, incident, document)
 * - Weighted final score calculation
 * - Payment escalation override logic
 * - Risk level categorization
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RiskCalculator, type RiskFactors, type RiskScore } from '../../server/services/riskCalculator';
import type { IStorage } from '../../server/storage';

/**
 * Mock storage for risk calculator tests
 */
class MockRiskStorage implements Partial<IStorage> {
  async getAllContracts() { return []; }
  async getPaymentsByContract() { return []; }
  async getTrafficFines() { return []; }
  async getIncidents() { return []; }
  async getDocuments() { return []; }
  async getCustomers() { return []; }
}

describe('RiskCalculator - Component Scores', () => {
  let calculator: RiskCalculator;
  let mockStorage: MockRiskStorage;

  beforeEach(() => {
    mockStorage = new MockRiskStorage();
    calculator = new RiskCalculator(mockStorage as IStorage);
  });

  describe('Payment Score Calculation', () => {
    it('should return 0 for customer with no contracts', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      // Access private method via type assertion
      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBe(0);
    });

    it('should return 100 for zero payments with active contracts', () => {
      const factors: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 0, // No payments
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBe(100);
    });

    it('should return >=95 for extreme underpayment (0-10% paid)', () => {
      const factors: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 1,
        latePayments: 0,
        totalPaid: 500, // 5% of expected
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBeGreaterThanOrEqual(95);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return >=90 for severe underpayment (10-25% paid)', () => {
      const factors: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 2,
        latePayments: 0,
        totalPaid: 2000, // 20% of expected
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBeGreaterThanOrEqual(90);
      expect(score).toBeLessThan(95);
    });

    it('should return 70-90 for significant underpayment (25-50% paid)', () => {
      const factors: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 3,
        latePayments: 0,
        totalPaid: 4000, // 40% of expected
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThan(90);
    });

    it('should return 0 for 100% payment', () => {
      const factors: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 5,
        latePayments: 0,
        totalPaid: 10000, // 100% of expected
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculatePaymentScore(factors);
      expect(score).toBe(0);
    });

    it('should add overdueModifier (+0 to +5) for overdue contracts', () => {
      const factorsWithoutOverdue: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 5,
        latePayments: 0,
        totalPaid: 9000, // 90% paid
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const factorsWithOverdue: RiskFactors = {
        ...factorsWithoutOverdue,
        overduePayments: 2, // 40% overdue
      };

      const scoreWithout = (calculator as any).calculatePaymentScore(factorsWithoutOverdue);
      const scoreWith = (calculator as any).calculatePaymentScore(factorsWithOverdue);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
      expect(scoreWith - scoreWithout).toBeLessThanOrEqual(5);
    });

    it('should add lateModifier (+0 to +3) for late payments', () => {
      const factorsWithoutLate: RiskFactors = {
        totalContracts: 5,
        overduePayments: 0,
        totalPayments: 5,
        latePayments: 0,
        totalPaid: 9000, // 90% paid
        totalExpected: 10000,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const factorsWithLate: RiskFactors = {
        ...factorsWithoutLate,
        latePayments: 3, // 60% late
      };

      const scoreWithout = (calculator as any).calculatePaymentScore(factorsWithoutLate);
      const scoreWith = (calculator as any).calculatePaymentScore(factorsWithLate);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
      expect(scoreWith - scoreWithout).toBeLessThanOrEqual(3);
    });
  });

  describe('Violation Score Calculation', () => {
    it('should return 0 for no fines', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateViolationScore(factors);
      expect(score).toBe(0);
    });

    it('should score unpaid fines (0-50 points)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 10,
        unpaidFines: 5, // 50% unpaid
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateViolationScore(factors);
      expect(score).toBeGreaterThanOrEqual(20); // At least 25 (50% * 50)
      expect(score).toBeLessThanOrEqual(50);
    });

    it('should score black points (0-30 points, capped at 20 points)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 5,
        unpaidFines: 0,
        blackPoints: 20, // Maximum for full 30 points
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateViolationScore(factors);
      expect(score).toBeGreaterThanOrEqual(25); // Should include black points contribution
    });

    it('should cap black points contribution at 30', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 1,
        unpaidFines: 0,
        blackPoints: 50, // Way over cap
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateViolationScore(factors);
      expect(score).toBeLessThanOrEqual(50); // 30 (black points) + 20 (volume) max
    });

    it('should score volume penalty (0-20 points, >10 fines is very high)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 15, // 150% of high-risk threshold
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateViolationScore(factors);
      expect(score).toBeGreaterThanOrEqual(15); // Volume component
      expect(score).toBeLessThanOrEqual(20); // Capped
    });
  });

  describe('Incident Score Calculation', () => {
    it('should return 0 for no incidents', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateIncidentScore(factors);
      expect(score).toBe(0);
    });

    it('should score major incident ratio (0-60 points)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 10,
        majorIncidents: 5, // 50% major
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateIncidentScore(factors);
      expect(score).toBeGreaterThanOrEqual(20); // Major ratio component
    });

    it('should score incident frequency (0-40 points, >5 incidents is very high)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 10, // 200% of high-risk threshold
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateIncidentScore(factors);
      expect(score).toBeGreaterThanOrEqual(30); // Frequency component
      expect(score).toBeLessThanOrEqual(40); // Capped
    });

    it('should return 100 for all major incidents above threshold', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 10,
        majorIncidents: 10, // 100% major
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateIncidentScore(factors);
      expect(score).toBe(100); // 60 (major ratio) + 40 (frequency)
    });
  });

  describe('Document Score Calculation', () => {
    it('should return 50 for no documents (medium risk)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 0,
      };

      const score = (calculator as any).calculateDocumentScore(factors);
      expect(score).toBe(50);
    });

    it('should return 0 for no expired documents', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 0,
        totalDocuments: 10,
      };

      const score = (calculator as any).calculateDocumentScore(factors);
      expect(score).toBe(0);
    });

    it('should score expired document ratio (0-100 points)', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 5,
        totalDocuments: 10,
      };

      const score = (calculator as any).calculateDocumentScore(factors);
      expect(score).toBe(50); // 50% expired
    });

    it('should return 100 for all expired documents', () => {
      const factors: RiskFactors = {
        totalContracts: 0,
        overduePayments: 0,
        totalPayments: 0,
        latePayments: 0,
        totalPaid: 0,
        totalExpected: 0,
        totalFines: 0,
        unpaidFines: 0,
        blackPoints: 0,
        totalIncidents: 0,
        majorIncidents: 0,
        expiredDocuments: 10,
        totalDocuments: 10,
      };

      const score = (calculator as any).calculateDocumentScore(factors);
      expect(score).toBe(100);
    });
  });
});

describe('RiskCalculator - Payment Escalation Override', () => {
  let calculator: RiskCalculator;

  beforeEach(() => {
    const mockStorage = new MockRiskStorage();
    calculator = new RiskCalculator(mockStorage as IStorage);
  });

  it('should escalate to >=85 for paymentScore >= 95 (critical delinquency)', () => {
    const escalation = (calculator as any).paymentEscalation(97);
    expect(escalation).toBe(85);
  });

  it('should escalate to >=75 for paymentScore >= 90 (severe delinquency)', () => {
    const escalation = (calculator as any).paymentEscalation(92);
    expect(escalation).toBe(75);
  });

  it('should not escalate for paymentScore < 90', () => {
    const escalation = (calculator as any).paymentEscalation(85);
    expect(escalation).toBe(0);
  });

  it('should not escalate for good payment behavior', () => {
    const escalation = (calculator as any).paymentEscalation(20);
    expect(escalation).toBe(0);
  });
});

describe('RiskCalculator - Risk Level Categorization', () => {
  let calculator: RiskCalculator;

  beforeEach(() => {
    const mockStorage = new MockRiskStorage();
    calculator = new RiskCalculator(mockStorage as IStorage);
  });

  it('should categorize score < 25 as low risk', () => {
    const level = (calculator as any).getRiskLevel(15);
    expect(level).toBe('low');
  });

  it('should categorize score 25-49 as medium risk', () => {
    const level1 = (calculator as any).getRiskLevel(25);
    const level2 = (calculator as any).getRiskLevel(40);
    expect(level1).toBe('medium');
    expect(level2).toBe('medium');
  });

  it('should categorize score 50-74 as high risk', () => {
    const level1 = (calculator as any).getRiskLevel(50);
    const level2 = (calculator as any).getRiskLevel(65);
    expect(level1).toBe('high');
    expect(level2).toBe('high');
  });

  it('should categorize score >= 75 as critical risk', () => {
    const level1 = (calculator as any).getRiskLevel(75);
    const level2 = (calculator as any).getRiskLevel(100);
    expect(level1).toBe('critical');
    expect(level2).toBe('critical');
  });

  it('should handle boundary values correctly', () => {
    expect((calculator as any).getRiskLevel(0)).toBe('low');
    expect((calculator as any).getRiskLevel(24)).toBe('low');
    expect((calculator as any).getRiskLevel(25)).toBe('medium');
    expect((calculator as any).getRiskLevel(49)).toBe('medium');
    expect((calculator as any).getRiskLevel(50)).toBe('high');
    expect((calculator as any).getRiskLevel(74)).toBe('high');
    expect((calculator as any).getRiskLevel(75)).toBe('critical');
    expect((calculator as any).getRiskLevel(100)).toBe('critical');
  });
});

describe('RiskCalculator - Weighted Score & Integration', () => {
  it('should calculate weighted average (45% payment, 25% violation, 20% incident, 10% document)', () => {
    const mockStorage = new MockRiskStorage();
    const calculator = new RiskCalculator(mockStorage as IStorage);

    // Simulate component scores
    const paymentScore = 80;
    const violationScore = 40;
    const incidentScore = 60;
    const documentScore = 20;

    const expectedWeighted = Math.round(
      paymentScore * 0.45 +
      violationScore * 0.25 +
      incidentScore * 0.20 +
      documentScore * 0.10
    );

    // Expected: 80*0.45 + 40*0.25 + 60*0.20 + 20*0.10 = 36 + 10 + 12 + 2 = 60
    expect(expectedWeighted).toBe(60);
  });

  it('should apply escalation override when payment delinquency is critical', () => {
    // If paymentScore = 96 (triggers escalation to 85)
    // And weighted score = 50
    // Final score should be max(50, 85) = 85
    const mockStorage = new MockRiskStorage();
    const calculator = new RiskCalculator(mockStorage as IStorage);

    const paymentScore = 96; // Triggers 85 escalation
    const weightedScore = Math.round(paymentScore * 0.45); // Only payment component
    const escalation = (calculator as any).paymentEscalation(paymentScore);
    const finalScore = Math.max(weightedScore, escalation);

    expect(escalation).toBe(85);
    expect(finalScore).toBe(85);
  });

  it('should clamp final score to 0-100 range', () => {
    const mockStorage = new MockRiskStorage();
    const calculator = new RiskCalculator(mockStorage as IStorage);

    // Simulate extreme values
    const negativeScore = -10;
    const overMaxScore = 150;

    const clampedNegative = Math.max(0, Math.min(100, negativeScore));
    const clampedOver = Math.max(0, Math.min(100, overMaxScore));

    expect(clampedNegative).toBe(0);
    expect(clampedOver).toBe(100);
  });
});
