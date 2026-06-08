export interface MapRuntimeLog {
  ts: number;
  mapId: string;
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  chunksUsed: number;
}

/**
 * Log en memoria para la demo. En el template real esto escribe en
 * Postgres vía Prisma (modelo MapRuntimeLog en prisma/schema.prisma).
 */
const entries: MapRuntimeLog[] = [];

export function log(entry: MapRuntimeLog): void {
  entries.push(entry);
}

export function getLogs(): readonly MapRuntimeLog[] {
  return entries;
}
