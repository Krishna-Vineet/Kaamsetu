

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Edit, Save, X, User, Trophy, Star, Award, KeyRound, LifeBuoy, LogOut, Camera, MapPin, ShieldCheck, ShieldAlert, BadgeCheck, BadgeAlert, UploadCloud, CheckCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "../../store/auth"
import { authApi } from "../../api/auth"
import { jobsApi } from "../../api/jobs"
import { clientApi } from "../../api/client"
import { geocodeAddress, getCurrentLocation } from "@/utils/geocoding"

export default function MyAccount() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    rating: 0,
    completionRate: 0,
    responseTime: "< 2 hours"
  })

  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isValidatingLocation, setIsValidatingLocation] = useState(false)
  const [locationValidated, setLocationValidated] = useState(false)
  const [geocodingResult, setGeocodingResult] = useState(null)

  // OTP Verification state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otp, setOtp] = useState('')
  const [verificationType, setVerificationType] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Aadhaar Verification state
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false)
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [isSubmittingAadhaar, setIsSubmittingAadhaar] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({ email: true, phone: true })

  // Get user data from auth store
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // User data state
  const [userData, setUserData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    profilePicture: user?.profilePicture || "",
    emailVerified: user?.emailVerified || false,
    phoneVerified: user?.phoneVerified || false,
    aadhaarStatus: user?.aadhaarStatus || 'Not Verified',
  })

  const [editData, setEditData] = useState(userData)

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
      setIsLoading(true)
      const response = await clientApi.getProfile()
      if (response.success) {
        const client = response.client
        const formattedData = {
          name: client.name,
          phone: client.phone?.phone || "",
          email: client.email?.email || "",
          address: formatAddress(client.address),
          profilePicture: client.profilePicture || "/placeholder.svg",
          emailVerified: client.email?.verified || false,
          phoneVerified: client.phone?.verified || false,
          aadhaarStatus: getAadhaarStatus(client.aadhaar?.verificationStatus),
        }
        setUserData(formattedData)
        setEditData(formattedData)

        // Check if location is validated on load
        if (response.client.address && response.client.address.city) {
          if (response.client.address.location && response.client.address.location.lon && response.client.address.location.lat) {
            setLocationValidated(true)
            setGeocodingResult({
              success: true,
              coordinates: {
                lon: response.client.address.location.lon,
                lat: response.client.address.location.lat
              },
              city: response.client.address.city,
              formatted: response.client.address.city
            })
          }
        }
        setVerificationStatus({ email: client.email?.verified || false, phone: client.phone?.verified || false })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Profile Unavailable", {
        description: "We couldn't load your profile information. Please refresh the page or try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await clientApi.getStats()
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Don't show error toast for stats as it's not critical
    }
  }

  const getAadhaarStatus = (status) => {
    switch (status) {
      case 'verified': return 'Verified'
      case 'pending': return 'Pending'
      default: return 'Not Verified'
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
      navigate('/login')
      toast.success("Signed Out", {
        description: "You have been successfully signed out. We hope to see you again soon!"
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API fails
      logout()
      navigate('/login')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(userData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(userData)
  }

  const handleSave = async () => {
    // Basic validation
    if (!editData.name.trim() || !editData.phone.trim() || !editData.email.trim()) {
      toast.error("Missing Information", { 
        description: "Please complete all required fields to save your profile." 
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editData.email)) {
      toast.warning("Check Your Email", { 
        description: "The email address you entered doesn't look right. Please double-check it." 
      })
      return
    }

    // Phone validation
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/
    if (!phoneRegex.test(editData.phone)) {
      toast.warning("Check Your Number", { 
        description: "Please enter a valid phone number including country code (e.g., +91)" 
      })
      return
    }

    // Check verification status for changed email/phone
    if (editData.email !== userData.email && !verificationStatus.email) {
      toast.warning("Email Verification Needed", {
        description: "Please verify your new email address before saving changes."
      })
      return
    }
    if (editData.phone !== userData.phone && !verificationStatus.phone) {
      toast.warning("Phone Verification Needed", {
        description: "Please verify your new phone number before saving changes."
      })
      return
    }

    setIsLoading(true)
    try {
      const updateData = {
        name: editData.name,
        address: parseAddress(editData.address)
      }
      if (editData.email !== userData.email && verificationStatus.email) {
        updateData.email = { email: editData.email, verified: true }
      }
      if (editData.phone !== userData.phone && verificationStatus.phone) {
        updateData.phone = { phone: editData.phone, verified: true }
      }

      const response = await clientApi.updateProfile(updateData)
      if (response.success) {
        setUserData({
          ...editData,
          emailVerified: editData.email !== userData.email ? verificationStatus.email : userData.emailVerified,
          phoneVerified: editData.phone !== userData.phone ? verificationStatus.phone : userData.phoneVerified,
        })
        setIsEditing(false)
        toast.success("Profile Saved", { 
        description: "Your changes have been saved successfully." 
      })
      }
    } catch (error) {
      toast.error("Update Unsuccessful", { 
        description: "We couldn't save your changes. Please check your information and try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning("Complete All Fields", {
        description: "Please fill in all password fields to continue."
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords Don't Match", {
        description: "The new passwords you entered don't match. Please try again."
      })
      return
    }
    if (newPassword.length < 8) {
      toast.warning("Password Too Short", {
        description: "For security, please choose a password with at least 8 characters."
      })
      return
    }

    setIsChangingPassword(true)
    try {
      await clientApi.changePassword({ currentPassword, newPassword })
      toast.success("Password Updated", {
        description: "Your password has been changed successfully."
      })
      setIsPasswordModalOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error("Password Update Failed", {
        description: "We couldn't update your password. Please check your current password and try again."
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB size limit
      toast.error("Image Too Large", { 
        description: "Please choose an image smaller than 10MB." 
      })
      return
    }

    setIsUploading(true)
    try {
      const response = await clientApi.uploadProfilePicture(file)
      
      // Update both editData and userData states
      const newProfilePicture = response.profilePicture
      setEditData((prev) => ({ ...prev, profilePicture: newProfilePicture }))
      setUserData((prev) => ({ ...prev, profilePicture: newProfilePicture }))
      
      // Refetch profile to ensure consistency
      await fetchProfile()
      
      toast.success("New Profile Picture", {
        description: "Your profile picture has been updated successfully!"
      })
    } catch (error) {
      console.error("Profile picture upload error:", error)
      toast.error("Upload Unsuccessful", {
        description: "We couldn't upload your image. Please check the format and try again."
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    if (typeof address === 'string') return address
    const parts = [address.city].filter(Boolean)
    return parts.join(', ')
  }

  const parseAddress = (addressString) => {
    if (!addressString) return ""
    
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

  // Debounce function for location validation
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Create debounced validation function
  const validateLocation = useCallback(async (location) => {
    if (!location || location.length < 3) {
      setLocationValidated(false);
      setGeocodingResult(null);
      return false;
    }

    setIsValidatingLocation(true);
    setLocationValidated(false);
    
    try {
      const result = await geocodeAddress(location);
      
      if (!result || !result.success || !result.coordinates || !result.coordinates.lat || !result.coordinates.lon) {
        toast.warning("Location Not Found", {
          description: "We couldn't find that location. Please enter a valid city or district name."
        });
        setGeocodingResult(null);
        setLocationValidated(false);
        return false;
      }
      
      setLocationValidated(true);
      setGeocodingResult(result);
      return true;
    } catch (error) {
      console.error("Error validating location:", error);
      toast.error("Location Service Unavailable", {
        description: "We're having trouble with location services. Please try again in a moment."
      });
      setGeocodingResult(null);
      setLocationValidated(false);
      return false;
    } finally {
      setIsValidatingLocation(false);
    }
  }, []);

  const debouncedValidateLocation = useCallback(
    debounce((location) => {
      if (location.trim().length >= 3) {
        validateLocation(location);
      }
    }, 800),
    [validateLocation]
  );

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

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const result = await getCurrentLocation();
      
      if (result.success && result.city) {
        setEditData((prev) => ({ ...prev, address: result.city }));
        setLocationValidated(true);
        setGeocodingResult({
          success: true,
          coordinates: result.coordinates,
          city: result.city,
          formatted: result.formatted
        });
        toast.success("Location Updated", {
          description: "We've updated your location based on your current position."
        });
      } else {
        toast.warning("Location Detection Failed", {
          description: result.error || "We couldn't determine your location. Please try again or enter it manually."
        });
      }
    } catch (error) {
      console.error("Location detection error:", error);
      toast.error("Location Services Unavailable", {
        description: "Please check your device settings or enter your location manually."
      });
    } finally {
      setIsDetectingLocation(false);
    }
  }

  const handleSendOtp = async (type) => {
    setVerificationType(type)
    const value = editData[type]
    const payload = type === 'email' ? { email: value } : { phone: value }
    const promise = clientApi[type === 'email' ? 'sendUpdateEmailOtp' : 'sendUpdatePhoneOtp'](payload)
    toast.promise(promise, {
      loading: `Sending OTP to ${value}...`,
      error: (error) => {
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          return 'This phone number is already registered with another account';
        }
        return `Failed to send OTP: ${error.message}`;
      },
      success: () => {
        setIsOtpModalOpen(true)
        setOtp('')
        return `OTP sent successfully to ${value}`
      }
    })
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP.")
      return
    }
    setIsVerifying(true)
    try {
      const value = editData[verificationType]
      const payload = { otp, value }
      const response = await clientApi[verificationType === 'email' ? 'verifyEmailOtp' : 'verifyPhoneOtp'](payload)
      if (response.success) {
        setVerificationStatus(prev => ({ ...prev, [verificationType]: true }));
        if (verificationType === 'email') {
          setUserData(prev => ({ ...prev, emailVerified: true }));
        } else {
          setUserData(prev => ({ ...prev, phoneVerified: true }));
        }
        setIsOtpModalOpen(false);
        toast.success("Verification Complete", {
          description: "Your contact information has been verified successfully!"
        });
      }
    } catch (error) {
      toast.error("Verification Failed", {
        description: error.response?.data?.message || error.message || "The code you entered is incorrect or has expired. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAadhaarFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.warning("Document Too Large", {
        description: "Please upload a document smaller than 5MB. Try scanning at a lower resolution."
      })
        return
      }
      setAadhaarFile(file)
    }
  }

  const handleAadhaarVerification = async () => {
    if (aadhaarNumber.length !== 12 || !/^[0-9]{12}$/.test(aadhaarNumber)) {
      toast.warning("Invalid Aadhaar Number", {
        description: "Please enter a valid 12-digit Aadhaar number without any spaces or dashes."
      })
      return
    }
    if (!aadhaarFile) {
      toast.warning("Document Required", {
        description: "Please upload a clear photo or scan of your Aadhaar card for verification."
      })
      return
    }

    setIsSubmittingAadhaar(true)
    try {
      const formData = new FormData()
      formData.append('aadhaarNumber', aadhaarNumber)
      formData.append('aadhaarDocument', aadhaarFile)
      const response = await clientApi.uploadAadhaarDocument(formData)
      if (response.success) {
        setUserData(prev => ({ ...prev, aadhaarStatus: 'Pending' }))
        toast.success("Verification Submitted", { 
        description: "Thank you! Your Aadhaar document is under review. This may take up to 24 hours."
      })
        setIsAadhaarModalOpen(false)
        setAadhaarNumber('')
        setAadhaarFile(null)
      }
    } catch (error) {
      toast.error("Verification Failed", {
        description: error.message || "We couldn't process your document. Please check the file and try again."
      })
    } finally {
      setIsSubmittingAadhaar(false)
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
              <Link to="/client/hire">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent truncate">
                My Account
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Profile Card */}
        <Card 
          className={`mb-6 sm:mb-8 bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Profile Information</CardTitle>
            </div>
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="border-[#445FA2] text-[#445FA2] hover:bg-[#445FA2] hover:text-white bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading}
                  className="hover:scale-105 transition-all duration-300 flex-1 sm:flex-none"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105 hover:shadow-lg flex-1 sm:flex-none"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6 sm:space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-r from-[#445FA2]/5 to-[#009889]/5 rounded-2xl">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage src={isEditing ? editData.profilePicture : userData.profilePicture} alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-r from-[#445FA2] to-[#009889] text-white text-xl sm:text-2xl font-bold">
                    {userData.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-[#445FA2] to-[#009889] text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} autoComplete="off" />
                  </label>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                {!isEditing && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{userData.name}</h3>
                <p className="text-[#445FA2] font-medium mb-2 text-sm sm:text-base">Premium Client Account</p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => {
                      const decimal = stats.rating - Math.floor(stats.rating);
                      const isCurrentStar = i === Math.floor(stats.rating);
                      const isFilledStar = i < Math.floor(stats.rating);
                      const isHalfStar = isCurrentStar && decimal >= 0.3 && decimal < 0.7;
                      const isFullStar = isCurrentStar && decimal >= 0.7;
                      
                      return (
                        <div key={i} className="relative">
                          <Star 
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isFilledStar || isFullStar
                                ? "fill-yellow-400 text-yellow-400" 
                                : "fill-gray-200 text-gray-200"
                            }`} 
                          />
                          {isHalfStar && (
                            <Star 
                              className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 overflow-hidden"
                              style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">{stats.rating} Rating</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#445FA2]" />
                  Full Name *
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    autoComplete="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="mt-2 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-12"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="mt-2 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl font-medium text-gray-800 min-h-[48px] flex items-center">
                    {userData.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Phone
                  {userData.phoneVerified ? (
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                  )}
                </Label>
                {isEditing ? (
                  <div className="relative mt-2">
                    <Input
                      id="phone"
                      autoComplete="tel"
                      value={editData.phone}
                      onChange={(e) => { setEditData({ ...editData, phone: e.target.value }); setVerificationStatus(prev => ({ ...prev, phone: userData.phone === e.target.value })); }}
                      className="border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-12 pr-24"
                      placeholder="Enter your phone number"
                    />
                    {userData && editData.phone !== userData.phone && (
                      <Button
                        type="button"
                        variant={verificationStatus.phone ? "ghost" : "default"}
                        size="sm"
                        onClick={() => handleSendOtp('phone')}
                        disabled={verificationStatus.phone}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                      >
                        {verificationStatus.phone ? 'Verified' : 'Verify'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl font-medium text-gray-800 min-h-[48px] flex items-center">
                      {userData.phone}
                    </div>
                    {!userData.phoneVerified && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleSendOtp('phone')} className="h-12">
                        Verify
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Email Address
                  {userData.emailVerified ? (
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                  )}
                </Label>
                {isEditing ? (
                  <div className="relative mt-2">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={editData.email}
                      onChange={(e) => { setEditData({ ...editData, email: e.target.value }); setVerificationStatus(prev => ({ ...prev, email: userData.email === e.target.value })); }}
                      className="border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl h-12 pr-24"
                      placeholder="Enter your email address"
                    />
                    {userData && editData.email !== userData.email && (
                      <Button
                        type="button"
                        variant={verificationStatus.email ? "ghost" : "default"}
                        size="sm"
                        onClick={() => handleSendOtp('email')}
                        disabled={verificationStatus.email}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                      >
                        {verificationStatus.email ? 'Verified' : 'Verify'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl font-medium text-gray-800 min-h-[48px] flex items-center break-all">
                    {userData.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  City/Area
                </Label>
                {isEditing ? (
                  <div className="relative mt-2">
                    <Input
                      id="address"
                      autoComplete="address-level2"
                      value={editData.address}
                      onChange={handleLocationChange}
                      onBlur={() => {
                        if (editData.address.trim().length >= 3 && !locationValidated) {
                          validateLocation(editData.address);
                        }
                      }}
                      className={`border-2 pl-4 pr-20 transition-all duration-300 rounded-xl h-12 ${
                        locationValidated ? 'border-green-500 focus:border-green-500' : 'border-gray-200 focus:border-[#445FA2]'
                      }`}
                      placeholder="Enter your city or area name"
                    />
                    
                    {/* Validation Message */}
                    {editData.address.length >= 3 && !isValidatingLocation && (
                      <div className={`text-xs mt-1 ${
                        locationValidated ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {locationValidated ? (
                          <div className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div>
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
                    
                    {/* Validation Status Icon */}
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                      {isValidatingLocation ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : locationValidated ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#009889] hover:bg-[#009889]/90 text-white px-3 py-1 text-xs rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      {isDetectingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 mr-1" />
                          Detect
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl font-medium text-gray-800 min-h-[48px] flex items-center">
                    {userData.address || "No city/area specified"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card 
          className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#009889]" />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Account Statistics</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="group p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl text-center hover:scale-105 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#445FA2] to-[#445FA2]/80 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.totalJobs}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600">Total Jobs Posted</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-[#445FA2] to-[#445FA2]/50 rounded-full"></div>
              </div>
              
              <div className="group p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl text-center hover:scale-105 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#009889] to-[#009889]/80 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.completedJobs}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600">Completed Jobs</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-[#009889] to-[#009889]/50 rounded-full"></div>
              </div>
              
              <div className="group p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl text-center hover:scale-105 transition-all duration-300 hover:shadow-lg cursor-pointer sm:col-span-1 col-span-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stats.rating}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600">Average Rating</div>
                <div className="mt-2 h-1 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Verification */}
        <Card 
          className={`mt-4 md:mt-8 bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl text-gray-900">Identity Verification</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {userData.aadhaarStatus === 'Verified' && <BadgeCheck className="w-8 h-8 text-green-500" />}
              {userData.aadhaarStatus === 'Pending' && <BadgeAlert className="w-8 h-8 text-yellow-500" />}
              {userData.aadhaarStatus === 'Not Verified' && <BadgeAlert className="w-8 h-8 text-red-500" />}
              <div>
                <p className="font-semibold text-base">Aadhaar Card</p>
                <p className={`text-sm font-medium ${{
                  'Verified': 'text-green-600',
                  'Pending': 'text-yellow-600',
                  'Not Verified': 'text-red-600'
                }[userData.aadhaarStatus]}`}>
                  Status: {userData.aadhaarStatus}
                </p>
              </div>
            </div>
            {userData.aadhaarStatus === 'Not Verified' && (
              <Button onClick={() => setIsAadhaarModalOpen(true)} className="bg-[#445FA2] hover:bg-[#445FA2]/90 text-white w-full sm:w-auto">
                Verify Now
              </Button>
            )}
            {userData.aadhaarStatus === 'Pending' && (
              <p className="text-xs text-gray-500 text-center sm:text-right">Your document is currently under review.</p>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card 
          className={`mt-4 md:mt-8 bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl lg:text-2xl text-gray-900">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start text-left h-auto py-3" onClick={() => setIsPasswordModalOpen(true)}>
              <KeyRound className="w-5 h-5 mr-3 text-[#445FA2]"/>
              <div>
                <p className="font-semibold">Change Password</p>
                <p className="text-xs text-gray-500">Update your account security</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3">
              <LifeBuoy className="w-5 h-5 mr-3 text-[#009889]"/>
              <div>
                <p className="font-semibold">Help & Support</p>
                <p className="text-xs text-gray-500">Contact us for assistance</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3 text-red-500"/>
              <div>
                <p className="font-semibold">Logout</p>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="text-[#445FA2]"/>Change Password</DialogTitle>
            <DialogDescription className="pt-2">
              For your security, please enter your current and new password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} disabled={isChangingPassword}>Cancel</Button>
            <Button type="button" className="bg-[#445FA2] hover:bg-[#445FA2]/90 text-white" onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Verify your {verificationType}</DialogTitle>
            <DialogDescription className="pt-2">
              An OTP has been sent to your {verificationType}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="otp">One-Time Password (OTP)</Label>
            <Input 
              id="otp" 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              className="text-center tracking-[0.5em] font-bold text-lg h-12"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOtpModalOpen(false)} disabled={isVerifying}>Cancel</Button>
            <Button type="button" className="bg-[#445FA2] hover:bg-[#445FA2]/90 text-white" onClick={handleVerifyOtp} disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aadhaar Verification Modal */}
      <Dialog open={isAadhaarModalOpen} onOpenChange={setIsAadhaarModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Aadhaar Verification</DialogTitle>
            <DialogDescription className="pt-2">
              Please enter your 12-digit Aadhaar number and upload a clear image of your card.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar-number">Aadhaar Number</Label>
              <Input 
                id="aadhaar-number" 
                type="text" 
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="xxxx xxxx xxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar-file">Upload Document</Label>
              <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-semibold">{aadhaarFile ? aadhaarFile.name : 'Click to upload'}</span>
                <span className="text-xs text-gray-500">PNG, JPG, or PDF (max 5MB)</span>
                <input id="aadhaar-file" type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleAadhaarFileSelect} autoComplete="off" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAadhaarModalOpen(false)} disabled={isSubmittingAadhaar}>Cancel</Button>
            <Button type="button" className="bg-[#445FA2] hover:bg-[#445FA2]/90 text-white" onClick={handleAadhaarVerification} disabled={isSubmittingAadhaar}>
              {isSubmittingAadhaar ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
