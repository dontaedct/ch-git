const fs = require("node:fs");
const path = require("node:path");

function ensureRoutesManifest() {
  const p = path.join(process.cwd(), ".next", "routes-manifest.json");
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); } catch {}
  if (!fs.existsSync(p)) {
    const minimal = {
      version: 5,
      pages404: true,
      basePath: "",
      redirects: [],
      rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
    };
    fs.writeFileSync(p, JSON.stringify(minimal, null, 2), "utf8");
  }
}
if (process.env.NODE_ENV !== "production") ensureRoutesManifest();

module.exports = { ensureRoutesManifest };
