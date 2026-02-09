import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";

const FooterSection = () => {
  const { settings: appSettings } = useApplicationSettings();

  const supportEmail = appSettings?.support_email || "hello@ripplechallenge.org";
  const companyName = appSettings?.app_name || "Pass The Ripple";
  const registrationYear = appSettings?.company_registration_year || "2024";

  return (
    <footer className="bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Platform */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/hero-wall" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Hero Wall
                  </Link>
                </li>
                <li>
                  <Link to="/highlights" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Highlights
                  </Link>
                </li>
                <li>
                  <Link to="/journey-map" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Journey Map
                  </Link>
                </li>
                <li>
                  <Link to="/age-gate" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Educators */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">For Educators</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/resources" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Teacher Resources
                  </Link>
                </li>
                <li>
                  <Link to="/classroom" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Classroom Tools
                  </Link>
                </li>
                <li>
                  <Link to="/teacher" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Teacher Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Information</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about-us" className="text-gray-600 hover:text-purple-500 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-purple-500 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/content?page=how-it-works" className="text-gray-600 hover:text-purple-500 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/content?page=safety-guidelines" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Safety Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Legal & Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-gray-600 hover:text-purple-500 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-gray-600 hover:text-purple-500 transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {supportEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-4">
                Made with love for kids worldwide 💖
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <Link to="/privacy" className="hover:text-purple-500 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">•</span>
                <Link to="/privacy" className="hover:text-purple-500 transition-colors">
                  Terms of Service
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                © {registrationYear} {companyName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;