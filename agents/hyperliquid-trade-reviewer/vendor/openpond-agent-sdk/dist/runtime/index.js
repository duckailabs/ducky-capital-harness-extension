import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
async function runAgentAction(_agent, _actionName, _options = {}) {
  throw new Error("Use `openpond-agent run <action>` for the local SDK runner.");
}

// src/core/runner.ts
import { spawn } from "node:child_process";
import path3 from "node:path";

// src/core/constants.ts
import path from "node:path";
var ARTIFACT_DIR = ".openpond";
var TRACE_SUBDIR = "traces";
var TRACE_DIR = path.join(ARTIFACT_DIR, TRACE_SUBDIR);
var DEFAULT_AGENT_CONFIG = path.join("agent", "agent.ts");
var SDK_SCHEMA_VERSION = 1;
var ARTIFACT_SCHEMAS = {
  action: "openpond.agent.action.v1",
  actionRegistry: "openpond.agent.action-registry.v1",
  agent: "openpond.agent.local-agent.v1",
  artifactIndex: "openpond.agent.artifact-index.v1",
  agentManifest: "openpond.agent.manifest.v1",
  channel: "openpond.agent.channel.v1",
  editablePolicy: "openpond.agent.editable-policy.v1",
  envSecret: "openpond.agent.env-secret.v1",
  eval: "openpond.agent.eval.v1",
  evalResults: "openpond.agent.eval-results.v1",
  inspect: "openpond.agent.inspect.v1",
  instructions: "openpond.agent.instructions.v1",
  integration: "openpond.agent.integration.v1",
  intentRouter: "openpond.agent.intent-router.v1",
  mcpClientConnection: "openpond.agent.mcp-client-connection.v1",
  remoteAgent: "openpond.agent.remote-agent.v1",
  runtimeManifest: "openpond.runtime.manifest.v1",
  runtimeBridge: "openpond.agent.runtime-bridge.v1",
  runtimeBundle: "openpond.agent.runtime-bundle.v1",
  schedule: "openpond.agent.schedule.v1",
  skill: "openpond.agent.skill.v1",
  tool: "openpond.agent.tool.v1",
  trace: "openpond.agent.trace.v1",
  validatorReport: "openpond.agent.validation.v1",
  volume: "openpond.agent.volume.v1",
  workflow: "openpond.agent.workflow.v1"
};
function traceDir(artifactDir = ARTIFACT_DIR) {
  return path.join(artifactDir, TRACE_SUBDIR);
}

// src/core/schema.ts
function workflowName(workflow) {
  return typeof workflow === "string" ? workflow : workflow.name;
}
function localAgentId(agent) {
  return typeof agent === "string" ? agent : agent.id;
}
function remoteAgentId(agent) {
  return typeof agent === "string" ? agent : agent.id;
}
function toolName(tool) {
  return typeof tool === "string" ? tool : tool.name;
}
function actionId(action) {
  return action.id ?? action.name;
}
function actionLabel(action) {
  return action.label ?? titleFromId(actionId(action));
}
function inferActionImplementation(action) {
  if (action.implementation) return action.implementation;
  if (action.target.kind === "chat") {
    return { type: "chat", allowedActionIds: action.target.allowedActions };
  }
  if (action.target.kind === "workflow") {
    return { type: "workflow", workflowId: workflowName(action.target.workflow) };
  }
  if (action.target.kind === "local-agent") {
    return { type: "agent", agentId: localAgentId(action.target.agent) };
  }
  if (action.target.kind === "remote-agent") {
    return { type: "remote-agent", remoteAgentId: remoteAgentId(action.target.remoteAgent) };
  }
  if (action.target.kind === "tool") {
    return { type: "tool", toolId: toolName(action.target.tool) };
  }
  return {
    type: "intent-router",
    routerId: typeof action.target.router === "string" ? action.target.router : `${actionId(action)}-router`
  };
}
function schemaLabel(schema) {
  if (!schema) return null;
  if (typeof schema === "string") return schema;
  if (typeof schema === "object" && schema && "description" in schema && typeof schema.description === "string") {
    return schema.description;
  }
  return schema.constructor?.name ?? "schema";
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isChannelId(value) {
  return value === "openpond_chat" || value === "microsoft_teams" || value === "slack" || value === "mcp" || value === "api" || value === "schedule" || value === "manual";
}
function normalizeInput(input) {
  return {
    ...input ?? {},
    prompt: typeof input?.prompt === "string" ? input.prompt : "",
    channel: isChannelId(input?.channel) ? input.channel : "openpond_chat",
    conversationId: typeof input?.conversationId === "string" ? input.conversationId : null,
    messageId: typeof input?.messageId === "string" ? input.messageId : null,
    threadId: typeof input?.threadId === "string" ? input.threadId : null,
    files: Array.isArray(input?.files) ? input.files : [],
    context: isRecord(input?.context) ? input.context : {}
  };
}
function titleFromId(id) {
  const normalized = id.replace(/[._-]+/g, " ").trim();
  if (!normalized) return id;
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// src/core/files.ts
import { mkdir, writeFile } from "node:fs/promises";
import path2 from "node:path";
async function writeText(cwd, relativePath, value) {
  const target = path2.resolve(cwd, relativePath);
  await mkdir(path2.dirname(target), { recursive: true });
  await writeFile(target, value, "utf8");
}

// ../connected-apps/dist/index.js
var CONNECTED_APP_PROVIDER_ORDER = [
  "slack",
  "google",
  "github",
  "x",
  "microsoft_teams",
  "mcp"
];
var CAPABILITIES = {
  slack: [
    capability("slack.channel.bind", "Bind channels", "Bind Slack channels or threads to OpenPond profiles.", "setup", false),
    capability("slack.message.ingest", "Ingest messages", "Ingest Slack channel or thread activity into OpenPond context.", "setup", false)
  ],
  microsoft_teams: [
    capability("microsoft_teams.channel.bind", "Bind channels", "Bind Teams channels or chats to OpenPond profiles.", "setup", false),
    capability("microsoft_teams.message.ingest", "Ingest messages", "Ingest Teams channel or chat activity into OpenPond context.", "setup", false)
  ],
  google: [
    capability("google.drive.file.read", "Read Drive files", "Find and read Google Drive files.", "read", true),
    capability("google.drive.file.write", "Write Drive files", "Create or update approved Google Drive files.", "write", true),
    capability("google.docs.read", "Read Docs", "Read Google Docs content and structure.", "read", true),
    capability("google.docs.write", "Edit Docs", "Apply approved Google Docs edits.", "write", true),
    capability("google.comments.read", "Read comments", "Read Google file comments.", "read", true),
    capability("google.comments.write", "Write comments", "Create or resolve approved Google comments.", "write", true)
  ],
  github: [
    capability("github.repo.read", "Read repositories", "Read repository metadata and file context.", "read", true),
    capability("github.issue.read", "Read issues", "Read GitHub issues and comments.", "read", true),
    capability("github.issue.write", "Update issues", "Create or update approved GitHub issue content.", "write", true),
    capability("github.pull_request.read", "Read pull requests", "Read pull request metadata, diffs, checks, and reviews.", "read", true),
    capability("github.pull_request.write", "Update pull requests", "Create approved comments or pull request updates.", "write", true)
  ],
  x: [
    capability("x.profile.read", "Read profile", "Read the connected X profile.", "read", true),
    capability("x.search.read", "Search X", "Search public X posts when granted.", "read", true),
    capability("x.mentions.read", "Read mentions", "Read mentions for the connected X account.", "read", true),
    capability("x.post.write", "Post", "Create approved X posts.", "write", true),
    capability("x.reply.write", "Reply", "Create approved X replies.", "write", true)
  ],
  mcp: [
    capability("mcp.tool.discover", "Discover tools", "Discover team-scoped MCP tools.", "tooling", false),
    capability("mcp.tool.call", "Call tools", "Call approved MCP tools through the team endpoint.", "tooling", false)
  ]
};
var PROVIDER_OPERATIONS = {
  slack: [],
  microsoft_teams: [],
  google: [
    providerOperation("google.drive.search", "search", "Search Drive", "Search Google Drive files by grounded query.", ["google.drive.file.read"]),
    providerOperation("google.drive.read_file", "read", "Read Drive file", "Read Drive file metadata or exported content by stable ref.", ["google.drive.file.read"], { requiredKeys: ["ref"] }),
    providerOperation("google.docs.read", "read", "Read Google Doc", "Read Google Docs content and structure by stable ref.", ["google.docs.read"], { requiredKeys: ["ref"] }),
    providerOperation("google.comments.read", "read", "Read comments", "Read comments for a grounded Google file ref.", ["google.comments.read"], { requiredKeys: ["ref"] }),
    providerOperation("google.docs.update", "write", "Update Google Doc", "Apply an explicitly approved Google Docs edit and return readback verification.", ["google.docs.write"], { requiredKeys: ["ref", "patch"] }),
    providerOperation("google.comments.create", "write", "Create comment", "Create an explicitly approved Google file comment and return readback verification.", ["google.comments.write"], { requiredKeys: ["ref", "body"] }),
    providerOperation("google.comments.resolve", "write", "Resolve comment", "Resolve an explicitly approved Google comment and return readback verification.", ["google.comments.write"], { requiredKeys: ["ref", "commentId"] })
  ],
  github: [
    providerOperation("github.repo.search", "search", "Search repositories", "Search accessible repositories by owner, name, or topic.", ["github.repo.read"]),
    providerOperation("github.issue.search", "search", "Search issues", "Search accessible GitHub issues.", ["github.issue.read"]),
    providerOperation("github.pull_request.search", "search", "Search pull requests", "Search accessible GitHub pull requests.", ["github.pull_request.read"]),
    providerOperation("github.repo.read", "read", "Read repository", "Read grounded repository metadata or file context.", ["github.repo.read"], { requiredKeys: ["ref"] }),
    providerOperation("github.issue.read", "read", "Read issue", "Read a grounded GitHub issue and comments.", ["github.issue.read"], { requiredKeys: ["ref"] }),
    providerOperation("github.pull_request.read", "read", "Read pull request", "Read a grounded pull request, checks, reviews, or diff summary.", ["github.pull_request.read"], { requiredKeys: ["ref"] }),
    providerOperation("github.issue.create", "write", "Create issue", "Create an explicitly approved GitHub issue and return readback verification.", ["github.issue.write"], { requiredKeys: ["repo", "title", "body"] }),
    providerOperation("github.issue.comment", "write", "Comment on issue", "Create an explicitly approved GitHub issue comment and return readback verification.", ["github.issue.write"], { requiredKeys: ["ref", "body"] }),
    providerOperation("github.issue.update", "write", "Update issue", "Apply an explicitly approved issue metadata/content update and return readback verification.", ["github.issue.write"], { requiredKeys: ["ref"] }),
    providerOperation("github.pull_request.comment", "write", "Comment on pull request", "Create an explicitly approved pull request comment and return readback verification.", ["github.pull_request.write"], { requiredKeys: ["ref", "body"] }),
    providerOperation("github.pull_request.update", "write", "Update pull request", "Apply an explicitly approved pull request metadata update and return readback verification.", ["github.pull_request.write"], { requiredKeys: ["ref"] })
  ],
  x: [
    providerOperation("x.profile.read", "read", "Read profile", "Read the connected X account profile.", ["x.profile.read"]),
    providerOperation("x.post.read", "read", "Read post", "Read a public X post by stable ref, status URL, or post id.", ["x.search.read"], { requiredKeys: ["ref"] }),
    providerOperation("x.search.posts", "search", "Search recent posts", "Search public X posts from the X recent-search window by grounded query.", ["x.search.read"]),
    providerOperation("x.mentions.search", "search", "Search mentions", "Search mentions for the connected X account.", ["x.mentions.read"]),
    providerOperation("x.mention.read", "read", "Read mention", "Read a grounded mention or post ref.", ["x.mentions.read"], { requiredKeys: ["ref"] }),
    providerOperation("x.post.create", "write", "Create post", "Create an explicitly approved X post and return readback verification.", ["x.post.write"], { requiredKeys: ["text"] }),
    providerOperation("x.reply.create", "write", "Create reply", "Create an explicitly approved X reply and return readback verification.", ["x.reply.write"], { requiredKeys: ["inReplyToRef", "text"] })
  ],
  mcp: []
};
var INTEGRATION_SKILL_BODIES = {
  google: [
    "# Google Connected App",
    "",
    "Use Google only through server-provided connected app tools. Never ask for or infer OAuth tokens.",
    "Before reading or editing, identify the exact Drive file, Doc, Sheet, Slide, or comment thread. If the target is ambiguous, ask a short clarification or search first.",
    "Use only declared Google operation ids: google.drive.search, google.drive.read_file, google.docs.read, google.comments.read, google.docs.update, google.comments.create, google.comments.resolve.",
    "For writes, require explicit user intent, summarize the planned change, and verify the target identity before applying updates.",
    "After a write, read back the changed object or relevant range and report the result with the provider file name or stable reference.",
    "Prefer narrow reads over broad Drive scans. Do not expose private file ids unless the tool result already presents them as stable refs."
  ].join("\n"),
  github: [
    "# GitHub Connected App",
    "",
    "Use GitHub only through server-provided connected app tools. Repository, issue, and pull request identity must be grounded before action.",
    "Use only declared GitHub operation ids: github.repo.search, github.issue.search, github.pull_request.search, github.repo.read, github.issue.read, github.pull_request.read, github.issue.create, github.issue.comment, github.issue.update, github.pull_request.comment, github.pull_request.update.",
    "For reads, name the owner/repo and issue or pull request number when available. If several targets match, ask or inspect before proceeding.",
    "For writes, require explicit user intent and avoid destructive repository changes. Create issues only when the user clearly asks to submit or file a new issue. Prefer comments, labels, or metadata updates unless a stronger operation is clearly requested.",
    "Do not claim CI, review, branch, or PR state changed until a tool result confirms it.",
    "Keep local workspace git operations separate from connected GitHub operations unless the user explicitly asks to bridge them."
  ].join("\n"),
  x: [
    "# X Connected App",
    "",
    "Use X only through server-provided connected app tools. Distinguish profile, recent search, mention, post, and reply operations.",
    "Use only declared X operation ids: x.profile.read, x.post.read, x.search.posts, x.mentions.search, x.mention.read, x.post.create, x.reply.create.",
    "For x.com, twitter.com, or stable status URLs, first parse the status/post id and read the post with connected_app_read using operation x.post.read and ref set to the original URL, stable ref, or id. Do not open a browser before trying the X connector.",
    "Use x.search.posts for discovery, related public posts, replies, quote-post searches, and conversation scans. It uses X API recent search, so report zero-result searches as zero recent public posts returned by X.",
    "For conversation or reply collection, dedupe by returned post id/ref. Do not repeat the same search call unless the result exposes a usable cursor or next token; if pagination is unavailable, state that coverage is limited to returned recent-search results.",
    "Reads can summarize recent public posts, connected-account profile details, and mentions when the capability is available.",
    "Writes require explicit user intent for the exact post or reply. Do not publish drafts, jokes, endorsements, or replies unless the user clearly approves the content.",
    "Before posting or replying, preserve account identity, quote the proposed content in summary form, and respect provider limits and policy boundaries.",
    "After a write, verify the returned post or reply ref before reporting success."
  ].join("\n"),
  microsoft_teams: [
    "# Microsoft Teams Connected App",
    "",
    "Microsoft Teams is currently an ingestion/native binding surface only. Do not expose Teams OAuth reads, replies, file operations, or sandbox leases.",
    "Native Teams setup can bind chats or channels to OpenPond profiles and ingest activity into OpenPond context.",
    "If the user asks for Teams actions beyond ingestion or binding status, explain that the connector is not available yet rather than inventing tool access."
  ].join("\n"),
  slack: [
    "# Slack Connected App",
    "",
    "Slack is currently an ingestion/native binding surface only. Do not expose Slack OAuth reads, replies, file operations, or sandbox leases.",
    "Native Slack setup can bind channels or threads to OpenPond profiles and ingest activity into OpenPond context.",
    "If the user asks for Slack actions beyond ingestion or binding status, explain that the connector is not available yet rather than inventing tool access."
  ].join("\n"),
  mcp: [
    "# OpenPond MCP Connected App",
    "",
    "Use OpenPond MCP only through server-provided tool discovery and call paths. Do not invent MCP tools or endpoints.",
    "Treat MCP as team-scoped tooling, not an OAuth connector. Tool availability must come from server-confirmed discovery results.",
    "Before calling an MCP tool, match the requested operation to the tool name, description, input schema, and allowed team context.",
    "For writes or side effects, require explicit user intent and report only confirmed tool results."
  ].join("\n")
};
var CONNECTED_APP_INTEGRATION_SKILLS = CONNECTED_APP_PROVIDER_ORDER.map((provider) => {
  const descriptor = integrationSkillDescriptor(provider);
  const body = INTEGRATION_SKILL_BODIES[provider];
  return {
    ...descriptor,
    provider,
    body,
    sourceHash: `connected-app-skill:${provider}:${hashString(body)}`,
    charCount: body.length
  };
});
var CATALOG = [
  catalogEntry({
    id: "slack",
    providerFamily: "slack",
    setupSurface: "native_bot",
    statusSource: "native_binding",
    label: "Slack",
    shortLabel: "Slack",
    kind: "native",
    category: "Chat",
    description: "Bind Slack channels or threads for ingestion into OpenPond profiles.",
    icon: "/connected-apps/slack.svg",
    installLabel: "Continue to Slack details"
  }),
  catalogEntry({
    id: "google",
    providerFamily: "google",
    setupSurface: "oauth_connector",
    statusSource: "integration_connection",
    label: "Google",
    shortLabel: "Google",
    kind: "oauth",
    category: "Productivity",
    description: "Docs, Drive files, and comments for sandbox workflows.",
    icon: "/connected-apps/google.svg",
    installLabel: "Continue to Google details"
  }),
  catalogEntry({
    id: "github",
    providerFamily: "github",
    setupSurface: "oauth_connector",
    statusSource: "integration_connection",
    label: "GitHub",
    shortLabel: "GitHub",
    kind: "oauth",
    category: "Developer tools",
    description: "Access repositories, issues, and pull requests.",
    icon: "/connected-apps/github.svg",
    installLabel: "Continue to GitHub details"
  }),
  catalogEntry({
    id: "x",
    providerFamily: "x",
    setupSurface: "oauth_connector",
    statusSource: "integration_connection",
    label: "X",
    shortLabel: "X",
    kind: "oauth",
    category: "Productivity",
    description: "User profile, mentions, and approved reply access.",
    icon: "/connected-apps/x.svg",
    installLabel: "Continue to X details"
  }),
  catalogEntry({
    id: "microsoft_teams",
    providerFamily: "microsoft_teams",
    setupSurface: "native_bot",
    statusSource: "native_binding",
    label: "Teams",
    shortLabel: "Teams",
    kind: "native",
    category: "Chat",
    description: "Bind Teams chats or channels for ingestion into OpenPond profiles.",
    icon: "/connected-apps/microsoft.svg",
    installLabel: "Continue to Teams details"
  }),
  catalogEntry({
    id: "mcp",
    providerFamily: "mcp",
    setupSurface: "mcp_endpoint",
    statusSource: "mcp_endpoint",
    label: "OpenPond MCP",
    shortLabel: "MCP",
    kind: "mcp",
    category: "Tools",
    description: "Expose workspace tools through a team-scoped MCP endpoint.",
    icon: "/connected-apps/openpond-mcp.svg",
    installLabel: "Open MCP settings"
  })
];
var CONNECTED_APP_CATALOG = CATALOG;
var CONNECTED_APP_BUNDLES = CONNECTED_APP_PROVIDER_ORDER.map((providerFamily) => {
  const setupSurfaces = CONNECTED_APP_CATALOG.filter((entry) => entry.providerFamily === providerFamily);
  const firstSurface = setupSurfaces[0];
  return {
    id: providerFamily,
    label: providerFamilyLabel(providerFamily),
    shortLabel: firstSurface.shortLabel,
    category: firstSurface.category,
    icon: firstSurface.icon,
    description: firstSurface.description,
    setupSurfaces,
    capabilities: CAPABILITIES[providerFamily],
    skills: providerSkills(providerFamily),
    tools: providerTools(providerFamily),
    operations: PROVIDER_OPERATIONS[providerFamily],
    leasePolicy: leasePolicy(providerFamily)
  };
});
function capability(id, label, description, access, leaseable) {
  return { id, label, description, access, leaseable };
}
function catalogEntry(entry) {
  return entry;
}
function providerOperation(id, operation, label, description, capabilityIds, input) {
  return {
    id,
    operation,
    label,
    description,
    capabilityIds,
    ...input ? { input } : {},
    requiresReadback: operation === "write",
    requiresRuntimeLease: false
  };
}
function providerFamilyLabel(provider) {
  if (provider === "microsoft_teams")
    return "Microsoft Teams";
  if (provider === "mcp")
    return "OpenPond MCP";
  if (provider === "x")
    return "X";
  return provider[0].toUpperCase() + provider.slice(1);
}
function providerSkills(provider) {
  return [integrationSkillDescriptor(provider)];
}
function integrationSkillDescriptor(provider) {
  return {
    name: `${provider}-connected-app`,
    description: `Use ${providerFamilyLabel(provider)} safely through connected app tools.`,
    path: `integration_skills/${provider}.md`
  };
}
function providerTools(provider) {
  if (provider === "mcp")
    return [];
  const capabilities = CAPABILITIES[provider];
  const readCapabilityIds = capabilities.filter((capability2) => capability2.access === "read").map((capability2) => capability2.id);
  const writeCapabilityIds = capabilities.filter((capability2) => capability2.access === "write").map((capability2) => capability2.id);
  const tools = [];
  if (readCapabilityIds.length > 0) {
    tools.push({
      name: "connected_app_search",
      description: `Search ${providerFamilyLabel(provider)} through a server-owned connected app connector.`,
      capabilityIds: readCapabilityIds,
      write: false
    }, {
      name: "connected_app_read",
      description: `Read a grounded ${providerFamilyLabel(provider)} object through a server-owned connected app connector.`,
      capabilityIds: readCapabilityIds,
      write: false
    });
  }
  if (writeCapabilityIds.length > 0) {
    tools.push({
      name: "connected_app_write",
      description: `Perform an explicitly approved ${providerFamilyLabel(provider)} write through a server-owned connected app connector.`,
      capabilityIds: writeCapabilityIds,
      write: true
    });
  }
  return tools;
}
function leasePolicy(provider) {
  const capabilities = CAPABILITIES[provider].filter((item) => item.leaseable).map((item) => item.id);
  const leaseable = provider !== "mcp" && capabilities.length > 0;
  return {
    leaseable,
    defaultTtlSeconds: leaseable ? 3600 : null,
    allowedCapabilityIds: capabilities,
    requiresProxy: leaseable
  };
}
function hashString(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) + hash ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

// src/core/manifest.ts
function inspectActions(project) {
  return project.actions.map(inspectAction);
}
function inspectAction(action) {
  const id = actionId(action);
  const artifactPolicy = actionArtifactPolicy(action);
  return {
    id,
    name: action.name,
    label: actionLabel(action),
    description: action.description ?? "",
    visibility: action.visibility ?? "default",
    implementation: inferActionImplementation(action),
    inputSchema: schemaLabel(action.inputSchema),
    outputSchema: schemaLabel(action.outputSchema),
    approvalPolicy: action.approval ?? defaultApprovalPolicy(),
    artifactPolicy,
    setupRequirements: action.setup ?? [],
    mcp: action.mcp ?? defaultMcpExport(),
    schedulePolicy: action.schedule ?? defaultSchedulePolicy(),
    trace: {
      name: action.trace?.name ?? id,
      namespace: action.trace?.namespace ?? "actions",
      parentActionId: action.trace?.parentActionId
    },
    invokesModel: actionInvokesModel(action)
  };
}
function actionArtifactPolicy(action) {
  return {
    outputArtifacts: action.artifacts?.outputArtifacts ?? action.outputArtifacts ?? [],
    persistRunSummary: action.artifacts?.persistRunSummary ?? true,
    persistTrace: action.artifacts?.persistTrace ?? true
  };
}
function defaultApprovalPolicy() {
  return { mode: "never" };
}
function defaultMcpExport() {
  return { enabled: false };
}
function defaultSchedulePolicy() {
  return { enabled: false, allowAdHoc: true };
}
function actionInvokesModel(action) {
  if (action.model) return true;
  return action.target.kind === "chat" || action.target.kind === "intent-router" || action.target.kind === "local-agent" || action.target.kind === "remote-agent";
}

// src/core/runner.ts
function createRunState() {
  return { artifacts: [], assertions: [], commands: [], events: [] };
}
async function executeAction(project, actionName, input, state, options = {}) {
  const action = project.actions.find((candidate) => actionId(candidate) === actionName || candidate.name === actionName);
  if (!action) throw new Error(`Unknown action: ${actionName}`);
  const selectedActionId = actionId(action);
  state.events.push(traceEvent("action.started", { action: selectedActionId, requestedAction: actionName }));
  try {
    throwIfAborted(options.signal);
    const ctx = createAgentContext(project, state);
    const run = () => executeActionTarget(project, ctx, action, input, state);
    const result = await withExecutionGuards(
      run,
      {
        actionName: selectedActionId,
        signal: options.signal,
        timeoutMs: options.timeoutMs ?? timeoutSecondsToMs(action.timeoutSeconds)
      }
    );
    state.events.push(traceEvent("action.completed", { action: selectedActionId, intent: result.intent }));
    return result;
  } catch (error) {
    state.events.push(traceEvent("action.failed", { action: selectedActionId, error: errorMessage(error) }));
    throw error;
  }
}
async function runAction(project, actionName, input, options = {}) {
  const state = createRunState();
  const actionCatalog = inspectActions(project);
  state.events.push(traceEvent("action.catalog.available", {
    actions: actionCatalog.map((action) => action.id)
  }));
  const result = await executeAction(project, actionName, normalizeInput(input), state, options);
  return { result, state, actionCatalog };
}
async function runChatAction(project, input, options = {}) {
  return runAction(project, project.defaultAction ?? "chat", input, options);
}
async function runEval(project) {
  const state = createRunState();
  const results = [];
  for (const evaluation of project.evals ?? []) {
    try {
      await tracedSpan(state, "eval", evaluation.name, async () => {
        await evaluation.run(createEvalContext(project, state));
      });
      results.push({ name: evaluation.name, status: "passed" });
    } catch (error) {
      results.push({ name: evaluation.name, status: "failed", error: errorMessage(error) });
    }
  }
  return { state, results };
}
function timeoutSecondsToMs(timeoutSeconds) {
  return timeoutSeconds === void 0 ? void 0 : Math.max(0, timeoutSeconds * 1e3);
}
async function withExecutionGuards(run, options) {
  let timeoutId;
  let abort;
  try {
    const candidates = [run()];
    if (options.timeoutMs !== void 0) {
      candidates.push(new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Action ${options.actionName} timed out after ${options.timeoutMs}ms.`)),
          options.timeoutMs
        );
      }));
    }
    if (options.signal) {
      candidates.push(new Promise((_, reject) => {
        abort = () => reject(new Error(`Action ${options.actionName} was canceled.`));
        options.signal?.addEventListener("abort", abort, { once: true });
      }));
    }
    return await Promise.race(candidates);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (options.signal && abort) options.signal.removeEventListener("abort", abort);
  }
}
function throwIfAborted(signal) {
  if (signal?.aborted) throw new Error("Action was canceled.");
}
function createEvalContext(project, state) {
  let lastResult = null;
  const assert = (name, check) => {
    try {
      check();
      state.assertions.push({ name, status: "passed" });
    } catch (error) {
      const message = errorMessage(error);
      state.assertions.push({ name, status: "failed", message });
      throw error;
    }
  };
  return {
    async send(input) {
      const actionName = project.defaultAction ?? project.actions[0]?.name;
      if (!actionName) throw new Error("No default action available for eval send.");
      lastResult = await executeAction(project, actionName, normalizeInput(input), state);
      return lastResult;
    },
    async runAction(actionName, input) {
      lastResult = await executeAction(project, actionName, normalizeInput(input), state);
      return lastResult;
    },
    expectIntent(name) {
      assert(`intent:${name}`, () => {
        if (lastResult?.intent !== name) throw new Error(`Expected intent ${name}, received ${lastResult?.intent ?? "none"}.`);
      });
    },
    expectTextIncludes(text) {
      assert(`text_includes:${text}`, () => {
        if (!(lastResult?.text ?? "").toLowerCase().includes(text.toLowerCase())) {
          throw new Error(`Expected response text to include "${text}".`);
        }
      });
    },
    expectArtifact(ref) {
      assert(`artifact:${ref}`, () => {
        const refs = /* @__PURE__ */ new Set([...lastResult?.artifactRefs ?? [], ...state.artifacts.map((artifact) => artifact.ref)]);
        if (!refs.has(ref)) throw new Error(`Expected artifact ${ref}.`);
      });
    },
    expectTraceEvent(name) {
      assert(`trace:${name}`, () => {
        if (!state.events.some((event) => event.name === name)) throw new Error(`Expected trace event ${name}.`);
      });
    }
  };
}
async function writeTrace(cwd, name, state, artifactDir) {
  const safeName = name.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "trace";
  const relativePath = path3.join(traceDir(artifactDir), `${safeName}-${Date.now()}.jsonl`);
  const lines = [
    ...state.events.map((event) => traceEntry("event", event)),
    ...state.artifacts.map((artifact) => traceEntry("artifact", artifact)),
    ...state.commands.map((command) => traceEntry("command", command))
  ].map((entry) => JSON.stringify(entry));
  await writeText(cwd, relativePath, `${lines.join("\n")}
`);
  return relativePath;
}
function traceEntry(kind, value) {
  return {
    schemaVersion: SDK_SCHEMA_VERSION,
    schema: ARTIFACT_SCHEMAS.trace,
    kind,
    ...redactObject(value)
  };
}
function createAgentContext(project, state) {
  const ctx = {
    trace: {
      event(name, payload) {
        state.events.push(traceEvent(name, payload));
      },
      artifact(ref, metadata) {
        state.artifacts.push({ ref, metadata: redactRecord(metadata) });
        state.events.push(traceEvent("artifact.created", { ref, ...metadata ? { metadata: redactRecord(metadata) } : {} }));
      },
      async span(kind, name, run, payload) {
        return tracedSpan(state, kind, name, run, payload);
      }
    },
    step(name, run) {
      return tracedSpan(state, "step", name, run);
    },
    model(name, run) {
      return tracedSpan(state, "model", name, run);
    },
    tool(name, run) {
      return tracedSpan(state, "tool", name, run);
    },
    action(name, run) {
      return tracedSpan(state, "action", name, run);
    },
    async loadSkill(name) {
      const skill = (project.skills ?? []).find((candidate) => candidate.name === name);
      if (!skill) throw new Error(`Unknown skill: ${name}`);
      state.events.push(traceEvent("skill.loaded", { skill: name, description: skill.description ?? null }));
      return { name: skill.name, description: skill.description ?? null };
    },
    async runCommand(command, options) {
      state.commands.push({ command, options: redactRecord(options) });
      state.events.push(traceEvent("command.started", { command }));
      const cwd = typeof options?.cwd === "string" && options.cwd.trim() ? options.cwd.trim() : process.cwd();
      const optionEnv = options?.env && typeof options.env === "object" && !Array.isArray(options.env) ? Object.fromEntries(
        Object.entries(options.env).flatMap(
          ([key, value]) => typeof value === "string" ? [[key, value]] : []
        )
      ) : {};
      try {
        const { exitCode, stdout, stderr } = await runShellCommand(command, cwd, {
          ...process.env,
          ...optionEnv
        });
        const status = exitCode === 0 ? "succeeded" : "failed";
        state.events.push(traceEvent("command.completed", {
          command,
          status,
          exitCode
        }));
        return { status, stdout, stderr };
      } catch (error) {
        const stderr = errorMessage(error);
        state.events.push(traceEvent("command.completed", {
          command,
          status: "failed",
          error: stderr
        }));
        return { status: "failed", stderr };
      }
    },
    async workflow(name, input) {
      const workflow = (project.workflows ?? []).find((candidate) => candidate.name === name);
      if (!workflow) throw new Error(`Unknown workflow: ${name}`);
      return tracedSpan(state, "workflow", name, async () => {
        const result = await workflow.run(createAgentContext(project, state), input);
        return result;
      }, { workflow: name });
    }
  };
  return ctx;
}
function runShellCommand(command, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-lc", command], {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      resolve({
        exitCode: code ?? (signal ? 1 : 0),
        stdout,
        stderr
      });
    });
  });
}
async function executeActionTarget(project, ctx, action, input, state) {
  if (action.target.kind === "chat") {
    const actionCatalog = inspectActions(project).filter((entry) => entry.id !== actionId(action));
    state.events.push(traceEvent("chat.action.started", {
      action: actionId(action),
      allowedActions: action.target.allowedActions ?? actionCatalog.map((entry) => entry.id)
    }));
    if (!action.target.run) {
      return {
        text: "",
        intent: "chat",
        metadata: {
          actionCatalog,
          modelPolicy: action.model ?? project.model ?? { provider: "openpond-managed" }
        }
      };
    }
    return action.target.run(ctx, input, actionCatalog);
  }
  if (action.target.kind === "workflow") {
    return executeWorkflowTarget(ctx, action.target.workflow, input);
  }
  if (action.target.kind === "intent-router") {
    return executeRouterTarget(ctx, action.target.router, input, state);
  }
  if (action.target.kind === "local-agent") {
    const agentId2 = localAgentId(action.target.agent);
    const agent = typeof action.target.agent === "string" ? (project.agents ?? []).find((candidate) => candidate.id === agentId2) : action.target.agent;
    if (!agent) throw new Error(`Unknown local agent: ${agentId2}`);
    return tracedSpan(state, "action", agentId2, () => agent.run(ctx, input), { implementation: "local-agent" });
  }
  if (action.target.kind === "tool") {
    const name = toolName(action.target.tool);
    const tool = typeof action.target.tool === "string" ? (project.tools ?? []).find((candidate) => candidate.name === name) : action.target.tool;
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    if (!tool.run) throw new Error(`Tool ${name} is inspect-only and cannot be executed directly.`);
    return tracedSpan(state, "tool", name, () => tool.run(ctx, input), { implementation: "tool" });
  }
  const agentId = remoteAgentId(action.target.remoteAgent);
  state.events.push(traceEvent("remote-agent.dispatch.requested", {
    action: actionId(action),
    remoteAgentId: agentId
  }));
  throw new Error(`Remote agent ${agentId} requires the OpenPond platform runtime.`);
}
async function tracedSpan(state, kind, name, run, payload) {
  const startedAt = Date.now();
  state.events.push(traceEvent(`${kind}.started`, { name, ...payload }));
  try {
    const result = await run();
    state.events.push(traceEvent(`${kind}.completed`, {
      name,
      durationMs: Date.now() - startedAt
    }));
    return result;
  } catch (error) {
    state.events.push(traceEvent(`${kind}.failed`, {
      name,
      durationMs: Date.now() - startedAt,
      error: errorMessage(error)
    }));
    throw error;
  }
}
async function executeWorkflowTarget(ctx, workflow, input) {
  return ctx.workflow(workflowName(workflow), input);
}
async function executeRouterTarget(ctx, router, input, state) {
  if (typeof router === "string") throw new Error(`String router targets are inspect-only in the local runner: ${router}`);
  state.events.push(traceEvent("intent.router.started", { intents: router.intents.map((intent) => intent.name) }));
  const selected = await selectIntent(router, input);
  state.events.push(traceEvent("intent.selected", { intent: selected.name }));
  const result = await selected.run(ctx, input);
  state.events.push(traceEvent("intent.completed", { intent: selected.name }));
  return result;
}
async function selectIntent(router, input) {
  for (const intent of router.intents) {
    if (intent.when && await intent.when(input)) return intent;
  }
  return router.defaultIntent;
}
function traceEvent(name, payload) {
  return { name, payload: redactRecord(payload), timestamp: (/* @__PURE__ */ new Date()).toISOString() };
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function redactRecord(value) {
  return value ? redactObject(value) : void 0;
}
function redactObject(value) {
  return redactValue(value);
}
function redactValue(value) {
  if (Array.isArray(value)) return value.map((item) => redactValue(item));
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = isSecretLikeKey(key) ? "[redacted]" : redactValue(entry);
  }
  return result;
}
function isSecretLikeKey(key) {
  return /api[_-]?key|authorization|cookie|password|secret|token/i.test(key);
}
export {
  createEvalContext,
  createRunState,
  executeAction,
  inspectActions,
  runAction,
  runAgentAction,
  runChatAction,
  runEval,
  writeTrace
};
