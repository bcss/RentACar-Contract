/**
 * Customer Risk Calculator Service
 * 
 * Implements weighted risk scoring formula:
 * - Payment History: 45% (overdue payments, late payments)
 * - Traffic Violations: 25% (fines, black points)
 * - Incidents: 20% (accidents, insurance claims)
 * - Document Compliance: 10% (expired documents, missing docs)
 * 
 * Risk Levels:
 * - Low: 0-24 (Green)
 * - Medium: 25-49 (Yellow)
 * - High: 50-74 (Orange)
 * - Critical: 75-100 (Red)
 */

import type { IStorage } from "../storage";

export interface RiskScore {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  paymentScore: number;
  violationScore: number;
  incidentScore: number;
  documentScore: number;
}

export interface RiskFactors {
  totalContracts: number;
  overduePayments: number;
  totalPayments: number;
  latePayments: number;
  totalPaid: number; // Total amount paid
  totalExpected: number; // Total amount expected from contracts
  totalFines: number;
  unpaidFines: number;
  blackPoints: number;
  totalIncidents: number;
  majorIncidents: number;
  expiredDocuments: number;
  totalDocuments: number;
}

export class RiskCalculator {
  constructor(private storage: IStorage) {}

  /**
   * Calculate comprehensive risk score for a customer
   */
  /**
   * Payment escalation override for critical payment delinquency
   * Ensures severe underpayment reaches critical thresholds despite weighting
   * 
   * @param paymentScore The calculated payment score (0-100)
   * @returns Escalated final score if payment delinquency is severe, else 0
   */
  private paymentEscalation(paymentScore: number): number {
    if (paymentScore >= 95) {
      // Critical payment delinquency (0-10% paid) → force critical threshold
      return 85; // Ensures final score ≥85 (critical)
    } else if (paymentScore >= 90) {
      // Severe payment delinquency (10-25% paid) → force high threshold
      return 75; // Ensures final score ≥75 (high)
    }
    return 0; // No escalation needed
  }

  /**
   * Calculate customer risk score using hybrid override scoring
   * 
   * Process:
   * 1. Calculates component scores (0-100 each) for payment, violations, incidents, documents
   * 2. Computes base weighted score (45% payment, 25% violations, 20% incidents, 10% documents)
   * 3. Applies payment escalation override for severe payment delinquency
   * 4. Returns max(weightedScore, paymentEscalation)
   * 
   * This ensures severe payment issues reach critical thresholds while maintaining
   * 0-100 component score ranges for UI compatibility.
   */
  async calculateCustomerRisk(customerId: string): Promise<RiskScore> {
    const factors = await this.gatherRiskFactors(customerId);
    
    // Calculate component scores (0-100 each)
    const paymentScore = this.calculatePaymentScore(factors);
    const violationScore = this.calculateViolationScore(factors);
    const incidentScore = this.calculateIncidentScore(factors);
    const documentScore = this.calculateDocumentScore(factors);

    // Base weighted score (45% payment, 25% violations, 20% incidents, 10% documents)
    const weightedScore = Math.round(
      paymentScore * 0.45 +
      violationScore * 0.25 +
      incidentScore * 0.20 +
      documentScore * 0.10
    );

    // Hybrid override: escalate for critical payment delinquency
    const escalationScore = this.paymentEscalation(paymentScore);
    const finalScore = Math.max(weightedScore, escalationScore);

    // Clamp to 0-100 range
    const score = Math.max(0, Math.min(100, finalScore));

    return {
      score,
      level: this.getRiskLevel(score),
      paymentScore: Math.round(paymentScore),
      violationScore: Math.round(violationScore),
      incidentScore: Math.round(incidentScore),
      documentScore: Math.round(documentScore),
    };
  }

  /**
   * Gather all risk-related data for a customer
   */
  private async gatherRiskFactors(customerId: string): Promise<RiskFactors> {
    // Get customer contracts
    const contracts = await this.storage.getAllContracts();
    const customerContracts = contracts.filter(c => c.customerId === customerId);

    // Get all payments for customer contracts
    const contractIds = customerContracts.map(c => c.id);
    const paymentPromises = contractIds.map(contractId => 
      this.storage.getPaymentsByContract(contractId)
    );
    const paymentArrays = await Promise.all(paymentPromises);
    const customerPayments = paymentArrays.flat();

    // Calculate payment metrics using heuristic approach
    // NOTE: This is an interim approach until payment_schedules table is implemented
    // We assess payment health by comparing total payments to contract totals
    const now = new Date();
    
    // Calculate total amount paid for this customer
    const totalPaid = customerPayments.reduce((sum, p) => 
      sum + parseFloat(p.amount || '0'), 0
    );
    
    // Calculate expected total from contracts
    const totalExpected = customerContracts.reduce((sum, c) => 
      sum + parseFloat(c.totalAmount || '0'), 0
    );
    
    // Count contracts that are overdue (ended 30+ days ago with underpayment)
    const overdueContracts = customerContracts.filter(c => {
      const endDate = new Date(c.rentalEndDate);
      const daysSinceEnd = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceEnd > 30 && c.status === 'active') {
        // Contract should have been closed/completed but is still active
        return true;
      }
      
      return false;
    }).length;
    
    // Heuristic for late payments: contracts closed with payment gap
    const latePayments = customerContracts.filter(c => {
      if (c.status === 'closed' || c.status === 'completed') {
        // Check if there was a payment gap (simplified heuristic)
        const contractPayments = customerPayments.filter(p => p.contractId === c.id);
        const paid = contractPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
        const expected = parseFloat(c.totalAmount || '0');
        
        // If paid significantly less than expected, consider it a late payment scenario
        return paid < expected * 0.95; // 5% tolerance
      }
      return false;
    }).length;

    // Get traffic fines for customer
    const customerFines = await this.storage.getTrafficFines({ customerId });
    const unpaidFines = customerFines.filter(f => f.paymentStatus === "unpaid").length;
    const blackPoints = customerFines.reduce((sum, f) => sum + (f.blackPoints || 0), 0);

    // Get incidents for customer
    const customerIncidents = await this.storage.getIncidents({ customerId });
    const majorIncidents = customerIncidents.filter(i => 
      i.severity === "major" || i.severity === "critical"
    ).length;

    // Get document compliance
    const customerDocuments = await this.storage.getDocuments({
      entityType: "customer",
      entityId: customerId
    });
    const expiredDocuments = customerDocuments.filter(d => 
      d.expiryDate && new Date(d.expiryDate) < now
    ).length;

    return {
      totalContracts: customerContracts.length,
      overduePayments: overdueContracts,
      totalPayments: customerPayments.length,
      latePayments,
      totalPaid,
      totalExpected,
      totalFines: customerFines.length,
      unpaidFines,
      blackPoints,
      totalIncidents: customerIncidents.length,
      majorIncidents,
      expiredDocuments,
      totalDocuments: customerDocuments.length,
    };
  }

  /**
   * Calculate payment-related risk score (0-100)
   * Higher score = worse payment behavior
   * 
   * Uses calibrated non-linear curve to heavily penalize underpayment:
   * - Zero payments with active contracts = 100
   * - 0-10% paid: ≥95 (triggers critical escalation in final score)
   * - 10-25% paid: ≥90 (triggers high escalation in final score)
   * - Returns BOUNDED 0-100 for UI compatibility
   */
  private calculatePaymentScore(factors: RiskFactors): number {
    // Edge case: No contracts = no payment risk
    if (factors.totalContracts === 0) return 0;
    
    // Zero payments with active contracts = maximum score
    if (factors.totalPayments === 0) {
      return 100; // Will trigger critical escalation in calculateFinalScore()
    }

    // PRIMARY RISK INDICATOR: Calibrated non-linear underpayment curve (0-100 points)
    // Heavily penalizes <25% payment ratios to enable escalation triggers
    let underpaymentScore = 0;
    if (factors.totalExpected > 0) {
      const paidRatio = factors.totalPaid / factors.totalExpected;
      if (paidRatio < 1.0) {
        // Calibrated curve for underpayment severity:
        // 0-10% paid: 95-100 points → triggers critical escalation (≥95)
        // 10-25% paid: 90-95 points → triggers high escalation (≥90)
        // 25-50% paid: 70-90 points → medium risk
        // 50-75% paid: 40-70 points → low-medium risk
        // 75-100% paid: 0-40 points → low risk
        
        if (paidRatio < 0.10) {
          // Extreme underpayment: 95-100 points (critical threshold)
          underpaymentScore = 95 + (1 - paidRatio) * 50; // 0% paid = 100, 10% paid = 95
        } else if (paidRatio < 0.25) {
          // Severe underpayment: 90-95 points (high threshold)
          underpaymentScore = 90 + ((0.25 - paidRatio) / 0.15) * 5;
        } else if (paidRatio < 0.50) {
          // Significant underpayment: 70-90 points
          underpaymentScore = 70 + ((0.50 - paidRatio) / 0.25) * 20;
        } else if (paidRatio < 0.75) {
          // Moderate underpayment: 40-70 points
          underpaymentScore = 40 + ((0.75 - paidRatio) / 0.25) * 30;
        } else {
          // Minor underpayment: 0-40 points
          underpaymentScore = (1 - paidRatio) * 160; // Linear for minor cases
        }
      }
    }

    // Overdue contracts modifier (+0 to +5 points)
    // Supplements underpayment score for customers with overdue contracts
    let overdueModifier = 0;
    if (factors.totalContracts > 0 && factors.overduePayments > 0) {
      const overdueRatio = Math.min(1, factors.overduePayments / factors.totalContracts);
      overdueModifier = overdueRatio * 5;
    }

    // Late payment pattern modifier (+0 to +3 points)
    // Minor adjustment for customers who pay late but eventually pay
    let lateModifier = 0;
    if (factors.totalContracts > 0 && factors.latePayments > 0) {
      const lateRatio = Math.min(1, factors.latePayments / factors.totalContracts);
      lateModifier = lateRatio * 3;
    }

    // BOUNDED 0-100 for UI compatibility
    // Escalation logic is handled in calculateFinalScore()
    const finalScore = underpaymentScore + overdueModifier + lateModifier;
    return Math.min(100, Math.round(finalScore));
  }

  /**
   * Calculate traffic violation risk score (0-100)
   * Higher score = more/worse violations
   */
  private calculateViolationScore(factors: RiskFactors): number {
    if (factors.totalFines === 0) return 0;

    // Unpaid fines penalty (0-50 points)
    const unpaidRatio = factors.unpaidFines / factors.totalFines;
    const unpaidScore = unpaidRatio * 50;

    // Black points penalty (0-30 points, capped at 20 black points)
    const blackPointScore = Math.min(30, (factors.blackPoints / 20) * 30);

    // Volume penalty (0-20 points, >10 fines is very high risk)
    const volumeScore = Math.min(20, (factors.totalFines / 10) * 20);

    return unpaidScore + blackPointScore + volumeScore;
  }

  /**
   * Calculate incident-related risk score (0-100)
   * Higher score = more/worse incidents
   */
  private calculateIncidentScore(factors: RiskFactors): number {
    if (factors.totalIncidents === 0) return 0;

    // Major incident ratio (0-60 points)
    const majorRatio = factors.majorIncidents / factors.totalIncidents;
    const majorScore = majorRatio * 60;

    // Incident frequency penalty (0-40 points, >5 incidents is very high risk)
    const frequencyScore = Math.min(40, (factors.totalIncidents / 5) * 40);

    return majorScore + frequencyScore;
  }

  /**
   * Calculate document compliance score (0-100)
   * Higher score = worse compliance
   */
  private calculateDocumentScore(factors: RiskFactors): number {
    if (factors.totalDocuments === 0) return 50; // No documents = medium risk

    // Expired document ratio (0-100 points)
    const expiredRatio = factors.expiredDocuments / factors.totalDocuments;
    const expiredScore = expiredRatio * 100;

    return expiredScore;
  }

  /**
   * Determine risk level based on score
   */
  private getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
    if (score < 25) return "low";
    if (score < 50) return "medium";
    if (score < 75) return "high";
    return "critical";
  }

  /**
   * Calculate risk scores for all customers
   */
  async calculateAllCustomerRisks(): Promise<Array<{ customerId: string; riskScore: RiskScore }>> {
    const customers = await this.storage.getCustomers();
    
    const results = await Promise.all(
      customers.map(async (customer) => ({
        customerId: customer.id,
        riskScore: await this.calculateCustomerRisk(customer.id),
      }))
    );

    return results;
  }

  /**
   * Get high-risk customers (score >= 50)
   */
  async getHighRiskCustomers(): Promise<Array<{ customerId: string; riskScore: RiskScore }>> {
    const allRisks = await this.calculateAllCustomerRisks();
    return allRisks.filter(r => r.riskScore.score >= 50);
  }
}
