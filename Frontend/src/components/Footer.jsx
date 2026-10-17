 import { logo } from "@/assets/assets"
 import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={logo} 
                  alt="KaamSetu Logo" 
                  className="h-8 w-auto"
                />
                <h3 className="text-xl font-bold text-[#009889]">KaamSetu</h3>
              </div>
              <p className="text-gray-300">Connecting clients and skilled workers for every need.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#009788]">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/about" className="hover:text-[#445FA2] transition-colors duration-200">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/reach-us" className="hover:text-[#445FA2] transition-colors duration-200">
                    Reach Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#009788]">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/terms" className="hover:text-[#445FA2] transition-colors duration-200">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#445FA2] transition-colors duration-200">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#009889]">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/help-center" className="hover:text-[#445FA2] transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="hover:text-[#445FA2] transition-colors duration-200">
                    Safety
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2024 KaamSetu. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
