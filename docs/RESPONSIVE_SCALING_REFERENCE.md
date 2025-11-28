# Responsive Scaling Reference - KarāraOS

## Overview
This document defines the responsive scaling system for KarāraOS, ensuring UI elements proportionally scale across different screen resolutions while maintaining exact reference design ratios.

## Root Cause Fix (November 2025)
**Problem:** All UI elements including text were disproportionate to screen resolution across all screens.

**Root Cause:** The `@layer base` in `client/src/index.css` had `text-sm` applied to body, which shrunk all text globally to 14px instead of the standard 16px base.

**Solution:** 
1. Removed `text-sm` from body in `@layer base`
2. Implemented viewport-aware root font scaling using CSS `clamp()`

## Viewport-Aware Root Font Scaling

### The Formula
```css
html {
  font-size: clamp(14.8px, 0.46875vw + 8.5px, 17.5px);
}
```

### Computed Values by Viewport Width
| Viewport Width | Computed Font Size | Description |
|----------------|-------------------|-------------|
| 1366px | ~14.9px | Compact for smaller laptop screens |
| 1440px | ~15.2px | Standard laptop |
| 1536px | ~15.7px | Between laptop and desktop |
| 1600px | ~16px | **Reference design baseline** |
| 1920px | ~17.5px | Maximum - large desktop screens |

### How It Works
- **Minimum (14.8px):** Prevents text from becoming too small on narrow viewports
- **Preferred (0.46875vw + 8.5px):** Linear scaling with viewport width
- **Maximum (17.5px):** Caps scaling to prevent oversized elements on very large screens

## Why This Approach

### Benefits
1. **Reference Design Fidelity:** At 1600px viewport, displays exactly as designed (16px base)
2. **Proportional Scaling:** All rem-based Tailwind classes (text-4xl, p-6, etc.) scale together
3. **No Per-Component Overrides:** Sidebar, cards, forms all scale automatically
4. **Smooth Transitions:** No jarring breakpoint-based jumps

### Design Decision
The reference design templates (`ui_design_28_nov_2025/`) use fixed Tailwind classes:
- Page title: `text-4xl` (36px at 16px base)
- Subtitle: `text-base` (16px at 16px base)
- Stats values: `text-3xl` (30px at 16px base)
- Menu items: `text-sm` (14px at 16px base)
- Card padding: `p-6` (24px at 16px base)

By scaling the root font-size, these exact ratios are preserved while adapting to screen size.

## Fluid Typography Utilities (Optional Use)

Tailwind config includes fluid typography utilities for exceptional cases:
- `text-fluid-xs` through `text-fluid-5xl`
- `p-fluid-1` through `p-fluid-12`
- `gap-fluid-1` through `gap-fluid-12`

**Usage Guidelines:**
- **DO NOT USE** on core screens (Dashboard, forms, reports, sidebar)
- **MAY USE** for hero sections, marketing pages, or special layouts
- Core screens should use standard Tailwind classes to maintain reference design fidelity

## Files Affected
- `client/src/index.css` - Root font-size clamp rule
- `tailwind.config.ts` - Fluid utility definitions (for exceptional use only)
- `client/index.html` - Base HTML (no changes needed)

## Testing Checklist
When modifying responsive behavior, verify at:
- [ ] 1366×768 (15.6" laptop)
- [ ] 1600×900 (design baseline)
- [ ] 1920×1080 (full HD desktop)

Check that:
- [ ] Title proportions match reference design
- [ ] Stats cards have proper padding/text size
- [ ] Sidebar text is readable and properly sized
- [ ] All interactive elements are appropriately sized

## Related Documents
- Reference Design Templates: `ui_design_28_nov_2025/`
- Design Guidelines: `design_guidelines.md`
