import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Express, Router } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); //becomes absolute path of routes/

//grab every file below routes/
function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullpath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(fullpath));
    } else if (entry.name !== "loader.ts" && entry.name !== "loader.js" && /\.(ts|js)$/.test(entry.name)) {
      files.push(fullpath);
    }
  }
  return files;
}

export async function loadRoutes(app: Express) {
  const files = walk(__dirname);

  for (const file of files) {
    const mod = await import(file);
    const router = mod.default as Router | undefined;
    if (!router) continue;

    const prefix = "/" + path.relative(__dirname, file)
      .replace(/\.(ts|js)$/, "")
      .split(path.sep)
      .join("/");

    app.use(prefix, router);
    console.log(`    Mounted ${path.relative(__dirname, file)} at ${prefix}`);
  }
}

