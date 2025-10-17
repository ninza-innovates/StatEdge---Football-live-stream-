import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface QuickNavProps {
  sections: { id: string; label: string; icon?: React.ReactNode }[];
}

export function QuickNav({ sections }: QuickNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Account for sticky header height (~56px)
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      className="sticky top-14 z-50 bg-background border-b shadow-sm relative"
      style={{ position: "-webkit-sticky" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 
          The scroller itself can overflow horizontally, but not the page.
          -mx-4 sm:-mx-0 allows edge-to-edge scrolling on mobile 
          px-4 sm:px-0 maintains visual padding
        */}
        <div className="flex overflow-x-auto py-3 gap-2 -mx-4 sm:-mx-0 px-4 sm:px-0 scrollbar-hide">
          {sections.map((s) => (
            <Button
              key={s.id}
              variant="secondary"
              size="sm"
              className={cn("shrink-0 rounded-full whitespace-nowrap", "px-3 sm:px-4 py-2", "text-xs sm:text-sm")}
              onClick={() => scrollTo(s.id)}
            >
              {s.icon && <span className="mr-1.5 sm:mr-2 inline-flex">{s.icon}</span>}
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Gradient indicator showing more content is available (mobile only) */}
      <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
