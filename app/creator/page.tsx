"use client";

import { AuthProvider } from "@/components/auth-provider";
import { CreatorDashboard } from "@/screens/CreatorDashboard";
import { UserRole } from "@/types";

export default function CreatorPage() {
  return (
    <AuthProvider requireAuth allowedRole={UserRole.CREATOR}>
      <div className="min-h-screen bg-background text-foreground">
        <CreatorDashboard />
      </div>
    </AuthProvider>
  );
}
