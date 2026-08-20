import type { RecentHyperliquidTrades } from "./capability.js";

export type TradeIdeaInput = {
  symbol: string;
  marketSymbol?: string;
  currentMarkPrice?: number;
  availableToTrade?: number;
  accountValue?: number;
  leverage?: number;
  leverageMode?: "cross" | "isolated";
  environment?: "mainnet" | "testnet";
};

export function normalizeTradeIdeaInput(value: unknown): TradeIdeaInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("invalid_trade_idea_input");
  }
  const input = value as Record<string, unknown>;
  const symbol = typeof input.symbol === "string" ? input.symbol.trim() : "";
  if (!symbol || symbol.length > 40) throw new Error("invalid_trade_idea_symbol");
  const number = (name: string): number | undefined => {
    const candidate = input[name];
    if (candidate === undefined) return undefined;
    if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < 0) {
      throw new Error(`invalid_trade_idea_${name}`);
    }
    return candidate;
  };
  const leverage = number("leverage");
  if (leverage !== undefined && leverage <= 0) throw new Error("invalid_trade_idea_leverage");
  const environment = input.environment;
  if (environment !== undefined && environment !== "mainnet" && environment !== "testnet") {
    throw new Error("invalid_trade_idea_environment");
  }
  const leverageMode = input.leverageMode;
  if (leverageMode !== undefined && leverageMode !== "cross" && leverageMode !== "isolated") {
    throw new Error("invalid_trade_idea_leverage_mode");
  }
  return {
    symbol: symbol.toUpperCase(),
    ...(typeof input.marketSymbol === "string" && input.marketSymbol.trim()
      ? { marketSymbol: input.marketSymbol.trim().toUpperCase() }
      : {}),
    ...(number("currentMarkPrice") ? { currentMarkPrice: number("currentMarkPrice") } : {}),
    ...(number("availableToTrade") !== undefined ? { availableToTrade: number("availableToTrade") } : {}),
    ...(number("accountValue") !== undefined ? { accountValue: number("accountValue") } : {}),
    ...(leverage ? { leverage } : {}),
    ...(leverageMode ? { leverageMode } : {}),
    ...(environment ? { environment } : {}),
  };
}

export function buildTradeIdea(input: TradeIdeaInput, recent: RecentHyperliquidTrades) {
  const matchingTrades = recent.trades.filter((trade) => trade.symbol.toUpperCase() === input.symbol);
  const hasPrice = input.currentMarkPrice !== undefined;
  const action = hasPrice ? "wait" : "wait";
  const reasons = [
    `Fresh ${recent.environment} fill window contains ${matchingTrades.length} ${input.symbol} fill${matchingTrades.length === 1 ? "" : "s"}.`,
    hasPrice
      ? "Current price was supplied, but fills alone do not establish a trade edge."
      : "No current price was supplied, so no entry level can be evaluated.",
    "This is research only and cannot place or apply an order.",
  ];
  return {
    generatedAt: recent.asOf,
    asset: input.symbol,
    marketSymbol: input.marketSymbol ?? input.symbol,
    recommendation: {
      action,
      confidence: 0,
      headline: "Wait for independent market evidence",
      summary: "Fresh execution history is useful context, but it does not itself establish an entry or a position change.",
      reasons,
    },
    tradeIdea: {
      conviction: action,
      canApply: false,
      ...(input.currentMarkPrice !== undefined ? { currentPrice: input.currentMarkPrice } : {}),
      ...(input.leverage !== undefined ? { leverage: input.leverage } : {}),
      ...(input.leverageMode ? { leverageMode: input.leverageMode } : {}),
    },
    warnings: [
      "No order was created or submitted.",
      "Fresh fill history does not prove market direction, portfolio risk, or expected return.",
    ],
  } as const;
}

export function renderTradeIdeaMarkdown(idea: ReturnType<typeof buildTradeIdea>): string {
  return [
    `# ${idea.asset} trade idea`,
    "",
    `**Decision:** ${idea.recommendation.action}`,
    "",
    idea.recommendation.summary,
    "",
    "## Evidence",
    ...idea.recommendation.reasons.map((reason) => `- ${reason}`),
    "",
    "## Boundary",
    "- This is a read-only research result. It cannot apply, sign, or submit a trade.",
  ].join("\n");
}
