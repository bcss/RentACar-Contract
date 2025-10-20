import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Settings() {
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

  // Reset form when settings data loads
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
      // Merge with persisted server data (not current form state) to avoid saving unsaved changes from other sections
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
        ...data, // Override only the fields being saved
      };
      return await apiRequest('PUT', '/api/settings', fullData);
    },
    onSuccess: (response) => {
      toast({
        title: t('common.success'),
        description: t('settings.saved'),
      });
      // Invalidate and refetch to get the latest server data
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

  const saveCompanyInfo = () => {
    const data = {
      companyNameEn: form.getValues('companyNameEn'),
      companyNameAr: form.getValues('companyNameAr'),
      companyLegalNameEn: form.getValues('companyLegalNameEn'),
      companyLegalNameAr: form.getValues('companyLegalNameAr'),
      taglineEn: form.getValues('taglineEn'),
      taglineAr: form.getValues('taglineAr'),
    };
    updateMutation.mutate(data);
  };

  const saveContactInfo = () => {
    const data = {
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

  const saveFinancialSettings = () => {
    const data = {
      currencyEn: form.getValues('currencyEn'),
      currencyAr: form.getValues('currencyAr'),
      vatPercentage: form.getValues('vatPercentage'),
    };
    updateMutation.mutate(data);
  };

  const saveTermsConditions = () => {
    const data = {
      termsSection1En: form.getValues('termsSection1En'),
      termsSection1Ar: form.getValues('termsSection1Ar'),
      termsSection2En: form.getValues('termsSection2En'),
      termsSection2Ar: form.getValues('termsSection2Ar'),
      termsSection3En: form.getValues('termsSection3En'),
      termsSection3Ar: form.getValues('termsSection3Ar'),
    };
    updateMutation.mutate(data);
  };

  const savePaymentTerms = () => {
    const data = {
      paymentTermsFineEn: form.getValues('paymentTermsFineEn'),
      paymentTermsFineAr: form.getValues('paymentTermsFineAr'),
      paymentTermsBalanceEn: form.getValues('paymentTermsBalanceEn'),
      paymentTermsBalanceAr: form.getValues('paymentTermsBalanceAr'),
      paymentTermsFineWeekEn: form.getValues('paymentTermsFineWeekEn'),
      paymentTermsFineWeekAr: form.getValues('paymentTermsFineWeekAr'),
      paymentTermsSecurityEn: form.getValues('paymentTermsSecurityEn'),
      paymentTermsSecurityAr: form.getValues('paymentTermsSecurityAr'),
      paymentTermsAcknowledgeEn: form.getValues('paymentTermsAcknowledgeEn'),
      paymentTermsAcknowledgeAr: form.getValues('paymentTermsAcknowledgeAr'),
      paymentTermsInspectionEn: form.getValues('paymentTermsInspectionEn'),
      paymentTermsInspectionAr: form.getValues('paymentTermsInspectionAr'),
      paymentTermsRepairEn: form.getValues('paymentTermsRepairEn'),
      paymentTermsRepairAr: form.getValues('paymentTermsRepairAr'),
      paymentTermsAccidentNewLicenseEn: form.getValues('paymentTermsAccidentNewLicenseEn'),
      paymentTermsAccidentNewLicenseAr: form.getValues('paymentTermsAccidentNewLicenseAr'),
      paymentTermsAccidentGeneralEn: form.getValues('paymentTermsAccidentGeneralEn'),
      paymentTermsAccidentGeneralAr: form.getValues('paymentTermsAccidentGeneralAr'),
    };
    updateMutation.mutate(data);
  };

  const saveContractClauses = () => {
    const data = {
      clauseWriteoffEn: form.getValues('clauseWriteoffEn'),
      clauseWriteoffAr: form.getValues('clauseWriteoffAr'),
      clauseCreditAuthEn: form.getValues('clauseCreditAuthEn'),
      clauseCreditAuthAr: form.getValues('clauseCreditAuthAr'),
      clauseDesertProhibitionEn: form.getValues('clauseDesertProhibitionEn'),
      clauseDesertProhibitionAr: form.getValues('clauseDesertProhibitionAr'),
      clauseAccidentHirerFaultEn: form.getValues('clauseAccidentHirerFaultEn'),
      clauseAccidentHirerFaultAr: form.getValues('clauseAccidentHirerFaultAr'),
      clauseAccidentNotFaultEn: form.getValues('clauseAccidentNotFaultEn'),
      clauseAccidentNotFaultAr: form.getValues('clauseAccidentNotFaultAr'),
      clauseMonthlyPaymentEn: form.getValues('clauseMonthlyPaymentEn'),
      clauseMonthlyPaymentAr: form.getValues('clauseMonthlyPaymentAr'),
      clauseDailyKmLimitEn: form.getValues('clauseDailyKmLimitEn'),
      clauseDailyKmLimitAr: form.getValues('clauseDailyKmLimitAr'),
      clauseMonthlyKmLimitEn: form.getValues('clauseMonthlyKmLimitEn'),
      clauseMonthlyKmLimitAr: form.getValues('clauseMonthlyKmLimitAr'),
      clauseSelfRepairPenaltyEn: form.getValues('clauseSelfRepairPenaltyEn'),
      clauseSelfRepairPenaltyAr: form.getValues('clauseSelfRepairPenaltyAr'),
      clauseDailyRateDefaultEn: form.getValues('clauseDailyRateDefaultEn'),
      clauseDailyRateDefaultAr: form.getValues('clauseDailyRateDefaultAr'),
      clauseBackpageReferenceEn: form.getValues('clauseBackpageReferenceEn'),
      clauseBackpageReferenceAr: form.getValues('clauseBackpageReferenceAr'),
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
          <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.companyInfo')}</CardTitle>
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={saveCompanyInfo}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-company-info"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Input {...field} value={field.value || ''} placeholder="https://example.com/logo.png" data-testid="input-logo-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={saveContactInfo}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-contact-info"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>

            {/* Financial Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.financialSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currencyEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.currencyEn')}</FormLabel>
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
                        <FormLabel>{t('settings.currencyAr')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="د.إ" data-testid="input-currency-ar" />
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
                      <FormLabel>{t('settings.vatPercentage')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5" data-testid="input-vat-percentage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={saveFinancialSettings}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-financial-settings"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>

            {/* Payment Terms & Fine Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms & Fine Conditions / شروط الدفع والغرامات</CardTitle>
                <CardDescription>Configure payment terms, fine conditions, and liability clauses for rental contracts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fine Per Item */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsFineEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine Per Item (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-payment-fine-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsFineAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>غرامة لكل عنصر (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-fine-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Balance Clearance */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsBalanceEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance Clearance (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-payment-balance-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsBalanceAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تصفية الرصيد (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-balance-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fine Clearance Week */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsFineWeekEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine Clearance Within Week (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-payment-fine-week-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsFineWeekAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تصفية الغرامة خلال أسبوع (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-fine-week-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Security Deposit Retention */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsSecurityEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit Retention (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-payment-security-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsSecurityAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاحتفاظ بالوديعة (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-security-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Acknowledgement */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsAcknowledgeEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acknowledgement (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-payment-acknowledge-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsAcknowledgeAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>إقرار (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-acknowledge-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Vehicle Inspection */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsInspectionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Inspection Clause (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm"
                            data-testid="textarea-payment-inspection-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsInspectionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بند فحص المركبة (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-inspection-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Repair Clause */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsRepairEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair & Renewal Clause (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-payment-repair-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsRepairAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بند الإصلاح والتجديد (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-repair-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accident - New License */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsAccidentNewLicenseEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Liability - New License (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="text-sm"
                            data-testid="textarea-payment-accident-new-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsAccidentNewLicenseAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مسؤولية الحادث - رخصة جديدة (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-accident-new-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accident - General */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsAccidentGeneralEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Liability - General (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm"
                            data-testid="textarea-payment-accident-general-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentTermsAccidentGeneralAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مسؤولية الحادث - عامة (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-payment-accident-general-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={savePaymentTerms}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-payment-terms"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>

            {/* Additional Contract Clauses */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Contract Clauses / البنود التعاقدية الإضافية</CardTitle>
                <CardDescription>Configure additional contract terms including write-off, authorization, restrictions, and liability clauses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Write-Off & Confiscation */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseWriteoffEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Write-Off & Confiscation Compensation (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="text-sm"
                            data-testid="textarea-clause-writeoff-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseWriteoffAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تعويض الإطفاء والمصادرة (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-writeoff-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Credit Card Authorization */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseCreditAuthEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Card Authorization (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm"
                            data-testid="textarea-clause-credit-auth-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseCreditAuthAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تفويض البطاقة الائتمانية (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-credit-auth-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Desert Area Prohibition */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseDesertProhibitionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desert Area Prohibition (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-desert-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseDesertProhibitionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حظر المنطقة الصحراوية (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-desert-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accident - Hirer at Fault */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseAccidentHirerFaultEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Liability - Hirer at Fault (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-clause-accident-hirer-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseAccidentHirerFaultAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مسؤولية الحادث - خطأ المستأجر (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-accident-hirer-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accident - Not Hirer's Fault */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseAccidentNotFaultEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Liability - Not Hirer's Fault (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm"
                            data-testid="textarea-clause-accident-not-fault-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseAccidentNotFaultAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مسؤولية الحادث - ليس خطأ المستأجر (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-accident-not-fault-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Monthly Payment Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseMonthlyPaymentEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Payment Schedule (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-monthly-payment-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseMonthlyPaymentAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>جدول الدفع الشهري (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-monthly-payment-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Daily KM Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseDailyKmLimitEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily KM Limit (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-daily-km-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseDailyKmLimitAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد الكيلومترات اليومي (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-daily-km-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Monthly KM Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseMonthlyKmLimitEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly KM Limit (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-monthly-km-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseMonthlyKmLimitAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد الكيلومترات الشهري (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-monthly-km-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Self-Repair Penalty */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseSelfRepairPenaltyEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Self-Repair Penalty (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-self-repair-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseSelfRepairPenaltyAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>غرامة الإصلاح الذاتي (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-self-repair-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Daily Rate Default */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseDailyRateDefaultEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate Default Clause (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm"
                            data-testid="textarea-clause-daily-rate-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseDailyRateDefaultAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بند السعر اليومي الافتراضي (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-daily-rate-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Back Page Reference */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clauseBackpageReferenceEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Back Page Reference (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={1}
                            className="text-sm"
                            data-testid="textarea-clause-backpage-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clauseBackpageReferenceAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>إشارة الصفحة الخلفية (عربي)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={1}
                            className="text-sm text-right"
                            dir="rtl"
                            data-testid="textarea-clause-backpage-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={saveContractClauses}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-contract-clauses"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.termsConditions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="section1" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="section1" data-testid="tab-terms-section1">
                      {t('settings.additionalTerms')}
                    </TabsTrigger>
                    <TabsTrigger value="section2" data-testid="tab-terms-section2">
                      {t('settings.mainTerms')}
                    </TabsTrigger>
                    <TabsTrigger value="section3" data-testid="tab-terms-section3">
                      {t('settings.authorizationText')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="section1" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="termsSection1En"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.additionalTermsEn')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={10}
                              className="font-mono text-sm"
                              data-testid="textarea-terms-section1-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsSection1Ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.additionalTermsAr')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={10}
                              className="font-mono text-sm text-right"
                              dir="rtl"
                              data-testid="textarea-terms-section1-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="section2" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="termsSection2En"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.mainTermsEn')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={20}
                              className="font-mono text-sm"
                              data-testid="textarea-terms-section2-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsSection2Ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.mainTermsAr')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={20}
                              className="font-mono text-sm text-right"
                              dir="rtl"
                              data-testid="textarea-terms-section2-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="section3" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="termsSection3En"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.authorizationTextEn')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              className="font-mono text-sm"
                              data-testid="textarea-terms-section3-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsSection3Ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.authorizationTextAr')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              className="font-mono text-sm text-right"
                              dir="rtl"
                              data-testid="textarea-terms-section3-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  onClick={saveTermsConditions}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-terms"
                >
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Form>
      </div>
    </div>
  );
}
