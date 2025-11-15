import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { InsuranceClaim } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Loader2, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

export default function InsuranceClaims() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isManager, isAdmin } = useAuth();
  const { formatCurrency } = useCurrency();
  const [, navigate] = useLocation();
  const isArabic = i18n.language === 'ar';

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<InsuranceClaim | null>(null);

  // Fetch claims
  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ['/api/insurance-claims', { status: statusFilter }],
    enabled: isAuthenticated,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/insurance-claims/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims'] });
      toast({
        title: t('common.success'),
        description: 'Insurance claim deleted successfully',
      });
      setDeleteDialogOpen(false);
      setClaimToDelete(null);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || 'Failed to delete insurance claim',
      });
    },
  });

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'settled':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'settled':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      settled: 'Settled',
    };
    return labels[status] || status;
  };

  // Filter claims based on search
  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.insuranceCompany.toLowerCase().includes(query) ||
      claim.policyNumber.toLowerCase().includes(query)
    );
  });

  const handleDelete = (claim: InsuranceClaim) => {
    setClaimToDelete(claim);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (claimToDelete) {
      deleteMutation.mutate(claimToDelete.id);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Insurance Claims
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage insurance claims for vehicle accidents
          </p>
        </div>
        <Button
          onClick={() => navigate('/insurance-claims/new')}
          data-testid="button-new-claim"
          className="hover-elevate active-elevate-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Claim
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by claim number, insurance company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No insurance claims found</p>
              {statusFilter && (
                <Button
                  variant="link"
                  onClick={() => setStatusFilter('')}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim Number</TableHead>
                    <TableHead>Incident Date</TableHead>
                    <TableHead>Insurance Company</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead className="text-right">Claim Amount</TableHead>
                    <TableHead className="text-right">Approved Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id} data-testid={`row-claim-${claim.id}`}>
                      <TableCell className="font-medium">
                        {claim.claimNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(claim.incidentDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{claim.insuranceCompany}</TableCell>
                      <TableCell>{claim.policyNumber}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(claim.claimAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={getStatusColor(claim.claimStatus)}
                          data-testid={`badge-status-${claim.id}`}
                        >
                          {getStatusLabel(claim.claimStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/insurance-claims/${claim.id}`)}
                            data-testid={`button-view-${claim.id}`}
                            className="hover-elevate active-elevate-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/insurance-claims/${claim.id}/edit`)}
                            data-testid={`button-edit-${claim.id}`}
                            className="hover-elevate active-elevate-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(isAdmin || isManager) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(claim)}
                              data-testid={`button-delete-${claim.id}`}
                              className="hover-elevate active-elevate-2 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insurance Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete claim {claimToDelete?.claimNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover-elevate active-elevate-2"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
