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

const generateTradeIdeaInput = {
  type: "object",
  additionalProperties: false,
  required: ["symbol"],
  properties: {
    symbol: { type: "string", minLength: 1, maxLength: 40 },
    marketSymbol: { type: "string", minLength: 1, maxLength: 80 },
    currentMarkPrice: { type: "number", exclusiveMinimum: 0 },
    availableToTrade: { type: "number", minimum: 0 },
    accountValue: { type: "number", minimum: 0 },
    leverage: { type: "number", exclusiveMinimum: 0, maximum: 100 },
    leverageMode: { type: "string", enum: ["cross", "isolated"] },
    environment,
  },
} as const;

export const tradeReviewerInputSchemas = {
  GetRecentHyperliquidTradesInput: recentTradesInput,
  ReviewRecentHyperliquidTradesInput: recentTradesInput,
  GenerateTradeIdeaInput: generateTradeIdeaInput,
} as const;

export const tradeReviewerProjectInputSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    prompt: { type: "string" },
    channel: { type: "string" },
  },
} as const;
