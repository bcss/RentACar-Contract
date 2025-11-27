# KarāraOS UI Consistency Standards

**Document Version:** 1.0  
**Last Updated:** November 20, 2025  
**Status:** Production Guidelines

## Overview
This document establishes UI/UX consistency standards for KarāraOS to ensure a cohesive, professional, and maintainable user experience across all 66 pages and 23+ specialized modules.

---

## Design System Foundation

### Core Design Principles
1. **Material Design 3** - Modern, clean aesthetics with elevation and depth
2. **Bilingual First** - English/Arabic with full RTL/LTR support
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Responsive** - Mobile-first approach (320px to 4K displays)
5. **Dark Mode Native** - Optimized for both light and dark themes

### Design Guidelines Reference
**Primary Document:** `design_guidelines.md` (1,200+ lines)
- 15 comprehensive sections
- Material Design 3 principles
- Component specifications
- Spacing, typography, color systems
- Accessibility requirements

---

## Color System

### Theme Colors (Cyan-Blue Primary)
```css
/* Light Mode */
--primary: 198 93% 60%        /* Cyan blue #4ECBF6 */
--primary-foreground: 0 0% 100%

/* Dark Mode */
--primary: 198 93% 50%        /* Darker cyan for dark mode */
--primary-foreground: 0 0% 100%
```

### Semantic Colors
```css
/* Backgrounds */
--background: 0 0% 100%       /* Pure white (light) */
--foreground: 222 47% 11%      /* Dark text */
--card: 0 0% 100%
--popover: 0 0% 100%

/* Borders & Accents */
--border: 214 32% 91%          /* Light gray borders */
--input: 214 32% 91%
--ring: 198 93% 60%            /* Focus rings match primary */

/* States */
--destructive: 0 84% 60%       /* Red for errors/deletes */
--success: 142 71% 45%         /* Green for success */
--warning: 38 92% 50%          /* Orange for warnings */
--info: 199 89% 48%            /* Blue for information */
```

### Text Hierarchy (3 Levels)
1. **Primary Text:** `text-foreground` - Main content, headings
2. **Secondary Text:** `text-muted-foreground` - Supporting information, labels
3. **Tertiary Text:** `text-muted-foreground/70` - Least important metadata

**Rule:** NEVER use light text on light backgrounds or dark text on dark backgrounds. Always ensure sufficient contrast.

---

## Typography

### Font Families
```css
/* English (LTR) */
--font-sans: 'Inter', system-ui, sans-serif

/* Arabic (RTL) */
--font-arabic: 'Cairo', 'Inter', system-ui, sans-serif

/* Monospace (Code, IDs) */
--font-mono: 'JetBrains Mono', 'Courier New', monospace
```

### Font Scale
```css
/* Page Titles */
.text-3xl: 1.875rem (30px) - Main page headings

/* Section Titles */
.text-2xl: 1.5rem (24px) - Card headers, dialog titles

/* Subsection Titles */
.text-xl: 1.25rem (20px) - Section headers

/* Body Text */
.text-base: 1rem (16px) - Default body text

/* Small Text */
.text-sm: 0.875rem (14px) - Labels, helper text

/* Tiny Text */
.text-xs: 0.75rem (12px) - Metadata, timestamps
```

### Font Weights
- **Bold (700):** Page titles, emphasized text
- **Semibold (600):** Card titles, section headers
- **Medium (500):** Button text, labels
- **Normal (400):** Body text, descriptions

---

## Spacing System

### Consistent Spacing Values
```css
/* Small Spacing */
.p-2  (0.5rem / 8px)   - Tight padding (badges, chips)
.p-4  (1rem / 16px)    - Standard padding (cards, inputs)

/* Medium Spacing */
.p-6  (1.5rem / 24px)  - Page/section padding
.gap-4 (1rem / 16px)   - Grid/flex gaps

/* Large Spacing */
.p-8  (2rem / 32px)    - Major section separation
.space-y-6             - Vertical section spacing
```

### Application Rules
1. **Cards:** Consistent `p-4` or `p-6` for all card content
2. **Page Containers:** Standard `p-6` for main content areas
3. **Form Fields:** `gap-4` between form elements
4. **Sections:** `space-y-6` between major sections
5. **Grids:** `gap-4` for grid layouts

**Rule:** No two bordered/elevated elements should touch. Always add spacing.

---

## Layout Patterns

### Page Structure Template
```typescript
<div className="p-6 space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-3xl font-bold">{t('page.title')}</h1>
      <p className="text-muted-foreground mt-1">{t('page.subtitle')}</p>
    </div>
    <div className="flex gap-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Filters/Controls (Optional) */}
  <Card>
    <CardHeader>
      <CardTitle>{t('common.filters')}</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Filter inputs */}
    </CardContent>
  </Card>

  {/* Main Content */}
  <div className="grid grid-cols-1 gap-4">
    {/* Content cards or table */}
  </div>
</div>
```

### Responsive Grid Patterns
```typescript
/* Mobile-first responsive grids */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

/* Stat cards */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

/* Two-column layout */
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

---

## Component Standards

### Buttons

#### Size Variants
```typescript
<Button size="sm">      /* min-h-8 - Compact */
<Button>                /* min-h-9 - Default */
<Button size="lg">      /* min-h-10 - Prominent */
<Button size="icon">    /* h-9 w-9 - Icon only */
```

#### Style Variants
```typescript
<Button variant="default">    /* Primary action - cyan blue bg */
<Button variant="destructive"> /* Delete/cancel - red bg */
<Button variant="outline">    /* Secondary - border only */
<Button variant="secondary">  /* Subtle - light gray bg */
<Button variant="ghost">      /* Minimal - transparent */
```

#### Rules
- ✅ Use `size="icon"` for icon-only buttons
- ✅ Default variant for primary actions
- ✅ Outline variant for secondary actions
- ✅ Destructive variant for delete/remove
- ❌ NEVER add custom hover/active states (built-in elevation handles it)
- ❌ NEVER mix button variants on same horizontal line with different heights

### Cards

#### Standard Card Pattern
```typescript
<Card>
  <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {t('metric.title')}
    </CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
  </CardContent>
</Card>
```

#### Rules
- ✅ Use Cards for grouping related content
- ✅ Consistent padding across all cards
- ❌ NEVER nest Card inside Card
- ❌ NEVER use Cards as full-width sidebars (use proper containers)

### Form Fields

#### Standard Form Pattern
```typescript
<div className="space-y-4">
  <div>
    <Label htmlFor="field-id">{t('form.fieldLabel')}</Label>
    <Input
      id="field-id"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={t('form.placeholder')}
      data-testid="input-field-name"
    />
  </div>
</div>
```

#### Input Sizes
- **Default Height:** All inputs use `h-9` (matches Button default)
- **Icon Inputs:** Add `pr-10` for right icons, `pl-10` for left icons
- **Textarea:** Use `rows={3}` or `rows={5}` for consistency

#### Rules
- ✅ Always pair Label with Input using `htmlFor` and `id`
- ✅ Include `data-testid` on all interactive elements
- ✅ Use consistent placeholder text patterns
- ✅ Show validation errors below input with `text-destructive text-sm`

### Tables

#### Standard Table Pattern
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{t('table.column1')}</TableHead>
      <TableHead>{t('table.column2')}</TableHead>
      <TableHead className="text-right">{t('table.actions')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell className="font-medium">{row.value1}</TableCell>
        <TableCell>{row.value2}</TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="ghost">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Rules
- ✅ Right-align numeric columns
- ✅ Right-align action columns
- ✅ Use `font-medium` for primary identifier column
- ✅ Empty state with `text-muted-foreground`

### Badges

#### Standard Badge Pattern
```typescript
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Cancelled</Badge>
<Badge variant="outline">Draft</Badge>
```

#### Status Badge Mapping
```typescript
const statusVariants = {
  active: 'default',
  completed: 'default',
  pending: 'secondary',
  draft: 'outline',
  cancelled: 'destructive',
  failed: 'destructive',
};
```

### Dialogs

#### Standard Dialog Pattern
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{t('dialog.title')}</DialogTitle>
      <DialogDescription>{t('dialog.description')}</DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {/* Dialog content */}
    </div>
    
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        {t('common.cancel')}
      </Button>
      <Button onClick={handleSubmit}>
        {t('common.save')}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

#### Rules
- ✅ Use `max-w-2xl` for standard dialogs
- ✅ Add `overflow-y-auto` for scrollable content
- ✅ Include DialogDescription for accessibility
- ✅ Right-align action buttons with cancel on left

---

## Bilingual Support (English/Arabic)

### Language Context Integration
```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  return (
    <div dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Content */}
    </div>
  );
}
```

### RTL/LTR Best Practices

#### Automatic Direction Switching
```typescript
/* LanguageContext automatically sets */
document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
document.documentElement.style.fontFamily = isArabic ? 'Cairo' : 'Inter';
```

#### RTL-Safe Layout Patterns
```typescript
/* ✅ GOOD - Uses logical properties */
className="flex items-center gap-4"
className="ms-2 me-4"  /* margin-start, margin-end */
className="ps-4 pe-2"  /* padding-start, padding-end */

/* ❌ BAD - Hard-coded directions */
className="ml-2 mr-4"  /* Breaks in RTL */
className="pl-4 pr-2"  /* Breaks in RTL */
```

#### Input Direction
```typescript
/* Arabic inputs */
<Input dir="rtl" placeholder={t('placeholder.ar')} />

/* English inputs (email, phone) */
<Input dir="ltr" type="email" />
```

### Translation Key Patterns
```typescript
/* Navigation */
"nav.dashboard": "Dashboard" / "لوحة التحكم"

/* Common Actions */
"common.save": "Save" / "حفظ"
"common.cancel": "Cancel" / "إلغاء"
"common.delete": "Delete" / "حذف"

/* Validation */
"validation.required": "This field is required" / "هذا الحقل مطلوب"

/* Status */
"status.active": "Active" / "نشط"
"status.pending": "Pending" / "قيد الانتظار"
```

---

## Data Visualization

### Chart Colors
```typescript
const CHART_COLORS = [
  'hsl(var(--primary))',      // Cyan blue
  'hsl(var(--success))',      // Green
  'hsl(var(--warning))',      // Orange
  'hsl(var(--destructive))',  // Red
  'hsl(var(--info))',         // Blue
  '#8b5cf6',                   // Purple
  '#ec4899',                   // Pink
];
```

### Recharts Configuration
```typescript
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="label" 
      className="text-sm"
      reversed={isArabic}  /* RTL support */
    />
    <YAxis className="text-sm" />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
      }}
    />
    <Legend />
    <Bar dataKey="value" fill="hsl(var(--primary))" />
  </BarChart>
</ResponsiveContainer>
```

---

## Interactive States

### Hover Elevations
```typescript
/* Built-in Tailwind utility */
className="hover-elevate"        /* Subtle background elevation on hover */
className="active-elevate-2"     /* More dramatic on click/active */

/* Example usage */
<Card className="hover-elevate cursor-pointer">
  {/* Card content */}
</Card>
```

### Focus States
```typescript
/* Inputs and interactive elements */
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

/* Keyboard navigation */
className="focus-visible:outline-none focus-visible:ring-2"
```

### Loading States
```typescript
/* Skeleton loaders */
<Skeleton className="h-8 w-full" />
<Skeleton className="h-32 w-full" />

/* Spinner in buttons */
<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? t('common.saving') : t('common.save')}
</Button>
```

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- ✅ All interactive elements reachable via Tab
- ✅ Logical tab order (top to bottom, left to right)
- ✅ Visible focus indicators (ring-2)
- ✅ Escape key closes dialogs/dropdowns
- ✅ Enter key submits forms

### Screen Reader Support
```typescript
/* ARIA labels for icons */
<Button aria-label={t('actions.delete')}>
  <Trash2 className="h-4 w-4" />
</Button>

/* ARIA descriptions */
<Input
  aria-describedby="email-hint"
  aria-invalid={!!errors.email}
/>
<p id="email-hint" className="text-sm text-muted-foreground">
  {t('hints.emailFormat')}
</p>
```

### Color Contrast Requirements
- **Normal Text (16px):** Minimum 4.5:1 contrast ratio
- **Large Text (24px+):** Minimum 3:1 contrast ratio
- **Interactive Elements:** Minimum 3:1 contrast for borders/icons

### Testing Checklist
```typescript
/* Add data-testid to ALL interactive elements */
<Button data-testid="button-save">Save</Button>
<Input data-testid="input-email" />
<Select data-testid="select-status">...</Select>

/* Pattern: {action}-{target} or {type}-{content} */
data-testid="button-create-contract"
data-testid="input-customer-name"
data-testid="card-revenue-summary"
```

---

## Error Handling

### Form Validation Errors
```typescript
<div>
  <Label htmlFor="email">{t('form.email')}</Label>
  <Input
    id="email"
    className={errors.email ? 'border-destructive' : ''}
  />
  {errors.email && (
    <p className="text-sm text-destructive mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

### Toast Notifications
```typescript
/* Success */
toast({
  title: t('common.success'),
  description: t('messages.contractCreated'),
});

/* Error */
toast({
  variant: 'destructive',
  title: t('common.error'),
  description: error.message || t('messages.somethingWentWrong'),
});

/* Warning */
toast({
  title: t('common.warning'),
  description: t('messages.unsavedChanges'),
  variant: 'default',
});
```

### Empty States
```typescript
{data.length === 0 ? (
  <Card>
    <CardContent className="p-8 text-center">
      <p className="text-muted-foreground">
        {t('messages.noDataAvailable')}
      </p>
      <Button className="mt-4" onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        {t('actions.createFirst')}
      </Button>
    </CardContent>
  </Card>
) : (
  /* Data display */
)}
```

---

## Performance Optimization

### Image Optimization
```typescript
/* Use proper image formats */
- WebP for photos
- SVG for icons/logos
- PNG for screenshots with transparency

/* Lazy loading */
<img loading="lazy" src={imageUrl} alt={description} />
```

### Code Splitting
```typescript
/* Lazy load heavy components */
const HeavyChart = lazy(() => import('./components/HeavyChart'));

<Suspense fallback={<Skeleton className="h-64 w-full" />}>
  <HeavyChart data={data} />
</Suspense>
```

### Query Optimization
```typescript
/* Enable pagination for large datasets */
const { data, isLoading } = useQuery({
  queryKey: ['/api/contracts', page, limit],
  queryFn: () => fetchContracts(page, limit),
  keepPreviousData: true, // Smooth pagination
});

/* Prefetch related data */
queryClient.prefetchQuery({
  queryKey: ['/api/customer', customerId],
});
```

---

## Mobile Responsiveness

### Breakpoint System
```css
sm:  640px  /* Tablets portrait */
md:  768px  /* Tablets landscape */
lg:  1024px /* Desktops */
xl:  1280px /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Mobile-First Patterns
```typescript
/* Stack on mobile, grid on desktop */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

/* Hide on mobile, show on desktop */
className="hidden md:block"

/* Responsive text */
className="text-2xl md:text-3xl lg:text-4xl"

/* Responsive padding */
className="p-4 md:p-6"
```

### Touch Targets
- **Minimum Size:** 44x44 pixels for touch targets
- **Spacing:** At least 8px between interactive elements
- **Buttons:** Use `min-h-10` for mobile-friendly tap targets

---

## File Organization Best Practices

### Component Structure
```
client/src/
├── components/
│   ├── ui/              # Shadcn base components
│   ├── charts/          # Reusable chart components
│   └── layout/          # Layout components (Header, Sidebar)
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
└── contexts/            # React contexts
```

### Naming Conventions
```typescript
/* Components: PascalCase */
CustomerForm.tsx
RevenueChart.tsx

/* Utilities: camelCase */
csvExport.ts
formatters.ts

/* Constants: UPPER_SNAKE_CASE */
const API_BASE_URL = '/api';
const MAX_FILE_SIZE = 5242880;

/* CSS Classes: kebab-case */
.custom-scrollbar { }
.hover-effect { }
```

---

## Common Anti-Patterns to Avoid

### ❌ DON'T
```typescript
/* Hard-coded directions */
<div className="ml-4 mr-2">  /* Breaks RTL */

/* Custom hover states on Buttons */
<Button className="hover:bg-blue-600">  /* Breaks elevation system */

/* Inconsistent spacing */
<Card className="p-2">  /* Use p-4 or p-6 */
<Card className="p-10"> /* Too much padding */

/* Missing data-testid */
<Button onClick={handleClick}>Save</Button>  /* Add data-testid */

/* Non-semantic colors */
<Badge className="bg-yellow-400">  /* Use semantic variants */

/* Nested Cards */
<Card>
  <Card>Content</Card>  /* Never nest cards */
</Card>
```

### ✅ DO
```typescript
/* Logical properties for RTL/LTR */
<div className="ms-4 me-2">  /* Works in both directions */

/* Use built-in Button variants */
<Button variant="default">Save</Button>

/* Consistent spacing */
<Card className="p-4">  /* Standard padding */
<Card className="p-6">  /* Page-level padding */

/* Always include data-testid */
<Button onClick={handleClick} data-testid="button-save">Save</Button>

/* Semantic Badge variants */
<Badge variant="default">Active</Badge>

/* Flat Card structure */
<div className="grid grid-cols-2 gap-4">
  <Card>Content 1</Card>
  <Card>Content 2</Card>
</div>
```

---

## Quality Checklist

### Before Committing Code
- [ ] All interactive elements have `data-testid` attributes
- [ ] Text uses semantic color classes (foreground, muted-foreground)
- [ ] Spacing is consistent with system (p-4, gap-4, space-y-6)
- [ ] All text is translatable (uses `t()` function)
- [ ] RTL/LTR support verified (logical properties, no hard-coded directions)
- [ ] Forms have proper Labels with `htmlFor`
- [ ] Buttons use standard size/variant props (no custom styling)
- [ ] Cards have consistent padding
- [ ] Loading states implemented (Skeleton or spinner)
- [ ] Empty states handled gracefully
- [ ] Error messages are user-friendly and translated
- [ ] Focus states visible for keyboard navigation
- [ ] Color contrast meets WCAG 2.1 AA standards

### Page-Level Checklist
- [ ] Page title uses `text-3xl font-bold`
- [ ] Page subtitle uses `text-muted-foreground`
- [ ] Filters in Card with CardHeader "Filters" title
- [ ] Main content in `grid grid-cols-1 gap-4` or similar
- [ ] Mobile responsive (stacks on small screens)
- [ ] Print styles considered (if applicable)
- [ ] Dark mode tested and working correctly
- [ ] Arabic (RTL) tested and working correctly

---

## Conclusion

These UI consistency standards ensure KarāraOS maintains a professional, accessible, and cohesive user experience. By following these guidelines, developers can:

1. **Reduce Decision Fatigue** - Pre-defined patterns for common scenarios
2. **Accelerate Development** - Copy-paste patterns from this document
3. **Ensure Quality** - Built-in accessibility and responsiveness
4. **Maintain Consistency** - All pages look and feel like one application
5. **Support Global Users** - Bilingual and RTL/LTR by default

**For detailed component specifications, color values, and advanced patterns, refer to `design_guidelines.md`.**

**Overall Status: PRODUCTION-READY ✅**
