"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/contexts/settings-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    theme: settings.theme,
    defaultPage: settings.defaultPage,
  })
  

  type PriorityLevel = "high" | "mid" | "low"

  type NotificationPrefs = {
    [key in `${PriorityLevel}_priority_freq` | `${PriorityLevel}_priority_time`]: string
  }
  
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    high_priority_freq: "Daily",
    high_priority_time: "09:00",
    mid_priority_freq: "Weekly",
    mid_priority_time: "10:00",
    low_priority_freq: "None",
    low_priority_time: "10:00",
  })

  useEffect(() => {
    setFormData({
      theme: settings.theme,
      defaultPage: settings.defaultPage,
    })

    const loadPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
    
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single()
    
      if (data) setPrefs(data)
    }
    

    loadPrefs()
  }, [settings])

  // Apply theme immediately + keep form in sync
  const handleThemeChange = (checked: boolean) => {
    const next = checked ? ("dark" as const) : ("light" as const)
    setFormData((prev) => ({ ...prev, theme: next }))
    // this updates context + localStorage and toggles the <html>.dark class
    updateSettings({ theme: next })
  }

  const handleDefaultPageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, defaultPage: value as "dashboard" | "task-list" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateSettings(formData)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return toast({ variant: "destructive", title: "Error", description: "User not found." })

    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      ...prefs,
    })


    if (!error) {
      toast({
        variant: "success",
        title: "Success",
        description: "Settings updated successfully!",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification preferences.",
      })
    }
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
                  <Label htmlFor="theme-toggle" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch id="theme-toggle" checked={formData.theme === "dark"} onCheckedChange={handleThemeChange} />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Default Landing Page</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose which page to show when you log in</p>
                <RadioGroup value={formData.defaultPage} onValueChange={handleDefaultPageChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dashboard" id="dashboard" />
                    <Label htmlFor="dashboard">Dashboard Overview</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="task-list" id="task-list" />
                    <Label htmlFor="task-list">Task List</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              <h2 className="text-lg font-medium">Notification Preferences</h2>
              {(["high", "mid", "low"] as PriorityLevel[]).map((level) => (
                <div key={level} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label className="capitalize">{level} Priority Frequency</Label>
                    <Select
                      value={prefs[`${level}_priority_freq`]}
                      onValueChange={(val) =>
                        setPrefs((prev) => ({
                          ...prev,
                          [`${level}_priority_freq`]: val,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="capitalize">{level} Priority Time</Label>
                    <Input
                      type="time"
                      value={prefs[`${level}_priority_time`]}
                      onChange={(e) =>
                        setPrefs((prev) => ({
                          ...prev,
                          [`${level}_priority_time`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>


            <div className="flex justify-end pt-6">
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