# Time to Match — Foundation

## Structure

```
src/
├── components/
│   ├── ui/          Button, Container, Card, Input, Section
│   ├── layout/      FoundationLayout
│   ├── onboarding/  (reserved)
│   ├── cards/       (reserved)
│   └── pulse/       (reserved)
├── constants/       design-system.ts
├── styles/          foundation.css → Tailwind @theme
├── hooks/
├── lib/
└── (routes)         Next.js App Router → `app/` at repo root (no `src/pages` — conflicts with Next)
```

## Usage

```tsx
import { FoundationLayout } from "@/src/components/layout"
import { Button, Container, Section } from "@/src/components/ui"
import { colors, spacing } from "@/src/constants/design-system"
```

Wrap screens with `FoundationLayout` for TTM tokens and page padding.
