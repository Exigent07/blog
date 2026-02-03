"use client";

import { Film } from "lucide-react";
import { useRef } from "react";
import MediaThemeSutro from "player.style/sutro/react";

interface VideoEmbedProps {
  src?: string;
  description?: string;
  lightThumbnail?: string;
}

export default function VideoEmbed({
  src = "",
  description,
  lightThumbnail,
}: VideoEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!src) return null;

  return (
    <div className="group my-8">
      <div
        ref={containerRef}
        className="
          relative rounded-xl overflow-hidden
          border border-white/10
          bg-black/60 backdrop-blur-xl
          transition-all duration-300
          hover:border-white/20
          shadow-lg hover:shadow-xl
        "
      >
        <div
          className="relative w-full flex items-center justify-center aspect-video"
          style={{ aspectRatio: "16/9" }}
        >
          <MediaThemeSutro
            style={
              {
                width: "100%",
                height: "100%",
                aspectRatio: "16/9",
                "--media-primary-color": "rgba(255, 255, 255, 0.95)",
                "--media-secondary-color": "rgba(255, 255, 255, 0.65)",
                "--media-range-bar-color": "white",
                "--media-pip-button-display": "none",
              } as React.CSSProperties
            }
          >
            <video
              ref={videoRef}
              slot="media"
              src={src}
              poster={lightThumbnail}
              playsInline
              crossOrigin="anonymous"
              title={description || "Video"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </MediaThemeSutro>
        </div>

        {(description || src) && (
          <div
            className="
            px-4 py-2.5 
            flex items-center gap-2.5 
            border-t border-white/10 
            bg-linear-to-b from-black/40 to-black/50
            backdrop-blur-sm
          "
          >
            <div
              className="
              p-1.5 
              rounded-md 
              bg-white/5 
              border border-white/10
              transition-colors duration-200
              group-hover:bg-white/8
              group-hover:border-white/15
            "
            >
              <Film
                size={12}
                className="text-white/60 group-hover:text-white/75 transition-colors duration-200"
              />
            </div>
            <span
              className="
              text-[11px] 
              text-white/70 
              truncate 
              font-medium 
              tracking-wide
              group-hover:text-white/85
              transition-colors duration-200
            "
            >
              {description || src}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
