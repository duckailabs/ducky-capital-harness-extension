---
name: analyze-cross-chain-arbitrage
description: Evaluate arbitrage across different blockchains using synchronized market observations, executable liquidity, pre-positioned inventory, bridge and rebalancing costs, latency, hedging, finality, and partial-execution risk. Use when comparing prices across chains, sizing a cross-chain arbitrage, evaluating inventory-based or hedged execution, or deciding whether an apparent spread is realistically profitable.
---

# Analyze Cross-Chain Arbitrage

Treat cross-chain arbitrage as a time-dependent inventory and execution problem. Transactions on independent chains are not atomic unless a specific verified protocol enforces that property.

## Define the strategy

Classify the proposed route:

- pre-positioned inventory with simultaneous buys and sells
- bridge-first execution followed by a destination trade
- trade-first execution followed by inventory rebalancing
- hedged execution using a spot, perp, option, or centralized venue
- protocol-enforced cross-chain intent or settlement

Record every chain, venue, asset representation, signer, balance, bridge, hedge, and settlement currency. Specify what constitutes profit and when it is considered realized.

## Capture comparable market state

1. Resolve tokens, pools, routers, order books, bridges, and settlement contracts from current authoritative chain-specific sources.
2. Record the block number, block hash, timestamp, finality status, and observation time for every chain or venue.
3. Read executable depth and apply exact protocol math. Do not compare spot display prices or combine observations without measuring their time skew.
4. Verify token decimals, transfer behavior, wrapped representations, deposit and withdrawal availability, route limits, and current bridge status.
5. Separate stale-data uncertainty from modeled price risk.

Use `$analyze-dex-arbitrage` for same-chain legs and order-book-specific tooling for non-AMM legs.

## Model executable economics

Include:

- price impact, trading fees, gas, calldata or L1 fees, and failed-transaction gas
- bridge, relayer, withdrawal, claim, conversion, and destination-gas costs
- borrow interest, perp funding, hedge spread, execution fees, and basis risk
- inventory opportunity cost and the cost of restoring target balances
- adverse selection, MEV, sequencer ordering, reorgs, and quote expiry
- capital stranded during challenge periods, outages, rate limits, or paused routes

Optimize for conservative net profit after completing the entire rebalance cycle, not the visible entry spread. Size each leg to executable liquidity and available inventory. Do not count transferred principal, borrowed capital, or unrelated prefunded balances as profit.

## Analyze partial execution

Model at least these outcomes:

1. both trade legs succeed
2. the buy succeeds and the sell fails or partially fills
3. the sell succeeds and the buy fails or partially fills
4. both trades succeed but the hedge or rebalance fails
5. the bridge or withdrawal is delayed, repriced, paused, censored, or refunded
6. one chain reorganizes after the other leg becomes irreversible

For each outcome, calculate inventory, directional exposure, maximum loss, recovery actions, and additional fees. Define price, latency, fill, gas, and bridge break-even thresholds.

## Validate and report

Simulate each onchain leg at pinned state and validate bridge or venue actions with official tooling when available. Label any untestable coordination assumption. Recompute with fresh state immediately before presenting an execution candidate.

Return observations with their time skew, route and inventory plan, raw per-leg amounts, gross spread, every cost, expected net profit, conservative and adverse scenarios, capital duration, break-even thresholds, simulations, recovery plan, and a classification of `not_executable`, `unprofitable`, `conditionally_profitable`, or `inconclusive`.

Analysis does not authorize signing or submission. Hand a viable plan to `$build-multichain-execution` and require separate confirmation for every live action.
