"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import Sidebar from "@/components/sidebar"
import { useSettings } from "@/contexts/settings-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings } = useSettings()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Redirect to default page if we're at the dashboard root
    if (pathname === "/dashboard" && settings.defaultPage === "task-list") {
      router.push("/dashboard/task-list")
    }
  }, [pathname, settings.defaultPage, router])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
