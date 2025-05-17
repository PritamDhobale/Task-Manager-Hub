"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface ProfileData {
  name: string
  jobTitle: string
  email: string
  avatar: string
}

interface ProfileContextType {
  profile: ProfileData
  updateProfile: (data: Partial<ProfileData>) => void
}

const defaultProfile: ProfileData = {
  name: "VamsiKrishna",
  jobTitle: "Accounting Manager",
  email: "vamsi@example.com",
  avatar: "https://i.postimg.cc/qR7Cb0s8/Screenshot-2025-05-07-132514.png",
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)

  useEffect(() => {
    // Load profile from localStorage on mount
    const savedProfile = localStorage.getItem("taskhub-profile")
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error("Failed to parse profile data:", error)
      }
    }
  }, [])

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const newProfile = { ...prev, ...data }
      // Save to localStorage
      localStorage.setItem("taskhub-profile", JSON.stringify(newProfile))
      return newProfile
    })
  }

  return <ProfileContext.Provider value={{ profile, updateProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
