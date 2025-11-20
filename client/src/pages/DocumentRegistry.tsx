import { useState, useRef, DragEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, FileText, CheckCircle, Upload, X } from "lucide-react";
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
  insertDocumentRegistrySchema,
  type DocumentRegistryEntry,
  type InsertDocumentRegistry
} from "@shared/schema";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

export default function DocumentRegistry() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentRegistryEntry | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useQuery<DocumentRegistryEntry[]>({
    queryKey: ["/api/documents"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: sponsors = [] } = useQuery<any[]>({
    queryKey: ["/api/sponsors"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  const form = useForm<InsertDocumentRegistry>({
    resolver: zodResolver(insertDocumentRegistrySchema),
    defaultValues: {
      entityType: "customer",
      entityId: "",
      documentType: "license",
      documentNumber: "",
      issueDate: undefined,
      expiryDate: undefined,
      issuingAuthority: "",
      fileUrl: "",
      fileName: "",
      fileType: "",
      isVerified: false,
      status: "active",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDocumentRegistry) => apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      showSuccess(t("success"), "Document created successfully");
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDocumentRegistry> }) =>
      apiRequest("PATCH", `/api/documents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      showSuccess(t("success"), "Document updated successfully");
      setDialogOpen(false);
      setEditingDocument(null);
      form.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/documents/${id}/verify`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      showSuccess(t("success"), "Document verified successfully");
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const processFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get CSRF token using the same helper as apiRequest
      const csrfToken = getCsrfToken();

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'File upload failed');
      }

      const data = await response.json();
      
      setUploadedFile({
        name: data.fileName,
        url: data.fileUrl,
        type: data.fileType,
      });

      form.setValue('fileUrl', data.fileUrl);
      form.setValue('fileName', data.fileName);
      form.setValue('fileType', data.fileType);

      showSuccess(t("success"), "File uploaded successfully");
    } catch (error) {
      showError(error as Error, "File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      const validTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(fileExt)) {
        showError(new Error('Invalid file type'), 'Please upload PDF, JPG, PNG, DOC, or DOCX files only');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showError(new Error('File too large'), 'Maximum file size is 10MB');
        return;
      }
      await processFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    form.setValue('fileUrl', '');
    form.setValue('fileName', '');
    form.setValue('fileType', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setUploadedFile(null);
    form.reset({
      entityType: "customer",
      entityId: "",
      documentType: "license",
      documentNumber: "",
      issueDate: undefined,
      expiryDate: undefined,
      issuingAuthority: "",
      fileUrl: "",
      fileName: "",
      fileType: "",
      isVerified: false,
      status: "active",
      notes: "",
    });
    setSelectedEntityType("customer");
    setDialogOpen(true);
  };

  const handleEdit = (document: DocumentRegistryEntry) => {
    setEditingDocument(document);
    setSelectedEntityType(document.entityType);
    setUploadedFile(document.fileUrl ? {
      name: document.fileName || 'Uploaded file',
      url: document.fileUrl,
      type: document.fileType || '',
    } : null);
    form.reset({
      entityType: document.entityType,
      entityId: document.entityId,
      documentType: document.documentType,
      documentNumber: document.documentNumber || "",
      issueDate: document.issueDate || undefined,
      expiryDate: document.expiryDate || undefined,
      issuingAuthority: document.issuingAuthority || "",
      fileUrl: document.fileUrl || "",
      fileName: document.fileName || "",
      fileType: document.fileType || "",
      isVerified: document.isVerified,
      status: document.status as any,
      notes: document.notes || "",
    });
    setDialogOpen(true);
  };

  const handleVerify = (id: string) => {
    verifyMutation.mutate(id);
  };

  const onSubmit = (data: InsertDocumentRegistry) => {
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getEntityOptions = (entityType: string) => {
    switch (entityType) {
      case "customer":
        return customers.map(c => ({ value: c.id, label: c.nameEn }));
      case "driver":
        return drivers.map(d => ({ value: d.id, label: d.nameEn }));
      case "vehicle":
        return vehicles.map(v => ({ value: v.id, label: `${v.registration} - ${v.make} ${v.model}` }));
      case "contract":
        return contracts.map(c => ({ value: c.id, label: c.contractNumber }));
      case "sponsor":
        return sponsors.map(s => ({ value: s.id, label: s.nameEn }));
      case "company":
        return companies.map(c => ({ value: c.id, label: c.nameEn }));
      default:
        return [];
    }
  };

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    
    if (daysUntilExpiry < 0) {
      return { label: "Expired", variant: "destructive" as const };
    } else if (daysUntilExpiry <= 30) {
      return { label: "Expiring Soon", variant: "secondary" as const };
    } else {
      return { label: "Valid", variant: "default" as const };
    }
  };

  const getEntityName = (entityType: string, entityId: string) => {
    switch (entityType) {
      case "customer":
        return customers.find(c => c.id === entityId)?.nameEn || "N/A";
      case "driver":
        return drivers.find(d => d.id === entityId)?.nameEn || "N/A";
      case "vehicle":
        const vehicle = vehicles.find(v => v.id === entityId);
        return vehicle ? `${vehicle.registration}` : "N/A";
      case "contract":
        return contracts.find(c => c.id === entityId)?.contractNumber || "N/A";
      case "sponsor":
        return sponsors.find(s => s.id === entityId)?.nameEn || "N/A";
      case "company":
        return companies.find(c => c.id === entityId)?.nameEn || "N/A";
      default:
        return "N/A";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {t("documentRegistry")}
          </h1>
          <p className="text-muted-foreground mt-1">Centralized document management with expiry tracking</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-document">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Document #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => {
                  const expiryStatus = getExpiryStatus(document.expiryDate);
                  return (
                    <TableRow key={document.id} data-testid={`table-row-document-${document.id}`}>
                      <TableCell className="font-medium">{document.documentType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{document.entityType}</Badge>
                      </TableCell>
                      <TableCell>{getEntityName(document.entityType, document.entityId)}</TableCell>
                      <TableCell>{document.documentNumber || "—"}</TableCell>
                      <TableCell>
                        {document.issueDate ? format(new Date(document.issueDate), "PP") : "—"}
                      </TableCell>
                      <TableCell>
                        {document.expiryDate ? format(new Date(document.expiryDate), "PP") : "—"}
                      </TableCell>
                      <TableCell>
                        {expiryStatus && (
                          <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {document.isVerified ? (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(document)}
                            data-testid={`button-edit-document-${document.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!document.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(document.id)}
                              data-testid={`button-verify-document-${document.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Document" : "Add Document"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedEntityType(value);
                          form.setValue("entityId", "");
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-entityType">
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-entityId">
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getEntityOptions(selectedEntityType).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-documentType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="emirates_id">Emirates ID</SelectItem>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-documentNumber" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="issuingAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Authority</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} data-testid="input-issuingAuthority" placeholder="e.g. RTA Dubai" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Document File</FormLabel>
                  <div className="mt-2">
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1 text-sm">{uploadedFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          data-testid="button-remove-file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover-elevate ${
                          isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25'
                        }`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        data-testid="dropzone-file-upload"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          data-testid="input-file"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="font-medium">
                              {isUploading ? 'Uploading...' : isDragging ? 'Drop file here' : 'Drag & drop file here'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              or click to browse
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or Enter File URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} data-testid="input-fileUrl" placeholder="https://..." disabled={!!uploadedFile} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="renewed">Renewed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} data-testid="input-notes" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-document">
                  {editingDocument ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
