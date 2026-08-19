import {
  action,
  defineAgentProject,
  defineChannel,
  defineEval,
  defineInstructions,
  editable,
  secret,
} from "openpond-agent-sdk";

import { relayInputSchemas, relayProjectInputSchema } from "./schemas.js";
import {
  broadcastRelayStepWorkflow,
  quoteRelayTransferWorkflow,
  relayChatRouter,
  relayChatWorkflow,
  relayTransferStatusWorkflow,
  reviewRelayQuoteWorkflow,
} from "./workflows.js";

const actions = [
  action("chat", {
    description: "Explain the Relay Cross-Chain Operator's explicit actions.",
    target: { kind: "intent-router", router: relayChatRouter },
    visibility: "default",
    timeoutSeconds: 60,
    approval: { mode: "never", reason: "Read-only action discovery." },
  }),
  action("quote-relay-transfer", {
    description: "Request an unsigned exact-input EVM cross-chain quote through the Relay SDK.",
    target: { kind: "workflow", workflow: quoteRelayTransferWorkflow },
    visibility: "end_user",
    timeoutSeconds: 180,
    inputSchema: "RelayQuoteInput",
    outputArtifacts: ["artifacts/relay-quote.json"],
    approval: { mode: "never", reason: "Read-only quote request without a wallet." },
  }),
  action("review-relay-quote", {
    description: "Verify and summarize a quote's hash, fees, steps, request IDs, and expiry.",
    target: { kind: "workflow", workflow: reviewRelayQuoteWorkflow },
    visibility: "end_user",
    timeoutSeconds: 60,
    inputSchema: "RelayReviewInput",
    outputArtifacts: ["artifacts/relay-quote-review.json"],
    approval: { mode: "never", reason: "Pure validation of a supplied quote artifact." },
  }),
  action("relay-transfer-status", {
    description: "Read cross-chain lifecycle state from Relay's status endpoint.",
    target: { kind: "workflow", workflow: relayTransferStatusWorkflow },
    visibility: "end_user",
    timeoutSeconds: 120,
    inputSchema: "RelayStatusInput",
    outputArtifacts: ["artifacts/relay-status.json"],
    approval: { mode: "never", reason: "Read-only Relay API request." },
  }),
  action("broadcast-relay-step", {
    description: "Verify, simulate, and broadcast one externally signed exact-match Relay transaction step.",
    target: { kind: "workflow", workflow: broadcastRelayStepWorkflow },
    visibility: "end_user",
    timeoutSeconds: 600,
    inputSchema: "RelayBroadcastInput",
    outputArtifacts: ["artifacts/relay-step-receipt.json"],
    approval: { mode: "always", reason: "Broadcasts a signed onchain transaction." },
    mcp: { enabled: false },
    schedule: { enabled: false, allowAdHoc: false },
  }),
] as const;

const chatEval = defineEval({
  name: "relay-chat-has-no-write-side-effect",
  description: "The default action explains explicit actions without touching Relay or a chain.",
  publishGate: true,
  async run(t) {
    await t.send({ prompt: "Bridge assets.", channel: "openpond_chat" });
    t.expectIntent("relay_help");
    t.expectTextIncludes("never quotes, signs, or broadcasts");
  },
});

export default defineAgentProject({
  name: "relay-cross-chain-operator",
  version: "0.1.0",
  useCase: "relay-cross-chain-routing-and-guarded-broadcast",
  description: "Quote Relay routes, review each cross-chain step, broadcast exact signed EVM steps, and monitor destination completion.",
  manifestMode: "typescript",
  runtime: { base: "node-bun-workspace" },
  instructions: defineInstructions("./agent/instructions.md"),
  env: [
    secret.env("RELAY_API_KEY", {
      required: false,
      description: "Optional server-side Relay API key stored in OpenPond secret storage.",
    }),
  ],
  setup: { commands: ["pnpm install --frozen-lockfile"] },
  validation: {
    commands: [
      "node -e \"import('@relayprotocol/relay-sdk')\"",
      "node -e \"import('viem')\"",
    ],
  },
  inputSchema: relayProjectInputSchema,
  inputSchemas: relayInputSchemas,
  defaultAction: "chat",
  actions: [...actions],
  workflows: [
    relayChatWorkflow,
    quoteRelayTransferWorkflow,
    reviewRelayQuoteWorkflow,
    relayTransferStatusWorkflow,
    broadcastRelayStepWorkflow,
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
  evals: [chatEval],
});
