import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function editable(definition) {
  return { kind: "editable", ...definition };
}
export {
  editable
};
