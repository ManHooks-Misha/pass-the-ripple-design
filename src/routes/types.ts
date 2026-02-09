import { ReactNode, ComponentType } from "react";

export type UserRole = "student" | "teacher" | "admin" | "child" | "user";

export interface RouteConfig {
  path?: string;
  index?: boolean;
  element?: ReactNode;
  loader?: () => Promise<{ default: React.ComponentType }>;
  
  // ✅ Layouts don't need to accept `children` as prop — they use <Outlet />
  layout?: ComponentType; // 👈 just any React component
  
  public?: boolean;
  guestOnly?: boolean;
  roles?: UserRole[];
  children?: RouteConfig[];
}