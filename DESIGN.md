# Agent Skills Hub design system

A searchable developer directory: discover a repository, understand its suitability, then follow trustworthy usage instructions. Preserve the existing brand, dual themes, static CDN delivery, and compact cards/table.

## Visual direction

Calm technical archive. Use quiet surfaces and a single accent for actionable elements. Preserve the existing logo and typeface; avoid unrelated marketing illustrations, excessive glow, and competing gradients. Reference inspiration: awesome-design-md's Vercel semantic roles, Linear density, and Mintlify reading hierarchy. These are community interpretations, not official brand requirements.

## Semantic colors

Use --ps-bg-base for canvas, --ps-bg-card for cards, --ps-bg-elevated for secondary controls, --ps-bg-input for inputs, and --ps-bg-surface for popovers. Foreground uses --ps-text-primary, --ps-text-secondary, --ps-text-muted. Borders use --ps-border; focus uses --ps-neon-cyan. Selected gradient backgrounds must pair with --ps-on-selected, which changes by theme. Never combine a fixed dark surface with theme-dependent dark text.

## Type and spacing

Body 14-16px with relaxed line height; secondary text generally 12-13px. Code and commands use monospace. Do not shrink essential controls to fit mobile: wrap or stack instead. Follow the existing 4px spacing scale; cards use 16-24px padding. Long repository titles and descriptions must not create horizontal page overflow.

## Interaction

Navigation uses real links; actions use buttons. Do not wrap favorite buttons in links. Every action needs a visible focus indicator. Main touch targets are at least 44 CSS px. Copy has success and failure feedback. Search suggestions use combobox/listbox/option with active-descendant, arrow navigation, Enter, Escape, and a scrollable list unobstructed by decorative containers. Filter controls are shared across responsive layouts, with a native disclosure on mobile and a persistent desktop sidebar. Selected filters remain visible and can be cleared.

## Responsive behavior

At mobile widths detail heroes stack vertically and descriptions use full width. Secondary header navigation yields to the brand and primary controls. Mascot is hidden on mobile and dismissible on desktop. Search results must escape decorative clipping but remain below the sticky header. Test at 390px, 768px and desktop in light and dark themes.

## Information trust

Auto-scored means algorithmic assessment, not manual or security verification. Display the published snapshot timestamp with timezone. Describe scheduled updates without promising real-time freshness. Never infer package names, container images, or MCP endpoints from a GitHub repository name. Show source cloning and official README instructions when verified installation metadata is absent. Compatibility explanations use readable metadata reasons and identify scores as estimates.

## Required states

Loading, success, empty, error, selected, hover, focus, and disabled. Static pagination covers every published record and keeps URL, selected page and result range aligned. Browser back/forward restores pagination. Respect reduced-motion preferences. Do not add Supabase reads for visual features.
