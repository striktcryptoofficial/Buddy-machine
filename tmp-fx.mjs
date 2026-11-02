import fs from "fs";
const s = fs.readFileSync("c:/Users/STRIKT/Desktop/test 3d/public/_nuxt/CfE0pqJa.js", "utf8");
const i = s.indexOf('getElementById("home-cats")');
console.log(s.slice(i - 700, i + 900));
console.log("---PRESERVE---", s.includes("preserveDrawingBuffer:!0"));
