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
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sticky top-14 z-40 bg-background border-b will-change-transform">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Mobile: Horizontal Scroll */}
        <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2 snap-x snap-mandatory scroll-smooth min-h-[56px]">
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
              {activeSection === section.id && (
                <ChevronRight className="h-3 w-3 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator - only visible on mobile */}
      <div className="sm:hidden absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
