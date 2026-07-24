export const safeInputSchemas = {
  SafeInspectInput: {
    type: "object",
    additionalProperties: false,
    required: ["rpcUrl", "chainId", "safeAddress"],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      chainId: { type: "integer", minimum: 1 },
      safeAddress: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
    },
  },
  SafeBuildInput: {
    type: "object",
    additionalProperties: false,
    required: ["rpcUrl", "chainId", "safeAddress", "transactions"],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      chainId: { type: "integer", minimum: 1 },
      safeAddress: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
      nonce: { type: "integer", minimum: 0 },
      allowDelegateCall: { type: "boolean" },
      transactions: {
        type: "array",
        minItems: 1,
        maxItems: 64,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["to", "value", "data"],
          properties: {
            to: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
            value: { type: "string", pattern: "^[0-9]+$" },
            data: { type: "string", pattern: "^0x([0-9a-fA-F]{2})*$" },
            operation: { type: "integer", enum: [0, 1] },
          },
        },
      },
    },
  },
  SafeStatusInput: {
    type: "object",
    additionalProperties: false,
    required: ["chainId", "safeTxHash"],
    properties: {
      chainId: { type: "integer", minimum: 1 },
      safeTxHash: { type: "string", pattern: "^0x[0-9a-fA-F]{64}$" },
      transactionServiceUrl: { type: "string", minLength: 1 },
    },
  },
  SafeProposeInput: {
    type: "object",
    additionalProperties: false,
    required: [
      "rpcUrl",
      "chainId",
      "safeAddress",
      "safeTransactionData",
      "safeTxHash",
      "senderAddress",
      "senderSignature"
    ],
    properties: {
      rpcUrl: { type: "string", minLength: 1 },
      chainId: { type: "integer", minimum: 1 },
      safeAddress: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
      safeTxHash: { type: "string", pattern: "^0x[0-9a-fA-F]{64}$" },
      senderAddress: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
      senderSignature: { type: "string", pattern: "^0x[0-9a-fA-F]+$" },
      origin: { type: "string", maxLength: 200 },
      transactionServiceUrl: { type: "string", minLength: 1 },
      safeTransactionData: {
        type: "object",
        additionalProperties: false,
        required: [
          "to",
          "value",
          "data",
          "operation",
          "safeTxGas",
          "baseGas",
          "gasPrice",
          "gasToken",
          "refundReceiver",
          "nonce"
        ],
        properties: {
          to: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
          value: { type: "string", pattern: "^[0-9]+$" },
          data: { type: "string", pattern: "^0x([0-9a-fA-F]{2})*$" },
          operation: { type: "integer", enum: [0, 1] },
          safeTxGas: { type: "string", pattern: "^[0-9]+$" },
          baseGas: { type: "string", pattern: "^[0-9]+$" },
          gasPrice: { type: "string", pattern: "^[0-9]+$" },
          gasToken: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
          refundReceiver: { type: "string", pattern: "^0x[0-9a-fA-F]{40}$" },
          nonce: { type: "integer", minimum: 0 },
        },
      },
    },
  },
} as const;

export const safeProjectInputSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    prompt: { type: "string" },
    channel: { type: "string" },
  },
} as const;
