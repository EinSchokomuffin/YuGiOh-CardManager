"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/store";
import apiClient from "@/lib/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync token from store to API client when app loads
  useEffect(() => {
    if (isHydrated) {
      if (token) {
        apiClient.setToken(token);
        // Verify token is still valid
        apiClient.getProfile().catch(() => {
          // Token is invalid, logout
          logout();
          apiClient.setToken(null);
        });
      }
    }
  }, [token, isHydrated, logout]);

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse text-amber-500 text-xl">🎴 DuelVault lädt...</div>
      </div>
    );
  }

  return <>{children}</>;
}
