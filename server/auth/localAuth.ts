import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import { verifyPassword } from "./passwordUtils";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
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
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", true);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

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
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        // Create audit log for login
        try {
          await storage.createAuditLog({
            userId: user.id,
            action: 'login',
            ipAddress: req.ip,
            details: `User ${user.username} logged in`,
          });
        } catch (error) {
          console.error("Error creating audit log:", error);
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
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", async (req, res) => {
    const user = req.user as any;
    
    if (user) {
      try {
        await storage.createAuditLog({
          userId: user.id,
          action: 'logout',
          ipAddress: req.ip,
          details: `User ${user.username} logged out`,
        });
      } catch (error) {
        console.error("Error creating audit log:", error);
      }
    }

    req.logout(() => {
      res.json({ message: "Logged out successfully" });
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
