


import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, CreditCard, Sparkles, FileText, Camera, Zap, AlertTriangle, MapPin, Loader2, CheckCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Link } from "react-router-dom"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { geocodeAddress } from "@/utils/geocoding"
import { jobsApi } from "../../api/jobs"
import { clientApi } from "../../api/client"

export default function PostWork() {
  const [selectedService, setSelectedService] = useState("")
  const [title, setTitle] = useState("")
  const [image, setImage] = useState(null)
  const [description, setDescription] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isDifferentLocation, setIsDifferentLocation] = useState(false)
  const [jobLocation, setJobLocation] = useState("")
  const [isValidatingLocation, setIsValidatingLocation] = useState(false)
  const [locationValidated, setLocationValidated] = useState(false)
  const [userAddress, setUserAddress] = useState(null)

  const navigate = useNavigate()
  const [ searchParams ] = useSearchParams()
  
  // Debounce function for location validation
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Create debounced validation function
  const debouncedValidateLocation = useCallback(
    debounce((location) => {
      if (location.trim().length >= 5) {
        validateLocation(location);
      }
    }, 800),
    []
  );

  useEffect(() => {
    const service = searchParams.get("service")
    if (service) {
      setSelectedService(service)
    }
    setIsVisible(true)
    
    const fetchProfile = async () => {
      try {
        const profileResponse = await clientApi.getProfile()
        setUserAddress(profileResponse.client.address)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile')
      }
    }
    fetchProfile()
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [searchParams])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error("Image too large", {
          description: "Please upload an image smaller than 25MB.",
        })
        return
      }
      setImage(file)
    }
  }

  const removeImage = () => {
    if (image) {
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(URL.createObjectURL(image))
    }
    setImage(null)
  }

  // State to store geocoding result
  const [geocodingResult, setGeocodingResult] = useState(null);

  const validateLocation = async (location) => {
    if (!location || location.length < 5) {
      toast.error("Invalid location", {
        description: "Please enter a more specific location or landmark.",
      });
      return false;
    }

    setIsValidatingLocation(true);
    setLocationValidated(false);
    
    try {
      // Use our geocoding utility to validate and get coordinates
      const result = await geocodeAddress(location);
      
      // Check if geocoding was successful and returned valid coordinates
      if (!result || !result.success || !result.coordinates || !result.coordinates.lat || !result.coordinates.lon) {
        toast.error("Invalid location", {
          description: "Please enter a valid city name or area name that can be found on the map.",
        });
        setIsValidatingLocation(false);
        setLocationValidated(false);
        return false;
      }
      
      // Store the geocoding result only if coordinates are valid
      setGeocodingResult({
        latitude: result.coordinates.lat,
        longitude: result.coordinates.lon,
        formattedAddress: result.formattedAddress || location
      });
      
      setLocationValidated(true);
      setIsValidatingLocation(false);
      return true;
    } catch (error) {
      toast.error("Location validation failed", {
        description: "Please enter a valid city name or area name that can be found on the map.",
      });
      setIsValidatingLocation(false);
      setLocationValidated(false);
      return false;
    }
  };

  const handlePost = async () => {
    if (!selectedService || !title.trim() || !description.trim()) {
      toast.error("Missing information", {
        description: "Please fill in all required fields",
      });
      return;
    }
    
    if (isDifferentLocation) {
      if (!jobLocation.trim()) {
        toast.error("Missing information", {
          description: "Please enter the job location",
        });
        return;
      }
      
      // Validate and convert the location
      const isLocationValid = await validateLocation(jobLocation);
      if (!isLocationValid) {
        return;
      }
    } else {
      if (!userAddress || (!userAddress.city && !userAddress.location)) {
        toast.error("add location to your profile to post job")
        return
      }
    }
    
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add basic job data
      formData.append('skill', selectedService.toLowerCase().split(" ").join("-"));
      formData.append('title', title);
      formData.append('description', description);
      formData.append('urgency', isUrgent);

      // Add image file if present
      if (image) {
        formData.append('image', image);
      }

      // Add address data
      let addressData;
      if (isDifferentLocation && geocodingResult) {
        const city = geocodingResult.formattedAddress.split(',')[0]?.trim() || 'Unknown City'
        addressData = {
          city,
          location: {
            lat: geocodingResult.latitude,
            lon: geocodingResult.longitude
          }
        }
      } else if (userAddress) {
        addressData = userAddress
      }
      
      if (addressData) {
        formData.append('address', JSON.stringify(addressData));
      }

      // Create job using API with FormData
      const response = await jobsApi.createJob(formData);

      if (response.success) {
        toast.success("Job posted successfully!", {
          description: "Your work has been posted and payment processed",
        });

        // Redirect to My Works page
        navigate("/client/works");
      }
    } catch (error) {
      console.error("Job creation error:", error);
      toast.error("Failed to post job", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setShowPaymentModal(false);
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
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                Post Work - <span className="hidden sm:inline">{selectedService}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Describe your requirements in detail</p>
              {/* Mobile service display */}
              <p className="text-xs text-[#445FA2] font-medium sm:hidden">{selectedService}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <Card 
          className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Describe Your Work Requirements</CardTitle>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Provide detailed information to help workers understand your needs</p>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6 sm:space-y-8">
            {/* Service Display */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <Zap className="w-4 h-4 text-[#009889]" />
                Service Type
              </Label>
              <div className="p-3 sm:p-4 bg-gradient-to-r from-[#445FA2]/10 to-[#009889]/10 border-2 border-[#445FA2]/20 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#445FA2]/5 to-[#009889]/5"></div>
                <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#445FA2] font-bold text-base sm:text-lg">{selectedService}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <FileText className="w-4 h-4 text-[#009889]" />
                Job Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter a brief title for your job..."
                value={title}
                onChange={(e) => e.target.value.length <= 100 && setTitle(e.target.value)}
                  autoComplete="off" // Changed to "off" for title
                  className="border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl text-base sm:text-lg"
                required
              />
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                {title.length}/100 characters • Keep it short and descriptive
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <Camera className="w-4 h-4 text-[#009889]" />
                Upload Images (Optional)
              </Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 text-center hover:border-[#445FA2] transition-all duration-300 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    autoComplete="off"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Click to upload an image</p>
                    <p className="text-xs sm:text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </label>
                </div>

                {/* Image Preview */}
                {image && (
                  <div className="mt-4 sm:mt-6">
                    <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-fit mx-auto">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Uploaded preview"
                        className="w-full max-w-xs h-auto object-contain rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full p-0 shadow-lg hover:scale-110 transition-transform duration-300"
                        onClick={removeImage}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Toggle */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <MapPin className="w-4 h-4 text-[#445FA2]" />
                Is Job Location Different?
              </Label>
              <div className="flex items-center space-x-4 p-3 sm:p-4 bg-gradient-to-r from-[#445FA2]/10 to-[#009889]/10 border-2 border-[#445FA2]/20 rounded-xl">
                <Switch
                  id="location-switch"
                  checked={isDifferentLocation}
                  onCheckedChange={setIsDifferentLocation}
                />
                <div className="flex-1">
                  <Label htmlFor="location-switch" className="font-medium text-gray-800">Select if the job is at a different location than your address</Label>
                </div>
              </div>
              
              {isDifferentLocation && (
                <div className="mt-3">
                  <div className="relative">
                    <Input
                      placeholder="Enter city/area name"
                      autoComplete="address-level2" // Changed to "address-level2" for location
                      value={jobLocation}
                      onChange={(e) => {
                        const newLocation = e.target.value;
                        setJobLocation(newLocation);
                        if (locationValidated) setLocationValidated(false);
                        debouncedValidateLocation(newLocation);
                      }}
                      onBlur={() => {
                        if (jobLocation.trim().length >= 5 && !locationValidated) {
                          validateLocation(jobLocation);
                        }
                      }}
                      className={`border-2 pl-9 pr-10 transition-all duration-300 rounded-xl ${locationValidated ? 'border-green-500 focus:border-green-500' : 'border-gray-200 focus:border-[#445FA2]'}`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    {isValidatingLocation && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-[#445FA2] animate-spin" />
                      </div>
                    )}
                    {locationValidated && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {locationValidated ? 
                      (geocodingResult?.formattedAddress || "Location validated successfully") : 
                      "Enter city/area name, worker will ask you for the exact location"}
                  </div>
                </div>
              )}
            </div>
            
            {/* Urgency Toggle */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <Zap className="w-4 h-4 text-red-500" />
                Is this job urgent?
              </Label>
              <div className="flex items-center space-x-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-yellow-50 border-2 border-red-200/50 rounded-xl">
                <Switch
                  id="urgent-switch"
                  checked={isUrgent}
                  onCheckedChange={setIsUrgent}
                />
                <div className="flex-1">
                  <Label htmlFor="urgent-switch" className="font-medium text-gray-800">Mark as Urgent</Label>
                  <p className="text-xs text-gray-600">Urgent jobs are prioritized and cost an additional ₹50.</p>
                </div>
                {isUrgent && (
                  <div className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">+ ₹50</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 sm:mb-3">
                <FileText className="w-4 h-4 text-[#445FA2]" />
                Explain the Issue *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your work requirements in detail... Include specific issues, preferred timing, materials needed, etc."
                value={description}
                onChange={(e) => e.target.value.length <= 2000 && setDescription(e.target.value)}
                className="min-h-[120px] sm:min-h-[150px] border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl text-base sm:text-lg resize-none"
                required
              />
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                {description.length}/2000 characters • Be specific to get better responses
              </div>
            </div>

            {/* Post Button */}
            <div className="pt-4 sm:pt-6">
              <Button
                onClick={handlePost}
                className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#445FA2] to-[#445FA2]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Post Work - Pay ₹{100 + (isUrgent ? 50 : 0)}</span>
                  <span className="sm:hidden">Post Work - ₹{100 + (isUrgent ? 50 : 0)}</span>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
              </Button>
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                Secure payment • Get responses within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <Card className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md border-0 shadow-2xl relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/10 to-[#009889]/10"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Payment Confirmation
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600">Secure payment powered by Cashfree</p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-sm font-medium text-gray-600">Service</span>
                  <span className="font-bold text-base sm:text-lg text-[#445FA2] truncate ml-2">{selectedService}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Platform Fee</span>
                  <span className="font-medium">₹100</span>
                </div>
                {isUrgent && (
                  <div className="flex justify-between items-center mt-2 text-red-600">
                    <span className="text-sm font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4"/>Urgent Fee</span>
                    <span className="font-medium">₹50</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">₹{100 + (isUrgent ? 50 : 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 h-10 sm:h-12 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 rounded-xl order-2 sm:order-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105 rounded-xl font-bold order-1 sm:order-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-base">Pay Now</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}