import type { Metadata } from "next"
import { AdminReportsExperience } from "@/components/admin/admin-reports-experience"

export const metadata: Metadata = {
  title: "Admin — Reports",
  description: "Moderation queue for user reports",
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminReportsExperience />
}
