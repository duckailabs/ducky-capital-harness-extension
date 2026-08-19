import type {
  NormalizedHyperliquidTrade,
  RecentHyperliquidTrades,
} from "./capability.js";

export type TradeReviewReport = {
  schema: "ducky.hyperliquid.trade-review.v1";
  generatedAt: string;
  window: {
    start: string;
    end: string;
    environment: "mainnet" | "testnet" | "all";
    coverage: "hyperliquid_direct";
  };
  dataQuality: RecentHyperliquidTrades["dataQuality"] & { truncated: boolean };
  summary: {
    tradeCount: number;
    symbols: string[];
    sideCounts: Record<string, number>;
    liquidityCounts: Record<string, number>;
    totalKnownNotional: number | null;
    feeTotalsByToken: Record<string, number>;
    totalClosedPnl: number | null;
    closedPnlFillCount: number;
  };
  observations: string[];
  recommendations: string[];
};

export function buildTradeReviewReport(
  recent: RecentHyperliquidTrades,
): TradeReviewReport {
  const symbols = [...new Set(recent.trades.map((trade) => trade.symbol))].sort();
  const knownClosedPnl = recent.trades
    .map((trade) => trade.closedPnl)
    .filter((value): value is number => value !== null);
  const totalKnownNotional = sumKnown(recent.trades.map((trade) => trade.notional));
  const observations: string[] = [];
  const recommendations: string[] = [];

  if (recent.empty) {
    observations.push(
      "No Hyperliquid fills were returned for this owner-bound wallet in the review window.",
    );
    recommendations.push(
      "No trade-specific process change is supported by an empty review window.",
    );
  } else {
    observations.push(
      `${recent.tradeCount} fill${recent.tradeCount === 1 ? " was" : "s were"} reviewed across ${symbols.length} symbol${symbols.length === 1 ? "" : "s"}.`,
    );
  }

  if (recent.truncated) {
    observations.push("The direct fill result was truncated, so window-level totals are incomplete.");
    recommendations.push(
      "Review a shorter window before drawing conclusions from totals or frequencies.",
    );
  }
  for (const warning of recent.dataQuality.warnings) {
    observations.push(`Data quality: ${warning}`);
  }

  const reversals = rapidReversals(recent.trades);
  if (reversals > 0) {
    observations.push(
      `${reversals} rapid opposite-side fill sequence${reversals === 1 ? "" : "s"} occurred in the same symbol within 30 minutes.`,
    );
    recommendations.push(
      "Review the entry and exit triggers for rapid reversals, including their execution costs.",
    );
  }

  const concentration = largestNotionalShare(recent.trades);
  if (concentration !== null && concentration >= 0.5 && recent.tradeCount > 1) {
    observations.push(
      `The largest known fill represented ${formatPercent(concentration)} of known fill notional.`,
    );
    recommendations.push(
      "Compare the largest fill's sizing rule with the rest of the reviewed window.",
    );
  }

  const sizingRatio = knownSizingRatio(recent.trades);
  if (sizingRatio !== null && sizingRatio >= 2) {
    observations.push(
      `The largest known fill notional was ${sizingRatio.toFixed(1)}× the smallest.`,
    );
    recommendations.push(
      "Check whether the sizing variation followed an explicit risk rule.",
    );
  }

  const feeTotalsByToken = sumFeesByToken(recent.trades);
  if (Object.keys(feeTotalsByToken).length > 0) {
    observations.push(`Recorded fees: ${formatFeeTotals(feeTotalsByToken)}.`);
    recommendations.push(
      "Compare execution costs with the intended outcome before repeating the same pattern.",
    );
  }

  if (knownClosedPnl.length > 0) {
    observations.push(
      `Reported closed PnL across ${knownClosedPnl.length} fill${knownClosedPnl.length === 1 ? "" : "s"} totaled ${formatNumber(sum(knownClosedPnl))}; this is reported fill metadata, not a reconstructed portfolio return.`,
    );
  } else if (!recent.empty) {
    observations.push("Reported closed PnL was unavailable, so no PnL conclusion was made.");
  }

  return {
    schema: "ducky.hyperliquid.trade-review.v1",
    generatedAt: recent.asOf,
    window: {
      start: recent.windowStart,
      end: recent.windowEnd,
      environment: recent.environment,
      coverage: recent.coverage,
    },
    dataQuality: { ...recent.dataQuality, truncated: recent.truncated },
    summary: {
      tradeCount: recent.tradeCount,
      symbols,
      sideCounts: countBy(recent.trades.map((trade) => trade.side ?? "unknown")),
      liquidityCounts: countBy(recent.trades.map((trade) => trade.liquidity ?? "unknown")),
      totalKnownNotional,
      feeTotalsByToken,
      totalClosedPnl: knownClosedPnl.length > 0 ? sum(knownClosedPnl) : null,
      closedPnlFillCount: knownClosedPnl.length,
    },
    observations: unique(observations),
    recommendations: unique(recommendations),
  };
}

export function renderTradeReviewMarkdown(report: TradeReviewReport): string {
  const summary = report.summary;
  const lines = [
    "# Hyperliquid trade review",
    "",
    `Window: ${report.window.start} to ${report.window.end}`,
    `Environment: ${report.window.environment}`,
    "Coverage: direct Hyperliquid fills for one owner-bound operating wallet",
    `Fills: ${summary.tradeCount}`,
    `Symbols: ${summary.symbols.join(", ") || "None"}`,
    `Known fill notional: ${summary.totalKnownNotional === null ? "Unavailable" : formatNumber(summary.totalKnownNotional)}`,
    `Recorded fees: ${formatFeeTotals(summary.feeTotalsByToken) || "Unavailable"}`,
    `Reported closed PnL: ${summary.totalClosedPnl === null ? "Unavailable" : formatNumber(summary.totalClosedPnl)}`,
    "",
    "## Observations",
    "",
    ...report.observations.map((item) => `- ${item}`),
    "",
    "## Review guidance",
    "",
    ...report.recommendations.map((item) => `- ${item}`),
    "",
    "This is a factual execution review of returned fills, not a guarantee or individualized financial advice.",
  ];
  return `${lines.join("\n")}\n`;
}

function rapidReversals(trades: NormalizedHyperliquidTrade[]): number {
  const ordered = [...trades].sort(
    (left, right) => Date.parse(left.filledAt) - Date.parse(right.filledAt),
  );
  let count = 0;
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (!previous || !current || previous.symbol !== current.symbol) continue;
    if (!previous.side || !current.side || previous.side === current.side) continue;
    if (Date.parse(current.filledAt) - Date.parse(previous.filledAt) <= 30 * 60_000) count += 1;
  }
  return count;
}

function largestNotionalShare(trades: NormalizedHyperliquidTrade[]): number | null {
  const values = trades
    .map((trade) => trade.notional)
    .filter((value): value is number => value !== null && value > 0);
  if (values.length === 0) return null;
  const total = sum(values);
  return total > 0 ? Math.max(...values) / total : null;
}

function knownSizingRatio(trades: NormalizedHyperliquidTrade[]): number | null {
  const values = trades
    .map((trade) => trade.notional)
    .filter((value): value is number => value !== null && value > 0);
  if (values.length < 2) return null;
  return Math.max(...values) / Math.min(...values);
}

function sumFeesByToken(trades: NormalizedHyperliquidTrade[]): Record<string, number> {
  return trades.reduce<Record<string, number>>((totals, trade) => {
    if (trade.fee === null || !trade.feeToken) return totals;
    totals[trade.feeToken] = (totals[trade.feeToken] ?? 0) + trade.fee;
    return totals;
  }, {});
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function sumKnown(values: Array<number | null>): number | null {
  const known = values.filter((value): value is number => value !== null);
  return known.length > 0 ? sum(known) : null;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function formatFeeTotals(values: Record<string, number>): string {
  return Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([token, total]) => `${formatNumber(total)} ${token}`)
    .join(", ");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}
