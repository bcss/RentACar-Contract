# Import Data Guide

## Overview

The Import Data feature allows superadmin users to bulk import master data and contracts from external systems into RCCMS. This feature supports importing Customers, Vehicles, Sponsors, Companies, and Contracts through standardized file formats.

**Access:** Settings → Import Data (superadmin only)

---

## Supported File Formats

- **JSON** (`.json`) - Recommended for complex data structures
- **CSV** (`.csv`) - Best for simple tabular data

---

## Important Rules

1. **Validation First:** All files are validated before import. No data is imported if any validation error is found.
2. **Atomic Import:** Either all records import successfully, or none do.
3. **Duplicate Detection:** Records with duplicate unique identifiers will be rejected.
4. **Draft Contracts:** Imported contracts are created in DRAFT status only.
5. **User-Friendly Errors:** All validation errors show the exact row number, field name, and issue description.

---

## Entity Import Specifications

### 1. Customers

**Required Fields:**
- `nameEn` (string, max 255 chars) - Customer name in English
- `nationality` (string, max 100 chars) - Customer nationality
- `passportId` (string, max 50 chars, **unique**) - Passport/ID number
- `mobile` (string, format: +971XXXXXXXXX) - Mobile number
- `type` (enum: "individual" | "corporate") - Customer type

**Optional Fields:**
- `nameAr` (string, max 255 chars) - Customer name in Arabic
- `licenseNumber` (string, max 50 chars) - Driver license number
- `email` (string, valid email format) - Email address
- `address` (string, max 500 chars) - Physical address
- `tradeLicenseNo` (string, max 50 chars) - Trade license (corporate only)
- `registrationNumber` (string, max 50 chars) - Registration number (corporate only)

**CSV Format Example:**
```csv
nameEn,nameAr,nationality,passportId,mobile,email,type,address,licenseNumber
"John Smith","جون سميث","USA","P123456","+971501234567","john@example.com","individual","Dubai Marina","DL12345"
"ABC Corp","شركة ABC","UAE","C789012","+971509876543","info@abc.ae","corporate","Business Bay",""
```

**JSON Format Example:**
```json
[
  {
    "nameEn": "John Smith",
    "nameAr": "جون سميث",
    "nationality": "USA",
    "passportId": "P123456",
    "mobile": "+971501234567",
    "email": "john@example.com",
    "type": "individual",
    "address": "Dubai Marina",
    "licenseNumber": "DL12345"
  },
  {
    "nameEn": "ABC Corp",
    "nameAr": "شركة ABC",
    "nationality": "UAE",
    "passportId": "C789012",
    "mobile": "+971509876543",
    "email": "info@abc.ae",
    "type": "corporate",
    "address": "Business Bay"
  }
]
```

---

### 2. Vehicles

**Required Fields:**
- `registration` (string, max 50 chars, **unique**) - Vehicle registration number (e.g., "ABC-12345")
- `make` (string, max 100 chars) - Vehicle manufacturer (e.g., "Toyota")
- `model` (string, max 100 chars) - Vehicle model (e.g., "Camry")
- `year` (number, 1900-2100) - Manufacturing year
- `status` (enum: "available" | "rented" | "maintenance" | "damaged") - Current vehicle status

**Optional Fields:**
- `color` (string, max 50 chars) - Vehicle color
- `plateCode` (string, max 20 chars) - Plate code (e.g., "DXB")
- `chassisNo` (string, max 100 chars) - Chassis number
- `licensingAuthority` (string, max 100 chars) - Licensing authority/emirate

**CSV Format Example:**
```csv
registration,make,model,year,color,status,plateCode,chassisNo,licensingAuthority
"ABC-12345","Toyota","Camry",2023,"White","available","DXB","CH123456789","Dubai"
"XYZ-67890","Honda","Accord",2022,"Black","available","AUH","CH987654321","Abu Dhabi"
```

**JSON Format Example:**
```json
[
  {
    "registration": "ABC-12345",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "color": "White",
    "status": "available",
    "plateCode": "DXB",
    "chassisNo": "CH123456789",
    "licensingAuthority": "Dubai"
  },
  {
    "registration": "XYZ-67890",
    "make": "Honda",
    "model": "Accord",
    "year": 2022,
    "color": "Black",
    "status": "available",
    "plateCode": "AUH",
    "chassisNo": "CH987654321",
    "licensingAuthority": "Abu Dhabi"
  }
]
```

---

### 3. Sponsors

**Required Fields:**
- `nameEn` (string, max 255 chars) - Sponsor name in English
- `nationality` (string, max 100 chars) - Sponsor nationality
- `passportId` (string, max 50 chars, **unique**) - Passport/ID number
- `mobile` (string, format: +971XXXXXXXXX) - Mobile number

**Optional Fields:**
- `nameAr` (string, max 255 chars) - Sponsor name in Arabic
- `licenseNumber` (string, max 50 chars) - Driver license number
- `address` (string, max 500 chars) - Physical address
- `relation` (string, max 100 chars) - Relation to hirer (e.g., "Father", "Employer")
- `notes` (string, max 1000 chars) - Additional notes

**CSV Format Example:**
```csv
nameEn,nameAr,nationality,passportId,mobile,address,relation,notes
"Ahmed Ali","احمد علي","UAE","S123456","+971501234567","Dubai","Father","Verified sponsor"
"Sara Khan","سارة خان","Pakistan","S789012","+971509876543","Sharjah","Employer",""
```

**JSON Format Example:**
```json
[
  {
    "nameEn": "Ahmed Ali",
    "nameAr": "احمد علي",
    "nationality": "UAE",
    "passportId": "S123456",
    "mobile": "+971501234567",
    "address": "Dubai",
    "relation": "Father",
    "notes": "Verified sponsor"
  },
  {
    "nameEn": "Sara Khan",
    "nameAr": "سارة خان",
    "nationality": "Pakistan",
    "passportId": "S789012",
    "mobile": "+971509876543",
    "address": "Sharjah",
    "relation": "Employer"
  }
]
```

---

### 4. Companies

**Required Fields:**
- `nameEn` (string, max 255 chars) - Company name in English
- `registrationNumber` (string, max 50 chars, **unique**) - Company registration number
- `mobile` (string, format: +971XXXXXXXXX) - Contact mobile number

**Optional Fields:**
- `nameAr` (string, max 255 chars) - Company name in Arabic
- `tradeLicenseNo` (string, max 50 chars) - Trade license number
- `contactPerson` (string, max 255 chars) - Contact person name
- `email` (string, valid email format) - Contact email
- `address` (string, max 500 chars) - Physical address
- `notes` (string, max 1000 chars) - Additional notes

**CSV Format Example:**
```csv
nameEn,nameAr,registrationNumber,tradeLicenseNo,contactPerson,mobile,email,address,notes
"ABC Trading LLC","شركة ABC للتجارة","REG123456","TL789012","John Manager","+971501234567","info@abc.ae","Business Bay","Preferred partner"
"XYZ Rentals","XYZ للتأجير","REG789012","TL456789","Sara Admin","+971509876543","contact@xyz.ae","DIFC",""
```

**JSON Format Example:**
```json
[
  {
    "nameEn": "ABC Trading LLC",
    "nameAr": "شركة ABC للتجارة",
    "registrationNumber": "REG123456",
    "tradeLicenseNo": "TL789012",
    "contactPerson": "John Manager",
    "mobile": "+971501234567",
    "email": "info@abc.ae",
    "address": "Business Bay",
    "notes": "Preferred partner"
  },
  {
    "nameEn": "XYZ Rentals",
    "nameAr": "XYZ للتأجير",
    "registrationNumber": "REG789012",
    "tradeLicenseNo": "TL456789",
    "contactPerson": "Sara Admin",
    "mobile": "+971509876543",
    "email": "contact@xyz.ae",
    "address": "DIFC"
  }
]
```

---

### 5. Contracts (Simplified Import)

**Important:** Imported contracts are created in **DRAFT** status only. All financial calculations, activations, and completions must be done through the normal contract workflow in RCCMS.

**Required Fields:**
- `customerPassportId` (string) - References existing customer by passport ID
- `vehicleRegistration` (string) - References existing vehicle by registration number
- `rentalType` (enum: "daily" | "weekly" | "monthly") - Rental period type
- `rentalStartDate` (date, ISO 8601 format: YYYY-MM-DD) - Rental start date
- `rentalEndDate` (date, ISO 8601 format: YYYY-MM-DD) - Rental end date
- `dailyRate` (decimal, positive number) - Daily rental rate (even for weekly/monthly)
- `pickupLocation` (string, max 255 chars) - Vehicle pickup location
- `dropoffLocation` (string, max 255 chars) - Vehicle drop-off location

**Optional Fields:**
- `hirerType` (enum: "direct" | "with_sponsor" | "from_company", default: "direct") - Hirer arrangement
- `sponsorPassportId` (string) - References sponsor (required if hirerType = "with_sponsor")
- `companyRegistrationNumber` (string) - References company (required if hirerType = "from_company")
- `weeklyRate` (decimal) - Weekly rental rate
- `monthlyRate` (decimal) - Monthly rental rate
- `mileageLimit` (number) - Kilometer limit
- `extraKmRate` (decimal) - Charge per extra kilometer
- `securityDeposit` (decimal) - Security deposit amount
- `notes` (string, max 2000 chars) - Contract notes

**CSV Format Example:**
```csv
customerPassportId,vehicleRegistration,rentalType,rentalStartDate,rentalEndDate,dailyRate,pickupLocation,dropoffLocation,hirerType,mileageLimit,securityDeposit,notes
"P123456","ABC-12345","daily","2025-12-01","2025-12-07","150","Dubai Airport","Dubai Airport","direct",200,500,"VIP customer"
"C789012","XYZ-67890","weekly","2025-12-01","2025-12-15","100","Business Bay","Business Bay","from_company",500,1000,""
```

**JSON Format Example:**
```json
[
  {
    "customerPassportId": "P123456",
    "vehicleRegistration": "ABC-12345",
    "rentalType": "daily",
    "rentalStartDate": "2025-12-01",
    "rentalEndDate": "2025-12-07",
    "dailyRate": "150",
    "pickupLocation": "Dubai Airport",
    "dropoffLocation": "Dubai Airport",
    "hirerType": "direct",
    "mileageLimit": 200,
    "securityDeposit": 500,
    "notes": "VIP customer"
  },
  {
    "customerPassportId": "C789012",
    "vehicleRegistration": "XYZ-67890",
    "rentalType": "weekly",
    "rentalStartDate": "2025-12-01",
    "rentalEndDate": "2025-12-15",
    "dailyRate": "100",
    "pickupLocation": "Business Bay",
    "dropoffLocation": "Business Bay",
    "hirerType": "from_company",
    "companyRegistrationNumber": "REG123456",
    "mileageLimit": 500,
    "securityDeposit": 1000
  }
]
```

---

## Validation Rules

### Common Validations
- **Required Fields:** Must not be empty/null/undefined
- **String Length:** Must not exceed maximum length
- **Email Format:** Must be valid email if provided
- **Phone Format:** Must match pattern +971XXXXXXXXX
- **Date Format:** ISO 8601 (YYYY-MM-DD)
- **Enum Values:** Must match allowed values exactly

### Entity-Specific Validations

**Customers:**
- `passportId` must be unique across all customers
- `type` must be "individual" or "corporate"
- `tradeLicenseNo` and `registrationNumber` only allowed for corporate customers

**Vehicles:**
- `registration` must be unique across all vehicles
- `year` must be between 1900 and 2100
- `status` must be one of: available, rented, maintenance, damaged

**Sponsors:**
- `passportId` must be unique across all sponsors
- Must not conflict with customer or company passport IDs

**Companies:**
- `registrationNumber` must be unique across all companies

**Contracts:**
- `customerPassportId` must reference an existing customer
- `vehicleRegistration` must reference an existing vehicle
- `rentalEndDate` must be after `rentalStartDate`
- If `hirerType` is "with_sponsor", `sponsorPassportId` is required and must exist
- If `hirerType` is "from_company", `companyRegistrationNumber` is required and must exist
- `dailyRate`, `weeklyRate`, `monthlyRate` must be positive numbers
- `mileageLimit` must be positive integer if provided

---

## Error Message Examples

### User-Friendly Error Format
```
Row 5: Field 'passportId' - This passport ID already exists in the system
Row 12: Field 'mobile' - Invalid phone format. Must be +971XXXXXXXXX
Row 18: Field 'year' - Year must be between 1900 and 2100
Row 23: Field 'customerPassportId' - Customer with passport 'P999999' not found
```

### Multiple Errors Display
All validation errors are shown together so you can fix them all at once before retrying:
```
Found 4 validation errors:
- Row 2: Field 'nameEn' is required but missing
- Row 2: Field 'mobile' - Invalid phone format
- Row 7: Field 'passportId' - Duplicate value 'P123456' found in row 3
- Row 15: Field 'status' - Invalid value 'unavailable'. Must be one of: available, rented, maintenance, damaged
```

---

## Step-by-Step Import Process

### 1. Prepare Your Data File
- Use the format specifications above
- Ensure all required fields are present
- Validate unique identifiers (passportId, registration, etc.)
- Use correct date formats (YYYY-MM-DD)
- Check enum values match exactly

### 2. Access Import Data Page
- Log in as superadmin
- Navigate to Settings → Import Data
- Select the entity tab (Customers, Vehicles, etc.)

### 3. Upload File
- Click "Choose File" or drag-and-drop
- Select format (JSON or CSV)
- Click "Validate" to run validation

### 4. Review Validation Results
- **Success:** Green message showing number of valid records
- **Errors:** Red message with detailed error list showing row numbers and issues
- Fix errors in your source file and re-upload

### 5. Import Data
- Once validation passes, click "Import"
- Wait for confirmation message
- Verify imported data in the respective section (Customers, Vehicles, etc.)

---

## Best Practices

1. **Start Small:** Test with 5-10 records before importing hundreds
2. **Use JSON for Complex Data:** Better structure validation and error messages
3. **Validate External Data:** Clean data in source system before exporting
4. **Master Data First:** Import Customers, Vehicles, Sponsors, Companies before Contracts
5. **Check Unique Fields:** Verify passport IDs, registration numbers don't conflict with existing data
6. **Keep Backups:** Export existing data before large imports
7. **Use Draft Contracts:** Import contracts create DRAFT status only - activate through normal workflow

---

## Troubleshooting

### "File format not recognized"
- Ensure file extension is `.json` or `.csv`
- Check file encoding is UTF-8
- Verify JSON is valid (use jsonlint.com)

### "Required field missing"
- Check CSV headers match field names exactly (case-sensitive)
- Ensure JSON property names match specification
- All required fields must have values (not empty strings)

### "Duplicate unique identifier"
- Check for duplicates within your import file
- Verify against existing database records
- Use unique values for passportId, registration, registrationNumber

### "Referenced entity not found"
- For contracts: import customers and vehicles first
- Verify passport IDs and registration numbers match exactly
- Check for typos or extra spaces

---

## Support

For issues or questions about data import:
1. Check error messages carefully - they indicate the exact field and row
2. Review format examples in this guide
3. Contact system administrator for assistance
4. Use Support → Help Center for additional documentation

---

**Last Updated:** November 2025  
**Version:** 1.0
