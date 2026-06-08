import { resolveMap } from "./resolver";
import { applyScope } from "./gates/scope";
import { gateTool } from "./gates/tools";
import { capContext } from "./gates/budget";
import { getRetriever } from "./retrievers";
import { getProvider } from "./providers";
import { log } from "./logger";
import type { Map } from "./schema";
import type { Chunk } from "./retriever";

export interface RunResult {
  text: string;
  mapId: string;
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  chunksUsed: number;
}

function buildSystem(map: Map, chunks: Chunk[]): string {
  const fuentes = chunks.map((c) => `[${c.id}] ${c.text}`).join("\n");
  const reglas = [
    `Tarea: ${map.task}`,
    `Formato de salida: ${map.output.format}`,
    map.output.requireSources ? "Cita la fuente de cada afirmación con su [id]." : "",
    map.reasoning.missingDataPolicy === "mark_as_missing"
      ? "Si falta un dato, márcalo como ausente. No lo inventes."
      : "",
  ].filter(Boolean);
  return `${reglas.join("\n")}\n\nFuentes:\n${fuentes}`;
}

/**
 * Única vía para alcanzar el modelo. Aplica el map por código:
 * scope de retrieval, herramientas permitidas, presupuesto. Nadie llama
 * al proveedor por fuera de aquí (lo vigila la regla de ESLint).
 */
export async function runWithMap(mapId: string, input: string): Promise<RunResult> {
  const map = resolveMap(mapId);

  // Retrieval: solo si el map permite la herramienta scoped_search.
  let chunks: Chunk[] = [];
  if (map.tools.allow.includes("scoped_search")) {
    gateTool(map, "scoped_search"); // puerta dura
    chunks = await getRetriever().search(input, applyScope(map));
  }

  // Presupuesto: recorta el contexto a lo que cabe.
  const fitted = capContext(chunks, input, map);

  const provider = getProvider();
  const system = buildSystem(map, fitted);
  const res = await provider.complete({
    tier: map.budget.modelTier,
    system,
    user: input,
    maxOutputTokens: map.budget.maxOutputTokens,
  });

  const result: RunResult = {
    text: res.text,
    mapId,
    model: res.model,
    calls: 1,
    inputTokens: res.inputTokens,
    outputTokens: res.outputTokens,
    chunksUsed: fitted.length,
  };

  log({ ts: Date.now(), ...result });
  return result;
}
