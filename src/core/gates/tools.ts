import type { Map } from "../schema";

export class ToolBlockedError extends Error {
  constructor(tool: string, mapId: string) {
    super(`Herramienta "${tool}" bloqueada por el map "${mapId}".`);
    this.name = "ToolBlockedError";
  }
}

/** ¿Permite el map usar esta herramienta? */
export function isToolAllowed(map: Map, tool: string): boolean {
  if (map.tools.block.includes(tool)) return false;
  // allow vacío = no se permite ninguna herramienta explícitamente.
  return map.tools.allow.includes(tool);
}

/**
 * Puerta dura: comprueba antes de ejecutar. Si el map no la permite, revienta
 * y la herramienta NO se ejecuta. El modelo puede quererla; la puerta dice no.
 */
export function gateTool(map: Map, tool: string): void {
  if (!isToolAllowed(map, tool)) throw new ToolBlockedError(tool, map.id);
}
