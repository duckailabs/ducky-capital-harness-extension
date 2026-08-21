import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function defineInstructions(definition) {
  if (typeof definition === "string" || typeof definition === "function") {
    return { kind: "instructions", source: definition, format: "markdown" };
  }
  return { kind: "instructions", format: "markdown", ...definition };
}
export {
  defineInstructions
};
