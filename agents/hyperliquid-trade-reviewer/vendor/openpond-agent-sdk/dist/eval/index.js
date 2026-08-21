import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function defineEval(definition) {
  return { kind: "eval", ...definition };
}
export {
  defineEval
};
