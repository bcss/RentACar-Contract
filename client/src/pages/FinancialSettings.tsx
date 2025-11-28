import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { insertCompanySettingsSchema, type CompanySettings } from "@shared/schema";
import { z } from "zod";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for currency settings
const currencySettingsSchema = z.object({
  currencyEn: z.string().min(1, "Currency (English) is required"),
  currencyAr: z.string().min(1, "Currency (Arabic) is required"),
});

// Schema for rental rates
const rentalRatesSchema = z.object({
  defaultDailyRate: z.string().min(1, "Default daily rate is required"),
  defaultWeeklyRate: z.string().min(1, "Default weekly rate is required"),
  defaultMonthlyRate: z.string().min(1, "Default monthly rate is required"),
});

// Schema for add-on pricing
const addonPricingSchema = z.object({
  insurancePerDay: z.string().min(1, "Insurance per day is required"),
  gpsPerDay: z.string().min(1, "GPS per day is required"),
  babySeatPerDay: z.string().min(1, "Baby seat per day is required"),
  additionalDriverFee: z.string().min(1, "Additional driver fee is required"),
});

// Schema for extra charges
const extraChargesSchema = z.object({
  defaultExtraKmRate: z.string().min(1, "Default extra km rate is required"),
  defaultSecurityDeposit: z.string().min(1, "Default security deposit is required"),
});

// Schema for fuel pricing
const fuelPricingSchema = z.object({
  petrolPricePerLiter: z.string().min(1, "Petrol price per liter is required"),
  dieselPricePerLiter: z.string().min(1, "Diesel price per liter is required"),
});

// Schema for delivery service
const deliveryServiceSchema = z.object({
  defaultDropOffCharge: z.string().min(1, "Default drop-off charge is required"),
  defaultPickUpCharge: z.string().min(1, "Default pick-up charge is required"),
});

// Schema for driver service rates
const driverServiceSchema = z.object({
  driverDailyRate: z.string().min(1, "Driver daily rate is required"),
  driverHourlyRate: z.string().min(1, "Driver hourly rate is required"),
});

type CurrencySettingsForm = z.infer<typeof currencySettingsSchema>;
type RentalRatesForm = z.infer<typeof rentalRatesSchema>;
type AddonPricingForm = z.infer<typeof addonPricingSchema>;
type ExtraChargesForm = z.infer<typeof extraChargesSchema>;
type FuelPricingForm = z.infer<typeof fuelPricingSchema>;
type DeliveryServiceForm = z.infer<typeof deliveryServiceSchema>;
type DriverServiceForm = z.infer<typeof driverServiceSchema>;

export default function FinancialSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { currency } = useCurrency();

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ['/api/settings/financial'],
  });

  // Individual forms for each card
  const currencyForm = useForm<CurrencySettingsForm>({
    resolver: zodResolver(currencySettingsSchema),
    defaultValues: {
      currencyEn: "",
      currencyAr: "",
    },
  });

  const rentalRatesForm = useForm<RentalRatesForm>({
    resolver: zodResolver(rentalRatesSchema),
    defaultValues: {
      defaultDailyRate: "150",
      defaultWeeklyRate: "900",
      defaultMonthlyRate: "3000",
    },
  });

  const addonPricingForm = useForm<AddonPricingForm>({
    resolver: zodResolver(addonPricingSchema),
    defaultValues: {
      insurancePerDay: "25",
      gpsPerDay: "15",
      babySeatPerDay: "20",
      additionalDriverFee: "50",
    },
  });

  const extraChargesForm = useForm<ExtraChargesForm>({
    resolver: zodResolver(extraChargesSchema),
    defaultValues: {
      defaultExtraKmRate: "1.5",
      defaultSecurityDeposit: "1500",
    },
  });

  const fuelPricingForm = useForm<FuelPricingForm>({
    resolver: zodResolver(fuelPricingSchema),
    defaultValues: {
      petrolPricePerLiter: "3.5",
      dieselPricePerLiter: "3.2",
    },
  });

  const deliveryServiceForm = useForm<DeliveryServiceForm>({
    resolver: zodResolver(deliveryServiceSchema),
    defaultValues: {
      defaultDropOffCharge: "0",
      defaultPickUpCharge: "0",
    },
  });

  const driverServiceForm = useForm<DriverServiceForm>({
    resolver: zodResolver(driverServiceSchema),
    defaultValues: {
      driverDailyRate: "300",
      driverHourlyRate: "50",
    },
  });

  useEffect(() => {
    if (settings) {
      currencyForm.reset({
        currencyEn: settings.currencyEn || "",
        currencyAr: settings.currencyAr || "",
      });
      rentalRatesForm.reset({
        defaultDailyRate: settings.defaultDailyRate,
        defaultWeeklyRate: settings.defaultWeeklyRate,
        defaultMonthlyRate: settings.defaultMonthlyRate,
      });
      addonPricingForm.reset({
        insurancePerDay: settings.insurancePerDay,
        gpsPerDay: settings.gpsPerDay,
        babySeatPerDay: settings.babySeatPerDay,
        additionalDriverFee: settings.additionalDriverFee,
      });
      extraChargesForm.reset({
        defaultExtraKmRate: settings.defaultExtraKmRate,
        defaultSecurityDeposit: settings.defaultSecurityDeposit,
      });
      fuelPricingForm.reset({
        petrolPricePerLiter: settings.petrolPricePerLiter,
        dieselPricePerLiter: settings.dieselPricePerLiter,
      });
      deliveryServiceForm.reset({
        defaultDropOffCharge: settings.defaultDropOffCharge || "0",
        defaultPickUpCharge: settings.defaultPickUpCharge || "0",
      });
      driverServiceForm.reset({
        driverDailyRate: settings.driverDailyRate || "300",
        driverHourlyRate: settings.driverHourlyRate || "50",
      });
    }
  }, [settings, currencyForm, rentalRatesForm, addonPricingForm, extraChargesForm, fuelPricingForm, deliveryServiceForm, driverServiceForm]);

  // Individual mutation for each form
  const createUpdateMutation = (successMessage: string) => useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/settings/financial', data);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: successMessage,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/financial'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to save settings',
        variant: "destructive",
      });
    },
  });

  const currencyMutation = createUpdateMutation('Currency settings saved successfully');
  const rentalRatesMutation = createUpdateMutation('Rental rates saved successfully');
  const addonPricingMutation = createUpdateMutation('Add-on pricing saved successfully');
  const extraChargesMutation = createUpdateMutation('Extra charges saved successfully');
  const fuelPricingMutation = createUpdateMutation('Fuel pricing saved successfully');
  const deliveryServiceMutation = createUpdateMutation('Delivery service settings saved successfully');
  const driverServiceMutation = createUpdateMutation('Driver service rates saved successfully');

  if (authLoading || isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <MaterialSymbol name="lock" size="2xl" className="text-muted-foreground" />
        <p className="text-muted-foreground text-lg">{t('msg.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-financial-settings-title">Financial Settings</h1>
          <p className="text-muted-foreground mt-1">Configure default rates, add-on pricing, and fuel costs</p>
        </div>

        <div className="space-y-6">
          {/* Currency Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Configuration</CardTitle>
            </CardHeader>
            <Form {...currencyForm}>
              <form onSubmit={currencyForm.handleSubmit((data) => currencyMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={currencyForm.control}
                      name="currencyEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Code (English)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., USD, EUR, GBP" 
                              data-testid="input-currency-en" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={currencyForm.control}
                      name="currencyAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Symbol (Arabic)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="text-right" 
                              dir="rtl"
                              placeholder="مثال: $، €، £" 
                              data-testid="input-currency-ar" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This currency will be displayed throughout the system in financial reports, contracts, and invoices.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={currencyMutation.isPending}
                    data-testid="button-save-currency-settings"
                  >
                    {currencyMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Default Rental Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Default Rental Rates</CardTitle>
            </CardHeader>
            <Form {...rentalRatesForm}>
              <form onSubmit={rentalRatesForm.handleSubmit((data) => rentalRatesMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={rentalRatesForm.control}
                      name="defaultDailyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Daily Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="150" 
                              data-testid="input-default-daily-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={rentalRatesForm.control}
                      name="defaultWeeklyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Weekly Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="900" 
                              data-testid="input-default-weekly-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={rentalRatesForm.control}
                      name="defaultMonthlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Monthly Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="3000" 
                              data-testid="input-default-monthly-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={rentalRatesMutation.isPending}
                    data-testid="button-save-rental-rates"
                  >
                    {rentalRatesMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Add-on Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Add-on Pricing (Per Day)</CardTitle>
            </CardHeader>
            <Form {...addonPricingForm}>
              <form onSubmit={addonPricingForm.handleSubmit((data) => addonPricingMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addonPricingForm.control}
                      name="insurancePerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Insurance Per Day${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="25" 
                              data-testid="input-insurance-per-day" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addonPricingForm.control}
                      name="gpsPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`GPS Per Day${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="15" 
                              data-testid="input-gps-per-day" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addonPricingForm.control}
                      name="babySeatPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Baby Seat Per Day${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="20" 
                              data-testid="input-baby-seat-per-day" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addonPricingForm.control}
                      name="additionalDriverFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Additional Driver Fee${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="50" 
                              data-testid="input-additional-driver-fee" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={addonPricingMutation.isPending}
                    data-testid="button-save-addon-pricing"
                  >
                    {addonPricingMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Extra Charges */}
          <Card>
            <CardHeader>
              <CardTitle>Extra Charges</CardTitle>
            </CardHeader>
            <Form {...extraChargesForm}>
              <form onSubmit={extraChargesForm.handleSubmit((data) => extraChargesMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={extraChargesForm.control}
                      name="defaultExtraKmRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Extra KM Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="1.5" 
                              data-testid="input-default-extra-km-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={extraChargesForm.control}
                      name="defaultSecurityDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Security Deposit${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="1500" 
                              data-testid="input-default-security-deposit" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={extraChargesMutation.isPending}
                    data-testid="button-save-extra-charges"
                  >
                    {extraChargesMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Fuel Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Pricing</CardTitle>
            </CardHeader>
            <Form {...fuelPricingForm}>
              <form onSubmit={fuelPricingForm.handleSubmit((data) => fuelPricingMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={fuelPricingForm.control}
                      name="petrolPricePerLiter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Petrol Price Per Liter${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="3.5" 
                              data-testid="input-petrol-price-per-liter" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={fuelPricingForm.control}
                      name="dieselPricePerLiter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Diesel Price Per Liter${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="3.2" 
                              data-testid="input-diesel-price-per-liter" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={fuelPricingMutation.isPending}
                    data-testid="button-save-fuel-pricing"
                  >
                    {fuelPricingMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Delivery Service Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Service Pricing</CardTitle>
            </CardHeader>
            <Form {...deliveryServiceForm}>
              <form onSubmit={deliveryServiceForm.handleSubmit((data) => deliveryServiceMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={deliveryServiceForm.control}
                      name="defaultDropOffCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Default Drop-Off Charge${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="0" 
                              data-testid="input-default-drop-off-charge" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deliveryServiceForm.control}
                      name="defaultPickUpCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Default Pick-Up Charge${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="0" 
                              data-testid="input-default-pick-up-charge" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure default charges for delivering vehicle to customer (drop-off) and picking up vehicle from customer (pick-up). Set to 0 for free service. These values will be used as defaults when creating new contracts.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={deliveryServiceMutation.isPending}
                    data-testid="button-save-delivery-service"
                  >
                    {deliveryServiceMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Driver Service Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Driver Service Rates</CardTitle>
            </CardHeader>
            <Form {...driverServiceForm}>
              <form onSubmit={driverServiceForm.handleSubmit((data) => driverServiceMutation.mutate(data))}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={driverServiceForm.control}
                      name="driverDailyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Driver Daily Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="300" 
                              data-testid="input-driver-daily-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={driverServiceForm.control}
                      name="driverHourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Driver Hourly Rate${currency ? ` (${currency})` : ''}`}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              placeholder="50" 
                              data-testid="input-driver-hourly-rate" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure default rates for professional driver service. Daily rate applies for full-day service (8+ hours), hourly rate for shorter durations. These rates are used when customers book a driver with their rental vehicle.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={driverServiceMutation.isPending}
                    data-testid="button-save-driver-service"
                  >
                    {driverServiceMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
