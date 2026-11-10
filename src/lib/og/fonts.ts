import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ImageResponse } from "next/og";
import { createMeasure } from "./measure";

/*
 * Static TrueType instances, because Satori cannot read WOFF2 or variable
 * fonts (the site itself loads the variable fonts through next/font).
 * Host Grotesk 1.002 comes from the upstream release zip (sha256
 * 0548596123b3b3fd2567731f0412be2cdb12e70a80caf9aa6075367a35911a62),
 * IBM Plex Mono from google/fonts at commit 01d5d9f. Both are SIL OFL 1.1;
 * the licences sit beside the files. Read once, when the module loads.
 */
const [hostMedium, hostBold, plexRegular, plexSemiBold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/host-grotesk/HostGrotesk-Medium.ttf")),
  readFile(join(process.cwd(), "assets/fonts/host-grotesk/HostGrotesk-Bold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/ibm-plex-mono/IBMPlexMono-SemiBold.ttf")),
]);

export const TEXT_FAMILY = "Host Grotesk";
export const MONO_FAMILY = "IBM Plex Mono";

type Fonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>;

export const fonts: Fonts = [
  { name: TEXT_FAMILY, data: hostMedium, weight: 500, style: "normal" },
  { name: TEXT_FAMILY, data: hostBold, weight: 700, style: "normal" },
  { name: MONO_FAMILY, data: plexRegular, weight: 400, style: "normal" },
  { name: MONO_FAMILY, data: plexSemiBold, weight: 600, style: "normal" },
];

/** Host Grotesk is uniwidth: every weight shares Bold's advance widths. */
export const measureText = createMeasure(hostBold);
