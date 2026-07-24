import {
  defineIntent,
  defineIntentRouter,
  defineWorkflow,
  type AgentChatInput,
} from "openpond-agent-sdk";

import {
  asRecord,
  boundedInteger,
  evmAddress,
  fetchRelayStatus,
  getRelayQuote,
  nonnegativeInteger,
  normalizeExecute,
  normalizeRelayArtifact,
  positiveInteger,
  relayNetwork,
  requestIdsFromArtifact,
  requiredString,
  stableHash,
  unsignedDecimal,
  verifyAndBroadcastRelayStep,
} from "../src/relay.js";

export const quoteRelayTransferWorkflow = defineWorkflow({
  name: "quote-relay-transfer",
  description: "Request an unsigned exact-input EVM cross-chain quote from the official Relay SDK.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const network = relayNetwork(input);
    const parameters = {
      fromChainId: positiveInteger(input, "fromChainId"),
      toChainId: positiveInteger(input, "toChainId"),
      fromCurrency: evmAddress(input, "fromCurrency"),
      toCurrency: evmAddress(input, "toCurrency"),
      amount: unsignedDecimal(input, "amount"),
      user: evmAddress(input, "user"),
      recipient: evmAddress(input, "recipient"),
      slippageBps: boundedInteger(input, "slippageBps", 0, 10000),
    };
    if (BigInt(parameters.amount) === 0n) throw new Error("amount must be greater than zero.");
    const quoteTtlSeconds = boundedInteger(input, "quoteTtlSeconds", 30, 300, 120);
    const rawQuote = await getRelayQuote(network, parameters);
    const quote = normalizeExecute(rawQuote);
    const quotedAtDate = new Date();
    const normalized = {
      schema: "ducky.relay.quote.v1",
      network,
      parameters,
      quotedAt: quotedAtDate.toISOString(),
      expiresAt: new Date(quotedAtDate.getTime() + quoteTtlSeconds * 1000).toISOString(),
      quote,
      sdk: { relaySdk: "7.0.0", source: "ducky.capital" },
    };
    const artifact = { ...normalized, quoteHash: stableHash(normalized) };
    const requestIds = requestIdsFromArtifact(artifact);
    ctx.trace.event("relay.quote.created", {
      fromChainId: parameters.fromChainId,
      toChainId: parameters.toChainId,
      quoteHash: artifact.quoteHash,
      requestIds,
    });
    ctx.trace.artifact("artifacts/relay-quote.json", {
      quoteHash: artifact.quoteHash,
      requestIds,
      expiresAt: artifact.expiresAt,
    });
    return {
      text: `Relay returned ${quote.steps.length} step(s) for ${parameters.amount} raw units from chain ${parameters.fromChainId} to ${parameters.toChainId}. The unsigned quote ${artifact.quoteHash} expires at ${artifact.expiresAt}.`,
      intent: "quote_relay_transfer",
      artifactRefs: ["artifacts/relay-quote.json"],
      metadata: { artifact },
    };
  },
});

export const reviewRelayQuoteWorkflow = defineWorkflow({
  name: "review-relay-quote",
  description: "Verify a Relay quote artifact and summarize its fees, steps, request IDs, and expiry.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const artifact = normalizeRelayArtifact(input.artifact);
    const expired = Date.parse(artifact.expiresAt) <= Date.now();
    const transactionSteps = artifact.quote.steps.filter((step) => step.kind === "transaction").length;
    const signatureSteps = artifact.quote.steps.filter((step) => step.kind === "signature").length;
    const requestIds = requestIdsFromArtifact(artifact);
    const review = {
      validHash: true,
      expired,
      quoteHash: artifact.quoteHash,
      fromChainId: artifact.parameters.fromChainId,
      toChainId: artifact.parameters.toChainId,
      user: artifact.parameters.user,
      recipient: artifact.parameters.recipient,
      fees: artifact.quote.fees ?? null,
      details: artifact.quote.details ?? null,
      transactionSteps,
      signatureSteps,
      requestIds,
      steps: artifact.quote.steps,
    };
    ctx.trace.artifact("artifacts/relay-quote-review.json", {
      quoteHash: artifact.quoteHash,
      expired,
      transactionSteps,
      signatureSteps,
      requestIds,
    });
    return {
      text: `Relay quote ${artifact.quoteHash} has a valid content hash, ${transactionSteps} transaction step(s), ${signatureSteps} signature step(s), and is ${expired ? "expired" : "not expired"}.`,
      intent: "review_relay_quote",
      artifactRefs: ["artifacts/relay-quote-review.json"],
      metadata: { review },
    };
  },
});

export const relayTransferStatusWorkflow = defineWorkflow({
  name: "relay-transfer-status",
  description: "Read a Relay request's cross-chain lifecycle status.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const network = relayNetwork(input);
    const requestId = requiredString(input, "requestId");
    if (requestId.length > 256) throw new Error("requestId must be 256 characters or fewer.");
    const status = await fetchRelayStatus(network, requestId);
    const artifact = {
      schema: "ducky.relay.status.v1",
      network,
      requestId,
      status,
      observedAt: new Date().toISOString(),
    };
    ctx.trace.event("relay.status.read", { network, requestId });
    ctx.trace.artifact("artifacts/relay-status.json", {
      network,
      requestId,
      statusHash: stableHash(artifact),
    });
    return {
      text: `Read Relay status for request ${requestId}. Inspect the status artifact for source and destination transaction hashes and lifecycle state.`,
      intent: "relay_transfer_status",
      artifactRefs: ["artifacts/relay-status.json"],
      metadata: { artifact },
    };
  },
});

export const broadcastRelayStepWorkflow = defineWorkflow({
  name: "broadcast-relay-step",
  description: "Verify, simulate, and broadcast one externally signed incomplete EVM Relay step.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const rpcUrl = requiredString(input, "rpcUrl");
    const stepIndex = nonnegativeInteger(input, "stepIndex");
    const itemIndex = nonnegativeInteger(input, "itemIndex");
    const signedTransaction = requiredString(input, "signedTransaction");
    const confirmations = boundedInteger(input, "confirmations", 1, 20, 1);
    const result = await verifyAndBroadcastRelayStep(
      rpcUrl,
      input.artifact,
      stepIndex,
      itemIndex,
      signedTransaction,
      confirmations,
    );
    const requestIds = requestIdsFromArtifact(result.artifact);
    const artifact = {
      schema: "ducky.relay.step-receipt.v1",
      network: result.artifact.network,
      quoteHash: result.artifact.quoteHash,
      stepIndex,
      itemIndex,
      stepId: result.step.id,
      chainId: result.expected.chainId,
      transactionHash: result.transactionHash,
      blockNumber: result.receipt.blockNumber.toString(),
      receiptStatus: result.receipt.status,
      requestIds,
      broadcastAt: new Date().toISOString(),
      destinationComplete: false,
    };
    ctx.trace.event("relay.step.broadcast", {
      quoteHash: result.artifact.quoteHash,
      stepId: result.step.id,
      transactionHash: result.transactionHash,
      requestIds,
    });
    ctx.trace.artifact("artifacts/relay-step-receipt.json", artifact);
    return {
      text: `Broadcast Relay step ${result.step.id} as ${result.transactionHash}. Source receipt status is ${result.receipt.status}; destination completion must still be monitored separately.`,
      intent: "broadcast_relay_step",
      artifactRefs: ["artifacts/relay-step-receipt.json"],
      metadata: { artifact },
    };
  },
});

export const relayChatWorkflow = defineWorkflow({
  name: "relay-chat",
  description: "Explain Relay actions without quoting, signing, or broadcasting.",
  async run() {
    return {
      text: "Use quote-relay-transfer for an unsigned SDK quote, review-relay-quote before signing, broadcast-relay-step for one externally signed exact-match EVM step, and relay-transfer-status to monitor cross-chain completion. This chat action never quotes, signs, or broadcasts.",
      intent: "relay_help",
    };
  },
});

const helpIntent = defineIntent<AgentChatInput>({
  name: "relay_help",
  description: "Explain the Relay cross-chain action surface.",
  async run(ctx, input) {
    return ctx.workflow("relay-chat", input);
  },
});

export const relayChatRouter = defineIntentRouter({
  inputSchema: "AgentChatInput",
  intents: [helpIntent],
  defaultIntent: helpIntent,
  routing: { strategy: "code", traceSelection: true },
});
