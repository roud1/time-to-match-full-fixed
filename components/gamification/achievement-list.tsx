"use client"

import type { AchievementListItem } from "@/lib/gamification/types"
import { cn } from "@/lib/utils"

type AchievementListProps = {
  items: AchievementListItem[]
  className?: string
}

export function AchievementList({ items, className }: AchievementListProps) {
  if (!items.length) return null

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const pct =
          item.progressTarget > 0
            ? Math.round((item.progressCurrent / item.progressTarget) * 100)
            : 0

        return (
          <article
            key={item.key}
            className={cn(
              "rounded-2xl border p-3.5 transition-colors",
              item.unlocked
                ? "border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] opacity-90"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none shrink-0" aria-hidden>
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
                <p className="mt-1.5 text-[10px] text-[var(--text-secondary)]">
                  +{item.xpReward} XP
                  {item.freezeReward > 0 ? ` · +${item.freezeReward} ❄` : ""}
                </p>
                {!item.unlocked && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-gradient)] transition-[width] duration-500 ease"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--text-secondary)] tabular-nums">
                      {item.progressCurrent}/{item.progressTarget}
                    </p>
                  </div>
                )}
                {item.unlocked && item.unlockedAt && (
                  <p className="mt-1.5 text-[10px] text-[var(--text-secondary)]">
                    {new Date(item.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
