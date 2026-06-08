import type { ModelTier } from "../schema";

export interface CompleteArgs {
  tier: ModelTier;
  system: string;
  user: string;
  maxOutputTokens: number;
}

export interface CompleteResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface ModelProvider {
  name: string;
  modelFor(tier: ModelTier): string;
  complete(args: CompleteArgs): Promise<CompleteResult>;
}
