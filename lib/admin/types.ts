export type ReportReason = "harassment" | "spam" | "fake" | "inappropriate" | "other"

export type AdminReport = {
  id: string
  reporterId: string
  reportedUserId: string
  reason: ReportReason
  comment: string | null
  status: string
  createdAt: string
  reporterName: string | null
  reportedName: string | null
}

export type AdminReportsResponse = {
  reports: AdminReport[]
  count: number
}
