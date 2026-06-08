import { test } from "node:test";
import assert from "node:assert/strict";
import { defineMap } from "../src/core/schema";
import { gateTool, isToolAllowed, ToolBlockedError } from "../src/core/gates/tools";
import { applyScope } from "../src/core/gates/scope";
import { capContext, assertLoopAllowed, AgenticLoopBlockedError } from "../src/core/gates/budget";
import type { Chunk } from "../src/core/retriever";

const map = defineMap({
  id: "t",
  task: "test",
  ragScope: { include: ["docs"], exclude: ["billing"] },
  output: { format: "x" },
  tools: { allow: ["scoped_search"], block: ["send_email"] },
  budget: { maxInputTokens: 200, maxOutputTokens: 100, maxRetrievalChunks: 4, modelTier: "cheap" },
});

test("tool permitida pasa, bloqueada lanza", () => {
  assert.equal(isToolAllowed(map, "scoped_search"), true);
  assert.equal(isToolAllowed(map, "send_email"), false);
  assert.doesNotThrow(() => gateTool(map, "scoped_search"));
  assert.throws(() => gateTool(map, "send_email"), ToolBlockedError);
});

test("tool no declarada no se permite por defecto", () => {
  assert.equal(isToolAllowed(map, "write_file"), false);
});

test("applyScope deriva el filtro del map", () => {
  const f = applyScope(map);
  assert.deepEqual(f.include, ["docs"]);
  assert.deepEqual(f.exclude, ["billing"]);
  assert.equal(f.limit, 4);
});

test("capContext respeta maxInputTokens", () => {
  const big = "palabra ".repeat(60); // ~ muchos tokens
  const chunks: Chunk[] = Array.from({ length: 10 }, (_, i) => ({
    id: `c${i}`,
    namespace: "docs",
    text: big,
  }));
  const fitted = capContext(chunks, "pregunta", map);
  assert.ok(fitted.length < chunks.length, "debe recortar");
});

test("assertLoopAllowed lanza si agenticLoop=false", () => {
  assert.throws(() => assertLoopAllowed(map), AgenticLoopBlockedError);
  const loopMap = defineMap({ ...map, reasoning: { agenticLoop: true } });
  assert.doesNotThrow(() => assertLoopAllowed(loopMap));
});
