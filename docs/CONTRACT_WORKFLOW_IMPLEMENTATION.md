# Contract Workflow Implementation

## Overview
This document details the complete contract workflow implementation for RCCMS (Rental Car Contract Management System), including time capture improvements, traffic fines integration, and PDF preview functionality.

## Implementation Date
November 2025

---

## 1. Contract Lifecycle & Time Capture

### 1.1 Contract Status Flow
```
draft → confirmed → active → completed → closed
```

### 1.2 Time Capture Points

#### **Creation (Draft/Confirmed Status)**
- **Fields Captured:**
  - `rentalStartDate` - Planned rental start date
  - `rentalEndDate` - Planned rental end date
  - `rentalStartTime` - Planned start time (HH:MM format)
  - `rentalEndTime` - Planned end time (HH:MM format)

- **Business Logic:**
  - These are the *planned* times for the rental period
  - Used for pricing calculations and availability planning
  - Can be edited while contract is in draft/confirmed status

#### **Activation (Confirmed → Active)**
- **Fields Captured:**
  - `timeOut` - Actual vehicle handover time (HH:MM format)

- **Business Logic:**
  - Records the precise moment customer receives the vehicle
  - Triggers vehicle status change to "rented"
  - Requires pre-delivery vehicle inspection to be completed
  - Cannot be edited after activation

- **UI Location:** Activate Contract dialog in ContractView.tsx

#### **Completion (Active → Completed)**
- **Fields Captured:**
  - `timeIn` - Actual vehicle return time (HH:MM format)
  - `trafficFineCharge` - Traffic violations/fines amount (decimal)

- **Business Logic:**
  - Records the precise moment customer returns the vehicle
  - Captures any traffic fines incurred during rental
  - Triggers vehicle status change to "available"
  - Requires post-return vehicle inspection
  - Calculates extra charges (fuel, damages, mileage)
  - Cannot be edited after completion

- **UI Location:** Complete Contract dialog in ContractView.tsx

### 1.3 Database Schema

```typescript
// In shared/schema.ts
export const contracts = pgTable('contracts', {
  // ... other fields
  
  // Planned rental period (captured at creation)
  rentalStartDate: date('rentalStartDate').notNull(),
  rentalEndDate: date('rentalEndDate').notNull(),
  rentalStartTime: varchar('rentalStartTime', { length: 5 }), // HH:MM
  rentalEndTime: varchar('rentalEndTime', { length: 5 }),     // HH:MM
  
  // Actual handover/return times (captured during workflow)
  timeOut: varchar('timeOut', { length: 5 }),  // Captured at activation
  timeIn: varchar('timeIn', { length: 5 }),    // Captured at completion
  
  // Traffic fines (captured at completion)
  trafficFineCharge: decimal('trafficFineCharge', { precision: 10, scale: 2 }),
  
  // ... other fields
});
```

---

## 2. Traffic Fines Integration

### 2.1 Purpose
Allows rental companies to record traffic violations/fines incurred by customers during the rental period before finalizing the contract.

### 2.2 Capture Point
- **When:** During contract completion workflow
- **Where:** "Complete Contract" dialog
- **Who:** Admin/Manager/Staff with completion permissions

### 2.3 Financial Impact
```typescript
// Total extra charges calculation
const extraCharges = 
  fuelChargeAmount +        // Fuel difference charge
  damageCharge +            // Vehicle damage charge
  mileageOverageCharge +    // Excess mileage charge
  trafficFineCharge;        // Traffic violations (NEW)

// Outstanding balance
const outstandingBalance = totalDue - totalPaid;
```

### 2.4 Display Locations
1. **Contract View Page**
   - Financial breakdown section
   - Shows as separate line item: "Traffic Fines / المخالفات المرورية"

2. **PDF Contract**
   - Included in extra charges breakdown
   - Contributes to grand total

3. **Contract Timeline**
   - Logged when recorded during completion
   - Shows in audit trail

---

## 3. PDF Preview Modal

### 3.1 Component: PDFPreviewModal
**File:** `client/src/components/PDFPreviewModal.tsx`

#### Features
- **Iframe Viewer:** Displays PDF using blob URL
- **Print Button:** Opens browser print dialog
- **Save as PDF Button:** Downloads PDF file
- **Close Button:** Dismisses modal
- **Bilingual:** Full English/Arabic support
- **Responsive:** Adapts to all screen sizes

#### Props Interface
```typescript
interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  filename: string;
}
```

#### Usage Example
```typescript
const [showPDFPreview, setShowPDFPreview] = useState(false);
const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

// Generate PDF
const handlePrint = async () => {
  const blob = await generateContractPDF('contract-content', 'Contract.pdf');
  if (blob) {
    setPdfBlob(blob);
    setShowPDFPreview(true);
  }
};

// Render modal
<PDFPreviewModal
  isOpen={showPDFPreview}
  onClose={() => setShowPDFPreview(false)}
  pdfBlob={pdfBlob}
  filename={`Contract_${contract?.contractNumber}.pdf`}
/>
```

### 3.2 PDF Generation: generateContractPDF()
**File:** `client/src/utils/contractPDF.ts`

#### Key Implementation Details

**Problem Solved:**
The contract PDF uses `.print-only` CSS class to hide certain content on screen but show it when printing. This caused PDF generation to fail because the element had zero height.

**Solution:**
```typescript
// 1. Temporarily show print-only content
const printOnlyElements = element.querySelectorAll('.print-only');
const originalDisplays: string[] = [];

printOnlyElements.forEach((el, index) => {
  const htmlEl = el as HTMLElement;
  originalDisplays[index] = htmlEl.style.display;
  htmlEl.style.display = 'block';  // Make visible
});

// 2. Wait for layout update
await new Promise(resolve => setTimeout(resolve, 100));

// 3. Capture PDF using html2canvas
const canvas = await html2canvas(element, {
  backgroundColor: '#ffffff',
  scale: 2,
  logging: false,
  useCORS: true,
  allowTaint: true,
});

// 4. Restore original display states
printOnlyElements.forEach((el, index) => {
  (el as HTMLElement).style.display = originalDisplays[index];
});
```

#### Validation & Error Handling
```typescript
// Dimension validation
if (!elementWidth || !elementHeight || elementWidth <= 0 || elementHeight <= 0) {
  console.error('Element has no dimensions');
  // Restore display states before returning
  return null;
}

// Canvas validation
if (!canvas || !canvas.width || !canvas.height) {
  console.error('Invalid canvas dimensions');
  return null;
}

// jsPDF scale validation
if (pdfWidth <= 0 || pdfHeight <= 0) {
  console.error('Invalid PDF dimensions for jsPDF.scale');
  return null;
}

// Error recovery
catch (error) {
  // Always restore print-only elements even on error
  const printOnlyElements = element.querySelectorAll('.print-only');
  printOnlyElements.forEach((el) => {
    (el as HTMLElement).style.display = '';
  });
}
```

### 3.3 Print-Only CSS
**File:** `client/src/index.css`

```css
/* Hide print-only content on screen */
.print-only {
  display: none;
}

@media print {
  /* Show print-only content when printing */
  .print-only {
    display: block !important;
  }
}
```

**Content Included in Print-Only:**
1. Company header with bilingual information and logo
2. Sponsor/Company details (for with_sponsor/from_company hirers)
3. Hirer/customer details
4. Vehicle information
5. Rental period details
6. Financial breakdown
7. Contract clauses (terms and conditions)
8. Signature sections

---

## 4. Bilingual Support (i18n)

### 4.1 Translation Keys Added

**File:** `client/src/lib/i18n.ts`

#### Time Fields
```typescript
vehicleHandoverTime: "Vehicle Handover Time" / "وقت تسليم المركبة"
vehicleReturnTime: "Vehicle Return Time" / "وقت إرجاع المركبة"
```

#### Traffic Fines
```typescript
trafficFines: "Traffic Fines" / "المخالفات المرورية"
trafficFineCharge: "Traffic Fine Charge" / "رسوم المخالفات المرورية"
enterTrafficFines: "Enter Traffic Fines" / "أدخل المخالفات المرورية"
```

#### PDF Preview Modal
```typescript
pdfPreview: "PDF Preview" / "معاينة PDF"
print: "Print" / "طباعة"
saveAsPDF: "Save as PDF" / "حفظ كـ PDF"
close: "Close" / "إغلاق"
failedToGeneratePDF: "Failed to generate PDF" / "فشل في إنشاء PDF"
```

### 4.2 RTL/LTR Support
- Modal adapts to text direction automatically
- Contract PDF renders correctly in both English and Arabic modes
- All form inputs respect language direction

---

## 5. Vehicle Inspection Integration

### 5.1 Pre-Delivery Inspection
**Required Before:** Contract activation (confirmed → active)

**Captures:**
- 6 mandatory photos (front, rear, left, right, interior, dashboard)
- Odometer reading (starting mileage)
- Fuel level (1-8 scale)
- Vehicle condition notes

### 5.2 Post-Return Inspection
**Required Before:** Contract completion (active → completed)

**Captures:**
- 6 mandatory photos (same angles as pre-delivery)
- Odometer reading (ending mileage)
- Fuel level (1-8 scale)
- Vehicle condition notes
- Damage assessment (if any)

### 5.3 Photo Storage
```typescript
// JSONB format in database
photos: {
  front: "base64_encoded_image_data",
  rear: "base64_encoded_image_data",
  left: "base64_encoded_image_data",
  right: "base64_encoded_image_data",
  interior: "base64_encoded_image_data",
  dashboard: "base64_encoded_image_data"
}
```

---

## 6. Workflow Permissions

### 6.1 Role-Based Access

| Action | Admin | Manager | Staff | Viewer |
|--------|-------|---------|-------|--------|
| Create Draft | ✓ | ✓ | ✓ | ✗ |
| Confirm Contract | ✓ | ✓ | ✓ | ✗ |
| Activate Contract | ✓ | ✓ | ✗ | ✗ |
| Complete Contract | ✓ | ✓ | ✗ | ✗ |
| Record Traffic Fines | ✓ | ✓ | ✗ | ✗ |
| Close Contract | ✓ | ✗ | ✗ | ✗ |
| Generate PDF | ✓ | ✓ | ✓ | ✓ |

### 6.2 Backend Validation
**File:** `server/routes.ts`

```typescript
// Activation endpoint
app.patch('/api/contracts/:id/activate', requireManager, async (req, res) => {
  const { timeOut, preDeliveryInspectionId } = req.body;
  
  // Validate required fields
  if (!timeOut) {
    return res.status(400).json({ error: 'Vehicle handover time required' });
  }
  
  // ... validation logic
});

// Completion endpoint
app.patch('/api/contracts/:id/complete', requireManager, async (req, res) => {
  const { timeIn, trafficFineCharge, postReturnInspectionId } = req.body;
  
  // Validate required fields
  if (!timeIn) {
    return res.status(400).json({ error: 'Vehicle return time required' });
  }
  
  // ... validation logic
});
```

---

## 7. Audit Trail

### 7.1 Events Logged

#### Contract Field Edits
**Table:** `contractEdits`

Tracks changes to:
- `timeOut` (when captured at activation)
- `timeIn` (when captured at completion)
- `trafficFineCharge` (when recorded)

Format:
```typescript
{
  fieldName: "timeOut",
  oldValue: null,
  newValue: "14:30",
  editedBy: "user_id",
  editedAt: "2025-11-01T14:30:00Z"
}
```

#### Lifecycle Events
**Table:** `auditLogs`

Logs:
- Contract activation with timeOut
- Contract completion with timeIn and trafficFineCharge
- PDF generation events

Format:
```typescript
{
  action: "contract_activated",
  entityType: "contract",
  entityId: "contract_id",
  details: { timeOut: "14:30", preDeliveryInspectionId: "..." },
  performedBy: "user_id",
  performedAt: "2025-11-01T14:30:00Z"
}
```

---

## 8. Testing & Validation

### 8.1 End-to-End Test Coverage
✅ **Contract Activation Flow**
- Pre-delivery inspection completion
- timeOut capture and validation
- Vehicle status update to "rented"

✅ **Contract Completion Flow**
- Post-return inspection completion
- timeIn capture and validation
- trafficFineCharge recording
- Extra charges calculation
- Vehicle status update to "available"

✅ **PDF Preview Functionality**
- Modal opens without errors
- PDF renders in iframe
- Print button triggers browser print
- Save as PDF downloads file
- Works in English (LTR) and Arabic (RTL)

✅ **Bilingual Support**
- All new fields translate correctly
- RTL layout works properly
- PDF generates in both languages

### 8.2 Known Limitations
- PDF iframe content cannot be programmatically inspected due to blob URL security restrictions
- Visual verification confirms PDF renders correctly despite programmatic verification gaps

---

## 9. UI/UX Enhancements

### 9.1 Form Inputs
- Time inputs use HTML5 `type="time"` for native time picker
- Numeric inputs for traffic fines with proper decimal formatting
- Clear placeholder text in both languages
- Validation feedback on submit

### 9.2 Modal Design
- Consistent with Material Design 3 principles
- Cyan-blue accent colors matching RCCMS theme
- Responsive iframe sizing (90vw x 90vh max)
- Smooth transitions and animations
- Accessible keyboard navigation

### 9.3 Contract View Page
- Time fields displayed in contract details card
- Traffic fines shown in financial breakdown
- Clear visual separation between planned vs actual times
- Status-based conditional rendering

---

## 10. Future Enhancements

### Potential Improvements
1. **SMS Notifications**
   - Send SMS when contract activated with timeOut
   - Reminder SMS before timeIn

2. **Time Zone Support**
   - Store times with timezone information
   - Display in user's local timezone

3. **Analytics Dashboard**
   - Average handover vs planned time difference
   - Traffic fine statistics
   - Peak handover/return times

4. **Mobile Optimization**
   - Native mobile time pickers
   - Better PDF preview on mobile devices
   - Offline PDF generation capability

---

## 11. API Endpoints

### 11.1 Contract Activation
```http
PATCH /api/contracts/:id/activate
Authorization: Required (Manager+)

Request Body:
{
  "timeOut": "14:30",
  "preDeliveryInspectionId": "uuid"
}

Response:
{
  "id": "uuid",
  "status": "active",
  "timeOut": "14:30",
  ...
}
```

### 11.2 Contract Completion
```http
PATCH /api/contracts/:id/complete
Authorization: Required (Manager+)

Request Body:
{
  "timeIn": "16:45",
  "trafficFineCharge": "150.00",
  "postReturnInspectionId": "uuid",
  "damageCharge": "0.00"
}

Response:
{
  "id": "uuid",
  "status": "completed",
  "timeIn": "16:45",
  "trafficFineCharge": "150.00",
  ...
}
```

---

## 12. Conclusion

The contract workflow implementation successfully enhances RCCMS with:

✅ **Accurate Time Tracking** - Captures actual vehicle handover and return times

✅ **Financial Transparency** - Records all charges including traffic fines

✅ **Professional PDF Experience** - Preview before printing/downloading

✅ **Complete Audit Trail** - Full history of all workflow events

✅ **Bilingual Excellence** - Seamless English/Arabic support

✅ **Production Ready** - Tested, validated, and deployed

This implementation aligns with industry best practices for rental car management systems and provides a solid foundation for future enhancements.
