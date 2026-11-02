import { readFileSync } from "node:fs";

const text = readFileSync("C:/Users/STRIKT/Desktop/Website/ponpon/public/_nuxt/CfE0pqJa.js", "utf8");
const at = text.indexOf("onEnter(t=0){this.clearTweens(),this.circle.program.uniforms.uClock");
console.log(text.slice(at, at + 1600));
