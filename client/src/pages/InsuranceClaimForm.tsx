import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { Contract, Vehicle, InsuranceClaim, insertInsuranceClaimSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DateSelector } from '@/components/ui/date-selector';
import { ClaimsProgressTimeline } from '@/components/ClaimsProgressTimeline';

const formSchema = insertInsuranceClaimSchema.extend({
  contractId: z.string().min(1, 'Contract is required'),
  incidentDescription: z.string().min(1, 'Incident description is required'),
  insuranceCompany: z.string().min(1, 'Insurance company is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  claimAmount: z.string().min(1, 'Claim amount is required'),
  claimantName: z.string().min(1, 'Claimant name is required'),
  claimantContact: z.string().min(1, 'Claimant contact is required'),
  handledBy: z.string().min(1, 'Handler is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function InsuranceClaimForm() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params.id;
  const isArabic = i18n.language === 'ar';

  // Fetch contracts for dropdown
  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
    enabled: isAuthenticated,
  });

  // Fetch existing claim if editing
  const { data: existingClaim, isLoading: isLoadingClaim } = useQuery<InsuranceClaim>({
    queryKey: ['/api/insurance-claims', params.id],
    enabled: isAuthenticated && isEditing,
  });

  // Get vehicles for selected contract
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const selectedContract = contracts.find(c => c.id === selectedContractId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: '',
      claimDate: new Date(),
      incidentDate: new Date(),
      incidentDescription: '',
      insuranceCompany: '',
      policyNumber: '',
      claimAmount: '',
      approvedAmount: '',
      settledAmount: '',
      claimStatus: 'pending',
      claimantName: '',
      claimantContact: '',
      handledBy: (user?.id as string) || '',
      damageAssessment: '',
      notes: '',
      createdBy: (user?.id as string) || '',
    },
  });

  // Load existing claim data
  useEffect(() => {
    if (existingClaim) {
      form.reset({
        contractId: existingClaim.contractId,
        claimDate: new Date(existingClaim.claimDate),
        incidentDate: new Date(existingClaim.incidentDate),
        incidentDescription: existingClaim.incidentDescription,
        insuranceCompany: existingClaim.insuranceCompany,
        policyNumber: existingClaim.policyNumber,
        claimAmount: existingClaim.claimAmount,
        approvedAmount: existingClaim.approvedAmount || '',
        settledAmount: existingClaim.settledAmount || '',
        claimStatus: existingClaim.claimStatus,
        claimantName: existingClaim.claimantName,
        claimantContact: existingClaim.claimantContact,
        handledBy: existingClaim.handledBy || '',
        damageAssessment: existingClaim.damageAssessment || '',
        notes: existingClaim.notes || '',
        createdBy: existingClaim.createdBy || '',
      });
      setSelectedContractId(existingClaim.contractId);
    }
  }, [existingClaim, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest('POST', '/api/insurance-claims', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims'] });
      toast({
        title: t('common.success'),
        description: 'Insurance claim created successfully',
      });
      navigate('/insurance-claims');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to create insurance claim',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest('PATCH', `/api/insurance-claims/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims', params.id] });
      toast({
        title: t('common.success'),
        description: 'Insurance claim updated successfully',
      });
      navigate('/insurance-claims');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to update insurance claim',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isAuthenticated) {
    return null;
  }

  if (isEditing && isLoadingClaim) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/insurance-claims')}
          className="mb-4 hover-elevate active-elevate-2"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Claims
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          {isEditing ? 'Edit Insurance Claim' : 'New Insurance Claim'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing ? 'Update insurance claim details' : 'Create a new insurance claim for vehicle accident'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <Tabs defaultValue="claim" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="claim" data-testid="tab-claim-info">
                    Claim Information
                  </TabsTrigger>
                  <TabsTrigger value="insurance" data-testid="tab-insurance-details">
                    Insurance Details
                  </TabsTrigger>
                  <TabsTrigger value="additional" data-testid="tab-additional">
                    Status & Additional
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">
                <TabsContent value="claim" className="space-y-4 mt-0">
              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedContractId(value);
                      }}
                      disabled={isEditing}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-contract">
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contracts.map((contract: any) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            #{contract.contractNumber} - {contract.customerNameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="claimDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Date *</FormLabel>
                      <FormControl>
                        <DateSelector
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-claim-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Date *</FormLabel>
                      <FormControl>
                        <DateSelector
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-incident-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="incidentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide detailed description of the accident"
                        rows={4}
                        data-testid="input-incident-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="claimantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claimant Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter claimant full name"
                          data-testid="input-claimant-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="claimantContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claimant Contact *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Phone or email"
                          data-testid="input-claimant-contact"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Company *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter insurance provider name"
                          data-testid="input-insurance-company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter policy number"
                          data-testid="input-policy-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="claimAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Amount *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          data-testid="input-claim-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          data-testid="input-approved-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settledAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Settled Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          data-testid="input-settled-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="claimStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="settled">Settled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="handledBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handled By *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          placeholder="Current user"
                          data-testid="input-handled-by"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="damageAssessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Assessment</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detailed assessment of damages"
                        rows={3}
                        data-testid="input-damage-assessment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any additional notes or comments"
                        rows={3}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </TabsContent>
              </CardContent>
            </Tabs>

            <CardContent className="bg-muted/20 border-t pt-6">
              <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="hover-elevate active-elevate-2"
              data-testid="button-submit"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Claim' : 'Create Claim'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/insurance-claims')}
              disabled={isPending}
              data-testid="button-cancel"
              className="hover-elevate active-elevate-2"
            >
              Cancel
            </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      {/* Claims Progress Timeline - Only show when editing existing claim */}
      {isEditing && params.id && (
        <div className="mt-6">
          <ClaimsProgressTimeline 
            claimId={params.id} 
            canAddUpdates={user?.role === 'manager' || user?.role === 'admin' || user?.canCloseContracts}
          />
        </div>
      )}
    </div>
  );
}
