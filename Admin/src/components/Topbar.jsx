"use client"
import { LogOut, Clock, Plus } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Topbar = () => {
  const { timeRemaining, formatTime, logout, addTime } = useAuth()

  const canAddTime = timeRemaining < 180 && timeRemaining > 0
  const isLowTime = timeRemaining < 180

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isLowTime
              ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Clock size={18} />
          <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
        </div>
        <button
          onClick={addTime}
          disabled={!canAddTime}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            canAddTime
              ? "bg-[rgb(0,152,137)] hover:bg-[rgb(0,152,137)]/90 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          <Plus size={16} />
          <span className="text-sm font-medium">2 min</span>
        </button>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
      >
        <LogOut size={18} />
        <span className="font-medium">Logout</span>
      </button>
    </header>
  )
}

export default Topbar
