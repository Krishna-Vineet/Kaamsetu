"use client"

import { useEffect, useState } from "react"
import { useApi } from "../hooks/useApi"
import { Search, Shield, ShieldOff, CheckCircle, Clock, User } from "lucide-react"
import toast from "react-hot-toast"

const UserManagement = () => {
  const { apiCall, loading } = useApi()
  const [users, setUsers] = useState([])
  const [roleTab, setRoleTab] = useState("client")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [roleTab])

  const fetchUsers = async () => {
    try {
      const response = await apiCall(`/admin/users?role=${roleTab}`)
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleBlock = async (userId) => {
    try {
      const response = await apiCall(`/admin/users/${userId}/block`, {
        method: "PATCH",
        body: JSON.stringify({ role: roleTab }),
      })

      if (response.success) {
        toast.success("User blocked successfully")
        fetchUsers()
      }
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  const handleUnblock = async (userId) => {
    try {
      const response = await apiCall(`/admin/users/${userId}/unblock`, {
        method: "PATCH",
        body: JSON.stringify({ role: roleTab }),
      })

      if (response.success) {
        toast.success("User unblocked successfully")
        fetchUsers()
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.email?.toLowerCase().includes(searchLower) ||
      user.address?.city?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage clients and workers on the platform</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setRoleTab("client")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                roleTab === "client"
                  ? "bg-[rgb(83,108,169)] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setRoleTab("worker")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                roleTab === "worker"
                  ? "bg- text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Workers
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border- mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                  {roleTab === "worker" && <th className="px-4 py-3 text-left text-sm font-semibold">Skills</th>}
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-/10 rounded-full flex items-center justify-center">
                          <User className="text-" size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{typeof user.email === 'object' ? user.email.email : user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {typeof user.phone === 'object' ? user.phone.phone : (user.phone || "N/A")}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{user.address?.city || "N/A"}</p>
                    </td>
                    {roleTab === "worker" && (
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.skills?.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[rgb(0,152,137)]/10 text-[rgb(0,152,137)] rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit ${
                            user.aadhaarVerified
                              ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {user.aadhaarVerified ? (
                            <>
                              <CheckCircle size={12} /> Verified
                            </>
                          ) : (
                            <>
                              <Clock size={12} /> Unverified
                            </>
                          )}
                        </span>
                        {user.blocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.blocked ? (
                        <button
                          onClick={() => handleUnblock(user._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                        >
                          <Shield size={16} />
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(user._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                        >
                          <ShieldOff size={16} />
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
