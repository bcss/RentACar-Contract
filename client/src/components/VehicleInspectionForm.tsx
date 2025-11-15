import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

type PhotoAngle = 'front' | 'back' | 'left' | 'right' | 'top' | 'dashboard' | 'extra';

interface Photo {
  angle: PhotoAngle;
  data: string;
  description?: string;
}

interface VehicleInspectionFormProps {
  inspectionType: 'pre_delivery' | 'post_return';
  onSubmit: (data: {
    inspectionType: 'pre_delivery' | 'post_return';
    inspectorName: string;
    odometerReading: number;
    fuelLevel: number;
    conditionNotes: string;
    photos: Photo[];
  }) => void;
  onCancel?: () => void;
  isPending?: boolean;
}

const PHOTO_ANGLES: { value: PhotoAngle; labelKey: string }[] = [
  { value: 'front', labelKey: 'inspection.angles.front' },
  { value: 'back', labelKey: 'inspection.angles.back' },
  { value: 'left', labelKey: 'inspection.angles.left' },
  { value: 'right', labelKey: 'inspection.angles.right' },
  { value: 'top', labelKey: 'inspection.angles.top' },
  { value: 'dashboard', labelKey: 'inspection.angles.dashboard' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const COMPRESSED_MAX_WIDTH = 1920;
const COMPRESSED_MAX_HEIGHT = 1080;
const COMPRESSION_QUALITY = 0.85;

export function VehicleInspectionForm({ inspectionType, onSubmit, onCancel, isPending }: VehicleInspectionFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [inspectorName, setInspectorName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : ''
  );
  const [odometerReading, setOdometerReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [extraPhotos, setExtraPhotos] = useState<Array<{ id: string; data: string; description: string }>>([]);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(t('inspection.errors.fileTooLarge')));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > COMPRESSED_MAX_WIDTH || height > COMPRESSED_MAX_HEIGHT) {
            const ratio = Math.min(COMPRESSED_MAX_WIDTH / width, COMPRESSED_MAX_HEIGHT / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error(t('inspection.errors.compressionFailed')));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const compressedData = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
          resolve(compressedData);
        };
        img.onerror = () => reject(new Error(t('inspection.errors.invalidImage')));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error(t('inspection.errors.readFailed')));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (angle: PhotoAngle, file: File) => {
    try {
      const compressedData = await compressImage(file);
      
      setPhotos(prev => {
        const existing = prev.filter(p => p.angle !== angle);
        return [...existing, { angle, data: compressedData }];
      });
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[angle];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [angle]: error instanceof Error ? error.message : t('inspection.errors.uploadFailed'),
      }));
    }
  };

  const handleFileChange = (angle: PhotoAngle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(angle, file);
    }
  };

  const removePhoto = (angle: PhotoAngle) => {
    setPhotos(prev => prev.filter(p => p.angle !== angle));
  };

  const getPhotoForAngle = (angle: PhotoAngle) => {
    return photos.find(p => p.angle === angle);
  };

  const addExtraPhoto = () => {
    const newId = `extra-${Date.now()}`;
    setExtraPhotos(prev => [...prev, { id: newId, data: '', description: '' }]);
  };

  const removeExtraPhoto = (id: string) => {
    setExtraPhotos(prev => prev.filter(p => p.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`extra-${id}`];
      return newErrors;
    });
  };

  const handleExtraPhotoUpload = async (id: string, file: File) => {
    try {
      const compressedData = await compressImage(file);
      setExtraPhotos(prev => prev.map(p => 
        p.id === id ? { ...p, data: compressedData } : p
      ));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`extra-${id}`];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`extra-${id}`]: error instanceof Error ? error.message : t('inspection.errors.uploadFailed'),
      }));
    }
  };

  const updateExtraPhotoDescription = (id: string, description: string) => {
    setExtraPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, description } : p
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!inspectorName.trim()) {
      newErrors.inspectorName = t('inspection.errors.inspectorRequired');
    }
    
    const odometerValue = parseInt(odometerReading);
    if (!odometerReading || isNaN(odometerValue) || odometerValue < 0) {
      newErrors.odometerReading = t('inspection.errors.invalidOdometer');
    }
    
    const fuelValue = parseInt(fuelLevel);
    if (!fuelLevel || isNaN(fuelValue) || fuelValue < 0 || fuelValue > 100) {
      newErrors.fuelLevel = t('inspection.errors.invalidFuelLevel');
    }
    
    if (photos.length === 0) {
      newErrors.photos = t('inspection.errors.photosRequired');
    } else {
      const requiredAngles: PhotoAngle[] = ['front', 'back', 'left', 'right', 'top', 'dashboard'];
      const angles = photos.map(p => p.angle);
      const missingAngles = requiredAngles.filter(angle => !angles.includes(angle));
      if (missingAngles.length > 0) {
        newErrors.photos = t('inspection.errors.allPhotosRequired');
      }
    }
    
    extraPhotos.forEach((extraPhoto) => {
      if (!extraPhoto.data) {
        newErrors[`extra-${extraPhoto.id}`] = t('inspection.errors.photoRequired');
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const allPhotos = [
      ...photos,
      ...extraPhotos
        .filter(p => p.data)
        .map(p => ({
          angle: 'extra' as PhotoAngle,
          data: p.data,
          description: p.description.trim() || undefined,
        }))
    ];
    
    onSubmit({
      inspectionType,
      inspectorName: inspectorName.trim(),
      odometerReading: odometerValue,
      fuelLevel: fuelValue,
      conditionNotes: conditionNotes.trim(),
      photos: allPhotos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inspectorName" data-testid="label-inspector-name">
            {t('inspection.inspectorName')} *
          </Label>
          <Input
            id="inspectorName"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            data-testid="input-inspector-name"
            className={cn(errors.inspectorName && 'border-destructive')}
          />
          {errors.inspectorName && (
            <p className="text-sm text-destructive" data-testid="error-inspector-name">
              {errors.inspectorName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odometerReading" data-testid="label-odometer">
            {t('inspection.odometerReading')} (km) *
          </Label>
          <Input
            id="odometerReading"
            type="number"
            min="0"
            value={odometerReading}
            onChange={(e) => setOdometerReading(e.target.value)}
            data-testid="input-odometer"
            className={cn(errors.odometerReading && 'border-destructive')}
          />
          {errors.odometerReading && (
            <p className="text-sm text-destructive" data-testid="error-odometer">
              {errors.odometerReading}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelLevel" data-testid="label-fuel-level">
            {t('inspection.fuelLevel')} (%) *
          </Label>
          <Input
            id="fuelLevel"
            type="number"
            min="0"
            max="100"
            value={fuelLevel}
            onChange={(e) => setFuelLevel(e.target.value)}
            data-testid="input-fuel-level"
            className={cn(errors.fuelLevel && 'border-destructive')}
          />
          {errors.fuelLevel && (
            <p className="text-sm text-destructive" data-testid="error-fuel-level">
              {errors.fuelLevel}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="conditionNotes" data-testid="label-condition-notes">
            {t('inspection.conditionNotes')}
          </Label>
          <Textarea
            id="conditionNotes"
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            placeholder={t('inspection.conditionNotesPlaceholder')}
            rows={3}
            data-testid="textarea-condition-notes"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label data-testid="label-mandatory-photos" className="text-base font-semibold">
              {t('inspection.mandatoryPhotos')} ({t('inspection.required')})
            </Label>
            <span className="text-sm text-muted-foreground">
              {photos.length} / {PHOTO_ANGLES.length}
            </span>
          </div>
          {errors.photos && (
            <p className="text-sm text-destructive mb-2" data-testid="error-photos">
              {errors.photos}
            </p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHOTO_ANGLES.map(({ value, labelKey }) => {
              const photo = getPhotoForAngle(value);
              
              return (
                <Card key={value} className={cn(
                  'overflow-hidden',
                  errors[value] && 'border-destructive'
                )}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium" data-testid={`label-photo-${value}`}>
                        {t(labelKey)}
                      </Label>
                      
                      {photo ? (
                        <div className="relative aspect-video bg-muted rounded-md overflow-hidden group">
                          <img
                            src={photo.data}
                            alt={t(labelKey)}
                            className="w-full h-full object-cover"
                            data-testid={`img-photo-${value}`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPreviewPhoto(photo)}
                              data-testid={`button-preview-${value}`}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removePhoto(value)}
                              data-testid={`button-remove-${value}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video bg-muted rounded-md border-2 border-dashed cursor-pointer hover-elevate transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(value, e)}
                            data-testid={`input-photo-${value}`}
                          />
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center px-2">
                            {t('inspection.uploadPhoto')}
                          </span>
                        </label>
                      )}
                      
                      {errors[value] && (
                        <p className="text-sm text-destructive" data-testid={`error-photo-${value}`}>
                          {errors[value]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t" data-testid="section-extra-photos">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold" data-testid="label-extra-photos">
              {t('inspection.additionalPhotos')} ({t('inspection.optional')})
            </Label>
            <span className="text-sm text-muted-foreground" data-testid="text-extra-count">
              {extraPhotos.length} {t('inspection.extraPhotosAdded')}
            </span>
          </div>

          {extraPhotos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extraPhotos.map((extraPhoto, index) => (
                <Card key={extraPhoto.id} className={cn(
                  'overflow-hidden',
                  errors[`extra-${extraPhoto.id}`] && 'border-destructive'
                )}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium" data-testid={`label-extra-photo-${index}`}>
                          {t('inspection.extraPhoto')} {index + 1}
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExtraPhoto(extraPhoto.id)}
                          data-testid={`button-remove-extra-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {extraPhoto.data ? (
                        <div className="relative aspect-video bg-muted rounded-md overflow-hidden group">
                          <img
                            src={extraPhoto.data}
                            alt={`Extra photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            data-testid={`img-extra-photo-${index}`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setPreviewPhoto({ angle: 'extra', data: extraPhoto.data, description: extraPhoto.description })}
                              data-testid={`button-preview-extra-${index}`}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setExtraPhotos(prev => prev.map(p => p.id === extraPhoto.id ? { ...p, data: '' } : p))}
                              data-testid={`button-clear-extra-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video bg-muted rounded-md border-2 border-dashed cursor-pointer hover-elevate transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleExtraPhotoUpload(extraPhoto.id, file);
                              }
                            }}
                            data-testid={`input-extra-photo-${index}`}
                          />
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center px-2">
                            {t('inspection.uploadPhoto')}
                          </span>
                        </label>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor={`description-${extraPhoto.id}`} className="text-xs">
                          {t('inspection.description')} ({t('inspection.optional')})
                        </Label>
                        <Textarea
                          id={`description-${extraPhoto.id}`}
                          value={extraPhoto.description}
                          onChange={(e) => updateExtraPhotoDescription(extraPhoto.id, e.target.value)}
                          placeholder={t('inspection.descriptionPlaceholder')}
                          rows={2}
                          className="text-sm"
                          data-testid={`textarea-extra-description-${index}`}
                        />
                      </div>

                      {errors[`extra-${extraPhoto.id}`] && (
                        <p className="text-sm text-destructive" data-testid={`error-extra-photo-${index}`}>
                          {errors[`extra-${extraPhoto.id}`]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addExtraPhoto}
            className="w-full"
            data-testid="button-add-extra-photo"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('inspection.addExtraPhoto')}
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-testid="button-cancel-inspection"
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          data-testid="button-submit-inspection"
        >
          {isPending ? t('common.saving') : t('inspection.saveInspection')}
        </Button>
      </div>

      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>
            {previewPhoto && (
              previewPhoto.angle === 'extra' 
                ? t('inspection.extraPhoto')
                : t(`inspection.angles.${previewPhoto.angle}`)
            )}
          </DialogTitle>
          {previewPhoto && (
            <div className="space-y-2">
              <img
                src={previewPhoto.data}
                alt={previewPhoto.angle === 'extra' ? t('inspection.extraPhoto') : t(`inspection.angles.${previewPhoto.angle}`)}
                className="w-full h-auto rounded-md"
                data-testid="img-preview-full"
              />
              {previewPhoto.description && (
                <p className="text-sm text-muted-foreground" data-testid="text-preview-description">
                  {previewPhoto.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}
