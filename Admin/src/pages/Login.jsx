"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useApi } from "../hooks/useApi"
import { Lock, Shield } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthNavigation } from "../context/AuthContext"


const Login = () => {
  const [password, setPassword] = useState("")
  const { login } = useAuthNavigation()
  const { apiCall, loading } = useApi()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error("Please enter password")
      return
    }

    try {
      const response = await apiCall("/admin/verify", {
        method: "POST",
        body: JSON.stringify({ password }),
      })

      if (response.success && response.isMatch) {
        login()
      } else {
        toast.error("Invalid password")
      }
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(0,152,137)] to-[rgb(83,108,169)] p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(0,152,137)]/10 rounded-full mb-4">
            <Shield className="text-[rgb(0,152,137)]" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">KaamSetu Admin</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter password to access panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input pl-10"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Verifying..." : "Access Panel"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Secure access • Session timeout: 10 minutes</p>
        </div>
      </div>
    </div>
  )
}

export default Login
