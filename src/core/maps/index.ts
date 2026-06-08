import type { Map } from "../schema";
import qa_documental from "./qa_documental";
import extraccion_estructura from "./extraccion_estructura";
import clasificar from "./clasificar";
import resumir_con_fuentes from "./resumir_con_fuentes";

/**
 * Librería de maps por defecto (arquetipos de tarea, no de dominio).
 * Es lo único que es "el producto"; lo demás es el motor.
 * Para tu proyecto: edita los namespaces de `ragScope` y el `budget`.
 */
export const registry: Record<string, Map> = {
  [qa_documental.id]: qa_documental,
  [extraccion_estructura.id]: extraccion_estructura,
  [clasificar.id]: clasificar,
  [resumir_con_fuentes.id]: resumir_con_fuentes,
};
