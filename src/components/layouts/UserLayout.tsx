import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import HeaderLoggedIn from '@/components/layouts/includes/HeaderLoggedIn';
import HeaderPortal from '@/components/HeaderPortal';
import useLogout from '@/hooks/useLogout';
import useInactivityLogout from '@/hooks/useInactivityLogout';
import { USER_SIDEBAR } from './constants';
import Footer from './includes/Footer';

export default function UserLayout({ hideHeader = false }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const apiLogout = useLogout();
  // Auto-logout after 5 days of inactivity
  useInactivityLogout({ apiLogout, timeoutMs: 5 * 24 * 60 * 60 * 1000 });

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        {!sidebarCollapsed && <h2 className="text-lg font-semibold">My Ripples</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="p-2">
          {USER_SIDEBAR.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            // Map sidebar items to tutorial targets
            const tutorialTargetMap: Record<string, string> = {
              'Dashboard': 'sidebar-dashboard',
              'Website': 'sidebar-Website',
              'Post Story': 'sidebar-post-story',
              'My Stories': 'sidebar-my-stories',
              'Ripple Tracker': 'sidebar-ripple-tracker',
              'Leaderboard': 'sidebar-leaderboard',
              'Challenges': 'sidebar-challenges',
              'Ripple Card': 'sidebar-ripple-card',
              'Notifications': 'sidebar-notifications',
              'Analytics': 'sidebar-analytics',
              'Feedback': 'sidebar-feedback',
              'Settings': 'sidebar-settings',
            };
            const tutorialTarget = tutorialTargetMap[item.title] || '';

            // return (
            //   <NavLink
            //     key={item.href}
            //     to={item.href}
            //     data-tutorial-target={tutorialTarget}
            //     className={cn(
            //       "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
            //       "hover:bg-muted",
            //       isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
            //     )}
            //   >
            //     <Icon className="h-5 w-5 flex-shrink-0" />
            //     {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
            //   </NavLink>
            // );
            return (
              item.target ? (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.target}   // e.g. "_blank"
                  rel="noopener noreferrer"
                  data-tutorial-target={tutorialTarget}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                    "hover:bg-muted",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </a>
              ) : (
                <NavLink
                  key={item.href}
                  to={item.href}
                  data-tutorial-target={tutorialTarget}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                    "hover:bg-muted",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </NavLink>
              )
            );

          })}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
        <HeaderPortal>
          <HeaderLoggedIn sidebarItems={USER_SIDEBAR} />
        </HeaderPortal>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar - Always render, use CSS to show/hide */}
        <aside
          className={cn(
            "hidden md:flex bg-background border-r transition-all duration-300 flex-col",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full md:w-auto">
          <div className="container py-4 sm:py-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}