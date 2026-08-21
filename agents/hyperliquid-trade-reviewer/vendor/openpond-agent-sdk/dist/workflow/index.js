import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function defineWorkflow(definition) {
  return { kind: "workflow", ...definition };
}
export {
  defineWorkflow
};
