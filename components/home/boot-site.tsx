"use client";

import { useEffect } from "react";
import type { PageScript } from "@/lib/page-content";

const booted = new Set<string>();

function landingScriptCode(script: PageScript) {
  const code = script.code || "";
  if (!code.includes("const lenis = new Lenis")) return code;
  return code
    .replace("const lenis = new Lenis", "const lenis = window.__landingLenis = new Lenis")
    .replace("    requestAnimationFrame(raf);\n  }", "    lenis.stop();\n    requestAnimationFrame(raf);\n  }");
}

function skipLandingScript(script: PageScript) {
  const src = script.src || "";
  const code = script.code || "";
  if (src.includes("jquery-3.5.1")) return true;
  if (src.includes("/js/webflow.")) return true;
  if (src.includes("Flip.min.js")) return true;
  if (src.includes("meshopt_decoder.js")) return true;
  if (src.includes("lottie-player.js")) return true;
  if (src.includes("/split-type")) return true;
  if (src.includes("google") || src.includes("gtag") || src.includes("googletagmanager")) return true;
  if (code.includes("google_tags_first_party")) return true;
  if (code.includes("intellimize_data_tracking_type")) return true;
  if (code.includes("anti-flicker")) return true;
  if (code.includes("wfClientScript")) return true;
  if (code.includes("function gtag")) return true;
  if (code.includes("optimizeId")) return true;
  if (code.includes("wf-globe")) return true;
  if (code.includes("w-nav-button")) return true;
  if (code.includes('typeof SplitText === "undefined"')) return true;
  return false;
}

function loadScript(script: PageScript) {
  const element = document.createElement("script");
  if (script.type) element.type = script.type;
  if (script.src) {
    element.src = script.src;
    element.async = false;
    return new Promise<void>((resolve) => {
      element.onload = () => resolve();
      element.onerror = () => resolve();
      document.body.appendChild(element);
    });
  }

  element.text = landingScriptCode(script);
  document.body.appendChild(element);
  return Promise.resolve();
}

export function BootSite({ pageId, scripts }: { pageId: string; scripts: PageScript[] }) {
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      await Promise.resolve();
      if (cancelled || booted.has(pageId)) return;
      booted.add(pageId);

      const home = pageId === "home";
      const kept = scripts.filter((script) => {
        if (script.type === "application/ld+json") return false;
        if (home && skipLandingScript(script)) return false;
        return true;
      });
      const seen = new Set<string>();
      const unique = kept.filter((script) => {
        if (!home || !script.src) return true;
        if (seen.has(script.src)) return false;
        seen.add(script.src);
        return true;
      });
      const maps = home ? unique.filter((script) => script.type === "importmap") : [];
      const hero = home ? unique.filter((script) => (script.src || "").includes("heroScript.js")) : [];
      const explode = home ? unique.filter((script) => (script.src || "").includes("explodeModel.js")) : [];
      const rest = unique.filter((script) => !maps.includes(script) && !hero.includes(script) && !explode.includes(script));

      for (const script of [...maps, ...hero, ...explode, ...rest]) {
        if (cancelled) return;
        await loadScript(script);
      }
    };

    void start();
    return () => {
      cancelled = true;
    };
  }, [pageId, scripts]);

  return null;
}
