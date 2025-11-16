import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Icon } from '@/components/Icon';

type EntityType = 'customers' | 'vehicles' | 'sponsors' | 'companies' | 'contracts';
type FileFormat = 'json' | 'csv';

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
}

export default function ImportData() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EntityType>('customers');
  const [fileFormat, setFileFormat] = useState<FileFormat>('json');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string>('');

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
      setValidationErrors('');
      toast({
        title: t('common.success'),
        description: data.message,
      });
      setFileContent('');
      setFileName('');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t('common.error');
      setValidationResult({ success: false, message: errorMessage });
      setValidationErrors(errorMessage);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: errorMessage,
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
      setValidationErrors('');
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
    setValidationErrors('');
  };

  const entityDescriptions: Record<EntityType, string> = {
    customers: 'Import customer records including individual and corporate customers with passport IDs, contact information, and license details.',
    vehicles: 'Import vehicle fleet data including registration numbers, make, model, year, and current status (available, rented, maintenance, damaged).',
    sponsors: 'Import sponsor records with passport IDs, nationality, contact details, and relationship information for contract hirers.',
    companies: 'Import corporate sponsor companies with registration numbers, trade licenses, contact persons, and business information.',
    contracts: 'Import rental contracts in DRAFT status. Requires existing customers and vehicles. Automatically calculates rental amounts and validates relationships.',
  };

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
            <p>• See <a href="/docs/IMPORT_DATA.md" target="_blank" rel="noopener noreferrer" className="underline">Import Data Guide</a> for detailed field definitions and format examples</p>
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
                          <pre className="whitespace-pre-wrap text-xs mt-2 font-mono">
                            {validationErrors}
                          </pre>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Format Requirements</CardTitle>
                  <CardDescription>Required and optional fields for {entity} import</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {entity === 'customers' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <p className="text-muted-foreground">nameEn, nationality, passportId, mobile, type (individual/corporate)</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <p className="text-muted-foreground">nameAr, licenseNumber, email, address, tradeLicenseNo (corporate only), registrationNumber (corporate only)</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Unique Identifier:</strong>
                          <p className="text-muted-foreground">passportId (must be unique across all customers)</p>
                        </div>
                      </>
                    )}
                    {entity === 'vehicles' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <p className="text-muted-foreground">registration, make, model, year, status (available/rented/maintenance/damaged)</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <p className="text-muted-foreground">color, plateCode, chassisNo, licensingAuthority</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Unique Identifier:</strong>
                          <p className="text-muted-foreground">registration (must be unique across all vehicles)</p>
                        </div>
                      </>
                    )}
                    {entity === 'sponsors' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <p className="text-muted-foreground">nameEn, nationality, passportId, mobile</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <p className="text-muted-foreground">nameAr, licenseNumber, address, relation, notes</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Unique Identifier:</strong>
                          <p className="text-muted-foreground">passportId (must be unique across all sponsors)</p>
                        </div>
                      </>
                    )}
                    {entity === 'companies' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <p className="text-muted-foreground">nameEn, registrationNumber, mobile</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <p className="text-muted-foreground">nameAr, tradeLicenseNo, contactPerson, email, address, notes</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Unique Identifier:</strong>
                          <p className="text-muted-foreground">registrationNumber (must be unique across all companies)</p>
                        </div>
                      </>
                    )}
                    {entity === 'contracts' && (
                      <>
                        <div>
                          <strong className="text-foreground">Required Fields:</strong>
                          <p className="text-muted-foreground">customerPassportId, vehicleRegistration, rentalType, rentalStartDate (YYYY-MM-DD), rentalEndDate (YYYY-MM-DD), dailyRate, pickupLocation, dropoffLocation</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Optional Fields:</strong>
                          <p className="text-muted-foreground">hirerType (default: direct), sponsorPassportId (if hirerType = with_sponsor), companyRegistrationNumber (if hirerType = from_company), weeklyRate, monthlyRate, mileageLimit, extraKmRate, securityDeposit, notes</p>
                        </div>
                        <div>
                          <strong className="text-foreground">Important:</strong>
                          <p className="text-muted-foreground">Customers and vehicles must exist before importing contracts. Contracts are created in DRAFT status only.</p>
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
