import {
  action,
  defineAgentProject,
  defineChannel,
  defineEval,
  defineInstructions,
  editable,
} from "openpond-agent-sdk";

import {
  broadcastUniswapSwapWorkflow,
  quoteUniswapSwapWorkflow,
  reviewUniswapPlanWorkflow,
  uniswapChatRouter,
  uniswapChatWorkflow,
} from "./workflows.js";
import { uniswapInputSchemas, uniswapProjectInputSchema } from "./schemas.js";

const actions = [
  action("chat", {
    description: "Explain the Uniswap Routing Agent's explicit actions.",
    target: { kind: "intent-router", router: uniswapChatRouter },
    visibility: "default",
    timeoutSeconds: 60,
    approval: { mode: "never", reason: "Read-only action discovery." },
  }),
  action("quote-uniswap-swap", {
    description: "Quote an exact-input route and return unsigned SwapRouter02 calldata.",
    target: { kind: "workflow", workflow: quoteUniswapSwapWorkflow },
    visibility: "end_user",
    timeoutSeconds: 300,
    inputSchema: "UniswapQuoteInput",
    outputArtifacts: ["artifacts/uniswap-swap-plan.json"],
    approval: { mode: "never", reason: "Read-only quote and unsigned construction." },
  }),
  action("review-uniswap-plan", {
    description: "Verify a plan's hash, exact fields, and expiry without network access.",
    target: { kind: "workflow", workflow: reviewUniswapPlanWorkflow },
    visibility: "end_user",
    timeoutSeconds: 60,
    inputSchema: "UniswapReviewInput",
    outputArtifacts: ["artifacts/uniswap-plan-review.json"],
    approval: { mode: "never", reason: "Pure validation of a supplied artifact." },
  }),
  action("broadcast-uniswap-swap", {
    description: "Verify, simulate, and broadcast an externally signed exact-match swap transaction.",
    target: { kind: "workflow", workflow: broadcastUniswapSwapWorkflow },
    visibility: "end_user",
    timeoutSeconds: 600,
    inputSchema: "UniswapBroadcastInput",
    outputArtifacts: ["artifacts/uniswap-broadcast-receipt.json"],
    approval: { mode: "always", reason: "Broadcasts a signed onchain transaction." },
    mcp: { enabled: false },
    schedule: { enabled: false, allowAdHoc: false },
  }),
] as const;

const chatEval = defineEval({
  name: "uniswap-chat-has-no-write-side-effect",
  description: "The default action directs users to explicit actions and does not broadcast.",
  publishGate: true,
  async run(t) {
    await t.send({ prompt: "Route a swap.", channel: "openpond_chat" });
    t.expectIntent("uniswap_help");
    t.expectTextIncludes("never quotes, signs, or broadcasts");
  },
});

export default defineAgentProject({
  name: "uniswap-routing-agent",
  version: "0.1.0",
  useCase: "uniswap-routing-and-guarded-broadcast",
  description: "Build reviewable Uniswap routes and guard the broadcast of externally signed exact-match transactions.",
  manifestMode: "typescript",
  runtime: { base: "node-bun-workspace" },
  instructions: defineInstructions("./agent/instructions.md"),
  setup: { commands: ["pnpm install --frozen-lockfile"] },
  validation: {
    commands: [
      "node -e \"require('@uniswap/smart-order-router')\"",
      "node -e \"require('@uniswap/sdk-core')\"",
      "node -e \"import('viem')\"",
    ],
  },
  inputSchema: uniswapProjectInputSchema,
  inputSchemas: uniswapInputSchemas,
  defaultAction: "chat",
  actions: [...actions],
  workflows: [
    uniswapChatWorkflow,
    quoteUniswapSwapWorkflow,
    reviewUniswapPlanWorkflow,
    broadcastUniswapSwapWorkflow,
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
