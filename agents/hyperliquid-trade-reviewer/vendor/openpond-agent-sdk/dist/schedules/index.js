import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function defineSchedule(definition) {
  return { kind: "schedule", ...definition };
}
var schedule = {
  cron(name, definition) {
    return defineSchedule({ ...definition, name, scheduleType: "cron" });
  },
  rate(name, definition) {
    return defineSchedule({ ...definition, name, scheduleType: "rate" });
  }
};
export {
  defineSchedule,
  schedule
};
