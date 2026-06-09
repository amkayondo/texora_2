"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

type MobileSidebarHeaderProps = {
  title: string;
};

export function MobileSidebarHeader({ title }: MobileSidebarHeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <SidebarTrigger className="h-10 w-10" />
      <span className="font-semibold text-foreground">{title}</span>
    </div>
  );
}
