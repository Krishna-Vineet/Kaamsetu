"use client"

import { useEffect, useState } from "react"
import { useApi } from "../hooks/useApi"
import { Search, CheckCircle, XCircle, Eye, User, FileText, X, ZoomIn, ZoomOut, Download } from "lucide-react"
import toast from "react-hot-toast"

const AadhaarVerification = () => {
  const { apiCall, loading } = useApi()
  // Initialize with null to distinguish between not loaded and empty array
  const [verifications, setVerifications] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [previewUrl, setPreviewUrl] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    fetchPendingVerifications()
  }, [])

  const fetchPendingVerifications = async () => {
    try {
      const response = await apiCall("/admin/verification/pending")
      if (response?.success) {
        // Handle the nested response structure: response.data.pendingVerifications
        const verificationsData = response.data?.pendingVerifications || [];
        
        // Transform the data to match the expected format in the component
        const formattedVerifications = verificationsData.map(verification => ({
          ...verification,
          // Flatten email and aadhaarNumber for easier access
          email: verification.email?.email || '',
          phone: verification.phone?.phone || '',
          aadhaarNumber: verification.aadhaar?.number || '',
          documentUrl: verification.aadhaar?.documentUrl || ''
        }));
        
        setVerifications(formattedVerifications);
      } else {
        setVerifications([]);
        toast.error("Failed to load verifications");
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to fetch verifications. Please try again.");
      setVerifications([]);
    }
  }

  const handleApprove = async (id, role) => {
    try {
      const response = await apiCall(`/admin/verification/approve/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })

      if (response.success) {
        toast.success("Aadhaar verified successfully")
        setVerifications((prev) => prev.filter((v) => v._id !== id))
      }
    } catch (error) {
      console.error("Error approving verification:", error)
    }
  }

  const handleReject = async (id, role) => {
    try {
      const response = await apiCall(`/admin/verification/reject/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })

      if (response.success) {
        toast.success("Aadhaar verification rejected")
        setVerifications((prev) => prev.filter((v) => v._id !== id))
      }
    } catch (error) {
      console.error("Error rejecting verification:", error)
    }
  }

  // Safely filter verifications, defaulting to an empty array if verifications is not an array
  const filteredVerifications = (Array.isArray(verifications) ? verifications : []).filter((v) => {
    if (!v) return false;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = v.name?.toLowerCase().includes(searchLower) || false;
    const aadhaarMatch = v.aadhaarNumber?.toString().includes(searchTerm) || false;
    const emailMatch = v.email?.toLowerCase().includes(searchLower) || false;
    const matchesSearch = nameMatch || aadhaarMatch || emailMatch;
    const matchesRole = roleFilter === "all" || v.role === roleFilter;
    return matchesSearch && matchesRole;
  })

  const handlePreview = (url) => {
    setPreviewUrl(url);
    setZoomLevel(1);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const isPdf = (url) => {
    return url?.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className="space-y-6 relative">
      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={zoomIn} 
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={zoomOut} 
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <a 
                  href={previewUrl} 
                  download 
                  className="p-2 text-[rgb(0,152,137)] hover:bg-[rgb(0,152,137)]/10 dark:hover:bg-[rgb(0,152,137)]/20 rounded"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button 
                  onClick={closePreview} 
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <div className="transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}>
                {isPdf(previewUrl) ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-[70vh] border-0"
                    title="Document Preview"
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Document Preview" 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold mb-2">Aadhaar Verification Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Review and approve pending Aadhaar verifications</p>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or Aadhaar number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input md:w-48">
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="worker">Workers</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,152,137)] mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading verifications...</p>
        </div>
      ) : verifications === null ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Failed to load verifications. Please try again.</p>
        </div>
      ) : filteredVerifications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-xl font-medium text-gray-500 dark:text-gray-400">No pending verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVerifications.map((verification) => (
            <div key={verification._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[rgb(0,152,137)]/10 dark:bg-[rgb(0,152,137)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="text-[rgb(0,152,137)]" size={26} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{verification.name}</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          verification.role === "client"
                            ? "bg--100 dark:bg--900/30 text--700 dark:text--300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {verification.role.charAt(0).toUpperCase() + verification.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Aadhaar</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{verification.aadhaarNumber}</p>
                      </div>
                      {verification.email && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{verification.email}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Document</p>
                        <button 
                          onClick={() => handlePreview(verification.documentUrl)}
                          className="text--500 hover:text--600 dark:text--400 dark:hover:text--300 text-sm font-medium flex items-center gap-1.5"
                        >
                          <FileText size={16} />
                          {isPdf(verification.documentUrl) ? 'View PDF Document' : 'View Document Image'}
                        </button>
                      </div>

                      {verification.phone && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{verification.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handlePreview(verification.documentUrl)}
                      className="p-2 text-gray-500 hover:text--500 hover:bg--50 dark:text-gray-400 dark:hover:bg--900/20 rounded-lg transition-colors duration-200"
                      title="View Document"
                    >
                      <Eye size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(verification._id, verification.role)}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(verification._id, verification.role)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AadhaarVerification
