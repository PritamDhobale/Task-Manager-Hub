import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ProfileProvider } from "@/contexts/profile-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { TaskProvider } from "@/contexts/task-context"
import { MonthlyTaskProvider } from "@/contexts/monthly-task-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskHub - Task Management Application",
  description: "Professional task management application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          <ProfileProvider>
            <TaskProvider>
            <MonthlyTaskProvider>
              {children}
              <Toaster />
              </MonthlyTaskProvider>
            </TaskProvider>
          </ProfileProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
