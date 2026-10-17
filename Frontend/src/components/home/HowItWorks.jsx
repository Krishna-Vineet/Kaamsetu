

import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"
import { Users, MessageSquare, CheckCircle, Sparkles, ArrowRight } from "lucide-react"

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredStep, setHoveredStep] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const steps = [
    {
      number: 1,
      title: "Post a Job",
      description: "Describe your service needs and get matched with skilled workers",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      delay: 0
    },
    {
      number: 2,
      title: "Get Matched",
      description: "Receive proposals from verified professionals in your area",
      icon: MessageSquare,
      color: "from-teal-500 to-teal-600",
      delay: 200
    },
    {
      number: 3,
      title: "Complete Work",
      description: "Hire the best worker and get your job done professionally",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      delay: 400
    }
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#445FA2]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#009889]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#445FA2]/3 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <Sparkles className="w-4 h-4 text-[#445FA2]" />
            <span className="text-sm font-medium text-gray-700">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your work done in three simple steps with our trusted platform
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`text-center group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${step.delay}ms` }}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="relative">
                {/* Step Number Badge */}
                <Badge 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4 mx-auto bg-gradient-to-r ${step.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                    hoveredStep === index ? 'scale-110' : ''
                  }`}
                >
                  {step.number}
                </Badge>

                {/* Icon Container */}
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  
                  <step.icon className={`w-10 h-10 text-[#445FA2] transition-colors duration-300 relative z-10`} />
                </div>

                {/* Connecting Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100`}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#445FA2] transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Indicator */}
                <div className={`mt-4 h-0.5 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-24 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join thousands of satisfied customers who trust KaamSetu for their service needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="px-8 py-3 bg-gradient-to-r from-[#445FA2] to-[#009889] text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group">
                  <span className="flex items-center gap-2">
                    Register as Client
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
              <Link to="/register">
                <button className="px-8 py-3 border-2 border-[#445FA2] text-[#445FA2] rounded-full font-medium transition-all duration-300 transform hover:-translate-y-0.5 group relative overflow-hidden
                  hover:text-white hover:border-transparent
                  ">
                  <span className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#009889] to-[#445FA2]"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Register as Worker
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks