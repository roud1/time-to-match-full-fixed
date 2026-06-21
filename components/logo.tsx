"use client"

type LogoProps = {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const box = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-9 h-9"
  const icon = size === "sm" ? 14 : size === "lg" ? 22 : 16

  return (
    <div className={`relative ${box} flex items-center justify-center`}>
      <div className="absolute inset-0 rounded-[6px] border border-[var(--lime-border,theme(colors.violet.300))] bg-[var(--bg-secondary,theme(colors.violet.950))] rotate-3" />
      <div className="absolute inset-0 rounded-[6px] border border-violet-500/30 bg-violet-950/80 -rotate-3" />
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-[1] text-[#bfff00]"
        aria-hidden
      >
        <path
          d="M12 4v16M7 9.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5M7 14.5c0 2.2 2.2 3.5 5 3.5s5-1.3 5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
      </svg>
    </div>
  )
}
