---
name: Go Live Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4e45d5'
  on-secondary: '#ffffff'
  secondary-container: '#6860ef'
  on-secondary-container: '#fffbff'
  tertiary: '#434853'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b606b'
  on-tertiary-container: '#d7dbe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#372abf'
  tertiary-fixed: '#dee2ef'
  tertiary-fixed-dim: '#c2c6d3'
  on-tertiary-fixed: '#171c25'
  on-tertiary-fixed-variant: '#424751'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  page-bg: '#F8FAFC'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  border-strong: '#CBD5E1'
  status-success: '#10B981'
  status-success-bg: '#ECFDF5'
  status-failed: '#F43F5E'
  status-failed-bg: '#FFF1F2'
  status-warning: '#F59E0B'
  status-warning-bg: '#FEF3C7'
  status-info: '#0284C7'
  status-info-bg: '#F0F9FF'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  metric-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-num:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system establishes an ultra-refined, professional, and dense administrative atmosphere tailored for internal operations of an AI presentation and design generation platform. The aesthetic is anchored in **Corporate / Modern** minimalism with high-density data organization, crisp linear framing, and utilitarian clarity.

The target audience consists of internal operators, product managers, support engineers, and billing administrators who require split-second parsing of usage analytics, generation job states, user accounts, and financial metrics. The visual tone must evoke absolute reliability, structural discipline, and modern engineering precision. Every screen balances breathable white data containers against an ultra-light slate foundation, avoiding visual fatigue during extended operational workflows.

## Colors

The palette is engineered around high functional contrast, clear typographic hierarchy, and semantic operational feedback:

- **Canvas & Surfaces**: The base application background uses an ultra-clean cool slate (`#F8FAFC`), while cards, data tables, and floating overlays leverage stark white (`#FFFFFF`) to establish crisp structural separation without heavy dark modes.
- **Brand & Action**: The primary action axis utilizes electric Indigo (`#4F46E5`), darkening to `#4338CA` on interactive states, paired with an ethereal indigo wash (`#EEF2FF`) for subtle selections, active navigation segments, and high-priority chip backgrounds.
- **Structural Dividing**: Borders rely on a dual-tier system: `#E2E8F0` for interior dividers, table rows, and secondary cards, and `#CBD5E1` for active form boundaries, tabs, and component edges.
- **Operational Status**: Strict tri-state color mappings govern runtime observability:
  - **OK / Active**: Emerald Green (`#10B981`) over `#ECFDF5`.
  - **Failed / Critical**: Rose Red (`#F43F5E`) over `#FFF1F2`.
  - **Stopped / Degraded / Pending**: Amber Yellow (`#F59E0B`) over `#FEF3C7`.
- **Neutral Hierarchy**: Slate (`#64748B`) anchors secondary descriptions and table headers, while `#0F172A` delivers high-contrast legibility for primary values, metrics, and labels.

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for structural headlines, titles, and high-impact metric counters with **Inter** for dense UI controls, tables, inputs, and systemic metadata.

### Numeric & Currency Styling
- Administrative screens require strict monospaced alignment for transactional records, slide generation counts, and multi-currency ledgers.
- All numbers within tables, charts, and metrics must enforce `font-feature-settings: 'tnum' 1, 'cv05' 1`.
- Currencies must adhere to localized standard conventions:
  - Indian Rupee: `₹#,##,###.##` (e.g., `₹12,40,500.00`)
  - US Dollar: `$#,###,###.##` (e.g., `$15,400.00`)
- Currency symbols precede the numeric value with zero whitespace (`₹150`, `$12.50`).

## Layout & Spacing

The layout is built on a 12-column fluid responsive grid anchored by a persistent collapsible lateral navigation panel (default width: 260px; collapsed: 72px) and a fixed top bar (height: 64px).

### Grid & Breakpoints
- **Desktop (>= 1280px)**: 12-column layout with 24px (`gutter-lg`) gutters and 32px (`margin-lg`) canvas padding. Optimized for 4-column metric cards, Recharts time-series dashboards, and full-width data tables.
- **Tablet (768px - 1279px)**: 8-column layout with 16px (`gutter`) gutters and 24px (`margin`) outer padding. Metric cards wrap to 2 columns; data grids gain horizontal scroll locks.
- **Mobile (< 768px)**: 4-column layout with 16px margins; navigation transitions to an off-canvas drawer.

### Rhythmic Discipline
Interior component margins follow an 8pt base grid with 4pt subdivisions. Data density must remain compact: table rows use 44px compact heights or 56px detailed heights; metric cards maintain 16px–20px internal padding.

## Elevation & Depth

Visual hierarchy uses a refined ambient shadow system layered over crisp 1px borders. Surfaces do not rely on aggressive drop shadows; instead, subtle lighting and border contours convey depth.

- **Level 0 (Flat Canvas)**: `#F8FAFC` base page background without elevation.
- **Level 1 (Card / Table Container)**: Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hover / Active Cards / Dropdowns)**: Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals / Slide Drawers / Popovers)**: Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design uses a clean geometry (`roundedness: 2`, 8px base radius) paired with dedicated full-pill radiuses for status tags and interactive badges.

- **Standard Elements (Cards, Panels, Inputs, Modals)**: `0.5rem` (8px) corner radius.
- **Buttons & Icon Wrappers**: `0.375rem` (6px) to `0.5rem` (8px) for structural crispness.
- **Status Badges, Chips & Filters**: `9999px` (Pill shape) to provide distinct visual recognition from square card surfaces and form fields.

## Components

### Buttons
- **Primary**: Solid Indigo (`#4F46E5`), white text, 8px radius. Hover: `#4338CA`. Active: `#3730A3`. Focus: ring 2px Indigo `#EEF2FF`, outline 2px `#4F46E5`.
- **Secondary / Outline**: White surface, 1px border `#CBD5E1`, text `#334155`. Hover: `#F8FAFC` surface, border `#94A3B8`.
- **Ghost**: Transparent background, text `#475569`. Hover: `#EEF2FF` background, text `#4338CA`.
- **Destructive**: Rose Red (`#F43F5E`) solid or 1px border `#FECDD3` with `#E11D48` text.

### Badges & Pill Tags
- **Base Style**: Pill-shaped (`rounded-full`), height 24px, padding 2px 10px, typography `label-sm` with tabular numeric alignment.
- **Success (OK / Published / Active)**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`. Includes a 6px solid emerald dot.
- **Failed (Error / Cancelled / Quota Exceeded)**: Background `#FFF1F2`, text `#9F1239`, border `1px solid #FECDD3`. Includes a 6px solid rose dot.
- **Warning (Stopped / Queued / Throttled)**: Background `#FEF3C7`, text `#92400E`, border `1px solid #FDE68A`. Includes a 6px solid amber dot.

### Tables & Data Grids
- **Header**: `#F8FAFC` background, text `label-sm` slate `#64748B`, 1px solid bottom border `#E2E8F0`, uppercase tracking `0.05em`.
- **Rows**: Alternating or pure white rows with 1px bottom border `#E2E8F0`. Hover row: `#F8FAFC`.
- **Cells**: Vertical padding 12px, horizontal padding 16px. Numeric columns right-aligned with `tnum` font features.

### Metrics & Stat Cards
- Enclosed in Level 1 white cards with 16px padding.
- Metric counter rendered in `metric-num` (`#0F172A`).
- Top row displays title in `label-md` Slate with a subtle Lucide line icon in a 32x32px `#EEF2FF` circular badge.
- Bottom row features pill delta chips (e.g., `+14.2%` in green badge, `-2.8%` in rose badge) and comparative timeframe context.

### Form Inputs & Administrative Controls
- **Inputs & Selects**: Height 38px, border `1px solid #CBD5E1`, radius 6px, padding 8px 12px, font `body-md`. Focus: border `#4F46E5`, box-shadow `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- **Switches / Toggles**: 40x22px track, `#E2E8F0` when off, `#4F46E5` when on, with a smooth 18px white thumb.

### Recharts & Data Visualizations
- Primary line & bar fills use `#4F46E5` with `#A5B4FC` gradients.
- Grid lines: `#F1F5F9` stroke width 1px, no dotted clutter.
- Tooltips: Minimal Level 2 white card, 1px solid `#E2E8F0`, 8px padding, bold values with tabular numbers.