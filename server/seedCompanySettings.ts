import { storage } from "./storage";

export async function seedCompanySettings() {
  try {
    // This will create the singleton row with default values if it doesn't exist
    await storage.getCompanySettings();
    console.log("Company settings seeded successfully");
  } catch (error) {
    console.error("Error seeding company settings:", error);
    throw error;
  }
}
