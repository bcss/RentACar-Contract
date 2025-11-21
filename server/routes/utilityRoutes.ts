/**
 * Utility Routes Module
 * Miscellaneous utility endpoints (branding, QR codes, contract verification, performance monitoring)
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth/localAuth";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

const router = Router();

// ==================== PUBLIC BRANDING ====================

router.get("/branding", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await storage.getCompanySettings();
    res.json({
      companyNameEnglish: settings.companyNameEnglish,
      companyNameArabic: settings.companyNameArabic,
      primaryColor: settings.primaryColor,
      logoUrl: settings.logoUrl,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTRACT QR CODE ====================

router.get("/contracts/:id/qr", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await storage.getContractById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const secret = process.env.SESSION_SECRET || "fallback-secret";
    const token = jwt.sign(
      { contractId: contract.id, customerName: contract.customerName },
      secret,
      { expiresIn: "365d" }
    );

    const verificationUrl = `${req.protocol}://${req.get("host")}/verify-contract/${token}`;
    const qrCode = await QRCode.toDataURL(verificationUrl);

    res.json({ qrCode, verificationUrl, token });
  } catch (error) {
    next(error);
  }
});

// ==================== CONTRACT VERIFICATION ====================

router.get("/verify-contract/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = process.env.SESSION_SECRET || "fallback-secret";
    const decoded = jwt.verify(req.params.token, secret) as { contractId: string };

    const contract = await storage.getContractWithDetails(decoded.contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.json({
      valid: true,
      contract: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        customerName: contract.customerName,
        vehicle: `${contract.vehicleMake} ${contract.vehicleModel} (${contract.vehicleRegistration})`,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
      },
    });
  } catch (error) {
    res.status(400).json({ valid: false, message: "Invalid or expired token" });
  }
});

// ==================== PERFORMANCE MONITORING ====================

router.get("/performance-monitoring", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint serves the performance monitoring dashboard
    // The actual monitoring data is collected via APM middleware
    res.json({ message: "Performance monitoring dashboard - implementation pending" });
  } catch (error) {
    next(error);
  }
});

export default router;
