import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Eye,
  Play,
  Square,
  Loader2,
  Briefcase,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { jobsApi } from "../../api/jobs"
import { JOB_STATUS_COLORS, JOB_STATUS_DISPLAY_NAMES, SKILL_DISPLAY_NAMES } from "../../constants"

export default function Works() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedJob, setSelectedJob] = useState(null)
  const [showStartModal, setShowStartModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [completionOTP, setCompletionOTP] = useState("")
  const [enteredOTP, setEnteredOTP] = useState("")
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  useEffect(() => {
    fetchJobs()
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await jobsApi.getClientJobs({ status: 'all' })
      if (response.success) {
        setJobs(response.jobs)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to fetch jobs", {
        description: error.message || "Please try again"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelJob = async (jobId) => {
    try {
      setActionLoading(true)
      const job = jobs.find(j => j._id === jobId);
      
      // Check if job can be cancelled (only posted or assigned status)
      if (job && !['posted', 'assigned'].includes(job.status)) {
        toast.error("Cannot delete job", {
          description: `You can only delete jobs that are in 'posted' or 'assigned' status. Current status: ${job.status}`
        });
        return;
      }

      const response = await jobsApi.cancelJob(jobId);
      if (response.success) {
        // Remove the job from the local state instead of refetching
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
        setSelectedJob(null);
        setShowDeleteConfirm(false);
        setJobToDelete(null);
        toast.success("Job deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job", {
        description: error.message || "Please try again"
      });
    } finally {
      setActionLoading(false);
    }
  }

  const confirmDeleteJob = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setJobToDelete(null);
  }

  const handleStartJob = async (jobId) => {
    try {
      setActionLoading(true)
      const response = await jobsApi.startJob(jobId)
      if (response.success) {
        setShowStartModal(false)
        toast.success("Job started successfully")
        fetchJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Error starting job:", error)
      toast.error("Failed to start job", {
        description: error.message || "Please try again"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteJob = async (jobId) => {
    if (!enteredOTP.trim()) {
      toast.error("Please enter the completion OTP")
      return
    }

    try {
      setActionLoading(true)
      const response = await jobsApi.completeJob(jobId, enteredOTP)
      if (response.success) {
        setShowCompleteModal(false)
        setEnteredOTP("")
        toast.success("Job completed successfully")
        fetchJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Error completing job:", error)
      toast.error("Failed to complete job", {
        description: error.message || "Please try again"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRateWorker = async (jobId) => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    try {
      setIsSubmittingRating(true)
      const response = await jobsApi.rateWorker(jobId, rating, review)
      if (response.success) {
        setShowRatingModal(false)
        setRating(0)
        setReview("")
        toast.success("Rating submitted successfully")
        fetchJobs() // Refresh the list
      }
    } catch (error) {
      console.error("Error rating worker:", error)
      toast.error("Couldn't submit your rating", {
        description: error.response?.data?.message || "Your feedback is important to us. Please try submitting your rating again."
      })
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const getStatusBadge = (status) => {
    const color = JOB_STATUS_COLORS[status] || 'gray'
    const displayName = JOB_STATUS_DISPLAY_NAMES[status] || status
    
    return (
      <Badge variant={color === 'blue' ? 'default' : color === 'green' ? 'success' : color === 'red' ? 'destructive' : 'secondary'}>
        {displayName}
      </Badge>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'posted':
        return <Clock className="w-4 h-4" />
      case 'assigned':
        return <User className="w-4 h-4" />
      case 'active':
        return <Play className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (selectedTab === 'all') return true
    return job.status === selectedTab
  })

  const getJobActions = (job) => {
    // Show delete button for posted jobs
    if (job.status === 'posted') {
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => confirmDeleteJob(job._id)}
          disabled={actionLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {actionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Job'
          )}
        </Button>
      );
    }

    // Show start job button for assigned status
    if (job.status === 'assigned') {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedJob(job);
              setShowStartModal(true);
            }}
            disabled={actionLoading}
            className="bg-[#445FA2] text-white hover:bg-[#3a4f8a]"
          >
            Start Job
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDeleteJob(job._id)}
            disabled={actionLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Job'
            )}
          </Button>
        </div>
      );
    }

    // Show complete button for active jobs
    if (job.status === 'active') {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={() => {
            setSelectedJob(job);
            setShowCompleteModal(true);
          }}
          disabled={actionLoading}
          className="bg-green-500 hover:bg-green-700 hover:text-white"
        >
          Complete Job
        </Button>
      );
    }

    // Show rate button for completed jobs not yet rated
    if (job.status === 'completed') {
      const alreadyRated = (job.workerRating && job.workerRating > 0);
      if (job.workerId && !alreadyRated) {
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedJob(job);
              setShowRatingModal(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Rate Worker
          </Button>
        );
      }
      return null;
    }

    // Default return for any other status
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#445FA2]/10 via-white to-[#009889]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#445FA2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your works...</p>
        </div>
      </div>
    )
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent truncate">
                My Works
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage and track your posted jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className={`grid w-full grid-cols-5 bg-white/80 backdrop-blur-md shadow-lg transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#445FA2] data-[state=active]:to-[#009889] data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="posted" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#445FA2] data-[state=active]:to-[#009889] data-[state=active]:text-white">Posted</TabsTrigger>
            <TabsTrigger value="assigned" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#445FA2] data-[state=active]:to-[#009889] data-[state=active]:text-white">Assigned</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#445FA2] data-[state=active]:to-[#009889] data-[state=active]:text-white">Active</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#445FA2] data-[state=active]:to-[#009889] data-[state=active]:text-white">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <Card className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`} style={{ transitionDelay: '200ms' }}>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    {getStatusIcon(selectedTab)}
                  </div>
                  {selectedTab === 'all' ? 'All Jobs' : `${JOB_STATUS_DISPLAY_NAMES[selectedTab]} Jobs`}
                  <Badge className="bg-gradient-to-r from-[#445FA2] to-[#009889] text-white">
                    {filteredJobs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">Your jobs will appear here once you post them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job, index) => (
                      <div
                        key={job._id}
                        className={`flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 hover:shadow-lg hover:border-[#445FA2]/20 ${
                          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: `${400 + index * 100}ms` }}
                      >
                        {/* Job Image */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={job.image || "/placeholder.svg"}
                              alt={job.title}
                              className="w-full xl:w-32 h-32 sm:h-40 xl:h-32 object-cover rounded-2xl shadow-lg"
                            />
                            {job.urgency && (
                              <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 space-y-3 sm:space-y-4">
                          <div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                            <p className="text-gray-600 mb-3 text-sm sm:text-base leading-relaxed">{job.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4 text-[#445FA2]" />
                                {SKILL_DISPLAY_NAMES[job.skill] || job.skill}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-[#445FA2]" />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                              {job.address?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-[#445FA2]" />
                                  {job.address.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Worker Details - Only show for active/assigned jobs */}
                          {job.status !== 'completed' && (
                            <div className="bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
                              {job.workerId ? (
                                <>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#445FA2]" />
                                    Worker Details
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-700 font-medium">{job.workerId.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      <a href={`tel:${job.workerId.phone?.phone}`} className="text-[#009889] hover:underline font-medium">
                                        {job.workerId.phone?.phone}
                                      </a>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <span className="text-gray-400 flex items-center gap-2"> <span className="font-semibold italic text-gray-900 flex items-center gap-2"><User className="w-4 h-4 text-[#445FA2]" />Worker Details</span> - Not assigned yet</span>
                              )}
                            </div>
                          )}

                          {/* Status and Actions */}
                          <div className="space-y-3">
                            
                            {/* Worker Rating */}
                            {job.workerRating > 0 && job.status === 'completed' && (
                              <div className="bg-gradient-to-r from-green-50 to-green-100 p-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium text-green-700">Your rating:</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < job.workerRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {job.workerReview && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2 italic">
                                    "{job.workerReview}"
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Status and Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">Status:</span>
                                {getStatusBadge(job.status)}
                              </div>
                              <div className="flex items-center gap-2">
                                {getJobActions(job)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Start Job Modal */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              Start Job
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to start this job agreeing to worker's quotation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowStartModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => handleStartJob(selectedJob?._id)}
              disabled={actionLoading}
              className="bg-gradient-to-r from-[#445FA2] to-[#009889] hover:from-[#445FA2]/90 hover:to-[#009889]/90 rounded-xl"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Start Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Job Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              Complete Job
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Enter the completion OTP provided by the worker to mark this job as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-6">
            <div>
              <Label htmlFor="otp" className="text-base font-semibold text-gray-700">Completion OTP</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={enteredOTP}
                onChange={(e) => setEnteredOTP(e.target.value)}
                maxLength={6}
                className="mt-2 text-center text-lg font-mono tracking-widest rounded-xl border-2 focus:border-[#445FA2]"
                autoComplete="one-time-code"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowCompleteModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => handleCompleteJob(selectedJob?._id)}
              disabled={actionLoading || enteredOTP.length !== 6}
              className="bg-gradient-to-r from-[#009889] to-[#445FA2] hover:from-[#009889]/90 hover:to-[#445FA2]/90 rounded-xl"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Complete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              Rate Worker
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              How was your experience with the worker?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 my-6">
            <div>
              <Label className="text-base font-semibold text-gray-700">Rating</Label>
              <div className="flex items-center justify-center gap-2 mt-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-2 transition-all duration-200 hover:scale-110 rounded-full hover:bg-yellow-50"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review" className="text-base font-semibold text-gray-700">Review (Optional)</Label>
              <Textarea
                id="review"
                placeholder="Share your experience with this worker..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="mt-2 rounded-xl border-2 focus:border-[#445FA2] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowRatingModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => handleRateWorker(selectedJob?._id)}
              disabled={isSubmittingRating || rating === 0}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl"
            >
              {isSubmittingRating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Delete Job</DialogTitle>
            </div>
            <DialogDescription className="pt-4 text-gray-600">
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
              disabled={actionLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleCancelJob(jobToDelete)}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}