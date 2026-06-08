import type { ModelTier } from "../schema";
import type { CompleteArgs, CompleteResult, ModelProvider } from "./types";

// Mapeo tier -> modelo. Override por env; verifica los nombres en tu cuenta.
const TIER_MODEL: Record<ModelTier, string> = {
  cheap: process.env.OPENAI_MODEL_CHEAP ?? "gpt-4o-mini",
  medium: process.env.OPENAI_MODEL_MEDIUM ?? "gpt-4o",
  strong: process.env.OPENAI_MODEL_STRONG ?? "gpt-4o",
};

export const openaiProvider: ModelProvider = {
  name: "openai",
  modelFor(tier: ModelTier): string {
    return TIER_MODEL[tier];
  },
  async complete(args: CompleteArgs): Promise<CompleteResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Falta OPENAI_API_KEY");
    const model = this.modelFor(args.tier);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: args.maxOutputTokens,
        messages: [
          { role: "system", content: args.system },
          { role: "user", content: args.user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string | null } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      text: data.choices[0]?.message.content ?? "",
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      model,
    };
  },
};
