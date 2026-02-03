"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface MediaViewerProps {
  src: string;
  alt?: string;
}

export default function MediaViewer({ src, alt }: MediaViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Image
        src={src}
        alt={alt || ""}
        className="rounded-lg cursor-zoom-in border border-white/10 hover:border-white/30 transition my-6"
        onClick={() => setOpen(true)}
      />

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src }]}
        styles={{
          container: { backgroundColor: "rgba(0,0,0,.92)" },
        }}
      />
    </>
  );
}
