import fs from "fs";
import { parse } from "node-html-parser";

const html = JSON.parse(
  fs.readFileSync("c:/Users/STRIKT/Desktop/Tester/neoconda-web/content/home.json", "utf8"),
).body;
const root = parse(`<div id="root">${html}</div>`, { comment: false });
const top = root.querySelector("#root");

function brief(el, depth) {
  if (!el.tagName) return;
  const id = el.id ? `#${el.id}` : "";
  const cls = (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join(".");
  const label = `${"  ".repeat(depth)}<${el.tagName.toLowerCase()}${id}${cls ? "." + cls : ""}>`;
  if (depth <= 3) console.log(label);
  if (depth < 3) {
    for (const child of el.childNodes) {
      if (child.tagName) brief(child, depth + 1);
    }
  }
}
brief(top, 0);
