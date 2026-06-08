import type { Embedder } from "./types";

// Ajusta el modelo a tu cuenta si cambia. text-embedding-3-small = 1536d.
const MODEL = process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small";
const DIM = Number(process.env.OPENAI_EMBED_DIM ?? 1536);

export const openaiEmbedder: Embedder = {
  name: "openai",
  dim: DIM,
  async embed(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Falta OPENAI_API_KEY");

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: MODEL, input: texts }),
    });
    if (!res.ok) throw new Error(`OpenAI embeddings ${res.status}: ${await res.text()}`);

    const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return data.data.map((d) => d.embedding);
  },
};
