import { storage } from "../storage";
import { hashPassword } from "./passwordUtils";

export async function seedSuperAdmin() {
  const isProduction = process.env.NODE_ENV === "production";
  const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
  
  // CRITICAL SECURITY: Require strong password in production
  if (isProduction && !process.env.SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "SUPER_ADMIN_PASSWORD environment variable is REQUIRED in production.\n" +
      "Generate a secure password with: openssl rand -base64 32\n" +
      "Set it in your environment before starting the application."
    );
  }
  
  // Only allow weak default password in development
  const password = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";

  try {
    // Check if super admin already exists
    const existing = await storage.getUserByUsername(username);
    
    if (existing) {
      // Update password for existing super admin
      const passwordHash = await hashPassword(password);
      await storage.updateUserPassword(existing.id, passwordHash);
      console.log("✓ Super admin password updated");
      console.log(`  Username: ${username}`);
      if (!process.env.SUPER_ADMIN_PASSWORD) {
        console.log(`  Password: ${password} (DEVELOPMENT MODE - Default password)`);
        console.log(`  ⚠️  WARNING: Change password immediately before deploying to production!`);
      }
      return;
    }

    // Create super admin
    const passwordHash = await hashPassword(password);
    
    await storage.createUser({
      username,
      passwordHash,
      email: "admin@system.local",
      firstName: "Super",
      lastName: "Admin",
      role: "admin",
      isImmutable: true,
    });

    console.log("✓ Super admin created successfully");
    console.log(`  Username: ${username}`);
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      console.log(`  Password: ${password} (DEVELOPMENT MODE - Default password)`);
      console.log(`  ⚠️  WARNING: Change password immediately before deploying to production!`);
    }
  } catch (error) {
    console.error("Error seeding super admin:", error);
    throw error;
  }
}
