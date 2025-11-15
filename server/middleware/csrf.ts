import { RequestHandler } from 'express';
import crypto from 'crypto';

/**
 * P0-3: CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 * 
 * How it works:
 * 1. GET /api/csrf-token generates a token and sets it in a cookie
 * 2. Client includes token in X-CSRF-Token header for state-changing requests
 * 3. Server validates that cookie token matches header token
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generates a random CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to generate and send CSRF token
 * Add this to GET /api/csrf-token endpoint
 */
export const csrfTokenGenerator: RequestHandler = (req, res) => {
  const token = generateCsrfToken();
  
  // CRITICAL FIX: Set token in NON-HttpOnly cookie so JavaScript can read it
  // This allows the client to include the token in X-CSRF-Token header
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // MUST be false so client can read cookie value
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  
  // Also send token in response body for convenience
  res.json({ csrfToken: token });
};

/**
 * Middleware to validate CSRF token
 * Apply this to all POST/PATCH/DELETE/PUT endpoints
 */
export const csrfProtection: RequestHandler = (req, res, next) => {
  // Skip CSRF validation for:
  // 1. Login endpoint (no CSRF token available yet)
  // 2. CSRF token generation endpoint
  // 3. System error logging (error handling should not be blocked)
  const skipPaths = ['/api/login', '/api/csrf-token', '/api/system-errors/log'];
  
  if (skipPaths.includes(req.path)) {
    return next();
  }
  
  // Only validate on state-changing methods
  const protectedMethods = ['POST', 'PATCH', 'DELETE', 'PUT'];
  if (!protectedMethods.includes(req.method)) {
    return next();
  }
  
  // Get token from header
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  // Get token from cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  
  // Validate tokens exist and match
  if (!headerToken || !cookieToken) {
    return res.status(403).json({ 
      message: 'CSRF token missing. Please refresh the page and try again.',
      csrfError: true
    });
  }
  
  if (headerToken !== cookieToken) {
    return res.status(403).json({ 
      message: 'Invalid CSRF token. Possible CSRF attack detected.',
      csrfError: true
    });
  }
  
  // Token is valid, proceed
  next();
};
