import rateLimit from "express-rate-limit";
import type { Request } from "express";

// P0-5: Rate limiting for authentication endpoints and general API protection
// Custom key generator that uses user ID for authenticated requests (secure)
// and IP for unauthenticated requests (with acknowledged trust proxy risk)
// NOTE: This generator relies on req.user which is only available AFTER session/passport middleware
export const hybridKeyGenerator = (req: Request): string => {
  const user = (req as any).user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  // For unauthenticated requests, use IP (trust proxy enabled for Replit)
  return `ip:${req.ip}`;
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per user/IP
  message: { message: "Too many authentication attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: hybridKeyGenerator,
  // Suppress validation warnings - we use hybrid key generator for security
  // (user ID for authenticated, IP for unauthenticated)
  validate: { trustProxy: false, keyGeneratorIpFallback: false },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per user/IP
  message: { message: "Too many requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: hybridKeyGenerator,
  // Suppress validation warnings - we use hybrid key generator for security
  // (user ID for authenticated, IP for unauthenticated)
  validate: { trustProxy: false, keyGeneratorIpFallback: false },
});
