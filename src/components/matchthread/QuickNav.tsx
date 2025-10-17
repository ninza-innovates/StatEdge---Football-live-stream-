import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface QuickNavProps {
  sections: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export function QuickNav({ sections }: QuickNavProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const { offsetTop, offsetHeight } = el;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100;
    const elPos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: elPos, behavior: "smooth" });
  };

  return (
    <div className="sticky top-14 z-50 w-full bg-background border-b shadow-sm relative">
      {/* padding container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* The ONLY scroll container */}
        <div
          className="
            -mx-4 px-4
            flex gap-2 py-3 min-h-[56px]
            overflow-x-auto scrollbar-none
            snap-x snap-mandatory scroll-smooth
            touch-pan-x overscroll-x-contain
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                transition-all duration-200 flex-shrink-0 snap-start
                ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-card hover:bg-accent text-foreground border"
                }
              `}
            >
              {section.icon && <span className="h-4 w-4">{section.icon}</span>}
              <span className="text-sm font-medium">{section.label}</span>
              {activeSection === section.id && <ChevronRight className="h-3 w-3 animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      {/* right fade, doesn't block touches */}
      <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
