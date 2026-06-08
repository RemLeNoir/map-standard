/**
 * Benchmark: multiagente naíf vs runWithMap, sobre la misma pregunta y el mismo corpus.
 *
 *   MAP_PROVIDER=anthropic ANTHROPIC_API_KEY=... npm run benchmark
 *   MAP_PROVIDER=openai    OPENAI_API_KEY=...    npm run benchmark
 *
 * El "naíf" simula un pipeline planner→researcher→answerer sin scope ni
 * presupuesto: tres llamadas seguidas que ven todo el corpus. El otro lado
 * es una sola llamada por la gateway, con el map aplicando scope + budget.
 *
 * Comparamos: número de llamadas, tokens totales y latencia.
 */

import { runWithMap, setRetriever, MemoryRetriever, getProvider } from "../../src/core";
import { localEmbedder } from "../../src/core/embeddings/local";
import type { Chunk } from "../../src/core";

const corpus: Chunk[] = [
  { id: "1", namespace: "docs", text: "Plazo de presentación: veinte días hábiles desde la publicación del anuncio." },
  { id: "2", namespace: "docs", text: "Garantía provisional: dos por ciento del valor estimado del contrato." },
  { id: "3", namespace: "docs", text: "Las ofertas se presentan por sede electrónica con firma digital reconocida." },
  { id: "4", namespace: "docs", text: "Criterios de adjudicación: precio (60%), calidad técnica (30%), plazo (10%)." },
  { id: "5", namespace: "docs", text: "Plazo de ejecución: doce meses prorrogables a veinticuatro." },
  { id: "6", namespace: "marketing", text: "Confía en nosotros. Somos los líderes del sector." },
  { id: "7", namespace: "marketing", text: "Nuestros servicios son los mejores del mercado." },
  { id: "8", namespace: "billing", text: "Factura nº 2024-001, importe 12.500€, IVA incluido." },
];

const pregunta = "¿Cuál es el plazo de presentación y qué garantía provisional se exige?";

function ms(t: number): string {
  return `${(t).toFixed(0)}ms`;
}

interface Result {
  label: string;
  text: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  ms: number;
}

async function naive(): Promise<Result> {
  // Tres llamadas sin scope, sin budget, sin map. Todo el corpus al modelo.
  const provider = getProvider();
  const fuentes = corpus.map((c) => `[${c.id}] (${c.namespace}) ${c.text}`).join("\n");
  const t0 = performance.now();

  let inputTokens = 0;
  let outputTokens = 0;

  const plan = await provider.complete({
    tier: "medium",
    system: "Eres un planner. Devuelve los sub-pasos para responder.",
    user: `Pregunta: ${pregunta}\n\nFuentes:\n${fuentes}`,
    maxOutputTokens: 400,
  });
  inputTokens += plan.inputTokens;
  outputTokens += plan.outputTokens;

  const research = await provider.complete({
    tier: "medium",
    system: "Eres un researcher. Extrae datos relevantes.",
    user: `Plan: ${plan.text}\n\nFuentes:\n${fuentes}`,
    maxOutputTokens: 400,
  });
  inputTokens += research.inputTokens;
  outputTokens += research.outputTokens;

  const answer = await provider.complete({
    tier: "medium",
    system: "Eres un redactor. Responde a la pregunta apoyándote en lo extraído.",
    user: `Investigación: ${research.text}\n\nPregunta: ${pregunta}`,
    maxOutputTokens: 400,
  });
  inputTokens += answer.inputTokens;
  outputTokens += answer.outputTokens;

  return {
    label: "naive multi-agent",
    text: answer.text,
    calls: 3,
    inputTokens,
    outputTokens,
    ms: performance.now() - t0,
  };
}

async function withMap(): Promise<Result> {
  const mem = new MemoryRetriever(localEmbedder);
  await mem.add(corpus);
  setRetriever(mem);

  const t0 = performance.now();
  const r = await runWithMap("qa_documental", pregunta);
  return {
    label: "runWithMap(qa_documental)",
    text: r.text,
    calls: r.calls,
    inputTokens: r.inputTokens,
    outputTokens: r.outputTokens,
    ms: performance.now() - t0,
  };
}

function row(r: Result): string {
  const total = r.inputTokens + r.outputTokens;
  return `${r.label.padEnd(28)} calls=${r.calls}  in=${String(r.inputTokens).padStart(6)}  out=${String(r.outputTokens).padStart(5)}  total=${String(total).padStart(6)}  ${ms(r.ms).padStart(7)}`;
}

async function main() {
  if (!process.env.MAP_PROVIDER) {
    console.error("Define MAP_PROVIDER=anthropic|openai y su API key.");
    process.exit(1);
  }

  console.log(`Pregunta: ${pregunta}\n`);

  const a = await naive();
  console.log(row(a));
  console.log("respuesta:", a.text.slice(0, 200).replace(/\s+/g, " "), "\n");

  const b = await withMap();
  console.log(row(b));
  console.log("respuesta:", b.text.slice(0, 200).replace(/\s+/g, " "), "\n");

  const ratio = ((a.inputTokens + a.outputTokens) / Math.max(1, b.inputTokens + b.outputTokens)).toFixed(2);
  console.log(`Naive gasta ${ratio}x los tokens de MAP en este ejemplo.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
