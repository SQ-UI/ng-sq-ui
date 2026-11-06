# Table appearance verification

The supplied Table / S + paginator screenshot is the visual reference. The shared table now
uses a black header with white labels, green sort indicators, 14px/24px text, 10px horizontal
padding, white/Gray 1 striping, Gray 2 separators and Brand Light row hover. Pagination is
centered with 20px of space above it. S rows are 44px; M/L extend that density to 48px/52px
pending separate visual references. Wrapped content can grow, and the existing mobile card
layout takes over at 860px.

The All components preview includes an eight-column S table with six rows per page and
11 pages. Its second heading, fourth row and page 3 illustrate hover colors. The other
table examples retain interactive sorting and the three size comparisons.

Validation completed:

- 32 datatable, column, row and paginator tests passed, including sort direction announcements.
- TypeScript checking, targeted ESLint and published Sass checks passed.
- Shared common/form/datatable library builds and the production demo build passed.
- Chrome checks passed at 1440, 861, 860, 390 and 320px: rendered colors, padding, row
  heights, sorting cycle, keyboard activation and visible focus, sorting across pages,
  paginator navigation, inherited theme overrides, mobile cards and absence of page overflow.

See [the desktop reference](screenshots/table-reference-1440.png),
[the mobile reference](screenshots/table-reference-320.png) and the
[browser measurements](screenshots/manifest.json). Hover illustrations are scoped to the
demo reference; library hover states respond to the pointer.
