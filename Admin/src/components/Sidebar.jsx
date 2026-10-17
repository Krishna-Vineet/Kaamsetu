import { NavLink } from "react-router-dom"
import { LayoutDashboard, CheckCircle, Users, Briefcase, Star } from "lucide-react"
import logo from "../assets/logo.png"

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/verification", icon: CheckCircle, label: "Aadhaar Verification" },
    { to: "/users", icon: Users, label: "User Management" },
    { to: "/jobs", icon: Briefcase, label: "Job Management" },
    { to: "/reviews", icon: Star, label: "Reviews" },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
        <div className="h-16 mb-3">
          <img 
            src={logo} 
            alt="KaamSetu Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[rgb(0,152,137)] to-[rgb(83,108,169)] bg-clip-text text-transparent">
          KaamSetu
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Admin Panel</p>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[rgb(0,152,137)] text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
