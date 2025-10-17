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
    // account for sticky header height (~56px)
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    // IMPORTANT: clip any child overflow to prevent page-wide overflow on mobile
    <div
      className="sticky top-14 z-50 bg-background border-b shadow-sm relative overflow-x-hidden"
      style={{ position: "-webkit-sticky" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* The scroller itself can overflow, not the page */}
        <div className="flex overflow-x-auto py-3 gap-2 w-full max-w-full">
          {sections.map((s) => (
            <Button
              key={s.id}
              variant="secondary"
              size="sm"
              className={cn("shrink-0 rounded-full", "px-3 sm:px-4 py-2", "whitespace-nowrap")}
              onClick={() => scrollTo(s.id)}
            >
              {s.icon ? <span className="mr-2 inline-flex">{s.icon}</span> : null}
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* This gradient stays inside the sticky wrapper and is clipped */}
      <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
