import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Sparkles, Database, Users, Eye, Lock, Phone, Mail } from "lucide-react"

export default function PrivacyPage() {
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
        <div className="lg:rounded-2xl lg:mt-6 bg-gradient-to-r from-[#445FA2] to-[#009889] text-white py-8 sm:py-12">
          <div className=" px-3 sm:px-4 lg:px-6 ">
            
            <div 
              className={`text-center transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Privacy Policy</h1>
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
                Your privacy is important to us. Learn how we protect your data.
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
              <Shield className="w-4 h-4 text-[#445FA2]" />
              Last updated: December 15, 2024
            </div>
            <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-[#445FA2] to-[#009889] bg-clip-text text-transparent">
              Privacy Policy
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
                    At KaamSetu, we are committed to protecting your privacy and ensuring the security of your personal
                    information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you use our platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    By using KaamSetu, you consent to the data practices described in this policy.
                  </p>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Data Collection */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">2. Data Collection</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Account registration details (name, email, phone number)</li>
                      <li>Profile information and service preferences</li>
                      <li>Payment and billing information</li>
                      <li>Communications and feedback</li>
                      <li>Identity verification documents</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Device information and IP address</li>
                      <li>Usage patterns and app interactions</li>
                      <li>Location data (with your permission)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Data Usage */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">3. Data Usage</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">3.1 Primary Uses</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Facilitating connections between clients and workers</li>
                      <li>Processing payments and transactions</li>
                      <li>Providing customer support and resolving disputes</li>
                      <li>Improving our services and user experience</li>
                      <li>Ensuring platform security and preventing fraud</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3.2 Communication</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      We may use your contact information to send service-related notifications, updates about your
                      bookings, and important platform announcements. Marketing communications are sent only with your
                      explicit consent.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Third-Party Sharing */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">4. Third-Party Sharing</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4.1 Service Providers</h3>
                    <p className="text-gray-700 leading-relaxed mb-2 text-sm sm:text-base">
                      We may share your information with trusted third-party service providers who assist us in:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Payment processing and financial services</li>
                      <li>Cloud hosting and data storage</li>
                      <li>Analytics and performance monitoring</li>
                      <li>Customer support and communication tools</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4.2 Legal Requirements</h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        We may disclose your information when required by law, court order, or to protect our rights,
                        property, or safety, or that of our users or the public.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4.3 Business Transfers</h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred as
                        part of the business transaction.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Security */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">5. Security</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">5.1 Data Protection Measures</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Encryption of sensitive data in transit and at rest</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Employee training on data protection practices</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5.2 Data Breach Response</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      In the unlikely event of a data breach, we will notify affected users and relevant authorities as
                      required by law, typically within 72 hours of discovery.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* User Rights */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">6. User Rights</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-violet-50 to-violet-100 rounded-xl border border-violet-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">6.1 Your Rights</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Access and review your personal information</li>
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Request deletion of your account and data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Data portability and export options</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">6.2 Exercising Your Rights</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      To exercise any of these rights, please contact us at privacy@kaamsetu.co.in. We will respond to
                      your request within 30 days and may require identity verification.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Cookies and Tracking */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#445FA2] to-[#009889] rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">7. Cookies and Tracking</h2>
                </div>
                <div className="pl-11 space-y-4 sm:space-y-6">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">7.1 Cookie Usage</h3>
                    <p className="text-gray-700 leading-relaxed mb-2 text-sm sm:text-base">We use cookies and similar technologies to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                      <li>Remember your preferences and settings</li>
                      <li>Analyze platform usage and performance</li>
                      <li>Provide personalized content and recommendations</li>
                      <li>Ensure platform security and prevent fraud</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-lime-50 to-lime-100 rounded-xl border border-lime-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">7.2 Cookie Management</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      You can control cookie settings through your browser preferences. Note that disabling certain
                      cookies may affect platform functionality.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6 sm:my-8" />

              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#009889] to-[#445FA2] rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#445FA2] mb-0">8. Contact Information</h2>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gradient-to-r from-[#445FA2]/5 to-[#009889]/5 p-4 sm:p-6 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#445FA2]" />
                        <span><strong>Privacy Officer:</strong> privacy@kaamsetu.co.in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#009889]" />
                        <span><strong>General Support:</strong> support@kaamsetu.co.in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#445FA2]" />
                        <span><strong>Phone:</strong> +91 98765 43210</span>
                      </div>
                      <div className="sm:col-span-2 flex items-start gap-2">
                        <div className="w-4 h-4 text-[#009889] mt-0.5">📍</div>
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