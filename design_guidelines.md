# Design Guidelines: Rental Car Contract Management System

## Design Approach: Material Design 3
**Rationale**: Material Design 3 provides comprehensive support for RTL/LTR layouts, data-dense interfaces, and enterprise-grade components essential for this bilingual contract management platform. The system's focus on operational efficiency and data clarity makes Material's structured approach ideal.

## Core Design Principles
- **Data Transparency**: Quick-scan information hierarchy for multi-entity management (customers, vehicles, contracts)
- **Operational Speed**: Streamlined workflows for high-volume contract processing
- **Bilingual Excellence**: Seamless English/Arabic switching with flawless RTL/LTR implementations
- **Role Clarity**: Visual differentiation across Admin/Manager/Staff/Viewer permissions
- **Status Precision**: Instant recognition of contract lifecycle and payment states

---

## Color Palette

### Light Mode
- **Primary**: 199 89% 48% (Professional cyan-blue - trust and stability)
- **Primary Container**: 199 85% 92% (Subtle backgrounds for active states)
- **Secondary**: 260 8% 40% (Neutral slate for secondary actions)
- **Tertiary**: 45 100% 51% (Accent for CTAs and highlights)
- **Success**: 142 71% 45% (Payments received, contracts completed)
- **Warning**: 38 92% 50% (Pending payments, draft contracts)
- **Error**: 0 72% 51% (Overdue payments, validation errors)
- **Background**: 0 0% 99%
- **Surface**: 0 0% 100%
- **Surface Variant**: 220 13% 95% (Table headers, disabled fields)
- **Outline**: 220 9% 46% (Borders, dividers)

### Dark Mode
- **Primary**: 199 84% 65%
- **Background**: 220 15% 11%
- **Surface**: 220 14% 16%
- **Surface Variant**: 220 12% 22%
- **Outline**: 220 10% 40%

### Status Semantics
- **Contract Draft**: 38 92% 50% (Amber)
- **Contract Confirmed**: 207 90% 54% (Blue)
- **Contract Active**: 142 71% 45% (Green)
- **Contract Completed**: 260 8% 40% (Gray)
- **Contract Closed**: 220 9% 46% (Muted slate)
- **Payment Pending**: 38 92% 50% (Amber)
- **Payment Partial**: 45 100% 51% (Orange)
- **Payment Completed**: 142 71% 45% (Green)
- **Payment Overdue**: 0 72% 51% (Red)

---

## Typography

**Font Stack**:
- **Latin**: Inter (400, 500, 600, 700) - exceptional clarity for data tables
- **Arabic**: Cairo (400, 500, 600, 700) - professional pairing with Inter
- **Monospace**: Roboto Mono - contract IDs, license plates, VINs

**Hierarchy**:
- **Display**: 2.75rem/700 (Page headers, empty states)
- **Headline Large**: 2rem/600 (Dashboard sections, modal titles)
- **Headline Medium**: 1.75rem/600 (Card headers)
- **Title Large**: 1.375rem/500 (Table titles, section headers)
- **Body Large**: 1rem/400 (Form inputs, primary content)
- **Body Medium**: 0.875rem/400 (Table cells, descriptions)
- **Label Large**: 0.875rem/500 (Form labels, button text)
- **Label Small**: 0.75rem/500 (Helper text, badges, timestamps)

---

## Layout System

**Spacing Scale**: Tailwind units **2, 3, 4, 6, 8, 12, 16, 20** for consistent rhythm
- Cards: p-6, gap-4
- Sections: py-12, px-8
- Tables: px-4 py-3
- Modals: p-8
- Dashboard grid: gap-6

**Page Structure**:
- **Navigation**: Fixed top bar (h-16) + collapsible sidebar (w-64)
- **Main Content**: max-w-7xl mx-auto px-6 py-8
- **Dashboard Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Data Tables**: Full-width with horizontal scroll on mobile
- **Forms**: max-w-4xl, 2-column layout (lg:grid-cols-2 gap-6)

**Responsive Strategy**:
- Mobile: Bottom navigation, stacked cards, simplified tables
- Tablet (md:): Persistent sidebar, 2-column forms
- Desktop (lg:): Full layout with data density optimization

---

## Component Library

### Navigation
- **App Bar**: Logo, breadcrumbs, global search, language toggle (EN/AR flags), notification bell, user menu with role badge
- **Sidebar**: Collapsible with icons + labels (Dashboard, Customers, Vehicles, Contracts, Users, Settings, Audit Logs), active state highlighting
- **Tab Navigation**: Secondary navigation within pages (Contract Details: Overview, Timeline, Documents, Payments)

### Data Tables
- **Standard Table**: Striped rows, sticky headers, sortable columns, row selection checkboxes, inline actions menu
- **Column Types**: Text, numeric (right-aligned), date, status badge, avatar+name, action buttons
- **Pagination**: Bottom bar with rows-per-page selector (10/25/50/100)
- **Filters**: Top bar with quick filters (date range, status chips, search), advanced filter drawer
- **Empty States**: Centered illustration + helpful message + primary action

### Forms & Inputs
- **Text Fields**: Outlined Material style, floating labels, inline validation, helper text, required indicators
- **Selects**: Searchable dropdowns for customers/vehicles, multi-select for features
- **Date Inputs**: Material date picker with Hijri calendar support for Arabic
- **Number Fields**: Right-aligned, formatted (currency, mileage), increment/decrement buttons
- **File Upload**: Drag-drop zone with preview thumbnails, progress indicators
- **Rich Text**: Contract notes with basic formatting toolbar

### Status & Indicators
- **Contract Status Chips**: Rounded pills with icon prefix (Draft: edit, Confirmed: check_circle, Active: directions_car, Completed: task_alt, Closed: archive)
- **Payment Badges**: Distinctive shapes (Pending: warning triangle, Partial: info circle, Completed: success checkmark, Overdue: error exclamation)
- **Progress Bars**: Linear indicators for payment completion percentage
- **Avatars**: User profile images with role color borders (Admin: purple, Manager: cyan, Staff: blue)

### Cards & Widgets
- **Dashboard Stats**: Large metric, trend arrow, comparison text, mini sparkline graph
- **Entity Cards**: Customer/Vehicle cards with thumbnail, key details, quick actions
- **Timeline Items**: Vertical audit log with avatar, action description, timestamp, contract link
- **Quick Action Cards**: Icon, title, description, primary button (Create Contract, Add Customer)

### Modals & Overlays
- **Sheet Dialogs**: Side drawer for entity details (customer profile, vehicle info)
- **Confirmation Modals**: Centered dialog for critical actions (delete, finalize)
- **Full-Screen Modals**: Contract PDF preview, bulk import interface
- **Snackbars**: Bottom notification bar with undo option, 6-second auto-dismiss

### Specialized Components
- **Contract Number Badge**: Large, prominent, monospace with copy button
- **Bilingual Display**: Side-by-side fields with language labels, proper text direction
- **Payment Timeline**: Visual timeline showing payment schedule, received amounts, outstanding balance
- **Vehicle Availability Calendar**: Monthly grid showing rental periods, availability gaps
- **Customer Credit Indicator**: Gauge widget showing credit limit, utilization

---

## Dashboard Layout

**Top Section** (3-column grid):
- Active Contracts (count, +/- change)
- Revenue This Month (amount, trend chart)
- Vehicles Available (count, utilization %)

**Middle Section** (2-column):
- Recent Contracts (mini table: 5 rows, compact view)
- Pending Actions (list: payment follow-ups, expiring contracts)

**Bottom Section** (full-width):
- Revenue Chart (line graph, 12-month comparison)
- Top Customers/Vehicles (ranked lists with avatars/images)

---

## RTL/LTR Implementation

- **Automatic Flipping**: dir="rtl" triggers full layout mirror (sidebar right, icons reversed)
- **Text Alignment**: Arabic right-aligned, English left-aligned within same field
- **Preserved Elements**: Contract numbers, VINs, license plates remain LTR
- **Icon Mirroring**: Directional icons flip (chevrons, arrows), symbolic icons stay consistent (car, person)
- **Form Flow**: Tab order respects language direction

---

## Accessibility

- **Contrast**: WCAG AAA compliance (7:1 for text, 4.5:1 for UI elements)
- **Keyboard**: Full navigation, visible focus rings (2px primary outline), Esc to close
- **Screen Readers**: Descriptive ARIA labels, status announcements, table headers
- **Form Validation**: Real-time inline errors, required field markers, helpful suggestions
- **Dark Mode**: Consistent across all views, user preference respected

---

## Images & Assets

**Icons**: Material Symbols (Rounded variant) via CDN
- Navigation: dashboard, people, directions_car, description, admin_panel_settings, settings, history
- Actions: add, edit, delete, print, download, search, filter_list, more_vert
- Status: check_circle, schedule, warning, error, lock, visibility

**No Hero Images**: Productivity-first application. Dashboard uses data visualization and action cards. Entity pages lead with data tables and metrics.

**Entity Thumbnails**:
- Customer profiles: Avatar placeholder or uploaded photo
- Vehicle listings: Car photos (side profile, front-angle shots)
- Document previews: PDF/image thumbnails in attachment lists

---

## Interaction States

- **Hover**: Elevation increase (shadow-sm to shadow-md), slight background tint
- **Focus**: 2px solid primary outline, no background change
- **Active/Pressed**: Scale down (scale-98), deeper shadow
- **Disabled**: 38% opacity, cursor-not-allowed
- **Loading**: Skeleton screens (tables, cards), indeterminate progress (actions)
- **Success**: Brief green pulse on saves, checkmark animation
- **Error Shake**: Horizontal vibration on validation failure

---

## Performance & Polish

- **Skeleton Loading**: Show content structure before data loads
- **Optimistic Updates**: Instant UI feedback, rollback on error
- **Debounced Search**: 300ms delay on keystroke filtering
- **Virtual Scrolling**: For tables exceeding 100 rows
- **Lazy Loading**: Images and secondary data on viewport entry