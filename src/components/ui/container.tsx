import type { ElementType, ReactNode } from "react"
import { cn } from "@/src/lib/cn"

type ContainerProps<T extends ElementType = "div"> = {
  as?: T
  children: ReactNode
  className?: string
}

export function Container<T extends ElementType = "div">({
  as,
  children,
  className,
}: ContainerProps<T>) {
  const Tag = as ?? "div"

  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-ttm-container",
        "px-[var(--ttm-page-padding)]",
        className
      )}
    >
      {children}
    </Tag>
  )
}
