import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/core/validation.ts
import { readFileSync } from "node:fs";
import path3 from "node:path";

// src/core/constants.ts
import path from "node:path";
var ARTIFACT_DIR = ".openpond";
var TRACE_SUBDIR = "traces";
var TRACE_DIR = path.join(ARTIFACT_DIR, TRACE_SUBDIR);
var DEFAULT_AGENT_CONFIG = path.join("agent", "agent.ts");
var OPENPOND_MANIFEST = "openpond.yaml";
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

// src/core/files.ts
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path2 from "node:path";
async function writeText(cwd, relativePath, value) {
  const target = path2.resolve(cwd, relativePath);
  await mkdir(path2.dirname(target), { recursive: true });
  await writeFile(target, value, "utf8");
}
function pathExists(filePath) {
  return existsSync(filePath);
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
function titleFromId(id) {
  const normalized = id.replace(/[._-]+/g, " ").trim();
  if (!normalized) return id;
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// src/core/manifest.ts
function createAgentManifest(project, promptArtifacts) {
  return {
    schemaVersion: SDK_SCHEMA_VERSION,
    schema: ARTIFACT_SCHEMAS.agentManifest,
    artifactSchemas: ARTIFACT_SCHEMAS,
    sourceOfTruth: project.manifestMode,
    project: projectSummary(project),
    defaultEntrypoint: {
      scope: "action",
      name: project.defaultAction ?? firstActionId(project)
    },
    runtime: project.runtime,
    resources: project.resources ?? {},
    modelPolicy: project.model ?? defaultModelPolicy(),
    instructions: promptArtifacts?.instructions ?? serializeInstructions(project.instructions),
    skills: promptArtifacts?.skills ?? serializeSkills(project.skills ?? []),
    editable: project.editable ? { schema: ARTIFACT_SCHEMAS.editablePolicy, ...project.editable } : null,
    setup: project.setup ?? null,
    validation: project.validation ?? null,
    inputSchema: project.inputSchema ?? null,
    inputSchemas: project.inputSchemas ?? {},
    actionCatalog: inspectActions(project),
    actions: project.actions.map(serializeAction),
    chat: serializeChatRouter(project),
    agents: (project.agents ?? []).map((agent) => ({
      schema: ARTIFACT_SCHEMAS.agent,
      id: agent.id,
      label: agent.label ?? null,
      description: agent.description ?? null,
      tools: agent.tools ?? [],
      workflows: agent.workflows ?? [],
      modelPolicy: agent.model ?? null
    })),
    remoteAgents: (project.remoteAgents ?? []).map((agent) => ({
      schema: ARTIFACT_SCHEMAS.remoteAgent,
      id: agent.id,
      description: agent.description,
      projectId: agent.projectId ?? null,
      agentId: agent.agentId ?? null,
      url: agent.url ?? null,
      auth: agent.auth,
      inputSchema: schemaLabel(agent.inputSchema),
      outputSchema: schemaLabel(agent.outputSchema),
      trace: agent.trace ?? null
    })),
    connections: (project.connections ?? []).map((connection) => ({
      schema: ARTIFACT_SCHEMAS.mcpClientConnection,
      id: connection.id,
      description: connection.description ?? null,
      serverUrl: connection.serverUrl ?? null,
      auth: connection.auth ?? { policy: "none" },
      tools: connection.tools ?? {},
      approvalPolicy: connection.approvalPolicy ?? defaultApprovalPolicy(),
      traceNamespace: connection.traceNamespace ?? connection.id
    })),
    workflows: (project.workflows ?? []).map((workflow) => ({
      schema: ARTIFACT_SCHEMAS.workflow,
      name: workflow.name,
      description: workflow.description ?? null
    })),
    channels: (project.channels ?? []).map((channel) => serializeChannel(project, channel)),
    tools: (project.tools ?? []).map((tool) => ({
      schema: ARTIFACT_SCHEMAS.tool,
      name: tool.name,
      description: tool.description,
      visibility: tool.visibility,
      target: tool.target,
      inputSchema: schemaLabel(tool.inputSchema),
      outputArtifacts: tool.outputArtifacts ?? []
    })),
    volumes: (project.volumes ?? []).map((volume) => ({ schema: ARTIFACT_SCHEMAS.volume, ...volume })),
    envRefs: (project.env ?? []).map(serializeEnvRef),
    integrations: (project.integrations ?? []).map((integration) => ({
      schema: ARTIFACT_SCHEMAS.integration,
      ...integration
    })),
    schedules: (project.schedules ?? []).map((schedule) => ({
      schema: ARTIFACT_SCHEMAS.schedule,
      ...schedule
    })),
    evals: (project.evals ?? []).map((evaluation) => ({
      schema: ARTIFACT_SCHEMAS.eval,
      name: evaluation.name,
      description: evaluation.description,
      expectedArtifacts: evaluation.expectedArtifacts ?? []
    }))
  };
}
function serializeInstructions(instructions) {
  if (!instructions) return null;
  if (typeof instructions === "string") {
    return { schema: ARTIFACT_SCHEMAS.instructions, source: instructions, format: "markdown" };
  }
  return {
    schema: ARTIFACT_SCHEMAS.instructions,
    source: serializeGeneratedSource(instructions.markdown ?? instructions.source),
    format: instructions.format ?? "markdown"
  };
}
function serializeSkills(skills) {
  return skills.map((skill) => ({
    schema: ARTIFACT_SCHEMAS.skill,
    name: skill.name,
    description: skill.description ?? null,
    source: serializeGeneratedSource(skill.markdown ?? skill.source),
    format: skill.format ?? "markdown"
  }));
}
function serializeGeneratedSource(source) {
  return typeof source === "string" && source.startsWith("./") ? source : "generated";
}
function serializeEnvRef(envRef) {
  return {
    schema: ARTIFACT_SCHEMAS.envSecret,
    kind: envRef.kind,
    name: envRef.name,
    required: envRef.required ?? false,
    secret: envRef.secret ?? true,
    description: envRef.description ?? null
  };
}
function serializeChannel(project, channel) {
  const requiredConnections = channel.requiredConnections ?? [];
  const setupRequirements = requiredConnections.map((connection) => ({
    kind: "integration",
    name: connection,
    required: true,
    satisfied: hasIntegration(project, connection)
  }));
  return {
    schema: ARTIFACT_SCHEMAS.channel,
    id: channel.id,
    target: { action: channel.target.action },
    targetAction: channel.target.action,
    requiredConnections,
    capabilities: channel.capabilities ?? [],
    enabledByDefault: channel.enabledByDefault ?? false,
    adapter: {
      normalizeEvent: {
        kind: "function",
        output: "AgentChatInput",
        requiredFields: ["prompt", "channel"]
      },
      renderResponse: {
        kind: "function",
        input: "AgentChatResult",
        output: "Record<string, unknown>",
        supportedFields: ["text", "files", "artifactRefs", "metadata"]
      }
    },
    setupRequirements,
    setupStatus: setupRequirements.every((requirement) => requirement.satisfied) ? "ready" : "missing_setup"
  };
}
function hasIntegration(project, provider) {
  return (project.integrations ?? []).some((integration) => integration.provider === provider);
}
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
function defaultModelPolicy() {
  return { provider: "openpond-managed", required: false };
}
function actionInvokesModel(action) {
  if (action.model) return true;
  return action.target.kind === "chat" || action.target.kind === "intent-router" || action.target.kind === "local-agent" || action.target.kind === "remote-agent";
}
function firstActionId(project) {
  const first = project.actions[0];
  return first ? actionId(first) : null;
}
function projectSummary(project) {
  return {
    name: project.name,
    version: project.version,
    useCase: project.useCase,
    description: project.description ?? null
  };
}
function serializeAction(action) {
  const catalogEntry2 = inspectAction(action);
  return {
    schema: ARTIFACT_SCHEMAS.action,
    id: catalogEntry2.id,
    name: action.name,
    label: catalogEntry2.label,
    description: action.description ?? null,
    visibility: action.visibility ?? "default",
    target: serializeActionTarget(action),
    implementation: catalogEntry2.implementation,
    timeoutSeconds: action.timeoutSeconds ?? null,
    inputSchema: schemaLabel(action.inputSchema),
    outputSchema: schemaLabel(action.outputSchema),
    approvalPolicy: catalogEntry2.approvalPolicy,
    artifactPolicy: catalogEntry2.artifactPolicy,
    setupRequirements: catalogEntry2.setupRequirements,
    mcp: catalogEntry2.mcp,
    schedulePolicy: catalogEntry2.schedulePolicy,
    trace: catalogEntry2.trace,
    invokesModel: catalogEntry2.invokesModel,
    outputArtifacts: action.outputArtifacts ?? []
  };
}
function serializeActionTarget(action) {
  if (action.target.kind === "chat") {
    return {
      kind: "chat",
      allowedActions: action.target.allowedActions ?? [],
      hasRuntime: Boolean(action.target.run)
    };
  }
  if (action.target.kind === "workflow") {
    return { kind: "workflow", workflow: workflowName(action.target.workflow) };
  }
  if (action.target.kind === "local-agent") {
    return { kind: "local-agent", agentId: localAgentId(action.target.agent) };
  }
  if (action.target.kind === "remote-agent") {
    return { kind: "remote-agent", remoteAgentId: remoteAgentId(action.target.remoteAgent) };
  }
  if (action.target.kind === "tool") {
    return { kind: "tool", tool: toolName(action.target.tool) };
  }
  return {
    kind: "intent-router",
    router: typeof action.target.router === "string" ? action.target.router : `${actionId(action)}-router`,
    intents: typeof action.target.router === "string" ? [] : action.target.router.intents.map((intent) => intent.name),
    defaultIntent: typeof action.target.router === "string" ? null : action.target.router.defaultIntent.name
  };
}
function serializeChatRouter(project) {
  const defaultAction = project.actions.find(
    (action) => actionId(action) === (project.defaultAction ?? "chat") || action.name === (project.defaultAction ?? "chat")
  );
  if (!defaultAction || defaultAction.target.kind !== "intent-router") {
    if (defaultAction?.target.kind === "chat") {
      return {
        schema: ARTIFACT_SCHEMAS.intentRouter,
        kind: "chat-action",
        allowedActions: defaultAction.target.allowedActions ?? []
      };
    }
    return null;
  }
  if (typeof defaultAction.target.router === "string") {
    return { schema: ARTIFACT_SCHEMAS.intentRouter, kind: "intent-router", router: defaultAction.target.router };
  }
  return {
    schema: ARTIFACT_SCHEMAS.intentRouter,
    kind: "intent-router",
    inputSchema: schemaLabel(defaultAction.target.router.inputSchema),
    intents: defaultAction.target.router.intents.map((intent) => intent.name),
    defaultIntent: defaultAction.target.router.defaultIntent.name,
    routing: defaultAction.target.router.routing ?? null
  };
}

// src/core/validation.ts
var SYNTHESIZED_OPENPOND_YAML_SENTINEL = "# openpond-agent-sdk-source-upload: synthesized-openpond-yaml";
function validateAgentProject(project, cwd) {
  const issues = [];
  const actionNames = /* @__PURE__ */ new Set();
  const actionIds = /* @__PURE__ */ new Set();
  const workflowNames = new Set((project.workflows ?? []).map((workflow) => workflow.name));
  const agentIds = new Set((project.agents ?? []).map((agent) => agent.id));
  const remoteAgentIds = new Set((project.remoteAgents ?? []).map((agent) => agent.id));
  const toolNames = new Set((project.tools ?? []).map((tool) => tool.name));
  if (!project.name.trim()) addIssue(issues, {
    code: "project_name_required",
    severity: "error",
    path: "project.name",
    message: "Project name is required."
  });
  if (!project.version.trim()) addIssue(issues, {
    code: "project_version_required",
    severity: "error",
    path: "project.version",
    message: "Project version is required."
  });
  validateSourceOfTruth(project, cwd, issues);
  if (!Array.isArray(project.actions) || project.actions.length === 0) {
    addIssue(issues, {
      code: "action_required",
      severity: "error",
      path: "actions",
      message: "At least one action is required."
    });
  }
  for (const action of project.actions ?? []) {
    const id = actionId(action);
    if (actionNames.has(action.name)) addIssue(issues, {
      code: "action_duplicate",
      severity: "error",
      path: `actions.${action.name}`,
      message: `Duplicate action: ${action.name}`,
      details: { action: action.name }
    });
    if (actionIds.has(id)) addIssue(issues, {
      code: "action_id_duplicate",
      severity: "error",
      path: `actions.${id}`,
      message: `Duplicate action id: ${id}`,
      details: { action: id }
    });
    actionNames.add(action.name);
    actionIds.add(id);
    validateActionTarget(action, workflowNames, agentIds, remoteAgentIds, toolNames, issues);
    validateActionExposure(action, issues);
  }
  const defaultAction = project.defaultAction ?? (project.actions[0] ? actionId(project.actions[0]) : void 0);
  if (defaultAction && !actionNames.has(defaultAction) && !actionIds.has(defaultAction)) {
    addIssue(issues, {
      code: "default_action_missing",
      severity: "error",
      path: "defaultAction",
      message: `Default action ${defaultAction} is not declared.`,
      details: { action: defaultAction }
    });
  }
  validateRemoteAgents(project, issues);
  validateConnections(project, issues);
  validateConversationalSurface(project, actionIds, issues);
  validateChannels(project, actionIds, issues);
  validateSchedules(project, actionIds, issues);
  validateTools(project, actionIds, workflowNames, issues);
  validateVolumes(project, actionIds, issues);
  validateEvals(project, issues);
  validateEnvSecrets(project, issues);
  validateEditable(project, issues);
  validateInstructionsAndSkills(project, cwd, issues);
  validateSecretLeakage(project, issues);
  return validationResult(issues);
}
function validateEvals(project, issues) {
  const declaredArtifacts = new Set(
    (project.actions ?? []).flatMap((action) => action.outputArtifacts ?? [])
  );
  for (const evaluation of project.evals ?? []) {
    for (const artifact of evaluation.expectedArtifacts ?? []) {
      if (!declaredArtifacts.has(artifact)) addIssue(issues, {
        code: "eval_expected_artifact_not_declared",
        severity: "warning",
        path: `evals.${evaluation.name}.expectedArtifacts`,
        message: `Eval ${evaluation.name} expects artifact ${artifact}, but no action declares it.`,
        details: { eval: evaluation.name, artifact }
      });
    }
  }
}
function validateSourceOfTruth(project, cwd, issues) {
  const hasTypescriptConfig = pathExists(path3.join(cwd, DEFAULT_AGENT_CONFIG));
  const openPondManifestPath = path3.join(cwd, OPENPOND_MANIFEST);
  const hasOpenPondManifest = pathExists(openPondManifestPath);
  const hasAuthoredOpenPondManifest = hasOpenPondManifest && !isSynthesizedOpenPondYaml(openPondManifestPath);
  if (project.manifestMode !== "openpond-yaml" && !hasTypescriptConfig) addIssue(issues, {
    code: "agent_config_missing",
    severity: "error",
    path: DEFAULT_AGENT_CONFIG,
    source: { file: DEFAULT_AGENT_CONFIG },
    message: `${DEFAULT_AGENT_CONFIG} is missing.`
  });
  if (project.manifestMode === "openpond-yaml" && !hasOpenPondManifest) addIssue(issues, {
    code: "openpond_yaml_missing",
    severity: "error",
    path: OPENPOND_MANIFEST,
    source: { file: OPENPOND_MANIFEST },
    message: `${OPENPOND_MANIFEST} is missing.`
  });
  if (project.manifestMode === "typescript" && hasAuthoredOpenPondManifest) addIssue(issues, {
    code: "typescript_manifest_openpond_yaml_drift",
    severity: "error",
    path: OPENPOND_MANIFEST,
    source: { file: OPENPOND_MANIFEST },
    message: `${OPENPOND_MANIFEST} exists, but the TypeScript project does not explicitly extend it.`,
    details: { manifestMode: project.manifestMode }
  });
  if (project.manifestMode === "extends-openpond-yaml") {
    const extendsManifest = project.extendsManifest ?? OPENPOND_MANIFEST;
    if (!pathExists(path3.join(cwd, extendsManifest))) addIssue(issues, {
      code: "extends_manifest_missing",
      severity: "error",
      path: "extendsManifest",
      source: { file: extendsManifest },
      message: `Extended OpenPond manifest ${extendsManifest} is missing.`,
      details: { manifestMode: project.manifestMode, extendsManifest }
    });
  }
}
function isSynthesizedOpenPondYaml(filePath) {
  try {
    const source = readFileSync(filePath, "utf8");
    return source.startsWith(`${SYNTHESIZED_OPENPOND_YAML_SENTINEL}
`);
  } catch {
    return false;
  }
}
async function writeValidationReport(cwd, validation, artifactDir = ARTIFACT_DIR) {
  await writeText(cwd, path3.join(artifactDir, "validator-report.md"), formatValidationReport(validation));
}
function formatValidationReport(validation) {
  const lines = ["# OpenPond Agent Validation Report", ""];
  lines.push(`Schema: ${validation.schema}`, "");
  lines.push(`Status: ${validation.status}`, "");
  lines.push("## Summary", "");
  lines.push(`- Errors: ${validation.summary.errors}`);
  lines.push(`- Warnings: ${validation.summary.warnings}`);
  lines.push("", "## Errors", "");
  lines.push(...formatIssues(validation.issues.filter((issue) => issue.severity === "error")));
  lines.push("", "## Warnings", "");
  lines.push(...formatIssues(validation.issues.filter((issue) => issue.severity === "warning")));
  lines.push("");
  return lines.join("\n");
}
function validateActionTarget(action, workflowNames, agentIds, remoteAgentIds, toolNames, issues) {
  const id = actionId(action);
  if (action.target.kind === "workflow") {
    const name = workflowName(action.target.workflow);
    if (typeof action.target.workflow === "string" && !workflowNames.has(name)) {
      addIssue(issues, {
        code: "action_target_workflow_missing",
        severity: "error",
        path: `actions.${id}.target.workflow`,
        message: `Action ${id} targets missing workflow ${name}.`,
        details: { action: id, workflow: name }
      });
    }
  }
  if (action.target.kind === "local-agent") {
    const agentId = localAgentId(action.target.agent);
    if (typeof action.target.agent === "string" && !agentIds.has(agentId)) {
      addIssue(issues, {
        code: "action_target_agent_missing",
        severity: "error",
        path: `actions.${id}.target.agent`,
        message: `Action ${id} targets missing local agent ${agentId}.`,
        details: { action: id, agent: agentId }
      });
    }
  }
  if (action.target.kind === "remote-agent") {
    const targetRemoteAgentId = remoteAgentId(action.target.remoteAgent);
    if (typeof action.target.remoteAgent === "string" && !remoteAgentIds.has(targetRemoteAgentId)) {
      addIssue(issues, {
        code: "action_target_remote_agent_missing",
        severity: "error",
        path: `actions.${id}.target.remoteAgent`,
        message: `Action ${id} targets missing remote agent ${targetRemoteAgentId}.`,
        details: { action: id, remoteAgent: targetRemoteAgentId }
      });
    }
  }
  if (action.target.kind === "tool") {
    const targetToolName = toolName(action.target.tool);
    if (typeof action.target.tool === "string" && !toolNames.has(targetToolName)) {
      addIssue(issues, {
        code: "action_target_tool_missing",
        severity: "error",
        path: `actions.${id}.target.tool`,
        message: `Action ${id} targets missing tool ${targetToolName}.`,
        details: { action: id, tool: targetToolName }
      });
    }
  }
  if (action.target.kind === "intent-router" && typeof action.target.router !== "string") {
    validateRouter(id, action.target.router, issues);
  }
}
function validateActionExposure(action, issues) {
  const id = actionId(action);
  const isDirectAction = action.target.kind !== "chat" && action.target.kind !== "intent-router";
  if (isDirectAction && (action.visibility === "end_user" || action.mcp?.enabled) && !action.inputSchema) {
    addIssue(issues, {
      code: "action_direct_input_schema_missing",
      severity: action.mcp?.enabled ? "error" : "warning",
      path: `actions.${id}.inputSchema`,
      message: `Direct action ${id} should declare an input schema.`,
      details: { action: id }
    });
  }
  if (action.mcp?.enabled && !action.inputSchema) {
    addIssue(issues, {
      code: "mcp_export_input_schema_missing",
      severity: "error",
      path: `actions.${id}.mcp`,
      message: `MCP-exported action ${id} must declare an input schema.`,
      details: { action: id }
    });
  }
  if (action.mcp?.enabled && (action.visibility === "internal" || action.visibility === "debug")) {
    addIssue(issues, {
      code: "mcp_export_visibility_unsafe",
      severity: "error",
      path: `actions.${id}.mcp`,
      message: `MCP-exported action ${id} must not use ${action.visibility} visibility.`,
      details: { action: id, visibility: action.visibility }
    });
  }
}
function validateRouter(actionName, router, issues) {
  const intentNames = /* @__PURE__ */ new Set();
  for (const intent of router.intents) {
    if (intentNames.has(intent.name)) addIssue(issues, {
      code: "intent_duplicate",
      severity: "error",
      path: `actions.${actionName}.router.intents.${intent.name}`,
      message: `Action ${actionName} has duplicate router intent ${intent.name}.`,
      details: { action: actionName, intent: intent.name }
    });
    intentNames.add(intent.name);
  }
  if (!intentNames.has(router.defaultIntent.name)) {
    addIssue(issues, {
      code: "intent_default_missing",
      severity: "error",
      path: `actions.${actionName}.router.defaultIntent`,
      message: `Action ${actionName} default intent ${router.defaultIntent.name} is not listed in router intents.`,
      details: { action: actionName, intent: router.defaultIntent.name }
    });
  }
}
function validateChannels(project, actionIds, issues) {
  for (const channel of project.channels ?? []) {
    if (hasBusinessRoutingMetadata(channel)) {
      addIssue(issues, {
        code: "channel_business_routing_forbidden",
        severity: "error",
        path: `channels.${channel.id}`,
        message: `Channel ${channel.id} must not define business routing metadata. Route natural-language provider traffic through action chat.`,
        setupRequirement: { kind: "channel", name: channel.id, required: true },
        details: { channel: channel.id }
      });
    }
    if (!actionIds.has(channel.target.action)) {
      addIssue(issues, {
        code: "channel_target_action_missing",
        severity: "error",
        path: `channels.${channel.id}.target.action`,
        message: `Channel ${channel.id} targets missing action ${channel.target.action}.`,
        setupRequirement: { kind: "channel", name: channel.id, required: true },
        details: { channel: channel.id, action: channel.target.action }
      });
    }
    for (const connection of channel.requiredConnections ?? []) {
      const hasIntegration2 = (project.integrations ?? []).some((integration) => integration.provider === connection);
      if (!hasIntegration2) addIssue(issues, {
        code: "channel_missing_integration_requirement",
        severity: "warning",
        path: `channels.${channel.id}.requiredConnections`,
        message: `Channel ${channel.id} requires ${connection}, but no matching integration is declared.`,
        setupRequirement: { kind: "integration", name: connection, required: true },
        details: { channel: channel.id, integration: connection }
      });
    }
  }
}
function validateConversationalSurface(project, actionIds, issues) {
  const conversationalChannels = /* @__PURE__ */ new Set(["openpond_chat", "slack", "microsoft_teams", "mcp"]);
  const hasConversationalSurface = (project.channels ?? []).some((channel) => conversationalChannels.has(channel.id));
  if (hasConversationalSurface && !actionIds.has("chat")) {
    addIssue(issues, {
      code: "chat_action_required",
      severity: "error",
      path: "actions.chat",
      message: "Projects with conversational provider surfaces must declare a chat action.",
      details: { channels: (project.channels ?? []).map((channel) => channel.id) }
    });
  }
}
function validateRemoteAgents(project, issues) {
  const ids = /* @__PURE__ */ new Set();
  for (const agent of project.remoteAgents ?? []) {
    if (ids.has(agent.id)) addIssue(issues, {
      code: "remote_agent_duplicate",
      severity: "error",
      path: `remoteAgents.${agent.id}`,
      message: `Duplicate remote agent id: ${agent.id}`,
      details: { remoteAgent: agent.id }
    });
    ids.add(agent.id);
    if (!agent.projectId && !agent.agentId && !agent.url) {
      addIssue(issues, {
        code: "remote_agent_target_missing",
        severity: "error",
        path: `remoteAgents.${agent.id}`,
        message: `Remote agent ${agent.id} must declare projectId, agentId, or url.`,
        details: { remoteAgent: agent.id }
      });
    }
    if (agent.auth.policy !== "none" && !agent.auth.connectionId && !agent.auth.env && agent.auth.policy !== "openpond-service") {
      addIssue(issues, {
        code: "remote_agent_auth_gap",
        severity: "error",
        path: `remoteAgents.${agent.id}.auth`,
        message: `Remote agent ${agent.id} auth policy ${agent.auth.policy} requires a connectionId or env token reference.`,
        details: { remoteAgent: agent.id, policy: agent.auth.policy }
      });
    }
  }
}
function validateConnections(project, issues) {
  const ids = /* @__PURE__ */ new Set();
  for (const connection of project.connections ?? []) {
    if (ids.has(connection.id)) addIssue(issues, {
      code: "mcp_connection_duplicate",
      severity: "error",
      path: `connections.${connection.id}`,
      message: `Duplicate MCP client connection id: ${connection.id}`,
      details: { connection: connection.id }
    });
    ids.add(connection.id);
    if (!connection.serverUrl) addIssue(issues, {
      code: "mcp_connection_server_url_missing",
      severity: "warning",
      path: `connections.${connection.id}.serverUrl`,
      message: `MCP client connection ${connection.id} should declare a serverUrl for setup projection.`,
      setupRequirement: { kind: "connection", name: connection.id, required: true },
      details: { connection: connection.id }
    });
    if (!connection.tools?.allow?.length && !connection.tools?.block?.length) addIssue(issues, {
      code: "mcp_connection_tool_filter_missing",
      severity: "warning",
      path: `connections.${connection.id}.tools`,
      message: `MCP client connection ${connection.id} should declare allow or block tool filters.`,
      details: { connection: connection.id }
    });
  }
}
function validateSchedules(project, actionIds, issues) {
  for (const schedule of project.schedules ?? []) {
    if (!actionIds.has(schedule.target.action)) {
      addIssue(issues, {
        code: "schedule_target_action_missing",
        severity: "error",
        path: `schedules.${schedule.name}.target.action`,
        message: `Schedule ${schedule.name} targets missing action ${schedule.target.action}.`,
        setupRequirement: { kind: "schedule", name: schedule.name, required: true },
        details: { schedule: schedule.name, action: schedule.target.action }
      });
    }
  }
}
function validateTools(project, actionIds, workflowNames, issues) {
  for (const tool of project.tools ?? []) {
    if (!actionIds.has(tool.target.action)) addIssue(issues, {
      code: "tool_target_action_missing",
      severity: "error",
      path: `tools.${tool.name}.target.action`,
      message: `Tool ${tool.name} targets missing action ${tool.target.action}.`,
      details: { tool: tool.name, action: tool.target.action }
    });
    if (tool.target.workflow && !workflowNames.has(tool.target.workflow)) {
      addIssue(issues, {
        code: "tool_target_workflow_missing",
        severity: "error",
        path: `tools.${tool.name}.target.workflow`,
        message: `Tool ${tool.name} references missing workflow ${tool.target.workflow}.`,
        details: { tool: tool.name, workflow: tool.target.workflow }
      });
    }
  }
}
function validateVolumes(project, actionIds, issues) {
  for (const volume of project.volumes ?? []) {
    for (const actionName of volume.usedBy ?? []) {
      if (!actionIds.has(actionName)) addIssue(issues, {
        code: "volume_used_by_action_missing",
        severity: "warning",
        path: `volumes.${volume.name}.usedBy`,
        message: `Volume ${volume.name} is marked usedBy missing action ${actionName}.`,
        setupRequirement: { kind: "volume", name: volume.name, required: false },
        details: { volume: volume.name, action: actionName }
      });
    }
  }
}
function validateEnvSecrets(project, issues) {
  const names = /* @__PURE__ */ new Set();
  for (const envRef of project.env ?? []) {
    if (!envRef.name.trim()) addIssue(issues, {
      code: "env_name_required",
      severity: "error",
      path: "env.name",
      setupRequirement: { kind: "env", name: "", required: envRef.required ?? true },
      message: "Env/secret declaration requires a name."
    });
    if (names.has(envRef.name)) addIssue(issues, {
      code: "env_duplicate",
      severity: "error",
      path: `env.${envRef.name}`,
      setupRequirement: { kind: "env", name: envRef.name, required: envRef.required ?? true },
      message: `Duplicate env/secret declaration: ${envRef.name}`,
      details: { name: envRef.name }
    });
    names.add(envRef.name);
    if (hasInlineSecretValue(envRef)) addIssue(issues, {
      code: "env_secret_value_inline",
      severity: "error",
      path: `env.${envRef.name}`,
      setupRequirement: { kind: "env", name: envRef.name, required: envRef.required ?? true },
      message: `Env/secret ${envRef.name} appears to contain an inline value. Store values in OpenPond secret storage.`,
      details: { name: envRef.name }
    });
  }
}
function validateEditable(project, issues) {
  if (!project.editable?.enabled) return;
  if (project.editable.allowedPaths.length === 0) addIssue(issues, {
    code: "editable_allowed_paths_missing",
    severity: "error",
    path: "editable.allowedPaths",
    message: "Editable policy requires at least one allowed path."
  });
  if (project.editable.requiredChecks.length === 0) addIssue(issues, {
    code: "editable_required_checks_missing",
    severity: "warning",
    path: "editable.requiredChecks",
    message: "Editable policy has no required checks."
  });
}
function validateInstructionsAndSkills(project, cwd, issues) {
  const instructionSource = typeof project.instructions === "string" ? project.instructions : project.instructions?.markdown ?? project.instructions?.source;
  if (typeof instructionSource === "string") {
    validateSourcePath(cwd, instructionSource, "Instructions", "instructions", issues);
  }
  for (const skill of project.skills ?? []) {
    if (!skill.description?.trim()) addIssue(issues, {
      code: "skill_description_missing",
      severity: "warning",
      path: `skills.${skill.name}.description`,
      message: `Skill ${skill.name} should declare a description for routing.`,
      details: { skill: skill.name }
    });
    const skillSource = skill.markdown ?? skill.source;
    if (!skillSource) addIssue(issues, {
      code: "skill_source_missing",
      severity: "warning",
      path: `skills.${skill.name}.source`,
      message: `Skill ${skill.name} should declare markdown or source content.`,
      details: { skill: skill.name }
    });
    if (typeof skillSource === "string") {
      validateSourcePath(cwd, skillSource, `Skill ${skill.name}`, `skills.${skill.name}.source`, issues);
    }
    if (Object.keys(skill.files ?? {}).length > 50) {
      addIssue(issues, {
        code: "skill_generated_file_count_exceeded",
        severity: "warning",
        path: `skills.${skill.name}.files`,
        message: `Skill ${skill.name} declares more than 50 generated files.`,
        details: { skill: skill.name, limit: 50 }
      });
    }
    for (const relativePath of Object.keys(skill.files ?? {})) {
      if (!isSafeRelativePath(relativePath)) {
        addIssue(issues, {
          code: "skill_generated_file_path_invalid",
          severity: "warning",
          path: `skills.${skill.name}.files.${relativePath}`,
          message: `Skill ${skill.name} generated file path must stay inside the skill package: ${relativePath}`,
          details: { skill: skill.name, file: relativePath }
        });
      }
    }
  }
}
function validateSourcePath(cwd, source, label, issuePath, issues) {
  if (!source.startsWith("./")) return;
  const relativePath = source.slice(2);
  if (!pathExists(path3.join(cwd, relativePath))) addIssue(issues, {
    code: "source_file_missing",
    severity: "warning",
    path: issuePath,
    source: { file: relativePath },
    message: `${label} source ${source} does not exist.`,
    details: { source }
  });
}
function validateSecretLeakage(project, issues) {
  const suspiciousValues = findSuspiciousSecretValues(createAgentManifest(project));
  for (const valuePath of suspiciousValues) {
    addIssue(issues, {
      code: "secret_leakage_detected",
      severity: "error",
      path: valuePath,
      message: `Manifest appears to contain a raw secret value at ${valuePath}. Store secret values in OpenPond secret storage.`,
      details: { path: valuePath }
    });
  }
}
function validationResult(issues) {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    schemaVersion: SDK_SCHEMA_VERSION,
    schema: ARTIFACT_SCHEMAS.validatorReport,
    status: errors.length === 0 ? "passed" : "failed",
    summary: { errors: errors.length, warnings: warnings.length },
    issues,
    errors: errors.map((issue) => issue.message),
    warnings: warnings.map((issue) => issue.message)
  };
}
function addIssue(issues, input) {
  issues.push({ ...input, summary: input.summary ?? input.message });
}
function formatIssues(issues) {
  if (issues.length === 0) return ["- None"];
  return issues.map((issue) => {
    const pathSuffix = issue.path ? ` (${issue.path})` : "";
    return `- [${issue.code}] ${issue.message}${pathSuffix}`;
  });
}
function isSafeRelativePath(relativePath) {
  return relativePath.length > 0 && !path3.isAbsolute(relativePath) && !relativePath.split(/[\\/]+/).includes("..");
}
function hasInlineSecretValue(envRef) {
  return ["value", "defaultValue", "secretValue", "token", "password"].some(
    (key) => typeof envRef[key] === "string" && String(envRef[key]).length > 0
  );
}
function hasBusinessRoutingMetadata(channel) {
  return [
    "commands",
    "commandRoutes",
    "intents",
    "routing",
    "router",
    "actionMap",
    "actions",
    "businessRules"
  ].some((key) => key in channel);
}
function findSuspiciousSecretValues(value, currentPath = "manifest") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findSuspiciousSecretValues(entry, `${currentPath}.${index}`));
  }
  if (!value || typeof value !== "object") return [];
  const paths = [];
  for (const [key, entry] of Object.entries(value)) {
    const nextPath = `${currentPath}.${key}`;
    if (typeof entry === "string" && isSecretValueKey(key) && entry.trim().length > 0) {
      paths.push(nextPath);
      continue;
    }
    paths.push(...findSuspiciousSecretValues(entry, nextPath));
  }
  return paths;
}
function isSecretValueKey(key) {
  return /^(value|defaultValue|secretValue|token|password|apiKey|accessToken|refreshToken)$/i.test(key);
}
export {
  formatValidationReport,
  validateAgentProject,
  writeValidationReport
};
