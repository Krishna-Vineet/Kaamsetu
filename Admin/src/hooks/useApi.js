"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { getAdminToken, clearAdminToken } from "../lib/authToken"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.kaamsetu.co.in"

export const useApi = () => {
  const [loading, setLoading] = useState(false)

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true)
    try {
      const token = getAdminToken()

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          // Admin endpoints require a Bearer token issued by POST /admin/verify
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      // Session expired or missing: drop back to the login screen.
      if (response.status === 401 && token) {
        clearAdminToken()
        toast.error("Session expired. Please sign in again.")
        window.location.href = "/login"
        throw new Error(data.message || "Session expired")
      }

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      return data
    } catch (error) {
      toast.error(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { apiCall, loading }
}
