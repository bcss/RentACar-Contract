import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import { verifyPassword } from "./passwordUtils";
import { getGeolocation } from "../services/geolocation";

export function getSession() {
  // Session TTL is configurable via SESSION_MAX_AGE environment variable
  // Default: 1 hour for security (3600000 ms)
  // Common values: 1 hour (3600000), 8 hours (28800000), 24 hours (86400000), 7 days (604800000)
  const rawSessionTtl = parseInt(process.env.SESSION_MAX_AGE || '3600000', 10);
  
  // Validate SESSION_MAX_AGE: minimum 5 minutes (300000ms), maximum 30 days (2592000000ms)
  const MIN_SESSION_TTL = 5 * 60 * 1000; // 5 minutes
  const MAX_SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  if (isNaN(rawSessionTtl) || rawSessionTtl < MIN_SESSION_TTL || rawSessionTtl > MAX_SESSION_TTL) {
    console.warn(`⚠️  Invalid SESSION_MAX_AGE: ${process.env.SESSION_MAX_AGE}. Using default: 1 hour (3600000ms)`);
    console.warn(`   Valid range: ${MIN_SESSION_TTL}ms (5 min) to ${MAX_SESSION_TTL}ms (30 days)`);
  }
  
  const sessionTtl = (isNaN(rawSessionTtl) || rawSessionTtl < MIN_SESSION_TTL || rawSessionTtl > MAX_SESSION_TTL) 
    ? 3600000 // 1 hour default
    : rawSessionTtl;
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // P0-2: Always require HTTPS for session cookies
      sameSite: 'strict', // P0-2: Prevent cross-site cookie transmission (CSRF protection)
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", true);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // P1-2: Add idle timeout middleware (15 minutes)
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  
  app.use((req, res, next) => {
    if (req.session && req.user) {
      const now = Date.now();
      const lastActivity = (req.session as any).lastActivity || now;
      
      // Check if session has been idle for too long
      if (now - lastActivity > IDLE_TIMEOUT) {
        // Session expired due to inactivity
        req.logout((err) => {
          if (err) console.error('Logout error during idle timeout:', err);
          req.session.destroy((err) => {
            if (err) console.error('Session destroy error:', err);
            res.status(401).json({ 
              message: 'Session expired due to inactivity. Please log in again.',
              sessionExpired: true
            });
          });
        });
        return;
      }
      
      // Update last activity timestamp (rolling expiration)
      (req.session as any).lastActivity = now;
    }
    next();
  });

  // Local Strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, cb) => {
    cb(null, (user as any).id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const username = req.body.username;
      
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!user) {
        // Log failed login attempt
        try {
          const geolocation = ipAddress ? await getGeolocation(ipAddress) : null;
          
          await storage.createAccessLog({
            outcome: 'failure',
            username: username || 'unknown',
            userId: null,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            country: geolocation?.country || null,
            city: geolocation?.city || null,
            failureReason: info?.message || 'Authentication failed',
          });
        } catch (error) {
          console.error("Error creating access log for failed login:", error);
        }
        
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      // P0-1: CRITICAL FIX - Regenerate session on login to prevent session fixation
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.error("Session regeneration error:", regenerateErr);
          return res.status(500).json({ message: "Login failed" });
        }

        req.login(user, async (loginErr) => {
          if (loginErr) {
            return res.status(500).json({ message: "Login failed" });
          }

          // Update last login timestamp
          try {
            await storage.updateLastLogin(user.id);
          } catch (error) {
            console.error("Error updating last login:", error);
          }

          // Create audit log for login
          try {
            const sessionId = req.session?.id;
            const geolocation = ipAddress ? await getGeolocation(ipAddress) : null;
            
            await storage.createAuditLog({
              userId: user.id,
              action: 'login',
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
              sessionId: sessionId || null,
              country: geolocation?.country || null,
              city: geolocation?.city || null,
              region: geolocation?.region || null,
              details: `User ${user.username} logged in`,
            });

            // Log successful login attempt in access logs
            await storage.createAccessLog({
              outcome: 'success',
              username: user.username,
              userId: user.id,
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
              country: geolocation?.country || null,
              city: geolocation?.city || null,
              failureReason: null,
            });
          } catch (error) {
            console.error("Error creating audit/access log:", error);
          }

          return res.json({ 
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isImmutable: user.isImmutable,
          });
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", async (req, res) => {
    const user = req.user as any;
    
    if (user) {
      try {
        const ipAddress = req.ip;
        const userAgent = req.get('user-agent');
        const sessionId = req.session?.id;
        const geolocation = ipAddress ? await getGeolocation(ipAddress) : {};
        
        await storage.createAuditLog({
          userId: user.id,
          action: 'logout',
          ipAddress,
          userAgent,
          sessionId,
          country: geolocation.country,
          city: geolocation.city,
          region: geolocation.region,
          details: `User ${user.username} logged out`,
        });
      } catch (error) {
        console.error("Error creating audit log:", error);
      }
    }

    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Role-based middleware
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

export const requireManagerOrAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return res.status(403).json({ message: "Forbidden: Manager or Admin access required" });
  }
  
  next();
};

// Task 13: Allow Staff, Manager, and Admin to perform editor-level actions (like confirming contracts)
export const requireEditor: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user || (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'staff')) {
    return res.status(403).json({ message: "Forbidden: Editor access required (Staff, Manager, or Admin)" });
  }
  
  next();
};

// Permission toggle middleware - Check if user can access reports
export const requireReportsAccess: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Admins and Managers have access by default, OR users with the toggle enabled
  if (user.role === 'admin' || user.role === 'manager' || user.canAccessReports === true) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden: Reports access required" });
};

// Permission toggle middleware - Check if user can close contracts
export const requireContractCloseAccess: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Only Admins by default, OR users with the toggle enabled
  if (user.role === 'admin' || user.canCloseContracts === true) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden: Contract closure access required" });
};

// Permission toggle middleware - Check if user can access app access reports
export const requireAppAccessReportAccess: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Admin or Manager roles, OR users with the toggle enabled
  if (user.role === 'admin' || user.role === 'manager' || user.canAccessAppAccessReport === true) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden: Access report permission required" });
};
