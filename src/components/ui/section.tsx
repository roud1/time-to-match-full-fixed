import type { ElementType, ReactNode } from "react"
import { cn } from "@/src/lib/cn"
import { Container } from "@/src/components/ui/container"

type SectionProps<T extends ElementType = "section"> = {
  as?: T
  children: ReactNode
  className?: string
  containerClassName?: string
  /** Vertical padding token key (default 8 = 96px) */
  padding?: 6 | 7 | 8
}

const paddingMap = {
  6: "py-ttm-6",
  7: "py-ttm-7",
  8: "py-ttm-8",
} as const

export function Section<T extends ElementType = "section">({
  as,
  children,
  className,
  containerClassName,
  padding = 8,
}: SectionProps<T>) {
  const Tag = as ?? "section"

  return (
    <Tag className={cn(paddingMap[padding], className)}>
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  )
}
