import fs from "fs";
import path from "path";

const backup = "c:/Users/STRIKT/Desktop/Tester/neoconda-backup";
const outDir = "c:/Users/STRIKT/Desktop/Tester/neoconda-web/content";

const pages = [
  ["index.html", "home.json"],
  ["privacy-policy.html", "privacy.json"],
  ["terms-of-service.html", "terms.json"],
  ["404.html", "not-found.json"],
];

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function absolutize(value) {
  return value
    .replace(/(^|,\s*)(?!https?:|\/\/|\/|#|data:|mailto:)([^,\s]+)/g, (_, prefix, url) => {
      if (url.startsWith("index.html")) return `${prefix}/${url.slice("index.html".length)}`;
      if (url === "privacy-policy.html") return `${prefix}/privacy-policy`;
      if (url === "terms-of-service.html") return `${prefix}/terms-of-service`;
      return `${prefix}/${url}`;
    });
}

function rewriteHtml(html) {
  let next = html.replace(/\b(src|href)=("|\')([^"\']+)\2/g, (full, attr, quote, value) => {
    if (/^(https?:|\/\/|\/|#|mailto:|data:|javascript:)/.test(value)) return full;
    if (value === "index.html") return `${attr}=${quote}/${quote}`;
    if (value === "privacy-policy.html") return `${attr}=${quote}/privacy-policy${quote}`;
    if (value === "terms-of-service.html") return `${attr}=${quote}/terms-of-service${quote}`;
    return `${attr}=${quote}/${value}${quote}`;
  });
  next = next.replace(/\bsrcset=("|\')([^"\']+)\1/g, (_, quote, value) => `srcset=${quote}${absolutize(value)}${quote}`);
  next = next.replace(/url\((['"]?)(?!https?:|\/\/|\/|data:)([^)'"]+)\1\)/g, (_, quote, value) => `url(${quote}/${value}${quote})`);
  return next;
}

function extract(file) {
  const raw = fs.readFileSync(path.join(backup, file), "utf8");
  const html = stripComments(raw);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "Neoconda";
  const description = (html.match(/<meta\s+content="([^"]*)"\s+name="description"/i) || html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || "";
  const styles = [...head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map((m) => m[0]).join("");
  let body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || "";
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  body = rewriteHtml(styles + body);

  const scripts = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    const type = (attrs.match(/type="([^"]+)"/) || [])[1] || "";
    let src = (attrs.match(/src="([^"]+)"/) || [])[1] || "";
    let code = match[2];
    if (src && !/^(https?:|\/\/|\/)/.test(src)) src = `/${src}`;
    if (type === "importmap") {
      code = code.replaceAll('"./vendor/', '"/vendor/').replaceAll('"./media/', '"/media/');
    }
    if (!src && !code.trim()) continue;
    scripts.push({ type, src, code });
  }

  return { title, description, body, scripts };
}

fs.mkdirSync(outDir, { recursive: true });
for (const [src, dest] of pages) {
  const page = extract(src);
  fs.writeFileSync(path.join(outDir, dest), JSON.stringify(page));
  console.log(dest, "body", page.body.length, "scripts", page.scripts.length, "title", page.title);
}
