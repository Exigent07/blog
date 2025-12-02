"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink } from "lucide-react";
import { ParsedMention, getProfilePicture, getSocialLinks } from "../utils/parseMention";
import Image from "next/image";
import { FaGithub, FaTwitter } from "react-icons/fa6";

interface InlineMentionProps {
  mention: ParsedMention;
}

export function InlineMention({ mention }: InlineMentionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showAbove, setShowAbove] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const profilePicture = getProfilePicture(mention);
  const socialLinks = getSocialLinks(mention);
  
  const primaryLink = socialLinks.github || socialLinks.twitter || socialLinks.bluesky;

  const calculatePosition = () => {
    if (linkRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      const estimatedCardWidth = 320;
      const estimatedCardHeight = 200; 
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = linkRect.left + linkRect.width / 2 - estimatedCardWidth / 2;
      let y = linkRect.bottom + 12;
      let shouldShowAbove = false;

      if (x + estimatedCardWidth > viewportWidth - 20) {
        x = viewportWidth - estimatedCardWidth - 20;
      }

      if (x < 20) {
        x = 20;
      }

      if (y + estimatedCardHeight > viewportHeight - 20) {
        y = linkRect.top - estimatedCardHeight - 12;
        shouldShowAbove = true;
      }

      setPosition({ x, y });
      setShowAbove(shouldShowAbove);
    }
  };

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    calculatePosition();

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleCardMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleCardMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (primaryLink) {
      e.preventDefault();
      window.open(primaryLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <a
        ref={linkRef}
        href={primaryLink}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-flex items-center cursor-pointer group/mention no-underline"
      >
        <span className="relative px-1 py-0.5 rounded transition-all duration-300 text-white/70 hover:text-white underline decoration-white/30 hover:decoration-white/60 underline-offset-2">
          @{mention.displayName}
        </span>
      </a>

      {isHovered && createPortal(
        <AnimatePresence>
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: showAbove ? 10 : -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? 10 : -10, scale: 0.92 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 9999,
            }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="w-80"
          >
            <div
              className="absolute -inset-0.5 rounded-2xl opacity-40"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                filter: 'blur(16px)',
              }}
            />

            <div className="relative bg-black/98 backdrop-blur-xl rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)',
                }}
              />

              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0 group/avatar">
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative w-14 h-14 rounded-full border border-white/20 overflow-hidden bg-white/5">
                      <Image
                        width={100}
                        height={100}
                        src={profilePicture}
                        alt={mention.displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mention.displayName}`;
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-white/95 mb-1 truncate block">
                      {mention.displayName}
                    </span>
                    {mention.description && (
                      <span className="text-white/50 text-xs leading-relaxed block">
                        {mention.description}
                      </span>
                    )}
                  </div>
                </div>

                {(socialLinks.twitter || socialLinks.github || socialLinks.bluesky) && (
                  <>
                    <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-4" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      {socialLinks.github && (
                        <a
                          href={socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/social flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/2 hover:bg-white/6 transition-all duration-300"
                          title="GitHub"
                        >
                          <FaGithub size={16} className="text-white/50 group-hover/social:text-white/90 transition-colors duration-300 shrink-0" />
                          <span className="text-xs text-white/60 group-hover/social:text-white/90 transition-colors duration-300 truncate">
                            {mention.github}
                          </span>
                        </a>
                      )}

                      {socialLinks.twitter && (
                        <a
                          href={socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/social flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/2 hover:bg-white/6 transition-all duration-300"
                          title="Twitter"
                        >
                          <FaTwitter size={16} className="text-white/50 group-hover/social:text-white/90 transition-colors duration-300 shrink-0" />
                          <span className="text-xs text-white/60 group-hover/social:text-white/90 transition-colors duration-300 truncate">
                            {mention.twitter}
                          </span>
                        </a>
                      )}

                      {socialLinks.bluesky && (
                        <a
                          href={socialLinks.bluesky}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group/social flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/2 hover:bg-white/6 transition-all duration-300 col-span-2"
                          title="Bluesky"
                        >
                          <ExternalLink size={16} className="text-white/50 group-hover/social:text-white/90 transition-colors duration-300 shrink-0" />
                          <span className="text-xs text-white/60 group-hover/social:text-white/90 transition-colors duration-300 truncate">
                            Bluesky
                          </span>
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
