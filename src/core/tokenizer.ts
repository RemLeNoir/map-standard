/**
 * Estimación barata y sin dependencias (~4 caracteres por token).
 * Suficiente para presupuestar y para el benchmark. En producción puedes
 * sustituirlo por el tokenizador real de tu proveedor.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
