import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertCustomerRiskScoreSchema,
  type CustomerRiskScore,
  type InsertCustomerRiskScore
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function CustomerRiskScoring() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<CustomerRiskScore | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const { data: riskScores = [], isLoading } = useQuery<CustomerRiskScore[]>({
    queryKey: ["/api/customer-risk-scores"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<InsertCustomerRiskScore>({
    resolver: zodResolver(insertCustomerRiskScoreSchema),
    defaultValues: {
      customerId: "",
      riskScore: 0,
      riskCategory: "low",
      paymentHistory: 0,
      contractViolations: 0,
      accidentHistory: 0,
      finesHistory: 0,
      licenseValidity: 0,
      identityVerification: 0,
      outstandingBalance: "0",
      blacklistStatus: false,
      notes: "",
      calculatedBy: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCustomerRiskScore) => apiRequest("POST", "/api/customer-risk-scores", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-risk-scores"] });
      showSuccess(t("success"), "Risk score created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCustomerRiskScore> }) =>
      apiRequest("PATCH", `/api/customer-risk-scores/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-risk-scores"] });
      showSuccess(t("success"), "Risk score updated successfully");
      setDialogOpen(false);
      setEditingScore(null);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const handleCreate = () => {
    setEditingScore(null);
    form.reset({
      customerId: "",
      riskScore: 0,
      riskCategory: "low",
      paymentHistory: 0,
      contractViolations: 0,
      accidentHistory: 0,
      finesHistory: 0,
      licenseValidity: 0,
      identityVerification: 0,
      outstandingBalance: "0",
      blacklistStatus: false,
      notes: "",
      calculatedBy: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (score: CustomerRiskScore) => {
    setEditingScore(score);
    form.reset({
      customerId: score.customerId,
      riskScore: score.riskScore,
      riskCategory: score.riskCategory,
      paymentHistory: score.paymentHistory || 0,
      contractViolations: score.contractViolations || 0,
      accidentHistory: score.accidentHistory || 0,
      finesHistory: score.finesHistory || 0,
      licenseValidity: score.licenseValidity || 0,
      identityVerification: score.identityVerification || 0,
      outstandingBalance: score.outstandingBalance || "0",
      blacklistStatus: score.blacklistStatus || false,
      notes: score.notes || "",
      calculatedBy: score.calculatedBy,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertCustomerRiskScore) => {
    const calculatedScore = 
      (data.paymentHistory || 0) +
      (data.contractViolations || 0) +
      (data.accidentHistory || 0) +
      (data.finesHistory || 0) +
      (data.licenseValidity || 0) +
      (data.identityVerification || 0);

    let category: "low" | "medium" | "high" | "critical";
    if (calculatedScore <= 30) category = "low";
    else if (calculatedScore <= 60) category = "medium";
    else if (calculatedScore <= 80) category = "high";
    else category = "critical";

    const finalData = {
      ...data,
      riskScore: calculatedScore,
      riskCategory: category,
    };

    if (editingScore) {
      updateMutation.mutate({ id: editingScore.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.nameEn || "N/A";
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.username || "N/A";
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    if (score <= 80) return "text-orange-600";
    return "text-red-600";
  };

  const getRiskBadgeVariant = (category: string): "default" | "secondary" | "destructive" => {
    switch (category) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
      case "critical":
        return "destructive";
      default:
        return "default";
    }
  };

  const selectedCustomerScores = useMemo(() => {
    if (!selectedCustomerId) return [];
    return riskScores
      .filter(score => score.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.scoringDate).getTime() - new Date(a.scoringDate).getTime());
  }, [riskScores, selectedCustomerId]);

  const latestScore = selectedCustomerScores[0];

  const averageRiskScore = riskScores.length > 0
    ? (riskScores.reduce((sum, score) => sum + score.riskScore, 0) / riskScores.length).toFixed(1)
    : "0";

  const highRiskCount = riskScores.filter(s => s.riskCategory === "high").length;
  const criticalRiskCount = riskScores.filter(s => s.riskCategory === "critical").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Customer Risk Scoring
          </h1>
          <p className="text-muted-foreground mt-1">Assess and monitor customer risk profiles</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-risk-score">
          <Plus className="w-4 h-4 mr-2" />
          Calculate Risk Score
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRiskScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Customers</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risk Customers</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalRiskCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger data-testid="select-customer-filter">
              <SelectValue placeholder="Select customer to view risk profile" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCustomerId && latestScore && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1 md:col-span-3">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getRiskColor(latestScore.riskScore)}`}>
                        {latestScore.riskScore}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Total Risk Score</p>
                      <Badge variant={getRiskBadgeVariant(latestScore.riskCategory)} className="mt-2">
                        {latestScore.riskCategory.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment History</CardTitle>
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.paymentHistory || 0} / 25</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contract Violations</CardTitle>
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.contractViolations || 0} / 15</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accident History</CardTitle>
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.accidentHistory || 0} / 15</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Traffic Fines</CardTitle>
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.finesHistory || 0} / 15</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">License Validity</CardTitle>
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.licenseValidity || 0} / 10</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Identity Verification</CardTitle>
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestScore.identityVerification || 0} / 5</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Score History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Scored By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCustomerScores.map((score) => (
                    <TableRow key={score.id}>
                      <TableCell>{format(new Date(score.scoringDate), "PPp")}</TableCell>
                      <TableCell className={getRiskColor(score.riskScore)}>
                        <span className="font-bold">{score.riskScore}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(score.riskCategory)}>
                          {score.riskCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>{getUserName(score.calculatedBy)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            All Risk Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : riskScores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No risk scores found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Risk Category</TableHead>
                  <TableHead>Payment History</TableHead>
                  <TableHead>Contract Violations</TableHead>
                  <TableHead>Accident Frequency</TableHead>
                  <TableHead>Last Scored Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskScores.map((score) => (
                  <TableRow key={score.id} data-testid={`table-row-risk-score-${score.id}`}>
                    <TableCell className="font-medium">{getCustomerName(score.customerId)}</TableCell>
                    <TableCell className={getRiskColor(score.riskScore)}>
                      <span className="font-bold">{score.riskScore}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(score.riskCategory)}>
                        {score.riskCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>{score.paymentHistory || 0}</TableCell>
                    <TableCell>{score.contractViolations || 0}</TableCell>
                    <TableCell>{score.accidentHistory || 0}</TableCell>
                    <TableCell>{format(new Date(score.scoringDate), "PP")}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(score)}
                        data-testid={`button-edit-risk-score-${score.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScore ? "Edit Risk Score" : "Calculate Risk Score"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customerId">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.nameEn}
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
                name="calculatedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculated By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-calculatedBy">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment History (0-25)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-paymentHistory"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractViolations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Violations (0-15)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-contractViolations"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accidentHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accident History (0-15)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-accidentHistory"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finesHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Traffic Fines (0-15)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-finesHistory"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseValidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Validity (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-licenseValidity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identityVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Verification (0-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-identityVerification"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-risk-score">
                  {editingScore ? "Update" : "Calculate"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
