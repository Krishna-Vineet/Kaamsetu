

import { useEffect, useState, useRef } from "react"
import { Star, ChevronLeft, ChevronRight, Quote, Award } from "lucide-react"
import { Card, CardContent } from "../ui/card"

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
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

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Homeowner",
      text: "KaamSetu connected me with an excellent plumber who fixed my bathroom issue in no time. The service was professional and the pricing was transparent. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Priya Patel",
      role: "Business Owner",
      text: "I needed electrical work done for my office renovation. The electrician from KaamSetu was not only skilled but also very punctual. The quality of work exceeded my expectations.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Amit Kumar",
      role: "Property Manager",
      text: "Managing multiple properties requires reliable service providers. KaamSetu has been a game-changer with their verified workers and quality assurance. Trustworthy platform!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Sunita Devi",
      role: "Restaurant Owner",
      text: "The cleaning service I hired through KaamSetu was exceptional. The team was thorough, professional, and completed the work ahead of schedule. Will definitely use again!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-4">
            <Award className="w-4 h-4 text-[#009889]" />
            <span className="text-sm font-medium text-gray-700">Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from satisfied customers who trust KaamSetu
          </p>
        </div>

        {/* Testimonials */}
        <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-[#009889]/10 to-[#445FA2]/10 rounded-full flex items-center justify-center">
              <Quote className="w-6 h-6 text-[#009889]" />
            </div>

            <CardContent className="p-8 text-center relative">
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < testimonials[currentTestimonial].rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-lg text-gray-700 mb-8 italic leading-relaxed max-w-3xl mx-auto">
                "{testimonials[currentTestimonial].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#445FA2] text-lg">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </CardContent>
              {/* Closing Quote Icon */}
              <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-r from-[#445FA2]/10 to-[#009889]/10 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-[#445FA2] rotate-180" />
              </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="group w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border-2 border-[#445FA2] text-[#445FA2] hover:bg-[#445FA2] hover:text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-[#009889] scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="group w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border-2 border-[#009889] text-[#009889] hover:bg-[#009889] hover:text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Stats */}
        
      </div>
    </section>
  )
}

export default Testimonials