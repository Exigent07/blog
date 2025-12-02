"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreativeButtonProps {
  children: string;
  onClick?: () => void;
  icon?: "right" | "left";
  href?: string;
  className?: string;
}

export default function CreativeButton({ children, onClick, icon = "right", href, className = "" }: CreativeButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (href) {
      if (href.startsWith("#")) {
         window.location.hash = href;
      } else {
         router.push(href);
      }
    }
    onClick?.();
  };

  return (
    <button 
      onClick={handleClick}
      className={`group/btn-creative relative px-8 py-4 border border-white/20 text-white rounded-full overflow-hidden hover:border-white/40 transition-all duration-500 hover:scale-105 cursor-pointer ${className}`}
    >
      <span className="relative flex items-center justify-center gap-2">
        {icon === "left" && (
          <ArrowLeft 
            size={20} 
            className="absolute transition-all duration-500 -translate-x-[150%] opacity-0 group-hover/btn-creative:translate-x-0 group-hover/btn-creative:opacity-100" 
          />
        )}

        <span className={`inline-block transition-all duration-500 ${
          icon === "left" 
            ? "group-hover/btn-creative:translate-x-[150%]" 
            : "group-hover/btn-creative:-translate-x-[150%]"
        } group-hover/btn-creative:opacity-0`}>
          {children}
        </span>

        {icon === "right" && (
          <ArrowRight 
            size={20} 
            className="absolute transition-all duration-500 translate-x-[150%] opacity-0 group-hover/btn-creative:translate-x-0 group-hover/btn-creative:opacity-100" 
          />
        )}
      </span>
      
      <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover/btn-creative:scale-x-100 transition-transform duration-500 origin-left"></div>
    </button>
  );
}
