import { db } from '../db';
import { otpVerifications, customers, drivers, users } from '@shared/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { notificationService } from './notificationService';

export interface GenerateOTPParams {
  entityType: 'contract' | 'amendment' | 'extension';
  entityId: string;
  purpose: 'activation' | 'closure' | 'amendment_approval' | 'extension_approval';
  recipientType: 'hirer' | 'sponsor' | 'driver';
  recipientId: string;
  deliveryChannel?: 'sms' | 'email' | 'both';
  createdBy?: string;
  branchId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OTPResult {
  success: boolean;
  verificationId?: string;
  expiresAt?: Date;
  error?: string;
  deliveryStatus?: string;
  recipientMasked?: string;
}

export interface ValidateOTPParams {
  verificationId: string;
  otpCode: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  errorCode?: 'EXPIRED' | 'MAX_ATTEMPTS' | 'INVALID_CODE' | 'NOT_FOUND' | 'ALREADY_VERIFIED';
  remainingAttempts?: number;
  entityType?: string;
  entityId?: string;
  purpose?: string;
}

export interface ResendResult {
  success: boolean;
  error?: string;
  deliveryStatus?: string;
  nextResendAt?: Date;
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 3; // Per Master Spec Part 5.9 - 3 minutes, NOT 5
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;
const SALT_ROUNDS = 10;

// Rate limiting per Master Spec Part 8 - 3 OTPs per 10 min per user
const RATE_LIMIT_MAX_OTPS = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

class OTPService {
  // Rate limiting check - Per Master Spec Part 8
  private async checkRateLimit(recipientId: string, recipientType: string): Promise<{ allowed: boolean; error?: string }> {
    try {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
      
      const recentOtps = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.recipientId, recipientId),
            eq(otpVerifications.recipientType, recipientType),
            gt(otpVerifications.createdAt, windowStart)
          )
        );

      if (recentOtps.length >= RATE_LIMIT_MAX_OTPS) {
        const oldestOtp = recentOtps.sort((a, b) => 
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        )[0];
        const nextAllowedTime = new Date(new Date(oldestOtp.createdAt!).getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
        const waitSeconds = Math.ceil((nextAllowedTime.getTime() - Date.now()) / 1000);
        
        return { 
          allowed: false, 
          error: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_OTPS} OTPs per ${RATE_LIMIT_WINDOW_MINUTES} minutes. Please wait ${waitSeconds} seconds.`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('[OTPService] Rate limit check error:', error);
      return { allowed: true }; // Fail open to avoid blocking legitimate requests
    }
  }

  async generateOTP(params: GenerateOTPParams): Promise<OTPResult> {
    try {
      // Check rate limit first - Per Master Spec Part 8
      const rateLimitCheck = await this.checkRateLimit(params.recipientId, params.recipientType);
      if (!rateLimitCheck.allowed) {
        return { success: false, error: rateLimitCheck.error };
      }

      const recipient = await this.getRecipientContact(params.recipientType, params.recipientId);
      if (!recipient) {
        return { success: false, error: 'Recipient not found' };
      }

      if (!recipient.phone) {
        return { success: false, error: 'Recipient has no phone number registered' };
      }

      await this.invalidatePreviousOTPs(params.entityType, params.entityId, params.purpose);

      const rawOtp = this.generateRandomOTP();
      const hashedOtp = await bcrypt.hash(rawOtp, SALT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const [verification] = await db
        .insert(otpVerifications)
        .values({
          entityType: params.entityType,
          entityId: params.entityId,
          purpose: params.purpose,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientPhone: recipient.phone,
          recipientEmail: recipient.email || null,
          otpCode: hashedOtp,
          expiresAt,
          maxAttempts: MAX_ATTEMPTS,
          deliveryChannel: params.deliveryChannel || 'sms',
          createdBy: params.createdBy || null,
          branchId: params.branchId || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        } as any)
        .returning();

      const deliveryResult = await this.sendOTP({
        verificationId: verification.id,
        recipientPhone: recipient.phone,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        otp: rawOtp,
        channel: params.deliveryChannel || 'sms',
        purpose: params.purpose,
        entityType: params.entityType,
      });

      const maskedContact = this.maskContactInfo(
        recipient.phone,
        recipient.email,
        params.deliveryChannel || 'sms'
      );

      return {
        success: true,
        verificationId: verification.id,
        expiresAt,
        deliveryStatus: deliveryResult.status,
        recipientMasked: maskedContact,
      };
    } catch (error) {
      console.error('[OTPService] Error generating OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate OTP',
      };
    }
  }

  private maskContactInfo(phone?: string, email?: string | null, channel?: string): string {
    const parts: string[] = [];
    
    if ((channel === 'sms' || channel === 'both') && phone) {
      const maskedPhone = phone.slice(0, 4) + '****' + phone.slice(-2);
      parts.push(maskedPhone);
    }
    
    if ((channel === 'email' || channel === 'both') && email) {
      const [localPart, domain] = email.split('@');
      const maskedLocal = localPart.slice(0, 2) + '****';
      parts.push(`${maskedLocal}@${domain}`);
    }
    
    return parts.join(', ');
  }

  async validateOTP(params: ValidateOTPParams): Promise<ValidationResult> {
    try {
      const [verification] = await db
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.id, params.verificationId))
        .limit(1);

      if (!verification) {
        return { success: false, error: 'Verification not found', errorCode: 'NOT_FOUND' };
      }

      if (verification.verified) {
        return { success: false, error: 'OTP already verified', errorCode: 'ALREADY_VERIFIED' };
      }

      if (new Date() > new Date(verification.expiresAt)) {
        return { success: false, error: 'OTP has expired', errorCode: 'EXPIRED' };
      }

      if (verification.attempts >= verification.maxAttempts) {
        return { success: false, error: 'Maximum attempts exceeded', errorCode: 'MAX_ATTEMPTS' };
      }

      const isValid = await bcrypt.compare(params.otpCode, verification.otpCode);

      if (!isValid) {
        await db
          .update(otpVerifications)
          .set({
            attempts: verification.attempts + 1,
            ipAddress: params.ipAddress || verification.ipAddress,
            userAgent: params.userAgent || verification.userAgent,
          })
          .where(eq(otpVerifications.id, params.verificationId));

        const remainingAttempts = verification.maxAttempts - verification.attempts - 1;
        return {
          success: false,
          error: 'Invalid OTP code',
          errorCode: 'INVALID_CODE',
          remainingAttempts,
        };
      }

      await db
        .update(otpVerifications)
        .set({
          verified: true,
          verifiedAt: new Date(),
          ipAddress: params.ipAddress || verification.ipAddress,
          userAgent: params.userAgent || verification.userAgent,
        })
        .where(eq(otpVerifications.id, params.verificationId));

      return { 
        success: true,
        entityType: verification.entityType,
        entityId: verification.entityId,
        purpose: verification.purpose,
      };
    } catch (error) {
      console.error('[OTPService] Error validating OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate OTP',
      };
    }
  }

  async resendOTP(verificationId: string): Promise<ResendResult> {
    try {
      const [verification] = await db
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.id, verificationId))
        .limit(1);

      if (!verification) {
        return { success: false, error: 'Verification not found' };
      }

      if (verification.verified) {
        return { success: false, error: 'OTP already verified' };
      }

      if (new Date() > new Date(verification.expiresAt)) {
        return { success: false, error: 'OTP session expired. Please start a new verification.' };
      }

      if (verification.attempts >= verification.maxAttempts) {
        return { success: false, error: 'Maximum attempts exceeded. Please start a new verification.' };
      }

      if (verification.lastDeliveryAt) {
        const timeSinceLastDelivery = Date.now() - new Date(verification.lastDeliveryAt).getTime();
        if (timeSinceLastDelivery < RESEND_COOLDOWN_SECONDS * 1000) {
          const nextResendAt = new Date(
            new Date(verification.lastDeliveryAt).getTime() + RESEND_COOLDOWN_SECONDS * 1000
          );
          return {
            success: false,
            error: `Please wait before resending. Next resend available in ${Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastDelivery) / 1000)} seconds`,
            nextResendAt,
          };
        }
      }

      const rawOtp = this.generateRandomOTP();
      const hashedOtp = await bcrypt.hash(rawOtp, SALT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await db
        .update(otpVerifications)
        .set({
          otpCode: hashedOtp,
          expiresAt,
          attempts: 0,
          deliveryAttempts: verification.deliveryAttempts + 1,
          lastDeliveryAt: new Date(),
        })
        .where(eq(otpVerifications.id, verificationId));

      const recipient = await this.getRecipientContact(
        verification.recipientType as 'hirer' | 'sponsor' | 'driver',
        verification.recipientId
      );

      const deliveryResult = await this.sendOTP({
        verificationId,
        recipientPhone: verification.recipientPhone,
        recipientEmail: verification.recipientEmail || undefined,
        recipientName: recipient?.name || 'Customer',
        otp: rawOtp,
        channel: (verification.deliveryChannel as 'sms' | 'email' | 'both') || 'sms',
        purpose: verification.purpose as 'activation' | 'closure' | 'amendment_approval' | 'extension_approval',
        entityType: verification.entityType,
      });

      return {
        success: true,
        deliveryStatus: deliveryResult.status,
      };
    } catch (error) {
      console.error('[OTPService] Error resending OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend OTP',
      };
    }
  }

  async getVerificationStatus(verificationId: string): Promise<{
    exists: boolean;
    verified?: boolean;
    expired?: boolean;
    attemptsRemaining?: number;
    expiresAt?: Date;
  }> {
    try {
      const [verification] = await db
        .select()
        .from(otpVerifications)
        .where(eq(otpVerifications.id, verificationId))
        .limit(1);

      if (!verification) {
        return { exists: false };
      }

      const expired = new Date() > new Date(verification.expiresAt);

      return {
        exists: true,
        verified: verification.verified,
        expired,
        attemptsRemaining: Math.max(0, verification.maxAttempts - verification.attempts),
        expiresAt: verification.expiresAt,
      };
    } catch (error) {
      console.error('[OTPService] Error getting verification status:', error);
      return { exists: false };
    }
  }

  async checkEntityVerification(
    entityType: string,
    entityId: string,
    purpose: string
  ): Promise<boolean> {
    try {
      const [verification] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.entityType, entityType),
            eq(otpVerifications.entityId, entityId),
            eq(otpVerifications.purpose, purpose),
            eq(otpVerifications.verified, true)
          )
        )
        .limit(1);

      return !!verification;
    } catch (error) {
      console.error('[OTPService] Error checking entity verification:', error);
      return false;
    }
  }

  async getVerificationsByEntity(entityType: string, entityId: string): Promise<any[]> {
    try {
      return await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.entityType, entityType),
            eq(otpVerifications.entityId, entityId)
          )
        )
        .orderBy(desc(otpVerifications.createdAt));
    } catch (error) {
      console.error('[OTPService] Error getting verifications by entity:', error);
      return [];
    }
  }

  private generateRandomOTP(): string {
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  private async invalidatePreviousOTPs(
    entityType: string,
    entityId: string,
    purpose: string
  ): Promise<void> {
    await db
      .update(otpVerifications)
      .set({
        expiresAt: new Date(),
      })
      .where(
        and(
          eq(otpVerifications.entityType, entityType),
          eq(otpVerifications.entityId, entityId),
          eq(otpVerifications.purpose, purpose),
          eq(otpVerifications.verified, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );
  }

  private async getRecipientContact(
    recipientType: 'hirer' | 'sponsor' | 'driver',
    recipientId: string
  ): Promise<{ name: string; phone?: string; email?: string } | null> {
    try {
      if (recipientType === 'hirer') {
        const [customer] = await db
          .select()
          .from(customers)
          .where(eq(customers.id, recipientId))
          .limit(1);
        if (!customer) return null;
        return {
          name: customer.nameEn || customer.nameAr || 'Customer',
          phone: customer.phone || undefined,
          email: customer.email || undefined,
        };
      }

      if (recipientType === 'driver') {
        const [driver] = await db
          .select()
          .from(drivers)
          .where(eq(drivers.id, recipientId))
          .limit(1);
        if (!driver) return null;
        return {
          name: driver.nameEn || driver.nameAr || 'Driver',
          phone: driver.mobile || undefined,
          email: driver.email || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('[OTPService] Error getting recipient contact:', error);
      return null;
    }
  }

  private async sendOTP(params: {
    verificationId: string;
    recipientPhone: string;
    recipientEmail?: string;
    recipientName: string;
    otp: string;
    channel: 'sms' | 'email' | 'both';
    purpose: string;
    entityType: string;
  }): Promise<{ success: boolean; status: string }> {
    try {
      const purposeMessages: Record<string, { en: string; ar: string }> = {
        activation: {
          en: 'Contract Activation',
          ar: 'تفعيل العقد',
        },
        closure: {
          en: 'Contract Closure',
          ar: 'إغلاق العقد',
        },
        amendment_approval: {
          en: 'Amendment Approval',
          ar: 'الموافقة على التعديل',
        },
        extension_approval: {
          en: 'Extension Approval',
          ar: 'الموافقة على التمديد',
        },
      };

      const purposeText = purposeMessages[params.purpose] || { en: 'Verification', ar: 'التحقق' };

      const smsMessage = `Your verification code for ${purposeText.en} is: ${params.otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.

رمز التحقق الخاص بك لـ ${purposeText.ar} هو: ${params.otp}. صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق. لا تشارك هذا الرمز.`;

      let smsResult = { success: false };
      let emailResult = { success: false };

      if (params.channel === 'sms' || params.channel === 'both') {
        try {
          smsResult = await notificationService.sendDirectSms({
            recipient: params.recipientPhone,
            message: smsMessage,
          });

          if (smsResult.success) {
            await db
              .update(otpVerifications)
              .set({
                deliveryStatus: 'sent',
                lastDeliveryAt: new Date(),
              })
              .where(eq(otpVerifications.id, params.verificationId));
          }
        } catch (smsError) {
          console.error('[OTPService] SMS send error:', smsError);
        }
      }

      if ((params.channel === 'email' || params.channel === 'both') && params.recipientEmail) {
        try {
          emailResult = await notificationService.sendDirectEmail({
            recipient: params.recipientEmail,
            subject: `Your Verification Code - ${purposeText.en}`,
            message: `
Dear ${params.recipientName},

Your verification code for ${purposeText.en} is:

<strong style="font-size: 24px; letter-spacing: 4px;">${params.otp}</strong>

This code is valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.

---

عزيزي ${params.recipientName}،

رمز التحقق الخاص بك لـ ${purposeText.ar} هو:

<strong style="font-size: 24px; letter-spacing: 4px;">${params.otp}</strong>

هذا الرمز صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق. لا تشارك هذا الرمز مع أي شخص.
            `.trim(),
          });

          if (emailResult.success && !smsResult.success) {
            await db
              .update(otpVerifications)
              .set({
                deliveryStatus: 'sent',
                lastDeliveryAt: new Date(),
              })
              .where(eq(otpVerifications.id, params.verificationId));
          }
        } catch (emailError) {
          console.error('[OTPService] Email send error:', emailError);
        }
      }

      const overallSuccess = smsResult.success || emailResult.success;
      
      if (!overallSuccess) {
        await db
          .update(otpVerifications)
          .set({
            deliveryStatus: 'failed',
          })
          .where(eq(otpVerifications.id, params.verificationId));
      }

      return {
        success: overallSuccess,
        status: overallSuccess ? 'sent' : 'failed',
      };
    } catch (error) {
      console.error('[OTPService] Error sending OTP:', error);
      return { success: false, status: 'failed' };
    }
  }
  // Alias methods for backward compatibility with contractLifecycleService
  async verifyOTP(params: ValidateOTPParams): Promise<ValidationResult> {
    return this.validateOTP(params);
  }

  async verifyOtp(params: ValidateOTPParams): Promise<ValidationResult> {
    return this.validateOTP(params);
  }
}

export const otpService = new OTPService();
