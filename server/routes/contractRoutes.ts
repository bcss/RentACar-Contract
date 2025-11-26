/**
 * Contract Management Routes
 * 
 * Handles all contract-related operations including:
 * - Contract CRUD operations
 * - State machine transitions (draft → active → completed → closed)
 * - Edit history and audit logging
 * - Financial calculations and validation
 * - Insurance claims integration
 * - Driver cost integration
 * - Notification triggers
 */

import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { insertContractSchema } from "../../shared/schema";
import { 
  isAuthenticated, 
  requireAdmin, 
  requireEditor, 
  requireContractCloseAccess,
  requireManagerOrAdmin
} from "../auth/localAuth";
import { createAuditLog } from "../utils/auditLogger";
import { validateFinancialInput, validateEditReason } from "../utils/validation";
import { logSystemError } from "../utils/errorLogger";
import { calculateContractDriverCosts } from "../utils/driverCostCalculator";
import { notificationService } from "../services/notificationService";
import { calculateContractTotals } from "../services/contractFinancials";
import { triggerNotification } from "../services/notificationTrigger";
import { settingsService } from "../services/settingsService";
import { otpService } from "../services/otpService";
import { availabilityEngine } from "../services/availabilityEngine";

const router = Router();

/**
 * GET /api/contracts
 * List all contracts with role-based filtering
 * Staff can only see their own contracts
 */
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Phase 1.5: Filter contracts based on user role
    // Admin, Manager, Viewer: See all contracts
    // Staff: Only see their own contracts
    let contracts = await storage.getAllContracts();
    
    if (user.role === 'staff') {
      contracts = contracts.filter(contract => contract.createdBy === userId);
    }
    
    res.json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ message: "Failed to fetch contracts" });
  }
});

/**
 * GET /api/contracts/disabled
 * Get disabled contracts (Admin only)
 * MUST be before :id route to avoid route conflicts
 */
router.get("/disabled", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const contracts = await storage.getDisabledContracts();
    res.json(contracts);
  } catch (error: any) {
    console.error("Error fetching disabled contracts:", error);
    res.status(500).json({ message: "Failed to fetch disabled contracts" });
  }
});

/**
 * GET /api/contracts/unclosed-alerts
 * Get contracts completed 30+ days ago but not closed
 */
router.get("/unclosed-alerts", isAuthenticated, async (req: any, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all completed contracts
    const allContracts = await storage.getAllContracts();
    const completedContracts = allContracts.filter((c: any) => c.status === 'completed');
    
    // Filter for contracts completed 30+ days ago
    const unclosedContracts = [];
    
    for (const contract of completedContracts) {
      if (!contract.completedAt) continue;
      
      const completedAt = new Date(contract.completedAt);
      completedAt.setHours(0, 0, 0, 0);
      
      // Check if completed more than 30 days ago
      if (completedAt <= thirtyDaysAgo) {
        // Calculate days unclosed
        const daysUnclosed = Math.floor((today.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Get payments for this contract
        const contractPayments = await storage.getPaymentsByContract(contract.id);
        
        // P0-2: Use validateFinancialInput for all financial calculations
        const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
          return sum + validateFinancialInput(payment.amount || '0', 'payment amount');
        }, 0);
        
        // FIXED: Include driver charges in outstanding balance calculation
        // Get driver assignments for this contract
        const driverAssignments = await storage.getDriverAssignments({ contractId: contract.id });
        const { totalDriverCharges } = calculateContractDriverCosts(driverAssignments);
        
        // Use centralized financial calculator for consistency
        const financials = calculateContractTotals({
          totalAmount: contract.totalAmount || '0',
          totalExtraCharges: contract.totalExtraCharges || '0',
          totalDriverCharges: totalDriverCharges,
          securityDeposit: contract.securityDeposit || '0',
          totalPaid: totalPaid,
        });
        
        const outstandingBalance = financials.outstandingBalance;
        
        // Get handler info
        const handler = await storage.getUser(contract.createdBy);
        const handlerName = handler ? `${handler.firstName || ''} ${handler.lastName || ''}`.trim() || handler.username : 'Unknown';
        
        unclosedContracts.push({
          id: contract.id,
          contractNumber: contract.contractNumber,
          customerName: (contract as any).customerNameEn || (contract as any).customerNameAr || 'N/A',
          vehicleRegistration: (contract as any).vehicleRegistration || 'N/A',
          completedAt: contract.completedAt,
          daysUnclosed,
          outstandingBalance: Math.round(outstandingBalance * 100) / 100,
          handlerName,
        });
      }
    }
    
    // Sort by daysUnclosed descending (oldest first)
    unclosedContracts.sort((a, b) => b.daysUnclosed - a.daysUnclosed);
    
    res.json(unclosedContracts);
  } catch (error) {
    console.error("Error fetching unclosed contract alerts:", error);
    await logSystemError(error, req);
    res.status(500).json({ message: "Failed to fetch unclosed contract alerts" });
  }
});

/**
 * GET /api/contracts/:id
 * Get single contract with real-time financial calculations
 */
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    const contract = await storage.getContractWithDetails(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    // Phase 1.5: Staff can only view their own contracts
    if (user?.role === 'staff' && contract.createdBy !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
    }
    
    // CRITICAL FIX: Calculate real-time outstanding balance based on actual payments
    const contractPayments = await storage.getPaymentsByContract(contract.id);
    
    // P0-2: Use validateFinancialInput for all financial calculations
    const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
      return sum + validateFinancialInput(payment.amount || '0', 'payment amount');
    }, 0);
    
    // BRANCH & DRIVER SERVICE INTEGRATION: Include driver service costs in total (VAT-inclusive)
    const driverAssignments = await storage.getDriverAssignments({ contractId: contract.id });
    const { totalDriverCharges, totalDriverSurcharges, totalDriverVat } = calculateContractDriverCosts(driverAssignments);
    
    // Use centralized financial calculator for consistency
    const financials = calculateContractTotals({
      totalAmount: contract.totalAmount || '0',
      totalExtraCharges: contract.totalExtraCharges || '0',
      totalDriverCharges: totalDriverCharges,
      securityDeposit: contract.securityDeposit || '0',
      totalPaid: totalPaid,
    });
    
    // Return contract with complete financial breakdown including VAT-inclusive driver costs
    res.json({
      ...contract,
      // Explicitly include driver service charges in response (VAT-inclusive)
      totalDriverCharges: totalDriverCharges.toFixed(2),
      totalDriverSurcharges: totalDriverSurcharges.toFixed(2),
      totalDriverVat: totalDriverVat.toFixed(2),
      // Update total due to include all charges (rental + extras + driver with VAT)
      totalDue: financials.totalDue.toFixed(2),
      // Recalculated outstanding balance includes driver charges with VAT
      outstandingBalance: Math.max(0, financials.outstandingBalance).toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    res.status(500).json({ message: "Failed to fetch contract" });
  }
});

/**
 * GET /api/contracts/:id/edits
 * Get contract edit history/timeline
 */
router.get("/:id/edits", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    // Staff can only view edit history for their own contracts
    if (user?.role === 'staff' && contract.createdBy !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
    }
    
    const edits = await storage.getContractEdits(req.params.id);
    res.json(edits);
  } catch (error) {
    console.error("Error fetching contract edits:", error);
    res.status(500).json({ message: "Failed to fetch contract edit history" });
  }
});

/**
 * GET /api/contracts/:id/audit-logs
 * Get contract audit logs (lifecycle events for timeline)
 */
router.get("/:id/audit-logs", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    // Staff can only view audit logs for their own contracts
    if (user?.role === 'staff' && contract.createdBy !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
    }
    
    const logs = await storage.getContractAuditLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching contract audit logs:", error);
    res.status(500).json({ message: "Failed to fetch contract audit logs" });
  }
});

/**
 * GET /api/contracts/:contractId/insurance-claims
 * Get insurance claims for a contract
 */
router.get("/:contractId/insurance-claims", isAuthenticated, async (req: any, res) => {
  try {
    const { contractId } = req.params;
    const claims = await storage.getInsuranceClaims({ contractId });
    res.json(claims);
  } catch (error: any) {
    console.error("Error fetching contract insurance claims:", error);
    res.status(500).json({ message: error.message || "Failed to fetch contract insurance claims" });
  }
});

/**
 * POST /api/contracts
 * Create new contract
 */
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const validatedData = insertContractSchema.parse({
      ...req.body,
      createdBy: userId,
    });
    
    // Calculate financial totals from dailyRate and duration  
    // Accept both startDate/endDate (tests) and rentalStartDate/rentalEndDate (production)
    const startDateField = (req.body.startDate || req.body.rentalStartDate);
    const endDateField = (req.body.endDate || req.body.rentalEndDate);
    
    if (!startDateField || !endDateField) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    
    const startDate = new Date(startDateField);
    const endDate = new Date(endDateField);
    const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Fetch VAT percentage from company settings
    const settings = await storage.getCompanySettings();
    const vatPercentage = parseFloat(settings?.vatPercentage || '5');
    
    const dailyRate = validateFinancialInput(validatedData.dailyRate || '0', 'daily rate');
    const securityDeposit = validateFinancialInput(validatedData.securityDeposit || '0', 'security deposit');
    
    // Calculate rental amount with VAT
    const rentalAmount = dailyRate * durationDays;
    const vatAmount = (rentalAmount * vatPercentage) / 100;
    const totalAmount = rentalAmount + vatAmount; // Total rental amount including VAT
    
    // CRITICAL FIX: Use totalExtraCharges from request if provided, otherwise default to 0
    // This ensures upfront extra charges are not silently dropped during creation
    const totalExtraCharges = validateFinancialInput(validatedData.totalExtraCharges || '0', 'total extra charges');
    
    // Driver charges are 0 at creation (added later via driver assignments)
    const totalDriverCharges = 0;
    
    // Use centralized financial calculator for consistency
    // At creation: totalPaid = 0, totalExtraCharges from form, totalDriverCharges = 0
    const financials = calculateContractTotals({
      totalAmount: totalAmount,
      totalExtraCharges: totalExtraCharges,
      totalDriverCharges: totalDriverCharges,
      securityDeposit: securityDeposit,
      totalPaid: 0, // No payments at creation
    });
    
    const totalDue = financials.totalDue;
    const outstandingBalance = financials.outstandingBalance;
    
    const contract = await storage.createContract({
      ...validatedData,
      status: 'draft',
      subtotal: rentalAmount.toString(),
      vatAmount: vatAmount.toString(),
      totalAmount: totalAmount.toString(),
      totalExtraCharges: totalExtraCharges.toString(), // Initialize to 0, updated via PATCH
      outstandingBalance: outstandingBalance.toString(),
    });
    
    // Create audit log
    await createAuditLog(userId, 'create', contract.id, req, `Created contract #${contract.contractNumber}`);
    
    // Trigger notification: contract_created
    try {
      const customer = await storage.getCustomerById(contract.customerId);
      const vehicle = await storage.getVehicleById(contract.vehicleId);
      if (customer && (customer.phone || customer.email)) {
        await triggerNotification('contract_created', {
          customerId: customer.id,
          customerName: customer.nameEn,
          mobile: customer.phone,
          email: customer.email,
          language: 'en',
        }, {
          contractNumber: contract.contractNumber.toString(),
          customerName: customer.nameEn,
          vehiclePlate: vehicle?.registration || 'N/A',
          startDate: startDate.toLocaleDateString('en-GB'),
          endDate: endDate.toLocaleDateString('en-GB'),
          totalAmount: totalAmount.toFixed(2),
          durationDays: durationDays.toString(),
          companyName: settings?.companyNameEn || 'KarāraOS',
        });
      }
    } catch (notifError) {
      console.error('[Contract] Notification failed for contract_created:', notifError);
      // Don't fail the contract creation if notification fails
    }
    
    // Return contract with calculated financial fields
    res.json({
      ...contract,
      subtotal: rentalAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalExtraCharges: totalExtraCharges.toFixed(2),
      totalDue: totalDue.toFixed(2),
      outstandingBalance: outstandingBalance.toFixed(2),
    });
  } catch (error: any) {
    console.error("Error creating contract:", error);
    await logSystemError(error, req, { action: 'create_contract' });
    res.status(400).json({ message: error.message || "Failed to create contract" });
  }
});

/**
 * PATCH /api/contracts/:id
 * Update contract with edit reason validation and audit trail
 */
router.patch("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { editReason, ...contractData } = req.body;
    
    // Step 1: Fetch current contract FIRST
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Step 2: ALWAYS require editReason (cannot be bypassed)
    if (!editReason || typeof editReason !== 'string') {
      return res.status(400).json({ 
        message: "Edit reason is required for all contract updates" 
      });
    }

    const trimmedReason = editReason.trim();
    
    if (trimmedReason === '') {
      return res.status(400).json({ 
        message: "Edit reason cannot be empty" 
      });
    }

    // Step 3: Status-based validation (BYPASS-PROOF)
    if (contract.status === 'closed') {
      return res.status(403).json({ 
        message: "Cannot edit closed contract. Closed contracts are immutable and cannot be modified." 
      });
    }
    
    // Block status regression from completed_pending_accident
    if (contract.status === 'completed_pending_accident') {
      // Only allow non-status updates or updates to completed_pending_accident
      if (contractData.status && contractData.status !== 'completed_pending_accident') {
        return res.status(403).json({ 
          message: "Cannot change status from 'completed_pending_accident'. Use the accident clearance route to resolve pending accidents." 
        });
      }
    }
    
    if (contract.status === 'active' || contract.status === 'completed') {
      // Active/Completed: Require 10+ meaningful words (3+ chars each)
      const validation = validateEditReason(trimmedReason);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error,
          wordCount: validation.wordCount
        });
      }
    } else if (contract.status === 'draft') {
      // Draft: Require non-empty reason (already validated above)
    } else {
      // Unknown status (backward compatibility for legacy data)
      const validation = validateEditReason(trimmedReason);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: `Edit reason validation required for contract status '${contract.status}': ${validation.error}`,
          wordCount: validation.wordCount
        });
      }
    }

    // Step 4: Check if user has permission to edit
    const user = await storage.getUser(userId);
    // Allow admin, superadmin (isImmutable admin), or contract creator
    const isSuperAdmin = user?.role === 'admin' && user?.isImmutable;
    const isAdmin = user?.role === 'admin';
    const isCreator = contract.createdBy === userId;
    
    if (!isSuperAdmin && !isAdmin && !isCreator) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own contracts" });
    }

    // Step 5: Capture state before edit
    const fieldsBefore = { ...contract };
    
    // Step 6: Update the contract with optimistic locking
    // Per Master Spec Part 6.5.2: Pass version for concurrent modification detection
    const expectedVersion = req.body.version as number | undefined;
    
    let updated;
    try {
      updated = await storage.updateContract(req.params.id, {
        ...contractData,
        editReason: trimmedReason,
      }, expectedVersion);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'CONFLICT',
          currentVersion: contract.version
        });
      }
      throw error;
    }
    
    // Step 7: Capture state after edit
    const fieldsAfter = { ...updated };
    
    // Step 8: Generate human-readable summary of changes
    const changedFields: string[] = [];
    Object.keys(contractData).forEach(key => {
      const beforeValue = (fieldsBefore as any)[key];
      const afterValue = (fieldsAfter as any)[key];
      if (beforeValue !== afterValue) {
        changedFields.push(`${key}: ${beforeValue} → ${afterValue}`);
      }
    });
    const changesSummary = changedFields.length > 0 
      ? `Changed ${changedFields.length} field(s): ${changedFields.join(', ')}`
      : 'No changes detected';
    
    // Step 9: Create contract edit record
    await storage.createContractEdit({
      contractId: updated.id,
      editedBy: userId,
      editReason: trimmedReason,
      changesSummary,
      fieldsBefore,
      fieldsAfter,
      ipAddress: req.ip,
    });
    
    // Create audit log
    await createAuditLog(userId, 'edit', updated.id, req, `Updated contract #${updated.contractNumber} - Reason: ${editReason.trim()}`);
    
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating contract:", error);
    res.status(400).json({ message: error.message || "Failed to update contract" });
  }
});

/**
 * POST /api/contracts/:id/activate
 * Activate rental (draft → active)
 * Requires pre-delivery inspection
 */
router.post("/:id/activate", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { timeOut, expectedVersion } = req.body;
    
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // OPTIMISTIC LOCKING - Per Master Spec Part 6.5.2
    if (expectedVersion !== undefined && contract.version !== expectedVersion) {
      return res.status(409).json({
        message: "Contract has been modified by another user. Please refresh and try again.",
        code: 'CONFLICT',
        currentVersion: contract.version
      });
    }

    // STATUS VALIDATION
    if (contract.status !== 'draft') {
      return res.status(400).json({ 
        message: `Contract must be in draft status to activate. Current status: ${contract.status}` 
      });
    }

    // INSPECTION VALIDATION - Check settings if inspection is required
    const requirePickupInspection = await settingsService.getSettingAsBoolean(
      'contract_requires_pickup_inspection',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (requirePickupInspection) {
      const inspections = await storage.getVehicleInspectionsByContract(req.params.id);
      const hasPreDeliveryInspection = inspections.some(i => i.inspectionType === 'pre_delivery');
      
      if (!hasPreDeliveryInspection) {
        return res.status(400).json({ 
          message: "Pre-delivery vehicle inspection is required before activating the rental. Please complete the inspection first." 
        });
      }
    }

    // DEPOSIT VALIDATION - Check settings if deposit is required before activation
    const requireDepositBeforeActivation = await settingsService.getSettingAsBoolean(
      'contract_requires_deposit_before_activation',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (requireDepositBeforeActivation) {
      const securityDeposit = parseFloat(contract.securityDeposit || '0');
      if (securityDeposit > 0 && !contract.depositPaid) {
        return res.status(400).json({ 
          message: "Security deposit payment is required before activating the rental. Please collect the deposit first." 
        });
      }
    }

    // OTP VERIFICATION - Per Master Spec Part 3.3 & 3.11: Two-tier OTP control
    // Tier 1: Check if OTP is enabled globally for this branch
    const otpEnabled = await settingsService.getSettingAsBoolean(
      'otp_enabled',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (otpEnabled) {
      // Tier 2: Check if activation-specific OTP is required (defaults to true when OTP enabled)
      const activationOtpRequired = await settingsService.getSettingAsBoolean(
        'contract_requires_activation_otp',
        'BRANCH',
        contract.branchId || undefined,
        true // Default to true when OTP is enabled
      );
      
      if (activationOtpRequired) {
        const isOtpVerified = await otpService.checkEntityVerification(
          'contract',
          req.params.id,
          'activation' // Distinct purpose per Master Spec 3.11.4 & 9.6
        );
        
        if (!isOtpVerified) {
          return res.status(400).json({ 
            message: "OTP verification is required before activating the rental. Please complete OTP verification with the hirer first.",
            requiresOtp: true,
            otpPurpose: 'activation'
          });
        }
      }
    }

    // DOUBLE-BOOKING PREVENTION
    const isAvailable = await storage.checkVehicleAvailability(
      contract.vehicleId,
      new Date(contract.rentalStartDate),
      new Date(contract.rentalEndDate),
      contract.id
    );
    
    if (!isAvailable) {
      return res.status(400).json({ 
        message: "Vehicle is not available for the selected dates. Another active or completed contract exists for this period. Please choose different dates or another vehicle." 
      });
    }

    // DATE VALIDATION
    const now = new Date();
    const startDate = new Date(contract.rentalStartDate);
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    if (now < startDate) {
      return res.status(400).json({ 
        message: `Cannot activate contract before rental start date. Start date is ${contract.rentalStartDate}, but today is ${new Date().toISOString().split('T')[0]}. Please wait until the start date to activate.` 
      });
    }

    let activated;
    try {
      activated = await storage.activateContract(req.params.id, userId, timeOut, expectedVersion);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'CONFLICT',
          currentVersion: contract.version
        });
      }
      throw error;
    }
    
    // Update vehicle status to "rented"
    await storage.updateVehicle(activated.vehicleId, { status: "rented" });
    
    // Update availability engine cache - Per Master Spec Part B.4
    try {
      await availabilityEngine.handleContractActivation(
        activated.vehicleId,
        new Date(activated.rentalStartDate),
        new Date(activated.rentalEndDate),
        activated.id
      );
    } catch (cacheError) {
      console.error('[Contract] Availability engine update failed:', cacheError);
    }
    
    // Create audit log
    await createAuditLog(userId, 'activate', activated.id, req, `Activated contract #${activated.contractNumber} - vehicle handed over at ${timeOut || 'N/A'}`);
    
    // Trigger notification: contract_activated
    try {
      const customer = await storage.getCustomerById(activated.customerId);
      const vehicle = await storage.getVehicleById(activated.vehicleId);
      const settings = await storage.getCompanySettings();
      
      if (customer && (customer.phone || customer.email)) {
        await triggerNotification('contract_activated', {
          customerId: customer.id,
          customerName: customer.nameEn,
          mobile: customer.phone,
          email: customer.email,
          language: 'en',
        }, {
          contractNumber: activated.contractNumber.toString(),
          customerName: customer.nameEn,
          vehiclePlate: vehicle?.registration || 'N/A',
          startDate: new Date(activated.rentalStartDate).toLocaleDateString('en-GB'),
          endDate: new Date(activated.rentalEndDate).toLocaleDateString('en-GB'),
          companyName: settings?.companyNameEn || 'KarāraOS',
        });
      }
    } catch (notifError) {
      console.error('[Contract] Notification failed for contract_activated:', notifError);
    }
    
    res.json(activated);
  } catch (error: any) {
    console.error("Error activating contract:", error);
    res.status(400).json({ message: error.message || "Failed to activate contract" });
  }
});

/**
 * POST /api/contracts/:id/complete
 * Complete rental (active → completed)
 * Requires post-return inspection
 * Calculates charges and outstanding balance
 */
router.post("/:id/complete", isAuthenticated, requireEditor, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { expectedVersion } = req.body;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // OPTIMISTIC LOCKING - Per Master Spec Part 6.5.2
    if (expectedVersion !== undefined && contract.version !== expectedVersion) {
      return res.status(409).json({
        message: "Contract has been modified by another user. Please refresh and try again.",
        code: 'CONFLICT',
        currentVersion: contract.version
      });
    }

    // Edit reason validation for active contracts
    if (contract.status === 'active') {
      const editReasonValidation = validateEditReason(req.body.editReason);
      if (!editReasonValidation.valid) {
        return res.status(400).json({ 
          message: editReasonValidation.error || "Edit reason required when completing active contract"
        });
      }
    }

    // VALIDATION: Post-return inspection required - Check settings
    const requireReturnInspection = await settingsService.getSettingAsBoolean(
      'contract_requires_return_inspection',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (requireReturnInspection) {
      const inspections = await storage.getVehicleInspectionsByContract(req.params.id);
      const hasPostReturnInspection = inspections.some(i => i.inspectionType === 'post_return');
      
      if (!hasPostReturnInspection) {
        return res.status(400).json({ 
          message: "Post-return vehicle inspection is required before completing the rental. Please complete the inspection first." 
        });
      }
    }

    // OTP VERIFICATION - Per Master Spec Part 3.11: Two-tier OTP control
    // Tier 1: Check if OTP is enabled globally for this branch
    const otpEnabled = await settingsService.getSettingAsBoolean(
      'otp_enabled',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (otpEnabled) {
      // Tier 2: Check if completion-specific OTP is required (defaults to true when OTP enabled)
      const completionOtpRequired = await settingsService.getSettingAsBoolean(
        'contract_requires_completion_otp',
        'BRANCH',
        contract.branchId || undefined,
        true // Default to true when OTP is enabled
      );
      
      if (completionOtpRequired) {
        const isOtpVerified = await otpService.checkEntityVerification(
          'contract',
          req.params.id,
          'completion' // Distinct purpose per Master Spec 3.11.4 & 9.6
        );
        
        if (!isOtpVerified) {
          return res.status(400).json({ 
            message: "OTP verification is required before completing the rental. Please complete OTP verification with the hirer first.",
            requiresOtp: true,
            otpPurpose: 'completion'
          });
        }
      }
    }

    const { timeIn, odometerEnd, fuelLevelEnd, vehicleCondition, extraKmCharge, fuelCharge: clientFuelCharge, damageCharge, trafficFineCharge, otherCharges, totalExtraCharges, outstandingBalance, extraKmDriven, fuelChargeOverride, earlyClosureReason } = req.body;
    
    // Validate all financial inputs
    try {
      if (extraKmCharge !== undefined && extraKmCharge !== null && extraKmCharge !== '') {
        validateFinancialInput(extraKmCharge, 'extra km charge');
      }
      if (clientFuelCharge !== undefined && clientFuelCharge !== null && clientFuelCharge !== '') {
        validateFinancialInput(clientFuelCharge, 'fuel charge');
      }
      if (damageCharge !== undefined && damageCharge !== null && damageCharge !== '') {
        validateFinancialInput(damageCharge, 'damage charge');
      }
      if (trafficFineCharge !== undefined && trafficFineCharge !== null && trafficFineCharge !== '') {
        validateFinancialInput(trafficFineCharge, 'traffic fine charge');
      }
      if (otherCharges !== undefined && otherCharges !== null && otherCharges !== '') {
        validateFinancialInput(otherCharges, 'other charges');
      }
      if (totalExtraCharges !== undefined && totalExtraCharges !== null && totalExtraCharges !== '') {
        validateFinancialInput(totalExtraCharges, 'total extra charges');
      }
      if (odometerEnd !== undefined && odometerEnd !== null && odometerEnd !== '') {
        validateFinancialInput(odometerEnd, 'odometer reading');
      }
      if (fuelLevelEnd !== undefined && fuelLevelEnd !== null && fuelLevelEnd !== '') {
        validateFinancialInput(fuelLevelEnd, 'fuel level');
      }
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
    
    // Calculate fuel charge on backend
    const vehicle = await storage.getVehicleById(contract.vehicleId);
    const settings = await storage.getCompanySettings();
    
    let calculatedFuelCharge = 0;
    let fuelChargeDetails = '';
    
    const fuelLevelStart = validateFinancialInput(contract.fuelLevelStart || '0', 'fuel level start');
    const fuelLevelEndNum = validateFinancialInput(fuelLevelEnd || '0', 'fuel level end');
    
    if (vehicle && settings && fuelLevelStart && fuelLevelEndNum < fuelLevelStart) {
      const tankCapacity = vehicle.tankCapacity || 0;
      const fuelType = vehicle.fuelType || 'petrol';
      
      if (tankCapacity > 0 && (fuelType === 'petrol' || fuelType === 'diesel')) {
        const fuelConsumed = (tankCapacity * (fuelLevelStart - fuelLevelEndNum)) / 100;
        const pricePerLiter = fuelType === 'diesel' 
          ? validateFinancialInput(settings.dieselPricePerLiter || '0', 'diesel price')
          : validateFinancialInput(settings.petrolPricePerLiter || '0', 'petrol price');
        
        calculatedFuelCharge = Math.round(fuelConsumed * pricePerLiter * 100) / 100;
        fuelChargeDetails = `Fuel consumed: ${fuelConsumed.toFixed(2)}L × ${pricePerLiter} AED/L = ${calculatedFuelCharge.toFixed(2)} AED`;
      }
    }
    
    let finalFuelCharge = calculatedFuelCharge.toString();
    let auditNote = `Completed contract #${contract.contractNumber} - vehicle returned`;
    
    if (fuelChargeOverride && clientFuelCharge !== undefined && validateFinancialInput(clientFuelCharge, 'client fuel charge') !== calculatedFuelCharge) {
      finalFuelCharge = clientFuelCharge;
      auditNote += ` | FUEL CHARGE OVERRIDE: Backend calculated ${calculatedFuelCharge.toFixed(2)} AED (${fuelChargeDetails}), but manual override set to ${clientFuelCharge} AED`;
    } else if (calculatedFuelCharge > 0) {
      auditNote += ` | Fuel charge auto-calculated: ${fuelChargeDetails}`;
    }
    
    // FIXED: Calculate outstanding balance using centralized calculator with driver charges
    const totalExtraChargesNum = validateFinancialInput(totalExtraCharges || '0', 'extra charges');
    
    // Get contract payments
    const contractPayments = await storage.getPaymentsByContract(contract.id);
    
    const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
      try {
        const amount = validateFinancialInput(payment.amount || '0', 'payment amount');
        return sum + amount;
      } catch {
        return sum;
      }
    }, 0);
    
    // Get driver assignments for this contract
    const driverAssignments = await storage.getDriverAssignments({ contractId: contract.id });
    const { totalDriverCharges } = calculateContractDriverCosts(driverAssignments);
    
    // Determine deposit amount based on depositPaid flag
    let depositPaidAmount = 0;
    const securityDeposit = validateFinancialInput(contract.securityDeposit, 'security deposit');
    if (contract.depositPaid && isFinite(securityDeposit)) {
      depositPaidAmount = securityDeposit;
    }
    
    // Use centralized financial calculator for consistency
    const financials = calculateContractTotals({
      totalAmount: contract.totalAmount,
      totalExtraCharges: totalExtraChargesNum,
      totalDriverCharges: totalDriverCharges,
      securityDeposit: depositPaidAmount,
      totalPaid: totalPaid,
    });
    
    const roundedOutstandingBalance = Math.max(0, financials.outstandingBalance);
    
    if (isNaN(roundedOutstandingBalance)) {
      console.error(`NaN outstanding balance detected for contract ${contract.id}`);
      return res.status(500).json({ 
        message: "Error calculating outstanding balance. Please contact system administrator." 
      });
    }
    
    if (depositPaidAmount > 0) {
      auditNote += ` | Security deposit (${depositPaidAmount.toFixed(2)} AED) automatically deducted from outstanding balance`;
    }
    
    const chargeData = {
      extraKmCharge,
      extraKmDriven,
      fuelCharge: finalFuelCharge,
      damageCharge,
      trafficFineCharge,
      otherCharges,
      totalExtraCharges,
      outstandingBalance: roundedOutstandingBalance.toString(),
    };

    await storage.updateContract(req.params.id, {
      timeIn,
      odometerEnd,
      fuelLevelEnd,
      vehicleCondition,
      earlyClosureReason: earlyClosureReason || null,
    });

    let completed;
    try {
      completed = await storage.completeContract(req.params.id, userId, chargeData, expectedVersion);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'CONFLICT',
          currentVersion: contract.version
        });
      }
      throw error;
    }
    
    // Update vehicle status to "available"
    await storage.updateVehicle(completed.vehicleId, { status: "available" });
    
    // Update availability engine cache - Per Master Spec Part B.4
    try {
      await availabilityEngine.handleContractClosure(
        completed.vehicleId,
        new Date(completed.rentalStartDate),
        new Date(completed.rentalEndDate),
        completed.id
      );
    } catch (cacheError) {
      console.error('[Contract] Availability engine update failed on complete:', cacheError);
    }
    
    const finalAuditNote = `${auditNote}${timeIn ? ` | Vehicle returned at ${timeIn}` : ''}`;
    await createAuditLog(userId, 'complete', completed.id, req, finalAuditNote);
    
    // Trigger notification: contract_completed
    try {
      const customer = await storage.getCustomerById(completed.customerId);
      const vehicle = await storage.getVehicleById(completed.vehicleId);
      const settings = await storage.getCompanySettings();
      
      if (customer && (customer.phone || customer.email)) {
        await triggerNotification('contract_completed', {
          customerId: customer.id,
          customerName: customer.nameEn,
          mobile: customer.phone,
          email: customer.email,
          language: 'en',
        }, {
          contractNumber: completed.contractNumber.toString(),
          customerName: customer.nameEn,
          vehiclePlate: vehicle?.registration || 'N/A',
          totalAmount: completed.totalAmount || '0',
          outstandingBalance: completed.outstandingBalance || '0',
          returnDate: new Date().toLocaleDateString('en-GB'),
          companyName: settings?.companyNameEn || 'KarāraOS',
        });
      }
    } catch (notifError) {
      console.error('[Contract] Notification failed for contract_completed:', notifError);
    }
    
    res.json(completed);
  } catch (error: any) {
    console.error("Error completing contract:", error);
    res.status(400).json({ message: error.message || "Failed to complete contract" });
  }
});

/**
 * POST /api/contracts/:id/report-accident
 * Mark contract as having pending accident (completed → completed_pending_accident)
 * Used when damage is discovered during return inspection
 */
router.post("/:id/report-accident", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    if (contract.status !== 'completed') {
      return res.status(400).json({ 
        message: "Contract must be in 'completed' status to report accident. Current status: " + contract.status
      });
    }

    const { accidentDescription, estimatedDamage, insuranceClaimRequired } = req.body;
    
    if (!accidentDescription) {
      return res.status(400).json({ message: "Accident description is required" });
    }

    // Update contract status to completed_pending_accident
    const updated = await storage.updateContract(req.params.id, {
      status: 'completed_pending_accident',
    });

    // Log the accident report
    await createAuditLog(
      userId, 
      'report_accident', 
      updated.id, 
      req, 
      `Reported accident for contract #${updated.contractNumber}. Description: ${accidentDescription}. Estimated damage: ${estimatedDamage || 'Not specified'}. Insurance claim: ${insuranceClaimRequired ? 'Yes' : 'No'}`
    );

    res.json({
      ...updated,
      accidentDetails: {
        description: accidentDescription,
        estimatedDamage,
        insuranceClaimRequired,
        reportedAt: new Date().toISOString(),
        reportedBy: userId,
      }
    });
  } catch (error: any) {
    console.error("Error reporting accident:", error);
    res.status(400).json({ message: error.message || "Failed to report accident" });
  }
});

/**
 * POST /api/contracts/:id/clear-accident
 * Clear accident status (completed_pending_accident → completed)
 * Used when accident has been resolved/cleared
 */
router.post("/:id/clear-accident", isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    if (contract.status !== 'completed_pending_accident') {
      return res.status(400).json({ 
        message: "Contract must be in 'completed_pending_accident' status to clear accident. Current status: " + contract.status
      });
    }

    const { clearanceNotes, insuranceClaimId, resolutionType } = req.body;
    
    if (!clearanceNotes) {
      return res.status(400).json({ message: "Clearance notes are required" });
    }

    // Update contract status back to completed
    const updated = await storage.updateContract(req.params.id, {
      status: 'completed',
    });

    // Log the accident clearance
    await createAuditLog(
      userId, 
      'clear_accident', 
      updated.id, 
      req, 
      `Cleared accident for contract #${updated.contractNumber}. Resolution: ${resolutionType || 'Not specified'}. Insurance claim: ${insuranceClaimId || 'N/A'}. Notes: ${clearanceNotes}`
    );

    res.json({
      ...updated,
      accidentClearance: {
        notes: clearanceNotes,
        insuranceClaimId,
        resolutionType,
        clearedAt: new Date().toISOString(),
        clearedBy: userId,
      }
    });
  } catch (error: any) {
    console.error("Error clearing accident:", error);
    res.status(400).json({ message: error.message || "Failed to clear accident" });
  }
});

/**
 * POST /api/contracts/:id/close
 * Close contract (completed → closed)
 * Admin can override with closure remark for outstanding balance
 */
router.post("/:id/close", isAuthenticated, requireContractCloseAccess, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { expectedVersion } = req.body;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // OPTIMISTIC LOCKING - Per Master Spec Part 6.5.2
    if (expectedVersion !== undefined && contract.version !== expectedVersion) {
      return res.status(409).json({
        message: "Contract has been modified by another user. Please refresh and try again.",
        code: 'CONFLICT',
        currentVersion: contract.version
      });
    }

    // Edit reason validation
    if (contract.status === 'completed') {
      const editReasonValidation = validateEditReason(req.body.closureRemark || req.body.editReason);
      if (!editReasonValidation.valid) {
        return res.status(400).json({ 
          message: editReasonValidation.error || "Edit reason/closure remark required when closing completed contract"
        });
      }
    }

    if (contract.status !== 'completed' && contract.status !== 'completed_pending_accident') {
      return res.status(400).json({ 
        message: "Contract must be in 'completed' or 'completed_pending_accident' status before closing" 
      });
    }

    // If contract has pending accident, require accident clearance before closing
    if (contract.status === 'completed_pending_accident') {
      const { accidentClearanceNotes, insuranceClaimId } = req.body;
      if (!accidentClearanceNotes) {
        return res.status(400).json({ 
          message: "Accident clearance notes required when closing a contract with pending accident" 
        });
      }
    }

    // OTP VERIFICATION - Per Master Spec Part 3.11: Two-tier OTP control
    // Tier 1: Check if OTP is enabled globally for this branch
    const otpEnabled = await settingsService.getSettingAsBoolean(
      'otp_enabled',
      'BRANCH',
      contract.branchId || undefined
    );
    
    if (otpEnabled) {
      // Tier 2: Check if closure-specific OTP is required (defaults to true when OTP enabled)
      const closureOtpRequired = await settingsService.getSettingAsBoolean(
        'contract_requires_closure_otp',
        'BRANCH',
        contract.branchId || undefined,
        true // Default to true when OTP is enabled
      );
      
      if (closureOtpRequired) {
        const isOtpVerified = await otpService.checkEntityVerification(
          'contract',
          req.params.id,
          'closure' // Distinct purpose per Master Spec 3.11.4 & 9.6
        );
        
        if (!isOtpVerified) {
          return res.status(400).json({ 
            message: "OTP verification is required before closing the rental. Please complete OTP verification with the hirer first.",
            requiresOtp: true,
            otpPurpose: 'closure'
          });
        }
      }
    }

    // PAYMENT VERIFICATION
    const contractPayments = await storage.getPaymentsByContract(contract.id);
    
    const totalPaid = contractPayments.reduce((sum: number, payment: any) => {
      try {
        const amount = validateFinancialInput(payment.amount, 'payment amount');
        return sum + amount;
      } catch (error) {
        console.error(`Invalid payment amount in payment record: ${JSON.stringify(payment)}`);
        return sum;
      }
    }, 0);
    
    const totalAmount = validateFinancialInput(contract.totalAmount, 'total amount');
    const totalExtraCharges = validateFinancialInput(contract.totalExtraCharges || '0', 'extra charges');
    
    if (!isFinite(totalAmount)) {
      return res.status(400).json({ 
        message: "Invalid total amount in contract. Contract data is corrupted or incomplete." 
      });
    }
    if (!isFinite(totalExtraCharges)) {
      return res.status(400).json({ 
        message: "Invalid extra charges in contract. Please verify the contract data." 
      });
    }
    
    const totalDue = totalAmount + totalExtraCharges;
    
    const totalPaidRounded = Math.round(totalPaid * 100) / 100;
    const totalDueRounded = Math.round(totalDue * 100) / 100;
    const computedOutstanding = totalDueRounded - totalPaidRounded;
    
    if (isNaN(computedOutstanding)) {
      console.error(`NaN outstanding balance detected for contract ${contract.id}`);
      return res.status(500).json({ 
        message: "Error calculating outstanding balance. Please contact system administrator." 
      });
    }
    
    const hasOutstandingBalance = computedOutstanding > 0.001;
    
    // Admin override: Allow closing with outstanding balance
    if (userRole === 'admin' && hasOutstandingBalance) {
      const { closureRemark } = req.body;
      
      const validation = validateEditReason(closureRemark);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error || "Closure remark is required when closing with outstanding balance"
        });
      }
      
      let closed;
      try {
        closed = await storage.closeContract(req.params.id, userId, closureRemark, expectedVersion);
      } catch (error: any) {
        if (error.message.includes('modified by another user')) {
          return res.status(409).json({ 
            message: error.message,
            code: 'CONFLICT',
            currentVersion: contract.version
          });
        }
        throw error;
      }
      
      await storage.updateVehicle(closed.vehicleId, { status: "available" });
      
      // Update availability engine cache - Per Master Spec Part B.4
      try {
        await availabilityEngine.handleContractClosure(
          closed.vehicleId,
          new Date(closed.rentalStartDate),
          new Date(closed.rentalEndDate),
          closed.id
        );
      } catch (cacheError) {
        console.error('[Contract] Availability engine update failed on close:', cacheError);
      }
      
      await createAuditLog(
        userId, 
        'close', 
        closed.id, 
        req, 
        `Admin override: Closed contract #${closed.contractNumber} with outstanding balance of ${computedOutstanding.toFixed(2)} AED. Remark: ${closureRemark}`
      );
      
      // Send notification
      try {
        const customer = await storage.getCustomerById(closed.customerId);
        if (customer) {
          await notificationService.sendNotification({
            templateCode: 'CONTRACT_CLOSED',
            channel: 'email',
            recipientType: 'customer',
            recipientId: customer.id,
            variables: {
              contractNumber: closed.contractNumber.toString(),
              customerName: customer.nameEn || '',
              closureDate: new Date().toLocaleDateString('en-AE'),
            },
            language: 'en',
            triggerType: 'event_driven',
            triggeredBy: userId,
            entityType: 'contract',
            entityId: closed.id,
          });
        }
      } catch (notifError) {
        console.error('[Notification] Failed to send contract closure notification:', notifError);
      }
      
      return res.json(closed);
    }
    
    // Standard payment verification
    if (hasOutstandingBalance) {
      return res.status(400).json({ 
        message: `Cannot close contract with outstanding balance of ${computedOutstanding.toFixed(2)} AED. Total due: ${totalDueRounded.toFixed(2)} AED, Total paid: ${totalPaidRounded.toFixed(2)} AED. Please record remaining payment first.` 
      });
    }

    let closed;
    try {
      closed = await storage.closeContract(req.params.id, userId, undefined, expectedVersion);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'CONFLICT',
          currentVersion: contract.version
        });
      }
      throw error;
    }
    
    await storage.updateVehicle(closed.vehicleId, { status: "available" });
    
    // Update availability engine cache - Per Master Spec Part B.4
    try {
      await availabilityEngine.handleContractClosure(
        closed.vehicleId,
        new Date(closed.rentalStartDate),
        new Date(closed.rentalEndDate),
        closed.id
      );
    } catch (cacheError) {
      console.error('[Contract] Availability engine update failed on close:', cacheError);
    }
    
    await createAuditLog(userId, 'close', closed.id, req, `Closed contract #${closed.contractNumber} - all payments settled and verified`);
    
    // Send notification
    try {
      const customer = await storage.getCustomerById(closed.customerId);
      if (customer) {
        await notificationService.sendNotification({
          templateCode: 'CONTRACT_CLOSED',
          channel: 'email',
          recipientType: 'customer',
          recipientId: customer.id,
          variables: {
            contractNumber: closed.contractNumber.toString(),
            customerName: customer.nameEn || '',
            closureDate: new Date().toLocaleDateString('en-AE'),
          },
          language: 'en',
          triggerType: 'event_driven',
          triggeredBy: userId,
          entityType: 'contract',
          entityId: closed.id,
        });
      }
    } catch (notifError) {
      console.error('[Notification] Failed to send contract closure notification:', notifError);
    }
    
    res.json(closed);
  } catch (error: any) {
    console.error("Error closing contract:", error);
    res.status(400).json({ message: error.message || "Failed to close contract" });
  }
});

/**
 * POST /api/contracts/:id/cancel
 * Cancel a draft contract - Per Master Spec Part 5.5.1
 * Only draft contracts can be cancelled. Reason is required.
 */
router.post("/:id/cancel", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { cancellationReason, expectedVersion } = req.body;
    
    // Validate cancellation reason is provided
    if (!cancellationReason || cancellationReason.trim().length === 0) {
      return res.status(400).json({ 
        message: "Cancellation reason is required. Please provide a reason for cancelling this contract." 
      });
    }
    
    // Get contract to validate status
    const contract = await storage.getContract(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    // Only draft contracts can be cancelled
    if (contract.status !== 'draft') {
      return res.status(400).json({ 
        message: `Cannot cancel contract in '${contract.status}' status. Only draft contracts can be cancelled.` 
      });
    }
    
    let cancelled;
    try {
      cancelled = await storage.cancelContract(req.params.id, userId, cancellationReason.trim(), expectedVersion);
    } catch (error: any) {
      if (error.message.includes('modified by another user')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'CONFLICT',
          currentVersion: contract.version
        });
      }
      throw error;
    }
    
    await createAuditLog(userId, 'cancel', cancelled.id, req, `Cancelled contract #${cancelled.contractNumber} - Reason: ${cancellationReason}`);
    
    // Send cancellation notification
    try {
      const customer = await storage.getCustomerById(cancelled.customerId);
      if (customer) {
        await notificationService.sendNotification({
          templateCode: 'CONTRACT_CANCELLED',
          channel: 'email',
          recipientType: 'customer',
          recipientId: customer.id,
          variables: {
            contractNumber: cancelled.contractNumber.toString(),
            customerName: customer.nameEn || '',
            cancellationReason: cancellationReason,
            cancellationDate: new Date().toLocaleDateString('en-AE'),
          },
          language: 'en',
          triggerType: 'event_driven',
          triggeredBy: userId,
          entityType: 'contract',
          entityId: cancelled.id,
        });
      }
    } catch (notifError) {
      console.error('[Notification] Failed to send contract cancellation notification:', notifError);
    }
    
    res.json(cancelled);
  } catch (error: any) {
    console.error("Error cancelling contract:", error);
    res.status(400).json({ message: error.message || "Failed to cancel contract" });
  }
});

/**
 * POST /api/contracts/:id/disable
 * Disable contract (Admin only)
 */
router.post("/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.disableContract(req.params.id, userId);
    
    await createAuditLog(userId, 'disable', contract.id, req, `Disabled contract #${contract.contractNumber}`);
    
    res.json(contract);
  } catch (error: any) {
    console.error("Error disabling contract:", error);
    res.status(400).json({ message: error.message || "Failed to disable contract" });
  }
});

/**
 * POST /api/contracts/:id/enable
 * Enable contract (Admin only)
 */
router.post("/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.enableContract(req.params.id);
    
    await createAuditLog(userId, 'enable', contract.id, req, `Enabled contract #${contract.contractNumber}`);
    
    res.json(contract);
  } catch (error: any) {
    console.error("Error enabling contract:", error);
    res.status(400).json({ message: error.message || "Failed to enable contract" });
  }
});

/**
 * POST /api/contracts/:id/print
 * Print contract audit logging
 */
router.post("/:id/print", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const contract = await storage.getContract(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    await createAuditLog(userId, 'print', contract.id, req, `Printed contract #${contract.contractNumber}`);
    
    res.json({ message: "Print action logged" });
  } catch (error: any) {
    console.error("Error logging print action:", error);
    res.status(400).json({ message: error.message || "Failed to log print action" });
  }
});

export default router;
