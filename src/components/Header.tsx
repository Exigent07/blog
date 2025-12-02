"use client";

import Logo from "./Logo";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div 
        className="absolute inset-0 transition-all duration-700 ease-out pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)'
        }}
      ></div>

      <nav className="relative container mx-auto px-4 lg:px-8 py-6 pointer-events-auto">
        <div className="flex items-center justify-center">
          <Link 
            href="/" 
            className="w-[90px] h-[71px] block transition-all duration-300 hover:scale-105 hover:opacity-80"
          >
            <Logo />
          </Link>
        </div>
      </nav>
    </header>
  );
}