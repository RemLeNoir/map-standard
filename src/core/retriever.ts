export interface Chunk {
  id: string;
  namespace: string;
  text: string;
}

export interface ScopeFilter {
  include: string[];
  exclude: string[];
  limit: number;
}

export interface Retriever {
  /**
   * Devuelve como mucho `limit` chunks cuyo namespace esté en `include`
   * y no en `exclude`. El filtro NO es una sugerencia: lo que queda fuera
   * de scope no se devuelve, así que nunca llega al modelo.
   */
  search(query: string, filter: ScopeFilter): Promise<Chunk[]>;
}
