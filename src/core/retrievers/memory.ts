import type { Chunk, Retriever, ScopeFilter } from "../retriever";
import { getEmbedder, cosine, type Embedder } from "../embeddings";

/**
 * Almacén vectorial en memoria. Real: rankea por similitud coseno sobre el
 * embedder activo. Apto para corpus pequeños, tests y arranque rápido.
 * Para volumen, usa PrismaRetriever (pgvector).
 */
export class MemoryRetriever implements Retriever {
  private chunks: Chunk[] = [];
  private vectors = new Map<string, number[]>();
  private embedder: Embedder;

  constructor(embedder: Embedder = getEmbedder()) {
    this.embedder = embedder;
  }

  async add(chunks: Chunk[]): Promise<void> {
    const vecs = await this.embedder.embed(chunks.map((c) => c.text));
    chunks.forEach((c, i) => {
      this.chunks.push(c);
      this.vectors.set(c.id, vecs[i]);
    });
  }

  async search(query: string, filter: ScopeFilter): Promise<Chunk[]> {
    const [qv] = await this.embedder.embed([query]);
    return this.chunks
      .filter((c) => filter.include.includes(c.namespace) && !filter.exclude.includes(c.namespace))
      .map((c) => ({ c, score: cosine(qv, this.vectors.get(c.id) ?? []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, filter.limit)
      .map((x) => x.c);
  }
}
