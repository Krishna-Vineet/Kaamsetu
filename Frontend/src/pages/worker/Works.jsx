

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, ExternalLink, Clock, CheckCircle, Star, Calendar, User, ArrowLeft, Trophy, AlertTriangle, X, Loader2, Info } from "lucide-react"
import { Link } from "react-router-dom"

import { toast } from "sonner"
import { jobsApi } from "../../api/jobs"
import { JOB_STATUS_COLORS, JOB_STATUS_DISPLAY_NAMES, SKILL_DISPLAY_NAMES } from "../../constants"

export default function WorkerWorksPage() {
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedJobForRating, setSelectedJobForRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  // Real data from API
  const [activeJob, setActiveJob] = useState(null)
  const [pastWorks, setPastWorks] = useState([])

  useEffect(() => {
    setIsVisible(true)
    fetchWorkerJobs()
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchWorkerJobs = async () => {
    try {
      setLoading(true)
      const response = await jobsApi.getWorkerJobs()
      if (response.success) {
        // Find active job (assigned or active status)
        const active = response.jobs.find(job => 
          job.status === 'assigned' || job.status === 'active'
        )
        setActiveJob(active || null)

        // Get completed jobs
        const completed = response.jobs.filter(job => 
          job.status === 'completed'
        )
        setPastWorks(completed)
      }
    } catch (error) {
      console.error("Error fetching worker jobs:", error)
      toast.error("Unable to load your jobs", {
        description: "We're having trouble loading your jobs. Please refresh the page or try again later."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteJob = async () => {
    try {
      setActionLoading(true)
      // Call to generate OTP
      const response = await jobsApi.getCompletionOTP(activeJob._id)
      if (response.success) {
        setGeneratedOTP(response.completionOTP)
        toast.success("OTP generated successfully")
      }
    } catch (error) {
      console.error("Error generating OTP:", error)
      toast.error("Unable to generate OTP", {
        description: "Please try again in a moment. If the problem persists, please contact support."
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelJob = async () => {
    try {
      setActionLoading(true)
      const response = await jobsApi.cancelJobByWorker(activeJob._id)
      if (response.success) {
        setIsCancelDialogOpen(false)
        setActiveJob(null)
        toast.success("Job cancelled successfully. The job is now available for other workers.")
        fetchWorkerJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Error cancelling job:", error)
      toast.error("Unable to cancel job", {
        description: "We couldn't process your cancellation request. Please try again or contact support if the issue continues."
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRateClient = (job) => {
    setSelectedJobForRating(job._id)
    // If job already has a rating, pre-fill the form
    if (job.clientRating) {
      setRating(job.clientRating)
      setReview(job.clientReview || "")
    } else {
      setRating(0)
      setReview("")
    }
    setIsRatingModalOpen(true)
  }
  
  const submitRating = async () => {
    if (!selectedJobForRating || rating === 0) return
    
    setIsSubmittingRating(true)
    
    try {
      const response = await jobsApi.rateClient(selectedJobForRating, rating, review)
      if (response.success) {
        // Update local state
        setPastWorks(prevWorks =>
          prevWorks.map(work => {
            if (work._id === selectedJobForRating) {
              return { ...work, clientRating: rating, clientReview: review || "" }
            }
            return work
          })
        )

        toast.success("Rating submitted successfully")
        setIsRatingModalOpen(false)
        setRating(0)
        setReview("")
        setSelectedJobForRating(null)
      }
    } catch (error) {
      console.error("Error rating client:", error)
      toast.error("Couldn't submit your rating", {
        description: error.response?.data?.message || "Your feedback is important to us. Please try submitting your rating again."
      })
    } finally {
      setIsSubmittingRating(false)
    }
  }

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

  const getDirections = (address) => {
    const encodedAddress = encodeURIComponent(address)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully got current location
          const { latitude, longitude } = position.coords
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodedAddress}&travelmode=driving`,
            "_blank"
          )
        },
        (error) => {
          // If user denies location access or there's an error, fall back to just showing the destination
          console.warn('Could not get current location:', error)
          toast.info('Opening destination in Google Maps. For directions from your current location, please enable location access.')
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank")
        }
      )
    } else {
      // Browser doesn't support geolocation
      toast.info('Opening destination in Google Maps. For directions, please enable location access in your browser settings.')
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank")
    }
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
              <Link to="/worker/find">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent truncate">
                My Works
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your active and completed jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Active Job Banner or No Active Job Message */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#445FA2]" />
          </div>
        ) : !activeJob ? (
          <Card 
            className={`mb-6 sm:mb-8 bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Job</h3>
              <p className="text-gray-600 mb-6 max-w-md">You don't have any active jobs at the moment. Find new opportunities to work on.</p>
              <Button asChild className="bg-gradient-to-r from-[#445FA2] to-[#009889] hover:from-[#445FA2]/90 hover:to-[#009889]/90 transition-all duration-300 rounded-xl">
                <Link to="/worker/find">Find Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card 
            className={`mb-6 sm:mb-8 border-l-4 border-l-[#F5A623] bg-white/80 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5A623]/5 to-[#009889]/5 opacity-50"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-[#445FA2] text-lg sm:text-xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#F5A623] to-[#F5A623]/90 rounded-lg flex items-center justify-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                Active Job
                <Badge className="bg-gradient-to-r from-[#F5A623] to-[#F5A623]/90 text-white">
                  {activeJob.status === 'assigned' ? "Wait for Client's approval to Start the Job" : activeJob.status === 'active' ? "Job is Active" : "In Progress"}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4 sm:space-y-6">
              <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
                {/* Job Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={activeJob.image || "/placeholder.svg"}
                      alt={activeJob.title}
                      className="w-full xl:w-32 h-32 sm:h-40 xl:h-32 object-cover rounded-2xl shadow-lg"
                    />
                    {/* Removed badge */}
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">{activeJob.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base leading-relaxed">{activeJob.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#445FA2]" />
                      Client Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{activeJob.clientId?.name || "Client"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${activeJob.clientId?.phone?.phone || ""}`} className="text-[#009889] hover:underline font-medium">
                          {activeJob.clientId?.phone?.phone || "Phone not available"}
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {activeJob.address ? 
                            `${activeJob.address.street || ""}, ${activeJob.address.city || ""}, ${activeJob.address.state || ""} - ${activeJob.address.pincode || ""}`.replace(/^,\s*|,\s*$/g, '') :
                            "Address not available"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => getDirections(activeJob.address ? 
                        `${activeJob.address.street || ""}, ${activeJob.address.city || ""}, ${activeJob.address.state || ""} - ${activeJob.address.pincode || ""}`.replace(/^,\s*|,\s*$/g, '') :
                        "Address not available"
                      )}
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-2 border-[#445FA2] text-[#445FA2] hover:bg-[#445FA2] hover:text-white transition-all duration-300 rounded-xl h-10 sm:h-12"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Get Directions
                    </Button>
                    
                    <Button
                      onClick={() => setIsCancelDialogOpen(true)}
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded-xl h-10 sm:h-12"
                    >
                      <X className="w-4 h-4" />
                      Cancel Job
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={handleCompleteJob} 
                          className="bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105 rounded-xl h-10 sm:h-12"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Job
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            Job Completion
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 sm:space-y-6">
                          <p className="text-gray-700">Please share this OTP with the client to complete the job:</p>
                          <div className="text-center space-y-4">
                            <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent p-4 sm:p-6 rounded-2xl border-2 border-gray-200">
                              {generatedOTP || "Generating..."}
                            </div>
                            <p className="text-sm text-gray-600">
                              The client needs to enter this OTP in their app to confirm job completion.
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>This OTP is valid for 1 hour. The job will be marked as completed only after the client verifies the OTP.</span>
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Works */}
        <Card 
          className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              Past Works
              <Badge className="bg-gradient-to-r from-[#009889] to-[#445FA2] text-white">
                {pastWorks.length} Completed
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {pastWorks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past works yet</h3>
                <p className="text-gray-600">Your completed jobs will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastWorks.map((work, index) => (
                  <div
                    key={work._id}
                    className={`flex flex-col lg:flex-row gap-4 p-4 sm:p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 hover:shadow-lg hover:border-[#445FA2]/20 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    {/* Work Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={work.image || "/placeholder.svg"}
                        alt={work.title}
                        className="w-full lg:w-20 h-20 sm:h-24 lg:h-20 object-cover rounded-2xl shadow-md"
                      />
                    </div>

                    {/* Work Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1">{work.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">Client: <span className="font-medium">{work.clientId?.name || "Client"}</span></p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {formatTimeAgo(work.completedAt || work.updatedAt)}
                            </span>
                          </div>
                        </div>

                      </div>
                        {/* Rating Section */}
                        <div className="mt-3 sm:mt-0">
                          {work.clientRating > 0 ? (
                            <div className="flex flex-col gap-1 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                              <div className="flex items-center">
                                <span className="text-xs sm:text-sm text-green-700 font-medium mr-1">Your Rating:</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                      i < work.clientRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {work.clientReview && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  "{work.clientReview}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRateClient(work)}
                              className="text-xs sm:text-sm text-yellow-600 border-yellow-200 hover:bg-yellow-50 group"
                            >
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
                              Rate Client
                            </Button>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Cancel Job Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cancel Job
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p>Are you sure you want to cancel this job?</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Warning:</strong>
                       Cancelling an active job will result in a <span className="font-bold">₹50 fine</span>.
                      The job will be made available for other workers to accept.
                    </p>
                  </div>
                </div>
              </div>
              <p>This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} className="bg-gray-50 border-gray-400 hover:border-gray-800 hover:bg-gray-300 mr-4">
              No, Keep Job
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancelJob}
              className="bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600"
            >
              Yes, Cancel Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rate Client Modal */}
      <Dialog open={isRatingModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRatingModalOpen(false)
          setRating(0)
          setReview("")
        } else {
          setIsRatingModalOpen(true)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <DialogTitle className="text-lg">Rate Client</DialogTitle>
                <DialogDescription className="text-sm">
                  Share your experience with this client
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-2 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">How would you rate your experience?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 transition-all duration-200 ${rating >= star ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                    disabled={isSubmittingRating}
                  >
                    <Star
                      className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    strokeWidth={rating === star ? 3 : 1.5}
                    fill={rating >= star ? 'currentColor' : 'none'}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    aria-checked={rating === star}
                    role="radio"
                  />
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium">
                Share more details (optional)
              </label>
              <Textarea
                id="review"
                placeholder="What made this experience good or bad?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSubmittingRating}
              />
              <p className="text-xs text-gray-500">
                Your feedback helps us improve our platform.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRatingModalOpen(false)
                setRating(0)
                setReview("")
              }}
              disabled={isSubmittingRating}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitRating} 
              disabled={rating === 0 || isSubmittingRating}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
            >
              {isSubmittingRating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}