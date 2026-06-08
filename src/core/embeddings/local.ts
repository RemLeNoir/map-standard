import type { Embedder } from "./types";

const DIM = 256;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

function hash(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % DIM;
}

/**
 * Embedder léxico determinista: bag-of-words con hashing a un vector de 256d,
 * normalizado. Sin dependencias ni red. Es real (rankea por solapamiento de
 * términos), no un placeholder; para semántica de verdad usa el de OpenAI.
 */
export const localEmbedder: Embedder = {
  name: "local",
  dim: DIM,
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const v = new Array<number>(DIM).fill(0);
      for (const tok of tokenize(text)) v[hash(tok)] += 1;
      const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
      return v.map((x) => x / norm);
    });
  },
};
