import { readFile } from "node:fs/promises";

import {
  action,
  defineAgentProject,
  defineEval,
  defineInstructions,
  defineIntegration,
  editable,
} from "openpond-agent-sdk";

import {
  normalizeRecentHyperliquidTrades,
  RECENT_HYPERLIQUID_TRADES_CAPABILITY,
} from "../src/capability.js";
import {
  buildTradeReviewReport,
  renderTradeReviewMarkdown,
} from "../src/review.js";
import {
  tradeReviewerInputSchemas,
  tradeReviewerProjectInputSchema,
} from "./schemas.js";
import {
  getRecentHyperliquidTradesWorkflow,
  generateTradeIdeaWorkflow,
  reviewRecentHyperliquidTradesWorkflow,
} from "./workflows.js";

const duckyHyperliquidFills = defineIntegration({
  provider: "ducky-capital",
  required: true,
  capabilities: [RECENT_HYPERLIQUID_TRADES_CAPABILITY],
});

const integrationSetup = [
  {
    kind: "integration" as const,
    name: "ducky-capital",
    required: true,
    description: "A run-bound Ducky recent-trade capability lease.",
  },
];

const actions = [
  action("get-recent-hyperliquid-trades", {
    label: "Get recent Hyperliquid trades",
    description: "Read a fresh bounded window of normalized, owner-bound Hyperliquid fills.",
    target: { kind: "workflow", workflow: getRecentHyperliquidTradesWorkflow },
    visibility: "end_user",
    timeoutSeconds: 120,
    inputSchema: "GetRecentHyperliquidTradesInput",
    outputArtifacts: ["artifacts/recent-hyperliquid-trades.json"],
    approval: { mode: "never", reason: "Read-only owner-bound Hyperliquid fill query." },
    setup: integrationSetup,
    mcp: { enabled: false },
    schedule: { enabled: false, allowAdHoc: true },
  }),
  action("review-recent-hyperliquid-trades", {
    label: "Review recent Hyperliquid trades",
    description: "Read and review recent owner-bound Hyperliquid fills with explicit evidence and data-quality limits.",
    target: { kind: "workflow", workflow: reviewRecentHyperliquidTradesWorkflow },
    visibility: "end_user",
    timeoutSeconds: 300,
    inputSchema: "ReviewRecentHyperliquidTradesInput",
    outputArtifacts: [
      "artifacts/recent-hyperliquid-trades.json",
      "artifacts/hyperliquid-trade-review.json",
      "artifacts/hyperliquid-trade-review.md",
    ],
    approval: { mode: "never", reason: "Read-only review with no trading side effect." },
    setup: integrationSetup,
    mcp: { enabled: false },
    schedule: { enabled: true, allowAdHoc: true },
    model: {
      provider: "openpond-managed",
      required: true,
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  }),
  action("generate-trade-idea", {
    label: "Generate trade idea",
    description: "Use a fresh owner-bound fill window and supplied market context to create a non-executing trade idea.",
    target: { kind: "workflow", workflow: generateTradeIdeaWorkflow },
    visibility: "end_user",
    timeoutSeconds: 300,
    inputSchema: "GenerateTradeIdeaInput",
    outputArtifacts: [
      "artifacts/recent-hyperliquid-trades.json",
      "artifacts/hyperliquid-trade-idea.json",
      "artifacts/hyperliquid-trade-idea.md",
    ],
    approval: { mode: "never", reason: "Read-only research output with no signing or order placement." },
    setup: integrationSetup,
    mcp: { enabled: false },
    schedule: { enabled: false, allowAdHoc: true },
    model: {
      provider: "openpond-managed",
      required: true,
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  }),
] as const;

const noTradesEval = defineEval({
  name: "no-trades-is-a-successful-review",
  description: "An empty window produces a bounded successful report without invented findings.",
  fixtures: ["fixtures/no-trades.json"],
  publishGate: true,
  async run() {
    const recent = await loadFixture("no-trades.json");
    const report = buildTradeReviewReport(recent);
    const markdown = renderTradeReviewMarkdown(report);
    assert(report.summary.tradeCount === 0, "expected an empty report");
    assert(markdown.includes("No Hyperliquid fills"), "missing empty-window explanation");
    assert(!markdown.includes("rapid opposite-side"), "invented reversal finding");
  },
});

const evidenceEval = defineEval({
  name: "review-is-bounded-by-supported-evidence",
  description: "The report identifies observed reversals, fees, and reported fill PnL without adding identity data.",
  fixtures: ["fixtures/reversal-and-fees.json"],
  publishGate: true,
  async run() {
    const recent = await loadFixture("reversal-and-fees.json");
    const report = buildTradeReviewReport(recent);
    const serialized = JSON.stringify(report);
    assert(report.summary.totalClosedPnl === 0.75, "reported closed PnL mismatch");
    assert(report.observations.some((item) => item.includes("rapid opposite-side")), "missing reversal observation");
    assert(report.observations.some((item) => item.includes("Recorded fees")), "missing fee observation");
    assert(!serialized.includes("walletAddress"), "wallet identity crossed the report boundary");
    assert(!serialized.includes("teamId"), "Team identity crossed the report boundary");
  },
});

export default defineAgentProject({
  name: "hyperliquid-trade-reviewer",
  version: "0.1.0",
  useCase: "read-only-hyperliquid-trade-review",
  description: "Read a fresh window of owner-bound Hyperliquid fills and produce a bounded evidence-based review.",
  manifestMode: "typescript",
  runtime: { base: "node-bun-workspace" },
  instructions: defineInstructions("./agent/instructions.md"),
  integrations: [duckyHyperliquidFills],
  inputSchema: tradeReviewerProjectInputSchema,
  inputSchemas: tradeReviewerInputSchemas,
  defaultAction: "review-recent-hyperliquid-trades",
  actions: [...actions],
  workflows: [
    getRecentHyperliquidTradesWorkflow,
    reviewRecentHyperliquidTradesWorkflow,
    generateTradeIdeaWorkflow,
  ],
  editable: editable({
    enabled: true,
    sourceOfTruth: "agent-source",
    policyDiscovery: {
      command: "bun run agent:inspect",
      runAfter: "source-materialized",
    },
    allowedPaths: [
      "agent/**",
      "src/**",
      "fixtures/**",
      "test/**",
      "package.json",
      "tsconfig.json",
    ],
    requiredChecks: [
      "bun run typecheck",
      "bun run test",
      "bun run agent:build",
      "bun run agent:validate",
      "bun run agent:eval",
    ],
    defaultResultMode: "patch_only",
  }),
  evals: [noTradesEval, evidenceEval],
});

async function loadFixture(name: string) {
  const raw = await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8");
  return normalizeRecentHyperliquidTrades(JSON.parse(raw));
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
