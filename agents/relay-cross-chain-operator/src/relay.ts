import { createHash } from "node:crypto";

import {
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  createClient,
  type Execute,
} from "@relayprotocol/relay-sdk";
import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  isHex,
  parseTransaction,
  recoverTransactionAddress,
  type Hex,
  type TransactionSerialized,
} from "viem";

export type JsonRecord = Record<string, unknown>;
export type RelayNetwork = "mainnet" | "testnet";

export function asRecord(value: unknown, label = "input"): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

export function requiredString(record: JsonRecord, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  return value.trim();
}

export function positiveInteger(record: JsonRecord, key: string): number {
  const value = record[key];
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new Error(`${key} must be a positive safe integer.`);
  }
  return Number(value);
}

export function boundedInteger(
  record: JsonRecord,
  key: string,
  minimum: number,
  maximum: number,
  fallback?: number,
): number {
  const value = record[key] ?? fallback;
  if (!Number.isSafeInteger(value) || Number(value) < minimum || Number(value) > maximum) {
    throw new Error(`${key} must be an integer from ${minimum} through ${maximum}.`);
  }
  return Number(value);
}

export function nonnegativeInteger(record: JsonRecord, key: string): number {
  const value = record[key];
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new Error(`${key} must be a nonnegative safe integer.`);
  }
  return Number(value);
}

export function evmAddress(record: JsonRecord, key: string): `0x${string}` {
  const value = requiredString(record, key);
  if (!isAddress(value)) throw new Error(`${key} must be a valid EVM address.`);
  return getAddress(value);
}

export function unsignedDecimal(record: JsonRecord, key: string): string {
  const value = requiredString(record, key);
  if (!/^[0-9]+$/.test(value)) throw new Error(`${key} must be an unsigned decimal string.`);
  return BigInt(value).toString();
}

export function relayNetwork(record: JsonRecord): RelayNetwork {
  const value = requiredString(record, "network");
  if (value !== "mainnet" && value !== "testnet") {
    throw new Error("network must be mainnet or testnet.");
  }
  return value;
}

export function relayApiBase(network: RelayNetwork): string {
  return network === "mainnet" ? MAINNET_RELAY_API : TESTNET_RELAY_API;
}

export function relayClient(network: RelayNetwork) {
  return createClient({
    baseApiUrl: relayApiBase(network),
    source: "ducky.capital",
    ...(process.env.RELAY_API_KEY?.trim()
      ? { apiKey: process.env.RELAY_API_KEY.trim() }
      : {}),
  });
}

function jsonSafe(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    const result: JsonRecord = {};
    for (const [key, item] of Object.entries(value as JsonRecord)) {
      if (item !== undefined && typeof item !== "function") result[key] = jsonSafe(item);
    }
    return result;
  }
  return null;
}

function normalizeEvmStepData(value: unknown, label: string) {
  const data = asRecord(value, label);
  const chainId = positiveInteger(data, "chainId");
  const calldata = requiredString(data, "data");
  if (!isHex(calldata) || calldata.length % 2 !== 0) {
    throw new Error(`${label}.data must be byte-aligned hex.`);
  }
  return {
    chainId,
    from: evmAddress(data, "from"),
    to: evmAddress(data, "to"),
    data: calldata as Hex,
    value: unsignedDecimal(data, "value"),
    ...(typeof data.gas === "string" ? { gas: data.gas } : {}),
    ...(typeof data.maxFeePerGas === "string"
      ? { maxFeePerGas: data.maxFeePerGas }
      : {}),
    ...(typeof data.maxPriorityFeePerGas === "string"
      ? { maxPriorityFeePerGas: data.maxPriorityFeePerGas }
      : {}),
  };
}

export function normalizeExecute(value: unknown) {
  const quote = asRecord(value, "quote");
  if (!Array.isArray(quote.steps) || quote.steps.length === 0) {
    throw new Error("Relay quote must contain at least one step.");
  }
  const steps = quote.steps.map((candidate, stepIndex) => {
    const step = asRecord(candidate, `quote.steps[${stepIndex}]`);
    if (step.kind !== "transaction" && step.kind !== "signature") {
      throw new Error(`quote.steps[${stepIndex}].kind is unsupported.`);
    }
    if (!Array.isArray(step.items) || step.items.length === 0) {
      throw new Error(`quote.steps[${stepIndex}] has no items.`);
    }
    const kind = step.kind;
    return {
      id: requiredString(step, "id"),
      action: requiredString(step, "action"),
      description: requiredString(step, "description"),
      kind,
      ...(typeof step.requestId === "string" ? { requestId: step.requestId } : {}),
      items: step.items.map((candidateItem, itemIndex) => {
        const item = asRecord(candidateItem, `quote.steps[${stepIndex}].items[${itemIndex}]`);
        if (item.status !== "complete" && item.status !== "incomplete") {
          throw new Error(`quote.steps[${stepIndex}].items[${itemIndex}].status is invalid.`);
        }
        return {
          status: item.status,
          ...(item.data !== undefined
            ? {
                data:
                  kind === "transaction" && item.status === "incomplete"
                    ? normalizeEvmStepData(
                        item.data,
                        `quote.steps[${stepIndex}].items[${itemIndex}].data`,
                      )
                    : jsonSafe(item.data),
              }
            : {}),
          ...(item.check !== undefined ? { check: jsonSafe(item.check) } : {}),
          ...(item.checkStatus !== undefined ? { checkStatus: jsonSafe(item.checkStatus) } : {}),
          ...(item.progressState !== undefined
            ? { progressState: jsonSafe(item.progressState) }
            : {}),
          ...(item.txHashes !== undefined ? { txHashes: jsonSafe(item.txHashes) } : {}),
          ...(item.orderIds !== undefined ? { orderIds: jsonSafe(item.orderIds) } : {}),
        };
      }),
    };
  });
  const errors = Array.isArray(quote.errors) ? jsonSafe(quote.errors) : undefined;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(`Relay quote contains ${errors.length} error(s).`);
  }
  return {
    steps,
    ...(quote.fees !== undefined ? { fees: jsonSafe(quote.fees) } : {}),
    ...(quote.breakdown !== undefined ? { breakdown: jsonSafe(quote.breakdown) } : {}),
    ...(quote.details !== undefined ? { details: jsonSafe(quote.details) } : {}),
    ...(quote.refunded !== undefined ? { refunded: quote.refunded === true } : {}),
  };
}

export function stableHash(value: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(value)).digest("hex")}`;
}

function stableJson(value: unknown): string {
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint") return JSON.stringify(value.toString());
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as JsonRecord;
  return `{${Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

function normalizeParameters(value: unknown) {
  const parameters = asRecord(value, "artifact.parameters");
  return {
    fromChainId: positiveInteger(parameters, "fromChainId"),
    toChainId: positiveInteger(parameters, "toChainId"),
    fromCurrency: evmAddress(parameters, "fromCurrency"),
    toCurrency: evmAddress(parameters, "toCurrency"),
    amount: unsignedDecimal(parameters, "amount"),
    user: evmAddress(parameters, "user"),
    recipient: evmAddress(parameters, "recipient"),
    slippageBps: boundedInteger(parameters, "slippageBps", 0, 10000),
  };
}

export function normalizeRelayArtifact(value: unknown) {
  const artifact = asRecord(value, "artifact");
  if (artifact.schema !== "ducky.relay.quote.v1") {
    throw new Error("artifact.schema must be ducky.relay.quote.v1.");
  }
  const network = relayNetwork(artifact);
  const quotedAt = requiredString(artifact, "quotedAt");
  const expiresAt = requiredString(artifact, "expiresAt");
  if (!Number.isFinite(Date.parse(quotedAt)) || !Number.isFinite(Date.parse(expiresAt))) {
    throw new Error("quotedAt and expiresAt must be ISO timestamps.");
  }
  const normalized = {
    schema: "ducky.relay.quote.v1",
    network,
    parameters: normalizeParameters(artifact.parameters),
    quotedAt,
    expiresAt,
    quote: normalizeExecute(artifact.quote),
    sdk: artifact.sdk ?? null,
  };
  const quoteHash = requiredString(artifact, "quoteHash");
  const computedHash = stableHash(normalized);
  if (quoteHash !== computedHash) {
    throw new Error(`Quote hash mismatch: computed ${computedHash}, supplied ${quoteHash}.`);
  }
  return { ...normalized, quoteHash };
}

export function requestIdsFromArtifact(artifact: ReturnType<typeof normalizeRelayArtifact>) {
  return [...new Set(
    artifact.quote.steps
      .map((step) => step.requestId)
      .filter((value): value is string => Boolean(value)),
  )];
}

export async function getRelayQuote(
  network: RelayNetwork,
  parameters: {
    fromChainId: number;
    toChainId: number;
    fromCurrency: `0x${string}`;
    toCurrency: `0x${string}`;
    amount: string;
    user: `0x${string}`;
    recipient: `0x${string}`;
    slippageBps: number;
  },
): Promise<Execute> {
  const client = relayClient(network);
  return client.actions.getQuote({
    chainId: parameters.fromChainId,
    currency: parameters.fromCurrency,
    toChainId: parameters.toChainId,
    toCurrency: parameters.toCurrency,
    tradeType: "EXACT_INPUT",
    amount: parameters.amount,
    user: parameters.user,
    recipient: parameters.recipient,
    options: { slippageTolerance: parameters.slippageBps.toString() },
  });
}

export async function fetchRelayStatus(network: RelayNetwork, requestId: string) {
  const base = relayApiBase(network);
  const url = new URL("/intents/status/v3", base);
  url.searchParams.set("requestId", requestId);
  const apiKey = process.env.RELAY_API_KEY?.trim();
  const response = await fetch(url, {
    headers: apiKey ? { "x-api-key": apiKey } : {},
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Relay status request failed with HTTP ${response.status}.`);
  }
  return jsonSafe(body);
}

export async function verifyAndBroadcastRelayStep(
  rpcUrl: string,
  rawArtifact: unknown,
  stepIndex: number,
  itemIndex: number,
  signedTransaction: string,
  confirmations: number,
) {
  const artifact = normalizeRelayArtifact(rawArtifact);
  if (Date.parse(artifact.expiresAt) <= Date.now()) {
    throw new Error("The Relay quote has expired. Request and review a new quote.");
  }
  const step = artifact.quote.steps[stepIndex];
  if (!step) throw new Error(`No Relay step exists at index ${stepIndex}.`);
  if (step.kind !== "transaction") throw new Error("The selected Relay step is a signature step.");
  const item = step.items[itemIndex];
  if (!item) throw new Error(`No Relay item exists at index ${itemIndex}.`);
  if (item.status !== "incomplete") throw new Error("The selected Relay item is already complete.");
  const expected = normalizeEvmStepData(
    item.data,
    `quote.steps[${stepIndex}].items[${itemIndex}].data`,
  );
  if (expected.chainId !== artifact.parameters.fromChainId) {
    throw new Error("The selected transaction step is not on the quoted origin chain.");
  }
  if (expected.from !== artifact.parameters.user) {
    throw new Error("The selected step sender does not match the quoted user.");
  }
  if (!isHex(signedTransaction)) throw new Error("signedTransaction must be serialized hex.");
  const serialized = signedTransaction as TransactionSerialized;
  const parsed = parseTransaction(serialized);
  const signer = getAddress(await recoverTransactionAddress({ serializedTransaction: serialized }));
  if (signer !== expected.from) throw new Error("Signed transaction sender does not match the Relay step.");
  if (parsed.chainId !== expected.chainId) throw new Error("Signed transaction chainId does not match the Relay step.");
  if (!parsed.to || getAddress(parsed.to) !== expected.to) {
    throw new Error("Signed transaction target does not match the Relay step.");
  }
  if ((parsed.data ?? "0x").toLowerCase() !== expected.data.toLowerCase()) {
    throw new Error("Signed transaction calldata does not match the Relay step.");
  }
  if ((parsed.value ?? 0n).toString() !== expected.value) {
    throw new Error("Signed transaction value does not match the Relay step.");
  }

  const client = createPublicClient({ transport: http(rpcUrl) });
  const actualChainId = await client.getChainId();
  if (actualChainId !== expected.chainId) {
    throw new Error(`RPC chain ID ${actualChainId} does not match Relay step chain ID ${expected.chainId}.`);
  }
  await client.call({
    account: expected.from,
    to: expected.to,
    data: expected.data,
    value: BigInt(expected.value),
  });
  const transactionHash = await client.sendRawTransaction({ serializedTransaction: serialized });
  const receipt = await client.waitForTransactionReceipt({
    hash: transactionHash,
    confirmations,
  });
  return { artifact, step, expected, transactionHash, receipt };
}
