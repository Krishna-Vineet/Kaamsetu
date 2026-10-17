

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from '../ui/card'
import { assets } from '@/assets/assets'
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"


const ServiceCategories = () => {
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

  const services = [
    { image: assets.acRepair, title: "AC Repair", color: "bg-blue-100", delay: 0 },
    { image: assets.carWash, title: "Car Wash", color: "bg-cyan-100", delay: 100 },
    { image: assets.cleaner, title: "Cleaner", color: "bg-green-100", delay: 200 },
    { image: assets.cook, title: "Cook", color: "bg-amber-100", delay: 300 },
    { image: assets.driver, title: "Driver", color: "bg-slate-100", delay: 400 },
    { image: assets.electrician, title: "Electrician", color: "bg-yellow-100", delay: 500 },
    // { image: assets.furnitureAssembler, title: "Furniture Assembler", color: "bg-orange-100", delay: 600 },
    { image: assets.gardner, title: "Gardener", color: "bg-emerald-100", delay: 600 },
    { image: assets.helper, title: "Helper", color: "bg-gray-100", delay: 700 },
    // { image: assets.interiorDecor, title: "Interior Decorator", color: "bg-purple-100", delay: 900 },
    { image: assets.mason, title: "Mason", color: "bg-stone-100", delay: 800 },
    { image: assets.mechanic, title: "Mechanic", color: "bg-red-100", delay: 900 },
    { image: assets.nurse, title: "Nurse", color: "bg-pink-100", delay: 1000 },
    { image: assets.pestControl, title: "Pest Control", color: "bg-indigo-100", delay: 1100 },
    { image: assets.plumber, title: "Plumber", color: "bg-blue-200", delay: 1200 },
    { image: assets.sofaCleaning, title: "Sofa Cleaning", color: "bg-lime-100", delay: 1300 },
    { image: assets.tailor, title: "Tailor", color: "bg-rose-100", delay: 1400 },
    { image: assets.tiler, title: "Tiler", color: "bg-neutral-100", delay: 1500 },
    { image: assets.tutor, title: "Tutor", color: "bg-violet-100", delay: 1600 },
    { image: assets.arrowRight, title: "More", color: "bg-orange-100", delay: 1700},
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#445FA2]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#009889]/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#445FA2]/3 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <Sparkles className="w-4 h-4 text-[#445FA2]" />
            <span className="text-sm font-medium text-gray-700">Popular Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Discover Trusted Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find skilled workers for all your service needs with verified profiles and ratings
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {services.map((service, index) => {
            const linkTo = service.title === "More" ? "/client/hire" : `/client/post?service=${encodeURIComponent(service.title)}`;
            return (
              <div
                key={service.title}
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${service.delay}ms` }}
              >
                <Link
                  to={linkTo}
                  className="group cursor-pointer block w-full h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Card
                    className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden ${
                      hoveredIndex === index ? 'ring-2 ring-[#445FA2]/20' : ''
                    }`}
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardContent className="p-5 text-center relative z-10">
                      <div className="relative mb-4">
                        <div
                          className={`w-16 h-16 mx-auto rounded-full ${service.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300 overflow-hidden shadow-lg group-hover:shadow-xl`}
                        >
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-12 h-12 object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Floating Icon */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#445FA2] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
                          <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#445FA2] transition-colors duration-200">
                        {service.title}
                      </h3>
                      
                      {/* Hover Indicator */}
                      <div className="mt-2 h-0.5 bg-gradient-to-r from-[#445FA2] to-[#009889] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Link to="/client/hire" className="inline-block">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#445FA2] to-[#009889] text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group">
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServiceCategories