import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resolveMap } from "../core/resolver";
import { applyScope } from "../core/gates/scope";
import { gateTool, ToolBlockedError } from "../core/gates/tools";
import { getRetriever } from "../core/retrievers";
import { registry } from "../core/maps";
import { bootstrapRetriever } from "./bootstrap";

const server = new McpServer({ name: "map", version: "0.1.0" });

/**
 * resolve_map: devuelve los parámetros activos que el modelo llamante debe
 * respetar para una tarea. Esto es ADVISORY: orienta, no obliga.
 */
server.registerTool(
  "resolve_map",
  {
    description:
      "Devuelve los parámetros activos (scope, herramientas, formato, presupuesto) de un map por id. " +
      `Maps disponibles: ${Object.keys(registry).join(", ")}.`,
    inputSchema: { mapId: z.string() },
  },
  async ({ mapId }) => {
    const map = resolveMap(mapId);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              id: map.id,
              task: map.task,
              ragScope: map.ragScope,
              output: map.output,
              tools: map.tools,
              budget: map.budget,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

/**
 * scoped_search: recupera chunks SOLO dentro del scope del map y capado a su
 * presupuesto. Esto SÍ se enforza: lo que queda fuera de scope no se devuelve.
 */
server.registerTool(
  "scoped_search",
  {
    description: "Busca en el RAG aplicando el scope y el límite de chunks del map indicado.",
    inputSchema: { mapId: z.string(), query: z.string() },
  },
  async ({ mapId, query }) => {
    const map = resolveMap(mapId);
    try {
      gateTool(map, "scoped_search"); // si el map no la permite, se rechaza
    } catch (e) {
      if (e instanceof ToolBlockedError) {
        return { content: [{ type: "text", text: e.message }], isError: true };
      }
      throw e;
    }
    const chunks = await getRetriever().search(query, applyScope(map));
    return { content: [{ type: "text", text: JSON.stringify(chunks, null, 2) }] };
  },
);

async function main(): Promise<void> {
  await bootstrapRetriever();
  await server.connect(new StdioServerTransport());
  // El servidor queda escuchando por stdio (sin logs a stdout).
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
