import { ArrowUpRight } from "lucide-react";

export default function CardButton() {
  return (
    <div className="group/btn relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:border-white/60">
      <div 
        className="absolute inset-0 bg-white/10 scale-0 group-hover/btn:scale-100 transition-transform duration-500 rounded-full"
      ></div>
      <ArrowUpRight 
        size={20} 
        className="absolute text-white/60 transition-all duration-500 group-hover/btn:translate-x-12 group-hover/btn:-translate-y-12 group-hover/btn:opacity-0 group-hover/btn:rotate-45 group-hover/btn:scale-75" 
      />
      <ArrowUpRight 
        size={20} 
        className="absolute text-white transition-all duration-500 -translate-x-12 translate-y-12 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0 group-hover/btn:opacity-100 group-hover/btn:rotate-0 group-hover/btn:scale-110" 
      />
    </div>
  );
}
