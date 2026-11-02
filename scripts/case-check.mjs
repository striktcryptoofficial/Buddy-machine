import fs from "fs";
import { parse } from "node-html-parser";

const html = JSON.parse(
  fs.readFileSync("c:/Users/STRIKT/Desktop/Tester/neoconda-web/content/home.json", "utf8"),
).body;
const root = parse(html);
const svg = root.querySelector("svg");
console.log("tag", svg.tagName);
console.log("attrs", svg.rawAttrs.slice(0, 300));
const grad = root.querySelector("linearGradient, lineargradient");
console.log("grad", grad && grad.tagName, grad && grad.rawAttrs.slice(0, 200));
