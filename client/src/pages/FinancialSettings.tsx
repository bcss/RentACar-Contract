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

export default function FinancialSettings() {
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
      currencyEn: form.getValues('currencyEn'),
      currencyAr: form.getValues('currencyAr'),
      vatPercentage: form.getValues('vatPercentage'),
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
          <h1 className="text-3xl font-bold">Financial Settings</h1>
          <p className="text-muted-foreground mt-1">Configure currency and VAT settings</p>
        </div>

        <Form {...form}>
          <Card>
            <CardHeader>
              <CardTitle>Currency & VAT Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currencyEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency (English)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AED" data-testid="input-currency-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencyAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العملة (عربي)</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-right" dir="rtl" placeholder="د.إ" data-testid="input-currency-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vatPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Percentage (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="5" data-testid="input-vat-percentage" />
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
                data-testid="button-save-financial-settings"
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
