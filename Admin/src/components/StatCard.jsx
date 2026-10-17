const StatCard = ({ title, value, icon: Icon, color = 'teal' }) => {
    const colorClasses = {
      teal: "bg-[rgb(0,152,137)]/10 text-[rgb(0,152,137)]",
      blue: "bg-[rgb(83,108,169)]/10 text-[rgb(83,108,169)]",
      green: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      orange: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    }
  
    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    )
  }
  
  export default StatCard
  