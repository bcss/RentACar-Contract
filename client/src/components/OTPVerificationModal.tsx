import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, Shield, CheckCircle2, XCircle, Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OTPVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "contract" | "amendment" | "extension";
  entityId: string;
  purpose: "activation" | "closure" | "amendment_approval" | "extension_approval";
  recipientType: "hirer" | "sponsor" | "driver";
  recipientId: string;
  recipientName?: string;
  branchId?: string;
  deliveryChannel?: "sms" | "email" | "both";
  onVerificationSuccess: () => void;
  onVerificationFailed?: () => void;
}

export function OTPVerificationModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  purpose,
  recipientType,
  recipientId,
  recipientName,
  branchId,
  deliveryChannel = "sms",
  onVerificationSuccess,
  onVerificationFailed,
}: OTPVerificationModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [step, setStep] = useState<"generating" | "input" | "verified" | "failed">("generating");
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [maskedContact, setMaskedContact] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const isRTL = i18n.language === "ar";

  const purposeLabels: Record<string, { en: string; ar: string }> = {
    activation: { en: "Contract Activation", ar: "تفعيل العقد" },
    closure: { en: "Contract Closure", ar: "إغلاق العقد" },
    amendment_approval: { en: "Amendment Approval", ar: "الموافقة على التعديل" },
    extension_approval: { en: "Extension Approval", ar: "الموافقة على التمديد" },
  };

  const channelLabels: Record<string, { en: string; ar: string }> = {
    sms: { en: "SMS", ar: "رسالة نصية" },
    email: { en: "Email", ar: "البريد الإلكتروني" },
    both: { en: "SMS & Email", ar: "رسالة نصية والبريد الإلكتروني" },
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/otp/generate", {
        entityType,
        entityId,
        purpose,
        recipientType,
        recipientId,
        deliveryChannel,
        branchId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setVerificationId(data.verificationId);
        setExpiresAt(new Date(data.expiresAt));
        setMaskedContact(data.recipientMasked || "");
        setStep("input");
        setResendCooldown(60);
        const channelLabel = isRTL ? channelLabels[deliveryChannel]?.ar : channelLabels[deliveryChannel]?.en;
        toast({
          title: isRTL ? "تم إرسال رمز التحقق" : "OTP Sent",
          description: isRTL 
            ? `تم إرسال رمز التحقق عبر ${channelLabel}`
            : `A verification code has been sent via ${channelLabel}.`,
        });
      } else {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: data.error || (isRTL ? "فشل في إنشاء رمز التحقق" : "Failed to generate OTP"),
          variant: "destructive",
        });
        setStep("failed");
      }
    },
    onError: (error) => {
      console.error("OTP generation error:", error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء رمز التحقق" : "Failed to generate OTP",
        variant: "destructive",
      });
      setStep("failed");
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!verificationId) throw new Error("No verification ID");
      const response = await apiRequest("POST", `/api/otp/validate/${verificationId}`, {
        otpCode,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep("verified");
        toast({
          title: t("otp.verified", "Verified"),
          description: t("otp.verifiedDescription", "OTP verification successful."),
        });
        setTimeout(() => {
          onVerificationSuccess();
          onOpenChange(false);
        }, 1500);
      } else {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        if (data.errorCode === "EXPIRED") {
          toast({
            title: t("otp.expired", "OTP Expired"),
            description: t("otp.expiredDescription", "Please request a new code."),
            variant: "destructive",
          });
          setStep("failed");
        } else if (data.errorCode === "MAX_ATTEMPTS") {
          toast({
            title: t("otp.maxAttempts", "Maximum Attempts"),
            description: t("otp.maxAttemptsDescription", "Too many incorrect attempts. Please request a new code."),
            variant: "destructive",
          });
          setStep("failed");
        } else {
          toast({
            title: t("otp.invalid", "Invalid Code"),
            description: data.error || t("otp.invalidDescription", "The code you entered is incorrect."),
            variant: "destructive",
          });
        }
      }
    },
    onError: (error) => {
      console.error("OTP validation error:", error);
      toast({
        title: t("otp.error", "Error"),
        description: t("otp.validationFailed", "Failed to validate OTP"),
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!verificationId) throw new Error("No verification ID");
      const response = await apiRequest("POST", `/api/otp/resend/${verificationId}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setOtpCode("");
        setRemainingAttempts(3);
        setExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
        setStep("input");
        setResendCooldown(60);
        toast({
          title: isRTL ? "تم إعادة إرسال الرمز" : "Code Resent",
          description: isRTL ? "تم إرسال رمز تحقق جديد." : "A new verification code has been sent.",
        });
      } else {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: data.error || (isRTL ? "فشل في إعادة إرسال الرمز" : "Failed to resend code"),
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("OTP resend error:", error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إعادة إرسال الرمز" : "Failed to resend code",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (open && step === "generating") {
      generateMutation.mutate();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep("generating");
      setOtpCode("");
      setVerificationId(null);
      setExpiresAt(null);
      setRemainingAttempts(3);
      setMaskedContact("");
      setResendCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        setTimeRemaining(remaining);
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      validateMutation.mutate();
    }
  };

  const handleRetry = () => {
    setStep("generating");
    setOtpCode("");
    generateMutation.mutate();
  };

  const getPurposeLabel = () => {
    const labels = purposeLabels[purpose];
    return isRTL ? labels?.ar : labels?.en;
  };

  const getChannelIcon = () => {
    if (deliveryChannel === "email") return <Mail className="h-4 w-4" />;
    if (deliveryChannel === "both") return <><Phone className="h-4 w-4" /><Mail className="h-4 w-4" /></>;
    return <Phone className="h-4 w-4" />;
  };

  const canSubmit = otpCode.length === 6 && timeRemaining > 0 && remainingAttempts > 0;
  const canResend = resendCooldown === 0 && !resendMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" data-testid="modal-otp-verification" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="title-otp-verification">
            <Shield className="h-5 w-5" />
            {isRTL ? "التحقق بالرمز" : "OTP Verification"}
          </DialogTitle>
          <DialogDescription data-testid="description-otp-purpose">
            {getPurposeLabel()}
            {recipientName && (
              <span className="block mt-1 font-medium" data-testid="text-recipient-name">
                {isRTL ? "لـ" : "For"}: {recipientName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-8" data-testid="status-otp-generating">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {isRTL ? "جاري إنشاء رمز التحقق..." : "Generating verification code..."}
              </p>
            </div>
          )}

          {step === "input" && (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-otp-input">
              <div className="text-center mb-4">
                {maskedContact && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2" data-testid="text-masked-contact">
                    {getChannelIcon()}
                    <span>{maskedContact}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-2" data-testid="text-otp-instructions">
                  {isRTL ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit verification code"}
                </p>
                {timeRemaining > 0 ? (
                  <p className="text-sm font-medium" data-testid="text-otp-timer">
                    {isRTL ? "ينتهي خلال" : "Expires in"}: {formatTime(timeRemaining)}
                  </p>
                ) : (
                  <p className="text-sm text-destructive font-medium" data-testid="text-otp-expired">
                    {isRTL ? "انتهت صلاحية الرمز" : "Code expired"}
                  </p>
                )}
              </div>

              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono h-14 rounded-none"
                autoFocus
                data-testid="input-otp-code"
              />

              {remainingAttempts < 3 && remainingAttempts > 0 && (
                <p className="text-sm text-amber-600 text-center" data-testid="text-attempts-remaining">
                  {isRTL ? `المحاولات المتبقية: ${remainingAttempts}` : `Attempts remaining: ${remainingAttempts}`}
                </p>
              )}

              {remainingAttempts === 0 && (
                <p className="text-sm text-destructive text-center" data-testid="text-no-attempts">
                  {isRTL ? "لا توجد محاولات متبقية" : "No attempts remaining"}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-none"
                  onClick={() => resendMutation.mutate()}
                  disabled={!canResend}
                  data-testid="button-resend-otp"
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  )}
                  {resendCooldown > 0 
                    ? `${isRTL ? "إعادة الإرسال" : "Resend"} (${resendCooldown}s)` 
                    : (isRTL ? "إعادة الإرسال" : "Resend")
                  }
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-none"
                  disabled={!canSubmit || validateMutation.isPending}
                  data-testid="button-verify-otp"
                >
                  {validateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isRTL ? "تحقق" : "Verify"
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === "verified" && (
            <div className="flex flex-col items-center justify-center py-8" data-testid="status-otp-verified">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-600" data-testid="text-verification-success">
                {isRTL ? "تم التحقق بنجاح" : "Verification Successful"}
              </p>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col items-center justify-center py-8" data-testid="status-otp-failed">
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium text-destructive mb-4" data-testid="text-verification-failed">
                {isRTL ? "فشل التحقق" : "Verification Failed"}
              </p>
              <Button
                onClick={handleRetry}
                className="rounded-none"
                data-testid="button-retry-otp"
              >
                {isRTL ? "إعادة المحاولة" : "Try Again"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
