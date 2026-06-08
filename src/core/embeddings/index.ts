import type { Embedder } from "./types";
import { localEmbedder } from "./local";
import { openaiEmbedder } from "./openai";

const EMBEDDERS: Record<string, Embedder> = {
  local: localEmbedder,
  openai: openaiEmbedder,
};

/** Embedder activo. MAP_EMBEDDER=local|openai (default: local). */
export function getEmbedder(): Embedder {
  const name = process.env.MAP_EMBEDDER ?? "local";
  const e = EMBEDDERS[name];
  if (!e) throw new Error(`Embedder desconocido: "${name}". Disponibles: ${Object.keys(EMBEDDERS).join(", ")}`);
  return e;
}

export type { Embedder } from "./types";
export { cosine } from "./types";
