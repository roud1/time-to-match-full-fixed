# Time to Match — design system

This project uses a **single cinematic / dark-luxury** language defined in:

- **`app/brand-system.css`** (Phase 8) — brand tokens: colors, glow, glass, depth, typography, motion, relationship UI. See **`docs/BRAND_SYSTEM.md`**.
- `app/design-system.css` — spacing, forms, layout, nav pills, connection life utilities.
- `app/globals.css` — imports `brand-system.css` first, then layer CSS (sync, chat, discover, landing, mobile).

## React primitives

| Component | Path | Role |
|-----------|------|------|
| `CinematicButton` | `components/ui/cinematic-button.tsx` | Primary / secondary / ghost / glow; sizes `default`, `mobile`, `compact`; optional `href`. |
| `PremiumButton` | `components/ui/premium-button.tsx` | Thin wrapper around `CinematicButton` (default touch-friendly size). Prefer `CinematicButton` in new code. |
| `CinematicField` | `components/ui/cinematic-field.tsx` | Label + control + error spacing for forms. |
| `CinematicCard` | `components/ui/cinematic-card.tsx` | Variants: `glass`, `profile`, `info`, `floating`. |

## Forms & inputs

`Input` and `Textarea` include the `.ttm-input` base layer (radius, glassy fill, focus glow). Prefer `CinematicField` for consistent labels and errors.

## Navigation

Landing `Navbar` and auth `AuthShell` share **nav chrome** classes (`ttm-surface-nav`, `ttm-surface-nav--glass` / `--solid`) and pill CTAs (`ttm-nav-pill-primary`, `ttm-nav-pill-secondary`). Bottom bar uses `ttm-bottom-nav-shell`.

When adding screens, reuse these classes before inventing new shadows or radii.
