

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Users, Star } from "lucide-react"
import { logo } from "@/assets/assets"

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    })
  }

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#445FA2]/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#009889]/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-5 h-5 bg-[#445FA2]/25 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#009889]/35 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Large Glowing Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#445FA2]/10 rounded-full blur-3xl animate-bounce" 
          style={{ 
            animationDuration: '6s', 
            animationDelay: '0s',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        ></div>
        <div 
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-[#009889]/10 rounded-full blur-3xl animate-bounce" 
          style={{ 
            animationDuration: '7s', 
            animationDelay: '1s',
            transform: `translateY(${scrollY * -0.1}px)`
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#445FA2]/8 rounded-full blur-3xl animate-bounce" 
          style={{ 
            animationDuration: '8s', 
            animationDelay: '2s',
            transform: `translateY(${scrollY * 0.05}px)`
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-16">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-md border border-gray-200/50">
              <img 
                src={logo} 
                alt="KaamSetu Logo" 
                className="h-12 w-auto"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
                KaamSetu
              </h1>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-8 animate-bounce" style={{ animationDuration: '2s' }}>
            <Sparkles className="w-4 h-4 text-[#445FA2]" />
            <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ users</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Trusted Service Workers{" "}
            <span 
              className="text-[#009889] relative animate-bounce"
              style={{
                textShadow: '0 0 20px rgba(0, 152, 137, 0.3)',
                animationDuration: '2s'
              }}
            >
              Near You
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connecting Clients and Skilled Workers for Every Need
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center group">
              <div className="text-3xl font-bold text-[#445FA2] group-hover:text-[#009889] transition-colors duration-300">50K+</div>
              <div className="text-sm text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-[#445FA2] group-hover:text-[#009889] transition-colors duration-300">25K+</div>
              <div className="text-sm text-gray-600">Skilled Workers</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-[#445FA2] group-hover:text-[#009889] transition-colors duration-300">4.9★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/client/hire">
              <Button
                size="lg"
                className="group text-lg px-8 py-6 rounded-full bg-gradient-to-r from-[#445FA2] to-[#445FA2]/90 hover:from-[#445FA2]/90 hover:to-[#445FA2] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Hire a Worker
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#009889] to-[#009889]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="group text-lg px-8 py-6 rounded-full border-2 bg-white/80 backdrop-blur-sm border-[#009889] text-[#009889] hover:bg-[#009889] hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Become a Worker
                </span>
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <span>Verified Workers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div onClick={scrollDown} className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer">
        <div className="w-5 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-4 bg-gray-400 rounded-full mt-2  animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection;