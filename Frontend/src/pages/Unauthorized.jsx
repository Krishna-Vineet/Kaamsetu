import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, LogIn, Home, Shield, UserPlus, HelpCircle} from "lucide-react"
import { logo } from "@/assets/assets"

export default function UnauthorizedPage() {
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 m-6 sm:px-4 lg:px-6 lg:m-0">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Security Display */}
            <div 
              className={`text-center lg:text-left transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-6 sm:mb-8">
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="KaamSetu" 
                    className="h-16 sm:h-20 lg:h-30 rounded-l" 
                  />
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8 sm:mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">Access Denied</h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-6 sm:mb-8">
                  Unauthorized Access
                </h2>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0">
                  You do not have permission to view this page. Please log in with the appropriate credentials or contact
                  support if you believe this is an error.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <span>Data Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                  <span>24/7 Monitored</span>
                </div>
              </div>
            </div>

            {/* Right Side - Actions Card */}
            <div 
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-[#445FA2]/5 opacity-50"></div>
                
                <CardContent className="relative z-10 p-6 sm:p-8 lg:p-12">
                  {/* Lock Icon and Illustration */}
                  <div className="text-center mb-8 sm:mb-12">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 shadow-lg border-2 border-red-200 relative">
                      <Lock className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-red-500" />
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-full flex items-center justify-center animate-bounce">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-[#445FA2] to-[#445FA2]/90 hover:from-[#445FA2]/90 hover:to-[#445FA2] transition-all duration-300 hover:scale-105 rounded-xl h-14 sm:h-16 lg:h-18 text-lg sm:text-xl font-bold shadow-lg"
                    >
                      <Link to="/login">
                        <LogIn className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                        Login to Continue
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-2 border-[#009889] text-[#009889] hover:bg-[#009889] hover:text-white bg-transparent transition-all duration-300 hover:scale-105 rounded-xl h-14 sm:h-16 lg:h-18 text-lg sm:text-xl font-bold"
                    >
                      <Link to="/">
                        <Home className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                        Go Home
                      </Link>
                    </Button>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6 pt-6 sm:pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#445FA2]/5 to-[#009889]/5 rounded-xl">
                      <UserPlus className="w-5 h-5 text-[#445FA2]" />
                      <span className="text-sm sm:text-base text-gray-700">
                        Don't have an account?{" "}
                        <Link 
                          to="/auth/signup" 
                          className="text-[#445FA2] hover:text-[#009889] font-bold hover:underline transition-colors duration-200"
                        >
                          Sign up here
                        </Link>
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <HelpCircle className="w-5 h-5 text-[#009889]" />
                        <span className="text-base sm:text-lg font-semibold text-gray-700">Need Help?</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-500">
                        Contact us at{" "}
                        <a 
                          href="mailto:support@kaamsetu.co.in" 
                          className="text-[#009889] hover:text-[#445FA2] font-semibold hover:underline transition-colors duration-200"
                        >
                          support@kaamsetu.co.in
                        </a>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-2">
                        We're here to help you 24/7
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}