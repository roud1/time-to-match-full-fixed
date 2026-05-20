# Time to Match — design system

This project uses a **single cinematic / dark-luxury** language defined in:

- `app/design-system.css` — CSS variables (spacing, radii, motion, shadows), typography utilities (`.ttm-type-*`), layout (`.ttm-page`), surfaces (`.ttm-surface-nav-*`), form controls (`.ttm-input`, `.ttm-choice`), nav pills (`.ttm-nav-pill-*`).
- `app/globals.css` — imports `design-system.css` after Tailwind; keeps theme tokens and legacy utilities (`glass-card`, `premium-profile-card`, etc.).

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
