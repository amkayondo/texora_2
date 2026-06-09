"use client";

import { AuthProvider } from "@/components/auth-provider";
import { AuthPage } from "@/screens/AuthPage";

export default function AuthRoutePage() {
  return (
    <AuthProvider redirectAuthenticated>
      <AuthPage />
    </AuthProvider>
  );
}
