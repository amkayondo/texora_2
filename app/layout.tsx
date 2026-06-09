import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "Texora",
  description: "Milestone-based funding for creators and donors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
