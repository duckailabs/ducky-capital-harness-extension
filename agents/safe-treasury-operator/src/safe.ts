import { createHash } from "node:crypto";

import type {
  MetaTransactionData,
  SafeTransactionData,
} from "@safe-global/types-kit";
import { OperationType } from "@safe-global/types-kit";
import { getAddress, isAddress, isHex } from "viem";

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown, label = "input"): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

export function requiredString(
  record: JsonRecord,
  key: string,
  options: { maxLength?: number } = {},
): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }
  const normalized = value.trim();
  if (options.maxLength && normalized.length > options.maxLength) {
    throw new Error(`${key} must be ${options.maxLength} characters or fewer.`);
  }
  return normalized;
}

export function optionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error(`${key} must be a string.`);
  return value.trim();
}

export function positiveInteger(record: JsonRecord, key: string): number {
  const value = record[key];
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new Error(`${key} must be a positive safe integer.`);
  }
  return Number(value);
}

export function optionalNonnegativeInteger(
  record: JsonRecord,
  key: string,
): number | undefined {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new Error(`${key} must be a nonnegative safe integer.`);
  }
  return Number(value);
}

export function nonnegativeInteger(record: JsonRecord, key: string): number {
  const value = optionalNonnegativeInteger(record, key);
  if (value === undefined) throw new Error(`${key} is required.`);
  return value;
}

export function address(record: JsonRecord, key: string): `0x${string}` {
  const value = requiredString(record, key);
  if (!isAddress(value)) throw new Error(`${key} must be a valid EVM address.`);
  return getAddress(value);
}

export function hex(record: JsonRecord, key: string, bytes?: number): `0x${string}` {
  const value = requiredString(record, key);
  const hasExpectedSize = bytes === undefined || (value.length - 2) / 2 === bytes;
  if (!isHex(value) || value.length % 2 !== 0 || !hasExpectedSize) {
    throw new Error(`${key} must be valid${bytes ? ` ${bytes}-byte` : ""} hex.`);
  }
  return value;
}

export function unsignedDecimal(record: JsonRecord, key: string): string {
  const value = requiredString(record, key);
  if (!/^[0-9]+$/.test(value)) throw new Error(`${key} must be an unsigned decimal string.`);
  return BigInt(value).toString();
}

export function normalizeMetaTransactions(
  value: unknown,
  allowDelegateCall: boolean,
): MetaTransactionData[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("transactions must contain at least one transaction.");
  }
  if (value.length > 64) throw new Error("transactions may contain at most 64 entries.");

  return value.map((candidate, index) => {
    const tx = asRecord(candidate, `transactions[${index}]`);
    const operationValue = tx.operation ?? OperationType.Call;
    if (operationValue !== OperationType.Call && operationValue !== OperationType.DelegateCall) {
      throw new Error(`transactions[${index}].operation must be 0 or 1.`);
    }
    if (operationValue === OperationType.DelegateCall && !allowDelegateCall) {
      throw new Error(
        `transactions[${index}] is a delegate call. Set allowDelegateCall=true only after reviewing the target code and storage effects.`,
      );
    }
    return {
      to: address(tx, "to"),
      value: unsignedDecimal(tx, "value"),
      data: hex(tx, "data"),
      operation: operationValue,
    };
  });
}

export function normalizeSafeTransactionData(value: unknown): SafeTransactionData {
  const data = asRecord(value, "safeTransactionData");
  const operationValue = data.operation;
  if (operationValue !== OperationType.Call && operationValue !== OperationType.DelegateCall) {
    throw new Error("safeTransactionData.operation must be 0 or 1.");
  }
  return {
    to: address(data, "to"),
    value: unsignedDecimal(data, "value"),
    data: hex(data, "data"),
    operation: operationValue,
    safeTxGas: unsignedDecimal(data, "safeTxGas"),
    baseGas: unsignedDecimal(data, "baseGas"),
    gasPrice: unsignedDecimal(data, "gasPrice"),
    gasToken: address(data, "gasToken"),
    refundReceiver: address(data, "refundReceiver"),
    nonce: nonnegativeInteger(data, "nonce"),
  };
}

export function stableHash(value: unknown): string {
  return `sha256:${createHash("sha256").update(stableJson(value)).digest("hex")}`;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as JsonRecord;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

export function apiKitConfig(
  chainId: number,
  transactionServiceUrl?: string,
): { chainId: bigint; txServiceUrl?: string; apiKey?: string } {
  const apiKey = process.env.SAFE_API_KEY?.trim();
  if (!transactionServiceUrl && !apiKey) {
    throw new Error(
      "SAFE_API_KEY is required for the default Safe Transaction Service; alternatively provide transactionServiceUrl for a custom service.",
    );
  }
  return {
    chainId: BigInt(chainId),
    ...(transactionServiceUrl ? { txServiceUrl: transactionServiceUrl } : {}),
    ...(apiKey ? { apiKey } : {}),
  };
}
