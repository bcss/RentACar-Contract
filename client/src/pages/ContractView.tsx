import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { Contract, CompanySettings, Customer, Vehicle } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { isAuthenticated, isLoading: authLoading, isAdmin, isManager } = useAuth();
  const { currency } = useCurrency();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const isArabic = i18n.language === 'ar';

  // Dialog states
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showFinalPaymentDialog, setShowFinalPaymentDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // Return workflow form state
  const [odometerEnd, setOdometerEnd] = useState('');
  const [fuelLevelEnd, setFuelLevelEnd] = useState('');
  const [vehicleCondition, setVehicleCondition] = useState('');
  const [fuelCharge, setFuelCharge] = useState('');
  const [damageCharge, setDamageCharge] = useState('');
  const [otherCharges, setOtherCharges] = useState('');

  // Payment method states
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('');
  const [finalPaymentMethod, setFinalPaymentMethod] = useState('');

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

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: ['/api/customers', contract?.customerId],
    enabled: !!contract?.customerId,
    queryFn: async () => {
      const res = await fetch(`/api/customers/${contract?.customerId}`);
      if (!res.ok) throw new Error('Failed to fetch customer');
      return res.json();
    },
  });

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', contract?.vehicleId],
    enabled: !!contract?.vehicleId,
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${contract?.vehicleId}`);
      if (!res.ok) throw new Error('Failed to fetch vehicle');
      return res.json();
    },
  });

  // Legacy finalize removed - use new state machine (confirm → activate → complete → close)

  // State transition mutations
  const confirmMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/contracts/${params.id}/confirm`, {});
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Contract confirmed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/contracts/${params.id}/activate`, {});
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Rental activated - Vehicle handed over',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/contracts/${params.id}/complete`, data);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Rental completed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setShowReturnDialog(false);
      // Reset form
      setOdometerEnd('');
      setFuelLevelEnd('');
      setVehicleCondition('');
      setFuelCharge('');
      setDamageCharge('');
      setOtherCharges('');
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/contracts/${params.id}/close`, {});
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Contract closed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Payment mutations
  const depositMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      return await apiRequest('POST', `/api/contracts/${params.id}/deposit`, { method: paymentMethod });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Deposit payment recorded',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setShowDepositDialog(false);
      setDepositPaymentMethod('');
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const finalPaymentMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      return await apiRequest('POST', `/api/contracts/${params.id}/final-payment`, { method: paymentMethod });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Final payment recorded',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setShowFinalPaymentDialog(false);
      setFinalPaymentMethod('');
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/contracts/${params.id}/refund`, {});
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Deposit refund recorded',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setShowRefundDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading || isLoadingCustomer || isLoadingVehicle) {
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

  const handleReturnSubmit = () => {
    if (!odometerEnd || !fuelLevelEnd) {
      toast({
        title: t('common.error'),
        description: 'Please fill in all required fields',
        variant: "destructive",
      });
      return;
    }

    const odometerEndNum = parseInt(odometerEnd);
    const odometerStartNum = contract.odometerStart || 0;
    const mileageLimit = contract.mileageLimit || 0;
    const totalDays = contract.totalDays || 1;
    const extraKmRate = parseFloat(contract.extraKmRate || '0');

    // Calculate extra km driven
    const totalKmDriven = odometerEndNum - odometerStartNum;
    const allowedKm = mileageLimit * totalDays;
    const extraKmDriven = Math.max(0, totalKmDriven - allowedKm);
    const extraKmChargeAmount = extraKmDriven * extraKmRate;

    const fuelChargeAmount = parseFloat(fuelCharge || '0');
    const damageChargeAmount = parseFloat(damageCharge || '0');
    const otherChargesAmount = parseFloat(otherCharges || '0');

    const totalExtraCharges = extraKmChargeAmount + fuelChargeAmount + damageChargeAmount + otherChargesAmount;
    const totalAmount = parseFloat(contract.totalAmount || '0');
    const securityDeposit = parseFloat(contract.securityDeposit || '0');
    const depositPaidAmount = contract.depositPaid ? securityDeposit : 0;
    const outstandingBalance = totalAmount + totalExtraCharges - depositPaidAmount;

    completeMutation.mutate({
      odometerEnd: odometerEndNum,
      fuelLevelEnd,
      vehicleCondition,
      extraKmDriven,
      extraKmCharge: extraKmChargeAmount.toFixed(2),
      fuelCharge: fuelChargeAmount.toFixed(2),
      damageCharge: damageChargeAmount.toFixed(2),
      otherCharges: otherChargesAmount.toFixed(2),
      totalExtraCharges: totalExtraCharges.toFixed(2),
      outstandingBalance: outstandingBalance.toFixed(2),
    });
  };

  // Calculate extra charges for display
  const calculateExtraCharges = () => {
    if (!odometerEnd) return null;

    const odometerEndNum = parseInt(odometerEnd);
    const odometerStartNum = contract.odometerStart || 0;
    const mileageLimit = contract.mileageLimit || 0;
    const totalDays = contract.totalDays || 1;
    const extraKmRate = parseFloat(contract.extraKmRate || '0');

    const totalKmDriven = odometerEndNum - odometerStartNum;
    const allowedKm = mileageLimit * totalDays;
    const extraKmDriven = Math.max(0, totalKmDriven - allowedKm);
    const extraKmChargeAmount = extraKmDriven * extraKmRate;

    const fuelChargeAmount = parseFloat(fuelCharge || '0');
    const damageChargeAmount = parseFloat(damageCharge || '0');
    const otherChargesAmount = parseFloat(otherCharges || '0');

    const totalExtraCharges = extraKmChargeAmount + fuelChargeAmount + damageChargeAmount + otherChargesAmount;
    const totalAmount = parseFloat(contract.totalAmount || '0');
    const securityDeposit = parseFloat(contract.securityDeposit || '0');
    const depositPaidAmount = contract.depositPaid ? securityDeposit : 0;
    const outstandingBalance = totalAmount + totalExtraCharges - depositPaidAmount;

    return {
      extraKmDriven,
      extraKmChargeAmount,
      fuelChargeAmount,
      damageChargeAmount,
      otherChargesAmount,
      totalExtraCharges,
      outstandingBalance,
    };
  };

  const extraCharges = calculateExtraCharges();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: string; label: string }> = {
      draft: { color: 'bg-chart-4 hover:bg-chart-4', icon: 'edit', label: t('contracts.draft') },
      finalized: { color: 'bg-chart-2 hover:bg-chart-2', icon: 'lock', label: t('contracts.finalized') },
      confirmed: { color: 'bg-blue-600 hover:bg-blue-600', icon: 'check_circle', label: 'Confirmed' },
      active: { color: 'bg-green-600 hover:bg-green-600', icon: 'local_shipping', label: 'Active' },
      completed: { color: 'bg-orange-600 hover:bg-orange-600', icon: 'assignment_turned_in', label: 'Completed' },
      closed: { color: 'bg-gray-600 hover:bg-gray-600', icon: 'lock', label: 'Closed' },
    };

    const statusInfo = statusMap[status] || statusMap.draft;

    return (
      <Badge variant="default" className={`${statusInfo.color} flex items-center gap-1 w-fit text-base px-3 py-1`}>
        <span className="material-icons text-sm">{statusInfo.icon}</span>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-600 hover:bg-yellow-600', label: 'Pending' },
      partial: { color: 'bg-orange-600 hover:bg-orange-600', label: 'Partial' },
      paid: { color: 'bg-green-600 hover:bg-green-600', label: 'Paid' },
      refunded: { color: 'bg-blue-600 hover:bg-blue-600', label: 'Refunded' },
    };

    const statusInfo = statusMap[paymentStatus] || statusMap.pending;

    return (
      <Badge variant="default" className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const hirerType = contract.hirerType || 'direct';
  const canManageWorkflow = isAdmin || isManager;

  // Check if close button should be shown
  const canCloseContract = contract.status === 'completed' && 
    (parseFloat(contract.outstandingBalance || '0') === 0 || contract.finalPaymentReceived);

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
        <div className="flex items-center gap-2 flex-wrap">
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
              {canManageWorkflow && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button data-testid="button-confirm-contract">
                      <span className="material-icons">check_circle</span>
                      <span>Confirm Contract</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Contract</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to confirm this contract? This will lock the contract details.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmMutation.mutate()}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          {contract.status === 'confirmed' && canManageWorkflow && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button data-testid="button-activate-rental">
                  <span className="material-icons">local_shipping</span>
                  <span>Activate Rental (Hand Over Vehicle)</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Activate Rental</AlertDialogTitle>
                  <AlertDialogDescription>
                    Confirm that the vehicle has been handed over to the customer and the rental is now active.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => activateMutation.mutate()}>
                    Activate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {contract.status === 'active' && canManageWorkflow && (
            <Button onClick={() => setShowReturnDialog(true)} data-testid="button-complete-rental">
              <span className="material-icons">assignment_turned_in</span>
              <span>Complete Rental (Vehicle Returned)</span>
            </Button>
          )}
          {canCloseContract && canManageWorkflow && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button data-testid="button-close-contract">
                  <span className="material-icons">lock</span>
                  <span>Close Contract</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close Contract</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to close this contract? This action finalizes the contract.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => closeMutation.mutate()}>
                    Close
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={handlePrint} data-testid="button-print">
            <span className="material-icons">print</span>
            <span>{t('common.print')}</span>
          </Button>
        </div>
      </div>

      {/* Payment Recording Section */}
      {(contract.status === 'confirmed' || contract.status === 'active' || contract.status === 'completed' || contract.status === 'closed') && canManageWorkflow && (
        <Card className="no-print">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">payment</span>
              Payment Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!contract.depositPaid && contract.status !== 'closed' && (
              <Button onClick={() => setShowDepositDialog(true)} variant="outline" data-testid="button-record-deposit">
                <span className="material-icons">account_balance_wallet</span>
                <span>Record Deposit Payment</span>
              </Button>
            )}
            {!contract.finalPaymentReceived && contract.status !== 'closed' && (
              <Button onClick={() => setShowFinalPaymentDialog(true)} variant="outline" data-testid="button-record-final-payment">
                <span className="material-icons">payments</span>
                <span>Record Final Payment</span>
              </Button>
            )}
            {contract.depositPaid && !contract.depositRefunded && contract.status === 'closed' && (
              <Button onClick={() => setShowRefundDialog(true)} variant="outline" data-testid="button-record-refund">
                <span className="material-icons">undo</span>
                <span>Record Deposit Refund</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Status Card */}
      {(contract.status === 'confirmed' || contract.status === 'active' || contract.status === 'completed' || contract.status === 'closed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons">account_balance</span>
                Payment Status
              </div>
              {getPaymentStatusBadge(contract.paymentStatus || 'pending')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Deposit Payment</p>
                <p className="font-medium" data-testid="text-deposit-status">
                  {contract.depositPaid ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="material-icons text-sm">check_circle</span>
                      Paid
                      {contract.depositPaidDate && ` on ${format(new Date(contract.depositPaidDate), 'PP')}`}
                      {contract.depositPaidMethod && ` via ${contract.depositPaidMethod}`}
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <span className="material-icons text-sm">pending</span>
                      Pending
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final Payment</p>
                <p className="font-medium" data-testid="text-final-payment-status">
                  {contract.finalPaymentReceived ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="material-icons text-sm">check_circle</span>
                      Received
                      {contract.finalPaymentDate && ` on ${format(new Date(contract.finalPaymentDate), 'PP')}`}
                      {contract.finalPaymentMethod && ` via ${contract.finalPaymentMethod}`}
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <span className="material-icons text-sm">pending</span>
                      Pending
                    </span>
                  )}
                </p>
              </div>
              {contract.depositPaid && (
                <div>
                  <p className="text-sm text-muted-foreground">Deposit Refund</p>
                  <p className="font-medium" data-testid="text-refund-status">
                    {contract.depositRefunded ? (
                      <span className="text-blue-600 flex items-center gap-1">
                        <span className="material-icons text-sm">check_circle</span>
                        Refunded
                        {contract.depositRefundedDate && ` on ${format(new Date(contract.depositRefundedDate), 'PP')}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <span className="material-icons text-sm">schedule</span>
                        Not Refunded
                      </span>
                    )}
                  </p>
                </div>
              )}
              {contract.outstandingBalance && parseFloat(contract.outstandingBalance) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-xl font-bold font-mono text-red-600" data-testid="text-outstanding-balance">
                    {contract.outstandingBalance} {currency}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra Charges Card */}
      {(contract.status === 'completed' || contract.status === 'closed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-icons">receipt_long</span>
              Extra Charges & Final Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.extraKmDriven !== null && contract.extraKmDriven !== undefined && contract.extraKmDriven > 0 && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Extra KM Driven</p>
                    <p className="font-medium font-mono" data-testid="text-extra-km-driven">
                      {contract.extraKmDriven} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Extra KM Charge</p>
                    <p className="font-medium font-mono" data-testid="text-extra-km-charge">
                      {contract.extraKmCharge} {currency}
                    </p>
                  </div>
                </>
              )}
              {contract.fuelCharge && parseFloat(contract.fuelCharge) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Charge</p>
                  <p className="font-medium font-mono" data-testid="text-fuel-charge">
                    {contract.fuelCharge} {currency}
                  </p>
                </div>
              )}
              {contract.damageCharge && parseFloat(contract.damageCharge) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Damage Charge</p>
                  <p className="font-medium font-mono" data-testid="text-damage-charge">
                    {contract.damageCharge} {currency}
                  </p>
                </div>
              )}
              {contract.otherCharges && parseFloat(contract.otherCharges) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Other Charges</p>
                  <p className="font-medium font-mono" data-testid="text-other-charges">
                    {contract.otherCharges} {currency}
                  </p>
                </div>
              )}
              {contract.totalExtraCharges && parseFloat(contract.totalExtraCharges) > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Total Extra Charges</p>
                  <p className="text-xl font-bold font-mono text-red-600" data-testid="text-total-extra-charges">
                    {contract.totalExtraCharges} {currency}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-muted-foreground mb-2">Calculation Breakdown:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Rental Amount:</span>
                  <span className="font-mono">{contract.totalAmount} {currency}</span>
                </div>
                {contract.totalExtraCharges && parseFloat(contract.totalExtraCharges) > 0 && (
                  <div className="flex justify-between">
                    <span>Total Extra Charges:</span>
                    <span className="font-mono text-red-600">+ {contract.totalExtraCharges} {currency}</span>
                  </div>
                )}
                {contract.depositPaid && contract.securityDeposit && (
                  <div className="flex justify-between">
                    <span>Security Deposit (Paid):</span>
                    <span className="font-mono text-green-600">- {contract.securityDeposit} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                  <span>Final Balance:</span>
                  <span className="font-mono">{contract.outstandingBalance || '0.00'} {currency}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <p className="font-medium" data-testid="text-customer-name-en">{customer?.nameEn}</p>
            </div>
            {customer?.nameAr && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.customerNameAr')}</p>
                <p className="font-medium font-arabic" data-testid="text-customer-name-ar">{customer?.nameAr}</p>
              </div>
            )}
            {customer?.gender && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.gender')}</p>
                <p className="font-medium" data-testid="text-gender">{t(`form.gender${customer?.gender === 'male' ? 'Male' : 'Female'}`)}</p>
              </div>
            )}
            {customer?.dateOfBirth && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.dateOfBirth')}</p>
                <p className="font-medium" data-testid="text-date-of-birth">{format(new Date(customer.dateOfBirth), 'PP')}</p>
              </div>
            )}
            {customer?.nationalId && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.idNumber')}</p>
                <p className="font-medium font-mono" data-testid="text-id-number">{customer?.nationalId}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t('form.customerPhone')}</p>
              <p className="font-medium" data-testid="text-customer-phone">{customer?.phone}</p>
            </div>
            {customer?.email && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.customerEmail')}</p>
                <p className="font-medium" data-testid="text-customer-email">{customer?.email}</p>
              </div>
            )}
            {customer?.address && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.customerAddress')}</p>
                <p className="font-medium" data-testid="text-customer-address">{customer?.address}</p>
              </div>
            )}
            {customer?.licenseNumber && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.licenseNumber')}</p>
                <p className="font-medium font-mono" data-testid="text-license-number">{customer?.licenseNumber}</p>
              </div>
            )}
            {customer?.licenseIssueDate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.licenseIssueDate')}</p>
                <p className="font-medium" data-testid="text-license-issue-date">{format(new Date(customer.licenseIssueDate), 'PP')}</p>
              </div>
            )}
            {customer?.licenseExpiryDate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.licenseExpiryDate')}</p>
                <p className="font-medium" data-testid="text-license-expiry-date">{format(new Date(customer.licenseExpiryDate), 'PP')}</p>
              </div>
            )}
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
              <p className="font-medium" data-testid="text-vehicle-make">{vehicle?.make}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.vehicleModel')}</p>
              <p className="font-medium" data-testid="text-vehicle-model">{vehicle?.model}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleYear')}</p>
                <p className="font-medium" data-testid="text-vehicle-year">{vehicle?.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleColor')}</p>
                <p className="font-medium" data-testid="text-vehicle-color">{vehicle?.color}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('form.vehiclePlate')}</p>
              <p className="font-medium font-mono" data-testid="text-vehicle-plate">{vehicle?.registration}</p>
            </div>
            {vehicle?.vin && (
              <div>
                <p className="text-sm text-muted-foreground">{t('form.vehicleVin')}</p>
                <p className="font-medium font-mono" data-testid="text-vehicle-vin">{vehicle?.vin}</p>
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

      {/* Return Workflow Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Rental - Vehicle Return</DialogTitle>
            <DialogDescription>
              Record vehicle return details and calculate final charges
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="odometer-end">Odometer End (km) *</Label>
              <Input
                id="odometer-end"
                type="number"
                value={odometerEnd}
                onChange={(e) => setOdometerEnd(e.target.value)}
                placeholder="Enter final odometer reading"
                data-testid="input-odometer-end"
              />
            </div>

            <div>
              <Label htmlFor="fuel-level-end">Fuel Level End *</Label>
              <Select value={fuelLevelEnd} onValueChange={setFuelLevelEnd}>
                <SelectTrigger id="fuel-level-end" data-testid="select-fuel-level-end">
                  <SelectValue placeholder="Select fuel level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="3/4">3/4</SelectItem>
                  <SelectItem value="1/2">1/2</SelectItem>
                  <SelectItem value="1/4">1/4</SelectItem>
                  <SelectItem value="Empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicle-condition">Vehicle Condition (damage notes)</Label>
              <Textarea
                id="vehicle-condition"
                value={vehicleCondition}
                onChange={(e) => setVehicleCondition(e.target.value)}
                placeholder="Enter any damage or condition notes"
                rows={3}
                data-testid="textarea-vehicle-condition"
              />
            </div>

            {extraCharges && (
              <div className="border rounded-md p-4 bg-muted/50 space-y-3">
                <h4 className="font-semibold">Auto-Calculated Charges</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Extra KM Driven:</p>
                    <p className="font-mono" data-testid="text-calc-extra-km">{extraCharges.extraKmDriven} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Extra KM Charge:</p>
                    <p className="font-mono" data-testid="text-calc-extra-km-charge">{extraCharges.extraKmChargeAmount.toFixed(2)} {currency}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fuel-charge">Fuel Charge ({currency})</Label>
                  <Input
                    id="fuel-charge"
                    type="number"
                    step="0.01"
                    value={fuelCharge}
                    onChange={(e) => setFuelCharge(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-fuel-charge"
                  />
                </div>

                <div>
                  <Label htmlFor="damage-charge">Damage Charge ({currency})</Label>
                  <Input
                    id="damage-charge"
                    type="number"
                    step="0.01"
                    value={damageCharge}
                    onChange={(e) => setDamageCharge(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-damage-charge"
                  />
                </div>

                <div>
                  <Label htmlFor="other-charges">Other Charges ({currency})</Label>
                  <Input
                    id="other-charges"
                    type="number"
                    step="0.01"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-other-charges"
                  />
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Extra Charges:</span>
                    <span className="font-mono" data-testid="text-calc-total-extra">{extraCharges.totalExtraCharges.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Outstanding Balance:</span>
                    <span className="font-mono" data-testid="text-calc-outstanding">{extraCharges.outstandingBalance.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnSubmit} disabled={completeMutation.isPending} data-testid="button-submit-return">
              {completeMutation.isPending ? 'Processing...' : 'Complete Rental'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Payment Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Deposit Payment</DialogTitle>
            <DialogDescription>
              Select the payment method for the security deposit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="deposit-payment-method">Payment Method *</Label>
              <Select value={depositPaymentMethod} onValueChange={setDepositPaymentMethod}>
                <SelectTrigger id="deposit-payment-method" data-testid="select-deposit-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => depositMutation.mutate(depositPaymentMethod)} 
              disabled={!depositPaymentMethod || depositMutation.isPending}
              data-testid="button-submit-deposit"
            >
              {depositMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Payment Dialog */}
      <Dialog open={showFinalPaymentDialog} onOpenChange={setShowFinalPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Final Payment</DialogTitle>
            <DialogDescription>
              Select the payment method for the final payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="final-payment-method">Payment Method *</Label>
              <Select value={finalPaymentMethod} onValueChange={setFinalPaymentMethod}>
                <SelectTrigger id="final-payment-method" data-testid="select-final-payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => finalPaymentMutation.mutate(finalPaymentMethod)} 
              disabled={!finalPaymentMethod || finalPaymentMutation.isPending}
              data-testid="button-submit-final-payment"
            >
              {finalPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Deposit Refund</DialogTitle>
            <DialogDescription>
              Confirm that the security deposit has been refunded to the customer
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => refundMutation.mutate()} 
              disabled={refundMutation.isPending}
              data-testid="button-submit-refund"
            >
              {refundMutation.isPending ? 'Recording...' : 'Record Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
