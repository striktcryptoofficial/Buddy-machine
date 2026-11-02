import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";

const contentDir = "c:/Users/STRIKT/Desktop/Tester/neoconda-web/content";
const outRoot = "c:/Users/STRIKT/Desktop/Tester/neoconda-web/components";

const SVG_TAGS = {
  SVG: "svg",
  PATH: "path",
  G: "g",
  DEFS: "defs",
  LINEARGRADIENT: "linearGradient",
  RADIALGRADIENT: "radialGradient",
  STOP: "stop",
  CLIPPATH: "clipPath",
  RECT: "rect",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  MASK: "mask",
  FILTER: "filter",
  FEGAUSSIANBLUR: "feGaussianBlur",
  FECOLORMATRIX: "feColorMatrix",
  FEBLEND: "feBlend",
  FEOFFSET: "feOffset",
  FEMERGE: "feMerge",
  FEMERGENODE: "feMergeNode",
  FEFLOOD: "feFlood",
  FECOMPOSITE: "feComposite",
  FESPECULARLIGHTING: "feSpecularLighting",
  FEDISTANTLIGHT: "feDistantLight",
  FEDIFFUSELIGHTING: "feDiffuseLighting",
  FEPOINTLIGHT: "fePointLight",
  FETURBULENCE: "feTurbulence",
  FEDISPLACEMENTMAP: "feDisplacementMap",
  FEIMAGE: "feImage",
  FETILE: "feTile",
  FEFUNCA: "feFuncA",
  FEFUNCR: "feFuncR",
  FEFUNCG: "feFuncG",
  FEFUNCB: "feFuncB",
  FECOMPONENTTRANSFER: "feComponentTransfer",
  FEMORPHOLOGY: "feMorphology",
  POLYGON: "polygon",
  POLYLINE: "polyline",
  LINE: "line",
  USE: "use",
  IMAGE: "image",
  TEXT: "text",
  TSPAN: "tspan",
  PATTERN: "pattern",
  SYMBOL: "symbol",
  ANIMATE: "animate",
  ANIMATETRANSFORM: "animateTransform",
  ANIMATEMOTION: "animateMotion",
  FOREIGNOBJECT: "foreignObject",
  SWITCH: "switch",
  DESC: "desc",
  TITLE: "title",
  MARKER: "marker",
  VIEW: "view",
  MPATHE: "mpath",
  MPATH: "mpath",
};

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "source", "track", "wbr", "path", "circle", "rect", "line", "polyline",
  "polygon", "use", "stop", "image", "feBlend", "feColorMatrix", "feFlood",
  "feOffset", "feGaussianBlur", "feMergeNode", "feComposite", "feFuncA",
  "feFuncR", "feFuncG", "feFuncB", "animate", "animateTransform",
]);

const BOOL = new Set([
  "allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls",
  "default", "defer", "disabled", "hidden", "loop", "multiple", "muted",
  "nomodule", "novalidate", "open", "playsinline", "readonly", "required",
  "reversed", "selected", "itemscope",
]);

const ATTR = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  srcset: "srcSet",
  colspan: "colSpan",
  rowspan: "rowSpan",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  playsinline: "playsInline",
  autoplay: "autoPlay",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  formenctype: "formEncType",
  formnovalidate: "formNoValidate",
  novalidate: "noValidate",
  "xmlns:xlink": "xmlnsXlink",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "fill-rule": "fillRule",
  "fill-opacity": "fillOpacity",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "text-anchor": "textAnchor",
  "color-interpolation-filters": "colorInterpolationFilters",
  "flood-opacity": "floodOpacity",
  "flood-color": "floodColor",
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform",
  patternunits: "patternUnits",
  patterntransform: "patternTransform",
  stddeviation: "stdDeviation",
  attributename: "attributeName",
  repeatcount: "repeatCount",
  basefrequency: "baseFrequency",
  numoctaves: "numOctaves",
  stitchtiles: "stitchTiles",
  maskunits: "maskUnits",
  maskcontentunits: "maskContentUnits",
  filterunits: "filterUnits",
  primitiveunits: "primitiveUnits",
  keytimes: "keyTimes",
  keysplines: "keySplines",
  calcmode: "calcMode",
  markerstart: "markerStart",
  markerend: "markerEnd",
  markermid: "markerMid",
  refx: "refX",
  refy: "refY",
  textlength: "textLength",
  lengthadjust: "lengthAdjust",
};

function decode(text) {
  return text
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function attrName(name) {
  const lower = name.toLowerCase();
  if (ATTR[lower]) return ATTR[lower];
  if (ATTR[name]) return ATTR[name];
  if (name.startsWith("data-") || name.startsWith("aria-")) return name;
  if (name.includes("-")) {
    return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  return name;
}

function parseAttrs(raw) {
  const attrs = [];
  const re = /([^\s"'=<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
  let m;
  while ((m = re.exec(raw || ""))) {
    const name = m[1];
    if (name.startsWith("/")) continue;
    const hasValue = m[2] !== undefined || m[3] !== undefined || m[4] !== undefined;
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    attrs.push([name, hasValue, decode(value)]);
  }
  return attrs;
}

function styleObject(value) {
  const obj = {};
  for (const part of value.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const keyRaw = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (!keyRaw) continue;
    const key = keyRaw.startsWith("--")
      ? keyRaw
      : keyRaw.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[key] = val;
  }
  return obj;
}

function emitAttrs(raw) {
  const parts = [];
  for (const [name, hasValue, value] of parseAttrs(raw)) {
    const js = attrName(name);
    const lower = name.toLowerCase();
    if (BOOL.has(lower) && (!hasValue || value === "" || value === lower || value === "true")) {
      parts.push(js);
      continue;
    }
    if (lower === "style") {
      parts.push(`style={${JSON.stringify(styleObject(value))}}`);
      continue;
    }
    parts.push(`${js}=${JSON.stringify(value)}`);
  }
  return parts.length ? " " + parts.join(" ") : "";
}

function tagName(node, svg) {
  const raw = node.tagName;
  if (svg || raw === "SVG") return SVG_TAGS[raw] || raw.toLowerCase();
  return raw.toLowerCase();
}

function emit(node, indent, svg) {
  if (!node) return "";
  if (node.nodeType === 3) {
    const text = decode(node.rawText || "");
    if (!text.trim()) return "";
    return `${indent}{${JSON.stringify(text)}}\n`;
  }
  if (!node.tagName) return "";
  const name = tagName(node, svg);
  const nextSvg = svg || name === "svg";
  const attrs = emitAttrs(node.rawAttrs);
  if (name === "style") {
    return `${indent}<style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(node.innerHTML)} }} />\n`;
  }
  const childNodes = node.childNodes || [];
  const children = childNodes.map((child) => emit(child, indent + "  ", nextSvg)).join("");
  const empty = !children.trim();
  if (empty || VOID.has(name)) {
    return `${indent}<${name}${attrs} />\n`;
  }
  return `${indent}<${name}${attrs}>\n${children}${indent}</${name}>\n`;
}

function component(exportName, nodes) {
  const body = nodes.map((node) => emit(node, "    ", false)).join("\n");
  const returned = nodes.length === 1 ? body : `    <>\n${body}    </>\n`;
  return `export function ${exportName}() {\n  return (\n${returned}  );\n}\n`;
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source);
  console.log(file, source.length);
}

function pageRoot(name) {
  const html = JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")).body;
  return parse(`<div id="__root">${html}</div>`).querySelector("#__root");
}

const home = pageRoot("home.json");
const page = home.querySelector(".page-wrapper");
const main = page.querySelector("main");

const files = [
  ["components/home/preloader.tsx", "Preloader", [home.querySelector("#preloader")]],
  ["components/home/site-canvas.tsx", "SiteCanvas", [page.querySelector(".canvas-wrap")]],
  ["components/home/global-styles.tsx", "GlobalStyles", [page.querySelector(".global-styles")]],
  ["components/home/site-nav.tsx", "SiteNav", [main.querySelector(".nav_fixed")]],
  ["components/home/hero-section.tsx", "HeroSection", [main.querySelector("#hero")]],
  ["components/home/about-section.tsx", "AboutSection", [main.querySelector("#about")]],
  ["components/home/features-section.tsx", "FeaturesSection", [main.querySelector("#features-padding"), main.querySelector("#section1")]],
  ["components/home/specs-section.tsx", "SpecsSection", [main.querySelector("#specs")]],
  ["components/home/cta-section.tsx", "CtaSection", [main.querySelector("#CTA")]],
  ["components/home/site-footer.tsx", "SiteFooter", [main.querySelector("#launching")]],
  ["components/home/page-embed.tsx", "PageEmbed", [main.querySelector(".code-embed")]],
];

for (const [file, name, nodes] of files) {
  if (nodes.some((node) => !node)) throw new Error(`Missing node for ${name}`);
  write(path.join("c:/Users/STRIKT/Desktop/Tester/neoconda-web", file), component(name, nodes));
}

function legal(jsonName, file, exportName) {
  const root = pageRoot(jsonName);
  const nodes = root.childNodes.filter((node) => node.tagName);
  write(path.join("c:/Users/STRIKT/Desktop/Tester/neoconda-web", file), component(exportName, nodes));
}

legal("privacy.json", "components/legal/privacy-view.tsx", "PrivacyView");
legal("terms.json", "components/legal/terms-view.tsx", "TermsView");
legal("not-found.json", "components/legal/not-found-view.tsx", "NotFoundView");

const headStyles = home.childNodes.filter((node) => node.tagName === "STYLE");
write(
  path.join("c:/Users/STRIKT/Desktop/Tester/neoconda-web/components/home/head-styles.tsx"),
  component("HeadStyles", headStyles),
);
