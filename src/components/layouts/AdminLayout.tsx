import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import HeaderLoggedIn from '@/components/layouts/includes/HeaderLoggedIn';
import HeaderPortal from '@/components/HeaderPortal';
import useLogout from '@/hooks/useLogout';
import useInactivityLogout from '@/hooks/useInactivityLogout';
import { ADMIN_SIDEBAR } from './constants';
import Footer from './includes/Footer';


interface SidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: SidebarItem[];
}

function SidebarMenuItem({ item, collapsed, depth = 0 }: { item: SidebarItem; collapsed: boolean; depth?: number }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const isChildActive = hasChildren && item.children.some(child => location.pathname === child.href);

  React.useEffect(() => {
    if (isChildActive && !collapsed) {
      setIsOpen(true);
    }
  }, [isChildActive, collapsed]);

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => !collapsed && setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
            "hover:bg-muted",
            isChildActive && "bg-muted"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || depth === 0) && (
            <>
              <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </>
          )}
        </button>

        {(!collapsed || depth === 0) && isOpen && (
          <div className="ml-2">
            {item.children.map((child) => (
              <SidebarMenuItem
                key={child.href || child.title}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
        "hover:bg-muted",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium">{item.title}</span>
      )}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const apiLogout = useLogout();
  // Auto-logout after 5 days of inactivity
  useInactivityLogout({ apiLogout, timeoutMs: 5 * 24 * 60 * 60 * 1000 });

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        {!sidebarCollapsed && (
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        )}
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
          {ADMIN_SIDEBAR.map((item) => (
            <SidebarMenuItem
              key={item.href || item.title}
              item={item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <HeaderPortal>
        <HeaderLoggedIn sidebarItems={ADMIN_SIDEBAR} />
      </HeaderPortal>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Desktop Sidebar - Always render, use CSS to show/hide */}
        <aside className={cn(
          "hidden md:flex bg-background border-r transition-all duration-300 flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full md:w-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="w-full">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}