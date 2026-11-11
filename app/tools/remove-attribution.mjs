import fs from "node:fs";
import path from "node:path";
const description = "3D control center for a team of AI agents";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.description = description;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
const layout = "app/layout.tsx";
if (fs.existsSync(layout)) fs.writeFileSync(layout, fs.readFileSync(layout, "utf8").replace(/description: "[^"]*"/, `description: "${description}"`));
// Neutral README: only overwrite if the current file still has old attribution.
const readmePath = fs.existsSync("../README.md") ? "../README.md" : "README.md";
const current = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
if (!current.startsWith("# Control Center")) fs.writeFileSync(readmePath, `# Control Center\n\n${description}.\n\nThis public demo uses invented names and browser-only simulated actions.\nSee LIVE_STATUS.md for the coordinator status protocol and private deployment notes.\n\nDevelopment: npm install, npm run dev, npm run build.\n`);
function scrub(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, entry.name);
    if (entry.isDirectory()) scrub(f);
    else if (/\.(md|tsx?|mjs)$/.test(f)) {
      let s = fs.readFileSync(f, "utf8");
      if (f.endsWith(".md")) s = s.replace(/^#{1,6}\s+(?:Credits|Acknowledgments|Acknowledgements)[^\n]*\n[\s\S]*?(?=^#{1,6}\s|$(?![\s\S]))/gmi, "").replace(/^.*(?:inspired by|built with|article).*$/gmi, "");
      s = s.replace(/\([^()]* style\)/g, "");
      fs.writeFileSync(f, s);
    }
  }
}
for (const dir of ["app", "components", "docs"]) scrub(dir);
console.log("Neutral descriptions and documentation applied");
