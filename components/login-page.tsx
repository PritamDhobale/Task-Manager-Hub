"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Eye, EyeOff } from "lucide-react"
import "./login.css"

const allowedEmails = ["admin@hubone.com", "vchittam@sagehealthy.com"] // ✅ Add your allowed users here

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)


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

    await router.push("/dashboard")
    window.location.href = "/dashboard" // hard reload on final page
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

          {/* <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /> */}
          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
              /* gives room for the icon button */
              style={{ paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              className="password-visibility-btn"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</p>}

          <button type="submit" className="login-btn">
            LOG IN
          </button>
        </form>
      </div>

      <div className="powered-by-text">POWERED BY HUBONE SYSTEMS</div>
      <p className="footer-text">© 2014–2026 HubOne Systems Inc. – All Rights Reserved</p>
    </div>
  )
}