import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { insertCompanySettingsSchema, type CompanySettings } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function CompanySettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
  });

  const form = useForm<z.infer<typeof insertCompanySettingsSchema>>({
    resolver: zodResolver(insertCompanySettingsSchema),
    defaultValues: {
      companyNameEn: "",
      companyNameAr: "",
      companyLegalNameEn: "",
      companyLegalNameAr: "",
      taglineEn: "",
      taglineAr: "",
      phone: "",
      phoneAr: "",
      mobile: "",
      mobileAr: "",
      email: "",
      website: "",
      addressEn: "",
      addressAr: "",
      logoUrl: "",
      currencyEn: "AED",
      currencyAr: "د.إ",
      vatPercentage: "5",
      termsSection1En: "",
      termsSection1Ar: "",
      termsSection2En: "",
      termsSection2Ar: "",
      termsSection3En: "",
      termsSection3Ar: "",
      paymentTermsFineEn: "",
      paymentTermsFineAr: "",
      paymentTermsBalanceEn: "",
      paymentTermsBalanceAr: "",
      paymentTermsFineWeekEn: "",
      paymentTermsFineWeekAr: "",
      paymentTermsSecurityEn: "",
      paymentTermsSecurityAr: "",
      paymentTermsAcknowledgeEn: "",
      paymentTermsAcknowledgeAr: "",
      paymentTermsInspectionEn: "",
      paymentTermsInspectionAr: "",
      paymentTermsRepairEn: "",
      paymentTermsRepairAr: "",
      paymentTermsAccidentNewLicenseEn: "",
      paymentTermsAccidentNewLicenseAr: "",
      paymentTermsAccidentGeneralEn: "",
      paymentTermsAccidentGeneralAr: "",
      clauseWriteoffEn: "",
      clauseWriteoffAr: "",
      clauseCreditAuthEn: "",
      clauseCreditAuthAr: "",
      clauseDesertProhibitionEn: "",
      clauseDesertProhibitionAr: "",
      clauseAccidentHirerFaultEn: "",
      clauseAccidentHirerFaultAr: "",
      clauseAccidentNotFaultEn: "",
      clauseAccidentNotFaultAr: "",
      clauseMonthlyPaymentEn: "",
      clauseMonthlyPaymentAr: "",
      clauseDailyKmLimitEn: "",
      clauseDailyKmLimitAr: "",
      clauseMonthlyKmLimitEn: "",
      clauseMonthlyKmLimitAr: "",
      clauseSelfRepairPenaltyEn: "",
      clauseSelfRepairPenaltyAr: "",
      clauseDailyRateDefaultEn: "",
      clauseDailyRateDefaultAr: "",
      clauseBackpageReferenceEn: "",
      clauseBackpageReferenceAr: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyNameEn: settings.companyNameEn,
        companyNameAr: settings.companyNameAr,
        companyLegalNameEn: settings.companyLegalNameEn,
        companyLegalNameAr: settings.companyLegalNameAr,
        taglineEn: settings.taglineEn,
        taglineAr: settings.taglineAr,
        phone: settings.phone,
        phoneAr: settings.phoneAr,
        mobile: settings.mobile,
        mobileAr: settings.mobileAr,
        email: settings.email,
        website: settings.website,
        addressEn: settings.addressEn,
        addressAr: settings.addressAr,
        logoUrl: settings.logoUrl || "",
        currencyEn: settings.currencyEn || "AED",
        currencyAr: settings.currencyAr || "د.إ",
        vatPercentage: settings.vatPercentage || "5",
        termsSection1En: settings.termsSection1En || "",
        termsSection1Ar: settings.termsSection1Ar || "",
        termsSection2En: settings.termsSection2En || "",
        termsSection2Ar: settings.termsSection2Ar || "",
        termsSection3En: settings.termsSection3En || "",
        termsSection3Ar: settings.termsSection3Ar || "",
        paymentTermsFineEn: settings.paymentTermsFineEn || "",
        paymentTermsFineAr: settings.paymentTermsFineAr || "",
        paymentTermsBalanceEn: settings.paymentTermsBalanceEn || "",
        paymentTermsBalanceAr: settings.paymentTermsBalanceAr || "",
        paymentTermsFineWeekEn: settings.paymentTermsFineWeekEn || "",
        paymentTermsFineWeekAr: settings.paymentTermsFineWeekAr || "",
        paymentTermsSecurityEn: settings.paymentTermsSecurityEn || "",
        paymentTermsSecurityAr: settings.paymentTermsSecurityAr || "",
        paymentTermsAcknowledgeEn: settings.paymentTermsAcknowledgeEn || "",
        paymentTermsAcknowledgeAr: settings.paymentTermsAcknowledgeAr || "",
        paymentTermsInspectionEn: settings.paymentTermsInspectionEn || "",
        paymentTermsInspectionAr: settings.paymentTermsInspectionAr || "",
        paymentTermsRepairEn: settings.paymentTermsRepairEn || "",
        paymentTermsRepairAr: settings.paymentTermsRepairAr || "",
        paymentTermsAccidentNewLicenseEn: settings.paymentTermsAccidentNewLicenseEn || "",
        paymentTermsAccidentNewLicenseAr: settings.paymentTermsAccidentNewLicenseAr || "",
        paymentTermsAccidentGeneralEn: settings.paymentTermsAccidentGeneralEn || "",
        paymentTermsAccidentGeneralAr: settings.paymentTermsAccidentGeneralAr || "",
        clauseWriteoffEn: settings.clauseWriteoffEn || "",
        clauseWriteoffAr: settings.clauseWriteoffAr || "",
        clauseCreditAuthEn: settings.clauseCreditAuthEn || "",
        clauseCreditAuthAr: settings.clauseCreditAuthAr || "",
        clauseDesertProhibitionEn: settings.clauseDesertProhibitionEn || "",
        clauseDesertProhibitionAr: settings.clauseDesertProhibitionAr || "",
        clauseAccidentHirerFaultEn: settings.clauseAccidentHirerFaultEn || "",
        clauseAccidentHirerFaultAr: settings.clauseAccidentHirerFaultAr || "",
        clauseAccidentNotFaultEn: settings.clauseAccidentNotFaultEn || "",
        clauseAccidentNotFaultAr: settings.clauseAccidentNotFaultAr || "",
        clauseMonthlyPaymentEn: settings.clauseMonthlyPaymentEn || "",
        clauseMonthlyPaymentAr: settings.clauseMonthlyPaymentAr || "",
        clauseDailyKmLimitEn: settings.clauseDailyKmLimitEn || "",
        clauseDailyKmLimitAr: settings.clauseDailyKmLimitAr || "",
        clauseMonthlyKmLimitEn: settings.clauseMonthlyKmLimitEn || "",
        clauseMonthlyKmLimitAr: settings.clauseMonthlyKmLimitAr || "",
        clauseSelfRepairPenaltyEn: settings.clauseSelfRepairPenaltyEn || "",
        clauseSelfRepairPenaltyAr: settings.clauseSelfRepairPenaltyAr || "",
        clauseDailyRateDefaultEn: settings.clauseDailyRateDefaultEn || "",
        clauseDailyRateDefaultAr: settings.clauseDailyRateDefaultAr || "",
        clauseBackpageReferenceEn: settings.clauseBackpageReferenceEn || "",
        clauseBackpageReferenceAr: settings.clauseBackpageReferenceAr || "",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<z.infer<typeof insertCompanySettingsSchema>>) => {
      if (!settings) {
        throw new Error('Settings not loaded');
      }
      const fullData = {
        companyNameEn: settings.companyNameEn,
        companyNameAr: settings.companyNameAr,
        companyLegalNameEn: settings.companyLegalNameEn,
        companyLegalNameAr: settings.companyLegalNameAr,
        taglineEn: settings.taglineEn,
        taglineAr: settings.taglineAr,
        phone: settings.phone,
        phoneAr: settings.phoneAr,
        mobile: settings.mobile,
        mobileAr: settings.mobileAr,
        email: settings.email,
        website: settings.website,
        addressEn: settings.addressEn,
        addressAr: settings.addressAr,
        logoUrl: settings.logoUrl || "",
        currencyEn: settings.currencyEn || "AED",
        currencyAr: settings.currencyAr || "د.إ",
        vatPercentage: settings.vatPercentage || "5",
        termsSection1En: settings.termsSection1En || "",
        termsSection1Ar: settings.termsSection1Ar || "",
        termsSection2En: settings.termsSection2En || "",
        termsSection2Ar: settings.termsSection2Ar || "",
        termsSection3En: settings.termsSection3En || "",
        termsSection3Ar: settings.termsSection3Ar || "",
        paymentTermsFineEn: settings.paymentTermsFineEn || "",
        paymentTermsFineAr: settings.paymentTermsFineAr || "",
        paymentTermsBalanceEn: settings.paymentTermsBalanceEn || "",
        paymentTermsBalanceAr: settings.paymentTermsBalanceAr || "",
        paymentTermsFineWeekEn: settings.paymentTermsFineWeekEn || "",
        paymentTermsFineWeekAr: settings.paymentTermsFineWeekAr || "",
        paymentTermsSecurityEn: settings.paymentTermsSecurityEn || "",
        paymentTermsSecurityAr: settings.paymentTermsSecurityAr || "",
        paymentTermsAcknowledgeEn: settings.paymentTermsAcknowledgeEn || "",
        paymentTermsAcknowledgeAr: settings.paymentTermsAcknowledgeAr || "",
        paymentTermsInspectionEn: settings.paymentTermsInspectionEn || "",
        paymentTermsInspectionAr: settings.paymentTermsInspectionAr || "",
        paymentTermsRepairEn: settings.paymentTermsRepairEn || "",
        paymentTermsRepairAr: settings.paymentTermsRepairAr || "",
        paymentTermsAccidentNewLicenseEn: settings.paymentTermsAccidentNewLicenseEn || "",
        paymentTermsAccidentNewLicenseAr: settings.paymentTermsAccidentNewLicenseAr || "",
        paymentTermsAccidentGeneralEn: settings.paymentTermsAccidentGeneralEn || "",
        paymentTermsAccidentGeneralAr: settings.paymentTermsAccidentGeneralAr || "",
        clauseWriteoffEn: settings.clauseWriteoffEn || "",
        clauseWriteoffAr: settings.clauseWriteoffAr || "",
        clauseCreditAuthEn: settings.clauseCreditAuthEn || "",
        clauseCreditAuthAr: settings.clauseCreditAuthAr || "",
        clauseDesertProhibitionEn: settings.clauseDesertProhibitionEn || "",
        clauseDesertProhibitionAr: settings.clauseDesertProhibitionAr || "",
        clauseAccidentHirerFaultEn: settings.clauseAccidentHirerFaultEn || "",
        clauseAccidentHirerFaultAr: settings.clauseAccidentHirerFaultAr || "",
        clauseAccidentNotFaultEn: settings.clauseAccidentNotFaultEn || "",
        clauseAccidentNotFaultAr: settings.clauseAccidentNotFaultAr || "",
        clauseMonthlyPaymentEn: settings.clauseMonthlyPaymentEn || "",
        clauseMonthlyPaymentAr: settings.clauseMonthlyPaymentAr || "",
        clauseDailyKmLimitEn: settings.clauseDailyKmLimitEn || "",
        clauseDailyKmLimitAr: settings.clauseDailyKmLimitAr || "",
        clauseMonthlyKmLimitEn: settings.clauseMonthlyKmLimitEn || "",
        clauseMonthlyKmLimitAr: settings.clauseMonthlyKmLimitAr || "",
        clauseSelfRepairPenaltyEn: settings.clauseSelfRepairPenaltyEn || "",
        clauseSelfRepairPenaltyAr: settings.clauseSelfRepairPenaltyAr || "",
        clauseDailyRateDefaultEn: settings.clauseDailyRateDefaultEn || "",
        clauseDailyRateDefaultAr: settings.clauseDailyRateDefaultAr || "",
        clauseBackpageReferenceEn: settings.clauseBackpageReferenceEn || "",
        clauseBackpageReferenceAr: settings.clauseBackpageReferenceAr || "",
        ...data,
      };
      return await apiRequest('PUT', '/api/settings', fullData);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('settings.saved'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('settings.saveFailed'),
        variant: "destructive",
      });
    },
  });

  const saveSettings = () => {
    const data = {
      companyNameEn: form.getValues('companyNameEn'),
      companyNameAr: form.getValues('companyNameAr'),
      companyLegalNameEn: form.getValues('companyLegalNameEn'),
      companyLegalNameAr: form.getValues('companyLegalNameAr'),
      taglineEn: form.getValues('taglineEn'),
      taglineAr: form.getValues('taglineAr'),
      phone: form.getValues('phone'),
      phoneAr: form.getValues('phoneAr'),
      mobile: form.getValues('mobile'),
      mobileAr: form.getValues('mobileAr'),
      email: form.getValues('email'),
      website: form.getValues('website'),
      addressEn: form.getValues('addressEn'),
      addressAr: form.getValues('addressAr'),
      logoUrl: form.getValues('logoUrl'),
    };
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="material-icons text-6xl text-muted-foreground">lock</span>
        <p className="text-muted-foreground">{t('msg.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">Configure company information and contact details</p>
        </div>

        <Form {...form}>
          <Card>
            <CardHeader>
              <CardTitle>Company Information & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.companyNameEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-name-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.companyNameAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-company-name-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyLegalNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.companyLegalNameEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-legal-name-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyLegalNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.companyLegalNameAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-legal-name-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taglineEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.taglineEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-tagline-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taglineAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.taglineAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-tagline-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.phoneAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-phone-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.mobile')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-mobile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.mobileAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-mobile-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.website')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="addressEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.addressEn')}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.addressAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" data-testid="input-address-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.logoUrl')}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-logo-url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="button"
                onClick={saveSettings}
                disabled={updateMutation.isPending}
                data-testid="button-save-company-settings"
              >
                {updateMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </div>
    </div>
  );
}
