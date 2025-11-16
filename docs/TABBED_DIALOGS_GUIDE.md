# Tabbed Dialogs Implementation Guide

## Overview

This guide provides a comprehensive approach to converting large forms and modals to tabbed dialogs throughout the RCCMS application. Tabbed dialogs improve user experience by organizing extensive form fields into logical, manageable sections.

## When to Use Tabbed Dialogs

Use tabbed dialogs when:
- Form has more than 15-20 fields
- Content extends beyond viewport height (requires scrolling)
- Fields can be logically grouped into 2+ categories
- User needs to navigate between different sections of information

## Implementation Pattern

### 1. Basic Structure

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-4xl max-h-[90vh] p-0">
    <DialogHeader className="px-6 pt-6 pb-4">
      <DialogTitle>Form Title</DialogTitle>
    </DialogHeader>
    
    <Tabs defaultValue="tab1" className="w-full">
      <div className="px-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tab1">Basic Info</TabsTrigger>
          <TabsTrigger value="tab2">Details</TabsTrigger>
          <TabsTrigger value="tab3">Additional</TabsTrigger>
        </TabsList>
      </div>
      
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
        <TabsContent value="tab1" className="mt-0">
          {/* Tab 1 form fields */}
        </TabsContent>
        
        <TabsContent value="tab2" className="mt-0">
          {/* Tab 2 form fields */}
        </TabsContent>
        
        <TabsContent value="tab3" className="mt-0">
          {/* Tab 3 form fields */}
        </TabsContent>
      </div>
      
      <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </Tabs>
  </DialogContent>
</Dialog>
```

### 2. Key Implementation Details

**Dialog Container:**
- `max-w-4xl` - Wider container for tabbed content
- `max-h-[90vh]` - Prevent dialog from exceeding viewport
- `p-0` - Remove default padding for better tab control

**Scrollable Content:**
- `overflow-y-auto` - Enable vertical scrolling
- `max-h-[calc(90vh-200px)]` - Account for header and footer height
- Wrap `TabsContent` in scrollable div

**Footer Buttons:**
- Fixed at bottom with `border-t`
- Always visible regardless of scroll position
- Consistent Cancel + Save pattern

### 3. Form Integration with React Hook Form

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialData,
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Tabs defaultValue="tab1">
      {/* Tab navigation */}
      <TabsContent value="tab1">
        <FormField control={form.control} name="field1" ... />
        {/* More fields */}
      </TabsContent>
      {/* More tabs */}
    </Tabs>
    
    <div className="footer">
      <Button type="button" onClick={onCancel}>Cancel</Button>
      <Button type="submit">Save</Button>
    </div>
  </form>
</Form>
```

## Conversion Roadmap

### Phase 1: Customer Form
**Tab Structure:**
1. **Basic Info** - Name (EN/AR), National ID, Nationality, Gender, Date of Birth
2. **Contact** - Phone, Email, Address, Licensing Region
3. **License** - License Number, Issued By, Expiry, Issue Date
4. **Additional** - Notes, Internal References

**File:** `client/src/pages/Customers.tsx`
**Estimated Fields:** 68 form fields → 4 tabs (15-20 fields each)

### Phase 2: Vehicle Form
**Tab Structure:**
1. **Basic Info** - Registration, Make, Model, Year, Color, Category
2. **Technical** - Mileage, Fuel Type, Transmission, Engine, VIN
3. **Ownership** - Owner Details, Registration Info, Insurance
4. **Rental Settings** - Daily/Weekly/Monthly Rates, Mileage Limits, Status

**File:** `client/src/pages/Vehicles.tsx`
**Estimated Fields:** 70+ form fields → 4 tabs

### Phase 3: Sponsor Form
**Tab Structure:**
1. **Basic Info** - Name (EN/AR), Nationality, Passport ID
2. **Contact** - Mobile, Address, Emirate
3. **Relationship** - Relation Type, Notes

**File:** `client/src/pages/Sponsors.tsx`
**Estimated Fields:** 30-40 form fields → 3 tabs

### Phase 4: Company Form
**Tab Structure:**
1. **Company Info** - Name (EN/AR), Trade License, Emirate
2. **Contact** - Phone, Email, Address
3. **Additional** - Notes, Documents

**File:** `client/src/pages/Companies.tsx`
**Estimated Fields:** 35-45 form fields → 3 tabs

### Phase 5: Insurance Claims Form
**Tab Structure:**
1. **Claim Details** - Claim Number, Date, Type, Status
2. **Incident Info** - Description, Location, Police Report
3. **Financial** - Claim Amount, Approved Amount, Settlement
4. **Documents** - Photos, Reports, Correspondence

**File:** `client/src/pages/InsuranceClaims.tsx`
**Estimated Fields:** 25-30 form fields → 3-4 tabs

## Migration Checklist

For each form conversion:

- [ ] Analyze current form structure and field groupings
- [ ] Design logical tab organization (2-4 tabs recommended)
- [ ] Update Dialog component with tabbed structure
- [ ] Move form fields into appropriate tabs
- [ ] Implement scrollable content area with fixed footer
- [ ] Add Cancel and Save buttons to footer
- [ ] Test form validation across all tabs
- [ ] Test navigation between tabs
- [ ] Verify responsive behavior on smaller screens
- [ ] Update data-testid attributes for testing
- [ ] Test with screen readers for accessibility
- [ ] Update documentation

## Accessibility Considerations

- Use semantic tab names that describe content
- Ensure keyboard navigation works (Tab, Arrow keys)
- Maintain focus management between tabs
- Provide clear error indicators across tabs
- Test with screen readers

## Performance Optimization

- Lazy load tab content if needed
- Memoize form components to prevent re-renders
- Use React.memo for complex form field components
- Debounce validation for better UX

## Testing Strategy

1. **Unit Tests** - Test individual tab components
2. **Integration Tests** - Test form submission across tabs
3. **E2E Tests** - Test complete user workflows
4. **Visual Tests** - Verify responsive layouts
5. **Accessibility Tests** - WCAG compliance

## Best Practices

1. **Consistent Tab Order** - Always use the same tab order across similar forms
2. **Save State** - Preserve form data when switching tabs
3. **Error Indicators** - Show which tabs contain validation errors
4. **Progress Indication** - Consider adding completion status
5. **Mobile Optimization** - Use vertical tab lists on small screens

## Example: Customer Form Conversion

**Before (Single Scroll):**
```tsx
<Dialog>
  <DialogContent>
    <Form>
      {/* 68 fields in a long scroll */}
    </Form>
  </DialogContent>
</Dialog>
```

**After (Tabbed):**
```tsx
<Dialog>
  <DialogContent className="max-w-4xl max-h-[90vh] p-0">
    <DialogHeader className="px-6 pt-6">
      <DialogTitle>Customer Form</DialogTitle>
    </DialogHeader>
    
    <Tabs defaultValue="basic">
      <div className="px-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="license">License</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>
      </div>
      
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="basic">
              {/* 15-20 basic info fields */}
            </TabsContent>
            
            <TabsContent value="contact">
              {/* 15-20 contact fields */}
            </TabsContent>
            
            <TabsContent value="license">
              {/* 15-20 license fields */}
            </TabsContent>
            
            <TabsContent value="additional">
              {/* 10-15 additional fields */}
            </TabsContent>
          </form>
        </Form>
      </div>
      
      <div className="flex justify-end gap-2 px-6 py-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
          Save Customer
        </Button>
      </div>
    </Tabs>
  </DialogContent>
</Dialog>
```

## Status

**Created:** November 16, 2025  
**Status:** Implementation Guide - Ready for Development  
**Priority:** High - Improves UX for large forms  
**Estimated Effort:** 2-3 days for all forms

---

**Next Steps:**
1. Start with Customer form (most complex)
2. Apply pattern to Vehicle form
3. Convert Sponsor and Company forms
4. Update Insurance Claims form
5. Review and test all conversions
