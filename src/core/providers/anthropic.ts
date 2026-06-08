import type { ModelTier } from "../schema";
import type { CompleteArgs, CompleteResult, ModelProvider } from "./types";

/**
 * Adapter real de Anthropic. Usa fetch directo (sin SDK) contra la Messages API.
 * Requiere ANTHROPIC_API_KEY en el entorno. Ajusta el mapeo tier -> modelo a tu gusto.
 */
const TIER_MODEL: Record<ModelTier, string> = {
  cheap: "claude-haiku-4-5-20251001",
  medium: "claude-sonnet-4-6",
  strong: "claude-opus-4-8",
};

export const anthropicProvider: ModelProvider = {
  name: "anthropic",
  modelFor(tier: ModelTier): string {
    return TIER_MODEL[tier];
  },
  async complete(args: CompleteArgs): Promise<CompleteResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Falta ANTHROPIC_API_KEY");
    const model = this.modelFor(args.tier);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: args.maxOutputTokens,
        system: args.system,
        messages: [{ role: "user", content: args.user }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");

    return {
      text,
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      model,
    };
  },
};
