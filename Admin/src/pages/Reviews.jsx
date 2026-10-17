"use client"

import { useEffect, useState } from "react"
import { useApi } from "../hooks/useApi"
import { Search, Star, Trash2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const Reviews = () => {
  const { apiCall, loading } = useApi()
  const [reviews, setReviews] = useState([])
  const [showLowRatingOnly, setShowLowRatingOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [showLowRatingOnly])

  const fetchReviews = async () => {
    try {
      const endpoint = showLowRatingOnly ? "/admin/reviews?lowRating=true" : "/admin/reviews"
      const response = await apiCall(endpoint)
      if (response?.success && Array.isArray(response.data?.reviews)) {
        // Transform the data to match the expected format
        const formattedReviews = response.data.reviews.map(review => ({
          ...review,
          // Map the review data to match the expected structure
          reviewerId: review.reviewType === 'client-to-worker' 
            ? { name: review.clientId?.name || 'Client' } 
            : { name: review.workerId?.name || 'Worker' },
          revieweeId: review.reviewType === 'client-to-worker'
            ? { name: review.workerId?.name || 'Worker' }
            : { name: review.clientId?.name || 'Client' },
          jobId: review.jobId || { title: 'Job' },
          comment: review.review,
          rating: review.rating || 0
        }));
        setReviews(formattedReviews);
      } else {
        setReviews([]);
        if (!response?.success) {
          toast.error(response?.message || "Failed to load reviews");
        } else {
          toast.error("No reviews found");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(error.response?.data?.message || "Failed to load reviews");
      setReviews([]);
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      const response = await apiCall(`/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.success) {
        toast.success("Review deleted successfully")
        setReviews(prev => prev.filter((r) => r._id !== reviewId))
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error("Failed to delete review")
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (!review) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      (review.jobId?.title?.toLowerCase() || '').includes(searchLower) ||
      (review.reviewerId?.name?.toLowerCase() || '').includes(searchLower) ||
      (review.revieweeId?.name?.toLowerCase() || '').includes(searchLower)
    )
  })

  const renderStars = (rating) => {
    const numRating = Number(rating)
    if (isNaN(numRating)) return null
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={star <= numRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Review & Dispute Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor and manage platform reviews</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by job title or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#009889]"
            />
          </div>

          <label className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showLowRatingOnly}
              onChange={(e) => setShowLowRatingOnly(e.target.checked)}
              className="w-4 h-4 text-[#009889] rounded focus:ring-2 focus:ring-[#009889]"
            />
            <span className="text-sm font-medium">Low ratings only (≤2)</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009889] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div
                key={review._id}
                className={`card ${review.rating <= 2 ? "border-2 border-red-500 dark:border-red-400" : ""}`}
              >
                {review.rating <= 2 && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">Low Rating Alert</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-semibold">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      for job: <span className="font-medium">{review.jobId?.title || "N/A"}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Review Type:</span>
                    <span className="font-medium capitalize">{review.reviewType?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">From:</span>
                    <span className="font-medium">{review.reviewerId?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">To:</span>
                    <span className="font-medium">{review.revieweeId?.name || "N/A"}</span>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "Date not available"}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No reviews found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reviews