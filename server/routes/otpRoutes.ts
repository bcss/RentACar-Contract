import { Router, type Request, type Response, type NextFunction } from "express";
import { isAuthenticated, requireEditor } from "../auth/localAuth";
import { otpService } from "../services/otpService";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

const generateOtpSchema = z.object({
  entityType: z.enum(['contract', 'amendment', 'extension']),
  entityId: z.string().min(1),
  purpose: z.enum(['activation', 'closure', 'amendment_approval', 'extension_approval']),
  recipientType: z.enum(['hirer', 'sponsor', 'driver']),
  recipientId: z.string().min(1),
  deliveryChannel: z.enum(['sms', 'email', 'both']).optional(),
  branchId: z.string().optional(),
});

const validateOtpSchema = z.object({
  otpCode: z.string().length(6),
});

router.post("/generate", isAuthenticated, requireEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const validationResult = generateOtpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        error: fromZodError(validationResult.error).message 
      });
    }

    const result = await otpService.generateOTP({
      ...validationResult.data,
      createdBy: user.id,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    await createAuditLog(
      user.id,
      'otp_generated',
      validationResult.data.entityType === 'contract' ? validationResult.data.entityId : undefined,
      req,
      `OTP generated for ${validationResult.data.purpose} - ${validationResult.data.entityType}:${validationResult.data.entityId}`
    );

    res.status(201).json({
      success: true,
      verificationId: result.verificationId,
      expiresAt: result.expiresAt,
      deliveryStatus: result.deliveryStatus,
      recipientMasked: result.recipientMasked,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.post("/validate/:verificationId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const { verificationId } = req.params;
    const validationResult = validateOtpSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        error: fromZodError(validationResult.error).message 
      });
    }

    const result = await otpService.validateOTP({
      verificationId,
      otpCode: validationResult.data.otpCode,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    if (!result.success) {
      await createAuditLog(
        user.id,
        'otp_validation_failed',
        undefined,
        req,
        `OTP validation failed for ${verificationId}: ${result.errorCode}`
      );
      return res.status(400).json(result);
    }

    await createAuditLog(
      user.id,
      'otp_verified',
      undefined,
      req,
      `OTP verification successful for ${verificationId}`
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      entityType: result.entityType,
      entityId: result.entityId,
      purpose: result.purpose,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/resend/:verificationId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const { verificationId } = req.params;
    const result = await otpService.resendOTP(verificationId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    await createAuditLog(
      user.id,
      'otp_resent',
      undefined,
      req,
      `OTP resent for verification ${verificationId}`
    );

    res.json({
      success: true,
      message: 'OTP resent successfully',
      deliveryStatus: result.deliveryStatus,
      nextResendAt: result.nextResendAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/status/:verificationId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { verificationId } = req.params;
    const status = await otpService.getVerificationStatus(verificationId);

    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.get("/entity/:entityType/:entityId", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId } = req.params;
    const verifications = await otpService.getVerificationsByEntity(entityType, entityId);

    res.json(verifications);
  } catch (error) {
    next(error);
  }
});

router.get("/check/:entityType/:entityId/:purpose", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId, purpose } = req.params;
    const isVerified = await otpService.checkEntityVerification(entityType, entityId, purpose);

    res.json({ verified: isVerified });
  } catch (error) {
    next(error);
  }
});

export default router;
