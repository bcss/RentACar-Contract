# UI Redesign Notes - November 28, 2025

## Overview
This document tracks all UI/UX improvements made during the KarāraOS redesign based on the `ui_design_28_nov_2025` reference designs.

**Guiding Principle:** CHECKLIST IS LAW - Only visual/usability changes allowed, ZERO behavior modifications.

---

## Design System Reference

### Color Palette (from ui_design_28_nov_2025)

| Token | Light Mode | Dark Mode | HSL Value |
|-------|------------|-----------|-----------|
| Primary | #137fec | #137fec | 209 88% 51% |
| Background | #f6f7f8 | #101922 | Light: 210 10% 97%, Dark: 213 40% 10% |
| Surface | #ffffff | #1a2530 | Light: 0 0% 100%, Dark: 210 28% 15% |
| Border | #e5e7eb | #3b4754 | Light: 216 12% 91%, Dark: 210 19% 28% |
| Positive | #0bda5b | #0bda5b | 142 91% 45% |
| Negative | #fa6238 | #fa6238 | 11 95% 60% |
| Text Primary | #111827 | #ffffff | Light: 220 13% 12%, Dark: 0 0% 100% |
| Text Secondary | #6b7280 | #9dabb9 | Light: 220 9% 46%, Dark: 210 15% 67% |

### Typography
- Font Family: Inter (sans-serif)
- Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Base unit: 0.25rem (4px)
- Common values: 4px, 8px, 12px, 16px, 24px, 32px, 48px

### Border Radius
- Default: 0.25rem (4px)
- Large: 0.5rem (8px)
- XL: 0.75rem (12px)
- Full: 9999px (pill)

### Icons
- Material Symbols Outlined
- Default size: 24px
- Small: 20px

---

## Approved Usability Improvements

### DEV-001: Support Button Addition
- **Screen:** Global (all pages)
- **Location:** Bottom-left, near logged-in user details in sidebar footer
- **Behavior:** Opens help/support page (/settings/support)
- **Bilingual:** Yes (EN: "Support", AR: "الدعم")
- **Icon:** Headphones (lucide-react)
- **Responsive:** Shows text when sidebar expanded, icon-only when collapsed
- **Status:** COMPLETED - E2E tested in both expanded/collapsed states

### DEV-002: Sidebar Navigation Refinement
- **Screen:** Global navigation
- **What Reference Shows:** Left sidebar with icon + text, rounded active states
- **Checklist Requirement:** Navigation to all modules
- **Usability Improvement:** Better visual hierarchy, clearer active state indication
- **Implementation:** Visual only, all navigation items preserved
- **Status:** IN PROGRESS

### DEV-003: Page Header Standardization
- **Screen:** All list and detail pages
- **What Reference Shows:** Consistent header with title, subtitle, and action buttons
- **Checklist Requirement:** Page titles and primary actions
- **Usability Improvement:** Consistent layout reduces cognitive load
- **Implementation:** Shared PageHeader component styling
- **Status:** PENDING

### DEV-004: Filter Panel Design
- **Screen:** List screens (Contracts, Customers, Vehicles, etc.)
- **What Reference Shows:** Collapsible accordion filters in side panel
- **Checklist Requirement:** All filter fields as specified
- **Usability Improvement:** Better organization, cleaner interface
- **Implementation:** Visual styling only, all filters preserved
- **Status:** PENDING

### DEV-005: Data Table Improvements
- **Screen:** All list screens
- **What Reference Shows:** Clean tables with hover states, rounded containers
- **Checklist Requirement:** All columns as specified
- **Usability Improvement:** Better readability, clearer row distinction
- **Implementation:** Visual styling only, all columns preserved
- **Status:** PENDING

### DEV-006: Stats Card Design
- **Screen:** Dashboard, Reports
- **What Reference Shows:** Rounded-xl cards with clear hierarchy
- **Checklist Requirement:** All KPIs as specified
- **Usability Improvement:** Better visual separation, clearer data presentation
- **Implementation:** Visual styling only, all metrics preserved
- **Status:** PENDING

---

## Implementation Progress

### Phase 1: Design Tokens (COMPLETED)
- [x] Document color palette
- [x] Update index.css with new colors (primary: 209 88% 51%, positive/negative semantic colors)
- [x] Verify light/dark mode consistency (E2E tested)
- [x] Verify RTL/LTR support (inherits existing infrastructure)

### Phase 2: Global Shell (COMPLETED)
- [x] Add Support button to SidebarFooter (DEV-001)
- [x] Bilingual support: "Support" / "الدعم"
- [x] Responsive: icon-only when collapsed, text when expanded
- [x] E2E tested in both states

### Phase 3: Core Screens
- [ ] Dashboard
- [ ] Contracts list/detail
- [ ] Customers list/detail
- [ ] Vehicles list/detail
- [ ] Reservations

### Phase 4: Transactional Screens
- [ ] Contract forms
- [ ] Payment modals
- [ ] Inspection modals

### Phase 5: Secondary Screens
- [ ] Reports
- [ ] Settings
- [ ] Administration

---

## Validation Checklist

Before marking any screen complete:
- [ ] All required fields visible
- [ ] All actions accessible
- [ ] Light mode tested
- [ ] Dark mode tested
- [ ] RTL layout verified
- [ ] No behavior changes
- [ ] E2E test passes

---

## Notes

- All changes are visual/usability improvements only
- No fields added or removed
- No workflow logic changes
- No data structure modifications
- No permission changes
