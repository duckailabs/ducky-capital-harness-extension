import { mkdir, writeFile } from "node:fs/promises";

import { defineWorkflow } from "openpond-agent-sdk";

import {
  normalizeTradeReviewInput,
  readRecentHyperliquidTrades,
} from "../src/capability.js";
import {
  buildTradeReviewReport,
  renderTradeReviewMarkdown,
} from "../src/review.js";

const RECENT_TRADES_ARTIFACT = "artifacts/recent-hyperliquid-trades.json";
const REVIEW_JSON_ARTIFACT = "artifacts/hyperliquid-trade-review.json";
const REVIEW_MARKDOWN_ARTIFACT = "artifacts/hyperliquid-trade-review.md";

export const getRecentHyperliquidTradesWorkflow = defineWorkflow({
  name: "get-recent-hyperliquid-trades",
  description: "Read a fresh owner-bound window of normalized Hyperliquid fills.",
  async run(ctx, rawInput) {
    const input = normalizeTradeReviewInput(rawInput);
    const recent = await ctx.tool("ducky.hyperliquid.read_recent_fills", () =>
      readRecentHyperliquidTrades(input),
    );
    await writeArtifact(RECENT_TRADES_ARTIFACT, JSON.stringify(recent, null, 2));
    ctx.trace.event("hyperliquid.trades.read", {
      lookbackHours: input.lookbackHours,
      environment: input.environment ?? "all",
      tradeCount: recent.tradeCount,
      coverage: recent.coverage,
      truncated: recent.truncated,
    });
    ctx.trace.artifact(RECENT_TRADES_ARTIFACT, {
      tradeCount: recent.tradeCount,
      coverage: recent.coverage,
      truncated: recent.truncated,
    });
    return {
      text: recent.empty
        ? "No Hyperliquid fills were found in the requested window."
        : `Read ${recent.tradeCount} owner-bound Hyperliquid fill${recent.tradeCount === 1 ? "" : "s"}.`,
      intent: "get_recent_hyperliquid_trades",
      artifactRefs: [RECENT_TRADES_ARTIFACT],
      metadata: { recent },
    };
  },
});

export const reviewRecentHyperliquidTradesWorkflow = defineWorkflow({
  name: "review-recent-hyperliquid-trades",
  description: "Read a fresh trade window and produce a bounded evidence-based review.",
  async run(ctx, rawInput) {
    const input = normalizeTradeReviewInput(rawInput);
    const recent = await ctx.action("get-recent-hyperliquid-trades", () =>
      readRecentHyperliquidTrades(input),
    );
    const report = buildTradeReviewReport(recent);
    const markdown = await ctx.model("format-hyperliquid-trade-review", async () =>
      renderTradeReviewMarkdown(report),
    );
    await Promise.all([
      writeArtifact(RECENT_TRADES_ARTIFACT, JSON.stringify(recent, null, 2)),
      writeArtifact(REVIEW_JSON_ARTIFACT, JSON.stringify(report, null, 2)),
      writeArtifact(REVIEW_MARKDOWN_ARTIFACT, markdown),
    ]);
    ctx.trace.event("hyperliquid.trade-review.completed", {
      lookbackHours: input.lookbackHours,
      environment: recent.environment,
      tradeCount: recent.tradeCount,
      coverage: recent.coverage,
      truncated: recent.truncated,
      dataQualityWarningCount: recent.dataQuality.warnings.length,
    });
    ctx.trace.artifact(REVIEW_JSON_ARTIFACT, {
      tradeCount: recent.tradeCount,
      coverage: recent.coverage,
    });
    ctx.trace.artifact(REVIEW_MARKDOWN_ARTIFACT, {
      tradeCount: recent.tradeCount,
      coverage: recent.coverage,
    });
    return {
      text: markdown,
      intent: "review_recent_hyperliquid_trades",
      artifactRefs: [
        RECENT_TRADES_ARTIFACT,
        REVIEW_JSON_ARTIFACT,
        REVIEW_MARKDOWN_ARTIFACT,
      ],
      metadata: { report },
    };
  },
});

async function writeArtifact(path: string, contents: string): Promise<void> {
  await mkdir("artifacts", { recursive: true });
  await writeFile(path, contents, "utf8");
}
