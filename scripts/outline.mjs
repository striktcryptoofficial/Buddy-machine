import fs from "fs";

const html = JSON.parse(
  fs.readFileSync("c:/Users/STRIKT/Desktop/Tester/neoconda-web/content/home.json", "utf8"),
).body;

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
console.log("IDS");
console.log(ids.join("\n"));

const sections = [...html.matchAll(/<section\b([^>]*)>/g)].map((m) => m[1].slice(0, 200));
console.log("\nSECTIONS", sections.length);
sections.forEach((s) => console.log(s));

const mains = [...html.matchAll(/class="([^"]*(?:section|hero|about|feature|spec|cta|footer|nav)[^"]*)"/gi)]
  .map((m) => m[1])
  .filter((v, i, a) => a.indexOf(v) === i);
console.log("\nCLASSES");
mains.slice(0, 80).forEach((c) => console.log(c));
