import { Award, Sparkles, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const Stats = () => {

    const [isVisible, setIsVisible] = useState(false)
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


  return (
    <section ref={sectionRef} className={`px-4 sm:px-6 lg:px-8 py-16 max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-white to-teal-50 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
            <div className="text-gray-600">Jobs Completed</div>
          </div>
        </section>
  )
}

export default Stats