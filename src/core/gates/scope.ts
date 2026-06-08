import type { Map } from "../schema";
import type { ScopeFilter } from "../retriever";

/**
 * Construye el filtro de retrieval a partir del map. El cap de chunks
 * sale del presupuesto, no de la query del usuario.
 */
export function applyScope(map: Map): ScopeFilter {
  return {
    include: map.ragScope.include,
    exclude: map.ragScope.exclude,
    limit: map.budget.maxRetrievalChunks,
  };
}
