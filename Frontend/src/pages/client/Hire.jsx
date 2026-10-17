

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { services } from "../../lib/services"
import { Search, ArrowLeft, Sparkles, Users, ArrowRight, Zap, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";

export default function HireWorker() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filteredServices = services.filter((service) => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleServiceSelect = (serviceName) => {
    const input = serviceName.toLowerCase().split(" ").join("-");
    navigate(`/client/post?service=${encodeURIComponent(serviceName)}`);
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
              <Link to="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent truncate">
                Hire a Worker
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Find skilled professionals for your needs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Hero Section */}
        <div 
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4 sm:mb-6">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#445FA2]" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">25,000+ Verified Workers</span>
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#009889]" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
            What service do you{" "}
            <span className="text-[#009889] relative animate-bounce" style={{ animationDuration: '2s' }}>
              need?
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Connect with trusted professionals in your area for any service requirement
          </p>
        </div>

        {/* Search Section */}
        <Card 
          className={`mb-8 sm:mb-12 bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#445FA2]" />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Quick Service Search</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <div className="text-center my-4 sm:my-6">
              <p className="text-gray-600">Search for a specific service</p>
            </div>
            <div>
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Type to search services..."
                  autoComplete="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-[#445FA2] transition-all duration-300 rounded-xl text-base sm:text-lg"
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#009889]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Grid */}
        {searchQuery && (
          <Card 
            className={`mb-6 sm:mb-8 bg-white/80 backdrop-blur-md border-0 shadow-2xl transition-all duration-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <CardHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#009889]" />
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Search Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredServices.map((service, index) => (
                  <div
                    key={service.name}
                    className={`transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    <Button
                      variant="outline"
                      className={`group h-auto p-4 sm:p-6 text-left justify-start w-full border-2 border-gray-200 hover:border-[#445FA2] bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#445FA2] hover:to-[#009889] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl relative overflow-hidden ${
                        hoveredIndex === index ? 'ring-2 ring-[#445FA2]/20' : ''
                      }`}
                      onClick={() => handleServiceSelect(service.name)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex items-center gap-3 sm:gap-4 w-full">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#445FA2] to-[#009889] text-white flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {service.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base sm:text-lg mb-1 truncate">{service.name}</div>
                          <div className="text-xs sm:text-sm opacity-70 line-clamp-2">{service.description}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
              {filteredServices.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                  <div className="text-lg sm:text-xl text-gray-500 mb-2">No services found</div>
                  <div className="text-sm sm:text-base text-gray-400">Try searching with different keywords</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Popular Services */}
        {!searchQuery && (
          <Card 
            className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl transition-all duration-500 relative overflow-hidden ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-50"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#009889]" />
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900">Popular Services</CardTitle>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Most requested services by our clients</p>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {services.map((service, index) => (
                  <div
                    key={service.name}
                    className={`transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    <Button
                      variant="outline"
                      className={`group h-auto p-4 sm:p-6 text-left justify-start w-full border-2 border-gray-200 hover:border-[#445FA2] bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#445FA2] hover:to-[#009889] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl relative overflow-hidden ${
                        hoveredIndex === index ? 'ring-2 ring-[#445FA2]/20' : ''
                      }`}
                      onClick={() => handleServiceSelect(service.name)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex items-center gap-3 sm:gap-4 w-full">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#445FA2] to-[#009889] text-white flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {service.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base sm:text-lg mb-1 truncate">{service.name}</div>
                          <div className="text-xs sm:text-sm opacity-70 line-clamp-2">{service.description}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}