import type { ModelProvider } from "../src/core/providers";
import { estimateTokens } from "../src/core/tokenizer";

/** Proveedor determinista para tests. Vive solo aquí, no en el producto. */
export const fakeProvider: ModelProvider = {
  name: "fake",
  modelFor: (tier) => `fake-${tier}`,
  async complete(args) {
    return {
      text: "[fake]",
      inputTokens: estimateTokens(args.system) + estimateTokens(args.user),
      outputTokens: 2,
      model: `fake-${args.tier}`,
    };
  },
};
