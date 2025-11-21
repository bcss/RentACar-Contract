/**
 * Analytics Routes Module
 * Predictive analytics, forecasting, risk scoring
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth/localAuth";
import type { User } from "@shared/schema";

const router = Router();

// GET /api/analytics/revenue-forecast - Revenue forecast
router.get("/revenue-forecast", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const forecast = await storage.getRevenueForecast(months);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/fleet-utilization - Fleet utilization prediction
router.get("/fleet-utilization", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const utilization = await storage.getFleetUtilizationPrediction(days);
    res.json(utilization);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/churn-risk - Customer churn risk
router.get("/churn-risk", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 0.7;
    const customers = await storage.getCustomerChurnRisk(threshold);
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/maintenance-forecast - Maintenance cost forecast
router.get("/maintenance-forecast", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const forecast = await storage.getMaintenanceCostForecast(months);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/payment-default - Payment default prediction
router.get("/payment-default", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 0.6;
    const contracts = await storage.getPaymentDefaultPrediction(threshold);
    res.json(contracts);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/location-demand - Location demand forecast
router.get("/location-demand", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const demand = await storage.getLocationDemandForecast(days);
    res.json(demand);
  } catch (error) {
    next(error);
  }
});

// POST /api/analytics/risk-score/recalculate - Recalculate risk scores
router.post("/risk-score/recalculate", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const customerId = req.body.customerId as string | undefined;
    
    if (customerId) {
      await storage.recalculateCustomerRiskScore(customerId);
      res.json({ message: "Risk score recalculated for customer" });
    } else {
      await storage.recalculateAllRiskScores();
      res.json({ message: "Risk scores recalculated for all customers" });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
