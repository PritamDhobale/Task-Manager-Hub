"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import "./login.css"

const allowedEmails = ["admin@hubone.com", "vchittam@sagehealthy.com"] // ✅ Add your allowed users here

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // First try logging in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  
    if (error || !data?.user) {
      setError("Invalid credentials. Please try again.")
      return
    }
  
    // After successful auth, check if user is in `users` table
    const { data: userRow, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .single()
  
    if (userCheckError || !userRow) {
      setError("Access denied: You are not authorized to use this system.")
      return
    }
    // Clear old cached profile
    localStorage.removeItem("taskhub-profile")

    // Force profile to refetch in context on dashboard load
    sessionStorage.setItem("reload-profile", "true")

    router.push("/dashboard")
  }
  

  return (
    <div className="login-page">
      <div className="logo-wrapper">
        <img
          src="/images/sage_healthy_rcm_logo.png"
          alt="mySAGE Logo"
          className="mysage-logo"
        />
      </div>

      <div className="login-box">
        <img src="/images/taskshub.png" alt="TaskHub" className="login-logo-img" />

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</p>}

          <button type="submit" className="login-btn">
            LOG IN
          </button>
        </form>
      </div>

      <div className="powered-by-text">POWERED BY HUBONE SYSTEMS</div>
      <p className="footer-text">© 2014–2025 HubOne Systems Inc. – All Rights Reserved</p>
    </div>
  )
}
