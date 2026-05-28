import type { InputHTMLAttributes } from "react"
import { cn } from "@/src/lib/cn"

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined)

  return (
    <div className="flex w-full flex-col gap-ttm-2">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-ttm-muted">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-ttm-6 w-full rounded-ttm-sm border border-ttm-stroke bg-ttm-surface",
          "px-ttm-3 text-base text-ttm-text",
          "placeholder:text-ttm-muted",
          "transition-[border-color,box-shadow] duration-300 ease-ttm",
          "focus-visible:border-ttm-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ttm-primary/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-ttm-primary",
          className
        )}
        {...props}
      />
      {error ? <p className="text-sm text-ttm-primary">{error}</p> : null}
    </div>
  )
}
