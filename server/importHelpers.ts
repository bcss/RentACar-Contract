import Papa from 'papaparse';
import { z } from 'zod';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedData<T> {
  data: T[];
  errors: ValidationError[];
}

export function parseCSV<T>(csvContent: string): ParsedData<any> {
  const errors: ValidationError[] = [];
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    result.errors.forEach((error: any, index: number) => {
      errors.push({
        row: error.row !== undefined ? error.row + 2 : index + 2,
        field: 'file',
        message: error.message,
      });
    });
  }

  return {
    data: result.data as any[],
    errors,
  };
}

export function parseJSON<T>(jsonContent: string): ParsedData<any> {
  const errors: ValidationError[] = [];
  
  try {
    const data = JSON.parse(jsonContent);
    
    if (!Array.isArray(data)) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'JSON must be an array of objects',
      });
      return { data: [], errors };
    }
    
    return { data, errors };
  } catch (error) {
    errors.push({
      row: 0,
      field: 'file',
      message: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return { data: [], errors };
  }
}

export function validateWithSchema<T>(
  data: any[],
  schema: z.ZodSchema<T>,
  rowOffset: number = 0
): { validData: T[]; errors: ValidationError[] } {
  const validData: T[] = [];
  const errors: ValidationError[] = [];

  data.forEach((item, index) => {
    const rowNumber = index + rowOffset + 2;
    const result = schema.safeParse(item);
    
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors.push({
          row: rowNumber,
          field: field || 'unknown',
          message: err.message,
        });
      });
    } else {
      validData.push(result.data);
    }
  });

  return { validData, errors };
}

export const customerImportSchema = z.object({
  nameEn: z.string().min(1, 'Name (English) is required').max(255, 'Name too long'),
  nameAr: z.string().max(255, 'Name too long').optional().nullable(),
  nationality: z.string().min(1, 'Nationality is required').max(100, 'Nationality too long'),
  passportId: z.string().min(1, 'Passport/ID is required').max(50, 'Passport/ID too long'),
  mobile: z.string().min(1, 'Mobile is required').regex(/^\+971[0-9]{9}$/, 'Invalid phone format. Must be +971XXXXXXXXX'),
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional().nullable().or(z.literal('')),
  type: z.enum(['individual', 'corporate'], { errorMap: () => ({ message: 'Type must be "individual" or "corporate"' }) }),
  address: z.string().max(500, 'Address too long').optional().nullable(),
  licenseNumber: z.string().max(50, 'License number too long').optional().nullable(),
  tradeLicenseNo: z.string().max(50, 'Trade license too long').optional().nullable(),
  registrationNumber: z.string().max(50, 'Registration number too long').optional().nullable(),
}).refine((data) => {
  if (data.type === 'corporate') {
    return true;
  }
  if (data.tradeLicenseNo || data.registrationNumber) {
    return false;
  }
  return true;
}, {
  message: 'Trade license and registration number only allowed for corporate customers',
  path: ['type'],
});

export const vehicleImportSchema = z.object({
  registration: z.string().min(1, 'Registration is required').max(50, 'Registration too long'),
  make: z.string().min(1, 'Make is required').max(100, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(100, 'Model too long'),
  year: z.coerce.number().int().min(1900, 'Year must be at least 1900').max(2100, 'Year must be at most 2100'),
  color: z.string().max(50, 'Color too long').optional().nullable(),
  status: z.enum(['available', 'rented', 'maintenance', 'damaged'], { 
    errorMap: () => ({ message: 'Status must be one of: available, rented, maintenance, damaged' }) 
  }),
  plateCode: z.string().max(20, 'Plate code too long').optional().nullable(),
  chassisNo: z.string().max(100, 'Chassis number too long').optional().nullable(),
  licensingAuthority: z.string().max(100, 'Licensing authority too long').optional().nullable(),
});

export const sponsorImportSchema = z.object({
  nameEn: z.string().min(1, 'Name (English) is required').max(255, 'Name too long'),
  nameAr: z.string().max(255, 'Name too long').optional().nullable(),
  nationality: z.string().min(1, 'Nationality is required').max(100, 'Nationality too long'),
  passportId: z.string().min(1, 'Passport/ID is required').max(50, 'Passport/ID too long'),
  mobile: z.string().min(1, 'Mobile is required').regex(/^\+971[0-9]{9}$/, 'Invalid phone format. Must be +971XXXXXXXXX'),
  licenseNumber: z.string().max(50, 'License number too long').optional().nullable(),
  address: z.string().max(500, 'Address too long').optional().nullable(),
  relation: z.string().max(100, 'Relation too long').optional().nullable(),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export const companyImportSchema = z.object({
  nameEn: z.string().min(1, 'Name (English) is required').max(255, 'Name too long'),
  nameAr: z.string().max(255, 'Name too long').optional().nullable(),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50, 'Registration number too long'),
  tradeLicenseNo: z.string().max(50, 'Trade license too long').optional().nullable(),
  contactPerson: z.string().max(255, 'Contact person too long').optional().nullable(),
  mobile: z.string().min(1, 'Mobile is required').regex(/^\+971[0-9]{9}$/, 'Invalid phone format. Must be +971XXXXXXXXX'),
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional().nullable().or(z.literal('')),
  address: z.string().max(500, 'Address too long').optional().nullable(),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export const contractImportSchema = z.object({
  customerPassportId: z.string().min(1, 'Customer passport ID is required'),
  vehicleRegistration: z.string().min(1, 'Vehicle registration is required'),
  rentalType: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Rental type must be one of: daily, weekly, monthly' })
  }),
  rentalStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  rentalEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dailyRate: z.coerce.number().positive('Daily rate must be positive'),
  pickupLocation: z.string().min(1, 'Pickup location is required').max(255, 'Pickup location too long'),
  dropoffLocation: z.string().min(1, 'Drop-off location is required').max(255, 'Drop-off location too long'),
  hirerType: z.enum(['direct', 'with_sponsor', 'from_company']).default('direct'),
  sponsorPassportId: z.string().optional().nullable(),
  companyRegistrationNumber: z.string().optional().nullable(),
  weeklyRate: z.coerce.number().positive('Weekly rate must be positive').optional().nullable(),
  monthlyRate: z.coerce.number().positive('Monthly rate must be positive').optional().nullable(),
  mileageLimit: z.coerce.number().int().positive('Mileage limit must be positive integer').optional().nullable(),
  extraKmRate: z.coerce.number().positive('Extra km rate must be positive').optional().nullable(),
  securityDeposit: z.coerce.number().positive('Security deposit must be positive').optional().nullable(),
  notes: z.string().max(2000, 'Notes too long').optional().nullable(),
}).refine((data) => {
  const startDate = new Date(data.rentalStartDate);
  const endDate = new Date(data.rentalEndDate);
  return endDate > startDate;
}, {
  message: 'Rental end date must be after start date',
  path: ['rentalEndDate'],
}).refine((data) => {
  if (data.hirerType === 'with_sponsor') {
    return !!data.sponsorPassportId;
  }
  return true;
}, {
  message: 'Sponsor passport ID is required when hirer type is "with_sponsor"',
  path: ['sponsorPassportId'],
}).refine((data) => {
  if (data.hirerType === 'from_company') {
    return !!data.companyRegistrationNumber;
  }
  return true;
}, {
  message: 'Company registration number is required when hirer type is "from_company"',
  path: ['companyRegistrationNumber'],
});

export function checkDuplicatesInArray<T>(
  data: T[],
  field: keyof T,
  fieldName: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Map<any, number>();

  data.forEach((item, index) => {
    const value = item[field];
    if (value) {
      const existing = seen.get(value);
      if (existing !== undefined) {
        errors.push({
          row: index + 2,
          field: fieldName,
          message: `Duplicate value '${value}' found in row ${existing + 2}`,
        });
      } else {
        seen.set(value, index);
      }
    }
  });

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  const formatted = errors.map(err => 
    `Row ${err.row}: Field '${err.field}' - ${err.message}`
  ).join('\n');
  
  return `Found ${errors.length} validation error${errors.length > 1 ? 's' : ''}:\n${formatted}`;
}
