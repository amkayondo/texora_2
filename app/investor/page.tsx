"use client";

import { AuthProvider } from "@/components/auth-provider";
import { DonorDashboard } from "@/screens/DonorDashboard";
import { UserRole } from "@/types";

export default function InvestorPage() {
  return (
    <AuthProvider requireAuth allowedRole={UserRole.DONOR}>
      <div className="min-h-screen bg-background text-foreground">
        <DonorDashboard />
      </div>
    </AuthProvider>
  );
}
