import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { Contract, CompanySettings } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function ContractView() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('common.error'),
        description: t('msg.noPermission'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ['/api/contracts', params.id],
    enabled: isAuthenticated,
  });

  const { data: companySettings } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/contracts/${params.id}/finalize`, {});
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('msg.contractFinalized'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="material-icons text-6xl text-muted-foreground">description</span>
        <p className="text-muted-foreground">{t('common.noResults')}</p>
        <Button onClick={() => navigate('/contracts')} data-testid="button-back">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const handlePrint = async () => {
    try {
      await apiRequest('POST', '/api/audit-logs', {
        action: 'print',
        contractId: contract?.id,
        details: `Printed contract #${contract?.contractNumber}`,
      });
      
      window.print();
      
      toast({
        title: t('common.success'),
        description: t('msg.printSuccess'),
      });
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'finalized') {
      return (
        <Badge variant="default" className="bg-chart-2 hover:bg-chart-2 flex items-center gap-1 w-fit text-base px-3 py-1">
          <span className="material-icons text-sm">lock</span>
          {t('contracts.finalized')}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-chart-4 hover:bg-chart-4 flex items-center gap-1 w-fit text-base px-3 py-1">
        <span className="material-icons text-sm">edit</span>
        {t('contracts.draft')}
      </Badge>
    );
  };

  const hirerType = contract.hirerType || 'direct';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Company Header - Visible only when printing */}
      {companySettings && (
        <div className="print-only border-2 border-black p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 items-start">
            {/* Left: English Company Info */}
            <div className="text-left">
              <h1 className="text-4xl font-bold text-red-600 mb-1">{companySettings.companyNameEn}</h1>
              <p className="text-xs font-semibold">{companySettings.companyLegalNameEn}</p>
              <div className="text-[9px] mt-2 space-y-0.5">
                <p>Tel : {companySettings.phone}</p>
                <p>Mob. : {companySettings.mobile}</p>
                <p>{companySettings.addressEn}</p>
                <p>Email: {companySettings.email}</p>
                <p>{companySettings.website}</p>
              </div>
            </div>

            {/* Center: Logo and Title */}
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                {companySettings.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Company Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs">LOGO</span>
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-red-600">{companySettings.companyNameEn}</p>
                  <p className="text-xs font-semibold">{companySettings.taglineEn}</p>
                </div>
              </div>
              <div className="border-2 border-red-600 rounded-full px-6 py-1 inline-block mt-2">
                <p className="text-sm font-bold">CAR HIRE CONTRACT <span className="font-arabic">عقــد تـأجـيــر الـسـيــارات</span></p>
              </div>
            </div>

            {/* Right: Arabic Company Info */}
            <div className="text-right font-arabic">
              <h1 className="text-3xl font-bold mb-1">{companySettings.companyNameAr}</h1>
              <p className="text-xs font-semibold">{companySettings.companyLegalNameAr}</p>
              <div className="text-[9px] mt-2 space-y-0.5">
                <p>هاتف: {companySettings.phoneAr}</p>
                <p>متحرك: {companySettings.mobileAr}</p>
                <p>{companySettings.addressAr}</p>
                <p>بريد الإلكتروني: {companySettings.email}</p>
                <p>{companySettings.website}</p>
              </div>
            </div>
          </div>

          {/* Contract Number */}
          <div className="text-left mt-2">
            <p className="text-sm font-semibold">Contract No. / <span className="font-arabic">رقم العقد</span>: {contract?.contractNumber}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-mono" data-testid="text-contract-number">
              #{contract.contractNumber}
            </h1>
            {getStatusBadge(contract.status)}
          </div>
          <p className="text-muted-foreground">
            {contract.createdAt && format(new Date(contract.createdAt), 'PPP')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/contracts')} data-testid="button-back">
            <span className="material-icons">arrow_back</span>
            <span>{t('common.back')}</span>
          </Button>
          {contract.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/contracts/${params.id}/edit`)} data-testid="button-edit">
                <span className="material-icons">edit</span>
                <span>{t('common.edit')}</span>
              </Button>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button data-testid="button-finalize">
                      <span className="material-icons">lock</span>
                      <span>{t('action.finalize')}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('action.finalize')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('msg.confirmFinalize')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => finalizeMutation.mutate()}>
                        {t('action.finalize')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          <Button variant="outline" onClick={handlePrint} data-testid="button-print">
            <span className="material-icons">print</span>
            <span>{t('common.print')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hirer/Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">{hirerType === 'from_company' ? 'business' : 'person'}</span>
              {hirerType === 'from_company' ? t('form.companyInfo') : t('form.customerInfo')}
              <Badge variant="outline" className="ml-2">
                {t(`form.hirerType${hirerType === 'direct' ? 'Direct' : hirerType === 'with_sponsor' ? 'WithSponsor' : 'FromCompany'}`)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hirerType === 'from_company' ? (
              <>
                {contract.companyNameEn && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.companyNameEn')}</p>
                    <p className="font-medium" data-testid="text-company-name-en">{contract.companyNameEn}</p>
                  </div>
                )}
                {contract.companyNameAr && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.companyNameAr')}</p>
                    <p className="font-medium font-arabic" data-testid="text-company-name-ar">{contract.companyNameAr}</p>
                  </div>
                )}
                {contract.companyContactPerson && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.companyContactPerson')}</p>
                    <p className="font-medium" data-testid="text-company-contact">{contract.companyContactPerson}</p>
                  </div>
                )}
                {contract.companyPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.companyPhone')}</p>
                    <p className="font-medium" data-testid="text-company-phone">{contract.companyPhone}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.customerNameEn')}</p>
                  <p className="font-medium" data-testid="text-customer-name-en">{contract.customerNameEn}</p>
                </div>
                {contract.customerNameAr && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.customerNameAr')}</p>
                    <p className="font-medium font-arabic" data-testid="text-customer-name-ar">{contract.customerNameAr}</p>
                  </div>
                )}
                {contract.gender && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.gender')}</p>
                    <p className="font-medium" data-testid="text-gender">{t(`form.gender${contract.gender === 'male' ? 'Male' : 'Female'}`)}</p>
                  </div>
                )}
                {contract.dateOfBirth && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.dateOfBirth')}</p>
                    <p className="font-medium" data-testid="text-date-of-birth">{format(new Date(contract.dateOfBirth), 'PP')}</p>
                  </div>
                )}
                {contract.idNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.idNumber')}</p>
                    <p className="font-medium font-mono" data-testid="text-id-number">{contract.idNumber}</p>
                  </div>
                )}
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t('form.customerPhone')}</p>
              <p className="font-medium" data-testid="text-customer-phone">{contract.customerPhone}</p>
            </div>
            {contract.customerEmail && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.customerEmail')}</p>
                <p className="font-medium" data-testid="text-customer-email">{contract.customerEmail}</p>
              </div>
            )}
            {contract.customerAddress && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.customerAddress')}</p>
                <p className="font-medium" data-testid="text-customer-address">{contract.customerAddress}</p>
              </div>
            )}
            {hirerType !== 'from_company' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.licenseNumber')}</p>
                  <p className="font-medium font-mono" data-testid="text-license-number">{contract.licenseNumber}</p>
                </div>
                {contract.licenseIssueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.licenseIssueDate')}</p>
                    <p className="font-medium" data-testid="text-license-issue-date">{format(new Date(contract.licenseIssueDate), 'PP')}</p>
                  </div>
                )}
                {contract.licenseExpiryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.licenseExpiryDate')}</p>
                    <p className="font-medium" data-testid="text-license-expiry-date">{format(new Date(contract.licenseExpiryDate), 'PP')}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sponsor Information (only for with_sponsor) */}
        {hirerType === 'with_sponsor' && (contract.sponsorNameEn || contract.sponsorNameAr) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="material-icons">supervised_user_circle</span>
                {t('form.sponsorInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contract.sponsorNameEn && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.sponsorNameEn')}</p>
                  <p className="font-medium" data-testid="text-sponsor-name-en">{contract.sponsorNameEn}</p>
                </div>
              )}
              {contract.sponsorNameAr && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.sponsorNameAr')}</p>
                  <p className="font-medium font-arabic" data-testid="text-sponsor-name-ar">{contract.sponsorNameAr}</p>
                </div>
              )}
              {contract.sponsorIdNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.sponsorIdNumber')}</p>
                  <p className="font-medium font-mono" data-testid="text-sponsor-id">{contract.sponsorIdNumber}</p>
                </div>
              )}
              {contract.sponsorPhone && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.sponsorPhone')}</p>
                  <p className="font-medium" data-testid="text-sponsor-phone">{contract.sponsorPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">directions_car</span>
              {t('form.vehicleInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('form.vehicleMake')}</p>
              <p className="font-medium" data-testid="text-vehicle-make">{contract.vehicleMake}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.vehicleModel')}</p>
              <p className="font-medium" data-testid="text-vehicle-model">{contract.vehicleModel}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleYear')}</p>
                <p className="font-medium" data-testid="text-vehicle-year">{contract.vehicleYear}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleColor')}</p>
                <p className="font-medium" data-testid="text-vehicle-color">{contract.vehicleColor}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.vehiclePlate')}</p>
              <p className="font-medium font-mono" data-testid="text-vehicle-plate">{contract.vehiclePlate}</p>
            </div>
            {contract.vehicleVin && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleVin')}</p>
                <p className="font-medium font-mono" data-testid="text-vehicle-vin">{contract.vehicleVin}</p>
              </div>
            )}
            {(contract.fuelLevelStart || contract.fuelLevelEnd) && (
              <div className="grid grid-cols-2 gap-4">
                {contract.fuelLevelStart && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.fuelLevelStart')}</p>
                    <p className="font-medium" data-testid="text-fuel-start">{contract.fuelLevelStart}</p>
                  </div>
                )}
                {contract.fuelLevelEnd && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.fuelLevelEnd')}</p>
                    <p className="font-medium" data-testid="text-fuel-end">{contract.fuelLevelEnd}</p>
                  </div>
                )}
              </div>
            )}
            {(contract.odometerStart !== null && contract.odometerStart !== undefined) || (contract.odometerEnd !== null && contract.odometerEnd !== undefined) ? (
              <div className="grid grid-cols-2 gap-4">
                {contract.odometerStart !== null && contract.odometerStart !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.odometerStart')}</p>
                    <p className="font-medium font-mono" data-testid="text-odometer-start">{contract.odometerStart.toLocaleString()} km</p>
                  </div>
                )}
                {contract.odometerEnd !== null && contract.odometerEnd !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.odometerEnd')}</p>
                    <p className="font-medium font-mono" data-testid="text-odometer-end">{contract.odometerEnd.toLocaleString()} km</p>
                  </div>
                )}
              </div>
            ) : null}
            {contract.vehicleCondition && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleCondition')}</p>
                <p className="font-medium whitespace-pre-wrap" data-testid="text-vehicle-condition">{contract.vehicleCondition}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rental Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">event</span>
              {t('form.rentalDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract.rentalType && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.rentalType')}</p>
                <p className="font-medium" data-testid="text-rental-type">
                  {t(`form.rentalType${contract.rentalType === 'daily' ? 'Daily' : contract.rentalType === 'weekly' ? 'Weekly' : 'Monthly'}`)}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('form.rentalStartDate')}</p>
                <p className="font-medium" data-testid="text-rental-start-date">
                  {format(new Date(contract.rentalStartDate), 'PP')}
                  {contract.rentalStartTime && <span className="ml-2">{contract.rentalStartTime}</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('form.rentalEndDate')}</p>
                <p className="font-medium" data-testid="text-rental-end-date">
                  {format(new Date(contract.rentalEndDate), 'PP')}
                  {contract.rentalEndTime && <span className="ml-2">{contract.rentalEndTime}</span>}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.pickupLocation')}</p>
              <p className="font-medium" data-testid="text-pickup-location">{contract.pickupLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.dropoffLocation')}</p>
              <p className="font-medium" data-testid="text-dropoff-location">{contract.dropoffLocation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">attach_money</span>
              {t('form.pricing')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {contract.dailyRate && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.dailyRate')}</p>
                  <p className="font-medium font-mono" data-testid="text-daily-rate">{contract.dailyRate}</p>
                </div>
              )}
              {contract.weeklyRate && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.weeklyRate')}</p>
                  <p className="font-medium font-mono" data-testid="text-weekly-rate">{contract.weeklyRate}</p>
                </div>
              )}
              {contract.monthlyRate && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('form.monthlyRate')}</p>
                  <p className="font-medium font-mono" data-testid="text-monthly-rate">{contract.monthlyRate}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{t('form.totalDays')}</p>
                <p className="font-medium" data-testid="text-total-days">{contract.totalDays}</p>
              </div>
            </div>
            {((contract.mileageLimit !== null && contract.mileageLimit !== undefined) || contract.extraKmRate) && (
              <div className="grid grid-cols-2 gap-4">
                {contract.mileageLimit !== null && contract.mileageLimit !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.mileageLimit')}</p>
                    <p className="font-medium" data-testid="text-mileage-limit">{contract.mileageLimit} km/day</p>
                  </div>
                )}
                {contract.extraKmRate && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('form.extraKmRate')}</p>
                    <p className="font-medium font-mono" data-testid="text-extra-km-rate">{contract.extraKmRate}</p>
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t('form.totalAmount')}</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-total-amount">{contract.totalAmount}</p>
            </div>
            {contract.securityDeposit && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.securityDeposit')}</p>
                <p className="font-medium font-mono" data-testid="text-security-deposit">{contract.securityDeposit}</p>
              </div>
            )}
            {contract.accidentLiability && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.accidentLiability')}</p>
                <p className="font-medium font-mono" data-testid="text-accident-liability">{contract.accidentLiability}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {contract.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">info</span>
              {t('form.notes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap" data-testid="text-notes">{contract.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Terms & Conditions - Print Only */}
      {companySettings && (
        <div className="print-only border-t-2 border-black pt-4 mt-8">
          <h2 className="text-lg font-bold mb-4 text-center">
            TERMS & CONDITIONS / <span className="font-arabic">الشروط والأحكام</span>
          </h2>
          
          {companySettings.termsSection1En && companySettings.termsSection1En.trim() && (
            <div className="mb-4">
              <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: companySettings.termsSection1En }} />
              {companySettings.termsSection1Ar && companySettings.termsSection1Ar.trim() && (
                <div className="text-sm whitespace-pre-wrap font-arabic mt-2 text-right" dangerouslySetInnerHTML={{ __html: companySettings.termsSection1Ar }} />
              )}
            </div>
          )}
          
          {companySettings.termsSection2En && companySettings.termsSection2En.trim() && (
            <div className="mb-4">
              <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: companySettings.termsSection2En }} />
              {companySettings.termsSection2Ar && companySettings.termsSection2Ar.trim() && (
                <div className="text-sm whitespace-pre-wrap font-arabic mt-2 text-right" dangerouslySetInnerHTML={{ __html: companySettings.termsSection2Ar }} />
              )}
            </div>
          )}
          
          {companySettings.termsSection3En && companySettings.termsSection3En.trim() && (
            <div className="mb-4">
              <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: companySettings.termsSection3En }} />
              {companySettings.termsSection3Ar && companySettings.termsSection3Ar.trim() && (
                <div className="text-sm whitespace-pre-wrap font-arabic mt-2 text-right" dangerouslySetInnerHTML={{ __html: companySettings.termsSection3Ar }} />
              )}
            </div>
          )}

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-8 border-t pt-4">
            <div>
              <p className="font-semibold mb-2">Hirer's Signature / <span className="font-arabic">توقيع المستأجر</span></p>
              <div className="border-b-2 border-black h-16"></div>
              <p className="text-sm mt-2">Date: ________________</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Company Representative / <span className="font-arabic">ممثل الشركة</span></p>
              <div className="border-b-2 border-black h-16"></div>
              <p className="text-sm mt-2">Date: ________________</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
