"use client";

import { useEffect } from "react";

type LandingLenis = {
  stop?: () => void;
  start?: () => void;
  resize?: () => void;
  scrollTo?: (
    target: number | string | HTMLElement,
    options?: { immediate?: boolean; offset?: number; duration?: number },
  ) => void;
};

function landingLenis() {
  return (window as Window & { __landingLenis?: LandingLenis }).__landingLenis;
}

function scrollLandingTop() {
  window.scrollTo(0, 0);
  landingLenis()?.scrollTo?.(0, { immediate: true });
}

export function LandingPace() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    scrollLandingTop();

    const onNavClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a.nav_menu_link");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!(target instanceof HTMLElement)) return;
      event.preventDefault();
      event.stopPropagation();
      const nav = document.querySelector(".nav_fixed");
      const offset = href === "#hero" || !nav ? 0 : -nav.getBoundingClientRect().height;
      const lenis = landingLenis();
      if (lenis?.scrollTo) {
        lenis.scrollTo(target, { offset, duration: 1.25 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    };
    document.addEventListener("click", onNavClick, true);

    let released = false;
    const hold = window.setInterval(() => {
      if (!document.getElementById("preloader")) {
        window.clearInterval(hold);
        return;
      }
      landingLenis()?.stop?.();
      scrollLandingTop();
    }, 40);

    const release = () => {
      if (released || document.getElementById("preloader")) return;
      released = true;
      window.clearInterval(hold);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const lenis = landingLenis();
          lenis?.resize?.();
          lenis?.start?.();
          lenis?.scrollTo?.(0, { immediate: true });
          window.scrollTo(0, 0);
          (window as Window & { ScrollTrigger?: { refresh?: () => void } }).ScrollTrigger?.refresh?.();
        });
      });
    };

    const watch = new MutationObserver(release);
    watch.observe(document.documentElement, { childList: true, subtree: true });
    release();

    return () => {
      document.removeEventListener("click", onNavClick, true);
      window.clearInterval(hold);
      watch.disconnect();
    };
  }, []);

  return null;
}
