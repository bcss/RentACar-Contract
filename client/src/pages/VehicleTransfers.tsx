import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorDisplay } from "@/components/design-system";
import { Icon } from "@/components/Icon";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const transferFormSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  destinationBranchId: z.string().min(1, "Destination branch is required"),
  transferDate: z.string().min(1, "Transfer date is required"),
  reason: z.string().optional(),
});

const approvalFormSchema = z.object({
  rejectedReason: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferFormSchema>;
type ApprovalFormData = z.infer<typeof approvalFormSchema>;

export default function VehicleTransfers() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const { user, isManager, isAdmin } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [completionNotes, setCompletionNotes] = useState("");

  const canManage = isManager || isAdmin;

  // Fetch transfers
  const { data: transfers = [], isLoading: isLoadingTransfers } = useQuery<any[]>({
    queryKey: ["/api/branch-transfers"],
  });

  // Fetch branches for dropdown
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      vehicleId: "",
      destinationBranchId: "",
      transferDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    },
  });

  const approvalForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      rejectedReason: "",
    },
  });

  // Create transfer mutation
  const createMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      return await apiRequest("POST", "/api/branch-transfers", {
        ...data,
        sourceBranchId: user?.branchId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers"] });
      showSuccess("Success", "Vehicle transfer request created successfully");
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      showError(error, "Error");
    },
  });

  // Approve transfer mutation
  const approveMutation = useMutation({
    mutationFn: async (transferId: string) => {
      return await apiRequest("POST", `/api/branch-transfers/${transferId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers"] });
      showSuccess("Success", "Transfer approved successfully");
      setShowApprovalDialog(false);
      setSelectedTransfer(null);
    },
    onError: (error: any) => {
      showError(error, "Error");
    },
  });

  // Reject transfer mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ transferId, reason }: { transferId: string; reason: string }) => {
      return await apiRequest("POST", `/api/branch-transfers/${transferId}/reject`, { rejectedReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers"] });
      showSuccess("Success", "Transfer rejected");
      setShowApprovalDialog(false);
      setSelectedTransfer(null);
      approvalForm.reset();
    },
    onError: (error: any) => {
      showError(error, "Error");
    },
  });

  // Complete transfer mutation
  const completeMutation = useMutation({
    mutationFn: async ({ transferId, notes }: { transferId: string; notes: string }) => {
      return await apiRequest("POST", `/api/branch-transfers/${transferId}/complete`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-transfers"] });
      showSuccess("Success", "Transfer marked as completed");
      setShowCompletionDialog(false);
      setSelectedTransfer(null);
      setCompletionNotes("");
    },
    onError: (error: any) => {
      showError(error, "Error");
    },
  });

  const handleCreateSubmit = (data: TransferFormData) => {
    createMutation.mutate(data);
  };

  const handleApprove = () => {
    if (selectedTransfer) {
      approveMutation.mutate(selectedTransfer.id);
    }
  };

  const handleReject = (data: ApprovalFormData) => {
    if (selectedTransfer) {
      rejectMutation.mutate({
        transferId: selectedTransfer.id,
        reason: data.rejectedReason || "",
      });
    }
  };

  const handleComplete = () => {
    if (selectedTransfer) {
      completeMutation.mutate({
        transferId: selectedTransfer.id,
        notes: completionNotes,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" data-testid="badge-status-pending">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400" data-testid="badge-status-approved">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-[hsl(var(--negative)/0.1)] text-[hsl(var(--negative))]" data-testid="badge-status-rejected">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-[hsl(var(--positive)/0.1)] text-[hsl(var(--positive))]" data-testid="badge-status-completed">Completed</Badge>;
      default:
        return <Badge data-testid="badge-status-unknown">{status}</Badge>;
    }
  };

  const filteredTransfers = transfers.filter(transfer => 
    statusFilter === "all" || transfer.status === statusFilter
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-vehicle-transfers">
            Vehicle Transfers
          </h1>
          <p className="text-muted-foreground">
            Manage inter-branch vehicle transfers
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-transfer">
          <Icon name="add" className="mr-2" />
          <span>Request Transfer</span>
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoadingTransfers ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Icon name="compare_arrows" className="mx-auto mb-4 h-12 w-12" />
              <p>No transfer requests found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTransfers.map((transfer: any) => (
            <Card key={transfer.id} data-testid={`transfer-card-${transfer.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="directions_car" className="" />
                      {transfer.vehicleRegistration} - {transfer.vehicleMake} {transfer.vehicleModel}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Icon name="location_on" className="text-sm" />
                      <span className="font-semibold">{transfer.sourceBranchNameEn}</span>
                      <Icon name="arrow_forward" className="text-sm" />
                      <span className="font-semibold">{transfer.destinationBranchNameEn}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(transfer.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Transfer Date</p>
                    <p className="font-medium" data-testid="text-transfer-date">
                      {format(new Date(transfer.transferDate), "PP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Initiated By</p>
                    <p className="font-medium" data-testid="text-initiator">
                      {transfer.initiatorName}
                    </p>
                  </div>
                  {transfer.approvedBy && (
                    <div>
                      <p className="text-muted-foreground">Approved By</p>
                      <p className="font-medium" data-testid="text-approver">
                        {transfer.approverName}
                      </p>
                    </div>
                  )}
                  {transfer.completedAt && (
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium" data-testid="text-completed-date">
                        {format(new Date(transfer.completedAt), "PP")}
                      </p>
                    </div>
                  )}
                </div>

                {transfer.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm" data-testid="text-reason">{transfer.reason}</p>
                  </div>
                )}

                {transfer.rejectedReason && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                    <p className="text-sm text-destructive" data-testid="text-rejected-reason">{transfer.rejectedReason}</p>
                  </div>
                )}

                {transfer.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Notes</p>
                    <p className="text-sm" data-testid="text-completion-notes">{transfer.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {transfer.status === "pending" && canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setShowApprovalDialog(true);
                      }}
                      data-testid="button-review-transfer"
                    >
                      <Icon name="check_circle" className="mr-2" />
                      <span>Review</span>
                    </Button>
                  )}
                  {transfer.status === "approved" && canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setShowCompletionDialog(true);
                      }}
                      data-testid="button-mark-complete"
                    >
                      <Icon name="done_all" className="mr-2" />
                      <span>Mark Complete</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Transfer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-transfer">
          <DialogHeader>
            <DialogTitle>Request Vehicle Transfer</DialogTitle>
            <DialogDescription>
              Request to transfer a vehicle to another branch
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationBranchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-destination-branch">
                          <SelectValue placeholder="Select destination branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches
                          .filter((b: any) => b.id !== user?.branchId)
                          .map((branch: any) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.nameEn} - {branch.city}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-transfer-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Why is this transfer needed?" data-testid="textarea-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel-create">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                  {createMutation.isPending ? "Creating..." : "Create Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent data-testid="dialog-approve-transfer">
          <DialogHeader>
            <DialogTitle>Review Transfer Request</DialogTitle>
            <DialogDescription>
              Approve or reject this vehicle transfer request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md space-y-2">
              <p className="font-semibold">
                {selectedTransfer?.vehicleRegistration} - {selectedTransfer?.vehicleMake} {selectedTransfer?.vehicleModel}
              </p>
              <p className="text-sm">
                <span className="font-medium">{selectedTransfer?.sourceBranchNameEn}</span>
                {" → "}
                <span className="font-medium">{selectedTransfer?.destinationBranchNameEn}</span>
              </p>
              {selectedTransfer?.reason && (
                <p className="text-sm text-muted-foreground">{selectedTransfer.reason}</p>
              )}
            </div>
            <Form {...approvalForm}>
              <form onSubmit={approvalForm.handleSubmit(handleReject)} className="space-y-4">
                <FormField
                  control={approvalForm.control}
                  name="rejectedReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason (if rejecting)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Explain why this transfer is being rejected" data-testid="textarea-rejection-reason" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApprovalDialog(false)}
                    data-testid="button-cancel-approval"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                    data-testid="button-reject-transfer"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    data-testid="button-approve-transfer"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent data-testid="dialog-complete-transfer">
          <DialogHeader>
            <DialogTitle>Complete Transfer</DialogTitle>
            <DialogDescription>
              Mark this transfer as completed and add any completion notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md space-y-2">
              <p className="font-semibold">
                {selectedTransfer?.vehicleRegistration} - {selectedTransfer?.vehicleMake} {selectedTransfer?.vehicleModel}
              </p>
              <p className="text-sm">
                <span className="font-medium">{selectedTransfer?.sourceBranchNameEn}</span>
                {" → "}
                <span className="font-medium">{selectedTransfer?.destinationBranchNameEn}</span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Completion Notes (Optional)</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the completion of this transfer"
                className="mt-2"
                data-testid="textarea-completion-notes-input"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionDialog(false);
                  setCompletionNotes("");
                }}
                data-testid="button-cancel-completion"
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                data-testid="button-confirm-complete"
              >
                {completeMutation.isPending ? "Completing..." : "Mark as Complete"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
