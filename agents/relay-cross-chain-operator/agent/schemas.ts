const address = { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" } as const;
const unsignedDecimal = { type: "string", pattern: "^[0-9]+$" } as const;
const relayNetwork = { type: "string", enum: ["mainnet", "testnet"] } as const;

const relayArtifact = {
  type: "object",
  additionalProperties: true,
  required: [
    "schema",
    "network",
    "parameters",
    "quotedAt",
    "expiresAt",
    "quote",
    "quoteHash"
  ],
  properties: {
    schema: { const: "ducky.relay.quote.v1" },
    network: relayNetwork,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: [
        "fromChainId",
        "toChainId",
        "fromCurrency",
        "toCurrency",
        "amount",
        "user",
        "recipient",
        "slippageBps"
      ],
      properties: {
        fromChainId: { type: "integer", minimum: 1 },
        toChainId: { type: "integer", minimum: 1 },
        fromCurrency: address,
        toCurrency: address,
        amount: unsignedDecimal,
        user: address,
        recipient: address,
        slippageBps: { type: "integer", minimum: 0, maximum: 10000 },
      },
    },
    quotedAt: { type: "string", format: "date-time" },
    expiresAt: { type: "string", format: "date-time" },
    quote: { type: "object", additionalProperties: true },
    quoteHash: { type: "string", pattern: "^sha256:[0-9a-f]{64}$" },
  },
} as const;

export const relayInputSchemas = {
  RelayQuoteInput: {
    type: "object",
    additionalProperties: false,
    required: [
      "network",
      "fromChainId",
      "toChainId",
      "fromCurrency",
      "toCurrency",
      "amount",
      "user",
      "recipient",
      "slippageBps"
    ],
    properties: {
      network: relayNetwork,
      fromChainId: { type: "integer", minimum: 1 },
      toChainId: { type: "integer", minimum: 1 },
      fromCurrency: address,
      toCurrency: address,
      amount: unsignedDecimal,
      user: address,
      recipient: address,
      slippageBps: { type: "integer", minimum: 0, maximum: 10000 },
      quoteTtlSeconds: { type: "integer", minimum: 30, maximum: 300 },
    },
  },
  RelayReviewInput: {
    type: "object",
    additionalProperties: false,
    required: ["artifact"],
    properties: { artifact: relayArtifact },
  },
  RelayStatusInput: {
    type: "object",
    additionalProperties: false,
    required: ["network", "requestId"],
    properties: {
      network: relayNetwork,
      requestId: { type: "string", minLength: 1, maxLength: 256 },
    },
  },
  RelayBroadcastInput: {
    type: "object",
    additionalProperties: false,
    required: [
      "rpcUrl",
      "artifact",
      "stepIndex",
      "itemIndex",
      "signedTransaction"
    ],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      artifact: relayArtifact,
      stepIndex: { type: "integer", minimum: 0 },
      itemIndex: { type: "integer", minimum: 0 },
      signedTransaction: { type: "string", pattern: "^0x[0-9a-fA-F]+$" },
      confirmations: { type: "integer", minimum: 1, maximum: 20 },
    },
  },
} as const;

export const relayProjectInputSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    prompt: { type: "string" },
    channel: { type: "string" },
  },
} as const;
