import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, HelpCircle, Phone, Mail, Clock, Shield, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpCenterPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "To book a service, simply search for the category you need, select a verified worker, choose your preferred time slot, and complete the payment. You'll receive instant confirmation and worker details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI payments, net banking, and digital wallets. All transactions are secure and encrypted."
    },
    {
      question: "How are workers verified?",
      answer: "All workers undergo background checks, skill assessments, and provide valid identification documents. We also require references and conduct interviews before approval."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may incur a 50% fee. No-show by workers is covered by our guarantee."
    },
    {
      question: "How do I rate and review a worker?",
      answer: "After service completion, you'll receive a rating prompt. Provide stars and comments to help other clients make informed decisions. Your feedback helps maintain quality."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Help Center</h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
                Find answers to your questions or get help from our support team.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Search and Quick Help */}
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
                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Search for Answers
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Type your question below to find relevant help articles</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                      type="text"
                      placeholder="Search help articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoComplete="search"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-[#445FA2] rounded-xl focus:outline-none transition-all duration-300"
                    />
                </div>
              </CardContent>
            </Card>

            {/* Support Options */}
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
                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Get Support
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Contact our team for personalized assistance</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Phone Support</p>
                    <p className="text-gray-600 text-sm sm:text-base">Call us Monday to Friday, 9AM - 6PM</p>
                    <p className="text-sm font-semibold text-[#445FA2]">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Email Support</p>
                    <p className="text-gray-600 text-sm sm:text-base">We respond within 24 hours</p>
                    <p className="text-sm font-semibold text-[#009889]">support@kaamsetu.co.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Live chat available during business hours</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
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
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">Common questions and answers about our platform</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-[#445FA2]" />
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredFaqs.length === 0 && searchTerm && (
                  <p className="text-gray-500 text-center py-8">No results found for "{searchTerm}". Try different keywords.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}