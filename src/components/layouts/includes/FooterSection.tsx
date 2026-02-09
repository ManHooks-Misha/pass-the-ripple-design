import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useApplicationSettings, useSocialSettings } from "@/hooks/useSettingsGroups";
import { getImageUrl } from "@/utils/imageUrl";
import defaultLogo from "@/assets/ripple-challenge-logo.png";

const FooterSection = () => {
  const { settings: appSettings } = useApplicationSettings();
  const { settings: socialSettings } = useSocialSettings();

  const logoUrl = getImageUrl((appSettings as any)?.footer_logo || (appSettings as any)?.header_logo, defaultLogo);
  const companyName = appSettings?.app_name || "Pass The Ripple";
  const supportEmail = appSettings?.support_email || "Support@kindness.com";
  const supportPhone = appSettings?.support_phone || "";

  return (
    <footer className="footer-section bg-[#fdfdfd] border-t border-gray-100 py-6 font-teachers overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-medium">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/">
              <img src={logoUrl} alt={companyName} className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Center: Copyright */}
          <div className="flex-1 flex justify-center text-center">
            <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          </div>

          {/* Right: Credits */}
          <div className="flex-1 flex justify-end items-center gap-1">
            <span>Made with</span>
            <Link to="https://mishainfotech.com" target="_blank" className="font-bold text-gray-500 hover:text-purple-600 transition-colors">
              Misha Infotech
            </Link>
            <span>for the future</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
export { FooterSection };