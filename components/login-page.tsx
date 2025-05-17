"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./login.css"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="login-page">
      {/* ✅ Top Logo - matching client DB webapp */}
      <div className="logo-wrapper">
        <img
          src="/images/sage_healthy_rcm_logo.png"
          alt="mySAGE Logo"
          className="mysage-logo"
        />
      </div>

      {/* ✅ Login Box */}
      <div className="login-box">
        <img
          src="/images/taskshub.png"
          alt="TaskHub"
          className="login-logo-img"
        />

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <button type="submit" className="login-btn">
            LOG IN
          </button>
        </form>
      </div>

      {/* ✅ Powered by (updated to match single-line version) */}
      <div className="powered-by-text">
        POWERED BY HUBONE SYSTEMS
      </div>

      {/* ✅ Footer */}
      <p className="footer-text">
        © 2014–2025 HubOne Systems Inc. – All Rights Reserved
      </p>
    </div>
  )
}
