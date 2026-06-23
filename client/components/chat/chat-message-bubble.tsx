"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence, animate, useMotionValue, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/client/lib/social-store"
import type { SyncTier } from "@/client/lib/sync-system"
import { cn } from "@/client/lib/utils"

const QUICK_REACTIONS = ["❤️", "🔥", "✨", "🙌"]
const REPLY_DRAG_THRESHOLD = 52

type Labels = {
  chatDelivered: string
  chatRead: string
  chatReply: string
  chatReact: string
}

function ReadReceipt({ state, labels }: { state: "delivered" | "read"; labels: Labels }) {
  const read = state === "read"
  return (
    <span
      className={read ? "text-sky-600" : "text-muted-foreground"}
      title={read ? labels.chatRead : labels.chatDelivered}
      aria-label={read ? labels.chatRead : labels.chatDelivered}
    >
      <span className="text-xs tracking-tighter">{read ? "✓✓" : "✓"}</span>
    </span>
  )
}

export function ChatMessageBubble({
  msg,
  isMe,
  index = 0,
  syncTier,
  arriveSurge,
  showOwnReceipt,
  receiptState,
  time,
  reaction,
  onPickReaction,
  onReply,
  labels,
}: {
  msg: ChatMessage
  isMe: boolean
  index?: number
  syncTier?: SyncTier
  arriveSurge?: boolean
  showOwnReceipt: boolean
  receiptState: "delivered" | "read"
  time: string
  reaction?: string | null
  onPickReaction: (emoji: string) => void
  onReply: () => void
  labels: Labels
}) {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState(false)
  const [replyArmed, setReplyArmed] = useState(false)
  const replyLock = useRef(false)
  const x = useMotionValue(0)

  const showReactions = !isMe && hover

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const offset = isMe ? -info.offset.x : info.offset.x
    const velocity = isMe ? -info.velocity.x : info.velocity.x
    const shouldReply = offset >= REPLY_DRAG_THRESHOLD || velocity > 420

    if (shouldReply && !replyLock.current) {
      replyLock.current = true
      onReply()
      window.setTimeout(() => {
        replyLock.current = false
      }, 400)
    }

    setReplyArmed(false)
    void animate(x, 0, { type: "spring", stiffness: 520, damping: 34 })
  }

  const highSync = syncTier === "vibrant" || syncTier === "synced" || syncTier === "active"

  return (
    <motion.div
      layout={!reduce}
      initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        delay: reduce ? 0 : Math.min(index * 0.04, 0.2),
      }}
      className={cn(
        "flex flex-col gap-1.5 max-w-[min(88%,20rem)] group",
        isMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className={cn("relative flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
        {!isMe && (
          <motion.span
            aria-hidden
            className="shrink-0 text-muted-foreground"
            animate={{ opacity: replyArmed ? 1 : 0, scale: replyArmed ? 1 : 0.85 }}
            transition={{ duration: 0.12 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </motion.span>
        )}

        <motion.div
          drag={reduce ? false : "x"}
          dragDirectionLock
          dragConstraints={isMe ? { left: -80, right: 0 } : { left: 0, right: 80 }}
          dragElastic={0.14}
          dragMomentum={false}
          style={{ x }}
          onDrag={(_, info) => {
            const offset = isMe ? -info.offset.x : info.offset.x
            setReplyArmed(offset >= REPLY_DRAG_THRESHOLD * 0.65)
          }}
          onDragEnd={handleDragEnd}
          className={cn(
            "ttm-chat-bubble relative rounded-[1.4rem] text-[15px] leading-relaxed touch-pan-y cursor-grab active:cursor-grabbing",
            isMe ? "ttm-chat-bubble--me rounded-br-md text-white" : "ttm-chat-bubble--them rounded-bl-md",
            arriveSurge && "ttm-chat-bubble--surge",
            highSync && !isMe && "shadow-[0_16px_48px_-28px_rgba(180,195,255,0.25)]"
          )}
        >
          <p className="whitespace-pre-wrap break-words select-none">{msg.text}</p>
          {reaction && (
            <span className="absolute -bottom-2 -right-1 text-lg drop-shadow-md pointer-events-none" aria-hidden>
              {reaction}
            </span>
          )}
        </motion.div>

        {isMe && (
          <motion.span
            aria-hidden
            className="shrink-0 text-muted-foreground"
            animate={{ opacity: replyArmed ? 1 : 0, scale: replyArmed ? 1 : 0.85 }}
            transition={{ duration: 0.12 }}
          >
            <svg className="w-4 h-4 scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </motion.span>
        )}
      </div>

      <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
        <span className="text-[10px] text-muted-foreground/80 font-light tabular-nums">{time}</span>
        {isMe && showOwnReceipt && <ReadReceipt state={receiptState} labels={labels} />}
      </div>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="flex flex-wrap items-center gap-1 pl-0.5 pointer-events-auto"
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onPickReaction(emoji)}
                className="min-h-[40px] min-w-[40px] rounded-full border border-border bg-background text-base backdrop-blur-md hover:scale-110 active:scale-95 transition-transform touch-manipulation"
                aria-label={`${labels.chatReact} ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
