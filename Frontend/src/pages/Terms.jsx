import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Sparkles, Shield, Users, CreditCard, Scale, Phone, Mail } from "lucide-react"


export default function TermsPage() {
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

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto bg-white/80 border-b border-[#445FA2]/10 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="bg-gradient-to-r lg:rounded-2xl lg:mt-6 from-[#445FA2] to-[#009889] text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            
            
            <div 
              className={`text-center transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Terms & Conditions</h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
                Please read these terms carefully before using our services
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
        <Card 
          className={`bg-white/80 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#445FA2]/5 to-[#009889]/5 opacity-50"></div>
          
          <CardHeader className="relative z-10">
            <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#445FA2]" />
              Last updated: December 15, 2024
            </div>
            <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
              Terms and Conditions of Service
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 prose prose-gray max-w-none">
            <div className="space-y-6 sm:space-y-8">
              {/* Introduction */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">1. Introduction</h2>
                </div>
                <div className="pl-11 space-y-3 sm:space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Welcome to KaamSetu ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of
                    our platform that connects clients with skilled workers for various services. By accessing or using
                    KaamSetu, you agree to be bound by these Terms.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    If you do not agree with any part of these Terms, you may not access or use our services.
                  </p>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* User Responsibilities */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">2. User Responsibilities</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">2.1 Account Registration</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      You must provide accurate, current, and complete information during registration. You are
                      responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">2.2 Prohibited Activities</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Providing false or misleading information</li>
                      <li>Engaging in fraudulent activities</li>
                      <li>Harassing or discriminating against other users</li>
                      <li>Violating any applicable laws or regulations</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Service Use */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">3. Service Use</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3.1 Platform Purpose</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      KaamSetu serves as a marketplace connecting clients with workers. We facilitate connections but do
                      not directly provide the services listed on our platform.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3.2 Service Quality</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      While we strive to maintain quality standards, the actual services are provided by independent
                      workers. We encourage users to review ratings and feedback before engaging services.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Payments */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">4. Payments</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4.1 Payment Processing</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      All payments are processed securely through our platform. We may charge service fees as disclosed
                      during the booking process.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4.2 Refunds</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      Refund policies vary by service type and circumstances. Please refer to our refund policy or
                      contact support for specific cases.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Disputes */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">5. Disputes</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5.1 Resolution Process</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      In case of disputes between clients and workers, we provide a mediation service to help resolve
                      issues fairly. Both parties are encouraged to communicate and work toward a mutually acceptable
                      solution.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5.2 Limitation of Liability</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      KaamSetu's liability is limited to the service fees paid through our platform. We are not
                      responsible for direct services provided by workers.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Changes to Terms */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">6. Changes to Terms</h2>
                </div>
                <div className="pl-11 space-y-3 sm:space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
                    posting on our platform. Your continued use of KaamSetu after changes constitutes acceptance of the
                    new Terms.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    We will notify users of significant changes through email or platform notifications.
                  </p>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">7. Contact Information</h2>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-gradient-to-r from-[#445FA2]/5 to-[#009889]/5 p-4 sm:p-6 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#445FA2]" />
                        <span><strong>Email:</strong> legal@kaamsetu.co.in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#009889]" />
                        <span><strong>Phone:</strong> +91 98765 43210</span>
                      </div>
                      <div className="sm:col-span-2 flex items-start gap-2">
                        <div className="w-4 h-4 text-[#445FA2] mt-0.5">📍</div>
                        <span><strong>Address:</strong> 123 Business Park, Sector 18, Gurugram, Haryana 122015, India</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}