"use client"

/**
 * Route wrapper — no AnimatePresence (was causing blank screens on first paint / slow dev).
 */
export function MobileScreenTransition({ children }: { children: React.ReactNode }) {
  return <div className="ttm-screen-transition min-h-full">{children}</div>
}
