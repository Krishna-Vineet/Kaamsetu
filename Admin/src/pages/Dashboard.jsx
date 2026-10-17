"use client"

import { useEffect, useState } from "react"
import { useApi } from "../hooks/useApi"
import StatCard from "../components/StatCard"
import { Users, Briefcase, CheckCircle, Clock, DollarSign } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const Dashboard = () => {
  const { apiCall, loading } = useApi()
  const [stats, setStats] = useState(null)
  const [distribution, setDistribution] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, distRes] = await Promise.all([apiCall("/admin/stats"), apiCall("/admin/distribution/skills")])

      if (statsRes.success) setStats(statsRes.data)
      if (distRes.success) setDistribution(distRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const COLORS = ["#009889", "#536CA9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,152,137)] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Platform analytics and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} color="teal" />
        <StatCard title="Total Workers" value={stats.totalWorkers} icon={Users} color="blue" />
        <StatCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="orange" />
        <StatCard title="Completed Jobs" value={stats.completedJobs} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Verified Aadhaar" value={stats.verifiedAadhaar} icon={CheckCircle} color="green" />
        <StatCard title="Pending Aadhaar" value={stats.pendingAadhaar} icon={Clock} color="orange" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon={DollarSign} color="teal" />
      </div>

      {distribution && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Worker Distribution by Skill</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribution.workerDistribution}
                  dataKey="count"
                  nameKey="skill"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {distribution.workerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Job Distribution by Skill</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribution.jobDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="skill" className="text-xs" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#009889" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
