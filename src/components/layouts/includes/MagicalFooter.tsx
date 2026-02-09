import { Link } from "react-router-dom";
import { useApplicationSettings, useSocialSettings } from "@/hooks/useSettingsGroups";
import { getImageUrl } from "@/utils/imageUrl";
import defaultLogo from "@/assets/ripple-logo.png";
import rippleLogo from "@/assets/ripple-logo.png";
import instaImg from "@/assets/home-img/instagram.webp";
import ytImg from "@/assets/home-img/youtube.webp";
import fbImg from "@/assets/home-img/facebook.webp";
import tiktokImg from "@/assets/home-img/tiktok.webp";

const MagicalFooter = () => {
  const { settings: socialSettings } = useSocialSettings();
  const { settings: companySettings } = useApplicationSettings();

  // Get logo from settings
  const logo = getImageUrl((companySettings as any)?.header_logo, rippleLogo);
  const companyName = companySettings?.app_name || "Pass The Ripple";
  const currentYear = new Date().getFullYear();
  // const supportEmail = companySettings?.support_email || "Support@kindness.com";
  const supportEmail = "Support@kindness.com";

  return (
    <footer className="custom-footer">
      <div className="container mx-auto px-4">
        {/* Changed items-start to items-center might be better, but let's stick to center text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* COLUMN 1: ABOUT + LOGO (Center Aligned) */}
          <div className="text-center">
            <Link to="/">
              <img src={logo} alt={`${companyName} Logo`} className="fot-logo mx-auto  p-3 pt-0" />
            </Link>
            <p className="footer-logo-text">
              From The MatteringVerse: a connected ecosystem that<br /> empowers kids to grow, care, and create ripples of good.
            </p>
          </div>

          {/* COLUMN 2: QUICK LINKS (Center Aligned) */}
          <div className="text-center">
            <h5 className="footer-title mb-0">Quick Links</h5>
            <div className="space-y-2">
              <p className="mb-1"><Link to="/about-us" className="text-decoration-none text-dark hover:text-purple-600 transition-colors">About Us</Link></p>
              <p className="mb-1"><Link to="/faq" className="text-decoration-none text-dark hover:text-purple-600 transition-colors">FAQ</Link></p>
              <p className="mb-1"><Link to="/safety-and-security-statement" className="text-decoration-none text-dark hover:text-purple-600 transition-colors">Safety And Security</Link></p>
              <p className="mb-1"><Link to="/privacy-policy" className="text-decoration-none text-dark hover:text-purple-600 transition-colors">Privacy Policy</Link></p>
              <p className="mb-1"><Link to="/terms-of-service" className="text-decoration-none text-dark hover:text-purple-600 transition-colors">Terms of Service</Link></p>
            </div>
          </div>

          {/* COLUMN 3: CONTACT & SOCIAL (Center Aligned) */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-3">
              <h5 className="footer-title m-0">Connect with Us</h5>
              {/* <p className="footer-contact m-0 ">
                <i className="fa-regular fa-envelope"></i>
                <a href={`mailto:${supportEmail}`} className="text-dark hover:text-purple-600 transition-colors">{supportEmail}</a>
              </p> */}

              <div className="footer-social mt-5 flex justify-center gap-3 flex-wrap">
                {socialSettings?.instagram_url && (
                  <a href={socialSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                    <img src={instaImg} alt="Instagram" />
                  </a>
                )}

                {socialSettings?.facebook_url && (
                  <a href={socialSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                    <img src={fbImg} alt="Facebook" />
                  </a>
                )}

                {socialSettings?.youtube_url && (
                  <a href={socialSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                    <img src={ytImg} alt="YouTube" />
                  </a>
                )}

                {socialSettings?.twitter_url && (
                  <a href={socialSettings.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                    <img src={tiktokImg} alt="TikTok" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="footer-bottom mt-8 pt-4 border-t border-gray-200">
          ©{currentYear} Pass The Ripple Spreading kindness worldwide
        </div>
      </div>
    </footer>
  );
};

export default MagicalFooter;
export { MagicalFooter };
