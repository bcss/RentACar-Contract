import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Edit, Mail, MessageSquare, Eye, Filter, 
  CheckCircle, XCircle, FileText, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface NotificationTemplate {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  templateCode: string;
  category: string;
  channel: string;
  subject?: string | null;
  subjectAr?: string | null;
  messageBody: string;
  messageBodyAr?: string | null;
  variables: string[];
  isActive: boolean;
  isSystemTemplate: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function NotificationTemplates() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  
  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [templateCode, setTemplateCode] = useState('');
  const [category, setCategory] = useState('contract');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageBodyAr, setMessageBodyAr] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Fetch templates with filters
  const getTemplateQueryKey = () => {
    const params = new URLSearchParams();
    if (filterCategory !== 'all') params.append('category', filterCategory);
    if (filterChannel !== 'all') params.append('channel', filterChannel);
    if (filterActive !== 'all') params.append('isActive', filterActive);
    const queryString = params.toString();
    return queryString ? `/api/notifications/templates?${queryString}` : '/api/notifications/templates';
  };

  const { data: templates = [], isLoading } = useQuery<NotificationTemplate[]>({
    queryKey: [getTemplateQueryKey()],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/notifications/templates', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/templates'] });
      toast({
        title: t('common.success'),
        description: t('templates.created'),
      });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('templates.error'),
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/notifications/templates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/templates'] });
      toast({
        title: t('common.success'),
        description: t('templates.updated'),
      });
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('templates.error'),
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/notifications/templates/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/templates'] });
      toast({
        title: t('common.success'),
        description: t('templates.deleted'),
      });
    },
  });

  const resetForm = () => {
    setName('');
    setNameAr('');
    setDescription('');
    setTemplateCode('');
    setCategory('contract');
    setChannel('email');
    setSubject('');
    setSubjectAr('');
    setMessageBody('');
    setMessageBodyAr('');
    setVariables([]);
    setIsActive(true);
  };

  const handleCreate = () => {
    if (!name || !templateCode || !messageBody) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('templates.requiredFields'),
      });
      return;
    }

    createTemplateMutation.mutate({
      name,
      nameAr: nameAr || null,
      description: description || null,
      templateCode,
      category,
      channel,
      subject: channel === 'email' ? subject : null,
      subjectAr: channel === 'email' ? subjectAr : null,
      messageBody,
      messageBodyAr: messageBodyAr || null,
      variables,
      isActive,
    });
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setNameAr(template.nameAr || '');
    setDescription(template.description || '');
    setTemplateCode(template.templateCode);
    setCategory(template.category);
    setChannel(template.channel);
    setSubject(template.subject || '');
    setSubjectAr(template.subjectAr || '');
    setMessageBody(template.messageBody);
    setMessageBodyAr(template.messageBodyAr || '');
    setVariables(template.variables || []);
    setIsActive(template.isActive);
  };

  const handleUpdate = () => {
    if (!editingTemplate || !name || !templateCode || !messageBody) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('templates.requiredFields'),
      });
      return;
    }

    updateTemplateMutation.mutate({
      id: editingTemplate.id,
      data: {
        name,
        nameAr: nameAr || null,
        description: description || null,
        templateCode,
        category,
        channel,
        subject: channel === 'email' ? subject : null,
        subjectAr: channel === 'email' ? subjectAr : null,
        messageBody,
        messageBodyAr: messageBodyAr || null,
        variables,
        isActive,
      },
    });
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, any> = {
      contract: FileText,
      payment: AlertCircle,
      document: FileText,
      operational: Mail,
      approval: CheckCircle,
    };
    const Icon = icons[cat] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getChannelIcon = (ch: string) => {
    if (ch === 'email') return <Mail className="h-4 w-4" />;
    if (ch === 'sms') return <MessageSquare className="h-4 w-4" />;
    return <Mail className="h-4 w-4" />;
  };

  const canEditTemplates = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return <div className="p-6" data-testid="loading-templates">{t('common.loading')}</div>;
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-notification-templates">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-templates">
            {t('templates.title', 'Notification Templates')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('templates.subtitle', 'Manage SMS and Email notification templates')}
          </p>
        </div>
        {canEditTemplates && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-template">
                <Plus className="h-4 w-4 me-2" />
                {t('templates.create', 'Create Template')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('templates.createTitle', 'Create Notification Template')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" data-testid="label-name">
                      {t('common.name', 'Name')} (EN)
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('templates.namePlaceholder', 'Template name')}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr" data-testid="label-name-ar">
                      {t('common.name', 'Name')} (AR)
                    </Label>
                    <Input
                      id="nameAr"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder={t('templates.nameArPlaceholder', 'اسم القالب')}
                      data-testid="input-name-ar"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateCode" data-testid="label-code">
                      {t('templates.code', 'Template Code')}
                    </Label>
                    <Input
                      id="templateCode"
                      value={templateCode}
                      onChange={(e) => setTemplateCode(e.target.value)}
                      placeholder="CONTRACT_CREATED"
                      data-testid="input-template-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channel" data-testid="label-channel">
                      {t('templates.channel', 'Channel')}
                    </Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger id="channel" data-testid="select-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('templates.email', 'Email')}</SelectItem>
                        <SelectItem value="sms">{t('templates.sms', 'SMS')}</SelectItem>
                        <SelectItem value="both">{t('templates.both', 'Both')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" data-testid="label-category">
                    {t('templates.category', 'Category')}
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">{t('templates.categoryContract', 'Contract')}</SelectItem>
                      <SelectItem value="payment">{t('templates.categoryPayment', 'Payment')}</SelectItem>
                      <SelectItem value="document">{t('templates.categoryDocument', 'Document')}</SelectItem>
                      <SelectItem value="operational">{t('templates.categoryOperational', 'Operational')}</SelectItem>
                      <SelectItem value="approval">{t('templates.categoryApproval', 'Approval')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" data-testid="label-description">
                    {t('common.description', 'Description')}
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('templates.descriptionPlaceholder', 'Template description')}
                    data-testid="input-description"
                    className="resize-none min-h-[60px]"
                  />
                </div>

                {channel === 'email' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" data-testid="label-subject">
                        {t('templates.subject', 'Subject')} (EN)
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t('templates.subjectPlaceholder', 'Email subject')}
                        data-testid="input-subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectAr" data-testid="label-subject-ar">
                        {t('templates.subject', 'Subject')} (AR)
                      </Label>
                      <Input
                        id="subjectAr"
                        value={subjectAr}
                        onChange={(e) => setSubjectAr(e.target.value)}
                        placeholder={t('templates.subjectArPlaceholder', 'موضوع البريد')}
                        data-testid="input-subject-ar"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageBody" data-testid="label-message">
                      {t('templates.message', 'Message')} (EN)
                    </Label>
                    <Textarea
                      id="messageBody"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Dear {{customerName}}, your contract..."
                      data-testid="input-message"
                      className="resize-none min-h-[120px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('templates.variablesHelp', 'Use {{variableName}} for dynamic content')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messageBodyAr" data-testid="label-message-ar">
                      {t('templates.message', 'Message')} (AR)
                    </Label>
                    <Textarea
                      id="messageBodyAr"
                      value={messageBodyAr}
                      onChange={(e) => setMessageBodyAr(e.target.value)}
                      placeholder="عزيزي {{customerName}}، عقدك..."
                      data-testid="input-message-ar"
                      className="resize-none min-h-[120px] font-mono text-sm"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer" data-testid="label-active">
                    {t('templates.active', 'Active')}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={createTemplateMutation.isPending}
                  data-testid="button-submit"
                >
                  {t('common.create', 'Create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('common.filters', 'Filters')}:</span>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]" data-testid="filter-category">
              <SelectValue placeholder={t('templates.allCategories', 'All Categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.allCategories', 'All Categories')}</SelectItem>
              <SelectItem value="contract">{t('templates.categoryContract', 'Contract')}</SelectItem>
              <SelectItem value="payment">{t('templates.categoryPayment', 'Payment')}</SelectItem>
              <SelectItem value="document">{t('templates.categoryDocument', 'Document')}</SelectItem>
              <SelectItem value="operational">{t('templates.categoryOperational', 'Operational')}</SelectItem>
              <SelectItem value="approval">{t('templates.categoryApproval', 'Approval')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[150px]" data-testid="filter-channel">
              <SelectValue placeholder={t('templates.allChannels', 'All Channels')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.allChannels', 'All Channels')}</SelectItem>
              <SelectItem value="email">{t('templates.email', 'Email')}</SelectItem>
              <SelectItem value="sms">{t('templates.sms', 'SMS')}</SelectItem>
              <SelectItem value="both">{t('templates.both', 'Both')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-[130px]" data-testid="filter-active">
              <SelectValue placeholder={t('templates.allStatus', 'All Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.allStatus', 'All Status')}</SelectItem>
              <SelectItem value="true">{t('templates.active', 'Active')}</SelectItem>
              <SelectItem value="false">{t('templates.inactive', 'Inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFilterCategory('all');
              setFilterChannel('all');
              setFilterActive('all');
            }}
            data-testid="button-clear-filters"
          >
            {t('common.clearFilters', 'Clear Filters')}
          </Button>
        </div>
      </Card>

      {/* Templates Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t('common.name', 'Name')}</TableHead>
              <TableHead className="w-[150px]">{t('templates.code', 'Code')}</TableHead>
              <TableHead className="w-[120px]">{t('templates.category', 'Category')}</TableHead>
              <TableHead className="w-[100px]">{t('templates.channel', 'Channel')}</TableHead>
              <TableHead className="w-[300px]">{t('templates.message', 'Message')}</TableHead>
              <TableHead className="w-[100px]">{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-end w-[150px]">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('templates.noTemplates', 'No templates found')}
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} data-testid={`row-template-${template.id}`} className="hover-elevate">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{template.name}</div>
                      {template.nameAr && (
                        <div className="text-xs text-muted-foreground" dir="rtl">{template.nameAr}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{template.templateCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <span className="text-sm capitalize">{template.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(template.channel)}
                      <span className="text-sm capitalize">{template.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[300px] truncate">
                    {template.messageBody}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={template.isActive ? 'default' : 'outline'}
                      data-testid={`badge-status-${template.id}`}
                    >
                      {template.isActive ? (
                        <><CheckCircle className="h-3 w-3 me-1" />{t('templates.active', 'Active')}</>
                      ) : (
                        <><XCircle className="h-3 w-3 me-1" />{t('templates.inactive', 'Inactive')}</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      {canEditTemplates && !template.isSystemTemplate && (
                        <Dialog open={editingTemplate?.id === template.id} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(template)}
                              data-testid={`button-edit-${template.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{t('templates.editTitle', 'Edit Template')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Same form fields as create, but with update handler */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">{t('common.name', 'Name')} (EN)</Label>
                                  <Input
                                    id="edit-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    data-testid="input-edit-name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-nameAr">{t('common.name', 'Name')} (AR)</Label>
                                  <Input
                                    id="edit-nameAr"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                    data-testid="input-edit-name-ar"
                                    dir="rtl"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-description">{t('common.description', 'Description')}</Label>
                                <Textarea
                                  id="edit-description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  data-testid="input-edit-description"
                                  className="resize-none min-h-[60px]"
                                />
                              </div>

                              {channel === 'email' && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-subject">{t('templates.subject', 'Subject')} (EN)</Label>
                                    <Input
                                      id="edit-subject"
                                      value={subject}
                                      onChange={(e) => setSubject(e.target.value)}
                                      data-testid="input-edit-subject"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-subjectAr">{t('templates.subject', 'Subject')} (AR)</Label>
                                    <Input
                                      id="edit-subjectAr"
                                      value={subjectAr}
                                      onChange={(e) => setSubjectAr(e.target.value)}
                                      data-testid="input-edit-subject-ar"
                                      dir="rtl"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-messageBody">{t('templates.message', 'Message')} (EN)</Label>
                                  <Textarea
                                    id="edit-messageBody"
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    data-testid="input-edit-message"
                                    className="resize-none min-h-[120px] font-mono text-sm"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-messageBodyAr">{t('templates.message', 'Message')} (AR)</Label>
                                  <Textarea
                                    id="edit-messageBodyAr"
                                    value={messageBodyAr}
                                    onChange={(e) => setMessageBodyAr(e.target.value)}
                                    data-testid="input-edit-message-ar"
                                    className="resize-none min-h-[120px] font-mono text-sm"
                                    dir="rtl"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  id="edit-isActive"
                                  checked={isActive}
                                  onCheckedChange={setIsActive}
                                  data-testid="switch-edit-active"
                                />
                                <Label htmlFor="edit-isActive" className="cursor-pointer">
                                  {t('templates.active', 'Active')}
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingTemplate(null)}
                                data-testid="button-edit-cancel"
                              >
                                {t('common.cancel', 'Cancel')}
                              </Button>
                              <Button 
                                onClick={handleUpdate} 
                                disabled={updateTemplateMutation.isPending}
                                data-testid="button-edit-submit"
                              >
                                {t('common.save', 'Save Changes')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
