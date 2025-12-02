"use client";

import { useState, useRef } from "react";

interface PageTitleProps {
  mainText: string;
  accentText: string;
  subtitle?: string;
}

export default function PageTitle({ mainText, accentText, subtitle }: PageTitleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const titleRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!titleRef.current || !isHovered) return;

    const rect = titleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveX = ((x / rect.width) - 0.5) * 20;
    const moveY = ((y / rect.height) - 0.5) * 20;

    setMove({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMove({ x: 0, y: 0 });
  };

  return (
    <div>
      <div
        ref={titleRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block cursor-default group/title mb-4"
      >
        <div
          className="absolute -inset-6 opacity-0 group-hover/title:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <h1 className="text-white relative inline-block" style={{ lineHeight: "1.1" }}>
          <span
            className="relative inline-block transition-all duration-700 ease-out"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
              fontWeight: "300",
              transform: `translate(${move.x * 0.3}px, ${move.y * 0.3}px)`,
              marginRight: "0.4em",
            }}
          >
            {mainText}
          </span>

          <span
            className="font-pinyon relative inline-block transition-all duration-700 ease-out"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              textShadow: isHovered ? "0 0 30px rgba(255,255,255,0.2)" : "none",
              transform: `translate(${move.x * 0.5}px, ${move.y * 0.5}px) scale(${
                isHovered ? 1.03 : 1
              })`,
            }}
          >
            {accentText}
          </span>

          <span
            className="absolute left-0 bottom-0 h-0.5 bg-linear-to-r from-white/60 to-transparent transition-all duration-500"
            style={{
              width: isHovered ? "50%" : "40%",
              opacity: isHovered ? 1 : 0.7,
            }}
          ></span>
        </h1>
      </div>

      {subtitle && <p className="text-white/40 text-lg">{subtitle}</p>}
    </div>
  );
}
