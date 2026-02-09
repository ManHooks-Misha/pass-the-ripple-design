import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import defaultLogo from "@/assets/ripple-logo.png";
import { useAuth } from "@/context/AuthContext";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";
import { getImageUrl } from "@/utils/imageUrl";
import btnBlueBg from "@/assets/Challenges/btn-purple-bg.png";
import btnPinkBg from "@/assets/Challenges/btn-pink-bg.png";
import btnGreenBg from "@/assets/Challenges/btn-green-bg.png";
import "@/styles/components/_header.scss";


const MagicalHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to check if current path matches
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Get nav link classes with active state
  const getNavLinkClass = (path: string) => {
    const baseClass = "text-xs transition-colors font-medium font-teachers uppercase px-[10px] py-[14px] border-b-2 whitespace-nowrap";
    return isActive(path)
      ? `${baseClass} text-primary border-primary`
      : `${baseClass} text-black hover:text-primary border-transparent`;
  };

  // Mobile nav link classes
  const getMobileNavLinkClass = (path: string) => {
    const baseClass = "text-base transition-colors font-medium font-teachers uppercase py-2 border-l-4";
    return isActive(path)
      ? `${baseClass} text-primary border-primary pl-3`
      : `${baseClass} text-black hover:text-primary border-transparent`;
  };

  const { user } = useAuth();
  const { settings: companySettings } = useApplicationSettings();

  // Get logo and company name from settings
  const logo = getImageUrl((companySettings as any)?.header_logo, defaultLogo);
  const companyName = companySettings?.app_name || "Pass The Ripple";

  const getDashboardRoute = () => {
    if (!user) return "/login"; // fallback, shouldn't be used if guarded properly

    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "user":
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-0 border-transparent backdrop-blur-sm" id="mainHeader">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-20">
          {/* Mobile Menu Button - Left Side */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0" style={{ "color": "#9F00C7" }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Logo - Left/Center */}
          <Link to="/" className="hidden xl:flex items-center head-logo hover:scale-105 transition-transform flex-shrink-0">
            <img
              src={logo}
              alt={`${companyName} Logo`}
              className="h-10 w-auto"
              loading="lazy"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 header-nav flex-nowrap">
            <Link to="/" className={getNavLinkClass("/")}>
              Home
            </Link>
            <Link to="/hero-wall" className={getNavLinkClass("/hero-wall")}>
              Hero Wall
            </Link>
            {/* <Link to="/highlights" className={getNavLinkClass("/highlights")}>
              Highlights
            </Link> */}
            <Link to="/challenges-leaderboard" className={getNavLinkClass("/challenges-leaderboard")}>
              Challenges
            </Link>
            <Link to="/teachers" className={getNavLinkClass("/teachers")}>
              For Teachers
            </Link>
            <Link to="/ripple-map" className={getNavLinkClass("/ripple-map")}>
              Kindness Map
            </Link>
            <Link to="/contact-us" className={getNavLinkClass("/contact-us")}>
              Contact Us
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0 ml-auto">
            {!user ? (
              <>
                <Link to="/login" className="header-btn-action">
                  <p className="header-btn-bg" style={{ backgroundImage: `url(${btnBlueBg})` }}>
                    Sign In
                  </p>
                </Link>
                <Link to="/age-gate" className="header-btn-action">
                  <p className="header-btn-bg" style={{ backgroundImage: `url(${btnPinkBg})` }}>
                    Join Now
                  </p>
                </Link>
              </>
            ) : (
              <Link to={getDashboardRoute()} className="header-btn-action">
                <p className="header-btn-bg" style={{ backgroundImage: `url(${btnGreenBg})` }}>
                  Dashboard
                </p>
              </Link>
            )}
          </div>

          {/* Mobile Logo - Right Side */}
          <Link to="/" className="xl:hidden flex items-center head-logo hover:scale-105 transition-transform flex-shrink-0 ml-auto">
            <img
              src={logo}
              alt={`${companyName} Logo`}
              className="h-10 w-auto"
              loading="lazy"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-20 left-0 right-0 bg-[#EBE2E3] border-b border-gray-300 shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
            <Link
              to="/"
              className={getMobileNavLinkClass("/")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/hero-wall"
              className={getMobileNavLinkClass("/hero-wall")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Hero Wall
            </Link>
            {/* <Link
              to="/highlights"
              className={getMobileNavLinkClass("/highlights")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Highlights
            </Link> */}
            <Link
              to="/challenges-leaderboard"
              className={getMobileNavLinkClass("/challenges-leaderboard")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Challenges
            </Link>
            <Link
              to="/teachers"
              className={getMobileNavLinkClass("/teachers")}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Teachers
            </Link>
            <Link
              to="/ripple-map"
              className={getMobileNavLinkClass("/ripple-map")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Kindness Map
            </Link>
            <Link
              to="/contact-us"
              className={`${getMobileNavLinkClass("/contact-us")} mb-4`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="flex gap-2 pt-4 border-t border-gray-300 authmobile-cta">
              {!user ? (
                <>
                  <Link to="/login" className="flex-1 header-btn-action-mobile" onClick={() => setMobileMenuOpen(false)}>
                    <p className="header-btn-bg" style={{ backgroundImage: `url(${btnBlueBg})` }}>
                      Sign In
                    </p>
                  </Link>
                  <Link to="/age-gate" className="flex-1 header-btn-action-mobile" onClick={() => setMobileMenuOpen(false)}>
                    <p className="header-btn-bg" style={{ backgroundImage: `url(${btnPinkBg})` }}>
                      Join Now
                    </p>
                  </Link>
                </>
              ) : (
                <Link to={getDashboardRoute()} className="flex-1 header-btn-action-mobile" onClick={() => setMobileMenuOpen(false)}>
                  <p className="header-btn-bg" style={{ backgroundImage: `url(${btnGreenBg})` }}>
                    Dashboard
                  </p>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default MagicalHeader;
export { MagicalHeader };