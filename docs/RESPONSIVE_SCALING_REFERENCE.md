# Responsive Scaling Reference - KarāraOS

## Overview
This document defines the responsive scaling system for KarāraOS, ensuring UI elements proportionally scale across different screen resolutions while maintaining exact reference design ratios.

## Root Cause Fix (November 2025)
**Problem:** All UI elements including text were disproportionate to screen resolution across all screens.

**Root Cause:** The `@layer base` in `client/src/index.css` had `text-sm` applied to body, which shrunk all text globally to 14px instead of the standard 16px base.

**Solution:** 
1. Removed `text-sm` from body in `@layer base`
2. Implemented viewport-aware root font scaling using CSS `clamp()` with 1280px baseline
3. Added systematic spacing tokens for card sizing consistency
4. Redesigned dashboard cards with compact layout

## Viewport-Aware Root Font Scaling

### Reference Design Baseline
The reference UI designs (`ui_design_28_nov_2025/`) were created at **1280x800 resolution**. This is the baseline where all elements should display exactly as designed.

### The Formula (1280px Baseline)
```css
html {
  font-size: clamp(14px, calc(0.625vw + 8px), 20px);
}
```

### Computed Values by Viewport Width
| Viewport Width | Computed Font Size | Notes |
|----------------|-------------------|-------|
| 1024px | 14px | Minimum (clamped) |
| 1280px | **16px** | **Reference design baseline** |
| 1366px | ~16.5px | Common laptop resolution |
| 1600px | ~18px | Large laptop/small desktop |
| 1920px | 20px | Maximum (capped) |

### How It Works
- **Minimum (14px):** Ensures readability on smaller screens
- **Preferred (0.625vw + 8px):** Linear scaling with viewport width
- **Maximum (20px):** Caps scaling to prevent oversized elements on very large screens

### Mathematical Derivation
To achieve exact 16px at 1280px baseline:
- Formula: `font-size = 0.625vw + 8px`
- At 1280px: 0.625 × 12.8 + 8 = 8 + 8 = **16px** ✓
- At 1920px: 0.625 × 19.2 + 8 = 12 + 8 = **20px** ✓

## Spacing Tokens System (Compact Density)

### CSS Variables for Card Sizing
```css
:root {
  /* Compact sizing for dense layouts */
  --card-padding-xs: 0.375rem;   /* 6px at 16px base */
  --card-padding-sm: 0.5rem;     /* 8px at 16px base */
  --card-padding: 0.625rem;      /* 10px at 16px base */
  --card-padding-lg: 0.75rem;    /* 12px at 16px base */
  --dashboard-gap: 0.5rem;       /* 8px at 16px base */
  --section-gap: 0.625rem;       /* 10px at 16px base */
  --stack-gap-sm: 0.375rem;      /* 6px at 16px base */
}
```

### How Spacing Scales
Since spacing tokens use rem units, they automatically scale with the root font-size:
| Viewport | Root Font | --card-padding (0.625rem) | --dashboard-gap (0.5rem) |
|----------|-----------|---------------------------|--------------------------|
| 1280px | 16px | 10px | 8px |
| 1366px | 16.5px | ~10.3px | ~8.25px |
| 1920px | 20px | 12.5px | 10px |

## Dashboard Component Density

### Typography Scale
| Element | Class | Size at 1280px | Size at 1920px |
|---------|-------|----------------|----------------|
| Page Title | text-2xl | 24px | 30px |
| Card Title | text-sm | 14px | 17.5px |
| Metric Value | text-xl | 20px | 25px |
| Labels | text-xs | 12px | 15px |

### Card Padding
| Element | Padding | At 1280px | At 1920px |
|---------|---------|-----------|-----------|
| Card Content | p-3 | 12px | 15px |
| Card Header | py-2 px-3 | 8px/12px | 10px/15px |
| List Items | p-2 | 8px | 10px |
| Status Boxes | p-2.5 | 10px | 12.5px |

## Why This Approach

### Benefits
1. **Reference Design Fidelity:** At 1280px viewport, displays exactly as designed (16px base)
2. **Proportional Scaling:** All rem-based Tailwind classes scale together
3. **No Per-Component Overrides:** Sidebar, cards, forms all scale automatically
4. **Smooth Transitions:** No jarring breakpoint-based jumps
5. **Compact Card Layouts:** Reduced padding and typography for denser information display

### Design Decision
The dashboard cards are designed with compact styling to maximize information density:
- Card padding uses p-3 (12px at baseline)
- Typography reduced (text-xl for values, text-xs for labels)
- Gaps reduced (gap-2 for card grids)
- Status breakdown cards use p-2.5 with text-lg values

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
- `client/src/pages/Dashboard.tsx` - Compact page layout
- `client/src/components/DashboardMetricCard.tsx` - Compact metric cards
- `client/src/pages/dashboard/MyDayTab.tsx` - Compact card layouts
- `tailwind.config.ts` - Fluid utility definitions (for exceptional use only)
- `client/src/contexts/LanguageContext.tsx` - RTL/LTR direction handling
- `client/src/App.tsx` - Sidebar side based on language

## Testing Checklist
When modifying responsive behavior, verify at:
- [ ] 1280×800 (reference design) - Exact match to design templates
- [ ] 1366×768 (15.6" laptop) - Slightly scaled up
- [ ] 1920×1080 (full HD desktop) - Maximum scaling (20px base)

Check that:
- [ ] Title proportions match reference design at 1280px
- [ ] Stats cards have compact padding/text size
- [ ] Sidebar text is readable and properly sized
- [ ] All interactive elements are appropriately sized (≥44px touch targets)
- [ ] RTL/LTR switching moves sidebar and adjusts text direction
- [ ] Dashboard cards are compact without wasted space

## Related Documents
- Reference Design Templates: `ui_design_28_nov_2025/`
- Design Guidelines: `design_guidelines.md`
