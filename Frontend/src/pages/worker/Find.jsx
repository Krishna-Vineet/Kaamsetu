

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MapPin, Clock, User, CheckCircle, Calendar, Search, Filter, ArrowLeft, Zap, Award, RefreshCw, Loader2, AlertCircle, Navigation, Briefcase, Phone, AlertTriangle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { toast } from "sonner"
import { jobsApi } from "../../api/jobs"
import { services as serviceList } from "../../lib/services"

// Helper function to convert service names to backend format (kebab-case)
const convertToBackendFormat = (serviceName) => {
  return serviceName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, '')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Helper function to convert backend format to display format
const convertToDisplayFormat = (backendName) => {
  if (!backendName || typeof backendName !== 'string') {
    return backendName
  }
  return backendName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
import { useAuthStore } from "../../store/auth"
import { calculateDistanceWithCache, formatDistance, isValidCoordinates } from "../../utils/distance"
import { geocodeAddress } from "../../utils/geocoding"

export default function FindWorkPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [selectedService, setSelectedService] = useState("For you")
  const [distance, setDistance] = useState([25])
  const [acceptingJob, setAcceptingJob] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [workerJobs, setWorkerJobs] = useState([])
  const [hasActiveJob, setHasActiveJob] = useState(false)
  const [jobDistances, setJobDistances] = useState({})
  const [workerLocation, setWorkerLocation] = useState(null)
  const [calculatingDistances, setCalculatingDistances] = useState(false)
  const refreshTimerRef = useRef(null)

  // Services with active jobs highlighted
  const services = [
    { name: "For you", hasActiveJobs: true },
    { name: "All Services", hasActiveJobs: true },
    ...serviceList.map(skill => ({
      name: skill.name
    }))
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to view and apply for available jobs"
      })
      navigate("/auth/login")
      return
    }

    const initializeData = async () => {
      await checkWorkerActiveJobs()
      await fetchJobs()
    }
    
    initializeData()
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current)
      }
    }
  }, [isAuthenticated, navigate])

  // Remove auto-filtering useEffect - filters will only apply when button is clicked

  // Remove distance calculation useEffect - distances now calculated in backend

  // Fetch worker location from profile
  const fetchWorkerLocation = async () => {
    try {
      // Import worker API to get profile
      const { workerApi } = await import("../../api/worker")
      const response = await workerApi.getProfile()
      
      // Check if worker has location coordinates
      if (response.success && response.worker) {
        if (response.worker.address && response.worker.address.location && 
            response.worker.address.location.lat && response.worker.address.location.lon) {
          setWorkerLocation(response.worker.address.location)
        } else {
          toast.info("Location needed for accurate job matching", {
            description: "Update your location in account settings to see distances to jobs near you"
          })
        }
      }
    } catch (error) {
      console.error("Error fetching worker location:", error)
    }
  }

  // Check if worker has any active jobs
  const checkWorkerActiveJobs = async () => {
    try {
      const response = await jobsApi.getWorkerJobs()
      if (response.success) {
        const activeJobs = response.jobs.filter(job => 
          job.status === 'assigned' || job.status === 'active' || job.status === 'in-progress'
        )
        
        setWorkerJobs(response.jobs)
        setHasActiveJob(activeJobs.length > 0)
      }
    } catch (error) {
      console.error("Error checking worker jobs:", error)
    }
  }

  const fetchJobs = async (applyFilters = false) => {
    try {
      if (applyFilters) {
        setIsApplyingFilters(true)
      } else {
        setLoading(true)
      }
      
      // Build query parameters
      const params = {
        skill: selectedService === "For you" || selectedService === "All Services" 
          ? selectedService 
          : convertToBackendFormat(selectedService),
        maxDistance: distance[0]
      }
      
      const response = await jobsApi.getAvailableJobs(params)
      if (response.success) {
        setJobs(response.jobs)
        setFilteredJobs(response.jobs) // Set filtered jobs directly from backend
        setLastRefreshed(new Date())
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Couldn't load jobs", {
        description: "We're having trouble loading available jobs. Please check your connection and try again."
      })
    } finally {
      setLoading(false)
      setIsApplyingFilters(false)
    }
  }

  // Apply filters function
  const applyFilters = async () => {
    await fetchJobs(true)
  }

  const handleAcceptJob = async (jobId) => {
    // Check if worker is authenticated
    if (!isAuthenticated) {
      toast.error("Sign in required", {
        description: "Please sign in to accept jobs"
      })
      navigate("/auth/login")
      return
    }

    // Check if worker has an active job
    if (hasActiveJob) {
      toast.warning("Active job in progress", {
        description: "Please complete or cancel your current job before accepting a new one"
      })
      return
    }

    setAcceptingJob(jobId)
    
    try {
      const response = await jobsApi.acceptJob(jobId)
      if (response.success) {
        toast.success("Job accepted!", {
          description: "You've been assigned this job. Check your active jobs to get started."
        })
        
        // Update the local state to reflect the job is no longer available
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId))
        setFilteredJobs(prevJobs => prevJobs.filter(job => job._id !== jobId))
        
        // Navigate to worker works page
        setTimeout(() => {
          navigate("/worker/works")
        }, 1000)
      }
    } catch (error) {
      console.error("Error accepting job:", error)
      
      // Check if it's a conflict error
      if (error.response?.status === 409 || error.response?.data?.conflict) {
        toast.info("Job no longer available", {
          description: "This job has been assigned to another worker. Check out other available jobs!"
        })
        // Refetch jobs with current filters
        await applyFilters()
      } else {
        toast.error("Couldn't accept job", {
          description: "We couldn't process your request. Please try again in a moment."
        })
      }
    } finally {
      setAcceptingJob(null)
    }
  }
  
  // Remove refreshJobs function - replaced by applyFilters

  // Old applyFilters function removed - replaced with new backend-based version

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const jobDate = new Date(dateString)
    const diffInHours = Math.floor((now - jobDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  const getUrgencyColor = (urgency) => {
    return urgency ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600';
  }

  const getUrgencyBadge = (urgency) => {
    return urgency ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#445FA2]/10 via-white to-[#009889]/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles - Responsive sizes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-4 sm:h-4 bg-[#445FA2]/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-[#009889]/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 sm:w-5 sm:h-5 bg-[#445FA2]/25 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-[#009889]/35 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Large Glowing Orbs - Responsive sizes */}
        <div 
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-[#445FA2]/10 rounded-full blur-3xl animate-bounce" 
          style={{ 
            animationDuration: '6s', 
            animationDelay: '0s',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        ></div>
        <div 
          className="absolute top-3/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#009889]/10 rounded-full blur-3xl animate-bounce" 
          style={{ 
            animationDuration: '7s', 
            animationDelay: '1s',
            transform: `translateY(${scrollY * -0.1}px)`
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 border-b border-[#445FA2]/10 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div 
            className={`flex items-center gap-2 sm:gap-4 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="hover:bg-[#445FA2]/10 transition-all duration-300 rounded-full p-2"
            >
              <Link to="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent truncate">
                Find Work
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Discover jobs that match your skills and location</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Hero Section */}
        <div 
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4 sm:mb-6">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-[#445FA2]" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Live Job Opportunities</span>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#009889]" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
            Find Your Next{" "}
            <span className="text-[#009889] relative animate-bounce" style={{ animationDuration: '2s' }}>
              Opportunity
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Browse available jobs in your area and start earning today
          </p>
        </div>

        {/* Filters */}
        <Card 
          className={`mb-6 sm:mb-8 bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
              Filter Jobs
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 sm:gap-6">
              {/* Service Selection */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Service Category</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10 sm:h-12 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-96 overflow-y-auto">
                    {services.map((service) => (
                      <SelectItem key={service.name} value={service.name} className="text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <span>{service.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Distance Filter */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Distance: <span className="text-[#009889] font-bold">{distance[0]} km</span>
                </label>
                <div className="px-2">
                  <Slider 
                    value={distance}
                    onValueChange={setDistance} 
                    max={75} 
                    min={1} 
                    step={1} 
                    className="w-full bg-gray-300"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>75 km</span>
                  </div>
                </div>
              </div>
              
              {/* Apply Filter Button */}
              <div className="flex justify-center lg:justify-start lg:flex-shrink-0">
                <Button 
                  onClick={applyFilters}
                  disabled={isApplyingFilters}
                  className="bg-gradient-to-r from-[#445FA2] to-[#445FA2]/90 hover:from-[#445FA2]/90 hover:to-[#445FA2] transition-all duration-300 rounded-xl px-8 py-2 h-10 sm:h-12"
                >
                  {isApplyingFilters ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying Filters...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Last Refreshed Time */}
            <div className="text-xs text-gray-500 mt-3 text-right">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* Active Job Warning */}
        {hasActiveJob && (
          <Card 
            className={`mb-6 sm:mb-8 bg-orange-50/80 backdrop-blur-md border-2 border-orange-200 shadow-2xl transition-all duration-500 relative overflow-hidden ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">
                    You have an active job
                  </h3>
                  <p className="text-sm text-orange-700">
                    Complete your current job before accepting new ones. 
                    <Link 
                      to="/worker/works" 
                      className="ml-1 underline hover:text-orange-800 font-medium"
                    >
                      View your active jobs →
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs Grid */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#445FA2]" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more opportunities</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job, index) => (
              <Card 
                key={job._id} 
                className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${hoveredIndex === index ? 'ring-2 ring-[#445FA2]/20' : ''}`}
                style={{ transitionDelay: `${400}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Job Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={job.image || "/placeholder.svg"}
                          alt={job.title}
                          className="w-full lg:w-32 h-32 sm:h-40 lg:h-32 object-cover rounded-2xl shadow-lg"
                        />
                        {job.urgency && (
                          <div className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full animate-pulse">
                            <Zap className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{job.title}</h3>
                            {job.urgency && (
                              <Badge variant="destructive" className="flex items-center gap-1 ml-2 text-xs bg-red-500">
                                <Zap className="w-3 h-3" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 align-center mr-2">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(job.createdAt)}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 text-sm sm:text-base leading-relaxed line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-[#445FA2]" />
                            {convertToDisplayFormat(job.skill)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-[#445FA2]" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          {job.address?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-[#445FA2]" />
                              {job.address.city}
                              {job.distance && (
                                <span className="text-[#009889] ml-1">
                                  ({job.distance.toFixed(1)} km)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between">

                        {/* Client Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="font-medium">Client:</span>
                          <span className="flex items-center gap-1">
                            {job.clientId?.name || "Client"}
                            {job.clientId?.isAadhaarVerified && (
                              <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-100 text-xs h-4 px-1.5">
                                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                                Verified
                              </Badge>
                            )}
                          </span>
                        </div>

                        {/* Accept Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleAcceptJob(job._id)}
                            className={`bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105 rounded-xl shadow-lg w-full sm:w-auto`}
                            size="lg"
                            title={hasActiveJob ? 'Complete your current job before accepting new ones' : ''}
                            >
                            {acceptingJob === job._id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Accepting...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Accept Job
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}