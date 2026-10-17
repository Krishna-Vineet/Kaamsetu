import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, AlertTriangle, Phone, Mail, Lock, Verified } from "lucide-react"

export default function SafetyPage() {
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

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Background Verification",
      description: "All workers undergo thorough background checks, criminal record verification, and identity validation before joining our platform."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Payments are held in escrow until service completion. We use industry-standard encryption and secure payment gateways."
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Workers are rated and reviewed by clients. Low-rated workers are suspended, ensuring only reliable professionals serve you."
    },
    {
      icon: AlertTriangle,
      title: "Emergency Support",
      description: "24/7 emergency support available. Report any issues immediately and receive assistance from our safety team."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#445FA2]/10 via-white to-[#009889]/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-4 sm:h-4 bg-[#445FA2]/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-[#009889]/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 sm:w-5 sm:h-5 bg-[#445FA2]/25 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-[#009889]/35 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
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
          <div className="px-3 sm:px-4 lg:px-6">
            <div 
              className={`text-center transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Safety First</h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
                Your safety is our top priority. Learn about our comprehensive safety measures.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Safety Features */}
          <div className="space-y-6">
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Safety Features
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">How we keep you protected</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="space-y-3">
                  {safetyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{feature.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reporting Incidents */}
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#009889] to-[#445FA2] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Report an Issue
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">If you encounter any safety concerns, report immediately</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#F5A623] to-[#F5A623]/90 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Immediate Action</p>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">Call emergency services first if in danger. Then report to us.</p>
                    <p className="text-sm font-semibold text-red-600">Emergency Hotline: 112</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Report to KaamSetu</p>
                    <p className="text-gray-600 text-sm sm:text-base">Use our reporting system or contact support for immediate assistance.</p>
                    <p className="text-sm font-semibold text-[#009889]">safety@kaamsetu.co.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges and Guidelines */}
          <div>
            <Card 
              className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Safety Guidelines
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Best practices for safe service experiences</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Meet in Public</h4>
                      <p className="text-gray-600 text-sm sm:text-base">For in-person services, meet in well-lit, public areas and inform a friend about your location.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Verify Identity</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Always check the worker's ID and match it with the profile photo before allowing entry.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Secure Payments</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Never pay cash directly. Use our secure payment system for all transactions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Stay Connected</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Keep your phone charged and share your location with trusted contacts during the service.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}