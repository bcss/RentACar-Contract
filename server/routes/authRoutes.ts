import { Router } from "express";
import type { Request, Response } from "express";
import { isAuthenticated } from "../auth/localAuth";
import { csrfTokenGenerator } from "../middleware/csrf";
import { getPerformanceMetrics } from "../middleware/performanceMonitoring";
import { storage } from "../storage";
import { count } from "drizzle-orm";
import os from "os";

const router = Router();

// GET /api/csrf-token - Generate CSRF token
router.get('/csrf-token', csrfTokenGenerator);

// GET /api/auth/user - Get current authenticated user
router.get('/auth/user', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch user" });
  }
});

// GET /api/system/health - System health check
router.get('/system/health', isAuthenticated, async (req: any, res: Response) => {
  try {
    const [users, customers, vehicles, contracts, companies, sponsors] = await Promise.all([
      storage.getUserCount(),
      storage.getCustomerCount(),
      storage.getVehicleCount(),
      storage.getContractCount(),
      storage.getCompanyCount(),
      storage.getSponsorCount(),
    ]);

    const activeContracts = await storage.getActiveContractCount();
    const allVehicleInspections = await storage.getAllVehicleInspections();

    const totalRecords = users + customers + vehicles + contracts + companies + sponsors;
    const totalPhotos = allVehicleInspections.reduce((sum: number, inspection: any) => {
      return sum + (inspection.photos?.length || 0);
    }, 0);

    const avgPhotoSize = 50000; // ~50KB per photo
    const estimatedSize = totalPhotos * avgPhotoSize;
    const estimatedSizeKB = (estimatedSize / 1024).toFixed(2);

    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2);

    res.json({
      database: {
        status: 'healthy',
        message: 'Database connection is operational',
      },
      counts: {
        users,
        customers,
        vehicles,
        contracts,
        activeContracts,
        companies,
        sponsors,
      },
      storage: {
        totalRecords,
        totalPhotos,
        estimatedSize: estimatedSizeKB + ' KB',
      },
      system: {
        memory: {
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          percentage: memoryUsagePercent + '%',
        },
        uptime: (process.uptime() / 60).toFixed(2) + ' minutes',
        platform: process.platform,
        nodeVersion: process.version,
        cpus: os.cpus().length,
      },
    });
  } catch (error) {
    console.error("Error fetching system health:", error);
    res.status(500).json({ 
      database: {
        status: 'error',
        message: 'Failed to fetch system health',
      },
      counts: {
        users: 0,
        customers: 0,
        vehicles: 0,
        contracts: 0,
        activeContracts: 0,
        companies: 0,
        sponsors: 0,
      },
      storage: {
        totalRecords: 0,
        estimatedSize: '0 KB',
      },
    });
  }
});

// GET /api/system/performance - Performance metrics
router.get('/system/performance', isAuthenticated, async (req: any, res: Response) => {
  try {
    const metrics = getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch performance metrics" });
  }
});

export default router;
