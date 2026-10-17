import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Briefcase, Shield, Edit, Edit3, Save, X, User, Trophy, Star, Award, KeyRound, LifeBuoy, LogOut, Camera, MapPin, ShieldCheck, ShieldAlert, BadgeCheck, BadgeAlert, UploadCloud, CheckCircle, Loader2, Upload, Trash2, Lock, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "../../store/auth"
import { authApi } from "../../api/auth"
import { workerApi } from "../../api/worker"
import { geocodeAddress, getCurrentLocation } from "@/utils/geocoding"
import { services } from "../../lib/services"

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
  return backendName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
import OtpModal from "../../components/OtpModal"
import AadhaarModal from "../../components/AadhaarModal"

export default function WorkerAccountPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isValidatingLocation, setIsValidatingLocation] = useState(false)
  const [locationValidated, setLocationValidated] = useState(false)
  const [geocodingResult, setGeocodingResult] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState({ email: true, phone: true })
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [verificationTarget, setVerificationTarget] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false)
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false)
  const [aadhaarVerificationStatus, setAadhaarVerificationStatus] = useState('none')
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Real data from API
  const [profileData, setProfileData] = useState(null)
  const [editData, setEditData] = useState(null)
  const [stats, setStats] = useState({
    rating: 0,
    totalJobs: 0,
    completionRate: 0,
    responseTime: "< 2 hours",
  })

  const availableServices = services.map(service => service.name)

  useEffect(() => {
    setIsVisible(true)
    fetchProfile()
    fetchStats()
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await workerApi.getProfile()
      if (response.success) {
        const worker = response.worker
        const formattedData = {
          name: worker.name,
          phone: worker.phone?.phone || "",
          email: worker.email?.email || "",
          address: formatAddress(worker.address),
          bio: worker.bio || "",
          services: (worker.skills || []).map(skill => convertToDisplayFormat(skill)),
          experience: worker.experience?.toString() || "1",
          profilePicture: worker.profilePicture || "/placeholder.svg",
          isPhoneVerified: worker.phone?.verified || false,
          isEmailVerified: worker.email?.verified || false
        }

        setProfileData(formattedData)
        setEditData(formattedData)

        // Check if location is validated on load
        if (worker.address && worker.address.city) {
          if (worker.address.location && worker.address.location.lon && worker.address.location.lat) {
            setLocationValidated(true)
            setGeocodingResult({
              success: true,
              coordinates: {
                lon: worker.address.location.lon,
                lat: worker.address.location.lat
              },
              city: worker.address.city,
              formatted: worker.address.city
            })
          }
        }

        
        // Set Aadhaar verification status
        if (worker.aadhaar?.verificationStatus === 'verified') {
          setAadhaarVerified(true)
          setAadhaarVerificationStatus('verified')
        } else if (worker.aadhaar?.verificationStatus === 'pending') {
          setAadhaarVerificationStatus('pending')
        } else {
          setAadhaarVerificationStatus('none')
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Profile unavailable", {
        description: "We couldn't load your profile information. Please refresh the page or try again later."
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await workerApi.getStats()
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Don't show error toast for stats as it's not critical
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    // For new format, address is just city/area string
    if (typeof address === 'string') return address
    // For old format, extract city or fallback to formatted string
    if (typeof address === 'object') {
      return address.city || [
        address.street,
        address.city,
        address.state,
        address.pincode
      ].filter(Boolean).join(", ")
    }
    return ""
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(profileData)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!editData.name.trim()) {
      toast.error("Name required", {
        description: "Please enter your full name to continue"
      })
      return
    }
    if (!editData.email.trim()) {
      toast.error("Email required", {
        description: "Please enter your email address to continue"
      })
      return
    }
    if (!editData.phone.trim()) {
      toast.error("Phone number required", {
        description: "Please enter your phone number to continue"
      })
      return
    }

    // Check verification status for changed email/phone
    if (editData.email !== profileData.email && !verificationStatus.email) {
      toast.warning("Email verification required", {
        description: "Please verify your new email address before saving changes"
      })
      return
    }
    if (editData.phone !== profileData.phone && !verificationStatus.phone) {
      toast.warning("Phone verification required", {
        description: "Please verify your new phone number before saving changes"
      })
      return
    }

    try {
      setLoading(true)
      
      // Prepare update data
      const updateData = {
        name: editData.name,
        bio: editData.bio,
        skills: editData.services.map(service => convertToBackendFormat(service)),
        experience: parseInt(editData.experience),
        address: parseAddress(editData.address)
      }

      // Only include email/phone if they were verified
      if (editData.email !== profileData.email && verificationStatus.email) {
        updateData.email = { email: editData.email, verified: true }
      }
      if (editData.phone !== profileData.phone && verificationStatus.phone) {
        updateData.phone = { phone: editData.phone, verified: true }
      }

      const response = await workerApi.updateProfile(updateData)
      
      if (response.success) {
        // Update local state with new data
        const updatedProfile = {
          ...editData,
          isEmailVerified: editData.email !== profileData.email ? verificationStatus.email : profileData.isEmailVerified,
          isPhoneVerified: editData.phone !== profileData.phone ? verificationStatus.phone : profileData.isPhoneVerified,
        }
        
        setProfileData(updatedProfile)
        setIsEditing(false)
        toast.success("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Update failed", {
        description: "We couldn't save your changes. Please check your information and try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const parseAddress = (addressString) => {
    if (!addressString) return {}
    
    // For new format, store as city/area with coordinates if available
    if (geocodingResult && geocodingResult.coordinates) {
      return {
        city: addressString.trim(),
        coordinates: {
          lon: geocodingResult.coordinates.lon || geocodingResult.coordinates.longitude,
          lat: geocodingResult.coordinates.lat || geocodingResult.coordinates.latitude
        },
        formatted: addressString.trim()
      }
    }
    
    // If no coordinates but it's a simple string, just store as city
    return addressString.trim()
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
    setLocationValidated(false)
    setGeocodingResult(null)
  }

  // Debounced location validation
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  const debouncedValidateLocation = useCallback(
    debounce((location) => {
      if (location.trim().length >= 3) {
        validateLocation(location);
      }
    }, 800),
    []
  );

  const validateLocation = async (location) => {
    if (!location || location.length < 3) {
      setLocationValidated(false);
      setGeocodingResult(null);
      return false;
    }

    setIsValidatingLocation(true);
    setLocationValidated(false);
    
    try {
      const result = await geocodeAddress(location);
      
      // Check if geocoding was successful and returned valid coordinates
      if (!result || !result.success || !result.coordinates || !result.coordinates.lat || !result.coordinates.lon) {
        toast.warning("Location not recognized", {
          description: "Please enter a valid city or district name. Dont be too specific or check your spelling.",
        });
        setIsValidatingLocation(false);
        setGeocodingResult(null);
        setLocationValidated(false);
        return false;
      }
      
      setLocationValidated(true);
      setGeocodingResult(result);
      setIsValidatingLocation(false);
      return true;
    } catch (error) {
      console.error("Error validating location:", error);
      toast.error("Couldn't verify location", {
        description: "We're having trouble finding this location. Please try a different name or check your connection.",
      });
      setIsValidatingLocation(false);
      setGeocodingResult(null);
      setLocationValidated(false);
      return false;
    }
  }

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setEditData((prev) => ({ ...prev, address: newLocation }));
    
    if (newLocation.trim().length >= 3) {
      debouncedValidateLocation(newLocation);
    } else {
      setLocationValidated(false);
      setGeocodingResult(null);
    }
  }

  const handleServiceToggle = (service) => {
    setEditData((prev) => {
      const isSelected = prev.services.includes(service)
      
      if (isSelected) {
        // Remove service if already selected
        return {
          ...prev,
          services: prev.services.filter((s) => s !== service)
        }
      } else {
        // Add service only if less than 3 are selected
        if (prev.services.length >= 3) {
          toast.warning("Maximum skills reached", {
            description: "You can select up to 3 skills. Remove one before adding another."
          })
          return prev
        }
        return {
          ...prev,
          services: [...prev.services, service]
        }
      }
    })
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
    if (field === "email") {
      setVerificationStatus((prev) => ({ ...prev, email: profileData.email === value }))
    }
    if (field === "phone") {
      setVerificationStatus((prev) => ({ ...prev, phone: profileData.phone === value }))
    }
  }

  const handleStartVerification = async (target) => {
    setVerificationTarget(target)
    const value = editData[target]
    
    if (target === 'email') {
      const payload = { email: value };
      const promise = workerApi.sendUpdateEmailOtp(payload);
      toast.promise(promise, {
        loading: `Sending verification code to ${value}...`,
        success: () => {
          setIsOtpModalOpen(true);
          return `OTP sent successfully to ${verificationTarget === 'email' ? profileData?.email : profileData?.phoneNumber || value}`;
        },
        error: (err) => err.message || "Failed to send OTP",
      });
    } else {
      const payload = { phone: value };
      const promise = workerApi.sendUpdatePhoneOtp(payload);
      toast.promise(promise, {
        loading: `Sending verification code to ${value}...`,
        error: (error) => {
          if (error.message.includes('already registered') || error.message.includes('already in use')) {
            return 'This phone number is already registered with another account';
          }
          return error.message || 'Failed to send OTP';
        },
        success: () => {
          setIsOtpModalOpen(true);
          return `OTP sent successfully to ${verificationTarget === 'email' ? profileData?.email : profileData?.phoneNumber || value}`;
        }
      });
    }
  }

  const handleVerifyAadhaar = async (aadhaarNumber, file) => {
    if (!file) {
      toast.error("Please upload your Aadhaar card")
      return
    }

    // Basic client-side validation consistent with server
    const clean = String(aadhaarNumber || '').replace(/[\s-]/g, '')
    if (clean.length !== 12 || !/^\d{12}$/.test(clean)) {
      toast.warning("Invalid Aadhaar Number", {
        description: "Please enter a valid 12-digit Aadhaar number without any spaces or dashes."
      })
      return
    }
    
    setIsVerifyingAadhaar(true)
    try {
      const formData = new FormData()
      formData.append('aadhaarNumber', clean)
      formData.append('aadhaarDocument', file)

      const response = await workerApi.uploadAadhaarDocument(formData)

      if (response.success) {
        setAadhaarVerificationStatus('pending')
        toast.success("Verification Submitted", {
          description: "Thank you! Your Aadhaar document is under review. This may take up to 24 hours."
        })
        setIsAadhaarModalOpen(false)
        // Refresh profile to reflect any new server state
        fetchProfile()
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload Aadhaar document. Please try again.")
    } finally {
      setIsVerifyingAadhaar(false)
    }
  }
  
  const handleChangePassword = async () => {
    // Validate passwords
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password")
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }
    
    setIsChangingPassword(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // In a real app, you would call your API
      // await workerApi.changePassword({
      //   currentPassword,
      //   newPassword
      // })
      
      toast.success("Password changed successfully!")
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordModalOpen(false)
    } catch (error) {
      toast.error("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleVerifyOtp = async (otp) => {
    if (!verificationTarget) return;

    setIsVerifying(true);
    const value = editData[verificationTarget];
    const payload = { otp, value };

    const promise = workerApi[verificationTarget === 'email' ? 'verifyEmailOtp' : 'verifyPhoneOtp'](payload);

    toast.promise(promise, {
      loading: 'Verifying OTP...',
      success: () => {
        setVerificationStatus((prev) => ({ ...prev, [verificationTarget]: true }));
        setIsOtpModalOpen(false);
        setVerificationTarget("");
        setIsVerifying(false);
        return "Verification successful!";
      },
      error: (err) => {
        setIsVerifying(false);
        return err.message || "Invalid OTP. Please try again.";
      },
    });
  }

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true)

    try {
      const result = await getCurrentLocation()
      
      if (result.success && result.city) {
        setEditData((prev) => ({ ...prev, address: result.city }))
        setLocationValidated(true)
        setGeocodingResult({
          success: true,
          coordinates: result.coordinates,
          city: result.city,
          formatted: result.city
        })
        toast.success("Location detected and city/area updated!")
      } else {
        toast.error(result.error || "Could not determine your location.")
      }
    } catch (error) {
      console.error("Location detection error:", error)
      toast.error("Failed to detect location. Please try again.")
    } finally {
      setIsDetectingLocation(false)
    }
  }


  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB size limit
      toast.error("File is too large", { description: "Please upload an image smaller than 10MB." })
      return
    }

    setIsUploading(true)
    try {
      const response = await workerApi.uploadProfilePicture(file)
      
      // Update both editData and profileData states
      const newProfilePicture = response.profilePicture
      setEditData((prev) => ({ ...prev, profilePicture: newProfilePicture }))
      setProfileData((prev) => ({ ...prev, profilePicture: newProfilePicture }))
      
      // Refetch profile to ensure consistency
      await fetchProfile()
      
      toast.success("Profile picture updated successfully!")
    } catch (error) {
      console.error("Profile picture upload error:", error)
      toast.error(error.message || "Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const renderProfileCard = () => (
    <Card 
      className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: '200ms' }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
          Basic Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0 self-center lg:self-start">
            <div className="relative">
              <img
                src={isEditing ? editData.profilePicture : profileData.profilePicture}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-[#445FA2]/20"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-[#445FA2] to-[#009889] text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isUploading}
                    autoComplete="off"
                  />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  autoComplete="name"
                  value={editData.name}
                  onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-10 sm:h-12"
                />
              ) : (
                <p className="mt-1 text-gray-900 p-2 sm:p-3 bg-gray-50 rounded-xl min-h-[40px] sm:min-h-[48px] flex items-center">{profileData?.name}</p>
              )}
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
              {isEditing ? (
                <div className="relative mt-1">
                  <Input
                    id="phone"
                    autoComplete="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-10 sm:h-12"
                  />
                  {profileData && editData.phone !== profileData.phone && (
                    <Button
                      type="button"
                      variant={verificationStatus.phone ? "ghost" : "default"}
                      size="sm"
                      onClick={() => handleStartVerification('phone')}
                      disabled={verificationStatus.phone}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    >
                      {verificationStatus.phone ? <CheckCircle className="w-4 h-4 text-green-600" /> : 'Verify'}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-900 p-2 sm:p-3 bg-gray-50 rounded-xl min-h-[40px] sm:min-h-[48px] flex items-center">{profileData?.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              {isEditing ? (
                <div className="relative mt-1">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-10 sm:h-12"
                  />
                  {profileData && editData.email !== profileData.email && (
                    <Button
                      type="button"
                      variant={verificationStatus.email ? "ghost" : "default"}
                      size="sm"
                      onClick={() => handleStartVerification('email')}
                      disabled={verificationStatus.email}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    >
                      {verificationStatus.email ? <CheckCircle className="w-4 h-4 text-green-600" /> : 'Verify'}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-900 p-2 sm:p-3 bg-gray-50 rounded-xl min-h-[40px] sm:min-h-[48px] flex items-center break-all">{profileData?.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                City/Area <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <div className="relative mt-1">
                  <Input
                    id="address"
                    autoComplete="address-level2"
                    value={editData.address}
                    onChange={handleLocationChange}
                    placeholder="Enter your city or area name"
                    className={`border-2 transition-all duration-300 rounded-xl h-10 sm:h-12 pr-20 ${
                      editData.address.length >= 3
                        ? locationValidated
                          ? 'border-green-500 focus:border-green-600'
                          : isValidatingLocation
                          ? 'border-yellow-500 focus:border-yellow-600'
                          : 'border-red-500 focus:border-red-600'
                        : 'border-gray-200 focus:border-[#445FA2]'
                    }`}
                  />
                  
                  {/* Validation Status Icon */}
                  {editData.address.length >= 3 && (
                    <div className="absolute right-16 top-1/2 -translate-y-1/2">
                      {isValidatingLocation ? (
                        <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                      ) : locationValidated ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
                    title="Detect your current location"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {/* Validation Message */}
                  {editData.address.length >= 3 && !isValidatingLocation && (
                    <div className={`text-xs mt-1 ${
                      locationValidated ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {locationValidated ? (
                        <div className="flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Location verified</p>
                            {geocodingResult?.formatted && (
                              <p className="text-green-500 mt-0.5">
                                Full address: {geocodingResult.formatted}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1">
                          <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Location not found</p>
                            <p className="text-red-500 mt-0.5">
                              Please check spelling or try a nearby city/area name
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {editData.address.length > 0 && editData.address.length < 3 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter at least 3 characters to validate location
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-900 p-2 sm:p-3 bg-gray-50 rounded-xl min-h-[40px] sm:min-h-[48px] flex items-center">
                  {profileData?.address || "No location set"}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderServicesCard = () => (
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
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#009889]" />
          Professional Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
          {isEditing ? (
            <Textarea
              id="bio"
              value={editData.bio}
              onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="mt-2 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl resize-none"
            />
          ) : (
            <p className="mt-2 text-gray-700 p-3 sm:p-4 bg-gray-50 rounded-xl leading-relaxed">{profileData?.bio}</p>
          )}
        </div>

        <div>
          <Label htmlFor="experience" className="text-sm font-semibold text-gray-700">Years of Experience</Label>
          {isEditing ? (
            <Select
              value={editData.experience}
              onValueChange={(value) => setEditData((prev) => ({ ...prev, experience: value }))}
            >
              <SelectTrigger className="mt-2 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-10 sm:h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-96 overflow-y-auto">
                {[...Array(20)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} year{i + 1 > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="mt-2 text-gray-900 p-2 sm:p-3 bg-gray-50 rounded-xl min-h-[40px] sm:min-h-[48px] flex items-center font-medium">{profileData?.experience} years</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">Service Categories</Label>
            {isEditing && (
              <div className="text-xs text-gray-500">
                {editData.services.length}/3 selected
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="mt-3 space-y-4">
              {editData.services.length >= 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700 font-medium">
                    ⚠️ Maximum 3 skills allowed. Unselect a skill to choose a different one.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableServices.map((service) => {
                  const isSelected = editData.services.includes(service)
                  const isDisabled = !isSelected && editData.services.length >= 3
                  
                  return (
                    <div 
                      key={service} 
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#445FA2]/10 to-[#009889]/10 border-[#445FA2]/30' 
                          : isDisabled 
                            ? 'bg-gray-50 border-gray-200 opacity-50' 
                            : 'bg-white border-gray-200 hover:border-[#445FA2]/50'
                      }`}
                    >
                      <Checkbox
                        id={service}
                        checked={isSelected}
                        onCheckedChange={() => handleServiceToggle(service)}
                        disabled={isDisabled}
                        className={isSelected ? 'border-[#445FA2] data-[state=checked]:bg-[#445FA2]' : ''}
                      />
                      <Label 
                        htmlFor={service} 
                        className={`text-sm cursor-pointer flex-1 ${
                          isSelected ? 'font-medium text-[#445FA2]' : isDisabled ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        {service}
                      </Label>
                      {isSelected && (
                        <Badge className="bg-[#445FA2] text-white text-xs px-2 py-0.5">
                          Selected
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {profileData?.services?.map((service) => (
                <Badge key={service} className="bg-gradient-to-r from-[#445FA2] to-[#009889] text-white hover:from-[#445FA2]/90 hover:to-[#009889]/90">
                  {service}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
                My Account
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your profile and account settings</p>
            </div>
            {!isEditing ? (
              <Button 
                onClick={handleEdit} 
                className="bg-gradient-to-r from-[#445FA2] to-[#445FA2]/90 hover:from-[#445FA2]/90 hover:to-[#445FA2] transition-all duration-300 hover:scale-105 w-auto"
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleSave} 
                  className="bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {loading && !profileData ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#445FA2]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Info */}
            <div className="xl:col-span-2 space-y-6">
              {profileData && renderProfileCard()}

              {profileData && renderServicesCard()}

            {/* Account Verification */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
                  Account Verification
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                {/* Phone Verification */}
                {profileData && profileData?.isPhoneVerified ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 text-sm sm:text-base">Phone Verified</p>
                        <p className="text-xs sm:text-sm text-green-700">Your phone number is securely verified.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
                      <Phone className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900 text-sm sm:text-base">Phone Verification Required</p>
                        <p className="text-xs sm:text-sm text-yellow-700">Please verify your new phone number.</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true)
                        // You might want to focus the phone input here
                      }}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent w-full sm:w-auto"
                    >
                      Verify in Profile
                    </Button>
                  </div>
                )}

                {/* Aadhaar Verification */}
                {aadhaarVerified ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 text-sm sm:text-base">Aadhaar Verified</p>
                        <p className="text-xs sm:text-sm text-green-700">Your Aadhaar is successfully verified.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
                      <Upload className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900 text-sm sm:text-base">Aadhaar Verification</p>
                        <p className="text-xs sm:text-sm text-yellow-700">Upload your Aadhaar card to verify your identity.</p>
                      </div>
                    </div>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAadhaarModalOpen(true)}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent w-full sm:w-auto"
                >
                  Upload & Verify
                </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#009889]" />
                  Performance
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent mb-2">{stats.rating}</div>
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < Math.floor(stats.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <span className="text-gray-600 text-sm">Total Jobs</span>
                    <span className="font-bold text-[#445FA2]">{stats.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <span className="text-gray-600 text-sm">Completion Rate</span>
                    <span className="font-bold text-[#009889]">{stats.completionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-[#445FA2]/10 border-2 border-gray-200 hover:border-[#445FA2] transition-all duration-300 rounded-xl h-12">
                  <LifeBuoy className="w-4 h-4 mr-3 text-[#445FA2]" />
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-transparent hover:bg-[#009889]/10 border-2 border-gray-200 hover:border-[#009889] transition-all duration-300 rounded-xl h-12"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-3 text-[#009889]" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent hover:bg-orange-500/10 border-2 border-gray-200 hover:border-orange-500/80 transition-all duration-300 rounded-xl h-12 text-orange-600 hover:text-orange-700">
                  <LogOut className="w-4 h-4 mr-3 text-orange-600" />
                  Logout
                </Button>
                <Button variant="destructive" className="w-full justify-start bg-red-500/10 hover:bg-red-500/20 border-2 border-red-200 hover:border-red-500/80 transition-all duration-300 rounded-xl h-12 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-3 text-red-600" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>

      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        isVerifying={isVerifying}
        target={verificationTarget === 'email' ? 'Email' : 'Phone Number'}
      />
      <AadhaarModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onVerify={handleVerifyAadhaar}
        isVerifying={isVerifyingAadhaar}
        verificationStatus={aadhaarVerificationStatus}
      />
      
      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your account security.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your current password"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)} disabled={isChangingPassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  )
}