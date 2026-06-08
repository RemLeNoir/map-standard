#!/usr/bin/env node
// Aplica .github/rulesets/main.json al repo actual.
// Requiere: gh CLI autenticado con permisos de admin del repo.
//
// Uso:
//   node scripts/apply-ruleset.mjs              # detecta OWNER/REPO del remote
//   node scripts/apply-ruleset.mjs OWNER/REPO   # explícito

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const FILE = resolve(".github/rulesets/main.json");
if (!existsSync(FILE)) {
  console.error(`No existe ${FILE}`);
  process.exit(1);
}

function gh(args, { input } = {}) {
  const res = spawnSync("gh", args, {
    input,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    const stderr = (res.stderr || "").trim();
    throw new Error(`gh ${args.join(" ")} falló: ${stderr || res.error?.message}`);
  }
  return res.stdout.trim();
}

const repo = process.argv[2] || gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]);
const ruleset = JSON.parse(readFileSync(FILE, "utf8"));
const name = ruleset.name;

const existing = JSON.parse(gh(["api", `/repos/${repo}/rulesets`]));
const match = existing.find((r) => r.name === name);

const body = JSON.stringify(ruleset);

if (match) {
  console.log(`Actualizando ruleset '${name}' (id=${match.id}) en ${repo}...`);
  gh(["api", "-X", "PUT", `/repos/${repo}/rulesets/${match.id}`, "--input", "-"], { input: body });
} else {
  console.log(`Creando ruleset '${name}' en ${repo}...`);
  gh(["api", "-X", "POST", `/repos/${repo}/rulesets`, "--input", "-"], { input: body });
}

console.log("Listo.");
