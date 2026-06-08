import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMap } from "../src/core/resolver";

test("resolveMap devuelve un map conocido", () => {
  const m = resolveMap("qa_documental");
  assert.equal(m.id, "qa_documental");
});

test("resolveMap lanza con un id desconocido", () => {
  assert.throws(() => resolveMap("no_existe"), /no encontrado/);
});
