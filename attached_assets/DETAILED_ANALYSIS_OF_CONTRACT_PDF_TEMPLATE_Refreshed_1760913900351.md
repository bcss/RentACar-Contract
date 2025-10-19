# **DETAILED ANALYSIS OF CONTRACT PDF TEMPLATE**

## **COMPREHENSIVE FIELD EXTRACTION FROM PDF**

---

## **SECTION 1: HEADER INFORMATION**

| Field Name      | Arabic Name              | Location       | Data Type    | Notes                  |
|:--------------- |:------------------------ |:-------------- |:------------ |:---------------------- |
| Contract Number | رقم العقد                | Top Left (No.) | Alphanumeric | Pre-printed/Sequential |
| Company Name    | اسم الشركة               | Header         | Text         | Pre-printed            |
| Company Contact | رقم الاتصال              | Header         | Text         | Pre-printed            |
| Company Address | عنوان الشركة             | Header         | Text         | Pre-printed            |
| Company Email   | البريد الإلكتروني للشركة | Header         | Email        | Pre-printed            |
| Company Website | موقع الشركة              | Header         | URL          | Pre-printed            |

---

## **SECTION 2: SPONSOR SECTION (LEFT COLUMN)**

### **Sub-Section 2A: Sponsor Personal Details**

| Field Name      | Arabic Name             | Data Type    | Validation Required         | Mandatory    |
|:--------------- |:----------------------- |:------------ |:--------------------------- |:------------ |
| Sponsor Name    | اسم الكفيل              | Text         | Full Name                   | Conditional* |
| Nationality     | الجنسية                 | Dropdown     | Country List                | Conditional* |
| Passport No./ID | رقم جواز السفر / الهوية | Alphanumeric | Emirates ID/Passport format | Conditional* |
| Address         | العنوان                 | Text Area    | Full Address                | Conditional* |
| Mobile          | متحرك                   | Numeric      | UAE Phone format (+971)     | Conditional* |

**Note:** *Conditional = Mandatory ONLY if Sponsor section is used (Individual with Sponsor OR Company scenarios)*

### **Sub-Section 2B: Sponsor ID & Payment Details**

| Field Name         | Arabic Name    | Data Type    | Validation Required | Mandatory   |
|:------------------ |:-------------- |:------------ |:------------------- |:----------- |
| ID (Sponsor)       | الهوية         | Alphanumeric | ID Number           | Conditional |
| الموجودات (Assets) | الموجودات      | Text         | -                   | Optional    |
| جواز سفر (Pass)    | جواز سفر       | Alphanumeric | Passport Number     | Optional    |
| Credit Card        | بطاقة الائتمان | Alphanumeric | Card Number         | Optional    |

### **Sub-Section 2C: Vehicle Handover Details (Sponsor Side)**

| Field Name             | Arabic Name           | Data Type         | Validation Required  | Mandatory    |
|:---------------------- |:--------------------- |:----------------- |:-------------------- |:------------ |
| Reg. No.               | رقم التسجيل           | Alphanumeric      | Vehicle Plate Number | Yes          |
| Color                  | اللون                 | Text/Dropdown     | Color Name           | Yes          |
| Time In (Return Time)  | ساعة الدخول           | Time              | HH:MM                | Yes (Return) |
| Return Date            | تاريخ العودة          | Date              | DD/MM/YYYY           | Yes (Return) |
| Advance Payment        | المبلغ المدفوع مقدماً | Numeric (Decimal) | AED Amount           | Yes          |
| Monthly Rent           | السعر الشهري للإيجار  | Numeric (Decimal) | Monthly Rate         | Conditional  |
| KM Out (While Renting) | عداد الخروج           | Numeric           | Odometer Reading     | Yes          |
| KM In (When Returning) | عداد الدخول           | Numeric           | Odometer Reading     | Yes (Return) |

---

## **SECTION 3: HIRER SECTION (RIGHT COLUMN)**

### **Sub-Section 3A: Hirer Personal Details**

| Field Name      | Arabic Name             | Data Type    | Validation Required  | Mandatory |
|:--------------- |:----------------------- |:------------ |:-------------------- |:--------- |
| Hirer Name      | اسم المستأجر            | Text         | Full Name            | **Yes**   |
| Nationality     | الجنسية                 | Dropdown     | Country List         | **Yes**   |
| Gender - Male   | ذكر                     | Checkbox     | Male Selection       | **Yes**   |
| Gender - Female | أنثى                    | Checkbox     | Female Selection     | **Yes**   |
| Passport No./ID | رقم جواز السفر / الهوية | Alphanumeric | Emirates ID/Passport | **Yes**   |
| Mobile          | متحرك                   | Numeric      | UAE Phone format     | **Yes**   |
| Address         | العنوان                 | Text Area    | Full Address         | **Yes**   |
| Date of Birth   | تاريخ الولادة           | Date         | DD/MM/YYYY           | **Yes**   |

### **Sub-Section 3B: Hirer Driving License Details**

| Field Name             | Arabic Name      | Data Type    | Validation Required | Mandatory |
|:---------------------- |:---------------- |:------------ |:------------------- |:--------- |
| Driving License Number | رقم رخصة القيادة | Alphanumeric | License Number      | **Yes**   |
| Issued By              | صدر الرخصة       | Text         | Issuing Authority   | **Yes**   |
| Issued On              | تاريخ الإصدار    | Date         | DD/MM/YYYY          | **Yes**   |
| Exp. Date              | تاريخ الانتهاء   | Date         | DD/MM/YYYY          | **Yes**   |

### **Sub-Section 3C: Vehicle & Rental Details (Hirer Side)**

| Field Name                         | Arabic Name             | Data Type         | Validation Required | Mandatory   |
|:---------------------------------- |:----------------------- |:----------------- |:------------------- |:----------- |
| Car Manufacturing Year             | سنة الصنع               | Numeric           | YYYY (1990-2025)    | **Yes**     |
| Model of Car (Sunny, Patrol, etc.) | نوع السيارة             | Text/Dropdown     | Vehicle Model       | **Yes**     |
| Time Out (Time of Rent)            | ساعة الخروج             | Time              | HH:MM               | **Yes**     |
| Date of Rent                       | تاريخ الإيجار           | Date              | DD/MM/YYYY          | **Yes**     |
| Daily Rent                         | السعر اليومي للإيجار    | Numeric (Decimal) | Daily Rate          | Conditional |
| Weekly Rent                        | السعر الأسبوعي للإيجار  | Numeric (Decimal) | Weekly Rate         | Conditional |
| Total Days                         | عدد الأيام              | Numeric           | Number of Days      | **Yes**     |
| Expected Return Date               | التاريخ المتوقع للتسجيل | Date              | DD/MM/YYYY          | **Yes**     |

---

## **SECTION 4: TERMS & CONDITIONS (BOTTOM LEFT)**

*Multiple text blocks with rental terms in English and Arabic - Pre-printed, not data entry fields*

**Key Terms Mentioned:**

- The terms and conditions in page 2 have 26 points plus some other data.

---

## **SECTION 5: VEHICLE CONDITION DIAGRAM (BOTTOM CENTER)**

### **Sub-Section 5A: Equipment Checklist**

| Field Name          | Arabic Name        | Data Type | Validation              | Mandatory |
|:------------------- |:------------------ |:--------- |:----------------------- |:--------- |
| Tools - No/Yes      | الأدوات            | Checkbox  | Equipment presence      | Yes       |
| Spare Tyre - No/Yes | الإطار الاحتياطي   | Checkbox  | Equipment presence      | Yes       |
| GPS - No/Yes        | نظام تحديد المواقع | Checkbox  | Equipment presence      | Yes       |
| Fuel Percentage %   | نسبة الوقود        | Numeric   | Value between 0 and 100 | Yes       |

**Note:** These items are standard for verifying equipment presence before and after rental.

### **Sub-Section 5B: Vehicle Diagram Markings**

| Field Name      | Description    | Data Type | Purpose                   |
|:--------------- |:-------------- |:--------- |:------------------------- |
| Top view (roof) | صورة من الأعلى | Image     | Document scratches, dents |
| Front view      | صورة من الأمام | Image     | Document scratches, dents |
| Rear view       | صورة من الخلف  | Image     | Document scratches, dents |
| Left side view  | صورة من اليسار | Image     | Document scratches, dents |
| Right side view | صورة من اليمين | Image     | Document scratches, dents |

---

## **SECTION 6: PAYMENT SECTION (BOTTOM RIGHT)**

### **Sub-Section 6A: Payment Breakdown**

| Field Name   | Arabic Name          | Data Type         | Calculation        | Mandatory   |
|:------------ |:-------------------- |:----------------- |:------------------ |:----------- |
| PAYMENT      | الدفع                | Section Header    | -                  | -           |
| Dhs.         | درهم                 | Numeric (Decimal) | Dirhams            | Auto        |
| Fils         | فلس                  | Numeric           | Fils (cents)       | Auto        |
| Rent         | الأجار               | Numeric (Decimal) | Base rental amount | Yes         |
| VAT          | ضريبة القيمة المضافة | Numeric (Decimal) | 5% VAT             | Auto-calc   |
| SALIK        | سالك                 | Numeric (Decimal) | Toll charges       | Conditional |
| Traffic Fine | غرامات مرورية        | Numeric (Decimal) | Traffic fines      | Conditional |
| Damage       | تلفيات               | Numeric (Decimal) | Damage charges     | Conditional |
| Deposit      | الوديعة              | Numeric (Decimal) | Security deposit   | Yes         |
| Others       | المجموع الكلي        | Numeric (Decimal) | Other charges      | Optional    |
| Total Amount | المبلغ الإجمالي      | Numeric (Decimal) | Grand Total        | Auto-calc   |
