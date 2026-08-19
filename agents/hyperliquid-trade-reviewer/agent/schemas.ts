const environment = {
  type: "string",
  enum: ["mainnet", "testnet"],
} as const;

const recentTradesInput = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackHours: {
      type: "integer",
      minimum: 1,
      maximum: 168,
      default: 24,
    },
    environment,
  },
} as const;

export const tradeReviewerInputSchemas = {
  GetRecentHyperliquidTradesInput: recentTradesInput,
  ReviewRecentHyperliquidTradesInput: recentTradesInput,
} as const;

export const tradeReviewerProjectInputSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    prompt: { type: "string" },
    channel: { type: "string" },
  },
} as const;
