import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // La regla que muerde: nadie llama al proveedor/SDK del modelo por fuera.
      // Se va al modelo SOLO por la gateway (runWithMap).
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "openai", message: "No uses el SDK del modelo directamente. Usa runWithMap()." },
            { name: "@anthropic-ai/sdk", message: "No uses el SDK del modelo directamente. Usa runWithMap()." },
          ],
          patterns: [
            {
              group: ["**/core/providers/anthropic", "**/core/providers/openai"],
              message:
                "No importes el adapter del proveedor directamente. Usa runWithMap() de la gateway.",
            },
          ],
        },
      ],
    },
  },
  {
    // El core SÍ puede tocar los proveedores: es quien los orquesta.
    files: ["src/core/gateway.ts", "src/core/providers/**"],
    rules: { "no-restricted-imports": "off" },
  },
);
