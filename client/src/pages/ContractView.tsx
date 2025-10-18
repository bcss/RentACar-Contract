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
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();

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
      // Log print action
      await apiRequest('POST', '/api/audit-logs', {
        action: 'print',
        contractId: contract?.id,
        details: `Printed contract #${contract?.contractNumber}`,
      });
      
      // Trigger browser print
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
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">person</span>
              {t('form.customerInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <div>
              <p className="text-sm text-muted-foreground">{t('form.licenseNumber')}</p>
              <p className="font-medium font-mono" data-testid="text-license-number">{contract.licenseNumber}</p>
            </div>
          </CardContent>
        </Card>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('form.rentalStartDate')}</p>
                <p className="font-medium" data-testid="text-rental-start-date">
                  {format(new Date(contract.rentalStartDate), 'PP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('form.rentalEndDate')}</p>
                <p className="font-medium" data-testid="text-rental-end-date">
                  {format(new Date(contract.rentalEndDate), 'PP')}
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
              <div>
                <p className="text-sm text-muted-foreground">{t('form.dailyRate')}</p>
                <p className="font-medium font-mono" data-testid="text-daily-rate">{contract.dailyRate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('form.totalDays')}</p>
                <p className="font-medium" data-testid="text-total-days">{contract.totalDays}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.totalAmount')}</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-total-amount">{contract.totalAmount}</p>
            </div>
            {contract.deposit && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.deposit')}</p>
                <p className="font-medium font-mono" data-testid="text-deposit">{contract.deposit}</p>
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
    </div>
  );
}
