/**
 * Shared Route Helper Utilities
 * Common functions used across multiple route modules
 */

import { type Request } from "express";
import { storage } from "../storage";

/**
 * Validate search query length and format
 */
export function validateSearchQuery(query: string | undefined): { valid: boolean; error?: string } {
  if (!query) return { valid: true };
  
  const MAX_SEARCH_LENGTH = 100;
  
  if (query.length > MAX_SEARCH_LENGTH) {
    return { valid: false, error: `Search query cannot exceed ${MAX_SEARCH_LENGTH} characters` };
  }
  
  return { valid: true };
}

/**
 * Create audit log entry with geolocation tracking
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
    const sessionId = req.session?.id;
    
    await storage.createAuditLog({
      userId,
      action,
      contractId,
      details,
      ipAddress,
      userAgent,
      sessionId,
    } as any);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Parse pagination parameters from query string
 */
export function parsePaginationParams(query: any): { limit: number; offset: number; error?: string } {
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 1000;
  
  let limit = DEFAULT_LIMIT;
  let offset = 0;
  
  if (query.limit) {
    const parsedLimit = parseInt(query.limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return { limit: 0, offset: 0, error: "Invalid limit: must be a positive integer" };
    }
    if (parsedLimit > MAX_LIMIT) {
      return { limit: 0, offset: 0, error: `Limit cannot exceed ${MAX_LIMIT}` };
    }
    limit = parsedLimit;
  }
  
  if (query.offset) {
    const parsedOffset = parseInt(query.offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return { limit: 0, offset: 0, error: "Invalid offset: must be a non-negative integer" };
    }
    offset = parsedOffset;
  }
  
  return { limit, offset };
}
