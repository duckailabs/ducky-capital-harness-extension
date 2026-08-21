import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
function defineAgentProject(definition) {
  return definition;
}
function defineAgent(definition) {
  if ("version" in definition && "useCase" in definition && "actions" in definition) {
    return defineAgentProject(definition);
  }
  return { kind: "local-agent", ...definition };
}
function defineLocalAgent(definition) {
  return { kind: "local-agent", ...definition };
}
function defineRemoteAgent(definition) {
  return { kind: "remote-agent", ...definition };
}
function defineMcpClientConnection(definition) {
  return { kind: "mcp-client-connection", ...definition };
}
function defineIntent(definition) {
  return { kind: "intent", ...definition };
}
function defineIntentRouter(definition) {
  return { kind: "intent-router", ...definition };
}
function defineChannel(definition) {
  return { kind: "channel", ...definition };
}
function defineWorkflow(definition) {
  return { kind: "workflow", ...definition };
}
function defineTool(definition) {
  return { kind: "tool", ...definition };
}
function defineEval(definition) {
  return { kind: "eval", ...definition };
}
function defineSchedule(definition) {
  return { kind: "schedule", ...definition };
}
function defineInstructions(definition) {
  if (typeof definition === "string" || typeof definition === "function") {
    return { kind: "instructions", source: definition, format: "markdown" };
  }
  return { kind: "instructions", format: "markdown", ...definition };
}
function defineSkill(definition) {
  return { kind: "skill", format: "markdown", ...definition };
}
function action(name, definition) {
  return { name, id: definition.id ?? name, ...definition };
}
function defineAction(idOrDefinition, maybeDefinition) {
  if (typeof idOrDefinition === "string") {
    const definition2 = maybeDefinition ?? {};
    return action(definition2.name ?? idOrDefinition, { ...definition2, id: idOrDefinition });
  }
  const { id, name = id, ...definition } = idOrDefinition;
  return action(name, { ...definition, id });
}
function editable(definition) {
  return { kind: "editable", ...definition };
}
var integration = {
  openpondChat(definition = {}) {
    return { provider: "openpond_chat", ...definition };
  },
  microsoftTeams(definition = {}) {
    return { provider: "microsoft_teams", ...definition };
  },
  slack(definition = {}) {
    return { provider: "slack", ...definition };
  },
  opchat(definition) {
    return { provider: "opchat", ...definition };
  }
};
function defineIntegration(definition) {
  return definition;
}
function defineEnvSecret(name, definition = {}) {
  return { kind: "env", name, ...definition };
}
var env = {
  variable(name, definition = {}) {
    return defineEnvSecret(name, { ...definition, secret: false });
  }
};
var secret = {
  env(name, definition = {}) {
    return defineEnvSecret(name, { ...definition, secret: true });
  }
};
function volume(name, mountPath, definition) {
  return { name, mountPath, ...definition };
}
var defineVolume = volume;
var schedule = {
  cron(name, definition) {
    return defineSchedule({ ...definition, name, scheduleType: "cron" });
  },
  rate(name, definition) {
    return defineSchedule({ ...definition, name, scheduleType: "rate" });
  }
};
async function runAgentAction(_agent, _actionName, _options = {}) {
  throw new Error("Use `openpond-agent run <action>` for the local SDK runner.");
}
export {
  action,
  defineAction,
  defineAgent,
  defineAgentProject,
  defineChannel,
  defineEnvSecret,
  defineEval,
  defineInstructions,
  defineIntegration,
  defineIntent,
  defineIntentRouter,
  defineLocalAgent,
  defineMcpClientConnection,
  defineRemoteAgent,
  defineSchedule,
  defineSkill,
  defineTool,
  defineVolume,
  defineWorkflow,
  editable,
  env,
  integration,
  runAgentAction,
  schedule,
  secret,
  volume
};
