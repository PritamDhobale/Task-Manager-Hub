"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/contexts/profile-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"


export default function ProfilePage() {
  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [passwordData, setPasswordData] = useState({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
})

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setPasswordData((prev) => ({ ...prev, [name]: value }))
}


  const [formData, setFormData] = useState({
    name: profile.name,
    jobTitle: profile.jobTitle,
    email: profile.email,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updateProfile({ avatar: event.target.result as string })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordUpdate = async () => {
  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    toast({ variant: "destructive", title: "Error", description: "New passwords do not match." })
    return
  }

  // Re-authenticate with old password
  const {
    data: { session },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: passwordData.oldPassword,
  })

  if (signInError || !session) {
    toast({ variant: "destructive", title: "Error", description: "Old password is incorrect." })
    return
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordData.newPassword,
  })

  if (updateError) {
    toast({ variant: "destructive", title: "Error", description: updateError.message })
  } else {
    toast({ variant: "success", title: "Password Updated", description: "Password changed successfully." })
    setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" })
  }
}


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(formData)
    toast({
      variant: "success",
      title: "Success",
      description: "Profile updated successfully!",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      <Card className="shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal information and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="text-lg">{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Change Photo
                </Button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-none" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="rounded-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl">
                Save Changes
              </Button>
            </div>
            <CardHeader className="pt-8">
  <CardTitle>Change Password</CardTitle>
  <CardDescription>Update your login password securely.</CardDescription>
</CardHeader>
<CardContent className="space-y-4">
  <div className="grid gap-2">
    <Label htmlFor="oldPassword">Old Password</Label>
    <Input
      id="oldPassword"
      name="oldPassword"
      type="password"
      value={passwordData.oldPassword}
      onChange={handlePasswordChange}
    />
  </div>

  <div className="grid gap-2">
    <Label htmlFor="newPassword">New Password</Label>
    <Input
      id="newPassword"
      name="newPassword"
      type="password"
      value={passwordData.newPassword}
      onChange={handlePasswordChange}
    />
  </div>

  <div className="grid gap-2">
    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
    <Input
      id="confirmNewPassword"
      name="confirmNewPassword"
      type="password"
      value={passwordData.confirmNewPassword}
      onChange={handlePasswordChange}
    />
  </div>

  <div className="flex justify-end">
    <Button type="button" onClick={handlePasswordUpdate} className="bg-[#8BC53D] hover:bg-[#476E2C] rounded-xl">
      Change Password
    </Button>
  </div>
</CardContent>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
