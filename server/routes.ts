import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin, requireManagerOrAdmin } from "./auth/localAuth";
import { insertContractSchema, insertUserSchema, insertCompanySettingsSchema } from "@shared/schema";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./auth/passwordUtils";
import { seedSuperAdmin } from "./auth/seedSuperAdmin";
import { seedCompanySettings } from "./seedCompanySettings";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Seed super admin on startup
  await seedSuperAdmin();
  
  // Seed company settings on startup
  await seedCompanySettings();

  // Helper function to create audit log
  async function createAuditLog(userId: string, action: string, contractId?: string, ipAddress?: string, details?: string) {
    try {
      await storage.createAuditLog({
        userId,
        action,
        contractId,
        ipAddress,
        details,
      });
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contract routes
  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
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

  // Get disabled contracts (Admin only) - MUST be before :id route
  app.get('/api/contracts/disabled', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const contracts = await storage.getDisabledContracts();
      res.json(contracts);
    } catch (error: any) {
      console.error("Error fetching disabled contracts:", error);
      res.status(500).json({ message: "Failed to fetch disabled contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Phase 1.5: Staff can only view their own contracts
      if (user?.role === 'staff' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only view your own contracts" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertContractSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const contract = await storage.createContract(validatedData);
      
      // Create audit log
      await createAuditLog(userId, 'create', contract.id, req.ip, `Created contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error creating contract:", error);
      res.status(400).json({ message: error.message || "Failed to create contract" });
    }
  });

  app.patch('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Phase 1-2: Only allow editing draft contracts - protect lifecycle integrity
      if (contract.status !== 'draft') {
        return res.status(403).json({ 
          message: `Cannot edit ${contract.status} contract. Only draft contracts can be edited. Use state transition endpoints to advance the contract.` 
        });
      }

      // Check if user has permission to edit
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin' && contract.createdBy !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own contracts" });
      }

      const updated = await storage.updateContract(req.params.id, req.body);
      
      // Create audit log
      await createAuditLog(userId, 'edit', updated.id, req.ip, `Updated contract #${updated.contractNumber}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating contract:", error);
      res.status(400).json({ message: error.message || "Failed to update contract" });
    }
  });

  // Legacy /finalize route removed - use new state machine (confirm → activate → complete → close)

  // Phase 2: State transition routes (Admin/Manager only)
  
  // Confirm contract (draft → confirmed)
  app.post('/api/contracts/:id/confirm', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const confirmed = await storage.confirmContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'confirm', confirmed.id, req.ip, `Confirmed contract #${confirmed.contractNumber}`);
      
      res.json(confirmed);
    } catch (error: any) {
      console.error("Error confirming contract:", error);
      res.status(400).json({ message: error.message || "Failed to confirm contract" });
    }
  });

  // Activate rental (confirmed → active)
  app.post('/api/contracts/:id/activate', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const activated = await storage.activateContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'activate', activated.id, req.ip, `Activated contract #${activated.contractNumber} - vehicle handed over`);
      
      res.json(activated);
    } catch (error: any) {
      console.error("Error activating contract:", error);
      res.status(400).json({ message: error.message || "Failed to activate contract" });
    }
  });

  // Complete rental with return data (active → completed)
  app.post('/api/contracts/:id/complete', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { odometerEnd, fuelLevelEnd, vehicleCondition, extraKmCharge, fuelCharge, damageCharge, otherCharges, totalExtraCharges, outstandingBalance, extraKmDriven } = req.body;
      
      // Prepare charge data
      const chargeData = {
        extraKmCharge,
        extraKmDriven,
        fuelCharge,
        damageCharge,
        otherCharges,
        totalExtraCharges,
        outstandingBalance,
      };

      // Update contract with return inspection data
      await storage.updateContract(req.params.id, {
        odometerEnd,
        fuelLevelEnd,
        vehicleCondition,
      });

      // Complete the contract with charge data
      const completed = await storage.completeContract(req.params.id, userId, chargeData);
      
      // Create audit log
      await createAuditLog(userId, 'complete', completed.id, req.ip, `Completed contract #${completed.contractNumber} - vehicle returned`);
      
      res.json(completed);
    } catch (error: any) {
      console.error("Error completing contract:", error);
      res.status(400).json({ message: error.message || "Failed to complete contract" });
    }
  });

  // Close contract (completed → closed)
  app.post('/api/contracts/:id/close', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const closed = await storage.closeContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'close', closed.id, req.ip, `Closed contract #${closed.contractNumber} - all settled`);
      
      res.json(closed);
    } catch (error: any) {
      console.error("Error closing contract:", error);
      res.status(400).json({ message: error.message || "Failed to close contract" });
    }
  });

  // Phase 2: Payment recording routes (Admin/Manager only)
  
  // Record deposit payment
  app.post('/api/contracts/:id/deposit', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { method } = req.body;
      
      if (!method) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      const updated = await storage.recordDepositPayment(req.params.id, method);
      
      // Create audit log
      await createAuditLog(userId, 'payment', updated.id, req.ip, `Recorded deposit payment for contract #${updated.contractNumber} via ${method}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error recording deposit payment:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit payment" });
    }
  });

  // Record final payment
  app.post('/api/contracts/:id/final-payment', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const { method } = req.body;
      
      if (!method) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      const updated = await storage.recordFinalPayment(req.params.id, method);
      
      // Create audit log
      await createAuditLog(userId, 'payment', updated.id, req.ip, `Recorded final payment for contract #${updated.contractNumber} via ${method}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error recording final payment:", error);
      res.status(400).json({ message: error.message || "Failed to record final payment" });
    }
  });

  // Record deposit refund
  app.post('/api/contracts/:id/refund', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const updated = await storage.recordDepositRefund(req.params.id);
      
      // Create audit log
      await createAuditLog(userId, 'refund', updated.id, req.ip, `Refunded deposit for contract #${updated.contractNumber}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error recording deposit refund:", error);
      res.status(400).json({ message: error.message || "Failed to record deposit refund" });
    }
  });

  // Disable contract (Admin only)
  app.post('/api/contracts/:id/disable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.disableContract(req.params.id, userId);
      
      // Create audit log
      await createAuditLog(userId, 'disable', contract.id, req.ip, `Disabled contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error disabling contract:", error);
      res.status(400).json({ message: error.message || "Failed to disable contract" });
    }
  });

  // Enable contract (Admin only)
  app.post('/api/contracts/:id/enable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.enableContract(req.params.id);
      
      // Create audit log
      await createAuditLog(userId, 'enable', contract.id, req.ip, `Enabled contract #${contract.contractNumber}`);
      
      res.json(contract);
    } catch (error: any) {
      console.error("Error enabling contract:", error);
      res.status(400).json({ message: error.message || "Failed to enable contract" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { role } = req.body;
      const adminId = req.user.id;
      
      if (!['admin', 'manager', 'staff', 'viewer'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updated = await storage.updateUserRole(req.params.id, role);
      
      // Create audit log
      await createAuditLog(adminId, 'edit', undefined, req.ip, `Changed user ${req.params.id} role to ${role}`);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });

  // Create user (Admin only)
  app.post('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { username, password, email, firstName, lastName, role } = req.body;
      const adminId = req.user.id;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username,
        passwordHash,
        email,
        firstName,
        lastName,
        role: role || 'staff',
        isImmutable: false,
      });

      // Create audit log
      await createAuditLog(adminId, 'create', undefined, req.ip, `Created user ${username} with role ${role}`);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  // Disable user (Admin only, cannot disable immutable users)
  app.post('/api/users/:id/disable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const user = await storage.disableUser(req.params.id, adminId);
      
      // Create audit log
      await createAuditLog(adminId, 'disable', undefined, req.ip, `Disabled user ${user.username}`);
      
      res.json(user);
    } catch (error: any) {
      console.error("Error disabling user:", error);
      res.status(400).json({ message: error.message || "Failed to disable user" });
    }
  });

  // Enable user (Admin only)
  app.post('/api/users/:id/enable', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const user = await storage.enableUser(req.params.id);
      
      // Create audit log
      await createAuditLog(adminId, 'enable', undefined, req.ip, `Enabled user ${user.username}`);
      
      res.json(user);
    } catch (error: any) {
      console.error("Error enabling user:", error);
      res.status(400).json({ message: error.message || "Failed to enable user" });
    }
  });

  // Get disabled users (Admin only)
  app.get('/api/users/disabled', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getDisabledUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching disabled users:", error);
      res.status(500).json({ message: "Failed to fetch disabled users" });
    }
  });

  // Change password (authenticated users can change their own password)
  app.post('/api/users/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Hash and update password
      const passwordHash = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, passwordHash);

      // Create audit log
      await createAuditLog(userId, 'edit', undefined, req.ip, `Changed password`);

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      res.status(400).json({ message: error.message || "Failed to change password" });
    }
  });

  // Print contract audit logging
  app.post('/api/contracts/:id/print', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contract = await storage.getContract(req.params.id);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Create audit log
      await createAuditLog(userId, 'print', contract.id, req.ip, `Printed contract #${contract.contractNumber}`);
      
      res.json({ message: "Print action logged" });
    } catch (error: any) {
      console.error("Error logging print action:", error);
      res.status(400).json({ message: error.message || "Failed to log print action" });
    }
  });

  // Audit log routes (Admin and Manager)
  app.get('/api/audit-logs', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get('/api/audit-logs/recent', isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getRecentAuditLogs(10);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent audit logs:", error);
      res.status(500).json({ message: "Failed to fetch recent audit logs" });
    }
  });

  // System error routes (Admin only)
  app.get('/api/system-errors', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const errors = await storage.getAllSystemErrors();
      res.json(errors);
    } catch (error) {
      console.error("Error fetching system errors:", error);
      res.status(500).json({ message: "Failed to fetch system errors" });
    }
  });

  app.get('/api/system-errors/unacknowledged', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const errors = await storage.getUnacknowledgedSystemErrors();
      res.json(errors);
    } catch (error) {
      console.error("Error fetching unacknowledged system errors:", error);
      res.status(500).json({ message: "Failed to fetch unacknowledged system errors" });
    }
  });

  app.post('/api/system-errors/:id/acknowledge', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const error = await storage.acknowledgeSystemError(req.params.id, userId);
      res.json(error);
    } catch (error: any) {
      console.error("Error acknowledging system error:", error);
      res.status(400).json({ message: error.message || "Failed to acknowledge system error" });
    }
  });

  // Analytics routes (Admin and Manager)
  app.get('/api/analytics/revenue', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/analytics/operations', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getOperationalAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching operational analytics:", error);
      res.status(500).json({ message: "Failed to fetch operational analytics" });
    }
  });

  app.get('/api/analytics/customers', isAuthenticated, requireManagerOrAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getCustomerAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  // Company settings routes (Admin only)
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate request body
      const validatedData = insertCompanySettingsSchema.parse(req.body);
      
      const settings = await storage.updateCompanySettings(validatedData, userId);
      
      // Create audit log
      await createAuditLog(
        userId,
        'update_settings',
        undefined,
        req.ip,
        'Updated company settings'
      );
      
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating company settings:", error);
      res.status(400).json({ message: error.message || "Failed to update company settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
