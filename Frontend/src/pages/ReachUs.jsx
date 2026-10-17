


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, MessageSquare, HelpCircle, Send, Clock, Users } from "lucide-react"
import { toast } from "sonner"

export default function ReachUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In real implementation, send POST request to backend
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      })

      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      toast.error("Error sending message", {
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
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
      <div className="relative z-10 max-w-7xl mx-auto bg-white/80 border-b border-[#445FA2]/10 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="bg-gradient-to-r from-[#445FA2] to-[#009889] text-white py-8 sm:py-12 lg:rounded-2xl lg:mt-6">
          <div className=" px-3 sm:px-4 lg:px-6">
            
            <div 
              className={`text-center transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Reach Us</h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
                We're here to help. Get in touch with us anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Get in touch with us through any of these channels</CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Email</p>
                    <p className="text-gray-600 text-sm sm:text-base">support@kaamsetu.co.in</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Phone</p>
                    <p className="text-gray-600 text-sm sm:text-base">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Office Address</p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      123 Business Park, Sector 18<br />
                      Gurugram, Haryana 122015<br />
                      India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support Card */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#009889] to-[#445FA2] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Help & Support
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Find answers to common questions or get direct support</CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#F5A623] to-[#F5A623]/90 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">FAQs</p>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">Find answers to frequently asked questions</p>
                    <Button variant="outline" size="sm" className="text-[#445FA2] border-[#445FA2] bg-transparent hover:bg-[#445FA2] hover:text-white transition-all duration-300">
                      View FAQs (Coming Soon)
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Direct Support</p>
                    <p className="text-gray-600 text-sm sm:text-base mb-1">Email us directly for technical support</p>
                    <p className="text-sm font-semibold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">help@kaamsetu.co.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Map Card */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Our Location
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-40 sm:h-48 flex items-center justify-center border-2 border-gray-300">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-[#445FA2]" />
                    <p className="text-sm font-medium">Google Maps Integration</p>
                    <p className="text-xs">(Coming Soon)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Form */}
          <div>
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#009889] to-[#445FA2] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Have a question or feedback? We'd love to hear from you.</CardDescription>
                
                {/* Response Time Badge */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">We typically respond within 24 hours</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-[#445FA2]" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-[#009889]" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-[#445FA2]" />
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="min-h-[120px] sm:min-h-[150px] border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-[#009889] to-[#009889]/90 hover:from-[#009889]/90 hover:to-[#009889] transition-all duration-300 hover:scale-105 rounded-xl shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}