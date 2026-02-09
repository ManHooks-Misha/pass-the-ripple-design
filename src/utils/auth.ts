import { getAuthToken } from "@/lib/auth-token";

export type UserRole = "user" | "admin" | "teacher" | "child" | null;

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

export function getUserRole(): UserRole {
  const role = localStorage.getItem("role");
  if (role === "admin" || role === "teacher" || role === "user" || role === "child") {
    return role;
  }
  return null;
}