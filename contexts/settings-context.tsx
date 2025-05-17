"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SettingsData {
  theme: "light" | "dark"
  defaultPage: "dashboard" | "task-list"
}

interface SettingsContextType {
  settings: SettingsData
  updateSettings: (data: Partial<SettingsData>) => void
}

const defaultSettings: SettingsData = {
  theme: "light",
  defaultPage: "dashboard",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem("taskhub-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to parse settings data:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme when it changes
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.theme])

  const updateSettings = (data: Partial<SettingsData>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...data }
      // Save to localStorage
      localStorage.setItem("taskhub-settings", JSON.stringify(newSettings))
      return newSettings
    })
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
