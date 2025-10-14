# Design Guidelines: Rental Car Contract Management System

## Design Approach: Material Design System
**Rationale**: Material Design provides robust support for RTL/LTR layouts, comprehensive form components, data tables, and role-based UI patterns essential for this productivity-focused contract management system.

## Core Design Principles
- **Data Clarity**: Information hierarchy prioritizes contract data visibility and quick scanning
- **Operational Efficiency**: Minimize clicks and cognitive load for repetitive contract creation tasks
- **Bilingual Consistency**: Seamless English/Arabic switching with proper RTL/LTR layouts
- **Role-Based UI**: Visual differentiation between Admin, Manager, Staff, and Viewer permissions
- **Status Transparency**: Clear visual indicators for Draft vs Finalized contracts

---

## Color Palette

### Light Mode
- **Primary**: 25 65% 47% (Professional teal-blue for contract actions)
- **Primary Variant**: 25 70% 37% (Darker shade for hover states)
- **Secondary**: 200 18% 46% (Neutral slate for secondary actions)
- **Success**: 142 76% 36% (Contract finalized, actions completed)
- **Warning**: 38 92% 50% (Pending actions, draft status)
- **Error**: 0 84% 60% (Permission errors, validation issues)
- **Background**: 0 0% 98% (Clean canvas for dense information)
- **Surface**: 0 0% 100% (Cards, modals, elevated elements)
- **Surface Variant**: 220 14% 96% (Table headers, inactive sections)

### Dark Mode
- **Primary**: 25 80% 55% (Brighter for visibility on dark)
- **Background**: 220 13% 13% (Deep neutral for extended use)
- **Surface**: 220 13% 18% (Card elevation on dark)
- **Surface Variant**: 220 12% 24% (Subtle differentiation)

### Semantic Colors
- **Draft Status**: 45 93% 47% (Amber - work in progress)
- **Finalized Status**: 142 76% 36% (Green - locked/complete)
- **Admin Badge**: 271 81% 56% (Purple - highest privilege)
- **Manager Badge**: 25 65% 47% (Primary - mid-level access)
- **Audit Log**: 200 18% 46% (Slate - historical records)

---

## Typography

**Font Families**:
- **Primary (Latin)**: Inter (Google Fonts) - clean, highly legible for forms and data
- **Arabic**: Cairo (Google Fonts) - excellent readability, pairs well with Inter
- **Monospace**: JetBrains Mono (for contract numbers, IDs, timestamps)

**Type Scale**:
- **Display**: 2.5rem / 600 weight (Dashboard headers, page titles)
- **Heading 1**: 2rem / 600 (Section titles, modal headers)
- **Heading 2**: 1.5rem / 600 (Card titles, sub-sections)
- **Heading 3**: 1.25rem / 500 (Table headers, form section labels)
- **Body Large**: 1rem / 400 (Primary content, form inputs)
- **Body**: 0.875rem / 400 (Table data, secondary text)
- **Caption**: 0.75rem / 400 (Helper text, timestamps, metadata)
- **Label**: 0.875rem / 500 (Form labels, button text)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Form spacing: gap-4, p-6 for cards
- Section spacing: py-8, px-6 for main content areas
- Table spacing: px-4, py-3 for cells
- Modal spacing: p-8 for dialogs

**Grid Structure**:
- **Dashboard Layout**: 12-column grid (sidebar: col-span-2, main: col-span-10)
- **Contract Form**: 6-column grid for bilingual alignment (3 cols per language)
- **Table Views**: Full-width responsive tables with horizontal scroll on mobile
- **Max Widths**: max-w-7xl for main content, max-w-4xl for forms

**Responsive Breakpoints**:
- Mobile: Single column, stacked forms, bottom navigation
- Tablet (md:): 2-column forms, persistent sidebar
- Desktop (lg:): Full layout with fixed sidebar, 2-3 column forms

---

## Component Library

### Navigation
- **Top Bar**: Logo, language toggle (EN/AR with flag icons), user profile with role badge, notifications bell
- **Sidebar**: Persistent left navigation with icons + labels, role-based menu items (Contracts, Users [Admin], Logs [Admin], Settings)
- **Breadcrumbs**: Below top bar showing navigation path (Home > Contracts > Contract #15523)

### Forms & Inputs
- **Text Inputs**: Outlined style with floating labels, proper RTL/LTR text alignment
- **Select Dropdowns**: Material-style with search for long lists (customer selection)
- **Date Pickers**: Calendar widget with hijri/gregorian support for Arabic users
- **Number Inputs**: Right-aligned for contract numbers with monospace font
- **Textarea**: Auto-expanding for notes/comments sections
- **File Upload**: Drag-drop zone for contract attachments

### Data Display
- **Contract Table**: Striped rows, sticky header, sortable columns (ID, Customer, Date, Status, Actions)
- **Status Badges**: Pill-shaped with icon (Draft: amber with edit icon, Finalized: green with lock icon)
- **Contract Cards**: Alternative view with thumbnail preview, key details, action buttons
- **Audit Log Timeline**: Vertical timeline with user avatar, action type, timestamp, contract reference
- **Stats Cards**: Dashboard KPIs (Total Contracts, Active Rentals, Drafts Pending) with trend indicators

### Actions & Feedback
- **Primary Button**: Filled with primary color (Create Contract, Finalize, Save)
- **Secondary Button**: Outlined style (Cancel, Back, View Details)
- **Icon Buttons**: For table actions (Edit, Print, Delete) with tooltips
- **FAB (Floating Action Button)**: Bottom-right for "New Contract" on mobile
- **Snackbar Notifications**: Bottom-center for success/error messages with undo option
- **Loading States**: Skeleton screens for tables, spinner for actions, progress bar for PDF generation

### Modals & Overlays
- **Contract Preview Modal**: Full-screen overlay showing print layout before generation
- **Confirmation Dialogs**: Center modal for critical actions (Finalize Contract, Delete)
- **User Management Drawer**: Right slide-in panel for editing user roles
- **Search Overlay**: Full-width dropdown from top bar with filters (date range, status, user)

### Contract-Specific Components
- **Contract Number Display**: Large, monospace, with copy-to-clipboard icon
- **Bilingual Field Display**: Side-by-side English/Arabic fields with clear visual separation
- **Print Template Preview**: Exact PDF replica with data overlay visualization
- **Signature Pad**: Canvas element for digital signatures (future enhancement)
- **Lock Icon Overlay**: Watermark-style indicator on finalized contracts

---

## Interactions & States

- **Hover States**: Subtle elevation increase (shadow-md to shadow-lg), primary color tint on interactive elements
- **Focus States**: 2px outline in primary color for keyboard navigation accessibility
- **Disabled States**: 40% opacity, cursor-not-allowed for finalized contract edit buttons
- **Active States**: Slight scale down (scale-98) for button press feedback
- **Loading States**: Indeterminate progress indicators, skeleton screens for data tables

---

## RTL/LTR Support

- **Layout Mirroring**: Automatic flip for sidebar, form alignment, table actions using dir="rtl" attribute
- **Text Alignment**: text-right for Arabic, text-left for English
- **Icon Positioning**: Mirror directional icons (arrows, chevrons) in RTL mode
- **Form Flow**: Right-to-left tab order in Arabic forms
- **Number Display**: Keep contract numbers LTR even in Arabic mode (15523 not 32551)

---

## Accessibility

- **WCAG AA Compliance**: Minimum 4.5:1 contrast for text, 3:1 for UI components
- **Keyboard Navigation**: Full tab order, Enter/Space for actions, Esc to close modals
- **Screen Reader**: ARIA labels for all actions, role announcements for status changes
- **Form Validation**: Inline error messages, required field indicators, helpful error text
- **Dark Mode**: Consistent implementation across all views including forms and tables

---

## Images & Assets

**Icons**: Material Icons via CDN for consistency with design system
- Contract: description icon
- User roles: admin_panel_settings, supervisor_account, person
- Actions: edit, lock, print, delete, save, search
- Status: check_circle, schedule, warning

**No Hero Images**: This is a productivity application focused on functionality over visual appeal. Dashboard uses data cards and quick actions instead of hero imagery.