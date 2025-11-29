# Responsive Scaling Reference - KarāraOS

## Overview
This document defines the responsive scaling system for KarāraOS, ensuring UI elements proportionally scale across different screen resolutions while maintaining exact reference design ratios.

## Root Cause Fix (November 2025)
**Problem:** All UI elements including text were disproportionate to screen resolution across all screens.

**Root Cause:** The `@layer base` in `client/src/index.css` had `text-sm` applied to body, which shrunk all text globally to 14px instead of the standard 16px base.

**Solution:** 
1. Removed `text-sm` from body in `@layer base`
2. Implemented viewport-aware root font scaling using CSS `clamp()`
3. Added systematic spacing tokens for card sizing consistency

## Viewport-Aware Root Font Scaling

### The Formula
```css
html {
  font-size: clamp(13.8px, 0.684vw + 5.1px, 17.5px);
}
```

### Computed Values by Viewport Width
| Viewport Width | Computed Font Size | Reduction from 16px |
|----------------|-------------------|---------------------|
| 1366px | ~14.4px | ~10% smaller |
| 1440px | ~15.0px | ~6% smaller |
| 1536px | ~15.6px | ~3% smaller |
| 1600px | ~16px | **Reference design baseline** |
| 1920px | ~17.5px | Maximum |

### How It Works
- **Minimum (13.8px):** Prevents text from becoming too small on narrow viewports
- **Preferred (0.684vw + 5.1px):** Linear scaling with viewport width
- **Maximum (17.5px):** Caps scaling to prevent oversized elements on very large screens

### Mathematical Derivation
To achieve ~10% reduction at 1366px while maintaining 16px at 1600px:
- At 1366px: font-size = 0.684 × 13.66 + 5.1 = 14.45px (~10% smaller than 16px)
- At 1600px: font-size = 0.684 × 16.00 + 5.1 = 16.04px (~baseline)

## Spacing Tokens System

### CSS Variables for Card Sizing
```css
:root {
  /* Compact sizing for responsive scaling - scales with root font-size */
  --card-padding-sm: 0.5rem;   /* 8px at 16px base */
  --card-padding: 0.75rem;     /* 12px at 16px base - compact for all screens */
  --card-padding-lg: 1rem;     /* 16px at 16px base */
  --dashboard-gap-sm: 0.5rem;  /* 8px at 16px base */
  --dashboard-gap: 0.75rem;    /* 12px at 16px base */
  --dashboard-gap-lg: 1rem;    /* 16px at 16px base */
}
```

### How Spacing Scales
Since spacing tokens use rem units, they automatically scale with the root font-size:
| Viewport | Root Font | --card-padding (0.75rem) | --dashboard-gap (0.75rem) |
|----------|-----------|-------------------------|---------------------------|
| 1366px | 14.4px | ~10.8px | ~10.8px |
| 1600px | 16px | ~12px | ~12px |
| 1920px | 17.5px | ~13.1px | ~13.1px |

### Usage
- Dashboard cards use `p-4` (compact Tailwind class) with responsive text sizing
- Metric cards use `text-2xl` instead of `text-3xl` for values
- Section gaps use `gap-3` instead of `gap-6` for compact layout

## Why This Approach

### Benefits
1. **Reference Design Fidelity:** At 1600px viewport, displays exactly as designed (16px base)
2. **Proportional Scaling:** All rem-based Tailwind classes (text-4xl, p-6, etc.) scale together
3. **No Per-Component Overrides:** Sidebar, cards, forms all scale automatically
4. **Smooth Transitions:** No jarring breakpoint-based jumps
5. **Consistent Card Sizing:** Spacing tokens ensure uniform padding/gaps across all cards

### Design Decision
The reference design templates (`ui_design_28_nov_2025/`) use fixed Tailwind classes:
- Page title: `text-4xl` (36px at 16px base)
- Subtitle: `text-base` (16px at 16px base)
- Stats values: `text-2xl` (24px at 16px base) - reduced from text-3xl
- Menu items: `text-sm` (14px at 16px base)
- Card padding: `p-4` (16px at 16px base) - reduced from p-6

By scaling the root font-size, these exact ratios are preserved while adapting to screen size.

## Fluid Typography Utilities (Reserved for Special Use)

Tailwind config includes fluid typography utilities for exceptional cases:
- `text-fluid-xs` through `text-fluid-5xl`
- `p-fluid-1` through `p-fluid-12`
- `gap-fluid-1` through `gap-fluid-12`

**Usage Guidelines:**
- **DO NOT USE** on core screens (Dashboard, forms, reports, sidebar)
- **MAY USE** for hero sections, marketing pages, or special layouts
- Core screens should use standard Tailwind classes to maintain reference design fidelity

## RTL/LTR Support

The application supports full RTL/LTR direction switching:
- `LanguageContext` sets `document.documentElement.dir` to 'rtl' or 'ltr'
- Sidebar automatically switches sides (left for LTR, right for RTL)
- Font family switches between Cairo (Arabic) and Inter (English)
- All Tailwind flex/grid layouts adapt automatically via CSS logical properties

## Files Affected
- `client/src/index.css` - Root font-size clamp rule and spacing tokens
- `tailwind.config.ts` - Fluid utility definitions (for exceptional use only)
- `client/src/contexts/LanguageContext.tsx` - RTL/LTR direction handling
- `client/src/App.tsx` - Sidebar side based on language

## Testing Checklist
When modifying responsive behavior, verify at:
- [ ] 1366×768 (15.6" laptop) - ~10% smaller elements
- [ ] 1600×900 (design baseline) - Exact reference design match
- [ ] 1920×1080 (full HD desktop) - Maximum scaling

Check that:
- [ ] Title proportions match reference design
- [ ] Stats cards have proper padding/text size
- [ ] Sidebar text is readable and properly sized
- [ ] All interactive elements are appropriately sized
- [ ] RTL/LTR switching moves sidebar and adjusts text direction

## Related Documents
- Reference Design Templates: `ui_design_28_nov_2025/`
- Design Guidelines: `design_guidelines.md`
