import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/src/lib/cn"

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-ttm-md border border-ttm-stroke bg-ttm-card p-ttm-3",
        "shadow-ttm-glow transition-[box-shadow,transform] duration-300 ease-ttm",
        "hover:scale-[1.02] hover:shadow-ttm-glow-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
