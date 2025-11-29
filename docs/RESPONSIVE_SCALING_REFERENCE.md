# Responsive Scaling Reference - KarāraOS

## Overview
This document defines the responsive scaling system for KarāraOS, achieving 20% overall size reduction while maintaining proportional scaling across different screen resolutions.

## Design Baseline
**Reference designs:** `ui_design_28_nov_2025/` created at **1280x800 resolution**

The scaling system achieves 20% size reduction at the reference resolution while proportionally scaling for larger screens.

## Viewport-Aware Root Font Scaling

### The Formula (20% Reduction)
```css
html {
  font-size: clamp(12px, calc(0.734vw + 3.4px), 17.5px);
}
```

### Computed Values by Viewport Width
| Viewport Width | Computed Font Size | Notes |
|----------------|-------------------|-------|
| 1024px | 12px | Minimum (clamped for readability) |
| **1280px** | **12.8px** | **20% reduction from 16px baseline** |
| 1366px | ~13.4px | Common laptop resolution |
| 1600px | ~15.1px | Large laptop/small desktop |
| 1920px | ~17.5px | Maximum (capped) |

### Mathematical Derivation
To achieve 12.8px (20% reduction from 16px) at 1280px:
- Formula: `font-size = 0.734vw + 3.4px`
- At 1280px: 0.734 × 12.8 + 3.4 = 9.4 + 3.4 = **12.8px** ✓
- At 1920px: 0.734 × 19.2 + 3.4 = 14.09 + 3.4 = **17.5px** ✓

## How Scaling Works

### All Elements Scale Together
Since the root font-size uses the clamp formula, and all Tailwind classes use rem units:
- `text-sm` (0.875rem) = ~11.2px at 1280px, ~15.3px at 1920px
- `text-base` (1rem) = 12.8px at 1280px, 17.5px at 1920px
- `p-4` (1rem) = 12.8px at 1280px, 17.5px at 1920px
- `gap-3` (0.75rem) = ~9.6px at 1280px, ~13.1px at 1920px

### Components Affected
All UI elements using rem-based Tailwind classes scale automatically:
- Typography (text-xs, text-sm, text-base, text-lg, etc.)
- Spacing (p-*, m-*, gap-*)
- Sizing (h-*, w-* when using rem values)
- Sidebar menu items
- Form inputs and buttons
- Dashboard cards and metrics

## Material Symbols Icons

Icons inherit font-size from their component's Tailwind text-* classes:

| Size Prop | Tailwind Class | Size at 1280px | Size at 1920px |
|-----------|---------------|----------------|----------------|
| xs | text-sm | ~11.2px | ~15.3px |
| sm | text-base | 12.8px | 17.5px |
| md | text-lg | ~14.4px | ~19.7px |
| lg | text-xl | ~16px | ~21.9px |
| xl | text-2xl | ~19.2px | ~26.3px |

## Dashboard Component Density

### Typography Scale
| Element | Class | Size at 1280px |
|---------|-------|----------------|
| Page Title | text-2xl | ~19.2px |
| Card Title | text-xs | ~9.6px |
| Metric Value | text-xl | ~16px |
| Labels | text-xs | ~9.6px |

### Card Padding
| Element | Padding Class | At 1280px |
|---------|--------------|-----------|
| Card Content | p-3 | ~9.6px |
| Card Header | py-2 px-3 | ~6.4px / ~9.6px |
| Status Boxes | p-2.5 | ~8px |

## Files Affected

### Core Scaling
- `client/src/index.css` - Root font-size clamp rule

### Icon System
- `client/src/index.css` - Material symbols base styles (no fixed font-size)
- `client/src/components/MaterialSymbol.tsx` - Size variants via Tailwind classes

### Dashboard
- `client/src/pages/Dashboard.tsx` - Compact page layout
- `client/src/components/DashboardMetricCard.tsx` - Compact metric cards
- `client/src/pages/dashboard/MyDayTab.tsx` - Compact card layouts

## Testing Checklist

When modifying responsive behavior, verify at:
- [ ] 1280×800 (reference design) - 20% reduction applied
- [ ] 1366×768 (15.6" laptop) - Proportionally scaled
- [ ] 1920×1080 (full HD desktop) - Maximum scaling applied

Check that:
- [ ] Sidebar menu text and icons are properly sized
- [ ] Dashboard cards are compact without wasted space
- [ ] Contracts list page maintains consistent sizing
- [ ] All interactive elements remain usable (≥32px touch targets at 1280px)
- [ ] RTL/LTR switching works correctly

## Common Issues

### Problem: Elements too big
**Cause:** Fixed pixel values (24px, 16px) instead of rem
**Fix:** Use Tailwind classes or rem values that scale with root font

### Problem: Inconsistent sizing across pages
**Cause:** Some components use fixed values while others use rem
**Fix:** Ensure all components use Tailwind rem-based classes

### Problem: Icons not scaling
**Cause:** CSS override with fixed font-size
**Fix:** Remove fixed font-size from .material-symbols-outlined
