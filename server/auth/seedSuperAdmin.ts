import { storage } from "../storage";
import { hashPassword } from "./passwordUtils";

export async function seedSuperAdmin() {
  const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";

  try {
    // Check if super admin already exists
    const existing = await storage.getUserByUsername(username);
    
    if (existing) {
      console.log("Super admin already exists");
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
      console.log(`  Password: ${password} (default - please change immediately)`);
    }
  } catch (error) {
    console.error("Error seeding super admin:", error);
    throw error;
  }
}
