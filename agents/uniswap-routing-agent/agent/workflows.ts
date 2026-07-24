import { createRequire } from "node:module";

import {
  defineIntent,
  defineIntentRouter,
  defineWorkflow,
  type AgentChatInput,
} from "openpond-agent-sdk";

import {
  address,
  asRecord,
  boundedInteger,
  normalizeSwapPlan,
  normalizeToken,
  positiveInteger,
  requiredString,
  stableHash,
  unsignedDecimal,
  verifyAndBroadcast,
} from "../src/evm.js";

const require = createRequire(import.meta.url);
const { JsonRpcProvider } = require("@ethersproject/providers") as typeof import("@ethersproject/providers");
const { Protocol } = require("@uniswap/router-sdk") as typeof import("@uniswap/router-sdk");
const { CurrencyAmount, Percent, Token, TradeType } = require("@uniswap/sdk-core") as typeof import("@uniswap/sdk-core");
const { AlphaRouter, SwapType } = require("@uniswap/smart-order-router") as typeof import("@uniswap/smart-order-router");

export const quoteUniswapSwapWorkflow = defineWorkflow({
  name: "quote-uniswap-swap",
  description: "Quote an exact-input Uniswap route and build an unsigned SwapRouter02 transaction plan.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const rpcUrl = requiredString(input, "rpcUrl");
    const chainId = positiveInteger(input, "chainId");
    const sender = address(input, "sender");
    const recipient = address(input, "recipient");
    const tokenInInput = normalizeToken(input.tokenIn, "tokenIn", chainId);
    const tokenOutInput = normalizeToken(input.tokenOut, "tokenOut", chainId);
    if (tokenInInput.address === tokenOutInput.address) {
      throw new Error("tokenIn and tokenOut must be different.");
    }
    const amountInRaw = unsignedDecimal(input, "amountInRaw");
    if (BigInt(amountInRaw) === 0n) throw new Error("amountInRaw must be greater than zero.");
    const slippageBps = boundedInteger(input, "slippageBps", 1, 5000);
    const deadlineSeconds = boundedInteger(input, "deadlineSeconds", 60, 86400, 1200);
    const deadline = Math.floor(Date.now() / 1000) + deadlineSeconds;

    const provider = new JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      throw new Error(`RPC chain ID ${network.chainId} does not match requested chain ID ${chainId}.`);
    }
    const tokenIn = new Token(
      chainId,
      tokenInInput.address,
      tokenInInput.decimals,
      tokenInInput.symbol,
      tokenInInput.name,
    );
    const tokenOut = new Token(
      chainId,
      tokenOutInput.address,
      tokenOutInput.decimals,
      tokenOutInput.symbol,
      tokenOutInput.name,
    );
    const router = new AlphaRouter({ chainId, provider });
    const route = await router.route(
      CurrencyAmount.fromRawAmount(tokenIn, amountInRaw),
      tokenOut,
      TradeType.EXACT_INPUT,
      {
        type: SwapType.SWAP_ROUTER_02,
        recipient,
        slippageTolerance: new Percent(slippageBps, 10_000),
        deadline,
        simulate: { fromAddress: sender },
      },
    );
    if (!route?.methodParameters) throw new Error("Uniswap returned no executable route.");

    const quoteOutRaw = route.quote.quotient.toString();
    const minimumAmountOutRaw = route.trade
      .minimumAmountOut(new Percent(slippageBps, 10_000))
      .quotient.toString();
    const normalized = {
      schema: "ducky.uniswap.swap-plan.v1",
      chainId,
      sender,
      recipient,
      tokenIn: tokenInInput,
      tokenOut: tokenOutInput,
      amountInRaw,
      quoteOutRaw,
      minimumAmountOutRaw,
      slippageBps,
      deadline,
      transaction: {
        chainId,
        from: sender,
        to: address({ to: route.methodParameters.to }, "to"),
        data: route.methodParameters.calldata as `0x${string}`,
        valueWei: BigInt(route.methodParameters.value).toString(),
      },
      route: route.route.map((segment) => ({
        protocol: Protocol[segment.protocol],
        percent: segment.percent,
        amountInRaw: segment.amount.quotient.toString(),
        quoteOutRaw: segment.quote.quotient.toString(),
        gasEstimate: segment.gasEstimate.toString(),
        tokenPath: segment.tokenPath.map((currency) =>
          currency.isToken ? currency.address : "native",
        ),
        poolIdentifiers: segment.poolIdentifiers,
      })),
      blockNumber: route.blockNumber.toString(),
      estimatedGasUsed: route.estimatedGasUsed.toString(),
      gasPriceWei: route.gasPriceWei.toString(),
      sdk: {
        smartOrderRouter: "4.31.10",
        sdkCore: "7.18.0",
        routerType: "SWAP_ROUTER_02",
      },
    };
    const artifact = { ...normalized, planHash: stableHash(normalized) };
    ctx.trace.event("uniswap.route.quoted", {
      chainId,
      sender,
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      planHash: artifact.planHash,
    });
    ctx.trace.artifact("artifacts/uniswap-swap-plan.json", {
      planHash: artifact.planHash,
      chainId,
      deadline,
    });
    return {
      text: `Quoted ${amountInRaw} raw ${tokenIn.symbol ?? "input token"} for ${quoteOutRaw} raw ${tokenOut.symbol ?? "output token"} with minimum output ${minimumAmountOutRaw}. This is unsigned and expires at ${new Date(deadline * 1000).toISOString()}.`,
      intent: "quote_uniswap_swap",
      artifactRefs: ["artifacts/uniswap-swap-plan.json"],
      metadata: { artifact },
    };
  },
});

export const reviewUniswapPlanWorkflow = defineWorkflow({
  name: "review-uniswap-plan",
  description: "Verify a Uniswap plan's schema, exact transaction fields, deadline, and content hash.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const plan = normalizeSwapPlan(input.plan);
    const expired = plan.deadline <= Math.floor(Date.now() / 1000);
    const review = {
      validHash: true,
      expired,
      requiresApproval: true,
      chainId: plan.chainId,
      sender: plan.sender,
      target: plan.transaction.to,
      valueWei: plan.transaction.valueWei,
      minimumAmountOutRaw: plan.minimumAmountOutRaw,
      deadline: plan.deadline,
      planHash: plan.planHash,
    };
    ctx.trace.artifact("artifacts/uniswap-plan-review.json", review);
    return {
      text: `Plan ${plan.planHash} has a valid content hash and is ${expired ? "expired" : "not expired"}. Broadcasting still requires an exact external signature, fresh simulation, and approval.`,
      intent: "review_uniswap_plan",
      artifactRefs: ["artifacts/uniswap-plan-review.json"],
      metadata: { review },
    };
  },
});

export const broadcastUniswapSwapWorkflow = defineWorkflow({
  name: "broadcast-uniswap-swap",
  description: "Verify, simulate, broadcast, and monitor an externally signed Uniswap transaction.",
  async run(ctx, rawInput) {
    const input = asRecord(rawInput);
    const rpcUrl = requiredString(input, "rpcUrl");
    const signedTransaction = requiredString(input, "signedTransaction");
    const confirmations = boundedInteger(input, "confirmations", 1, 20, 1);
    const { plan, transactionHash, receipt } = await verifyAndBroadcast(
      rpcUrl,
      input.plan,
      signedTransaction,
      confirmations,
    );
    const artifact = {
      schema: "ducky.uniswap.broadcast-receipt.v1",
      chainId: plan.chainId,
      planHash: plan.planHash,
      transactionHash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      confirmations,
      broadcastAt: new Date().toISOString(),
    };
    ctx.trace.event("uniswap.transaction.broadcast", {
      chainId: plan.chainId,
      planHash: plan.planHash,
      transactionHash,
      status: receipt.status,
    });
    ctx.trace.artifact("artifacts/uniswap-broadcast-receipt.json", artifact);
    return {
      text: `Broadcast ${transactionHash} for reviewed plan ${plan.planHash}; receipt status is ${receipt.status}.`,
      intent: "broadcast_uniswap_swap",
      artifactRefs: ["artifacts/uniswap-broadcast-receipt.json"],
      metadata: { artifact },
    };
  },
});

export const uniswapChatWorkflow = defineWorkflow({
  name: "uniswap-chat",
  description: "Explain the Uniswap agent's explicit actions without performing network or write operations.",
  async run() {
    return {
      text: "Use quote-uniswap-swap for an unsigned exact-input plan, review-uniswap-plan to verify its hash and deadline, and broadcast-uniswap-swap only with an externally signed exact match. This chat action never quotes, signs, or broadcasts.",
      intent: "uniswap_help",
    };
  },
});

const helpIntent = defineIntent<AgentChatInput>({
  name: "uniswap_help",
  description: "Explain the explicit Uniswap routing actions.",
  async run(ctx, input) {
    return ctx.workflow("uniswap-chat", input);
  },
});

export const uniswapChatRouter = defineIntentRouter({
  inputSchema: "AgentChatInput",
  intents: [helpIntent],
  defaultIntent: helpIntent,
  routing: { strategy: "code", traceSelection: true },
});
