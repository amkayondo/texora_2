"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/AppContext";
import { AuthProvider, routeForRole } from "@/components/auth-provider";

function DashboardRedirect() {
  const { currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) router.replace(routeForRole(currentUser.role));
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Opening your dashboard...</div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider requireAuth>
      <DashboardRedirect />
    </AuthProvider>
  );
}
