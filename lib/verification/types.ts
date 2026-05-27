export type VerificationRequestStatus = "pending" | "approved" | "rejected"

export type VerificationRequest = {
  id: string
  userId: string
  gesture: string
  selfieUrl: string
  status: VerificationRequestStatus
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
}

export type VerificationGesturePrompt = {
  gesture: string
  instruction: string
  emoji: string
}

export type VerificationStatusResponse = {
  verified: boolean
  requestStatus: "none" | "pending" | "approved" | "rejected"
}
