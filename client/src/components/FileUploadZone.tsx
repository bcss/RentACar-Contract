import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, Image, FileType, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

interface FileUploadZoneProps {
  /**
   * Callback when files are selected/dropped
   */
  onFilesSelected: (files: File[]) => Promise<void>;
  
  /**
   * Maximum file size in MB (default: 10)
   */
  maxSizeMB?: number;
  
  /**
   * Allowed file types (default: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
   */
  allowedTypes?: string[];
  
  /**
   * Allow multiple files (default: false)
   */
  multiple?: boolean;
  
  /**
   * Current uploaded files to display
   */
  uploadedFiles?: UploadedFile[];
  
  /**
   * Callback when file is removed
   */
  onFileRemove?: (index: number) => void;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export function FileUploadZone({
  onFilesSelected,
  maxSizeMB = 10,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  multiple = false,
  uploadedFiles = [],
  onFileRemove,
  className,
  testId = 'file-upload-zone',
  disabled = false,
}: FileUploadZoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return t('fileUpload.errorFileSize', `File size must be less than ${maxSizeMB}MB`, { maxSize: maxSizeMB });
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedLabels = allowedTypes.map(type => FILE_TYPE_LABELS[type] || type).join(', ');
      return t('fileUpload.errorFileType', `File type not allowed. Allowed types: ${allowedLabels}`, { allowed: allowedLabels });
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setValidationError(null);
    const fileArray = Array.from(files);

    // Validate all files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    // If only single file allowed, take first one
    const filesToUpload = multiple ? fileArray : [fileArray[0]];

    try {
      await onFilesSelected(filesToUpload);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : t('fileUpload.errorUpload', 'Failed to upload file'));
    }
  }, [multiple, onFilesSelected, t, validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleBrowseClick = () => {
    if (!disabled) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;
      input.accept = allowedTypes.join(',');
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        handleFiles(target.files);
      };
      input.click();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return FileType;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)} data-testid={testId}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        data-testid={`${testId}-dropzone`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Upload className={cn(
            'h-12 w-12 mb-4 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} data-testid={`${testId}-icon`} />
          
          <p className="text-lg font-medium mb-2" data-testid={`${testId}-title`}>
            {t('fileUpload.dropFiles', 'Drag & drop files here')}
          </p>
          
          <p className="text-sm text-muted-foreground mb-4" data-testid={`${testId}-subtitle`}>
            {t('fileUpload.orBrowse', 'or click to browse')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground" data-testid={`${testId}-info`}>
            <span data-testid={`${testId}-max-size`}>
              {t('fileUpload.maxSize', 'Max size: {{size}}MB', { size: maxSizeMB })}
            </span>
            <span>•</span>
            <span data-testid={`${testId}-allowed-types`}>
              {t('fileUpload.allowedTypes', 'Allowed: {{types}}', { 
                types: allowedTypes.map(type => FILE_TYPE_LABELS[type] || type).join(', ')
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Validation Error */}
      {validationError && (
        <div 
          className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
          data-testid={`${testId}-error`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2" data-testid={`${testId}-files-list`}>
          <h4 className="text-sm font-medium" data-testid={`${testId}-files-title`}>
            {t('fileUpload.uploadedFiles', 'Uploaded Files')} ({uploadedFiles.length})
          </h4>
          
          {uploadedFiles.map((uploadedFile, index) => {
            const FileIcon = getFileIcon(uploadedFile.file.type);
            
            return (
              <Card key={index} data-testid={`${testId}-file-${index}`}>
                <CardContent className="flex items-center gap-3 p-4">
                  {/* File Icon or Preview */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img 
                        src={uploadedFile.preview} 
                        alt={uploadedFile.file.name}
                        className="h-10 w-10 rounded object-cover"
                        data-testid={`${testId}-file-${index}-preview`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`${testId}-file-${index}-name`}>
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`${testId}-file-${index}-size`}>
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <Progress 
                        value={uploadedFile.progress} 
                        className="h-1 mt-2" 
                        data-testid={`${testId}-file-${index}-progress`}
                      />
                    )}

                    {/* Error Message */}
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <p className="text-xs text-destructive mt-1" data-testid={`${testId}-file-${index}-error`}>
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.status === 'complete' && (
                      <Check className="h-5 w-5 text-[hsl(var(--positive))]" data-testid={`${testId}-file-${index}-success`} />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" data-testid={`${testId}-file-${index}-error-icon`} />
                    )}
                  </div>

                  {/* Remove Button */}
                  {onFileRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileRemove(index);
                      }}
                      data-testid={`${testId}-file-${index}-remove`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
