# RTL/LTR Testing Checklist - KarāraOS

**Created:** November 20, 2025  
**Purpose:** Comprehensive bilingual testing across all 66 pages  
**Languages:** English (LTR) / Arabic (RTL)

---

## Testing Methodology

### For Each Page:
1. **Switch to Arabic (العربية)**
   - ✅ All field labels show Arabic text (not translation keys)
   - ✅ Direction is RTL (right-to-left)
   - ✅ Navigation sidebar on right side
   - ✅ Text alignment is right-aligned
   - ✅ Icons positioned correctly for RTL
   - ✅ Forms flow right-to-left
   - ✅ Tables read right-to-left
   - ✅ Buttons/actions on correct side

2. **Switch to English**
   - ✅ All field labels show English text
   - ✅ Direction is LTR (left-to-right)
   - ✅ Navigation sidebar on left side
   - ✅ Text alignment is left-aligned
   - ✅ Standard left-to-right flow

3. **Check for Issues:**
   - ❌ Translation keys showing (e.g., `financialSettings.currencyEn`)
   - ❌ English text in Arabic mode (or vice versa)
   - ❌ Layout breaks in RTL mode
   - ❌ Misaligned buttons/icons
   - ❌ Overlapping text
   - ❌ Wrong text direction

---

## PAGE INVENTORY (66 Pages)

### ✅ DASHBOARD (2 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 1 | Main Dashboard | `/` | ⏳ | ⏳ | | Pending |
| 2 | Analytics Dashboard | `/analytics` | ⏳ | ⏳ | | Pending |

### ✅ OPERATIONS (15 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 3 | Contracts | `/contracts` | ⏳ | ⏳ | | Pending |
| 4 | Contract Form | `/contract/new` | ⏳ | ⏳ | | Pending |
| 5 | Contract View | `/contract/:id` | ⏳ | ⏳ | | Pending |
| 6 | Payments | `/payments` | ⏳ | ⏳ | | Pending |
| 7 | Vehicle Transfers | `/vehicle-transfers` | ⏳ | ⏳ | | Pending |
| 8 | Toll Management | `/toll-management` | ⏳ | ⏳ | | Pending |
| 9 | Traffic Fines | `/traffic-fines` | ⏳ | ⏳ | | Pending |
| 10 | Accidents & Incidents | `/accidents-incidents` | ⏳ | ⏳ | | Pending |
| 11 | Fleet Maintenance | `/fleet-maintenance` | ⏳ | ⏳ | | Pending |
| 12 | Dynamic Pricing | `/dynamic-pricing` | ⏳ | ⏳ | | Pending |
| 13 | Accessories Management | `/accessories` | ⏳ | ⏳ | | Pending |
| 14 | Document Registry | `/document-registry` | ⏳ | ⏳ | | Pending |
| 15 | Insurance Claims | `/insurance-claims` | ⏳ | ⏳ | | Pending |
| 16 | Vehicle Inspections | `/vehicle-inspections` | ⏳ | ⏳ | | Pending |
| 17 | Delivery Service | `/delivery-service` | ⏳ | ⏳ | | Pending |

### ✅ MASTERS (10 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 18 | Customers | `/customers` | ⏳ | ⏳ | | Pending |
| 19 | Customer Form | `/customer/new` | ⏳ | ⏳ | | Pending |
| 20 | Vehicles | `/vehicles` | ⏳ | ⏳ | | Pending |
| 21 | Vehicle Form | `/vehicle/new` | ⏳ | ⏳ | | Pending |
| 22 | Branches | `/branches` | ⏳ | ⏳ | | Pending |
| 23 | Drivers | `/drivers` | ⏳ | ⏳ | | Pending |
| 24 | Driver Companies | `/driver-companies` | ⏳ | ⏳ | | Pending |
| 25 | Sponsors | `/sponsors` | ⏳ | ⏳ | | Pending |
| 26 | Public Holidays | `/public-holidays` | ⏳ | ⏳ | | Pending |
| 27 | Vehicle Categories | `/vehicle-categories` | ⏳ | ⏳ | | Pending |

### ✅ REPORTS (27 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 28 | Financial Reports | `/reports/financial` | ⏳ | ⏳ | | Pending |
| 29 | Revenue Report | `/reports/revenue` | ⏳ | ⏳ | | Pending |
| 30 | Payment Collection | `/reports/payment-collection` | ⏳ | ⏳ | | Pending |
| 31 | Outstanding Payments | `/reports/outstanding` | ⏳ | ⏳ | | Pending |
| 32 | Operational Reports | `/reports/operational` | ⏳ | ⏳ | | Pending |
| 33 | Fleet Utilization | `/reports/fleet-utilization` | ⏳ | ⏳ | | Pending |
| 34 | Contract Summary | `/reports/contract-summary` | ⏳ | ⏳ | | Pending |
| 35 | Vehicle Performance | `/reports/vehicle-performance` | ⏳ | ⏳ | | Pending |
| 36 | Branch Performance | `/reports/branch-performance` | ⏳ | ⏳ | | Pending |
| 37 | Customer Reports | `/reports/customer` | ⏳ | ⏳ | | Pending |
| 38 | Customer Lifetime Value | `/reports/customer-ltv` | ⏳ | ⏳ | | Pending |
| 39 | Customer Segmentation | `/reports/customer-segmentation` | ⏳ | ⏳ | | Pending |
| 40 | Top Customers | `/reports/top-customers` | ⏳ | ⏳ | | Pending |
| 41 | Insurance Reports | `/reports/insurance` | ⏳ | ⏳ | | Pending |
| 42 | Claims Analysis | `/reports/claims-analysis` | ⏳ | ⏳ | | Pending |
| 43 | Incident Trends | `/reports/incident-trends` | ⏳ | ⏳ | | Pending |
| 44 | Audit Reports | `/reports/audit` | ⏳ | ⏳ | | Pending |
| 45 | User Activity | `/reports/user-activity` | ⏳ | ⏳ | | Pending |
| 46 | Contract Edits | `/reports/contract-edits` | ⏳ | ⏳ | | Pending |
| 47 | System Changes | `/reports/system-changes` | ⏳ | ⏳ | | Pending |
| 48 | Predictive Intelligence | `/reports/predictive` | ⏳ | ⏳ | | Pending |
| 49 | Revenue Forecast | `/reports/revenue-forecast` | ⏳ | ⏳ | | Pending |
| 50 | Fleet Utilization Forecast | `/reports/fleet-forecast` | ⏳ | ⏳ | | Pending |
| 51 | Customer Churn Risk | `/reports/churn-risk` | ⏳ | ⏳ | | Pending |
| 52 | Maintenance Cost Forecast | `/reports/maintenance-forecast` | ⏳ | ⏳ | | Pending |
| 53 | Payment Default Prediction | `/reports/payment-default` | ⏳ | ⏳ | | Pending |
| 54 | Demand Forecast | `/reports/demand-forecast` | ⏳ | ⏳ | | Pending |

### ✅ ADMINISTRATION (5 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 55 | Users | `/users` | ⏳ | ⏳ | | Pending |
| 56 | User Form | `/user/new` | ⏳ | ⏳ | | Pending |
| 57 | Approvals | `/approvals` | ⏳ | ⏳ | | Pending |
| 58 | Campaigns | `/campaigns` | ⏳ | ⏳ | | Pending |
| 59 | Audit Logs | `/audit-logs` | ⏳ | ⏳ | | Pending |

### ✅ SETTINGS (7 pages)
| # | Page | Path | Arabic Tested | English Tested | Issues | Status |
|---|------|------|---------------|----------------|--------|--------|
| 60 | Company Settings | `/settings/company` | ⏳ | ⏳ | | Pending |
| 61 | Financial Settings | `/settings/financial` | ⏳ | ⏳ | | Pending |
| 62 | Email Templates | `/settings/email-templates` | ⏳ | ⏳ | | Pending |
| 63 | SMS Templates | `/settings/sms-templates` | ⏳ | ⏳ | | Pending |
| 64 | System Settings | `/settings/system` | ⏳ | ⏳ | | Pending |
| 65 | Design System Showcase | `/settings/design-showcase` | ⏳ | ⏳ | | Pending |
| 66 | Help & Legal | `/help` | ⏳ | ⏳ | | Pending |

---

## CRITICAL PAGES (Priority Testing)

These pages are most frequently used and should be tested first:

### **Tier 1 - Mission Critical (Test First)**
1. ✅ Dashboard (`/`)
2. ✅ Contracts (`/contracts`)
3. ✅ Contract Form (`/contract/new`)
4. ✅ Customers (`/customers`)
5. ✅ Vehicles (`/vehicles`)
6. ✅ Payments (`/payments`)
7. ✅ Financial Settings (`/settings/financial`)

### **Tier 2 - High Traffic**
8. ✅ Revenue Report (`/reports/revenue`)
9. ✅ Fleet Utilization (`/reports/fleet-utilization`)
10. ✅ Traffic Fines (`/traffic-fines`)
11. ✅ Accidents & Incidents (`/accidents-incidents`)
12. ✅ Users (`/users`)

### **Tier 3 - Standard Operations**
13-40. All remaining operational pages

### **Tier 4 - Administrative**
41-66. Settings, reports, and administrative pages

---

## COMMON TRANSLATION ISSUES TO CHECK

### **1. Form Labels**
- ❌ Shows: `financialSettings.currencyEn`
- ✅ Should: Show "Currency (English)" in English, "العملة (إنجليزي)" in Arabic

### **2. Button Text**
- ❌ Shows: `common.save`
- ✅ Should: Show "Save" in English, "حفظ" in Arabic

### **3. Table Headers**
- ❌ Shows: `contracts.contractNumber`
- ✅ Should: Show "Contract Number" in English, "رقم العقد" in Arabic

### **4. Status Labels**
- ❌ Shows: `status.active`
- ✅ Should: Show "Active" in English, "نشط" in Arabic

### **5. Validation Messages**
- ❌ Shows: `validation.required`
- ✅ Should: Show "This field is required" in English, "هذا الحقل مطلوب" in Arabic

### **6. Navigation Items**
- ❌ Shows: `nav.dashboard`
- ✅ Should: Show "Dashboard" in English, "لوحة التحكم" in Arabic

---

## TESTING PROCEDURE

### **Manual Test Steps:**

1. **Open Application**
   ```
   URL: http://localhost:5000
   ```

2. **Login**
   ```
   Username: admin
   Password: [admin password]
   ```

3. **For Each Page:**
   
   **Test Arabic (RTL):**
   - Click language toggle (Arabic)
   - Verify `dir="rtl"` on `<html>` tag
   - Verify font family changes to Cairo
   - Check all labels show Arabic
   - Check layout flows right-to-left
   - Check navigation sidebar on right
   - Take screenshot if issues found
   
   **Test English (LTR):**
   - Click language toggle (English)
   - Verify `dir="ltr"` on `<html>` tag
   - Verify font family changes to Inter
   - Check all labels show English
   - Check layout flows left-to-right
   - Check navigation sidebar on left
   - Take screenshot if issues found

4. **Document Issues:**
   ```
   Page: [Page Name]
   Path: [URL Path]
   Issue: [Description]
   Screenshot: [File name]
   Translation Key Missing: [Key name if applicable]
   ```

---

## AUTOMATED TESTING SUPPORT

### **Translation Key Validation Script:**

```bash
# Check for untranslated keys (keys that appear in UI)
grep -r "\.t\(" client/src/pages/ | grep -v "// " | \
  while read line; do
    key=$(echo "$line" | sed -n "s/.*t('\([^']*\)'.*/\1/p")
    if [ ! -z "$key" ]; then
      grep -q "\"$key\"" client/src/lib/i18n.ts || echo "Missing: $key in $line"
    fi
  done
```

### **RTL Layout Validation:**

```typescript
// Check if dir attribute changes with language
const html = document.documentElement;
console.log('Current dir:', html.getAttribute('dir'));
console.log('Current lang:', html.getAttribute('lang'));
console.log('Current font:', window.getComputedStyle(html).fontFamily);
```

---

## PROGRESS TRACKING

**Total Pages:** 66  
**Tested:** 0  
**Passing:** 0  
**Issues Found:** 0  
**Issues Fixed:** 0  

**Completion:** 0%

---

## ISSUE LOG

### **Critical Issues**
_(Issues preventing proper RTL/LTR functionality)_

| # | Page | Issue | Status | Fix |
|---|------|-------|--------|-----|
| - | - | - | - | - |

### **Minor Issues**
_(Translation keys missing but functionality works)_

| # | Page | Issue | Status | Fix |
|---|------|-------|--------|-----|
| - | - | - | - | - |

---

## RECOMMENDATIONS

### **After Testing:**

1. **Add Missing Translation Keys**
   - Update `client/src/lib/i18n.ts`
   - Add both English and Arabic translations
   - Re-test affected pages

2. **Fix Layout Issues**
   - Ensure all flex/grid layouts respect RTL
   - Check icon positioning in RTL mode
   - Verify table column order in RTL

3. **Update Component Library**
   - Ensure all shadcn components support RTL
   - Check Radix UI components for RTL support
   - Add RTL-specific styles where needed

4. **Document RTL Best Practices**
   - Create developer guidelines for RTL support
   - Add to design system documentation
   - Include in code review checklist

---

**NEXT STEPS:**
1. Begin Tier 1 testing (7 mission-critical pages)
2. Document issues in Issue Log
3. Fix critical issues immediately
4. Continue with Tier 2 testing
5. Batch fix minor issues
6. Complete Tier 3 and 4 testing
7. Final verification pass

---

**END OF CHECKLIST**
