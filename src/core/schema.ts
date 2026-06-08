import { z } from "zod";

/** Tier de modelo. El mapeo tier -> modelo concreto vive en cada provider. */
export const ModelTier = z.enum(["cheap", "medium", "strong"]);
export type ModelTier = z.infer<typeof ModelTier>;

/**
 * Contrato de un MAP. Es la única fuente de verdad de qué puede hacer el
 * modelo en una tarea: dónde mira, qué herramientas usa y cuánto gasta.
 */
export const MapSchema = z.object({
  id: z.string(),
  domain: z.string().default("generic"),
  task: z.string(),

  ragScope: z.object({
    include: z.array(z.string()),
    exclude: z.array(z.string()).default([]),
  }),

  reasoning: z.object({
    depth: z.enum(["low", "medium", "high"]).default("medium"),
    agenticLoop: z.boolean().default(false),
    missingDataPolicy: z
      .enum(["mark_as_missing", "best_effort", "fail"])
      .default("mark_as_missing"),
  }).default({}),

  output: z.object({
    format: z.string(),
    requireSources: z.boolean().default(true),
  }),

  tools: z.object({
    allow: z.array(z.string()).default([]),
    block: z.array(z.string()).default([]),
  }).default({}),

  budget: z.object({
    maxInputTokens: z.number().int().positive(),
    maxOutputTokens: z.number().int().positive(),
    maxRetrievalChunks: z.number().int().positive(),
    modelTier: ModelTier,
  }),
});

export type Map = z.infer<typeof MapSchema>;
export type MapInput = z.input<typeof MapSchema>;

/** Define y valida un map. Permite omitir los campos con default. */
export function defineMap(input: MapInput): Map {
  return MapSchema.parse(input);
}
