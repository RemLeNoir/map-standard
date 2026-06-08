import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRetriever } from "../src/core/retrievers/memory";
import { localEmbedder } from "../src/core/embeddings/local";
import type { Chunk } from "../src/core/retriever";

const corpus: Chunk[] = [
  { id: "1", namespace: "docs", text: "plazo de presentación de la solicitud veinte días" },
  { id: "2", namespace: "docs", text: "garantía provisional dos por ciento del presupuesto" },
  { id: "3", namespace: "docs", text: "criterio de adjudicación precio y calidad" },
  { id: "4", namespace: "billing", text: "factura importe vencimiento treinta días" },
];

async function seeded(): Promise<MemoryRetriever> {
  const r = new MemoryRetriever(localEmbedder);
  await r.add(corpus);
  return r;
}

test("rankea por similitud: el chunk relevante sale primero", async () => {
  const r = await seeded();
  const res = await r.search("qué plazo tiene la solicitud", {
    include: ["docs"],
    exclude: [],
    limit: 3,
  });
  assert.equal(res[0].id, "1");
});

test("el scope excluye namespaces fuera de include", async () => {
  const r = await seeded();
  const res = await r.search("factura vencimiento", { include: ["docs"], exclude: [], limit: 10 });
  assert.ok(res.every((c) => c.namespace === "docs"));
  assert.ok(!res.some((c) => c.id === "4"));
});

test("respeta el límite de chunks", async () => {
  const r = await seeded();
  const res = await r.search("presupuesto", { include: ["docs"], exclude: [], limit: 1 });
  assert.equal(res.length, 1);
});
