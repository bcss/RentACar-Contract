import type { Request } from "express";
import { storage } from "../storage";
import { getGeolocation } from "../services/geolocation";

/**
 * Create audit log with enhanced tracking (geolocation, session, IP)
 */
export async function createAuditLog(
  userId: string,
  action: string,
  contractId: string | undefined,
  req: Request,
  details?: string
): Promise<void> {
  try {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const sessionId = (req as any).session?.id;
    
    const geolocation = ipAddress ? await getGeolocation(ipAddress) : {};
    
    await storage.createAuditLog({
      userId,
      action,
      contractId,
      ipAddress,
      userAgent,
      sessionId,
      country: geolocation.country,
      city: geolocation.city,
      region: geolocation.region,
      details,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

/**
 * Create access log for login attempts
 */
export async function createAccessLog(
  userId: string | null,
  action: string,
  success: boolean,
  req: Request,
  details?: string
): Promise<void> {
  try {
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const sessionId = (req as any).session?.id;
    
    const geolocation = ipAddress ? await getGeolocation(ipAddress) : {};
    
    await storage.createAccessLog({
      userId,
      action,
      success,
      ipAddress,
      userAgent,
      sessionId,
      country: geolocation.country,
      city: geolocation.city,
      region: geolocation.region,
      details,
    });
  } catch (error) {
    console.error("Error creating access log:", error);
  }
}
