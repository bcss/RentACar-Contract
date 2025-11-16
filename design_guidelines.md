# RCCMS Analytical Reports Design Guidelines

## Design Approach
**System:** Material Design 3 with dashboard-focused patterns
**Rationale:** Data-dense analytical interface requiring consistent MD3 components, optimized for information hierarchy and multi-directional reading patterns.

## Typography System
- **Headings:** Roboto Medium (Report titles: text-2xl, Section headers: text-lg, Card titles: text-base)
- **Body:** Roboto Regular (Data labels: text-sm, Table content: text-sm, Metrics: text-xs)
- **Numbers:** Roboto Mono (Consistent digit width for data alignment)
- **Hierarchy:** Bold weights for emphasis, regular for body, light for supporting text

## Layout Architecture
**Spacing Units:** Tailwind 4, 6, 8 for consistent rhythm (p-4, gap-6, mb-8)

**Dashboard Grid Structure:**
- Page Container: max-w-7xl with px-6 py-8
- KPI Row: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Chart Section: grid grid-cols-1 lg:grid-cols-2 gap-6
- Table Section: Full-width with horizontal scroll container
- Responsive Breakpoints: Mobile stack, tablet 2-column, desktop 4-column for KPIs

**RTL/LTR Considerations:**
- Use logical properties throughout (start/end instead of left/right)
- Mirror chart orientations for RTL
- Flip icon directions contextually
- Maintain consistent padding in both directions

## Component Library

**KPI Cards:**
- Elevated surface (MD3 elevation-1)
- Compact padding (p-6)
- Icon + Metric + Label + Trend indicator
- Trend arrows with percentage change
- 4-column grid on desktop, stack on mobile

**Chart Containers:**
- Surface background with subtle border
- Header with title + time period selector
- Chart area with 400px minimum height
- Legend positioned below chart
- Responsive aspect ratios (16:9 on desktop, 4:3 on mobile)

**Data Tables:**
- Fixed header row with sorting indicators
- Alternating row backgrounds for readability
- Sticky header on scroll
- Action column with icon buttons (aligned end for LTR, start for RTL)
- Pagination controls at bottom
- 10-15 rows per page default
- Row hover states with subtle elevation

**Filters & Controls:**
- Top bar with date range picker, export button, refresh button
- Dropdown filters aligned horizontally
- Search input with icon (magnifying glass)
- Clear all filters button
- Filter bar uses flex wrap for responsive behavior

**Chart Types (Recharts):**
- Line charts: Vehicle utilization trends, revenue over time
- Bar charts: Fleet distribution, location comparisons
- Pie/Donut charts: Status breakdowns, category percentages
- Area charts: Booking volumes, maintenance costs

## Report Page Patterns

**Standard Report Layout:**
1. Page Header (h-16): Title + breadcrumb + action buttons
2. Filter Bar (h-auto): Date pickers, dropdowns, search
3. KPI Row (h-32): 4 metric cards
4. Primary Chart Section (h-96): 2-column grid with main visualizations
5. Secondary Insights (h-64): Supporting charts or metrics
6. Data Table Section (h-auto): Detailed records with pagination

**Interaction States:**
- Chart tooltips: White surface, text-sm, show on hover
- Table rows: Subtle background change on hover, highlight on select
- Buttons: MD3 filled (primary actions), outlined (secondary), text (tertiary)
- Loading states: Skeleton screens matching component structure

## Theme Integration
- Surfaces: Use MD3 surface containers (surface-variant for cards)
- Borders: Subtle outlines (border-outline-variant)
- Elevation: Minimal use - level 1 for cards, level 2 for dropdowns
- Dark Mode: Ensure chart colors have sufficient contrast, adjust surface tones

## Accessibility
- All charts include ARIA labels describing data
- Table headers use proper th elements with scope
- Keyboard navigation for all interactive elements
- Focus indicators meet WCAG AA standards
- Color-blind safe palettes for chart series

## No Images Required
This is a data-focused dashboard interface. No hero images or marketing visuals needed. All visual interest comes from data visualization, component hierarchy, and Material Design elevation/surfaces.