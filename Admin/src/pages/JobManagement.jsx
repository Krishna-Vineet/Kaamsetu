"use client"

import { useState, useEffect } from "react"
import { useApi } from "../hooks/useApi"
import { Search, Filter, DollarSign, Clock, MapPin, User, Briefcase } from "lucide-react"
import toast from "react-hot-toast"

const JobManagement = () => {
  const { apiCall, loading } = useApi()
  const [jobs, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter] = useState("all")
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await apiCall("/admin/jobs")
      if (response?.success && response?.data?.jobs) {
        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : [])
      } else {
        setJobs([])
        toast.error("No jobs data found")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load jobs")
      setJobs([])
    }
  }


  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    if (!job) return false
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = job.title?.toLowerCase().includes(searchLower) || 
                         job.skill?.toLowerCase().includes(searchLower) || 
                         job.clientId?.name?.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "posted":
        return "bg-[rgb(0,152,137)]/10 text-[rgb(0,152,137)] dark:bg-[rgb(0,152,137)]/20 dark:text-[rgb(0,152,137)]"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const hasFilters = searchTerm
  const noJobsFound = !loading && jobs.length === 0
  const noMatchingJobs = !loading && jobs.length > 0 && filteredJobs.length === 0 && searchTerm

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Job Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage and monitor all job postings</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${jobs.length === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder={jobs.length === 0 ? "No jobs to search" : "Search jobs..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={jobs.length === 0}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${jobs.length === 0 ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#009889]'} focus:outline-none`}
            />
          </div>

        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009889] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3">Posted By</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {noJobsFound ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No jobs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      There are no jobs in the system yet. Check back later or add a new job.
                    </p>
                  </td>
                </tr>
              ) : noMatchingJobs ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No matching jobs</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                      We couldn't find any jobs matching your filters.
                    </p>
                    {hasFilters && (
                      <button
                        onClick={() => {
                          setSearchTerm('')
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#009889] hover:bg-[#00877a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009889] transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#009889]/10 text-[#009889]">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {job.skill || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{job.clientId?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {job.clientId?.email?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                        <span>{job.address?.city || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default JobManagement