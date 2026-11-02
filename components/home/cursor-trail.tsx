"use client";

import { useEffect } from "react";

const TILE = 14;
const LIFE = 260;
const POOL = 48;

export function CursorTrail() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const layer = document.createElement("div");
    layer.className = "cursor-trail";
    layer.setAttribute("aria-hidden", "true");
    const cells = Array.from({ length: POOL }, () => {
      const el = document.createElement("i");
      layer.appendChild(el);
      return { el, key: "", until: 0 };
    });
    document.body.appendChild(layer);

    let cursor = 0;
    let lastX = -1;
    let lastY = -1;
    let frame = 0;

    const overHero = (x: number, y: number) => {
      const hero = document.getElementById("section-hero");
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
    };

    const stamp = (col: number, row: number, now: number) => {
      const key = `${col},${row}`;
      const live = cells.find((cell) => cell.key === key && cell.until > now);
      if (live) {
        live.until = now + LIFE;
        return;
      }
      const cell = cells[cursor];
      cursor = (cursor + 1) % POOL;
      cell.key = key;
      cell.until = now + LIFE * (0.6 + Math.random() * 0.8);
      cell.el.style.transform = `translate(${col * TILE}px, ${row * TILE}px)`;
      cell.el.classList.add("is-on");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const x = event.clientX;
      const y = event.clientY;
      const now = performance.now();
      const from = lastX < 0 ? { x, y } : { x: lastX, y: lastY };
      const distance = Math.hypot(x - from.x, y - from.y);
      const steps = Math.max(1, Math.ceil(distance / TILE));
      if (lastX >= 0) {
        const count = Math.min(steps, 12);
        for (let step = 1; step <= count; step += 1) {
          const t = step / steps;
          const px = from.x + (x - from.x) * t;
          const py = from.y + (y - from.y) * t;
          if (!overHero(px, py)) stamp(Math.floor(px / TILE), Math.floor(py / TILE), now);
        }
      }
      lastX = x;
      lastY = y;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now();
      for (const cell of cells) {
        if (cell.key && cell.until <= now) {
          cell.key = "";
          cell.el.classList.remove("is-on");
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      layer.remove();
    };
  }, []);

  return null;
}
