import { cn } from "@/lib/utils"

type VerifiedBadgeProps = {
  className?: string
  size?: number
  title?: string
}

export function VerifiedBadge({ className, size = 16, title }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white",
        className
      )}
      style={{ width: size, height: size }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  )
}
