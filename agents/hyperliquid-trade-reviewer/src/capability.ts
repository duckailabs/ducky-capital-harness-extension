export const RECENT_HYPERLIQUID_TRADES_CAPABILITY =
  "ducky.hyperliquid.read_recent_fills";

export type TradeReviewInput = {
  lookbackHours: number;
  environment?: "mainnet" | "testnet";
};

export type NormalizedHyperliquidTrade = {
  symbol: string;
  side: "buy" | "sell" | null;
  size: number | null;
  price: number | null;
  notional: number | null;
  fee: number | null;
  feeToken: string | null;
  closedPnl: number | null;
  liquidity: "maker" | "taker" | null;
  filledAt: string;
};

export type RecentHyperliquidTrades = {
  asOf: string;
  windowStart: string;
  windowEnd: string;
  coverage: "hyperliquid_direct";
  environment: "mainnet" | "testnet" | "all";
  walletCount: number;
  tradeCount: number;
  trades: NormalizedHyperliquidTrade[];
  truncated: boolean;
  empty: boolean;
  dataQuality: {
    lastTradeAt: string | null;
    lastCheckedAt: string;
    warnings: string[];
  };
};

export type CapabilityRuntime = {
  proxyUrl: string;
  proxyToken: string;
  fetch: typeof fetch;
};

export function normalizeTradeReviewInput(value: unknown): TradeReviewInput {
  const input = record(value, "input");
  const allowedKeys = new Set(["lookbackHours", "environment"]);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) throw new Error(`Unsupported input field: ${key}.`);
  }

  const lookbackHours = input.lookbackHours ?? 24;
  if (
    typeof lookbackHours !== "number" ||
    !Number.isInteger(lookbackHours) ||
    lookbackHours < 1 ||
    lookbackHours > 168
  ) {
    throw new Error("lookbackHours must be an integer from 1 through 168.");
  }
  const rawEnvironment = input.environment;
  if (
    rawEnvironment !== undefined &&
    rawEnvironment !== "mainnet" &&
    rawEnvironment !== "testnet"
  ) {
    throw new Error("environment must be mainnet or testnet.");
  }

  return {
    lookbackHours,
    ...(rawEnvironment ? { environment: rawEnvironment } : {}),
  };
}

export function capabilityRuntimeFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CapabilityRuntime {
  const proxyUrl = requiredString(env.OPENPOND_INTEGRATION_PROXY_URL, "integration proxy URL");
  const proxyToken = requiredString(
    env.OPENPOND_INTEGRATION_PROXY_TOKEN,
    "integration proxy token",
  );
  const parsed = new URL(proxyUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("The integration proxy URL must use HTTPS.");
  }
  return { proxyUrl, proxyToken, fetch };
}

export async function readRecentHyperliquidTrades(
  input: TradeReviewInput,
  runtime: CapabilityRuntime = capabilityRuntimeFromEnv(),
): Promise<RecentHyperliquidTrades> {
  let response: Response;
  try {
    response = await runtime.fetch(runtime.proxyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runtime.proxyToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        capability: RECENT_HYPERLIQUID_TRADES_CAPABILITY,
        value: input,
      }),
      redirect: "error",
    });
  } catch (error) {
    const cause = error instanceof Error ? error.cause : null;
    const causeRecord =
      cause && typeof cause === "object" ? (cause as Record<string, unknown>) : null;
    const detail =
      (causeRecord && typeof causeRecord.code === "string" && causeRecord.code) ||
      (cause instanceof Error && cause.message) ||
      (error instanceof Error && error.message) ||
      "request_failed";
    throw new Error(`Recent-trade capability request failed: ${detail}.`);
  }
  if (!response.ok) {
    throw new Error(`Recent-trade capability failed with HTTP ${response.status}.`);
  }
  const payload = record(await response.json(), "capability response");
  if (payload.status !== "allowed") {
    throw new Error("Recent-trade capability did not return an allowed result.");
  }
  return normalizeRecentHyperliquidTrades(payload.data);
}

export function normalizeRecentHyperliquidTrades(
  value: unknown,
): RecentHyperliquidTrades {
  const data = record(value, "recent trades");
  const coverage = requiredString(data.coverage, "coverage");
  if (coverage !== "hyperliquid_direct") {
    throw new Error(`Unsupported trade coverage: ${coverage}.`);
  }
  const environment = requiredString(data.environment, "environment");
  if (!isEnvironment(environment)) {
    throw new Error(`Unsupported trade environment: ${environment}.`);
  }
  const trades = array(data.trades, "trades").map(normalizeTrade);
  const tradeCount = integer(data.tradeCount, "tradeCount");
  if (tradeCount !== trades.length) {
    throw new Error("tradeCount does not match the returned trades.");
  }
  const quality = record(data.dataQuality, "dataQuality");
  const walletCount = integer(data.walletCount, "walletCount");
  if (walletCount !== 1) {
    throw new Error("Recent trade capability must contain exactly one owner-bound wallet.");
  }

  return {
    asOf: isoTimestamp(data.asOf, "asOf"),
    windowStart: isoTimestamp(data.windowStart, "windowStart"),
    windowEnd: isoTimestamp(data.windowEnd, "windowEnd"),
    coverage,
    environment,
    walletCount,
    tradeCount,
    trades,
    truncated: boolean(data.truncated, "truncated"),
    empty: boolean(data.empty, "empty"),
    dataQuality: {
      lastTradeAt: nullableTimestamp(quality.lastTradeAt, "lastTradeAt"),
      lastCheckedAt: isoTimestamp(quality.lastCheckedAt, "lastCheckedAt"),
      warnings: array(quality.warnings, "warnings").map((warning) =>
        requiredString(warning, "warning"),
      ),
    },
  };
}

function normalizeTrade(value: unknown): NormalizedHyperliquidTrade {
  const trade = record(value, "trade");
  const side = nullableString(trade.side);
  if (side !== null && side !== "buy" && side !== "sell") {
    throw new Error("trade.side must be buy, sell, or null.");
  }
  const liquidity = nullableString(trade.liquidity);
  if (liquidity !== null && liquidity !== "maker" && liquidity !== "taker") {
    throw new Error("trade.liquidity must be maker, taker, or null.");
  }
  return {
    symbol: requiredString(trade.symbol, "trade.symbol"),
    side,
    size: nullableNumber(trade.size),
    price: nullableNumber(trade.price),
    notional: nullableNumber(trade.notional),
    fee: nullableNumber(trade.fee),
    feeToken: nullableString(trade.feeToken),
    closedPnl: nullableNumber(trade.closedPnl),
    liquidity,
    filledAt: isoTimestamp(trade.filledAt, "trade.filledAt"),
  };
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return value;
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${label} must be a boolean.`);
  return value;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isoTimestamp(value: unknown, label: string): string {
  const text = requiredString(value, label);
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) throw new Error(`${label} must be a timestamp.`);
  return parsed.toISOString();
}

function nullableTimestamp(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  return isoTimestamp(value, label);
}

function isEnvironment(value: string): value is RecentHyperliquidTrades["environment"] {
  return value === "mainnet" || value === "testnet" || value === "all";
}
