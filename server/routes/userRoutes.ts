/**
 * User Management Routes
 * 
 * Handles all user-related operations including:
 * - User CRUD operations
 * - Role management
 * - Password changes
 * - Enable/disable operations
 * - Granular permission management
 */

import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireAdmin } from "../auth/localAuth";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../auth/passwordUtils";
import { createAuditLog } from "../utils/auditLogger";

const router = Router();

/**
 * GET /api/users
 * List all users (Admin only)
 */
router.get("/", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * GET /api/users/disabled
 * Get disabled users (Admin only)
 * Note: This must be before /:id to avoid route conflicts
 */
router.get("/disabled", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const users = await storage.getDisabledUsers();
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching disabled users:", error);
    res.status(500).json({ message: "Failed to fetch disabled users" });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 * Any authenticated user can view user info (for timeline/audit display)
 */
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return user info without sensitive data
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/**
 * POST /api/users
 * Create new user (Admin only)
 */
router.post("/", isAuthenticated, requireAdmin, async (req: any, res) => {
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

    // Set permission toggles based on role
    // Admin and Manager get all permissions by default
    // Staff and Viewer get no permissions by default (can be granted later)
    const userRole = role || 'staff';
    const isPrivileged = userRole === 'admin' || userRole === 'manager';

    // Create user
    const user = await storage.createUser({
      username,
      passwordHash,
      email,
      firstName,
      lastName,
      role: userRole,
      isImmutable: false,
      canCloseContracts: isPrivileged,
      canViewAllContracts: isPrivileged,
    });

    // Create audit log
    await createAuditLog(adminId, 'create', undefined, req, `Created user ${username} with role ${role}`);

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

/**
 * PATCH /api/users/:id/role
 * Update user role (Admin only)
 */
router.patch("/:id/role", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { role } = req.body;
    const adminId = req.user.id;
    
    if (!['admin', 'manager', 'staff', 'viewer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await storage.updateUserRole(req.params.id, role);
    
    // Create audit log
    await createAuditLog(adminId, 'edit', undefined, req, `Changed user ${req.params.id} role to ${role}`);
    
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating user role:", error);
    res.status(400).json({ message: error.message || "Failed to update user role" });
  }
});

/**
 * PATCH /api/users/:id
 * Update user details and permissions (Admin only)
 */
router.patch("/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      password, 
      canCloseContracts, 
      canViewAllContracts,
      canAccessRevenueTrends,
      canAccessFleetPerformance,
      canAccessContractAnalytics,
      canAccessCollectionPerformance,
      canAccessFinancialReports,
      canAccessOperationalReports,
      canAccessCustomerReports,
      canAccessInsuranceReports,
      canAccessAuditReports,
      canAccessUserActivityReports
    } = req.body;
    const adminId = req.user.id;
    const userId = req.params.id;

    // Get existing user
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (email !== undefined) updates.email = email;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (role !== undefined) updates.role = role;
    if (canCloseContracts !== undefined) updates.canCloseContracts = canCloseContracts;
    if (canViewAllContracts !== undefined) updates.canViewAllContracts = canViewAllContracts;
    if (canAccessRevenueTrends !== undefined) updates.canAccessRevenueTrends = canAccessRevenueTrends;
    if (canAccessFleetPerformance !== undefined) updates.canAccessFleetPerformance = canAccessFleetPerformance;
    if (canAccessContractAnalytics !== undefined) updates.canAccessContractAnalytics = canAccessContractAnalytics;
    if (canAccessCollectionPerformance !== undefined) updates.canAccessCollectionPerformance = canAccessCollectionPerformance;
    if (canAccessFinancialReports !== undefined) updates.canAccessFinancialReports = canAccessFinancialReports;
    if (canAccessOperationalReports !== undefined) updates.canAccessOperationalReports = canAccessOperationalReports;
    if (canAccessCustomerReports !== undefined) updates.canAccessCustomerReports = canAccessCustomerReports;
    if (canAccessInsuranceReports !== undefined) updates.canAccessInsuranceReports = canAccessInsuranceReports;
    if (canAccessAuditReports !== undefined) updates.canAccessAuditReports = canAccessAuditReports;
    if (canAccessUserActivityReports !== undefined) updates.canAccessUserActivityReports = canAccessUserActivityReports;

    // Hash new password if provided
    if (password && password.trim().length > 0) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      updates.passwordHash = await hashPassword(password);
    }

    // Update user using storage layer (enforces immutable check)
    const updated = await storage.updateUser(userId, updates);

    // Create audit log - only log fields that were explicitly supplied AND changed
    // Include before/after values for complete audit trail
    const changes = [];
    if (email !== undefined && email !== existingUser.email) changes.push(`email from "${existingUser.email}" to "${email}"`);
    if (role !== undefined && role !== existingUser.role) changes.push(`role from "${existingUser.role}" to "${role}"`);
    if (password && password.trim().length > 0) changes.push('password (updated)');
    if (canCloseContracts !== undefined && canCloseContracts !== existingUser.canCloseContracts) {
      changes.push(`canCloseContracts from ${existingUser.canCloseContracts} to ${canCloseContracts}`);
    }
    if (canViewAllContracts !== undefined && canViewAllContracts !== existingUser.canViewAllContracts) {
      changes.push(`canViewAllContracts from ${existingUser.canViewAllContracts} to ${canViewAllContracts}`);
    }
    if (canAccessRevenueTrends !== undefined && canAccessRevenueTrends !== existingUser.canAccessRevenueTrends) {
      changes.push(`canAccessRevenueTrends from ${existingUser.canAccessRevenueTrends} to ${canAccessRevenueTrends}`);
    }
    if (canAccessFleetPerformance !== undefined && canAccessFleetPerformance !== existingUser.canAccessFleetPerformance) {
      changes.push(`canAccessFleetPerformance from ${existingUser.canAccessFleetPerformance} to ${canAccessFleetPerformance}`);
    }
    if (canAccessContractAnalytics !== undefined && canAccessContractAnalytics !== existingUser.canAccessContractAnalytics) {
      changes.push(`canAccessContractAnalytics from ${existingUser.canAccessContractAnalytics} to ${canAccessContractAnalytics}`);
    }
    if (canAccessCollectionPerformance !== undefined && canAccessCollectionPerformance !== existingUser.canAccessCollectionPerformance) {
      changes.push(`canAccessCollectionPerformance from ${existingUser.canAccessCollectionPerformance} to ${canAccessCollectionPerformance}`);
    }
    if (canAccessFinancialReports !== undefined && canAccessFinancialReports !== existingUser.canAccessFinancialReports) {
      changes.push(`canAccessFinancialReports from ${existingUser.canAccessFinancialReports} to ${canAccessFinancialReports}`);
    }
    if (canAccessOperationalReports !== undefined && canAccessOperationalReports !== existingUser.canAccessOperationalReports) {
      changes.push(`canAccessOperationalReports from ${existingUser.canAccessOperationalReports} to ${canAccessOperationalReports}`);
    }
    if (canAccessCustomerReports !== undefined && canAccessCustomerReports !== existingUser.canAccessCustomerReports) {
      changes.push(`canAccessCustomerReports from ${existingUser.canAccessCustomerReports} to ${canAccessCustomerReports}`);
    }
    if (canAccessInsuranceReports !== undefined && canAccessInsuranceReports !== existingUser.canAccessInsuranceReports) {
      changes.push(`canAccessInsuranceReports from ${existingUser.canAccessInsuranceReports} to ${canAccessInsuranceReports}`);
    }
    if (canAccessAuditReports !== undefined && canAccessAuditReports !== existingUser.canAccessAuditReports) {
      changes.push(`canAccessAuditReports from ${existingUser.canAccessAuditReports} to ${canAccessAuditReports}`);
    }
    if (canAccessUserActivityReports !== undefined && canAccessUserActivityReports !== existingUser.canAccessUserActivityReports) {
      changes.push(`canAccessUserActivityReports from ${existingUser.canAccessUserActivityReports} to ${canAccessUserActivityReports}`);
    }
    
    if (changes.length > 0) {
      await createAuditLog(adminId, 'edit', undefined, req, `Updated user ${existingUser.username}: ${changes.join(', ')}`);
    }

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: error.message || "Failed to update user" });
  }
});

/**
 * POST /api/users/:id/disable
 * Disable user (Admin only, cannot disable immutable users)
 */
router.post("/:id/disable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const user = await storage.disableUser(req.params.id, adminId);
    
    // Create audit log
    await createAuditLog(adminId, 'disable', undefined, req, `Disabled user ${user.username}`);
    
    res.json(user);
  } catch (error: any) {
    console.error("Error disabling user:", error);
    res.status(400).json({ message: error.message || "Failed to disable user" });
  }
});

/**
 * POST /api/users/:id/enable
 * Enable user (Admin only)
 */
router.post("/:id/enable", isAuthenticated, requireAdmin, async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const user = await storage.enableUser(req.params.id);
    
    // Create audit log
    await createAuditLog(adminId, 'enable', undefined, req, `Enabled user ${user.username}`);
    
    res.json(user);
  } catch (error: any) {
    console.error("Error enabling user:", error);
    res.status(400).json({ message: error.message || "Failed to enable user" });
  }
});

/**
 * POST /api/users/change-password
 * Change password (authenticated users can change their own password)
 */
router.post("/change-password", isAuthenticated, async (req: any, res) => {
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
    await createAuditLog(userId, 'edit', undefined, req, `Changed password`);

    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res.status(400).json({ message: error.message || "Failed to change password" });
  }
});

export default router;
