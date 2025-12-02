export default function Logo() {
  return (
    <div className="relative w-[120px] h-20 group cursor-pointer" data-name="logo">
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <span className="font-league text-[48px] leading-none text-[#bbbbbb]/80 transition-all duration-500 group-hover:text-white group-hover:translate-y-[-5px]">
          EXIGENT
        </span>
      </div>

      <div className="absolute left-2 top-[22px]">
        <p className="font-pinyon text-[48px] leading-none text-white transition-all duration-500 group-hover:blur-[0.5px] group-hover:translate-y-0.5 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Blog
        </p>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-px bg-white transition-all duration-500 group-hover:w-full opacity-50" />
    </div>
  );
}
