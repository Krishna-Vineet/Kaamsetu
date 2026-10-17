

import Testimonials from "@/components/home/Testimonials"
import FeaturesWorkers from "@/components/home/FeaturesWorkers"
import HowItWorks from "@/components/home/HowItWorks"
import HeroSection from "@/components/home/HeroSection"
import ServiceCategories from "@/components/home/ServiceCategories"
import Stats from "@/components/home/Stats"

export default function KaamSetuLanding() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ServiceCategories />
      <FeaturesWorkers />
      <Stats />
      <HowItWorks />
      <Testimonials />
    </div>
  )
}
