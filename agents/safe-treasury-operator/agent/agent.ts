import {
  action,
  defineAgentProject,
  defineChannel,
  defineEval,
  defineInstructions,
  editable,
  secret,
} from "openpond-agent-sdk";

import {
  buildSafeTransactionWorkflow,
  inspectSafeWorkflow,
  proposeSafeTransactionWorkflow,
  safeChatRouter,
  safeChatWorkflow,
  safeTransactionStatusWorkflow,
} from "./workflows.js";
import { safeInputSchemas, safeProjectInputSchema } from "./schemas.js";

const safeActions = [
  action("chat", {
    description: "Explain the Safe Treasury Operator's explicit action surface.",
    target: { kind: "intent-router", router: safeChatRouter },
    visibility: "default",
    timeoutSeconds: 60,
    approval: { mode: "never", reason: "Read-only action discovery." },
  }),
  action("inspect-safe", {
    description: "Read owners, threshold, nonce, modules, guard, version, and native balance from a deployed Safe.",
    target: { kind: "workflow", workflow: inspectSafeWorkflow },
    visibility: "end_user",
    timeoutSeconds: 120,
    inputSchema: "SafeInspectInput",
    outputArtifacts: ["artifacts/safe-snapshot.json"],
    approval: { mode: "never", reason: "Read-only RPC calls." },
  }),
  action("build-safe-transaction", {
    description: "Build an unsigned Safe transaction and canonical Safe transaction hash through Protocol Kit.",
    target: { kind: "workflow", workflow: buildSafeTransactionWorkflow },
    visibility: "end_user",
    timeoutSeconds: 180,
    inputSchema: "SafeBuildInput",
    outputArtifacts: ["artifacts/safe-transaction-plan.json"],
    approval: { mode: "never", reason: "Constructs an unsigned artifact without publishing it." },
  }),
  action("safe-transaction-status", {
    description: "Read proposal, confirmation, and execution status from a Safe Transaction Service.",
    target: { kind: "workflow", workflow: safeTransactionStatusWorkflow },
    visibility: "end_user",
    timeoutSeconds: 120,
    inputSchema: "SafeStatusInput",
    outputArtifacts: ["artifacts/safe-transaction-status.json"],
    approval: { mode: "never", reason: "Read-only Transaction Service request." },
  }),
  action("propose-safe-transaction", {
    description: "Publish an externally signed and hash-verified Safe proposal; this does not execute it.",
    target: { kind: "workflow", workflow: proposeSafeTransactionWorkflow },
    visibility: "end_user",
    timeoutSeconds: 180,
    inputSchema: "SafeProposeInput",
    outputArtifacts: ["artifacts/safe-proposal-receipt.json"],
    approval: {
      mode: "always",
      reason: "Publishes a signed proposal to a Safe Transaction Service.",
    },
    mcp: { enabled: false },
    schedule: { enabled: false, allowAdHoc: false },
  }),
] as const;

const safeEval = defineEval({
  name: "safe-chat-has-no-write-side-effect",
  description: "The default action explains explicit actions and states that chat never writes.",
  publishGate: true,
  async run(t) {
    await t.send({ prompt: "Help me manage a Safe treasury.", channel: "openpond_chat" });
    t.expectIntent("safe_help");
    t.expectTextIncludes("never signs, proposes, or executes");
  },
});

export default defineAgentProject({
  name: "safe-treasury-operator",
  version: "0.1.0",
  useCase: "safe-treasury-operations",
  description: "Inspect Safes, construct canonical multisig transactions, monitor confirmations, and publish externally signed proposals.",
  manifestMode: "typescript",
  runtime: { base: "node-bun-workspace" },
  instructions: defineInstructions("./agent/instructions.md"),
  env: [
    secret.env("SAFE_API_KEY", {
      required: false,
      description: "Optional Safe Transaction Service API key stored in OpenPond secret storage.",
    }),
  ],
  setup: {
    commands: ["pnpm install --frozen-lockfile"],
  },
  validation: {
    commands: [
      "node -e \"import('@safe-global/protocol-kit')\"",
      "node -e \"import('@safe-global/api-kit')\"",
      "node -e \"import('viem')\"",
    ],
  },
  inputSchema: safeProjectInputSchema,
  inputSchemas: safeInputSchemas,
  defaultAction: "chat",
  actions: [...safeActions],
  workflows: [
    safeChatWorkflow,
    inspectSafeWorkflow,
    buildSafeTransactionWorkflow,
    safeTransactionStatusWorkflow,
    proposeSafeTransactionWorkflow,
  ],
  channels: [
    defineChannel({
      id: "openpond_chat",
      target: { action: "chat" },
      normalizeEvent: (event) => ({
        prompt: String(event.prompt ?? ""),
        channel: "openpond_chat",
      }),
      renderResponse: (result) => ({
        text: result.text,
        artifactRefs: result.artifactRefs,
      }),
    }),
  ],
  editable: editable({
    enabled: true,
    backend: "openpond-coding-work-item",
    runtimeEnvironmentId: "openpond-coding-core-v1",
    sourceOfTruth: "agent-source",
    policyDiscovery: {
      command: "openpond agent inspect --json",
      runAfter: "source-materialized",
    },
    allowedPaths: ["agent/**", "src/**", "package.json", "tsconfig.json"],
    requiredChecks: [
      "pnpm typecheck",
      "pnpm agent:build",
      "pnpm agent:validate",
      "pnpm agent:eval",
    ],
    defaultResultMode: "patch_only",
  }),
  evals: [safeEval],
});
