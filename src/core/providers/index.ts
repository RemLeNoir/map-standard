import type { ModelProvider } from "./types";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";

const PROVIDERS: Record<string, ModelProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
};

let override: ModelProvider | null = null;

/** Inyecta un proveedor (p. ej. en tests o un adapter propio). */
export function setProvider(p: ModelProvider | null): void {
  override = p;
}

/**
 * Proveedor activo. Sin demos: o defines MAP_PROVIDER (anthropic|openai) con su
 * API key, o inyectas uno con setProvider(). Si no, revienta.
 */
export function getProvider(): ModelProvider {
  if (override) return override;
  const name = process.env.MAP_PROVIDER;
  if (!name) {
    throw new Error("Define MAP_PROVIDER (anthropic|openai) o inyecta uno con setProvider().");
  }
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`Proveedor desconocido: "${name}". Disponibles: ${Object.keys(PROVIDERS).join(", ")}`);
  }
  return provider;
}

export type { ModelProvider, CompleteArgs, CompleteResult } from "./types";
