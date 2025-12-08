import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  icon?: LucideIcon;
}

export default function TableOfContents({
  items,
  activeId,
  isCollapsed,
  onToggle,
}: {
  items: TableOfContentsItem[];
  activeId: string;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (!activeId || !navRef.current) return;

    const activeElement = itemRefs.current.get(activeId);
    
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest", 
      });
    }
  }, [activeId]);

  return (
    <div className="sticky top-32 transition-all duration-300 ease-out">
      <div
        className={`rounded-lg border border-white/8 bg-black/40 backdrop-blur-[100px] overflow-hidden transition-all duration-300 ease-out ${
          isCollapsed ? "w-14" : "w-60"
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 border-b border-white/8"
        >
          {isCollapsed ? (
            <Menu size={16} className="text-white/60 mx-auto" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Menu size={14} className="text-white/60" />
                <span className="text-white/90 text-xs">Contents</span>
              </div>
            </>
          )}
        </button>
        
        <nav 
          ref={navRef}
          className="p-2 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-custom scroll-smooth"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(item.id, el);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
                onClick={(e) => handleScrollToSection(e, item.id)}
                className={`flex items-center gap-2 p-2 rounded text-xs transition-all duration-300 ${
                  isActive
                    ? "text-white bg-white/10 font-medium"
                    : "text-white/50 hover:bg-white/5"
                }`}
                style={
                  !isCollapsed
                    ? { paddingLeft: `${(item.level - 1) * 10 + 8}px` }
                    : { justifyContent: "center" }
                }
              >
                {Icon && <Icon size={13} className="shrink-0" />}
                {!isCollapsed && (
                  <span className="line-clamp-1">{item.title}</span>
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
