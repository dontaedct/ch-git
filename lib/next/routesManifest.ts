import fs from "node:fs";
import path from "node:path";

export type RoutesManifest = Record<string, unknown> | null;

/** Return parsed .next/routes-manifest.json, or null in dev/missing. */
export function getRoutesManifest(): RoutesManifest {
  try {
    const p = path.join(process.cwd(), ".next", "routes-manifest.json");
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    const manifest = JSON.parse(raw) as RoutesManifest;
    
    if (!manifest) {
      // dev: manifest not available; skip manifest-dependent logic
      // keep behavior a no-op in dev so pages won't crash
      return null;
    }
    
    return manifest;
  } catch {
    return null;
  }
}
