import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/core/manifest.ts
import crypto from "node:crypto";
import path2 from "node:path";

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
function traceDir(artifactDir = ARTIFACT_DIR) {
  return path.join(artifactDir, TRACE_SUBDIR);
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
  const capabilities2 = CAPABILITIES[provider];
  const readCapabilityIds = capabilities2.filter((capability2) => capability2.access === "read").map((capability2) => capability2.id);
  const writeCapabilityIds = capabilities2.filter((capability2) => capability2.access === "write").map((capability2) => capability2.id);
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
  const capabilities2 = CAPABILITIES[provider].filter((item) => item.leaseable).map((item) => item.id);
  const leaseable = provider !== "mcp" && capabilities2.length > 0;
  return {
    leaseable,
    defaultTtlSeconds: leaseable ? 3600 : null,
    allowedCapabilityIds: capabilities2,
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

// src/core/files.ts
import { existsSync } from "node:fs";
function pathExists(filePath) {
  return existsSync(filePath);
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
function createInspect(project, cwd, artifactDir = ARTIFACT_DIR) {
  return {
    schemaVersion: SDK_SCHEMA_VERSION,
    schema: ARTIFACT_SCHEMAS.inspect,
    artifactSchemas: ARTIFACT_SCHEMAS,
    command: "openpond agent inspect --json",
    packageCommand: "openpond-agent inspect --json",
    sourceOfTruth: "agent-source",
    project: projectSummary(project),
    agent: {
      id: project.name,
      defaultAction: project.defaultAction ?? firstActionId(project),
      manifestHash: agentManifestHash(project)
    },
    actionCatalog: inspectActions(project),
    mcpExports: inspectActions(project).filter((entry) => entry.mcp.enabled),
    providerSupport: providerSupport(project),
    modelPolicy: project.model ?? defaultModelPolicy(),
    implementationRefs: implementationRefs(project),
    sourceLayout: sourceLayout(project, cwd),
    generatedArtifacts: generatedArtifacts(artifactDir),
    runtimeManifest: path2.join(ARTIFACT_DIR, "openpond-manifest.preview.yaml"),
    editable: project.editable ? { schema: ARTIFACT_SCHEMAS.editablePolicy, ...project.editable } : null,
    capabilities: capabilities(project),
    setup: setupProjection(project),
    inputSchema: project.inputSchema ?? null,
    inputSchemas: project.inputSchemas ?? {},
    validation: {
      declaredCommands: project.validation?.commands ?? [],
      requiredChecks: project.editable?.requiredChecks ?? []
    }
  };
}
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
function setupProjection(project) {
  return {
    channels: (project.channels ?? []).map((channel) => {
      const compiled = serializeChannel(project, channel);
      return {
        id: compiled.id,
        targetAction: compiled.targetAction,
        requiredConnections: compiled.requiredConnections,
        capabilities: compiled.capabilities,
        enabledByDefault: compiled.enabledByDefault,
        setupRequirements: compiled.setupRequirements,
        setupStatus: compiled.setupStatus
      };
    }),
    integrations: (project.integrations ?? []).map((integration) => ({
      schema: ARTIFACT_SCHEMAS.integration,
      provider: integration.provider,
      required: integration.required ?? false,
      capabilities: integration.capabilities ?? [],
      scopes: integration.scopes ?? []
    })),
    connections: (project.connections ?? []).map((connection) => ({
      schema: ARTIFACT_SCHEMAS.mcpClientConnection,
      id: connection.id,
      required: true,
      auth: connection.auth ?? { policy: "none" },
      toolFilters: connection.tools ?? {},
      setupStatus: connection.serverUrl ? "ready" : "missing_setup"
    })),
    envRefs: (project.env ?? []).map(serializeEnvRef),
    volumes: (project.volumes ?? []).map((volume) => ({
      schema: ARTIFACT_SCHEMAS.volume,
      name: volume.name,
      mountPath: volume.mountPath,
      provisioning: volume.provisioning,
      required: volume.provisioning.ui?.required ?? true
    })),
    schedules: (project.schedules ?? []).map((schedule) => ({
      schema: ARTIFACT_SCHEMAS.schedule,
      name: schedule.name,
      targetAction: schedule.target.action,
      enabledByDefault: schedule.enabledByDefault ?? false,
      setupStatus: schedule.enabledByDefault ? "enabled" : "disabled"
    }))
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
function providerSupport(project) {
  return (project.channels ?? []).map((channel) => {
    const compiled = serializeChannel(project, channel);
    return {
      id: compiled.id,
      setupStatus: compiled.setupStatus,
      setupRequirements: compiled.setupRequirements,
      capabilities: compiled.capabilities,
      enabledByDefault: compiled.enabledByDefault,
      responseRendering: compiled.adapter.renderResponse
    };
  });
}
function implementationRefs(project) {
  return {
    agents: (project.agents ?? []).map((agent) => ({
      id: agent.id,
      label: agent.label ?? null,
      description: agent.description ?? null
    })),
    remoteAgents: (project.remoteAgents ?? []).map((agent) => ({
      id: agent.id,
      description: agent.description,
      projectId: agent.projectId ?? null,
      agentId: agent.agentId ?? null,
      url: agent.url ?? null,
      trace: agent.trace ?? null
    })),
    workflows: (project.workflows ?? []).map((workflow) => ({
      id: workflow.name,
      description: workflow.description ?? null
    })),
    tools: (project.tools ?? []).map((tool) => ({
      id: tool.name,
      description: tool.description,
      visibility: tool.visibility
    })),
    connections: (project.connections ?? []).map((connection) => ({
      id: connection.id,
      description: connection.description ?? null,
      traceNamespace: connection.traceNamespace ?? connection.id
    }))
  };
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
function agentManifestHash(project) {
  return crypto.createHash("sha256").update(JSON.stringify(createAgentManifest(project))).digest("hex");
}
function sourceLayout(project, cwd) {
  const agentConfig = project.manifestMode === "openpond-yaml" ? OPENPOND_MANIFEST : DEFAULT_AGENT_CONFIG;
  return {
    root: ".",
    agentConfig,
    manifestMode: project.manifestMode,
    extendsManifest: project.extendsManifest ?? null,
    openpondYaml: optionalPath(cwd, OPENPOND_MANIFEST),
    actions: optionalPath(cwd, "agent/actions"),
    legacyActions: optionalPath(cwd, "agent/actions.ts"),
    agents: optionalPath(cwd, "agent/agents"),
    remoteAgents: optionalPath(cwd, "agent/remote-agents"),
    connections: optionalPath(cwd, "agent/connections"),
    editable: optionalPath(cwd, "agent/editable.ts"),
    workflows: optionalPath(cwd, "agent/workflows"),
    channels: optionalPath(cwd, "agent/channels"),
    tools: optionalPath(cwd, "agent/tools"),
    evals: optionalPath(cwd, "agent/evals"),
    volumes: optionalPath(cwd, "agent/volumes.ts"),
    integrations: optionalPath(cwd, "agent/integrations.ts"),
    schedules: optionalPath(cwd, "agent/schedules")
  };
}
function generatedArtifacts(artifactDir = ARTIFACT_DIR) {
  return {
    inspectJson: path2.join(artifactDir, "agent-inspect.json"),
    agentManifestJson: path2.join(artifactDir, "agent-manifest.json"),
    actionRegistryJson: path2.join(artifactDir, "action-registry.json"),
    runtimeManifestPreviewYaml: path2.join(artifactDir, "openpond-manifest.preview.yaml"),
    validatorReport: path2.join(artifactDir, "validator-report.md"),
    evalResultsJson: path2.join(artifactDir, "eval-results.json"),
    traces: traceDir(artifactDir)
  };
}
function capabilities(project) {
  return {
    actions: project.actions.map((action) => actionId(action)),
    agents: (project.agents ?? []).map((agent) => agent.id),
    remoteAgents: (project.remoteAgents ?? []).map((agent) => agent.id),
    connections: (project.connections ?? []).map((connection) => connection.id),
    channels: (project.channels ?? []).map((channel) => channel.id),
    tools: (project.tools ?? []).map((tool) => tool.name),
    workflows: (project.workflows ?? []).map((workflow) => workflow.name),
    schedules: (project.schedules ?? []).map((schedule) => schedule.name),
    evals: (project.evals ?? []).map((evaluation) => evaluation.name),
    volumes: (project.volumes ?? []).map((volume) => volume.name),
    env: (project.env ?? []).map((envRef) => envRef.name),
    integrations: (project.integrations ?? []).map((integration) => integration.provider)
  };
}
function optionalPath(cwd, relativePath) {
  return pathExists(path2.join(cwd, relativePath)) ? relativePath : null;
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
export {
  createInspect
};
