const address = { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" } as const;
const hex = { type: "string", pattern: "^0x([0-9a-fA-F]{2})*$" } as const;
const unsignedDecimal = { type: "string", pattern: "^[0-9]+$" } as const;

const token = {
  type: "object",
  additionalProperties: false,
  required: ["address", "decimals"],
  properties: {
    chainId: { type: "integer", minimum: 1 },
    address,
    decimals: { type: "integer", minimum: 0, maximum: 255 },
    symbol: { type: "string", minLength: 1, maxLength: 32 },
    name: { type: "string", minLength: 1, maxLength: 100 },
  },
} as const;

const transactionPlan = {
  type: "object",
  additionalProperties: true,
  required: [
    "schema",
    "chainId",
    "sender",
    "recipient",
    "tokenIn",
    "tokenOut",
    "amountInRaw",
    "quoteOutRaw",
    "minimumAmountOutRaw",
    "slippageBps",
    "deadline",
    "transaction",
    "planHash"
  ],
  properties: {
    schema: { const: "ducky.uniswap.swap-plan.v1" },
    chainId: { type: "integer", minimum: 1 },
    sender: address,
    recipient: address,
    tokenIn: token,
    tokenOut: token,
    amountInRaw: unsignedDecimal,
    quoteOutRaw: unsignedDecimal,
    minimumAmountOutRaw: unsignedDecimal,
    slippageBps: { type: "integer", minimum: 1, maximum: 5000 },
    deadline: { type: "integer", minimum: 1 },
    transaction: {
      type: "object",
      additionalProperties: false,
      required: ["chainId", "from", "to", "data", "valueWei"],
      properties: {
        chainId: { type: "integer", minimum: 1 },
        from: address,
        to: address,
        data: hex,
        valueWei: unsignedDecimal,
      },
    },
    planHash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
  },
} as const;

export const uniswapInputSchemas = {
  UniswapQuoteInput: {
    type: "object",
    additionalProperties: false,
    required: [
      "rpcUrl",
      "chainId",
      "sender",
      "recipient",
      "tokenIn",
      "tokenOut",
      "amountInRaw",
      "slippageBps"
    ],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      chainId: { type: "integer", minimum: 1 },
      sender: address,
      recipient: address,
      tokenIn: token,
      tokenOut: token,
      amountInRaw: unsignedDecimal,
      slippageBps: { type: "integer", minimum: 1, maximum: 5000 },
      deadlineSeconds: { type: "integer", minimum: 60, maximum: 86400 },
    },
  },
  UniswapReviewInput: {
    type: "object",
    additionalProperties: false,
    required: ["plan"],
    properties: { plan: transactionPlan },
  },
  UniswapBroadcastInput: {
    type: "object",
    additionalProperties: false,
    required: ["rpcUrl", "plan", "signedTransaction"],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      plan: transactionPlan,
      signedTransaction: { type: "string", pattern: "^0x[0-9a-fA-F]+$" },
      confirmations: { type: "integer", minimum: 1, maximum: 20 },
    },
  },
} as const;

export const uniswapProjectInputSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    prompt: { type: "string" },
    channel: { type: "string" },
  },
} as const;
