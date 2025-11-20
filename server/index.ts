import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { csrfProtection } from "./middleware/csrf";

// Sanitize request data to remove sensitive fields before logging
export function sanitizeRequestData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 'passwordhash', 'newpassword', 'currentpassword', 'confirmpassword',
    'token', 'accesstoken', 'refreshtoken', 'apikey', 'secret',
    'creditcard', 'cvv', 'ssn', 'pin', 'authorization', 'bearer'
  ];
  
  const sanitized: any = Array.isArray(data) ? [] : {};
  
  for (const key in data) {
    // Normalize key name by removing underscores, hyphens, and converting to lowercase
    // This catches: password, PASSWORD, pass_word, pass-word, etc.
    const normalizedKey = key.toLowerCase().replace(/[_-]/g, '');
    
    if (sensitiveFields.some(field => normalizedKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeRequestData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }
  
  return sanitized;
}

const app = express();

// P2-1: Add security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Vite in dev
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled components
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME sniffing
  xssFilter: true, // Enable XSS filter (legacy browsers)
}));

// Cookie parser for CSRF token validation
app.use(cookieParser());

// P1-4: CSRF Protection Middleware - validates all POST/PATCH/DELETE/PUT requests
app.use(csrfProtection);

// Increase payload limit for chart exports (base64 images can be large)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// NOTE: Rate limiters are defined in server/rateLimiters.ts and applied in:
// - server/auth/localAuth.ts for authentication endpoints (after session/passport setup)
// - server/routes.ts for general API endpoints (after setupAuth)

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // No truncation - log full information for debugging
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use(async (err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error to console
    console.error("Error:", err);

    // Log error to database
    try {
      const userId = (req as any).user?.id;
      await storage.createSystemError({
        errorType: err.name || "UnknownError",
        errorMessage: message,
        errorStack: err.stack,
        userId: userId,
        endpoint: req.path,
        method: req.method,
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        additionalData: JSON.stringify({
          body: sanitizeRequestData(req.body),
          query: sanitizeRequestData(req.query),
          params: sanitizeRequestData(req.params),
        }),
      });
    } catch (dbError) {
      // If database logging fails, log to console only
      console.error("Failed to log error to database:", dbError);
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Initialize Automation Orchestrator (cron jobs for background tasks)
  try {
    const { initializeAutomationOrchestrator } = await import('./services/automationOrchestrator');
    initializeAutomationOrchestrator();
  } catch (error) {
    console.error('[Server] Failed to initialize Automation Orchestrator:', error);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
