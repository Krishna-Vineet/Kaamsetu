

import { useEffect, useState, useRef } from "react"
import { Star, Sparkles, Award, Clock } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { assets } from "@/assets/assets"

const FeaturesWorkers = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
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

  const workers = [
    { 
      name: "Rajesh Kumar", 
      skill: "Plumber", 
      rating: 4.8, 
      image: assets.rajeshKumar,
      experience: "8 years",
      completedJobs: 156,
      delay: 0
    },
    { 
      name: "Priya Sharma", 
      skill: "Electrician", 
      rating: 4.9, 
      image: assets.priyaSharma,
      experience: "12 years",
      completedJobs: 203,
      delay: 200
    },
    { 
      name: "Amit Singh", 
      skill: "Painter", 
      rating: 4.7, 
      image: assets.amitSingh,
      experience: "6 years",
      completedJobs: 89,
      delay: 400
    },
    { 
      name: "Sunita Devi", 
      skill: "Cleaner", 
      rating: 4.8, 
      image: assets.sunitaDevi,
      experience: "10 years",
      completedJobs: 178,
      delay: 600
    },
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#009889]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#445FA2]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#009889]/3 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <Award className="w-4 h-4 text-[#009889]" />
            <span className="text-sm font-medium text-gray-700">Top Rated Workers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Featured Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Highly skilled and verified workers trusted by thousands of customers
          </p>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-4">
          {workers.map((worker, index) => (
            <div
              key={index}
              className={`w-full transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${worker.delay}ms` }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg relative overflow-hidden ${
                  hoveredIndex === index ? 'ring-2 ring-[#009889]/20' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#009889]/5 to-[#445FA2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="py-2 px-6 text-center relative z-10">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <img
                        src={worker.image}
                        alt={worker.name}
                        className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Worker Info */}
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#009889] transition-colors duration-200 text-lg">
                    {worker.name}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm font-medium">{worker.skill}</p>

                  {/* Experience & Jobs */}
                  <div className="flex justify-center gap-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{worker.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{worker.completedJobs} jobs</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(worker.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1 font-medium">
                      {worker.rating}
                    </span>
                  </div>

                  {/* Rating Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                    <div
                      className="bg-gradient-to-r from-[#009889] to-[#445FA2] h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${(worker.rating / 5) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default FeaturesWorkers