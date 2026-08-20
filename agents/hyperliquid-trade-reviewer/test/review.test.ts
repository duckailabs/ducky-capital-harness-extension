import { describe, expect, test } from "bun:test";

import {
  normalizeRecentHyperliquidTrades,
  normalizeTradeReviewInput,
  readRecentHyperliquidTrades,
} from "../src/capability.js";
import {
  buildTradeReviewReport,
  renderTradeReviewMarkdown,
} from "../src/review.js";
import {
  buildTradeIdea,
  normalizeTradeIdeaInput,
} from "../src/idea.js";

const emptyFixture = {
  asOf: "2026-08-19T12:00:00.000Z",
  windowStart: "2026-08-18T12:00:00.000Z",
  windowEnd: "2026-08-19T12:00:00.000Z",
  coverage: "hyperliquid_direct",
  environment: "mainnet",
  walletCount: 1,
  tradeCount: 0,
  trades: [],
  truncated: false,
  empty: true,
  dataQuality: {
    lastTradeAt: null,
    lastCheckedAt: "2026-08-19T12:00:00.000Z",
    warnings: [],
  },
};

describe("Hyperliquid Trade Reviewer", () => {
  test("rejects identity, endpoint, and credential input", () => {
    expect(() => normalizeTradeReviewInput({ userId: "user_1" })).toThrow();
    expect(() => normalizeTradeReviewInput({ teamId: "team_1" })).toThrow();
    expect(() => normalizeTradeReviewInput({ walletAddress: "0x123" })).toThrow();
    expect(() => normalizeTradeReviewInput({ proxyUrl: "https://attacker.test" })).toThrow();
    expect(() => normalizeTradeReviewInput({ bearerToken: "secret" })).toThrow();
  });

  test("calls only the runtime capability proxy with bounded input", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const result = await readRecentHyperliquidTrades(
      { lookbackHours: 24, environment: "mainnet" },
      {
        proxyUrl: "https://proxy.openpond.test/lease_1",
        proxyToken: "runtime-token",
        fetch: (async (url, init) => {
          calls.push({ url: String(url), init });
          return Response.json({ status: "allowed", data: emptyFixture });
        }) as typeof fetch,
      },
    );

    expect(result.empty).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://proxy.openpond.test/lease_1");
    expect(calls[0]?.init?.headers).toEqual({
      Authorization: "Bearer runtime-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      capability: "ducky.hyperliquid.read_recent_fills",
      value: { lookbackHours: 24, environment: "mainnet" },
    });
  });

  test("strips unexpected ownership metadata from direct fill results", () => {
    const normalized = normalizeRecentHyperliquidTrades({
      ...emptyFixture,
      tradeCount: 1,
      empty: false,
      trades: [{
        symbol: "BTC",
        side: "buy",
        size: 0.01,
        price: 100000,
        notional: 1000,
        fee: 0.5,
        feeToken: "USDC",
        closedPnl: null,
        liquidity: "taker",
        filledAt: "2026-08-19T10:00:00.000Z",
        walletAddress: "0xprivate",
        teamId: "team_private",
      }],
    });
    expect(JSON.stringify(normalized)).not.toContain("0xprivate");
    expect(JSON.stringify(normalized)).not.toContain("team_private");
  });

  test("renders an empty window without invented trade advice", () => {
    const report = buildTradeReviewReport(
      normalizeRecentHyperliquidTrades(emptyFixture),
    );
    const markdown = renderTradeReviewMarkdown(report);
    expect(report.summary.tradeCount).toBe(0);
    expect(markdown).toContain("No Hyperliquid fills");
    expect(markdown).not.toContain("change your position");
  });

  test("keeps generated trade ideas read-only and non-executable", () => {
    const idea = buildTradeIdea(
      normalizeTradeIdeaInput({ symbol: "BTC", currentMarkPrice: 100000 }),
      normalizeRecentHyperliquidTrades(emptyFixture),
    );
    expect(idea.recommendation.action).toBe("wait");
    expect(idea.tradeIdea.canApply).toBe(false);
    expect(JSON.stringify(idea)).not.toContain("walletAddress");
  });
});
