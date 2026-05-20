export function SectionPlaceholder({ className = "min-h-[320px]" }: { className?: string }) {
  return (
    <div
      className={`${className} mx-auto max-w-7xl px-4 animate-pulse rounded-3xl bg-foreground/[0.03] border border-foreground/5`}
      aria-hidden
    />
  )
}
