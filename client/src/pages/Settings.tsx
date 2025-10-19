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
