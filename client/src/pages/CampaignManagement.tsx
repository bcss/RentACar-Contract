import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, CheckCircle, XCircle, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  status: string;
  channel: string;
  scope: string;
  estimatedRecipients: number;
  estimatedCost?: string;
  scheduledAt?: string;
  sentAt?: string;
  successCount: number;
  failureCount: number;
  requiresApproval: boolean;
  createdAt: string;
  creator?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

export default function CampaignManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [channel, setChannel] = useState('email');
  const [scope, setScope] = useState('branch');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState('all');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['/api/notification-templates'],
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['/api/branches'],
    enabled: user?.role === 'admin',
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/campaigns', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: t('common.success'),
        description: t('campaigns.created'),
      });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('campaigns.createFailed'),
      });
    },
  });

  const approveCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/campaigns/${id}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: t('common.success'),
        description: t('campaigns.approved'),
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/campaigns/${id}/send', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: t('common.success'),
        description: t('campaigns.sent'),
      });
    },
  });

  const resetForm = () => {
    setName('');
    setNameAr('');
    setDescription('');
    setTemplateId('');
    setChannel('email');
    setScope('branch');
    setSelectedBranches([]);
    setRecipientType('all');
    setScheduledAt('');
  };

  const handleCreate = () => {
    if (!name || !templateId) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('campaigns.nameTemplateRequired'),
      });
      return;
    }

    const recipientFilter = {
      type: recipientType,
      // Add more complex filtering logic as needed
    };

    createCampaignMutation.mutate({
      name,
      nameAr: nameAr || null,
      description: description || null,
      templateId,
      channel,
      scope,
      selectedBranches: scope === 'selected_branches' ? selectedBranches : null,
      recipientFilter,
      scheduledAt: scheduledAt || null,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'outline',
      pending_approval: 'default',
      approved: 'default',
      scheduled: 'default',
      sending: 'default',
      sent: 'default',
      cancelled: 'destructive',
      failed: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'sending':
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="p-6" data-testid="loading-campaigns">{t('common.loading')}</div>;
  }

  const canCreateOrganizationCampaigns = user?.role === 'admin';
  const canApproveCampaigns = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="p-6 space-y-6" data-testid="page-campaign-management">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-campaigns">
            {t('campaigns.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('campaigns.description')}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              {t('campaigns.createCampaign')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-campaign">
            <DialogHeader>
              <DialogTitle>{t('campaigns.createCampaign')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('campaigns.name')} *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('campaigns.namePlaceholder')}
                  data-testid="input-campaign-name"
                />
              </div>

              <div>
                <Label>{t('campaigns.nameAr')}</Label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder={t('campaigns.nameArPlaceholder')}
                  dir="rtl"
                  data-testid="input-campaign-name-ar"
                />
              </div>

              <div>
                <Label>{t('campaigns.description')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('campaigns.descriptionPlaceholder')}
                  rows={3}
                  data-testid="textarea-campaign-description"
                />
              </div>

              <div>
                <Label>{t('campaigns.template')} *</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('campaigns.channel')}</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger data-testid="select-channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">{t('campaigns.email')}</SelectItem>
                    <SelectItem value="sms">{t('campaigns.sms')}</SelectItem>
                    <SelectItem value="both">{t('campaigns.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('campaigns.scope')}</Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger data-testid="select-scope" disabled={!canCreateOrganizationCampaigns}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch">{t('campaigns.branchScope')}</SelectItem>
                    {canCreateOrganizationCampaigns && (
                      <>
                        <SelectItem value="organization">{t('campaigns.organizationScope')}</SelectItem>
                        <SelectItem value="selected_branches">{t('campaigns.selectedBranches')}</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('campaigns.recipients')}</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger data-testid="select-recipients">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('campaigns.allCustomers')}</SelectItem>
                    <SelectItem value="active">{t('campaigns.activeCustomers')}</SelectItem>
                    <SelectItem value="inactive">{t('campaigns.inactiveCustomers')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('campaigns.scheduleAt')}</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  data-testid="input-schedule-at"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  data-testid="button-cancel-campaign"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createCampaignMutation.isPending}
                  data-testid="button-submit-campaign"
                >
                  {createCampaignMutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.length === 0 ? (
          <Card data-testid="card-no-campaigns">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t('campaigns.noCampaigns')}</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} data-testid={`campaign-card-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(campaign.status)} className="gap-1">
                      {getStatusIcon(campaign.status)}
                      {t(`campaigns.status.${campaign.status}`)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t('campaigns.channel')}</div>
                    <div className="font-medium">{t(`campaigns.${campaign.channel}`)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('campaigns.scope')}</div>
                    <div className="font-medium">{t(`campaigns.${campaign.scope}Scope`)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {t('campaigns.recipients')}
                    </div>
                    <div className="font-medium">{campaign.estimatedRecipients || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {t('campaigns.estimatedCost')}
                    </div>
                    <div className="font-medium">{campaign.estimatedCost || '0'} AED</div>
                  </div>
                </div>

                {campaign.status === 'sent' && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">{t('campaigns.successCount')}</div>
                      <div className="font-medium text-green-600">{campaign.successCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{t('campaigns.failureCount')}</div>
                      <div className="font-medium text-red-600">{campaign.failureCount}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {campaign.status === 'pending_approval' && canApproveCampaigns && (
                    <Button
                      size="sm"
                      onClick={() => approveCampaignMutation.mutate(campaign.id)}
                      disabled={approveCampaignMutation.isPending}
                      data-testid={`button-approve-${campaign.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('campaigns.approve')}
                    </Button>
                  )}
                  {(campaign.status === 'approved' || campaign.status === 'draft') && canApproveCampaigns && (
                    <Button
                      size="sm"
                      onClick={() => sendCampaignMutation.mutate(campaign.id)}
                      disabled={sendCampaignMutation.isPending}
                      data-testid={`button-send-${campaign.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t('campaigns.send')}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mt-4">
                  {t('common.createdAt')}: {format(new Date(campaign.createdAt), 'PPp')}
                  {campaign.sentAt && ` • ${t('campaigns.sentAt')}: ${format(new Date(campaign.sentAt), 'PPp')}`}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
