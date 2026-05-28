import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/src/lib/cn"

export type ButtonVariant = "primary" | "secondary"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-ttm-primary text-ttm-text",
    "shadow-ttm-glow",
    "hover:brightness-110",
    "active:scale-[0.98]",
  ].join(" "),
  secondary: [
    "bg-ttm-surface text-ttm-text",
    "border border-ttm-stroke",
    "hover:border-ttm-muted/40",
    "active:scale-[0.98]",
  ].join(" "),
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-ttm-6 min-w-ttm-6 items-center justify-center gap-ttm-2",
        "rounded-ttm-md px-ttm-5 text-base font-semibold",
        "transition-[transform,box-shadow,filter,border-color] duration-300 ease-ttm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ttm-primary/50",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
