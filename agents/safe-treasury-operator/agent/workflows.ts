import * as SafeProtocolKit from "@safe-global/protocol-kit";
import * as SafeApi from "@safe-global/api-kit";
import type { AgentChatInput } from "openpond-agent-sdk";
import {
  defineIntent,
  defineIntentRouter,
  defineWorkflow,
} from "openpond-agent-sdk";

import {
  address,
  apiKitConfig,
  asRecord,
  hex,
  normalizeMetaTransactions,
  normalizeSafeTransactionData,
  optionalNonnegativeInteger,
  optionalString,
  positiveInteger,
  requiredString,
  stableHash,
} from "../src/safe.js";

const Safe = SafeProtocolKit.default as unknown as typeof SafeProtocolKit.default.default;
const SafeApiKit = SafeApi.default as unknown as typeof SafeApi.default.default;
const { EthSafeTransaction } = SafeProtocolKit;

async function connectedSafe(input: Record<string, unknown>) {
  const rpcUrl = requiredString(input, "rpcUrl");
  const chainId = positiveInteger(input, "chainId");
  const safeAddress = address(input, "safeAddress");
  const protocolKit = await Safe.init({ provider: rpcUrl, safeAddress });
  const actualChainId = Number(await protocolKit.getChainId());
  if (actualChainId !== chainId) {
    throw new Error(`RPC chain ID ${actualChainId} does not match requested chain ID ${chainId}.`);
  }
  return { protocolKit, chainId, safeAddress };
}

export const inspectSafeWorkflow = defineWorkflow({
  name: "inspect-safe",
  description: "Read current Safe owners, threshold, nonce, modules, guard, version, and native balance.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const { protocolKit, chainId, safeAddress } = await connectedSafe(input);
    const [owners, threshold, nonce, modules, guard, fallbackHandler, balance] =
      await Promise.all([
        protocolKit.getOwners(),
        protocolKit.getThreshold(),
        protocolKit.getNonce(),
        protocolKit.getModules(),
        protocolKit.getGuard(),
        protocolKit.getFallbackHandler(),
        protocolKit.getBalance(),
      ]);
    const snapshot = {
      schema: "ducky.safe.snapshot.v1",
      sdk: {
        protocolKit: "8.0.4",
        apiKit: "5.0.1",
      },
      chainId,
      safeAddress,
      contractVersion: protocolKit.getContractVersion(),
      owners,
      threshold,
      nonce,
      modules,
      guard,
      fallbackHandler,
      balanceWei: balance.toString(),
      observedAt: new Date().toISOString(),
    };
    ctx.trace.event("safe.inspected", { chainId, safeAddress, ownerCount: owners.length });
    ctx.trace.artifact("artifacts/safe-snapshot.json", {
      snapshotHash: stableHash(snapshot),
      chainId,
      safeAddress,
    });
    return {
      text: `Safe ${safeAddress} on chain ${chainId} has ${owners.length} owners, threshold ${threshold}, nonce ${nonce}, ${modules.length} enabled modules, and guard ${guard}.`,
      intent: "inspect_safe",
      artifactRefs: ["artifacts/safe-snapshot.json"],
      metadata: { snapshot },
    };
  },
});

export const buildSafeTransactionWorkflow = defineWorkflow({
  name: "build-safe-transaction",
  description: "Build an unsigned Safe transaction and canonical Safe transaction hash.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const { protocolKit, chainId, safeAddress } = await connectedSafe(input);
    const allowDelegateCall = input.allowDelegateCall === true;
    const transactions = normalizeMetaTransactions(input.transactions, allowDelegateCall);
    const requestedNonce = optionalNonnegativeInteger(input, "nonce");
    const currentNonce = await protocolKit.getNonce();
    const nonce = requestedNonce ?? currentNonce;
    if (nonce < currentNonce) {
      throw new Error(`Requested nonce ${nonce} is below the current Safe nonce ${currentNonce}.`);
    }
    const safeTransaction = await protocolKit.createTransaction({
      transactions,
      onlyCalls: !allowDelegateCall,
      options: { nonce },
    });
    const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
    const artifact = {
      schema: "ducky.safe.transaction-plan.v1",
      sdk: {
        protocolKit: "8.0.4",
        typesKit: "4.0.1",
      },
      chainId,
      safeAddress,
      currentNonce,
      requestedNonce: requestedNonce ?? null,
      containsDelegateCall: transactions.some((tx) => tx.operation === 1),
      transactions,
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      planHash: stableHash({
        chainId,
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
      }),
      builtAt: new Date().toISOString(),
    };
    ctx.trace.event("safe.transaction.built", {
      chainId,
      safeAddress,
      nonce,
      transactionCount: transactions.length,
      safeTxHash,
    });
    ctx.trace.artifact("artifacts/safe-transaction-plan.json", {
      planHash: artifact.planHash,
      safeTxHash,
    });
    return {
      text: `Built unsigned Safe transaction ${safeTxHash} at nonce ${nonce} with ${transactions.length} inner transaction(s). It has not been signed, proposed, or executed.`,
      intent: "build_safe_transaction",
      artifactRefs: ["artifacts/safe-transaction-plan.json"],
      metadata: { artifact },
    };
  },
});

export const safeTransactionStatusWorkflow = defineWorkflow({
  name: "safe-transaction-status",
  description: "Read Safe Transaction Service proposal, confirmation, and execution status.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const chainId = positiveInteger(input, "chainId");
    const safeTxHash = hex(input, "safeTxHash", 32);
    const transactionServiceUrl = optionalString(input, "transactionServiceUrl");
    const apiKit = new SafeApiKit(apiKitConfig(chainId, transactionServiceUrl));
    const transaction = await apiKit.getTransaction(safeTxHash);
    const artifact = {
      schema: "ducky.safe.transaction-status.v1",
      chainId,
      safeTxHash,
      transaction,
      observedAt: new Date().toISOString(),
    };
    ctx.trace.event("safe.transaction.status_read", {
      chainId,
      safeTxHash,
      executed: transaction.isExecuted,
      confirmationCount: transaction.confirmations?.length ?? 0,
    });
    ctx.trace.artifact("artifacts/safe-transaction-status.json", {
      chainId,
      safeTxHash,
      statusHash: stableHash(artifact),
    });
    return {
      text: `Safe transaction ${safeTxHash} is ${transaction.isExecuted ? "executed" : "not executed"} with ${transaction.confirmations?.length ?? 0} confirmation(s).`,
      intent: "safe_transaction_status",
      artifactRefs: ["artifacts/safe-transaction-status.json"],
      metadata: { artifact },
    };
  },
});

export const proposeSafeTransactionWorkflow = defineWorkflow({
  name: "propose-safe-transaction",
  description: "Verify and publish an externally signed Safe proposal to a Safe Transaction Service.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const { protocolKit, chainId, safeAddress } = await connectedSafe(input);
    const safeTransactionData = normalizeSafeTransactionData(input.safeTransactionData);
    const suppliedHash = hex(input, "safeTxHash", 32).toLowerCase();
    const senderAddress = address(input, "senderAddress");
    const senderSignature = hex(input, "senderSignature");
    const transactionServiceUrl = optionalString(input, "transactionServiceUrl");
    const origin = optionalString(input, "origin");

    const safeTransaction = new EthSafeTransaction(safeTransactionData);
    const computedHash = (await protocolKit.getTransactionHash(safeTransaction)).toLowerCase();
    if (computedHash !== suppliedHash) {
      throw new Error(
        `Safe transaction hash mismatch: computed ${computedHash}, supplied ${suppliedHash}.`,
      );
    }
    if (!(await protocolKit.isOwner(senderAddress))) {
      throw new Error(`${senderAddress} is not a current owner of ${safeAddress}.`);
    }
    const currentNonce = await protocolKit.getNonce();
    if (safeTransactionData.nonce < currentNonce) {
      throw new Error(
        `Safe transaction nonce ${safeTransactionData.nonce} is below current nonce ${currentNonce}.`,
      );
    }

    const apiKit = new SafeApiKit(apiKitConfig(chainId, transactionServiceUrl));
    await apiKit.proposeTransaction({
      safeAddress,
      safeTransactionData,
      safeTxHash: suppliedHash,
      senderAddress,
      senderSignature,
      ...(origin ? { origin } : {}),
    });
    const artifact = {
      schema: "ducky.safe.proposal-receipt.v1",
      chainId,
      safeAddress,
      safeTxHash: suppliedHash,
      senderAddress,
      nonce: safeTransactionData.nonce,
      transactionServiceUrl: transactionServiceUrl ?? "safe-default",
      proposedAt: new Date().toISOString(),
      executed: false,
    };
    ctx.trace.event("safe.transaction.proposed", {
      chainId,
      safeAddress,
      safeTxHash: suppliedHash,
      senderAddress,
    });
    ctx.trace.artifact("artifacts/safe-proposal-receipt.json", artifact);
    return {
      text: `Published Safe proposal ${suppliedHash}. It is not executed and still requires the Safe's configured threshold and a separate onchain execution.`,
      intent: "propose_safe_transaction",
      artifactRefs: ["artifacts/safe-proposal-receipt.json"],
      metadata: { artifact },
    };
  },
});

export const safeChatWorkflow = defineWorkflow({
  name: "safe-chat",
  description: "Explain the Safe Treasury Operator action surface without performing writes.",
  async run() {
    return {
      text: "Use inspect-safe to read configuration, build-safe-transaction to create an unsigned hash, safe-transaction-status to check confirmations, or propose-safe-transaction to publish an externally signed proposal. This chat action never signs, proposes, or executes transactions.",
      intent: "safe_help",
    };
  },
});

const safeHelpIntent = defineIntent<AgentChatInput>({
  name: "safe_help",
  description: "Describe the available Safe treasury actions.",
  async run(ctx, input) {
    return ctx.workflow("safe-chat", input);
  },
});

export const safeChatRouter = defineIntentRouter({
  inputSchema: "AgentChatInput",
  intents: [safeHelpIntent],
  defaultIntent: safeHelpIntent,
  routing: { strategy: "code", traceSelection: true },
});
