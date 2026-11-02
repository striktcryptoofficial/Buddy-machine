"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EASE = "cubic-bezier(0.45, 0, 0.55, 1)";
const SLIDE_MS = 800;
const STAGGER_MS = 150;

const OFF_BOTTOM = "translate3d(0,100%,0)";
const CENTER = "translate3d(0,0,0)";
const OFF_TOP = "translate3d(0,-100%,0)";

function frame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function slide(el: HTMLElement, from: string, to: string, delay: number) {
  return el.animate([{ transform: from }, { transform: to }], {
    duration: SLIDE_MS,
    delay,
    easing: EASE,
    fill: "forwards",
  }).finished;
}

export function HatchWipe() {
  const router = useRouter();
  const routerRef = useRef(router);
  const greenRef = useRef<HTMLDivElement>(null);
  const charcoalRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const runId = useRef(0);
  const [live, setLive] = useState(false);
  routerRef.current = router;

  useEffect(() => {
    router.prefetch("/explore");
  }, [router]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (href !== "/explore" && href !== "/explore/") return;
      event.preventDefault();
      event.stopPropagation();
      if (started.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        routerRef.current.push("/explore");
        return;
      }
      started.current = true;
      setLive(true);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!live) return;
    const green = greenRef.current;
    const charcoal = charcoalRef.current;
    const black = blackRef.current;
    if (!green || !charcoal || !black) return;
    const id = ++runId.current;

    const run = async () => {
      await frame();
      if (id !== runId.current) return;

      await Promise.all([
        slide(green, OFF_BOTTOM, CENTER, 0),
        slide(charcoal, OFF_BOTTOM, CENTER, STAGGER_MS),
        slide(black, OFF_BOTTOM, CENTER, STAGGER_MS * 2),
      ]);
      if (id !== runId.current) return;

      routerRef.current.push("/explore");

      const deadline = performance.now() + 4000;
      while (performance.now() < deadline && !document.querySelector("#root canvas")) {
        await frame();
        if (id !== runId.current) return;
      }
      await frame();
      if (id !== runId.current) return;

      await Promise.all([
        slide(black, CENTER, OFF_TOP, 0),
        slide(charcoal, CENTER, OFF_TOP, STAGGER_MS),
        slide(green, CENTER, OFF_TOP, STAGGER_MS * 2),
      ]);
      if (id !== runId.current) return;

      started.current = false;
      setLive(false);
    };

    void run();
  }, [live]);

  if (!live) return null;

  return (
    <div className="hatch-wipe" aria-hidden="true">
      <style>{`
        .hatch-wipe {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          overflow: hidden;
          pointer-events: auto;
        }
        .hatch-wipe__layer {
          position: absolute;
          inset: 0;
          transform: translate3d(0, 100%, 0);
          will-change: transform;
          backface-visibility: hidden;
        }
        .hatch-wipe__green { z-index: 1; background: #56ff8e; }
        .hatch-wipe__charcoal { z-index: 2; background: #141414; }
        .hatch-wipe__black { z-index: 3; background: #000; }
      `}</style>
      <div ref={greenRef} className="hatch-wipe__layer hatch-wipe__green" />
      <div ref={charcoalRef} className="hatch-wipe__layer hatch-wipe__charcoal" />
      <div ref={blackRef} className="hatch-wipe__layer hatch-wipe__black" />
    </div>
  );
}
