import { registry } from "./maps";
import type { Map } from "./schema";

/** Resuelve el map activo por id. Revienta si no existe (no hay defaults silenciosos). */
export function resolveMap(id: string): Map {
  const map = registry[id];
  if (!map) {
    throw new Error(
      `MAP no encontrado: "${id}". Definidos: ${Object.keys(registry).join(", ")}`,
    );
  }
  return map;
}
