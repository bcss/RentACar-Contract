import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Plus, FileText, DollarSign, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

interface ClaimProgressUpdate {
  id: string;
  claimId: string;
  updateType: string;
  previousStatus?: string;
  newStatus?: string;
  previousAmount?: string;
  newAmount?: string;
  amountType?: string;
  remark?: string;
  remarkAr?: string;
  attachments?: any;
  updatedBy: string;
  createdAt: string;
  updater?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

interface ClaimsProgressTimelineProps {
  claimId: string;
  canAddUpdates?: boolean;
}

export function ClaimsProgressTimeline({ claimId, canAddUpdates = false }: ClaimsProgressTimelineProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const isArabic = i18n.language === 'ar';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateType, setUpdateType] = useState('remark');
  const [remark, setRemark] = useState('');
  const [remarkAr, setRemarkAr] = useState('');
  const [previousStatus, setPreviousStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [amountType, setAmountType] = useState('');
  const [previousAmount, setPreviousAmount] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Fetch progress updates
  const { data: progressUpdates = [], isLoading } = useQuery<ClaimProgressUpdate[]>({
    queryKey: ['/api/claims', claimId, 'progress'],
    enabled: !!claimId,
  });

  // Add progress update mutation
  const addUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', `/api/claims/${claimId}/progress`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/claims', claimId, 'progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims', claimId] });
      toast({
        title: t('common.success'),
        description: t('claims.progressUpdateAdded'),
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('claims.progressUpdateFailed'),
      });
    },
  });

  const resetForm = () => {
    setUpdateType('remark');
    setRemark('');
    setRemarkAr('');
    setPreviousStatus('');
    setNewStatus('');
    setAmountType('');
    setPreviousAmount('');
    setNewAmount('');
  };

  const handleSubmit = () => {
    const data: any = {
      updateType,
      updatedBy: user?.id,
    };

    if (updateType === 'status_change') {
      if (!newStatus) {
        toast({
          variant: 'destructive',
          title: t('common.error'),
          description: t('claims.newStatusRequired'),
        });
        return;
      }
      data.previousStatus = previousStatus || null;
      data.newStatus = newStatus;
    } else if (updateType === 'financial_update') {
      if (!amountType || !newAmount) {
        toast({
          variant: 'destructive',
          title: t('common.error'),
          description: t('claims.amountDetailsRequired'),
        });
        return;
      }
      data.amountType = amountType;
      data.previousAmount = previousAmount || null;
      data.newAmount = newAmount;
    }

    if (remark || remarkAr) {
      data.remark = remark || null;
      data.remarkAr = remarkAr || null;
    }

    addUpdateMutation.mutate(data);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <AlertCircle className="h-5 w-5" />;
      case 'financial_update':
        return <DollarSign className="h-5 w-5" />;
      case 'document_upload':
        return <FileText className="h-5 w-5" />;
      case 'approval':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'under_review':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'settled':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="card-claims-progress-timeline">
        <CardHeader>
          <CardTitle>{t('claims.progressTimeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-claims-progress-timeline">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{t('claims.progressTimeline')}</CardTitle>
        {canAddUpdates && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-progress-update">
                <Plus className="h-4 w-4 mr-2" />
                {t('claims.addUpdate')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-progress-update">
              <DialogHeader>
                <DialogTitle>{t('claims.addProgressUpdate')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t('claims.updateType')}</Label>
                  <Select value={updateType} onValueChange={setUpdateType}>
                    <SelectTrigger data-testid="select-update-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remark">{t('claims.remark')}</SelectItem>
                      <SelectItem value="status_change">{t('claims.statusChange')}</SelectItem>
                      <SelectItem value="financial_update">{t('claims.financialUpdate')}</SelectItem>
                      <SelectItem value="document_upload">{t('claims.documentUpload')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {updateType === 'status_change' && (
                  <>
                    <div>
                      <Label>{t('claims.previousStatus')} ({t('common.optional')})</Label>
                      <Select value={previousStatus} onValueChange={setPreviousStatus}>
                        <SelectTrigger data-testid="select-previous-status">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('claims.status.pending')}</SelectItem>
                          <SelectItem value="under_review">{t('claims.status.underReview')}</SelectItem>
                          <SelectItem value="approved">{t('claims.status.approved')}</SelectItem>
                          <SelectItem value="rejected">{t('claims.status.rejected')}</SelectItem>
                          <SelectItem value="settled">{t('claims.status.settled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('claims.newStatus')} *</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger data-testid="select-new-status">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('claims.status.pending')}</SelectItem>
                          <SelectItem value="under_review">{t('claims.status.underReview')}</SelectItem>
                          <SelectItem value="approved">{t('claims.status.approved')}</SelectItem>
                          <SelectItem value="rejected">{t('claims.status.rejected')}</SelectItem>
                          <SelectItem value="settled">{t('claims.status.settled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {updateType === 'financial_update' && (
                  <>
                    <div>
                      <Label>{t('claims.amountType')} *</Label>
                      <Select value={amountType} onValueChange={setAmountType}>
                        <SelectTrigger data-testid="select-amount-type">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claim_amount">{t('claims.claimAmount')}</SelectItem>
                          <SelectItem value="approved_amount">{t('claims.approvedAmount')}</SelectItem>
                          <SelectItem value="settled_amount">{t('claims.settledAmount')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('claims.previousAmount')} ({t('common.optional')})</Label>
                      <Input
                        type="text"
                        value={previousAmount}
                        onChange={(e) => setPreviousAmount(e.target.value)}
                        placeholder="0.00"
                        data-testid="input-previous-amount"
                      />
                    </div>
                    <div>
                      <Label>{t('claims.newAmount')} *</Label>
                      <Input
                        type="text"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="0.00"
                        data-testid="input-new-amount"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>{t('claims.remarkEnglish')}</Label>
                  <Textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={t('claims.remarkPlaceholder')}
                    rows={3}
                    data-testid="textarea-remark-en"
                  />
                </div>

                <div>
                  <Label>{t('claims.remarkArabic')}</Label>
                  <Textarea
                    value={remarkAr}
                    onChange={(e) => setRemarkAr(e.target.value)}
                    placeholder={t('claims.remarkPlaceholder')}
                    rows={3}
                    dir="rtl"
                    data-testid="textarea-remark-ar"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-progress-update"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={addUpdateMutation.isPending}
                    data-testid="button-submit-progress-update"
                  >
                    {addUpdateMutation.isPending ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {progressUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="text-no-progress-updates">
            {t('claims.noProgressUpdates')}
          </p>
        ) : (
          <div className="space-y-4">
            {progressUpdates.map((update, index) => (
              <div
                key={update.id}
                className="flex gap-4 pb-4 border-b last:border-b-0"
                data-testid={`progress-update-${index}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {getUpdateIcon(update.updateType)}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-update-type-${index}`}>
                        {t(`claims.updateType.${update.updateType}`)}
                      </Badge>
                      {update.newStatus && (
                        <Badge variant={getStatusBadgeVariant(update.newStatus)} data-testid={`badge-new-status-${index}`}>
                          {t(`claims.status.${update.newStatus}`)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid={`text-update-time-${index}`}>
                      {format(new Date(update.createdAt), 'PPp')}
                    </span>
                  </div>

                  {update.updateType === 'status_change' && (
                    <div className="text-sm">
                      {update.previousStatus && (
                        <span className="text-muted-foreground">
                          {t('claims.from')} <Badge variant="outline" className="mx-1">{t(`claims.status.${update.previousStatus}`)}</Badge>
                        </span>
                      )}
                      {update.previousStatus && update.newStatus && (
                        <span className="text-muted-foreground mx-1">→</span>
                      )}
                      {update.newStatus && (
                        <span className="text-muted-foreground">
                          {t('claims.to')} <Badge variant={getStatusBadgeVariant(update.newStatus)} className="mx-1">{t(`claims.status.${update.newStatus}`)}</Badge>
                        </span>
                      )}
                    </div>
                  )}

                  {update.updateType === 'financial_update' && (
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-foreground">
                        {t(`claims.${update.amountType}`)}
                      </div>
                      {update.previousAmount && (
                        <div className="text-muted-foreground">
                          {t('claims.previous')}: <span className="font-mono">{update.previousAmount} AED</span>
                        </div>
                      )}
                      {update.newAmount && (
                        <div className="text-foreground">
                          {t('claims.new')}: <span className="font-mono font-medium">{update.newAmount} AED</span>
                        </div>
                      )}
                    </div>
                  )}

                  {(update.remark || update.remarkAr) && (
                    <div className="text-sm bg-muted/50 p-3 rounded-md space-y-2">
                      {update.remark && (
                        <p className="text-foreground" data-testid={`text-remark-en-${index}`}>{update.remark}</p>
                      )}
                      {update.remarkAr && (
                        <p className="text-foreground" dir="rtl" data-testid={`text-remark-ar-${index}`}>{update.remarkAr}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span data-testid={`text-updater-name-${index}`}>
                      {update.updater?.firstName && update.updater?.lastName
                        ? `${update.updater.firstName} ${update.updater.lastName}`
                        : update.updater?.username || t('common.unknown')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
