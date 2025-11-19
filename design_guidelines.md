# RCCMS Unified Design System
**Version:** 2.0  
**Last Updated:** November 19, 2025  
**Scope:** Complete UI/UX guidelines for the entire RCCMS platform

## Design Philosophy

### Core Principles
**System Foundation:** Material Design 3 with enterprise-grade rental car management patterns  
**Target Users:** Rental car operators, managers, and administrative staff in UAE market  
**Design Goals:**
- Professional, trustworthy interface for high-stakes financial transactions
- Efficient data-dense layouts optimized for operational workflows
- Seamless bilingual experience (English/Arabic) with full RTL/LTR support
- Consistent component behavior across 23+ specialized modules
- Accessibility-first approach meeting WCAG 2.1 AA standards

### Brand Identity
**Primary Color:** Cyan-Blue (#0BA5EC) - Trust, reliability, professionalism  
**Secondary Color:** Purple-Gray (#736B99) - Stability, authority  
**Accent Color:** Amber (#FFCC00) - Attention, alerts, highlights  
**Destructive Color:** Red (#E74C3C) - Warnings, errors, critical actions  

**Rationale:** Cyan-blue primary establishes professional credibility for financial operations. Amber accents draw attention to important actions. Red is reserved exclusively for destructive operations and critical warnings.

---

## 1. Color System

### Semantic Color Tokens
```css
/* Light Mode */
--background: 0 0% 99%         /* Near-white for main canvas */
--foreground: 220 13% 13%      /* Dark blue-gray for primary text */
--card: 0 0% 100%              /* Pure white for elevated surfaces */
--card-foreground: 220 13% 13% /* Text on cards */
--card-border: 220 9% 93%      /* Subtle card borders */

--primary: 199 89% 48%         /* Cyan-blue for primary actions */
--primary-foreground: 0 0% 100% /* White text on primary */
--secondary: 260 8% 40%        /* Purple-gray for secondary actions */
--accent: 45 100% 51%          /* Amber for highlights/warnings */
--destructive: 0 72% 51%       /* Red for delete/cancel actions */

--muted: 220 13% 95%           /* Subtle backgrounds */
--muted-foreground: 220 13% 40% /* De-emphasized text */
--sidebar: 220 9% 96%          /* Sidebar background */
--sidebar-accent: 220 12% 89%  /* Selected sidebar items */

/* Dark Mode - .dark class */
--background: 220 15% 11%      /* Dark blue-gray canvas */
--foreground: 0 0% 98%         /* Near-white text */
--card: 220 14% 16%            /* Elevated dark cards */
--primary: 199 84% 65%         /* Lighter cyan for contrast */
```

### Color Usage Guidelines

**Backgrounds & Surfaces:**
- `bg-background`: Main page background (near-white or dark blue-gray)
- `bg-card`: Elevated content containers, cards, modals
- `bg-sidebar`: Sidebar and navigation areas
- `bg-muted`: Subtle backgrounds for secondary information
- `bg-popover`: Dropdown menus, tooltips, popovers

**Text Hierarchy:**
- `text-foreground`: Primary body text (default)
- `text-muted-foreground`: Supporting text, labels, descriptions
- `text-card-foreground`: Text on card surfaces
- **Never use `text-primary` for body text** - reserve for branded headers or hero sections only

**Interactive Elements:**
- `bg-primary`: Primary action buttons (Submit, Save, Create)
- `bg-secondary`: Secondary actions (Cancel when non-destructive, View Details)
- `bg-accent`: Warning buttons, important alerts (Pending Approval, Requires Attention)
- `bg-destructive`: Destructive actions (Delete, Remove, Void Contract)
- `bg-muted`: Disabled states, inactive elements

**Borders:**
- `border-border`: Standard borders (46% lightness)
- `border-card-border`: Card boundaries (93% lightness - subtle)
- `border-primary-border`: Borders matching primary buttons (auto-computed)
- `border-sidebar-border`: Sidebar separators

**Chart Colors (Data Visualization):**
- `chart-1`: Primary cyan-blue - revenue, active contracts
- `chart-2`: Green - growth, positive metrics, completed
- `chart-3`: Light blue - secondary metrics, forecasts
- `chart-4`: Amber - warnings, pending items
- `chart-5`: Purple-gray - tertiary data, historical

### Status Colors (Contract & Vehicle States)
```typescript
Reserved: bg-blue-500 text-white       // New reservations
Active: bg-green-600 text-white        // Running contracts
Completed: bg-gray-500 text-white      // Finished contracts
Void: bg-red-600 text-white            // Cancelled contracts
Available: bg-emerald-500 text-white   // Ready vehicles
Rented: bg-amber-500 text-white        // Vehicles in use
Maintenance: bg-orange-600 text-white  // Under service
Disabled: bg-gray-400 text-white       // Inactive vehicles
```

**Rationale:** High-contrast status badges with white text ensure readability. Green indicates positive states, amber for caution, red for critical/inactive.

---

## 2. Typography System

### Font Families
- **Primary (English):** Inter - Modern, legible, optimized for UI
- **Primary (Arabic):** Cairo - Professional Arabic typeface with excellent Arabic support
- **Monospace:** JetBrains Mono - Contract numbers, IDs, timestamps, currency
- **Serif:** Georgia - Formal documents, PDF exports

### Type Scale & Usage

**Display & Headings:**
```css
text-4xl (36px): Hero sections, landing pages
text-3xl (30px): Page titles (Dashboard, Contracts List)
text-2xl (24px): Dialog titles, section headers
text-xl (20px): Card titles, subsection headers
text-lg (18px): Form section labels, prominent labels
```

**Body & UI:**
```css
text-base (16px): Primary body text, form inputs, table content
text-sm (14px): Secondary text, labels, helper text, buttons
text-xs (12px): Captions, timestamps, metadata, badges
```

**Font Weights:**
- `font-normal (400)`: Body text, descriptions
- `font-medium (500)`: Labels, subheadings, button text
- `font-semibold (600)`: Card titles, important labels
- `font-bold (700)`: Page titles, critical information

### Typography Guidelines

**Headings:**
- Use `font-semibold` or `font-bold` for all headings
- Maintain consistent hierarchy (don't skip levels)
- Use `text-foreground` - never `text-primary` for headings except hero sections

**Body Text:**
- Default to `text-base font-normal text-foreground`
- Line height: `leading-relaxed` (1.625) for readability
- Use `text-muted-foreground` for supporting text

**Monospace (Financial Data):**
- Contract IDs, vehicle registration numbers: `font-mono text-sm`
- Currency amounts: `font-mono text-base` or `font-mono text-lg` for prominence
- Timestamps: `font-mono text-xs text-muted-foreground`

**Arabic Text:**
- Automatically applies `font-arabic` via i18n language detection
- Ensure RTL layout shifts when language is Arabic
- Use slightly larger font sizes for Arabic (Cairo renders smaller than Inter)

**Numbers & Dates:**
- Currency: `font-mono` with proper AED formatting
- Dates: Localized format (DD/MM/YYYY for Arabic, MM/DD/YYYY for English)
- Percentages: `font-mono` with consistent decimal places

---

## 3. Spacing & Layout

### Spacing Scale (Tailwind Units)
```css
/* Base unit: 0.25rem (4px) */
spacing-0: 0px
spacing-1: 0.25rem (4px)   - Tight spacing, icon gaps
spacing-2: 0.5rem (8px)    - Small gaps, compact layouts
spacing-3: 0.75rem (12px)  - Medium-small gaps
spacing-4: 1rem (16px)     - DEFAULT spacing for most use cases
spacing-6: 1.5rem (24px)   - Card padding, section gaps
spacing-8: 2rem (32px)     - Large section separation
spacing-12: 3rem (48px)    - Major section breaks
spacing-16: 4rem (64px)    - Page-level separation
```

### Consistent Spacing Levels
**Small Spacing (p-4, gap-2):** Icon buttons, compact tables, tight forms  
**Medium Spacing (p-6, gap-4):** Standard cards, form fields, lists (DEFAULT)  
**Large Spacing (p-8, gap-6):** Page containers, major sections, modal dialogs

### Layout Patterns

**Page Container:**
```tsx
<div className="max-w-7xl mx-auto px-6 py-8">
  {/* Page content */}
</div>
```
- `max-w-7xl`: Maximum width for readability (1280px)
- `px-6`: Consistent horizontal padding
- `py-8`: Vertical breathing room

**Card Layouts:**
```tsx
<Card className="p-6">
  <CardHeader className="pb-4">
    <CardTitle className="text-xl font-semibold">Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content with consistent gap-4 */}
  </CardContent>
</Card>
```

**Grid Systems:**
```tsx
{/* Responsive KPI Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard /> <KPICard /> <KPICard /> <KPICard />
</div>

{/* Two-Column Layout */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <LeftPanel /> <RightPanel />
</div>

{/* List Items with Dividers */}
<div className="divide-y divide-border">
  <ListItem /> <ListItem /> <ListItem />
</div>
```

**Sidebar Layout (Navigation):**
```tsx
<SidebarProvider>
  <div className="flex h-screen w-full">
    <AppSidebar />
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between gap-4 p-4 border-b">
        <SidebarTrigger />
        <UserMenu />
      </header>
      <main className="flex-1 overflow-auto p-6">
        {/* Page content */}
      </main>
    </div>
  </div>
</SidebarProvider>
```

### RTL/LTR Considerations
- **Always use logical properties:** `ps-4` (padding-start) instead of `pl-4`
- **Flexbox alignment:** `justify-start` and `justify-end` flip automatically
- **Icons:** Mirror directional icons (arrows, chevrons) in RTL
- **Text alignment:** `text-start` instead of `text-left`
- **Margins:** Use `ms-auto` (margin-inline-start: auto) instead of `ml-auto`

**Example:**
```tsx
{/* Good - adapts to RTL/LTR */}
<div className="flex items-center gap-2 ps-4">
  <ChevronRight className="rtl:rotate-180" />
  <span className="text-start">Next Page</span>
</div>

{/* Bad - hardcoded left alignment */}
<div className="flex items-center gap-2 pl-4 text-left">
  <ChevronRight />
  <span>Next Page</span>
</div>
```

---

## 4. Component Library

### Buttons

**Variants:**
- `variant="default"`: Primary actions (Submit, Save, Create) - cyan-blue background
- `variant="secondary"`: Non-critical actions (Cancel, Back) - purple-gray
- `variant="destructive"`: Delete/remove actions - red background
- `variant="outline"`: Tertiary actions, filters - transparent with border
- `variant="ghost"`: Minimal actions, sidebar items - no background until hover
- `variant="link"`: Text-only links - underlined on hover

**Sizes:**
- `size="sm"`: Compact buttons (h-8, text-sm) - table actions, tight spaces
- `size="default"`: Standard buttons (min-h-9, text-sm) - most use cases
- `size="lg"`: Prominent buttons (min-h-10, text-base) - hero CTAs, forms
- `size="icon"`: Square icon-only buttons (h-9 w-9) - toolbar actions

**Usage Guidelines:**
- **Primary Button:** Only one per view (main action)
- **Secondary/Outline:** Supporting actions
- **Destructive:** Requires confirmation dialog for irreversible actions
- **Icon Buttons:** Always include `aria-label` and tooltip
- **Loading State:** Show spinner with `disabled` attribute
- **Never apply custom hover states** - use built-in elevation system

**Example:**
```tsx
{/* Primary action */}
<Button variant="default" size="default">
  <Plus className="w-4 h-4 me-2" />
  Create Contract
</Button>

{/* Destructive action with confirmation */}
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">
      <Trash2 className="w-4 h-4 me-2" />
      Delete Vehicle
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    {/* Confirmation content */}
  </AlertDialogContent>
</AlertDialog>

{/* Icon button with tooltip */}
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Refresh data">
      <RefreshCw className="w-4 h-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Refresh</TooltipContent>
</Tooltip>
```

### Form Inputs

**Text Inputs:**
```tsx
<FormField
  control={form.control}
  name="customerName"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-sm font-medium">
        Customer Name
      </FormLabel>
      <FormControl>
        <Input 
          placeholder="Enter full name" 
          className="text-base"
          {...field} 
        />
      </FormControl>
      <FormDescription className="text-xs text-muted-foreground">
        Legal name as per Emirates ID
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Select Dropdowns:**
```tsx
<FormField
  control={form.control}
  name="branchId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Branch Location</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="branch-1">Dubai Marina</SelectItem>
          <SelectItem value="branch-2">Abu Dhabi Downtown</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Date Pickers:**
```tsx
<FormField
  control={form.control}
  name="startDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Contract Start Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "ps-3 text-start font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date < new Date() || date > new Date("2030-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Checkbox & Switch:**
```tsx
{/* Checkbox for boolean fields */}
<FormField
  control={form.control}
  name="insuranceIncluded"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Insurance Included</FormLabel>
        <FormDescription>
          Full coverage insurance included in contract
        </FormDescription>
      </div>
    </FormItem>
  )}
/>

{/* Switch for toggles */}
<FormField
  control={form.control}
  name="autoRenewal"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between gap-4">
      <div className="space-y-0.5">
        <FormLabel>Auto-Renewal</FormLabel>
        <FormDescription>
          Automatically renew contract upon expiry
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

**Textarea:**
```tsx
<FormField
  control={form.control}
  name="notes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Notes</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Additional contract notes..."
          className="resize-none min-h-[100px]"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Form Layout Guidelines:**
- **Grid Forms:** Use `grid grid-cols-1 md:grid-cols-2 gap-6` for multi-column forms
- **Inline Fields:** Group related fields with `flex gap-4`
- **Required Fields:** Mark with `<FormLabel className="required">Label</FormLabel>` and add asterisk in CSS
- **Error States:** Automatically handled by `<FormMessage />` - red text below input
- **Disabled States:** Use `disabled` attribute - grays out input with `opacity-50`

### Cards

**Standard Card:**
```tsx
<Card>
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="text-xl font-semibold">
        Vehicle Details
      </CardTitle>
      <Button variant="ghost" size="icon">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>
    <CardDescription className="text-sm text-muted-foreground">
      Registration and maintenance information
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Card content with consistent spacing */}
  </CardContent>
  <CardFooter className="pt-4 border-t">
    <Button variant="outline" className="w-full">View Full Details</Button>
  </CardFooter>
</Card>
```

**KPI Card (Metrics):**
```tsx
<Card className="p-6">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Active Contracts
      </p>
      <p className="text-3xl font-bold font-mono">
        248
      </p>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
        <TrendingUp className="w-3 h-3 text-green-600" />
        <span className="text-green-600 font-medium">+12.5%</span>
        vs last month
      </p>
    </div>
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
      <FileText className="w-6 h-6 text-primary" />
    </div>
  </div>
</Card>
```

**Card Guidelines:**
- **Elevation:** Cards are elevated surfaces - use `bg-card` (white/dark-gray)
- **Padding:** Consistent `p-6` for content areas
- **Spacing:** `space-y-4` or `gap-4` for internal content
- **Borders:** Subtle `border-card-border` applied automatically
- **Never nest cards inside cards** - use nested sections with dividers instead
- **Hover States:** Apply `hover-elevate` for clickable cards
- **Loading States:** Use skeleton placeholders matching card structure

### Tables

**Data Table Pattern:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Contract ID</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Vehicle</TableHead>
      <TableHead>Start Date</TableHead>
      <TableHead>End Date</TableHead>
      <TableHead className="text-end">Amount</TableHead>
      <TableHead className="w-[80px]">Status</TableHead>
      <TableHead className="text-end w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {contracts.map((contract) => (
      <TableRow key={contract.id} className="hover-elevate">
        <TableCell className="font-mono text-sm">
          {contract.id}
        </TableCell>
        <TableCell className="font-medium">
          {contract.customerName}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>{contract.vehiclePlate}</span>
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {format(contract.startDate, "dd/MM/yyyy")}
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {format(contract.endDate, "dd/MM/yyyy")}
        </TableCell>
        <TableCell className="text-end font-mono">
          AED {contract.amount.toLocaleString()}
        </TableCell>
        <TableCell>
          <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
            {contract.status}
          </Badge>
        </TableCell>
        <TableCell className="text-end">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Table Guidelines:**
- **Fixed Widths:** Set widths on key columns (ID, actions) with `w-[100px]`
- **Text Alignment:** Numbers and amounts align `text-end`, text aligns `text-start`
- **Monospace:** Use `font-mono` for IDs, dates, currency
- **Row Hover:** Apply `hover-elevate` for interactive rows
- **Alternating Rows:** Avoid striped backgrounds - use subtle borders instead
- **Sticky Headers:** Add `sticky top-0 bg-background z-10` for scrolling tables
- **Pagination:** Show 15-20 rows per page, provide page controls
- **Empty States:** Display helpful message when table has no data
- **Loading:** Use skeleton rows matching table structure

### Badges

**Variants:**
- `variant="default"`: Primary blue badges - status highlights
- `variant="secondary"`: Neutral gray badges - metadata, counts
- `variant="destructive"`: Red badges - errors, critical states
- `variant="outline"`: Bordered badges - low emphasis

**Sizes:**
- `size="sm"`: Compact badges (text-xs, px-2 py-0.5) - inline with text
- `size="default"`: Standard badges (text-xs, px-2.5 py-1) - most use cases

**Usage:**
```tsx
{/* Status badge */}
<Badge variant="default">Active</Badge>

{/* Count badge */}
<Badge variant="secondary" className="font-mono">
  {count}
</Badge>

{/* Warning/error badge */}
<Badge variant="destructive">Overdue</Badge>

{/* Outlined badge for low emphasis */}
<Badge variant="outline">Draft</Badge>
```

**Guidelines:**
- **No wrapping:** Badges display on one line - ensure adequate space
- **Icon + Text:** Place icon before text with `me-1` spacing
- **Don't overuse:** Limit to 2-3 badges per row to avoid clutter
- **Status Colors:** Use semantic status colors (green/amber/red) sparingly

### Dialogs & Modals

**Dialog Pattern:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="default">Create Contract</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle className="text-2xl font-semibold">
        New Rental Contract
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        Enter contract details to create a new rental agreement
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-6 py-4">
      {/* Form fields with consistent spacing */}
      <Form>...</Form>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="default" type="submit">
        Create Contract
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**AlertDialog (Confirmations):**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Contract</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the
        contract and all associated payment records.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">
        Delete Contract
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Dialog Guidelines:**
- **Width:** Use `sm:max-w-[425px]` for small dialogs, `sm:max-w-[600px]` for standard forms
- **Scrolling:** Long content should scroll within dialog body, not the entire dialog
- **Focus Management:** First form field auto-focuses on open
- **Escape Key:** Always allow Esc to close (non-critical dialogs)
- **Backdrop:** Semi-transparent dark overlay prevents interaction with page
- **Destructive Actions:** Always use AlertDialog with explicit confirmation

### Navigation (Sidebar)

**Sidebar Structure:**
```tsx
<Sidebar>
  <SidebarHeader className="p-4">
    <div className="flex items-center gap-3">
      <Car className="w-8 h-8 text-primary" />
      <div>
        <h2 className="text-lg font-semibold">RCCMS</h2>
        <p className="text-xs text-muted-foreground">v2.0</p>
      </div>
    </div>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Operations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/contracts">
                <FileText className="w-4 h-4" />
                <span>Contracts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* More menu items */}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter className="p-4 border-t">
    <UserMenu />
  </SidebarFooter>
</Sidebar>
```

**Sidebar Guidelines:**
- **Width:** Use CSS variable `--sidebar-width: 20rem` (320px)
- **Collapsible:** Include toggle button in header
- **Active States:** Highlight current page with `data-active` state
- **Icon Size:** Consistent `w-4 h-4` for menu icons
- **Grouping:** Use `SidebarGroup` for logical categorization
- **Tooltips:** Show tooltips when sidebar is collapsed
- **RBAC:** Hide menu items based on user permissions

### Tooltips & Popovers

**Tooltip:**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Info className="w-4 h-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p className="text-xs">Contract creation date</p>
  </TooltipContent>
</Tooltip>
```

**Popover (Additional Context):**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Filter Options</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Advanced Filters</h4>
      {/* Filter controls */}
    </div>
  </PopoverContent>
</Popover>
```

**Guidelines:**
- **Tooltip Delay:** 700ms hover delay before showing
- **Tooltip Content:** Keep to 1-2 lines, use `text-xs`
- **Popover Width:** Fixed width (`w-80`, `w-96`) for consistent sizing
- **Popover Position:** Prefer `align="start"` for better mobile experience
- **Bilingual:** Include both English/Arabic text in tooltips

### Loading States

**Skeleton Loader:**
```tsx
<Card className="p-6">
  <div className="space-y-4">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-20 w-full" />
  </div>
</Card>
```

**Spinner:**
```tsx
<Button disabled>
  <Loader2 className="me-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

**Loading Guidelines:**
- **Skeleton Screens:** Match the layout structure of loaded content
- **Spinners:** Use for button actions and inline operations
- **Progress Bars:** Show for file uploads, bulk operations
- **Shimmer Effect:** Add subtle animation to skeletons for better UX
- **Never block UI:** Use optimistic updates where possible

### Empty States

**Pattern:**
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <FileX className="w-16 h-16 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
    Get started by creating your first rental contract
  </p>
  <Button variant="default">
    <Plus className="w-4 h-4 me-2" />
    Create Contract
  </Button>
</div>
```

**Guidelines:**
- **Icon:** Large muted icon representing empty state
- **Message:** Clear explanation of why it's empty
- **Action:** Primary button to resolve the empty state
- **Illustration:** Optional - use simple line icons, not complex graphics

---

## 5. Interaction Patterns

### Hover & Active States

**Built-in Elevation System:**
- `hover-elevate`: Subtle background elevation on hover (3% opacity overlay)
- `active-elevate-2`: More dramatic elevation on press (8% opacity overlay)
- **Auto-applied to:** Buttons, Badges (no need to add manually)
- **Manual application:** Cards, custom clickable elements

**Example:**
```tsx
{/* Card with hover effect */}
<Card className="hover-elevate active-elevate-2 cursor-pointer">
  <CardContent>...</CardContent>
</Card>

{/* Button - already has elevation (don't add again) */}
<Button variant="outline">
  Click Me
</Button>

{/* Custom clickable div */}
<div className="p-4 rounded-md hover-elevate active-elevate-2 cursor-pointer">
  Custom Element
</div>
```

**Guidelines:**
- **Never add custom hover colors** - use elevation system
- **Cursor:** Add `cursor-pointer` for clickable non-button elements
- **Transitions:** Smooth transitions handled by Tailwind (200ms default)
- **Focus Rings:** Always visible with `ring-ring ring-2` for keyboard nav

### Focus States (Accessibility)

**Keyboard Navigation:**
- All interactive elements must show focus ring on keyboard focus
- Default: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Never use `outline-none` without providing alternative focus indicator

**Example:**
```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-primary">
  Accessible Button
</Button>
```

### Transitions & Animations

**Subtle Animations:**
- **Accordion:** `animate-accordion-down`, `animate-accordion-up`
- **Dialog Entry:** Fade-in with scale (built-in to Dialog component)
- **Hover Transitions:** 200ms ease-out for smooth interactions
- **Page Transitions:** Avoid - can feel sluggish in data-heavy app

**Guidelines:**
- **Reduced Motion:** Respect `prefers-reduced-motion` media query
- **Performance:** Avoid animating layout properties (use transform/opacity)
- **Duration:** Keep under 300ms to maintain snappy feel
- **Purpose:** Only animate to communicate state changes, not decoration

---

## 6. Responsive Design

### Breakpoints
```css
sm: 640px   /* Small tablets, large phones in landscape */
md: 768px   /* Tablets, small desktops */
lg: 1024px  /* Desktops, laptops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Mobile-First Approach
- **Default:** Design for mobile (320px-640px width)
- **Enhance:** Add complexity at larger breakpoints
- **Never:** Hide critical functionality on mobile

**Example:**
```tsx
{/* Mobile: Stack, Desktop: 4-column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard />
</div>

{/* Mobile: Full width, Desktop: 2-column */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <LeftPanel />
  <RightPanel />
</div>

{/* Mobile: Scrollable table */}
<div className="overflow-x-auto">
  <Table className="min-w-[800px]">
    {/* Table content */}
  </Table>
</div>
```

### Mobile Patterns
- **Navigation:** Collapsible sidebar with hamburger menu
- **Tables:** Horizontal scroll or card-based views on mobile
- **Forms:** Single column, large touch targets (min 44px height)
- **Dialogs:** Full-screen on mobile, centered on desktop
- **Action Buttons:** Fixed bottom bar for primary actions on mobile

---

## 7. Bilingual Support (English/Arabic)

### RTL/LTR Layout Switching

**Language Detection:**
```tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

useEffect(() => {
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = i18n.language;
}, [isRTL, i18n.language]);
```

**Logical Properties (CSS):**
```css
/* Always use logical properties */
padding-inline-start: ps-4    /* Not pl-4 */
padding-inline-end: pe-4      /* Not pr-4 */
margin-inline-start: ms-4     /* Not ml-4 */
margin-inline-end: me-4       /* Not mr-4 */
text-align: text-start        /* Not text-left */
text-align: text-end          /* Not text-right */
```

**Icon Mirroring:**
```tsx
{/* Directional icons flip in RTL */}
<ChevronRight className="w-4 h-4 rtl:rotate-180" />
<ArrowRight className="w-5 h-5 rtl:rotate-180" />
<ChevronLeft className="w-4 h-4 rtl:rotate-180" />
```

### Typography for Arabic

**Font Family:**
- English: Inter (set via `font-sans`)
- Arabic: Cairo (set via `font-arabic`)
- Auto-switching based on `i18n.language`

**Font Size Adjustments:**
```tsx
{/* Arabic text tends to render smaller - increase size slightly */}
<h1 className={cn(
  "text-3xl font-bold",
  isRTL && "text-4xl"
)}>
  {t('page.title')}
</h1>
```

**Line Height:**
- Arabic benefits from slightly more line-height: `leading-relaxed` (1.625)

### Translation Keys

**Naming Convention:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "contracts": {
    "title": "Contracts",
    "createNew": "Create New Contract",
    "list": {
      "customer": "Customer",
      "vehicle": "Vehicle",
      "status": "Status"
    }
  }
}
```

**Usage:**
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Button>{t('common.save')}</Button>
<h1>{t('contracts.title')}</h1>
```

### Date & Number Formatting

**Dates:**
```tsx
// English: MM/DD/YYYY
// Arabic: DD/MM/YYYY
const formattedDate = format(date, isRTL ? 'dd/MM/yyyy' : 'MM/dd/yyyy');
```

**Currency:**
```tsx
// English: AED 1,234.56
// Arabic: 1,234.56 د.إ
const formattedCurrency = isRTL 
  ? `${amount.toLocaleString('ar-AE')} د.إ`
  : `AED ${amount.toLocaleString('en-US')}`;
```

**Numbers:**
```tsx
// Use Arabic-Indic numerals in Arabic context
const formattedNumber = amount.toLocaleString(isRTL ? 'ar-AE' : 'en-US');
```

---

## 8. Data Visualization (Reports)

### Chart Components (Recharts)

**Line Chart (Trends):**
```tsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis 
      dataKey="month" 
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
    />
    <YAxis 
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
    />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="revenue" 
      stroke="hsl(var(--chart-1))" 
      strokeWidth={2}
      dot={{ fill: "hsl(var(--chart-1))" }}
    />
  </LineChart>
</ResponsiveContainer>
```

**Bar Chart (Comparisons):**
```tsx
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="location" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="vehicles" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
    <Bar dataKey="contracts" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Pie/Donut Chart (Distributions):**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}  // Donut chart
      outerRadius={100}
      paddingAngle={2}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### Chart Guidelines

**Color Palette:**
- Use semantic `chart-1` through `chart-5` colors
- Ensure sufficient contrast in dark mode
- Avoid red/green only combinations (colorblind-safe)

**Tooltips:**
- Custom tooltips with white background, border, shadow
- Show data point value with units (AED, %, units)
- Include formatted dates for time-series

**Responsive Heights:**
- KPI Charts: 200-300px
- Primary Charts: 400-500px
- Comparison Charts: 300-400px

**Accessibility:**
- Add ARIA labels to charts
- Provide data table alternative for screen readers
- Keyboard navigation support

**Export:**
- Include "Download as PNG" button using html2canvas
- Provide CSV export for underlying data

---

## 9. Accessibility (WCAG 2.1 AA)

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3, don't skip levels)
- Use `<button>` for clickable actions, `<a>` for navigation
- Use `<table>` with `<thead>`, `<tbody>`, `<th scope="col">` for data tables
- Use `<form>` elements with proper labels

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order (use `tabIndex` sparingly)
- Visible focus indicators (ring-2 ring-ring)
- Escape key closes dialogs/popovers
- Arrow keys navigate menus/dropdowns

### Screen Reader Support
- Add `aria-label` to icon-only buttons
- Use `aria-describedby` for form helper text
- Use `role="alert"` for error messages
- Provide `alt` text for all meaningful images
- Use `visually-hidden` class for screen-reader-only text

### Color Contrast
- Text: Minimum 4.5:1 ratio (WCAG AA)
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio against background
- Use tools like WebAIM Contrast Checker to verify

### Forms
- Always associate `<label>` with input (htmlFor/id)
- Provide clear error messages with form validation
- Use `aria-invalid` and `aria-describedby` for errors
- Group related fields with `<fieldset>` and `<legend>`

### Focus Management
- Auto-focus first field in dialogs
- Return focus to trigger element when dialog closes
- Skip links for keyboard users to bypass navigation
- Focus visible elements after route changes

---

## 10. Performance Optimization

### Image Optimization
- Use WebP format with JPEG fallback
- Lazy load images below the fold: `loading="lazy"`
- Provide width/height to prevent layout shift
- Use responsive images with `srcset` for different screen sizes

### Code Splitting
- Lazy load route components with React.lazy()
- Split large reports into separate chunks
- Defer non-critical JavaScript

### Rendering Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large lists (react-window)
- Debounce search inputs (300ms delay)
- Throttle scroll/resize handlers

### Bundle Size
- Tree-shake unused code
- Analyze bundle with `npm run build --report`
- Avoid importing entire icon libraries - use selective imports

### Caching
- Use TanStack Query for server state caching
- Implement stale-while-revalidate strategy
- Cache static assets with service workers (future enhancement)

---

## 11. Export Functionality

### PDF Export (Contracts, Reports)

**Use Case:** Official documents, contracts, invoices, formal reports

**Implementation:**
```tsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generatePDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Rental Contract', 105, 20, { align: 'center' });
  
  // Contract details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contract ID: ${contract.id}`, 20, 40);
  doc.text(`Date: ${format(contract.date, 'dd/MM/yyyy')}`, 20, 46);
  
  // Table
  autoTable(doc, {
    startY: 60,
    head: [['Description', 'Days', 'Rate', 'Amount']],
    body: [
      ['Daily Rental', '7', 'AED 150', 'AED 1,050'],
      ['Insurance', '7', 'AED 30', 'AED 210'],
    ],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [25, 165, 236] }, // Cyan-blue
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`contract-${contract.id}.pdf`);
};
```

**Guidelines:**
- **Company Branding:** Include logo, company name, contact details in header
- **Typography:** Use Helvetica (widely supported), 10-12pt for body, 8pt for footer
- **Colors:** Use brand colors sparingly (header, borders)
- **Tables:** Use autoTable for structured data with proper styling
- **Pagination:** Add page numbers for multi-page documents
- **Signatures:** Include signature fields for legal documents
- **Bilingual:** Generate separate PDFs for English/Arabic or side-by-side

### CSV Export (Data Analysis)

**Use Case:** Financial reports, customer lists, vehicle fleet data, data import/export

**Implementation:**
```tsx
import Papa from 'papaparse';

const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data, {
    quotes: true,
    delimiter: ',',
    header: true,
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Usage
const contractsData = contracts.map(c => ({
  'Contract ID': c.id,
  'Customer Name': c.customerName,
  'Vehicle Plate': c.vehiclePlate,
  'Start Date': format(c.startDate, 'yyyy-MM-dd'),
  'End Date': format(c.endDate, 'yyyy-MM-dd'),
  'Total Amount': c.totalAmount,
  'Status': c.status,
}));

exportToCSV(contractsData, 'contracts-export');
```

**Guidelines:**
- **Column Headers:** Use clear, descriptive column names
- **Date Format:** ISO 8601 (YYYY-MM-DD) for universal compatibility
- **Numbers:** No thousand separators, use decimal point for decimals
- **Text Encoding:** UTF-8 with BOM for Excel compatibility
- **Quotes:** Wrap all text fields in quotes to handle commas/newlines
- **Filename:** Include export date and descriptive name
- **Large Datasets:** Stream data for exports >10,000 rows

### Excel Export (Advanced Reports)

**Use Case:** Complex financial reports, multi-sheet workbooks, formatted reports

**Implementation:**
```tsx
import * as XLSX from 'xlsx';

const exportToExcel = () => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Contracts
  const contractsSheet = XLSX.utils.json_to_sheet(contracts);
  XLSX.utils.book_append_sheet(wb, contractsSheet, 'Contracts');
  
  // Sheet 2: Summary
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Contracts', contracts.length],
    ['Active Contracts', activeCount],
    ['Total Revenue', `AED ${totalRevenue.toLocaleString()}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  
  // Write file
  XLSX.writeFile(wb, `rccms-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
```

**Guidelines:**
- **Multiple Sheets:** Organize related data across sheets
- **Formatting:** Apply basic styles (bold headers, number formats)
- **Formulas:** Include Excel formulas for calculations where appropriate
- **Auto-width:** Set column widths based on content
- **Freeze Panes:** Freeze header row for easy scrolling

### Export Button Pattern

```tsx
<div className="flex items-center gap-2">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 me-2" />
        Export
        <ChevronDown className="w-4 h-4 ms-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={handleExportPDF}>
        <FileText className="w-4 h-4 me-2" />
        Export as PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExportCSV}>
        <Sheet className="w-4 h-4 me-2" />
        Export as CSV
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExportExcel}>
        <FileSpreadsheet className="w-4 h-4 me-2" />
        Export as Excel
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

---

## 12. Error Handling & Validation

### Form Validation

**Client-Side (Zod):**
```tsx
const contractSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  dailyRate: z.number().positive('Daily rate must be positive'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});
```

**Display Errors:**
```tsx
<FormField
  control={form.control}
  name="dailyRate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Daily Rate</FormLabel>
      <FormControl>
        <Input type="number" {...field} />
      </FormControl>
      <FormMessage />  {/* Auto-displays Zod error */}
    </FormItem>
  )}
/>
```

### API Error Handling

**Pattern:**
```tsx
const { mutate, isPending, isError, error } = useMutation({
  mutationFn: createContract,
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Contract created successfully',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
  },
  onError: (error: any) => {
    toast({
      title: 'Error',
      description: error.message || 'Failed to create contract',
      variant: 'destructive',
    });
  },
});
```

### Toast Notifications

**Success:**
```tsx
toast({
  title: 'Contract Created',
  description: `Contract #${contractId} has been created successfully`,
  duration: 5000,
});
```

**Error:**
```tsx
toast({
  title: 'Error',
  description: 'Failed to delete vehicle. It is currently in use.',
  variant: 'destructive',
  duration: 7000,
});
```

**Warning:**
```tsx
toast({
  title: 'Warning',
  description: 'Contract expires in 3 days',
  variant: 'default',
  className: 'bg-accent text-accent-foreground',
  duration: 10000,
});
```

**Guidelines:**
- **Duration:** Success 3-5s, Error 7-10s, Warning 10s
- **Action:** Include "Undo" button for reversible actions
- **Position:** Top-right corner (default)
- **Limit:** Max 3 toasts visible simultaneously

---

## 13. Security & Privacy

### Sensitive Data Display

**Masking:**
- Credit card numbers: `**** **** **** 1234`
- Phone numbers: `+971 ** *** 6789`
- Emirates ID: `784-****-*******-1`

**Audit Trails:**
- Show "Modified by [User] on [Date]" for critical records
- Include IP address and geolocation for login attempts
- Mask full audit logs - show only to admin users

### RBAC (Role-Based Access Control)

**Visual Indicators:**
- Disable buttons for unauthorized actions (with tooltip explaining why)
- Hide entire menu sections user cannot access
- Show "Requires Manager approval" badges on restricted features

**Permission Checks:**
```tsx
const canDeleteContract = user.role === 'admin' || user.role === 'manager';

<Button
  variant="destructive"
  disabled={!canDeleteContract}
  className={cn(!canDeleteContract && 'cursor-not-allowed opacity-50')}
>
  <Trash2 className="w-4 h-4 me-2" />
  Delete Contract
</Button>
```

---

## 14. Testing & Quality Assurance

### Visual Regression Testing
- Test all components in light and dark modes
- Test bilingual layouts (English LTR, Arabic RTL)
- Test responsive breakpoints (mobile, tablet, desktop)
- Verify hover/focus/active states render correctly

### Accessibility Testing
- Run automated tools (axe DevTools, Lighthouse)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)
- Color contrast validation

### Cross-Browser Testing
- Chrome (primary browser)
- Firefox
- Safari (macOS/iOS)
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 15. Future Enhancements

### Dark Mode Optimization
- Enhance dark mode colors for better OLED contrast
- Add auto-switching based on system preference
- Implement dark mode for PDF exports

### Mobile App Alignment
- Prepare components for React Native compatibility
- Design touch-optimized interfaces
- Mobile-first responsive patterns

### Performance
- Implement virtual scrolling for all large tables
- Add service worker for offline functionality
- Optimize bundle size with route-based code splitting

### Internationalization
- Add Hindi support for Indian market expansion
- Support for additional UAE languages (Urdu)
- Regional number formats (Indian lakh/crore notation)

---

## Summary: Design Checklist

Before releasing any new feature or page, verify:

- [ ] Uses semantic color tokens (`bg-card`, `text-foreground`, etc.)
- [ ] Consistent spacing (p-6 for cards, gap-4 for content)
- [ ] Proper typography scale and font weights
- [ ] Responsive layout (mobile-first, grid/flex)
- [ ] RTL/LTR support with logical properties
- [ ] Bilingual translations (English/Arabic)
- [ ] Accessible keyboard navigation and ARIA labels
- [ ] Proper loading and empty states
- [ ] Error handling with toast notifications
- [ ] Dark mode styling verified
- [ ] Export functionality (PDF/CSV where applicable)
- [ ] RBAC checks for sensitive actions
- [ ] All interactive elements have `data-testid` attributes
- [ ] Follows Material Design 3 principles

---

**End of Design Guidelines**  
_Maintained by RCCMS Product Team_  
_For questions or suggestions, contact: design@rccms.ae_
