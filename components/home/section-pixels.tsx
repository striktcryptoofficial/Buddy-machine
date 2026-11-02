"use client";

import { useEffect } from "react";

const ROWS = 4;
const SECTION_ID = "about";

function hash(n: number) {
  const t = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return t - Math.floor(t);
}

function tileSize() {
  return window.innerWidth < 700 ? 17 : 28;
}

function clamp01(n: number) {
  return n <= 0 ? 0 : n >= 1 ? 1 : n;
}

type Band = {
  host: HTMLElement;
  section: HTMLElement;
  tiles: HTMLElement[];
  thresholds: number[];
  on: boolean[];
};

function build(section: HTMLElement, hero: HTMLElement): Band {
  const host = document.createElement("div");
  host.className = "section-pxt";
  host.style.setProperty("--pxt-color", "#0e0e0e");
  const width = hero.clientWidth || window.innerWidth;
  const cols = Math.max(1, Math.round(width / tileSize()));
  host.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  host.style.gridAutoRows = `${width / cols}px`;
  const tiles: HTMLElement[] = [];
  const thresholds: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    const bias = (ROWS - 1 - row) / (ROWS - 1);
    for (let col = 0; col < cols; col++) {
      const tile = document.createElement("span");
      tile.className = "section-pxt__t";
      host.appendChild(tile);
      tiles.push(tile);
      const mixed = (bias * 0.38 + hash(row * 997 + col) * 0.72) / 1.1;
      thresholds.push(0.02 + 0.98 * mixed);
    }
  }
  hero.appendChild(host);
  return { host, section, tiles, thresholds, on: tiles.map(() => false) };
}

function paint(band: Band) {
  const rect = band.host.getBoundingClientRect();
  const view = window.innerHeight;
  const span = view - rect.height;
  const progress = clamp01(span <= 0 ? 0 : (view - rect.bottom) / span);
  for (let i = 0; i < band.tiles.length; i++) {
    const on = progress >= band.thresholds[i];
    if (on !== band.on[i]) {
      band.on[i] = on;
      band.tiles[i].classList.toggle("is-on", on);
    }
  }
}

export function SectionPixels() {
  useEffect(() => {
    const hero = document.getElementById("section-hero");
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let bands: Band[] = [];
    let width = window.innerWidth;
    let frame = 0;

    const rebuild = () => {
      bands.forEach((band) => band.host.remove());
      const section = document.getElementById(SECTION_ID);
      bands =
        section && section.getBoundingClientRect().height >= 40 ? [build(section, hero)] : [];
      bands.forEach(paint);
    };

    const tick = () => {
      frame = 0;
      bands.forEach(paint);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        rebuild();
        return;
      }
      onScroll();
    };

    rebuild();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onScroll);
    const section = document.getElementById(SECTION_ID);
    if (section) observer.observe(section);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      bands.forEach((band) => band.host.remove());
    };
  }, []);

  return null;
}
