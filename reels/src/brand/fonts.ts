import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// OFL-licensed Noto fonts bundled in public/fonts (licences alongside).
// loadFont() holds the render (delayRender) until each file is ready, so no
// frame is captured with a fallback font or unshaped Arabic.
const faces: Array<[family: string, file: string, weight: string]> = [
  ["Noto Sans Arabic", "NotoSansArabic-400.woff2", "400"],
  ["Noto Sans Arabic", "NotoSansArabic-500.woff2", "500"],
  ["Noto Sans Arabic", "NotoSansArabic-600.woff2", "600"],
  ["Noto Sans Arabic", "NotoSansArabic-700.woff2", "700"],
  ["Noto Sans Arabic", "NotoSansArabic-800.woff2", "800"],
  ["Noto Sans", "NotoSans-400.woff2", "400"],
  ["Noto Sans", "NotoSans-600.woff2", "600"],
  ["Noto Sans", "NotoSans-700.woff2", "700"],
  ["Noto Sans", "NotoSans-800.woff2", "800"],
  ["Noto Sans Mono", "NotoSansMono-500.woff2", "500"],
  ["Noto Sans Mono", "NotoSansMono-600.woff2", "600"],
  ["Noto Sans Mono", "NotoSansMono-700.woff2", "700"],
];

let loaded: Promise<unknown> | null = null;

export const loadBrandFonts = () => {
  if (!loaded) {
    loaded = Promise.all(
      faces.map(([family, file, weight]) =>
        loadFont({ family, url: staticFile(`fonts/${file}`), weight, display: "block" }),
      ),
    );
  }
  return loaded;
};
