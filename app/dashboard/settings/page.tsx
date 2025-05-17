"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    theme: settings.theme,
    defaultPage: settings.defaultPage,
  })

  // Update form data when settings change (e.g., on initial load)
  useEffect(() => {
    setFormData({
      theme: settings.theme,
      defaultPage: settings.defaultPage,
    })
  }, [settings])

  const handleThemeChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, theme: checked ? "dark" : "light" }))
  }

  const handleDefaultPageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, defaultPage: value as "dashboard" | "task-list" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)
    toast({
      variant: "success",
      title: "Success",
      description: "Settings updated successfully!",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
          <CardDescription>Customize your TaskHub experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-toggle" className="text-base">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
                <Switch id="theme-toggle" checked={formData.theme === "dark"} onCheckedChange={handleThemeChange} />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Default Landing Page</Label>
                <p className="text-sm text-gray-500 mb-2">Choose which page to show when you log in</p>

                <RadioGroup
                  value={formData.defaultPage}
                  onValueChange={handleDefaultPageChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dashboard" id="dashboard" />
                    <Label htmlFor="dashboard" className="font-normal">
                      Dashboard Overview
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="task-list" id="task-list" />
                    <Label htmlFor="task-list" className="font-normal">
                      Task List
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl">
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
