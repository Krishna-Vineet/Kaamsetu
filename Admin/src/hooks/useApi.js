"use client"

import { useState } from "react"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.kaamsetu.co.in"

export const useApi = () => {
  const [loading, setLoading] = useState(false)

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

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
