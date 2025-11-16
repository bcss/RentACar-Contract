// Utility to generate and download sample data for Import Data feature

export type EntityType = 'customers' | 'vehicles' | 'sponsors' | 'companies' | 'contracts';

// Sample data generators for each entity type
const sampleData = {
  customers: [
    {
      nameEn: "John Smith",
      nameAr: "جون سميث",
      nationality: "USA",
      passportId: "P123456",
      mobile: "+971501234567",
      email: "john@example.com",
      type: "individual",
      address: "Dubai Marina",
      licenseNumber: "DL12345"
    },
    {
      nameEn: "Sarah Johnson",
      nameAr: "سارة جونسون",
      nationality: "UK",
      passportId: "P789012",
      mobile: "+971509876543",
      email: "sarah@example.com",
      type: "individual",
      address: "JBR, Dubai"
    },
    {
      nameEn: "ABC Trading LLC",
      nameAr: "شركة ABC للتجارة",
      nationality: "UAE",
      passportId: "C456789",
      mobile: "+971501112233",
      email: "info@abc.ae",
      type: "corporate",
      address: "Business Bay",
      tradeLicenseNo: "TL123456",
      registrationNumber: "REG789012"
    }
  ],
  
  vehicles: [
    {
      registration: "ABC-12345",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      color: "White",
      status: "available",
      plateCode: "DXB",
      chassisNo: "CH123456789",
      licensingAuthority: "Dubai"
    },
    {
      registration: "XYZ-67890",
      make: "Honda",
      model: "Accord",
      year: 2022,
      color: "Black",
      status: "available",
      plateCode: "AUH",
      chassisNo: "CH987654321",
      licensingAuthority: "Abu Dhabi"
    },
    {
      registration: "LMN-11223",
      make: "Nissan",
      model: "Altima",
      year: 2024,
      color: "Silver",
      status: "maintenance",
      plateCode: "SHJ",
      licensingAuthority: "Sharjah"
    }
  ],
  
  sponsors: [
    {
      nameEn: "Ahmed Ali",
      nameAr: "أحمد علي",
      nationality: "UAE",
      passportId: "S123456",
      mobile: "+971501234567",
      licenseNumber: "DL998877",
      address: "Dubai",
      relation: "Father",
      notes: "Verified sponsor - family member"
    },
    {
      nameEn: "Sara Khan",
      nameAr: "سارة خان",
      nationality: "Pakistan",
      passportId: "S789012",
      mobile: "+971509876543",
      address: "Sharjah",
      relation: "Spouse",
      notes: "Spouse - verified documents"
    },
    {
      nameEn: "Mohammed Hassan",
      nameAr: "محمد حسن",
      nationality: "Egypt",
      passportId: "S456789",
      mobile: "+971502223344",
      licenseNumber: "DL445566",
      address: "Abu Dhabi",
      relation: "Friend",
      notes: "Long-time friend - trusted contact"
    }
  ],
  
  companies: [
    {
      nameEn: "ABC Trading LLC",
      nameAr: "شركة ABC للتجارة",
      registrationNumber: "REG123456",
      tradeLicenseNo: "TL789012",
      contactPerson: "John Manager",
      mobile: "+971501234567",
      email: "info@abc.ae",
      address: "Business Bay",
      notes: "Preferred partner"
    },
    {
      nameEn: "XYZ Rentals",
      nameAr: "XYZ للتأجير",
      registrationNumber: "REG789012",
      tradeLicenseNo: "TL456789",
      contactPerson: "Sara Admin",
      mobile: "+971509876543",
      email: "contact@xyz.ae",
      address: "DIFC"
    }
  ],
  
  contracts: [
    {
      customerPassportId: "P123456",
      vehicleRegistration: "ABC-12345",
      status: "draft",
      rentalType: "daily",
      rentalStartDate: "2025-12-01",
      rentalEndDate: "2025-12-07",
      dailyRate: "150",
      pickupLocation: "Dubai Airport",
      dropoffLocation: "Dubai Airport",
      hirerType: "direct",
      mileageLimit: 200,
      securityDeposit: 500,
      notes: "VIP customer - ready to activate"
    },
    {
      customerPassportId: "P789012",
      vehicleRegistration: "XYZ-67890",
      status: "active",
      rentalType: "weekly",
      rentalStartDate: "2025-11-20",
      rentalEndDate: "2025-12-04",
      dailyRate: "100",
      weeklyRate: "650",
      pickupLocation: "Business Bay",
      dropoffLocation: "Business Bay",
      hirerType: "with_sponsor",
      sponsorPassportId: "S123456",
      mileageLimit: 500,
      extraKmRate: "0.5",
      securityDeposit: 1000,
      odometerStart: 25000,
      notes: "Currently rented - sponsor verified"
    },
    {
      customerPassportId: "C456789",
      vehicleRegistration: "LMN-11223",
      status: "completed",
      rentalType: "monthly",
      rentalStartDate: "2025-10-01",
      rentalEndDate: "2025-11-01",
      dailyRate: "80",
      monthlyRate: "2000",
      pickupLocation: "DIFC",
      dropoffLocation: "DIFC",
      hirerType: "from_company",
      companyRegistrationNumber: "REG123456",
      mileageLimit: 1500,
      extraKmRate: "0.75",
      securityDeposit: 2000,
      odometerStart: 15000,
      odometerEnd: 16200,
      extraKmDriven: 200,
      extraKmCharge: "150",
      fuelCharge: "0",
      totalExtraCharges: "150",
      notes: "Corporate rental - completed, awaiting closure"
    },
    {
      customerPassportId: "P123456",
      vehicleRegistration: "ABC-12345",
      status: "closed",
      rentalType: "daily",
      rentalStartDate: "2025-09-15",
      rentalEndDate: "2025-09-20",
      dailyRate: "150",
      weeklyRate: "900",
      pickupLocation: "Dubai Marina",
      dropoffLocation: "Dubai Marina",
      hirerType: "direct",
      mileageLimit: 300,
      extraKmRate: "1.0",
      securityDeposit: 500,
      depositPaid: true,
      depositRefunded: true,
      odometerStart: 22000,
      odometerEnd: 22450,
      extraKmDriven: 150,
      extraKmCharge: "150",
      fuelCharge: "50",
      totalExtraCharges: "200",
      paymentStatus: "paid",
      notes: "Fully completed and closed rental"
    }
  ]
};

// Convert JSON to CSV format
function jsonToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  // Get all unique keys from all objects
  const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
  
  // Create header row
  const header = keys.join(',');
  
  // Create data rows
  const rows = data.map(obj => {
    return keys.map(key => {
      const value = obj[key];
      // Handle values that might contain commas or quotes
      if (value === undefined || value === null) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}

// Trigger file download
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export functions
export function downloadSampleJSON(entityType: EntityType) {
  const data = sampleData[entityType];
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `${entityType}_sample.json`, 'application/json');
}

export function downloadSampleCSV(entityType: EntityType) {
  const data = sampleData[entityType];
  const content = jsonToCSV(data);
  downloadFile(content, `${entityType}_sample.csv`, 'text/csv');
}
