import { createHash } from "node:crypto";

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

export function address(record: JsonRecord, key: string): `0x${string}` {
  const value = requiredString(record, key);
  if (!isAddress(value)) throw new Error(`${key} must be a valid EVM address.`);
  return getAddress(value);
}

export function dataHex(record: JsonRecord, key: string): Hex {
  const value = requiredString(record, key);
  if (!isHex(value) || value.length % 2 !== 0) throw new Error(`${key} must be byte-aligned hex.`);
  return value;
}

export function unsignedDecimal(record: JsonRecord, key: string): string {
  const value = requiredString(record, key);
  if (!/^[0-9]+$/.test(value)) throw new Error(`${key} must be an unsigned decimal string.`);
  return BigInt(value).toString();
}

export function normalizeToken(value: unknown, key: string, chainId: number) {
  const token = asRecord(value, key);
  if (token.chainId !== undefined && positiveInteger(token, "chainId") !== chainId) {
    throw new Error(`${key}.chainId does not match the requested chain.`);
  }
  const decimals = boundedInteger(token, "decimals", 0, 255);
  const symbol = typeof token.symbol === "string" && token.symbol.trim()
    ? token.symbol.trim()
    : undefined;
  const name = typeof token.name === "string" && token.name.trim()
    ? token.name.trim()
    : undefined;
  return {
    chainId,
    address: address(token, "address"),
    decimals,
    ...(symbol ? { symbol } : {}),
    ...(name ? { name } : {}),
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

export function normalizeSwapPlan(value: unknown) {
  const plan = asRecord(value, "plan");
  if (plan.schema !== "ducky.uniswap.swap-plan.v1") {
    throw new Error("plan.schema must be ducky.uniswap.swap-plan.v1.");
  }
  const chainId = positiveInteger(plan, "chainId");
  const transaction = asRecord(plan.transaction, "plan.transaction");
  const normalized = {
    schema: "ducky.uniswap.swap-plan.v1",
    chainId,
    sender: address(plan, "sender"),
    recipient: address(plan, "recipient"),
    tokenIn: normalizeToken(plan.tokenIn, "plan.tokenIn", chainId),
    tokenOut: normalizeToken(plan.tokenOut, "plan.tokenOut", chainId),
    amountInRaw: unsignedDecimal(plan, "amountInRaw"),
    quoteOutRaw: unsignedDecimal(plan, "quoteOutRaw"),
    minimumAmountOutRaw: unsignedDecimal(plan, "minimumAmountOutRaw"),
    slippageBps: boundedInteger(plan, "slippageBps", 1, 5000),
    deadline: positiveInteger(plan, "deadline"),
    transaction: {
      chainId: positiveInteger(transaction, "chainId"),
      from: address(transaction, "from"),
      to: address(transaction, "to"),
      data: dataHex(transaction, "data"),
      valueWei: unsignedDecimal(transaction, "valueWei"),
    },
    route: plan.route ?? [],
    blockNumber: plan.blockNumber ?? null,
    estimatedGasUsed: plan.estimatedGasUsed ?? null,
    gasPriceWei: plan.gasPriceWei ?? null,
    sdk: plan.sdk ?? null,
  };
  if (normalized.transaction.chainId !== chainId) {
    throw new Error("plan.transaction.chainId does not match plan.chainId.");
  }
  if (normalized.transaction.from !== normalized.sender) {
    throw new Error("plan.transaction.from does not match plan.sender.");
  }
  const planHash = requiredString(plan, "planHash");
  const computedPlanHash = stableHash(normalized);
  if (planHash !== computedPlanHash) {
    throw new Error(`Plan hash mismatch: computed ${computedPlanHash}, supplied ${planHash}.`);
  }
  return { ...normalized, planHash };
}

export async function verifyAndBroadcast(
  rpcUrl: string,
  rawPlan: unknown,
  signedTransaction: string,
  confirmations: number,
) {
  const plan = normalizeSwapPlan(rawPlan);
  if (plan.deadline <= Math.floor(Date.now() / 1000)) {
    throw new Error("The swap deadline has passed. Requote and sign a fresh transaction.");
  }
  if (!isHex(signedTransaction)) throw new Error("signedTransaction must be serialized hex.");
  const serialized = signedTransaction as TransactionSerialized;
  const parsed = parseTransaction(serialized);
  const signer = getAddress(await recoverTransactionAddress({ serializedTransaction: serialized }));
  if (signer !== plan.sender) throw new Error(`Signed transaction sender ${signer} does not match ${plan.sender}.`);
  if (parsed.chainId !== plan.chainId) throw new Error("Signed transaction chainId does not match the plan.");
  if (!parsed.to || getAddress(parsed.to) !== plan.transaction.to) {
    throw new Error("Signed transaction target does not match the plan.");
  }
  if ((parsed.data ?? "0x").toLowerCase() !== plan.transaction.data.toLowerCase()) {
    throw new Error("Signed transaction calldata does not match the plan.");
  }
  if ((parsed.value ?? 0n).toString() !== plan.transaction.valueWei) {
    throw new Error("Signed transaction value does not match the plan.");
  }

  const client = createPublicClient({ transport: http(rpcUrl) });
  const actualChainId = await client.getChainId();
  if (actualChainId !== plan.chainId) {
    throw new Error(`RPC chain ID ${actualChainId} does not match plan chain ID ${plan.chainId}.`);
  }
  await client.call({
    account: plan.sender,
    to: plan.transaction.to,
    data: plan.transaction.data,
    value: BigInt(plan.transaction.valueWei),
  });
  const transactionHash = await client.sendRawTransaction({ serializedTransaction: serialized });
  const receipt = await client.waitForTransactionReceipt({
    hash: transactionHash,
    confirmations,
  });
  return { plan, transactionHash, receipt };
}
