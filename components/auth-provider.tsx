"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/AppContext";
import { UserRole } from "@/types";

type AuthProviderProps = {
  allowedRole?: UserRole;
  children: ReactNode;
  redirectAuthenticated?: boolean;
  requireAuth?: boolean;
};

export const routeForRole = (role: UserRole) => (role === UserRole.CREATOR ? "/creator" : "/investor");

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading Texora...</div>
    </div>
  );
}

export function AuthProvider({
  allowedRole,
  children,
  redirectAuthenticated = false,
  requireAuth = false,
}: AuthProviderProps) {
  const { currentUser, isLoading } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (redirectAuthenticated && currentUser) {
      router.replace(routeForRole(currentUser.role));
      return;
    }

    if (requireAuth && !currentUser) {
      router.replace("/auth");
      return;
    }

    if (requireAuth && currentUser && allowedRole && currentUser.role !== allowedRole) {
      router.replace(routeForRole(currentUser.role));
    }
  }, [allowedRole, currentUser, isLoading, pathname, redirectAuthenticated, requireAuth, router]);

  if (isLoading) return <AuthLoading />;

  if (redirectAuthenticated && currentUser) return <AuthLoading />;
  if (requireAuth && !currentUser) return <AuthLoading />;
  if (requireAuth && currentUser && allowedRole && currentUser.role !== allowedRole) return <AuthLoading />;

  return <>{children}</>;
}
