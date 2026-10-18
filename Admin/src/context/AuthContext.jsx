"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { getAdminToken, setAdminToken, clearAdminToken } from "../lib/authToken"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const useAuthNavigation = () => {
  const navigate = useNavigate()
  const { isAuthenticated, login: loginFn, logout: logoutFn } = useAuth()

  const login = useCallback((token) => {
    // token comes from POST /admin/verify — without it the admin API
    // has no Bearer credential and every call returns 401.
    loginFn(token)
    navigate("/dashboard")
  }, [loginFn, navigate])

  const logout = useCallback(() => {
    logoutFn()
    navigate("/login")
  }, [logoutFn, navigate])

  return { login, logout, isAuthenticated }
}

export const AuthProvider = ({ children }) => {
  // Restore the session if the tab was refreshed within the token lifetime.
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken())
  const [timeRemaining, setTimeRemaining] = useState(() => (getAdminToken() ? 600 : 0))

  // Logout function
  const logout = useCallback(() => {
    clearAdminToken()
    setIsAuthenticated(false)
    setTimeRemaining(0)
    toast.success("Logged out successfully")
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (isAuthenticated) {
        logout()
        toast.error("Session expired")
      }
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isAuthenticated, logout])

  // Login function — persists the admin JWT after a successful /admin/verify exchange
  const login = useCallback((token) => {
    if (token) {
      setAdminToken(token)
    }
    setIsAuthenticated(true)
    setTimeRemaining(600) // 10 minutes in seconds
    toast.success("Login successful")
  }, [])

  // Add time function
  const addTime = useCallback(() => {
    if (timeRemaining < 180) {
      setTimeRemaining((prev) => prev + 120)
      toast.success("Added 2 minutes")
    } else {
      toast.error("Can only add time when less than 3 minutes remaining")
    }
  }, [timeRemaining])

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        timeRemaining,
        formatTime,
        login,
        logout,
        addTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}