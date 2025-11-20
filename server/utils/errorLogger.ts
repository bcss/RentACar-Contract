import type { Request } from "express";
import { storage } from "../storage";
import { sanitizeRequestData } from "../index";

/**
 * Log system errors to database with full context
 */
export async function logSystemError(
  error: any,
  req: Request,
  additionalContext?: Record<string, any>
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    await storage.createSystemError({
      errorType: error.name || "UnknownError",
      errorMessage: error.message || "An unknown error occurred",
      errorStack: error.stack,
      userId: userId,
      endpoint: req.path,
      method: req.method,
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      additionalData: JSON.stringify({
        body: sanitizeRequestData(req.body),
        query: sanitizeRequestData(req.query),
        params: req.params,
        ...additionalContext,
      }),
    });
  } catch (logError) {
    console.error("Failed to log system error:", logError);
  }
}
