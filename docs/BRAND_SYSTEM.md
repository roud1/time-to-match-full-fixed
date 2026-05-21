# Time to Match — Brand System (Phase 8)

Emotional Identity: **intimate · cinematic · futuristic · alive** — never playful or gaming.

## Source files

| File | Role |
|------|------|
| `app/brand-system.css` | Tokens + utilities (colors, glow, glass, depth, typography, motion, relationship UI) |
| `app/design-system.css` | Spacing, forms, layout, legacy connection utilities |
| `lib/brand-tokens.ts` | JS constants mirroring CSS |
| `lib/motion-system.ts` | Framer Motion presets (springs, screen/tab transitions) |
| `components/brand/brand-icon.tsx` | Thin-stroke icon set |

Imported in `app/globals.css` **before** other experience layers.

## Color palette

- **Void / deep / graphite** — `#030304` → `#0c0c0e`
- **Text** — soft white at 42% / 22% / 12% mist levels
- **Accent** — electric indigo-lavender (`#c8d2ff`), not hot pink
- **Emotional states** — `--ttm-state-curious` … `--ttm-state-fading`
- **Connection** — `--ttm-connection-*`, `--ttm-chemistry-*`, `--ttm-bond-*`

## Glow language

Intensity scale: `--ttm-glow-intensity-xs` → `peak`.

Semantic glows:

- `--ttm-glow-sync` — relationship rhythm
- `--ttm-glow-chemistry` — attraction / peak
- `--ttm-glow-bond` — stability
- `--ttm-glow-aura` — personality atmosphere
- `--ttm-glow-cinematic` — ambient UI

Utilities: `.ttm-brand-glow-sync`, `.ttm-brand-glow-chemistry`, `.ttm-brand-glow-bond`, `.ttm-brand-headline-glow`.

**Rules:** soft blur, never saturated neon; max one primary glow per focal component.

## Typography

| Class | Use |
|-------|-----|
| `.ttm-brand-display` | Hero / landing |
| `.ttm-brand-headline` | Section titles |
| `.ttm-brand-title` | Screen titles |
| `.ttm-brand-subtitle` | Supporting lines |
| `.ttm-brand-body` | Paragraphs |
| `.ttm-brand-caption` | Secondary |
| `.ttm-brand-overline` | Labels / badges |
| `.ttm-brand-gradient-text` | Premium headlines |

Aliases: `.ttm-cin-*` and `.ttm-type-*` map to the same scale.

**Rules:** weight 200–300, negative tracking on large type, overline always uppercase + wide tracking.

## Glass & depth

- `.ttm-brand-glass` — standard panel
- `.ttm-brand-glass-strong` — modals / headers
- `.ttm-brand-glass-float` — dock / floating nav
- `.ttm-brand-card` — elevated surfaces
- Depth tokens: `--ttm-depth-1`, `--ttm-depth-2`, `--ttm-depth-float`

## Motion

CSS: `--ttm-brand-ease`, durations, `.ttm-brand-breathe`, `.ttm-brand-float`, `.ttm-brand-fade-in`.

JS: `lib/motion-system.ts` — `springSnappy`, `springSoft`, `screenSlide`, `tabCrossfade`, `CIN_EASE`.

**Rules:**

- Prefer springs for interaction; cubic-bezier for fades
- Breathe loops 4–6s; ambient drift 12–18s
- Respect `prefers-reduced-motion`

## Relationship visual language

- `.ttm-brand-sync-ring-host` — wrap SyncRing
- `.ttm-brand-connection-line` — vertical energy between avatars
- `.ttm-brand-timeline-node[data-intensity="1-4"]` — evolution story
- `.ttm-brand-state-pill[data-state]` — emotional badges

Sync ring CSS lives in `app/sync-design.css`; colors bridge via `--sync-glow-*` → brand tokens.

## Iconography

`<BrandIcon name="discover" active size="md" />` — stroke 1.5, glow when active.

## CTAs

Use `.ttm-brand-cta` for primary actions (indigo-violet gradient). Avoid cartoon pink gradients on new screens.

## Consistency checklist

- [ ] New screens use `ttm-brand-glass` / `ttm-brand-card`, not ad-hoc `bg-white/5`
- [ ] Headlines use brand typography classes
- [ ] Glows use semantic tokens, not random `rgba(236,72,153,…)`
- [ ] Motion from `motion-system.ts`
- [ ] Icons via `BrandIcon` or match stroke 1.5
- [ ] Border radius from `--ttm-radius-*`
