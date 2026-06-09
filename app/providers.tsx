"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AppProvider } from "@/AppContext";
import { ThemeProvider } from "@/hooks/use-theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="texora-ui-theme">
      <AppProvider>
        {children}
        <Toaster theme="light" position="top-right" richColors closeButton />
      </AppProvider>
    </ThemeProvider>
  );
}
