/**
 * Payment Management Routes
 * 
 * Handles all payment-related operations including:
 * - Payment CRUD operations
 * - Legacy payment routes (deposit, final-payment, refund) for backward compatibility
 * - Payment validation and audit logging
 * - Payment notification triggers
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { insertPaymentSchema } from "../../shared/schema";
import { isAuthenticated, requireEditor, requireManagerOrAdmin, requireAdmin } from "../auth/localAuth";
import { createAuditLog } from "../utils/auditLogger";
import { validateFinancialInput } from "../utils/validation";
import { logSystemError } from "../utils/errorLogger";
import { triggerNotification } from "../services/notificationTrigger";

const router = Router();

/**
 * LEGACY PAYMENT ROUTES - Backward compatibility wrappers using new payments table
 * These routes maintain compatibility with existing frontend code
 * They create payment records in the payments table with appropriate types
 */

/**
 * POST /api/contracts/:id/deposit
 * Record deposit payment (Legacy route)
 */
router.post("/contracts/:id/deposit", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    const { method } = req.body;
    
    // Get currency from settings
    const settings = await storage.getCompanySettings();
    const currency = settings.currencyEn || 'AED';
    
    // Create payment record in payments table
    const payment = await storage.createPayment({
      contractId: contract.id,
      amount: contract.securityDeposit || '0',
      paymentMethod: method || 'cash',
      currency: currency,
      notes: 'Deposit payment',
      paidAt: new Date(),
      createdBy: userId,
    } as any);
    
    await createAuditLog(userId, 'payment', contract.id, req, `Recorded deposit payment of ${contract.securityDeposit || '0'} ${currency} for contract #${contract.contractNumber}`);
    
    // Send security deposit received notification (non-blocking)
    const customer = await storage.getCustomer(contract.customerId);
    if (customer) {
      triggerNotification('SECURITY_DEPOSIT_RECEIVED', {
        customerName: customer.nameEn || customer.nameAr || 'Customer',
        mobile: customer.phone,
        email: customer.email,
        language: customer.preferredLanguage || 'en',
      }, {
        contractNumber: contract.contractNumber.toString(),
        depositAmount: contract.securityDeposit || '0',
        receiptNumber: payment.id.toString(),
        companyName: settings.companyNameEn || 'KarāraOS',
      }).catch(err => console.error('[Payment] Deposit notification failed:', err));
    }
    
    res.json(payment);
  } catch (error: any) {
    console.error("Error recording deposit:", error);
    res.status(400).json({ message: error.message || "Failed to record deposit" });
  }
});

/**
 * POST /api/contracts/:id/final-payment
 * Record final payment (Legacy route)
 */
router.post("/contracts/:id/final-payment", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    const { method } = req.body;
    
    // Get currency from settings
    const settings = await storage.getCompanySettings();
    const currency = settings.currencyEn || 'AED';
    
    // P0-2: Calculate final payment amount using validated inputs
    const totalAmount = validateFinancialInput(contract.totalAmount || '0', 'total amount');
    const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
    const totalDue = totalAmount + totalExtraCharges;
    
    // Get existing payments
    const existingPayments = await storage.getPaymentsByContract(contract.id);
    const totalPaid = existingPayments.reduce((sum: number, p: any) => {
      return sum + validateFinancialInput(p.amount || '0', 'payment amount');
    }, 0);
    
    const finalPaymentAmount = Math.max(0, totalDue - totalPaid);
    
    // Create payment record in payments table
    const payment = await storage.createPayment({
      contractId: contract.id,
      amount: finalPaymentAmount.toString(),
      paymentMethod: method || 'cash',
      currency: currency,
      notes: 'Final payment',
      paidAt: new Date(),
      createdBy: userId,
    } as any);
    
    await createAuditLog(userId, 'payment', contract.id, req, `Recorded final payment of ${finalPaymentAmount.toFixed(2)} ${currency} for contract #${contract.contractNumber}`);
    
    // Send payment received notification (non-blocking)
    const customer = await storage.getCustomer(contract.customerId);
    if (customer) {
      triggerNotification('payment_received', {
        customerName: customer.nameEn || customer.nameAr || 'Customer',
        mobile: customer.phone,
        email: customer.email,
        language: customer.preferredLanguage || 'en',
      }, {
        contractNumber: contract.contractNumber.toString(),
        paymentAmount: payment.amount,
        paymentMethod: payment.paymentMethod,
        currency: payment.currency,
        companyName: settings.companyNameEn || 'KarāraOS',
      }).catch(err => console.error('[Payment] Final payment notification failed:', err));
    }
    
    res.json(payment);
  } catch (error: any) {
    console.error("Error recording final payment:", error);
    res.status(400).json({ message: error.message || "Failed to record final payment" });
  }
});

/**
 * POST /api/contracts/:id/refund
 * Record deposit refund (Legacy route)
 * Note: Refunds are blocked for contracts with pending accident claims
 */
router.post("/contracts/:id/refund", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    // Block refunds for contracts with pending accident claims
    if (contract.status === 'completed_pending_accident') {
      return res.status(400).json({ 
        message: "Deposit refund is blocked - contract has pending accident claims. Clear the accident claim before processing refund." 
      });
    }
    
    // Block refunds if not completed
    if (contract.status !== 'completed') {
      return res.status(400).json({ 
        message: `Deposit refund can only be processed for completed contracts. Current status: ${contract.status}` 
      });
    }
    
    // Block if already refunded
    if (contract.depositRefunded) {
      return res.status(400).json({ 
        message: "Deposit has already been refunded for this contract." 
      });
    }
    
    const { method } = req.body;
    
    // Get currency from settings
    const settings = await storage.getCompanySettings();
    const currency = settings.currencyEn || 'AED';
    
    // Create negative payment record for refund
    const payment = await storage.createPayment({
      contractId: contract.id,
      amount: `-${contract.securityDeposit || '0'}`,
      paymentMethod: method || 'cash',
      currency: currency,
      notes: 'Deposit refund',
      paidAt: new Date(),
      createdBy: userId,
    } as any);
    
    // Update contract to mark deposit as refunded
    await storage.updateContract(contract.id, {
      depositRefunded: true,
      depositRefundedDate: new Date(),
    });
    
    await createAuditLog(userId, 'payment', contract.id, req, `Refunded deposit of ${contract.securityDeposit || '0'} ${currency} for contract #${contract.contractNumber}`);
    
    // Send deposit refund notification (non-blocking)
    const customer = await storage.getCustomer(contract.customerId);
    if (customer) {
      triggerNotification('SECURITY_DEPOSIT_REFUNDED', {
        customerName: customer.nameEn || customer.nameAr || 'Customer',
        mobile: customer.phone,
        email: customer.email,
        language: customer.preferredLanguage || 'en',
      }, {
        contractNumber: contract.contractNumber.toString(),
        depositAmount: contract.securityDeposit || '0',
        deductions: '0',
        refundAmount: contract.securityDeposit || '0',
        companyName: settings.companyNameEn || 'KarāraOS',
      }).catch(err => console.error('[Payment] Deposit refund notification failed:', err));
    }
    
    res.json({ ...payment, depositRefunded: true, depositRefundedDate: new Date() });
  } catch (error: any) {
    console.error("Error recording refund:", error);
    res.status(400).json({ message: error.message || "Failed to record refund" });
  }
});

/**
 * STANDARD PAYMENT ROUTES
 */

/**
 * POST /api/contracts/:contractId/payments
 * Create a new payment for a contract
 */
router.post("/contracts/:contractId/payments", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { contractId } = req.params;

    // Verify contract exists
    const contract = await storage.getContract(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Validate and transform payment data using schema
    const validatedData = insertPaymentSchema.parse({
      ...req.body,
      contractId,
    });

    // Create payment
    const payment = await storage.createPayment({
      ...validatedData,
      createdBy: userId,
    } as any);

    // Create audit log
    await createAuditLog(userId, 'create', contractId, req, `Added payment of ${payment.amount} ${payment.currency} via ${payment.paymentMethod}`);

    // Send payment received notification (non-blocking)
    const customer = await storage.getCustomer(contract.customerId);
    if (customer) {
      const settings = await storage.getCompanySettings();
      triggerNotification('payment_received', {
        customerName: customer.nameEn || customer.nameAr || 'Customer',
        mobile: customer.phone,
        email: customer.email,
        language: customer.preferredLanguage || 'en',
      }, {
        contractNumber: contract.contractNumber.toString(),
        paymentAmount: payment.amount,
        paymentMethod: payment.paymentMethod,
        currency: payment.currency,
        companyName: settings.companyNameEn || 'KarāraOS',
      }).catch(err => console.error('[Payment] Notification failed:', err));
    }

    res.json(payment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    console.error("Error creating payment:", error);
    await logSystemError(error, req, { action: 'create_payment' });
    res.status(400).json({ message: error.message || "Failed to create payment" });
  }
});

/**
 * GET /api/contracts/:contractId/payments
 * Get all payments for a contract
 */
router.get("/contracts/:contractId/payments", isAuthenticated, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    const payments = await storage.getPaymentsByContract(contractId);
    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: error.message || "Failed to fetch payments" });
  }
});

/**
 * DELETE /api/payments/:id
 * Delete a payment (Admin only)
 */
router.delete("/payments/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get payment info before deletion for audit log and verification
    const payment = await storage.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Delete the payment
    await storage.deletePayment(id);

    // Create audit log with payment details
    await createAuditLog(userId, 'delete', payment.contractId, req, `Deleted payment of ${payment.amount} ${payment.currency} for contract`);

    res.json({ message: "Payment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    res.status(400).json({ message: error.message || "Failed to delete payment" });
  }
});

export default router;
