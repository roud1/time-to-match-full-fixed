"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence, animate, useMotionValue, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/lib/social-store"
import { cn } from "@/lib/utils"

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
      className={read ? "text-sky-300/95" : "text-white/30"}
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

  return (
    <motion.div
      layout={!reduce}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={cn(
        "flex flex-col gap-1 max-w-[min(92%,18rem)] group",
        isMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className={cn("relative flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
        {!isMe && (
          <motion.span
            aria-hidden
            className="shrink-0 text-pink-300/80"
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
            "relative px-3.5 py-2.5 rounded-[1.35rem] text-[15px] leading-snug font-light tracking-wide shadow-lg touch-pan-y cursor-grab active:cursor-grabbing",
            isMe
              ? "rounded-br-md text-white border border-white/10 bg-gradient-to-br from-pink-500/95 via-pink-600/90 to-purple-700/95 shadow-[0_16px_48px_-16px_rgba(236,72,153,0.55)]"
              : "rounded-bl-md border border-white/12 bg-white/[0.07] backdrop-blur-2xl text-foreground/95 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)]"
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
            className="shrink-0 text-pink-300/80"
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
                className="min-h-[40px] min-w-[40px] rounded-full border border-white/10 bg-black/30 text-base backdrop-blur-md hover:scale-110 active:scale-95 transition-transform touch-manipulation"
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
