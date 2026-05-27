"use client"

type LogoProps = {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const box = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-9 h-9"
  const icon = size === "sm" ? 14 : size === "lg" ? 22 : 16

  return (
    <div className={`relative ${box} flex items-center justify-center`}>
      <div className="absolute inset-0 rounded-full border border-border bg-card/80" />
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-[1] text-foreground"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
        <path
          d="M12 6v12M8 10c0-2 1.5-3 4-3s4 1 4 3M8 14c0 2 1.5 3 4 3s4-1 4-3"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
