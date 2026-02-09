// src/App.tsx
import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import { routes } from "@/routes/index";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { initializeAvatarCache } from "./utils/avatarCache";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalLoader from "@/components/ui/GlobalLoader";
// import { PointsNotificationProvider } from "./components/gamification/PointsNotificationProvider";

const queryClient = new QueryClient();

const renderRoute = (route: (typeof routes)[0], index: number) => {
  // src/App.tsx
  const wrapElement = (element: React.ReactNode) => {
    if (route.guestOnly) {
      return <GuestRoute>{element}</GuestRoute>;
    }

    // Protected routes: if roles are specified, require auth + role
    if (route.roles && route.roles.length > 0) {
      return <ProtectedRoute allowedRoles={route.roles}>{element}</ProtectedRoute>;
    }

    // Otherwise: public route (no auth required)
    return element;
  };

  if (route.layout) {
    const Layout = route.layout;
    return (
      <Route
        key={route.path || `layout-${index}`}
        path={route.path}
        element={wrapElement(<Layout />)}
      >
        {route.children?.map(renderRoute)}
      </Route>
    );
  }

  return (
    <Route
      key={route.path || `route-${index}`}
      index={route.index}
      path={route.path}
      element={wrapElement(route.element!)}
    />
  );
};

export default function App() {
  const userStr = localStorage.getItem('ripple_auth_data');
  const user = userStr ? JSON.parse(userStr).user : null;

  // Initialize avatar cache on app load
  useEffect(() => {
    initializeAvatarCache().catch((err) => {
      console.error('Failed to initialize avatar cache:', err);
      // Don't block app if cache initialization fails - will fall back to static avatars
    });
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        {/* <PointsNotificationProvider userId={user?.id}> */}
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />

              <Suspense fallback={<GlobalLoader />}>
                <Routes>
                  {routes.map(renderRoute)}
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
        {/* </PointsNotificationProvider> */}
      </SettingsProvider>
    </AuthProvider>
  );
}