import type { Map } from "../schema";
import type { Chunk } from "../retriever";
import { estimateTokens } from "../tokenizer";

export class AgenticLoopBlockedError extends Error {
  constructor(mapId: string) {
    super(`El map "${mapId}" no permite bucle agentic (agenticLoop: false).`);
    this.name = "AgenticLoopBlockedError";
  }
}

/** Si el map prohíbe el bucle, esta función revienta. Quien quiera iterar, pasa por aquí. */
export function assertLoopAllowed(map: Map): void {
  if (!map.reasoning.agenticLoop) throw new AgenticLoopBlockedError(map.id);
}

/**
 * Recorta los chunks para que entrada (input + chunks) no supere maxInputTokens.
 * Reserva un margen para el system y el formato. Devuelve los chunks que caben.
 */
export function capContext(chunks: Chunk[], input: string, map: Map): Chunk[] {
  const reserve = 400; // margen para instrucciones de formato/sistema
  let budget = map.budget.maxInputTokens - estimateTokens(input) - reserve;
  const fitted: Chunk[] = [];
  for (const c of chunks) {
    const cost = estimateTokens(c.text);
    if (budget - cost < 0) break;
    budget -= cost;
    fitted.push(c);
  }
  return fitted;
}
