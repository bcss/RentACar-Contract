import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

type EntityType = 'customers' | 'vehicles' | 'sponsors' | 'companies' | 'contracts';
type FileFormat = 'json' | 'csv';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
  errors?: ValidationError[];
}

export default function ImportData() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<EntityType>('customers');
  const [fileFormat, setFileFormat] = useState<FileFormat>('json');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const isSuperAdmin = isAdmin && user?.isImmutable;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isSuperAdmin)) {
      toast({
        title: t('common.error'),
        description: 'Only superadmin can access this page',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, toast, t, setLocation]);

  const importMutation = useMutation({
    mutationFn: async ({ entity, content, format }: { entity: EntityType; content: string; format: FileFormat }) => {
      const res = await apiRequest('POST', `/api/import/${entity}`, {
        fileContent: content,
        format: format,
      });
      return res.json();
    },
    onSuccess: (data: ImportResult) => {
      setValidationResult(data);
      setValidationErrors([]);
      toast({
        title: t('common.success'),
        description: data.message,
      });
      setFileContent('');
      setFileName('');
    },
    onError: (error: any) => {
      const parsedErrors: ValidationError[] = [];
      
      if (error?.errors && Array.isArray(error.errors)) {
        parsedErrors.push(...error.errors);
      } else if (error?.response?.errors && Array.isArray(error.response.errors)) {
        parsedErrors.push(...error.response.errors);
      } else {
        const errorMessage = error?.message || t('common.error');
        
        if (typeof errorMessage === 'string') {
          const lines = errorMessage.split('\n');
          lines.forEach((line) => {
            const match = line.match(/Row (\d+): Field '([^']+)' - (.+)/);
            if (match) {
              parsedErrors.push({
                row: parseInt(match[1]),
                field: match[2],
                message: match[3],
              });
            }
          });
        }
      }
      
      const errorMessage = error?.message || t('common.error');
      const displayMessage = parsedErrors.length > 0 
        ? `Found ${parsedErrors.length} validation error${parsedErrors.length > 1 ? 's' : ''}` 
        : errorMessage;
      
      setValidationResult({ 
        success: false, 
        message: displayMessage,
        errors: parsedErrors 
      });
      setValidationErrors(parsedErrors);
      
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: parsedErrors.length > 0 
          ? `${parsedErrors.length} validation error${parsedErrors.length > 1 ? 's' : ''} found`
          : errorMessage,
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFileName(file.name);
      setValidationResult(null);
      setValidationErrors([]);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!fileContent) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Please select a file first',
      });
      return;
    }

    importMutation.mutate({
      entity: activeTab,
      content: fileContent,
      format: fileFormat,
    });
  };

  const handleClear = () => {
    setFileContent('');
    setFileName('');
    setValidationResult(null);
    setValidationErrors([]);
  };

  const entityDescriptions: Record<EntityType, string> = {
    customers: 'Import customer records including individual and corporate customers with passport IDs, contact information, and license details.',
    vehicles: 'Import vehicle fleet data including registration numbers, make, model, year, and current status (available, rented, maintenance, damaged).',
    sponsors: 'Import sponsor records with passport IDs, nationality, contact details, and relationship information for contract hirers.',
    companies: 'Import corporate sponsor companies with registration numbers, trade licenses, contact persons, and business information.',
    contracts: 'Import rental contracts in DRAFT status. Requires existing customers and vehicles. Automatically calculates rental amounts and validates relationships.',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-import-data">
            Import Data
          </h1>
          <p className="text-muted-foreground">
            Bulk import master data and contracts from external systems. Supports JSON and CSV formats with comprehensive validation.
          </p>
        </div>

        <Alert data-testid="alert-import-info">
          <Icon name="info" className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>• All files are validated before import - no data is imported if any validation error is found</p>
            <p>• Import is atomic - either all records succeed or none do</p>
            <p>• Duplicate checking is performed against existing database records</p>
            <p>• Contracts are created in DRAFT status only</p>
            <p>
              • See{' '}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="underline hover:text-primary" data-testid="button-open-import-guide">
                    Import Data Guide
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Import Data Guide</DialogTitle>
                    <DialogDescription>
                      Comprehensive guide for importing master data and contracts into RCCMS
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 text-sm">
                    <section>
                      <h3 className="text-lg font-semibold mb-2">Overview</h3>
                      <p className="text-muted-foreground">
                        The Import Data feature allows you to bulk import master data (Customers, Vehicles, Sponsors, Companies) and Contracts from external systems. 
                        Both JSON and CSV formats are supported with comprehensive validation and atomic transaction processing.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Transaction-based atomicity: All records succeed or none do</li>
                        <li>Comprehensive validation before any database changes</li>
                        <li>Duplicate detection using unique identifiers</li>
                        <li>Field-level error reporting with row and column details</li>
                        <li>Supports both JSON array and CSV formats</li>
                        <li>Sample files available for download on each entity tab</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">File Format Guidelines</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-1">JSON Format</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>Must be a valid JSON array of objects</li>
                            <li>Each object represents one record</li>
                            <li>Field names are case-sensitive</li>
                            <li>Date fields: YYYY-MM-DD format</li>
                            <li>Datetime fields: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)</li>
                            <li>Boolean fields: true or false (lowercase)</li>
                            <li>Numeric fields: Numbers without quotes</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">CSV Format</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>First row must contain column headers (field names)</li>
                            <li>Headers are case-sensitive and must match schema exactly</li>
                            <li>Use double quotes for fields containing commas</li>
                            <li>Date/datetime formats same as JSON</li>
                            <li>Boolean values: "true" or "false" (quoted strings)</li>
                            <li>Empty cells are treated as null/undefined</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Import Process</h3>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li><strong>Select Entity Type:</strong> Choose which type of data you're importing (Customers, Vehicles, etc.)</li>
                        <li><strong>Choose Format:</strong> Select JSON or CSV based on your source file</li>
                        <li><strong>Download Sample:</strong> Click JSON Sample or CSV Sample to get template files</li>
                        <li><strong>Prepare Your Data:</strong> Fill in your data following the sample format and field requirements</li>
                        <li><strong>Upload File:</strong> Click "Choose File" and select your prepared data file</li>
                        <li><strong>Review Preview:</strong> Check the file preview to ensure data is correctly formatted</li>
                        <li><strong>Import:</strong> Click "Import Data" to start the validation and import process</li>
                        <li><strong>Handle Errors:</strong> If validation fails, review the error table showing row, field, and error details</li>
                        <li><strong>Verify Success:</strong> Check the success message showing how many records were imported</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Entity-Specific Notes</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-1">Customers</h4>
                          <p className="text-muted-foreground">
                            Unique identifier: <code className="bg-muted px-1 py-0.5 rounded">nationalId</code>. 
                            This field must be unique across all customers. Required fields include nameEn, phone, and nationalId.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Vehicles</h4>
                          <p className="text-muted-foreground">
                            Unique identifier: <code className="bg-muted px-1 py-0.5 rounded">registration</code> (license plate). 
                            Status defaults to "available" if not specified. Valid status values: available, rented, maintenance, damaged.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Sponsors</h4>
                          <p className="text-muted-foreground">
                            Individual sponsors for contract hirers. Only required field is nameEn. Can include passport, nationality, and relationship information.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Companies</h4>
                          <p className="text-muted-foreground">
                            Corporate sponsors with business registration details. Only required field is nameEn. Can include registration numbers, tax IDs, and contact information.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Contracts</h4>
                          <p className="text-muted-foreground">
                            <strong>IMPORTANT:</strong> Customers, Vehicles, and Sponsors (if applicable) must exist before importing contracts. 
                            Use customerId/vehicleId UUIDs or the system will attempt to look them up. All imported contracts are created in DRAFT status.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Common Validation Errors</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Missing required field:</strong> Ensure all required fields are present and not empty</li>
                        <li><strong>Duplicate identifier:</strong> The unique field (nationalId, registration, etc.) already exists in database</li>
                        <li><strong>Invalid date format:</strong> Use YYYY-MM-DD for dates, ISO 8601 for datetimes</li>
                        <li><strong>Invalid enum value:</strong> Check that status, gender, fuelType values match allowed options</li>
                        <li><strong>Invalid JSON:</strong> Ensure JSON is properly formatted with matching brackets and quotes</li>
                        <li><strong>Referenced record not found:</strong> For contracts, ensure customers/vehicles/sponsors exist first</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Download Sample Files</h3>
                      <p className="text-muted-foreground mb-3">
                        Each entity tab has download buttons for JSON and CSV sample files. These templates include example data with proper formatting for all fields.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/customers_sample.json', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Customers JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/customers_sample.csv', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Customers CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/vehicles_sample.json', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Vehicles JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/vehicles_sample.csv', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Vehicles CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/sponsors_sample.json', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Sponsors JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/sponsors_sample.csv', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Sponsors CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/companies_sample.json', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Companies JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/companies_sample.csv', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Companies CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/contracts_sample.json', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Contracts JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/samples/contracts_sample.csv', '_blank')}
                        >
                          <Icon name="download" className="mr-2 h-4 w-4" />
                          Contracts CSV
                        </Button>
                      </div>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
              {' '}for detailed instructions and examples
            </p>
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EntityType)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="customers" data-testid="tab-import-customers">
              Customers
            </TabsTrigger>
            <TabsTrigger value="vehicles" data-testid="tab-import-vehicles">
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="sponsors" data-testid="tab-import-sponsors">
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-import-companies">
              Companies
            </TabsTrigger>
            <TabsTrigger value="contracts" data-testid="tab-import-contracts">
              Contracts
            </TabsTrigger>
          </TabsList>

          {(['customers', 'vehicles', 'sponsors', 'companies', 'contracts'] as EntityType[]).map((entity) => (
            <TabsContent key={entity} value={entity} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">Import {entity}</CardTitle>
                  <CardDescription>{entityDescriptions[entity]}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">File Format</label>
                      <Select
                        value={fileFormat}
                        onValueChange={(value) => setFileFormat(value as FileFormat)}
                        data-testid={`select-format-${entity}`}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON (.json)</SelectItem>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload File</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept={fileFormat === 'json' ? '.json' : '.csv'}
                          onChange={handleFileChange}
                          className="hidden"
                          id={`file-input-${entity}`}
                          data-testid={`input-file-${entity}`}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById(`file-input-${entity}`)?.click()}
                          data-testid={`button-choose-file-${entity}`}
                        >
                          <Icon name="upload" className="mr-2 h-4 w-4" />
                          Choose File
                        </Button>
                        {fileName && (
                          <span className="text-sm text-muted-foreground" data-testid={`text-filename-${entity}`}>
                            {fileName}
                          </span>
                        )}
                      </div>
                    </div>

                    {fileContent && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">File Preview</label>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto max-h-64 text-xs" data-testid={`preview-content-${entity}`}>
                          {fileContent.slice(0, 500)}
                          {fileContent.length > 500 && '\n... (truncated)'}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleImport}
                      disabled={!fileContent || importMutation.isPending}
                      data-testid={`button-import-${entity}`}
                    >
                      {importMutation.isPending ? (
                        <>
                          <Icon name="hourglass" className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Icon name="upload" className="mr-2 h-4 w-4" />
                          Import Data
                        </>
                      )}
                    </Button>
                    {fileContent && (
                      <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={importMutation.isPending}
                        data-testid={`button-clear-${entity}`}
                      >
                        <Icon name="clear" className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {validationResult && (
                    <Alert
                      variant={validationResult.success ? 'default' : 'destructive'}
                      data-testid={`alert-result-${entity}`}
                    >
                      <Icon name={validationResult.success ? 'check_circle' : 'error'} className="h-4 w-4" />
                      <AlertTitle>
                        {validationResult.success ? 'Import Successful' : 'Import Failed'}
                      </AlertTitle>
                      <AlertDescription>
                        {validationResult.success ? (
                          <p>{validationResult.message}</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-semibold">{validationResult.message}</p>
                            {validationErrors.length > 0 && (
                              <div className="mt-3 overflow-x-auto">
                                <table className="w-full text-xs border-collapse" data-testid={`table-validation-errors-${entity}`}>
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-semibold">Row</th>
                                      <th className="text-left p-2 font-semibold">Field</th>
                                      <th className="text-left p-2 font-semibold">Error</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {validationErrors.map((error, idx) => (
                                      <tr key={idx} className="border-b" data-testid={`error-row-${idx}`}>
                                        <td className="p-2" data-testid={`error-row-number-${idx}`}>{error.row}</td>
                                        <td className="p-2 font-mono" data-testid={`error-field-${idx}`}>{error.field}</td>
                                        <td className="p-2" data-testid={`error-message-${idx}`}>{error.message}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Format Requirements & Sample Files</CardTitle>
                      <CardDescription>Field definitions with data types for {entity} import</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/samples/${entity}_sample.json`, '_blank')}
                        data-testid={`button-download-json-sample-${entity}`}
                      >
                        <Icon name="download" className="mr-2 h-4 w-4" />
                        JSON Sample
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/samples/${entity}_sample.csv`, '_blank')}
                        data-testid={`button-download-csv-sample-${entity}`}
                      >
                        <Icon name="download" className="mr-2 h-4 w-4" />
                        CSV Sample
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {entity === 'customers' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameEn</code> (string) - Customer name in English</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">phone</code> (string) - Contact phone number with country code</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nationalId</code> (string) - National ID or passport (must be unique)</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameAr</code> (string) - Customer name in Arabic</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">gender</code> (enum: "male" | "female") - Gender</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">dateOfBirth</code> (date: YYYY-MM-DD) - Date of birth</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">email</code> (string) - Email address</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">address</code> (string) - Full address</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseNumber</code> (string) - Driver license number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseIssuedBy</code> (string) - License issuing authority</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseIssueDate</code> (date: YYYY-MM-DD) - License issue date</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseExpiryDate</code> (date: YYYY-MM-DD) - License expiry date</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nationality</code> (string) - Nationality</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licensePermittedVehicles</code> (string) - Vehicle types permitted</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseSignedBy</code> (string) - License authority signature</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {entity === 'vehicles' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">registration</code> (string) - License plate number (must be unique)</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">make</code> (string) - Vehicle manufacturer (e.g., Toyota, Honda)</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">model</code> (string) - Vehicle model (e.g., Camry, Accord)</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">year</code> (string) - Manufacturing year</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">color</code> (string) - Vehicle color</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">dailyRate</code> (string) - Daily rental rate in AED</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">vin</code> (string) - Vehicle Identification Number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">fuelType</code> (enum: "petrol" | "diesel" | "electric" | "hybrid") - Fuel type</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">tankCapacity</code> (number) - Fuel tank capacity in liters</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">odometer</code> (number) - Current mileage in kilometers</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">weeklyRate</code> (string) - Weekly rental rate in AED</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">monthlyRate</code> (string) - Monthly rental rate in AED</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">status</code> (enum: "available" | "rented" | "maintenance" | "damaged") - Vehicle status (default: "available")</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">notes</code> (string) - Additional notes</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">tcNumber</code> (string) - Traffic plate number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">ownershipCardNumber</code> (string) - Vehicle ownership card number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">rtaCodeNumber</code> (string) - RTA code number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">insurancePolicyNumber</code> (string) - Insurance policy number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">insuranceExpiryDate</code> (date: YYYY-MM-DD) - Insurance expiry date</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {entity === 'sponsors' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameEn</code> (string) - Sponsor name in English</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameAr</code> (string) - Sponsor name in Arabic</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nationality</code> (string) - Nationality</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">passportId</code> (string) - Passport or National ID</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">licenseNumber</code> (string) - Driver license number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">mobile</code> (string) - Mobile phone number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">address</code> (string) - Full address</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">relation</code> (string) - Relationship to hirer (e.g., "Employer", "Family Member")</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">notes</code> (string) - Additional notes</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {entity === 'companies' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameEn</code> (string) - Company name in English</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">nameAr</code> (string) - Company name in Arabic</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">registrationNumber</code> (string) - Business registration number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">registrationValidity</code> (date: YYYY-MM-DD) - Registration expiry date</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">taxId</code> (string) - Tax registration number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">taxValidity</code> (date: YYYY-MM-DD) - Tax registration expiry date</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">contactPerson</code> (string) - Primary contact person</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">phone</code> (string) - Company phone number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">email</code> (string) - Company email address</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">address</code> (string) - Company address</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">notes</code> (string) - Additional notes</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {entity === 'contracts' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">contractNumber</code> (number) - Unique contract number</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">customerId</code> (string) - Customer UUID or use lookup fields</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">vehicleId</code> (string) - Vehicle UUID or use lookup fields</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">rentalType</code> (enum: "daily" | "weekly" | "monthly") - Rental period type</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">rentalStartDate</code> (datetime: ISO 8601) - Rental start date and time</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">rentalEndDate</code> (datetime: ISO 8601) - Rental end date and time</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">dailyRate</code> (string) - Daily rental rate</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">pickupLocation</code> (string) - Vehicle pickup location</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">dropoffLocation</code> (string) - Vehicle dropoff location</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">hirerType</code> (enum: "direct" | "with_sponsor" | "from_company") - Hirer type (default: "direct")</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">sponsorId</code> (string) - Sponsor UUID (required if hirerType = "with_sponsor")</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">weeklyRate</code> (string) - Weekly rental rate</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">monthlyRate</code> (string) - Monthly rental rate</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">totalDays</code> (number) - Total rental days</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">subtotal</code> (string) - Subtotal amount</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">vatAmount</code> (string) - VAT amount</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">totalAmount</code> (string) - Total amount including VAT</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">securityDeposit</code> (string) - Security deposit amount</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">inspectionTools</code> (boolean) - Tools present</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">inspectionSpareTyre</code> (boolean) - Spare tyre present</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">inspectionGps</code> (boolean) - GPS present</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">inspectionFuelPercentage</code> (number: 0-100) - Fuel percentage at start</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">odometerStart</code> (number) - Starting odometer reading</li>
                            <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">notes</code> (string) - Additional notes</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">Important:</strong>
                          <p className="text-muted-foreground mt-2">Customers, vehicles, and sponsors (if applicable) must exist before importing contracts. All contracts are created in DRAFT status.</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
