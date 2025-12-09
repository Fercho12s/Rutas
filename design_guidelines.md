# Design Guidelines for Rutas Seguras

## Design Approach

**Selected Approach**: Design System - Material Design 3
**Rationale**: Rutas Seguras is a utility-focused business management application requiring clear information hierarchy, efficient data display, and professional credibility. Material Design provides robust patterns for dashboards, tables, forms, and data-heavy interfaces while maintaining visual polish.

## Core Design Elements

### Typography Hierarchy

**Font Family**: Inter (via Google Fonts CDN) for UI, Poppins for headings
- **Hero/Main Headings**: Poppins, 600 weight, 2.5rem (mobile) / 4rem (desktop)
- **Section Headings**: Poppins, 600 weight, 1.75rem (mobile) / 2.25rem (desktop)
- **Card Titles**: Inter, 600 weight, 1.25rem
- **Body Text**: Inter, 400 weight, 1rem, line-height 1.6
- **Labels/Captions**: Inter, 500 weight, 0.875rem
- **Table Headers**: Inter, 600 weight, 0.875rem, uppercase tracking-wide
- **Button Text**: Inter, 500 weight, 0.875rem - 1rem

### Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Card padding: p-6 (mobile), p-8 (desktop)
- Section spacing: py-12 (mobile), py-20 (desktop)
- Component gaps: gap-4 (compact), gap-6 (standard), gap-8 (spacious)
- Container max-width: max-w-7xl with px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Grid Systems**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- Data tables: Full-width with horizontal scroll on mobile
- Forms: Single column mobile, 2-column tablet+

## Component Library

### Navigation & Layout

**Header** (sticky, backdrop-blur):
- Logo left (h-10 to h-12)
- Horizontal nav center/right for desktop
- Hamburger menu icon for mobile
- User profile dropdown right-aligned
- Height: h-16 (mobile), h-20 (desktop)
- Shadow: shadow-sm with border-b

**Sidebar** (admin dashboard):
- Fixed left, w-64, with collapse to w-16 icon-only on mobile
- Navigation items: py-3 px-4, rounded-lg hover states
- Active state with left border accent
- Group headings with uppercase text-xs

**Breadcrumbs**:
- Below header, py-3, text-sm
- Separator: chevron-right icon
- Current page: non-interactive, medium weight

**Footer**:
- Multi-column layout on desktop (4 columns: About, Quick Links, Contact, Social)
- Stacked single column on mobile
- Copyright bar at bottom with py-4

### Dashboard Components

**Stat Cards**:
- Elevation: shadow-md with subtle border
- Padding: p-6
- Icon top-left (h-12 w-12, rounded-lg with light background)
- Value: Large text (text-3xl, font-bold)
- Label below (text-sm, text-gray-600)
- Optional trend indicator (↑/↓ with percentage)

**Chart Container**:
- White background, rounded-xl, shadow-md
- Padding: p-6
- Title and filters in flex header
- Chart area with min-height of 320px

**Quick Actions Bar**:
- Horizontal scroll on mobile
- Button group with gap-4
- Primary action uses solid button, secondary uses outline

### Data Display

**Tables**:
- Rounded container with overflow-hidden
- Header: bg-gray-50, sticky, font-semibold
- Rows: border-b, hover:bg-gray-50
- Cell padding: px-6 py-4
- Actions column right-aligned with icon buttons
- Mobile: Convert to stacked cards with labels

**Route/Unit Cards**:
- Rounded-xl, shadow-md, overflow-hidden
- Image top (aspect-video for routes, aspect-square for vehicles)
- Content padding: p-6
- Title (text-xl, font-semibold)
- Metadata grid (2 columns: label-value pairs)
- Status badge top-right absolute
- Action buttons footer with border-t, pt-4

**Status Badges**:
- Rounded-full px-3 py-1
- Text-xs font-medium
- Different styles: success (green), warning (yellow), error (red), info (blue)

### Forms & Input

**Form Container**:
- Max-width: max-w-2xl centered for standalone forms
- Background: white, rounded-xl, shadow-lg
- Padding: p-8 (desktop), p-6 (mobile)

**Input Fields**:
- Label above: font-medium, text-sm, mb-2
- Input: rounded-lg, border, px-4 py-3, focus:ring-2
- Error state: border-red, text-red-600 helper text
- Helper text: text-sm, text-gray-600, mt-1

**Buttons**:
- Primary: Solid, rounded-lg, px-6 py-3, font-medium, shadow-sm
- Secondary: Outline variant with border-2
- Icon buttons: Square (h-10 w-10), rounded-lg, centered icon
- Button groups: Connected with rounded corners on ends only

**Search Bar**:
- Full-width within container
- Icon left (search/magnifying glass)
- Placeholder text
- Optional filter button right
- Rounded-xl, shadow-sm

### Modals & Overlays

**Modal**:
- Backdrop: bg-black/50 backdrop-blur-sm
- Container: max-w-lg (forms), max-w-4xl (details), centered
- Rounded-2xl, shadow-2xl
- Header: border-b, flex justify-between, px-6 py-4
- Body: p-6, max-h-[70vh] overflow-y-auto
- Footer: border-t, px-6 py-4, flex justify-end gap-3

**Dropdown Menus**:
- Rounded-lg, shadow-xl, border
- Item padding: px-4 py-2.5
- Hover: bg-gray-100
- Dividers between groups

## Landing Page Design

**Hero Section**:
- Height: min-h-[600px] with full-bleed background image
- Overlay: gradient from bg-black/60 to transparent
- Content: max-w-3xl, centered vertically and horizontally
- Headline: Large (text-5xl lg:text-6xl), bold, white text with subtle text-shadow
- Subheading: text-xl, white/gray-100, max-w-2xl
- CTA buttons: Primary + Secondary, gap-4, backdrop-blur backgrounds
- Search bar prominent: rounded-xl, shadow-lg, white background, multi-field (origin/destination/date)

**Features Section**:
- 3-column grid (grid-cols-1 md:grid-cols-3)
- Icon cards: Centered icon (h-16 w-16), title, description
- Padding: py-20

**How It Works**:
- 4-step process in horizontal timeline (desktop) / vertical (mobile)
- Number badges connected with lines
- Title and description per step

**Social Proof**:
- 2-column split: Stats on left (3 stat items), testimonial carousel right
- Background: light gray section

**CTA Section**:
- Full-width, contrasting background
- Centered content, max-w-4xl
- Large headline, supporting text, prominent button

## Images

**Hero Image**: Full-width modern transport/logistics imagery (trucks on highway, urban delivery, professional drivers). Should convey safety, reliability, and modernity. Dimensions: 1920x1080 minimum.

**Feature Icons**: Use Heroicons library for all interface icons and feature illustrations. No custom SVG generation.

**Vehicle/Route Images**: Placeholder aspect-ratio boxes in cards (aspect-video for routes showing maps/destinations, aspect-square for vehicle photos). Use image-cover with rounded-t-xl on card images.

**Dashboard Illustrations**: Optional decorative illustrations in empty states using simple SVG from undraw.co or similar.

## Responsive Behavior

- **Mobile (<768px)**: Single column, stacked navigation, card-based tables, full-width forms
- **Tablet (768-1024px)**: 2-column grids, hybrid nav (some horizontal, some collapsed), forms can use 2 columns
- **Desktop (>1024px)**: Full multi-column layouts, sidebar visible, horizontal navigation, data tables fully expanded