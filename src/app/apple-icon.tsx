import { ImageResponse } from "next/og";
import { SLASH_MARK_RATIO, SlashMark } from "@/components/brand/SlashMark";
import { palette } from "@/lib/og/palette";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_HEIGHT = 84;

/** The // mark in paper on an ink tile, as in icon.svg. iOS rounds the corners itself. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.ink,
          color: palette.paper,
        }}
      >
        <SlashMark width={MARK_HEIGHT * SLASH_MARK_RATIO} height={MARK_HEIGHT} />
      </div>
    ),
    size,
  );
}
