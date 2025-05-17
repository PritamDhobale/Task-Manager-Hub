"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-5">
      <div className="w-full max-w-[400px]">
        {/* Branding Logo */}
        <div className="mb-4 flex items-center justify-center">
          <Image
            src="https://i.postimg.cc/yxCg3hwW/Screenshot-2025-05-07-135932.png"
            alt="mySage Logo"
            width={220}
            height={70}
            className="h-auto"
          />
        </div>

        {/* Login Form */}
        <div className="relative">
          <form onSubmit={handleLogin} className="bg-[#8bc53d] p-6 sm:p-7 w-full">
            <h2 className="text-3xl text-white mt-[-8px] mb-2">
              <span className="font-bold">TASK</span>HUB
            </h2>


            <div className="text-left mb-4">
              <label htmlFor="username" className="text-sm text-white font-medium block mb-1">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white border-0 focus:ring-0 focus:outline-none rounded-none"
              />
            </div>

            <div className="text-left mb-6">
              <label htmlFor="password" className="text-sm text-white font-medium block mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border-0 focus:ring-0 focus:outline-none rounded-none"
              />
            </div>

            <Button
              type="submit"
              className="bg-white text-black font-bold rounded-full py-2 px-6 w-[120px] h-[40px] hover:bg-gray-100 transition-all"
            >
              LOG IN
            </Button>
          </form>

          {/* Powered by: aligned above login box, right-aligned, green */}
          <div className="absolute -bottom-5 right-0 text-right pr-0">
            <p className="text-[11px] text-[#8bc53d] font-bold leading-tight">
              <span className="block text-[13px] font-bold">POWERED BY HUBONE SYSTEMS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright: more space and aligned with login box */}
      <p className="text-sm text-[#6D6E71] mt-20 max-w-[400px] w-full text-center">
        © 2014–2025 HubOne Systems Inc. – All Rights Reserved
      </p>
    </div>
  )
}
