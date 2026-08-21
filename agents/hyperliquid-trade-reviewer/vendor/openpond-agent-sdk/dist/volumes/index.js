import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function volume(name, mountPath, definition) {
  return { name, mountPath, ...definition };
}
var defineVolume = volume;
export {
  defineVolume,
  volume
};
