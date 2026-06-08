#!/usr/bin/env node
// Cross-platform test runner: descubre tests/*.test.ts y los pasa a node --test.
// Existe porque cmd.exe no expande globs y `node --test tests/` no descubre .ts en Node 20.

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve("tests");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".test.ts"))
  .map((f) => `tests/${f}`);

if (files.length === 0) {
  console.error("No se encontraron tests en tests/*.test.ts");
  process.exit(1);
}

const res = spawnSync("node", ["--import", "tsx", "--test", ...files], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(res.status ?? 1);
