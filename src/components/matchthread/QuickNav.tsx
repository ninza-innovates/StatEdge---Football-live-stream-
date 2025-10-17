import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

interface QuickNavProps {
  sections: Array<{ id: string; label: string; icon?: React.ReactNode }>;
}

export function QuickNav({ sections }: QuickNavProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // mouse drag-to-scroll (touch already works natively)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onDown = (e: MouseEvent) => {
      dragging.current = true;
      el.classList.add("cursor-grabbing");
      startX.current = e.pageX - el.offsetLeft;
      startScrollLeft.current = el.scrollLeft;
    };
    const onLeave = () => {
      dragging.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onUp = () => {
      dragging.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX.current) * 1; // multiplier = scroll speed
      el.scrollLeft = startScrollLeft.current - walk;
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 200;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const { offsetTop, offsetHeight } = el;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="sticky top-14 z-50 w-full bg-background border-b shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          ref={scrollerRef}
          className={`
            -mx-4 px-4 flex gap-2 py-3 min-h-[56px]
            overflow-x-auto snap-x snap-mandatory scroll-smooth
            touch-pan-x overscroll-x-contain select-none
            cursor-grab
            [scrollbar-width:none]                   /* Firefox hide */
            [&::-webkit-scrollbar]:hidden            /* WebKit hide */
          `}
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

      <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
