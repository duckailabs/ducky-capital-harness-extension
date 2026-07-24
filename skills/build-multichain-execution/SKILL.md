---
name: build-multichain-execution
description: Plan, construct, validate, and coordinate a dependency graph of transactions across multiple blockchains without implying atomicity. Use when an operation spans several EVM chains, requires per-chain actions plus bridge or message checkpoints, needs coordinated nonce and inventory planning, or must define partial-failure and recovery behavior.
---

# Build Multichain Execution

Represent the operation as a graph of independently authorized chain actions. Do not treat inclusion, finality, or success on one chain as proof of success anywhere else.

## Define the execution

Require:

- the user objective and success condition
- every chain name, numeric chain ID, RPC source, and required finality
- signer, recipient, asset, amount, gas asset, and economic constraints per chain
- dependencies, deadlines, acceptable total duration, and fee budget
- bridge, messenger, relayer, oracle, or offchain service involved
- permitted recovery actions and the maximum acceptable stranded inventory

Resolve contracts, token representations, chain parameters, and protocol support from current authoritative sources for each exact chain. Confirm RPC chain IDs independently. Never identify an asset, contract, or destination from a symbol or display name alone.

## Build the dependency graph

Create one node for every signature, transaction, message, finality wait, relay, claim, or offchain checkpoint. Give each node:

- a stable identifier and chain ID
- prerequisites and expected postconditions
- signer and unsigned payload when applicable
- expiry, block or state assumptions, and confirmation threshold
- retry safety, idempotency evidence, and duplicate-execution risk
- timeout, failure state, and recovery or compensation path

Connect nodes only through observable conditions such as a finalized receipt, canonical message identifier, proven destination state, or accepted order status. Mark independent nodes that may execute concurrently. Do not use elapsed time alone as proof of finality or delivery.

Use `$build-cross-chain-transaction` for each bridge or message edge. Use the relevant protocol builder for each onchain action. Keep approvals, deposits, claims, swaps, and recovery transactions as separate nodes unless one verified contract makes them atomic.

## Validate resources and failure behavior

1. Inventory native gas and spendable assets on every chain before the first action.
2. Check allowances, nonces, pending transactions, token decimals, bridge limits, route availability, deadlines, rate limits, and destination gas requirements.
3. Simulate every EVM transaction at a pinned block using `$simulate-evm-transaction`. Validate non-EVM actions with the protocol's official dry-run or test environment when available.
4. Reconcile the output of each simulated node with the prerequisites of its dependents.
5. Model reorgs, delayed or censored relays, expired quotes, partial fills, price movement, duplicate messages, unavailable RPCs, and one-chain outages.
6. Define a stop condition before every irreversible step. Prefer pausing over continuing from an unknown state.

A collection of successful per-chain simulations is not proof that the full live execution will succeed. State which timing, relayer, market, and finality assumptions remain untested.

## Coordinate execution

Maintain node states such as `not_ready`, `ready`, `awaiting_confirmation`, `submitted`, `included`, `finalized`, `relay_pending`, `succeeded`, `recoverable`, and `failed`. Derive readiness from recorded evidence, not from optimistic assumptions.

Require explicit confirmation for each live signature or clearly rendered atomic batch. A general approval of the multichain plan is not authorization to broadcast every node. Refresh and reconfirm any payload whose nonce, fee, quote, deadline, route, or calldata changed.

## Report

Return the execution graph, per-chain configuration, verified contracts and assets, unsigned artifacts, inventory and allowance requirements, dependency conditions, expected timing, full fee model, simulations, trust assumptions, monitoring queries, stop conditions, and recovery playbook. Report current node states and the next safely executable node; never summarize a partial multichain execution as complete.
