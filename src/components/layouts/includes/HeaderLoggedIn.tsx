// Update the HeaderLoggedIn component to use role-specific URLs
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUrl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Users, Menu, X, CreditCard, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import defaultLogo from "@/assets/ripple-logo.png";
import { useAuth } from "@/context/AuthContext";
import { useApplicationSettings } from "@/hooks/useSettingsGroups";
import { LoggedInUserAvatar, LoggedInUserName } from "@/components/UserIdentity";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/config/api";
import ContactFormDialog from "@/components/shared/ContactFormDialog";

interface HeaderLoggedInProps {
  onMenuClick?: () => void;
  sidebarItems?: any[];
}

const HeaderLoggedIn = ({ onMenuClick, sidebarItems }: HeaderLoggedInProps = {}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mainNavOpen, setMainNavOpen] = useState(true);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { settings: companySettings } = useApplicationSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from user context
  const role = user?.role || "user";

  // Get logo and company name from settings
  const logo = getImageUrl((companySettings as any)?.header_logo, defaultLogo);
  const companyName = companySettings?.app_name || "Pass The Ripple";

  // Fetch unread count for badge
  const fetchUnreadCount = async () => {
    try {
      const data = await apiFetch('/notifications/count', {
        method: 'GET',
      }) as any;
      if (data?.success) {
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get base path based on role
  const getBasePath = () => {
    switch (role) {
      case "admin":
        return "/admin";
      case "teacher":
        return "/teacher";
      default:
        return "";
    }
  };

  // Helper function to get notifications URL based on role
  const getNotificationsUrl = () => {
    switch (role) {
      case "admin":
        return "/admin/notifications";
      case "teacher":
        return "/teacher/notifications";
      default:
        return "/notifications";
    }
  };

  // Helper function to get profile URL based on role
  const getProfileUrl = () => {
    switch (role) {
      case "admin":
        return "/admin/profile";
      case "teacher":
        return "/teacher/profile";
      default:
        return "/profile";
    }
  };

  // Helper function to get settings URL based on role
  const getSettingsUrl = () => {
    switch (role) {
      case "admin":
        return "/admin/settings";
      case "teacher":
        return "/teacher/settings";
      default:
        return "/settings";
    }
  };

  // Helper function to get ripple card URL based on role
  const getRippleCardUrl = () => {
    switch (role) {
      case "admin":
        return "/admin/ripple-card";
      case "teacher":
        return "/teacher/ripple-card";
      default:
        return "/ripple-card";
    }
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const mainNavLinks = [
    { label: "Home", href: "/", target: '_blank' },
    { label: "Hero Wall", href: "/hero-wall", target: '_blank' },
    // { label: "Highlights", href: "/highlights", target: '_blank' },
    { label: "Challenges", href: "/challenges-leaderboard", target: '_blank' },
    { label: "For Teachers", href: "/teachers", target: '_blank' },
    { label: "Kindness Map", href: "/ripple-map", target: '_blank' },
    { label: "Contact Us", href: "/contact-us", target: '_blank' },
  ];

  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo */}
          <Link to={getBasePath() || "/dashboard"} className="flex items-center">
            <img src={logo} alt={`${companyName} Logo`} className="h-12 w-auto" loading="lazy" />
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {mainNavLinks.map((link) =>
              link.target ? (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.target}
                  rel="noopener noreferrer"
                  className="text-sm xl:text-base text-foreground/80 hover:text-primary transition-colors font-medium whitespace-nowrap"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm xl:text-base text-foreground/80 hover:text-primary transition-colors font-medium whitespace-nowrap"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>


          {/* Right-side: Notifications + User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dynamic Notifications Dropdown */}
            <NotificationDropdown
              onNavigate={(path) => navigate(path)}
              basePath={getBasePath()}
            />


            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                  <LoggedInUserAvatar />
                  <div className="hidden lg:block text-left">
                    <LoggedInUserName className="text-sm font-semibold" />
                    <p className="text-xs text-muted-foreground capitalize">{role} Account</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-3">
                  <LoggedInUserAvatar size="h-10 w-10" />
                  <div>
                    <LoggedInUserName className="font-semibold" />
                    <p className="text-xs text-muted-foreground">Manage your account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Notifications Menu Item */}
                <DropdownMenuItem asChild>
                  <Link to={getNotificationsUrl()} className="flex items-center gap-2 w-full">
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="default" className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to={getProfileUrl()} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={getSettingsUrl()} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={getRippleCardUrl()} className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Ripple Card
                  </Link>
                </DropdownMenuItem>
                {(user as any)?.role === "parent" && (
                  <DropdownMenuItem asChild>
                    <Link to="/parent-consent" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Parent Consent
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHelpDialogOpen(true)} className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/logout" onClick={logout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger - Show if we have sidebar items or always show for user menu */}
          <button className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors" onClick={toggleMobile}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (

        <div className="md:hidden bg-background border-t max-h-[calc(100vh-4rem)] overflow-y-auto">

          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              {/* Main Navigation Links with Hamburger Toggle */}
              <button
                onClick={() => setMainNavOpen(!mainNavOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left font-medium"
              >
                <span>Navigation</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    mainNavOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {mainNavOpen && (
                <div className="pb-2 border-b mb-2 pl-4">
                  {mainNavLinks.map((link) => {
                    const isActive = location.pathname === link.href;
                    return link.target ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target={link.target}
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent"
                        )}
                        onClick={toggleMobile}
                      >
                        <span>{link.label}</span>
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent"
                        )}
                        onClick={toggleMobile}
                      >
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Sidebar Items (if provided) - Filter out Notifications and Settings to avoid duplicates */}
              {sidebarItems && sidebarItems.length > 0 && (
                <>
                  {sidebarItems
                    .filter((item) => {
                      // Filter out items that match user account items
                      const titleLower = item.title?.toLowerCase() || '';
                      const hrefLower = item.href?.toLowerCase() || '';
                      return !(
                        titleLower === 'notifications' ||
                        titleLower === 'settings' ||
                        titleLower === 'ripple card' ||
                        hrefLower.includes('/notifications') ||
                        hrefLower.includes('/settings') ||
                        hrefLower.includes('/ripple-card')
                      );
                    })
                    .map((item) => {
                      if (item.children && item.children.length > 0) {
                        // Handle items with children - also filter children
                        const filteredChildren = item.children.filter((child: any) => {
                          const childTitleLower = child.title?.toLowerCase() || '';
                          const childHrefLower = child.href?.toLowerCase() || '';
                          return !(
                            childTitleLower === 'notifications' ||
                            childTitleLower === 'settings' ||
                            childTitleLower === 'ripple card' ||
                            childHrefLower.includes('/notifications') ||
                            childHrefLower.includes('/settings') ||
                            childHrefLower.includes('/ripple-card')
                          );
                        });

                        if (filteredChildren.length === 0) return null;

                        const isChildActive = filteredChildren.some((child: any) => location.pathname === child.href);
                        return (
                          <div key={item.title || item.href}>
                            <div className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg",
                              isChildActive ? "bg-muted" : "text-muted-foreground"
                            )}>
                              {item.icon && <item.icon className="h-5 w-5" />}
                              <span className="font-medium">{item.title}</span>
                            </div>
                            {filteredChildren.map((child: any) => {
                              const isActive = location.pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-3 pl-12 rounded-lg transition-colors",
                                    isActive
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                      : "hover:bg-accent"
                                  )}
                                  onClick={toggleMobile}
                                >
                                  {child.icon && <child.icon className="h-5 w-5" />}
                                  <span>{child.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      }
                      // Handle regular items
                      const isActive = item.href && location.pathname === item.href;
                      return (
                        <Link
                          key={item.href || item.title}
                          to={item.href || '#'}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "hover:bg-accent"
                          )}
                          onClick={toggleMobile}
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  <div className="border-t my-2" />
                </>
              )}

              {/* User Account Items */}
              <Link
                to={getNotificationsUrl()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={toggleMobile}
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Link>

              <Link
                to={getProfileUrl()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={toggleMobile}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                to={getSettingsUrl()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={toggleMobile}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link
                to={getRippleCardUrl()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={toggleMobile}
              >
                <CreditCard className="h-5 w-5" />
                <span>Ripple Card</span>
              </Link>
              {(user as any)?.role === "parent" && (
                <Link
                  to="/parent-consent"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={toggleMobile}
                >
                  <Users className="h-5 w-5" />
                  <span>Parent Consent</span>
                </Link>
              )}
              <div className="border-t my-2" />
              <button
                onClick={() => {
                  setHelpDialogOpen(true);
                  toggleMobile();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors w-full text-left"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </button>
              <div className="border-t my-2" />
              <Link
                to="/logout"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-red-600 transition-colors"
                onClick={toggleMobile}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
      <ContactFormDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
    </header>
  );
};

export default HeaderLoggedIn;