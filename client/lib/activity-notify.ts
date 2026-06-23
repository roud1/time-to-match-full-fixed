/** Real-time activity toasts — only dispatch when something actually changed. */

export type ActivityBumpKind = "likes" | "chats" | "matches"

export function emitActivityBump(kind: ActivityBumpKind) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("ttm-activity-bump", { detail: { kind } }))
}
