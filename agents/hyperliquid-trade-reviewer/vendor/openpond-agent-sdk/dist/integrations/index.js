import { createRequire as __openpondCreateRequire } from "node:module"; var require = __openpondCreateRequire(import.meta.url);

// src/index.ts
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
function connectedAppById(appId) {
  const normalized = normalizeConnectedAppId(appId);
  if (!normalized)
    return null;
  return CONNECTED_APP_CATALOG.find((app) => app.id === normalized) ?? null;
}
function connectedAppBundleByProvider(provider) {
  const normalized = normalizeConnectedAppProviderFamilyId(provider);
  if (!normalized)
    return null;
  return CONNECTED_APP_BUNDLES.find((bundle) => bundle.id === normalized) ?? null;
}
function normalizeConnectedAppId(value) {
  const normalized = value?.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (!normalized)
    return null;
  if (normalized === "teams" || normalized === "microsoft")
    return "microsoft_teams";
  return CONNECTED_APP_CATALOG.some((app) => app.id === normalized) ? normalized : null;
}
function normalizeConnectedAppProviderFamilyId(value) {
  const normalized = value?.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (!normalized)
    return null;
  if (normalized === "teams" || normalized === "microsoft") {
    return "microsoft_teams";
  }
  if (CONNECTED_APP_PROVIDER_ORDER.includes(normalized)) {
    return normalized;
  }
  const app = connectedAppById(normalized);
  return app?.providerFamily ?? null;
}
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

// src/core/connected-integrations.ts
var CONNECTED_INTEGRATION_PROVIDERS = [
  "google",
  "github",
  "x"
];
function connectedIntegrationCatalog() {
  return CONNECTED_APP_BUNDLES.filter((bundle) => isConnectedIntegrationProvider(bundle.id)).map((bundle) => ({
    provider: bundle.id,
    label: bundle.label,
    description: bundle.description,
    capabilityIds: bundle.capabilities.filter((capability2) => capability2.leaseable).map((capability2) => capability2.id),
    defaultLeaseCapabilityIds: bundle.leasePolicy.allowedCapabilityIds,
    defaultTtlSeconds: bundle.leasePolicy.defaultTtlSeconds
  }));
}
function connectedIntegrationCapabilityIds(provider) {
  const normalized = normalizeConnectedIntegrationProvider(provider);
  if (!normalized) return [];
  const bundle = connectedAppBundleByProvider(normalized);
  return bundle?.capabilities.filter((capability2) => capability2.leaseable).map((capability2) => capability2.id) ?? [];
}
function connectedIntegrationDefaultCapabilityIds(provider) {
  const normalized = normalizeConnectedIntegrationProvider(provider);
  if (!normalized) return [];
  return connectedAppBundleByProvider(normalized)?.leasePolicy.allowedCapabilityIds ?? [];
}
function isConnectedIntegrationProvider(provider) {
  return normalizeConnectedIntegrationProvider(provider) !== null;
}
function normalizeConnectedIntegrationProvider(provider) {
  const normalized = normalizeConnectedAppProviderFamilyId(provider);
  if (!normalized || normalized === "mcp") return null;
  return CONNECTED_INTEGRATION_PROVIDERS.includes(normalized) ? normalized : null;
}
function defineConnectedIntegration(provider, definition = {}) {
  const normalized = normalizeConnectedIntegrationProvider(provider);
  if (!normalized) throw new Error(`Unsupported connected integration provider: ${provider}`);
  const capabilities = Array.isArray(definition.capabilities) ? definition.capabilities : [];
  const allowedCapabilityIds = new Set(connectedIntegrationCapabilityIds(normalized));
  const invalidCapability = capabilities.find((capabilityId) => !allowedCapabilityIds.has(capabilityId));
  if (invalidCapability) {
    throw new Error(`Capability ${invalidCapability} is not declared by ${normalized}.`);
  }
  return {
    provider: normalized,
    setupSurface: "oauth_connector",
    ...definition,
    capabilities
  };
}

// src/integrations/index.ts
var integration2 = {
  ...integration,
  google(definition = {}) {
    return defineConnectedIntegration("google", definition);
  },
  github(definition = {}) {
    return defineConnectedIntegration("github", definition);
  },
  x(definition = {}) {
    return defineConnectedIntegration("x", definition);
  }
};
var connectedIntegration = {
  providers: CONNECTED_INTEGRATION_PROVIDERS,
  catalog: connectedIntegrationCatalog,
  capabilityIds: connectedIntegrationCapabilityIds,
  defaultCapabilityIds: connectedIntegrationDefaultCapabilityIds,
  isProvider: isConnectedIntegrationProvider,
  normalizeProvider: normalizeConnectedIntegrationProvider,
  define: defineConnectedIntegration,
  google: integration2.google,
  github: integration2.github,
  x: integration2.x
};
export {
  CONNECTED_INTEGRATION_PROVIDERS,
  connectedIntegration,
  connectedIntegrationCapabilityIds,
  connectedIntegrationCatalog,
  connectedIntegrationDefaultCapabilityIds,
  defineConnectedIntegration,
  defineEnvSecret,
  defineIntegration,
  env,
  integration2 as integration,
  isConnectedIntegrationProvider,
  normalizeConnectedIntegrationProvider,
  secret
};
