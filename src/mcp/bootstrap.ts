import { readFileSync } from "node:fs";
import { MemoryRetriever, setRetriever } from "../core/retrievers";
import type { Chunk } from "../core/retriever";

/**
 * Prepara el retriever que servirá el MCP.
 * - Si MAP_CORPUS apunta a un JSON de chunks [{id,namespace,text}], lo carga
 *   en un MemoryRetriever (sin DB).
 * - Para producción con volumen, sustituye por:
 *     import { PrismaClient } from "@prisma/client";
 *     setRetriever(new PrismaRetriever(new PrismaClient()));
 */
export async function bootstrapRetriever(): Promise<void> {
  const path = process.env.MAP_CORPUS;
  if (!path) return; // retriever en memoria vacío; puéblalo a tu manera
  const chunks = JSON.parse(readFileSync(path, "utf8")) as Chunk[];
  const mem = new MemoryRetriever();
  await mem.add(chunks);
  setRetriever(mem);
}
