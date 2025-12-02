export default function Loading() {
  return (
    <div className="fixed flex items-center justify-center w-full h-screen top-0 left-0 min-h-[100px]">
      <div className="relative flex items-center justify-center size-16">
        <div className="absolute inset-0 rounded-full border border-white/10 border-t-white/80 border-r-white/30 animate-[spin_2s_linear_infinite]" />
        
        <div className="absolute inset-3 rounded-full border border-white/10 border-b-white/80 border-l-white/30 animate-[spin_1.5s_linear_infinite_reverse]" />
        
        <div className="absolute size-1 bg-white rounded-full shadow-[0_0_10px_1px_rgba(255,255,255,0.5)]" />
      </div>
    </div>
  );
}
