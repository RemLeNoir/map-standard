import type { Chunk, Retriever, ScopeFilter } from "../retriever";
import { getEmbedder, type Embedder } from "../embeddings";

/**
 * Cliente mínimo que necesita el retriever. Cualquier PrismaClient lo cumple
 * estructuralmente, así que no acoplamos a `@prisma/client`: tú inyectas el tuyo.
 */
export interface PrismaLike {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
}

interface Row {
  id: string;
  namespace: string;
  text: string;
}

/**
 * Retriever de producción sobre Postgres + pgvector.
 * El scope (namespace) va en el WHERE; el orden por distancia coseno (<=>).
 * Requiere la tabla "Chunk" y la columna embedding del prisma/schema.prisma.
 */
export class PrismaRetriever implements Retriever {
  private prisma: PrismaLike;
  private embedder: Embedder;

  constructor(prisma: PrismaLike, embedder: Embedder = getEmbedder()) {
    this.prisma = prisma;
    this.embedder = embedder;
  }

  async search(query: string, filter: ScopeFilter): Promise<Chunk[]> {
    const [qv] = await this.embedder.embed([query]);
    const vec = `[${qv.join(",")}]`;
    const rows = await this.prisma.$queryRawUnsafe<Row[]>(
      `SELECT id, namespace, text
         FROM "Chunk"
        WHERE namespace = ANY($1)
          AND NOT (namespace = ANY($2))
        ORDER BY embedding <=> $3::vector
        LIMIT $4`,
      filter.include,
      filter.exclude,
      vec,
      filter.limit,
    );
    return rows.map((r) => ({ id: r.id, namespace: r.namespace, text: r.text }));
  }
}
