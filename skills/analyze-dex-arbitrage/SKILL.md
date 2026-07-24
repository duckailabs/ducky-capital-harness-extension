---
name: analyze-dex-arbitrage
description: Evaluate DEX arbitrage routes from pinned onchain state using exact pool math, executable liquidity, fees, gas, loan premiums, builder payments, and MEV assumptions. Use when a user wants to compare prices across pools, size an arbitrage, validate expected net profit, investigate why a route is not executable, or prepare a route for atomic implementation.
---

# Analyze DEX Arbitrage

Determine whether an apparent price difference is an executable opportunity after all costs and constraints. Analysis does not authorize construction, signing, or broadcast.

## Pin the market snapshot

1. Check for `cast`, `anvil`, and `forge`. If Foundry is unavailable, recommend `https://www.getfoundry.sh/introduction/installation` and clearly limit the analysis.
2. Confirm one chain ID and one concrete block number. Arbitrage legs on different chains are not atomic DEX arbitrage.
3. Resolve every token, pool, router, quoter, hook, and lending contract from official chain-specific sources.
4. Read pool state and token metadata at the same block. Do not combine API quotes, reserves, ticks, oracle values, or gas inputs from different snapshots without labeling the mismatch.

## Model executable economics

1. Use integer token units and the protocol's actual swap math. Include concentrated-liquidity crossings, dynamic fees, hook deltas, transfer taxes, rebasing, and rounding.
2. Model price impact on every leg rather than multiplying spot prices.
3. Include all costs: pool and protocol fees, flash-loan premium, gas, L1 data fee, wrapping, token transfers, builder or private-relay payment, and any capital opportunity cost the user requests.
4. Optimize input size for net profit, not gross spread. Reject sizes that exceed usable liquidity or violate the route's minimum outputs.
5. Measure profit in a specified asset and relative to starting balances. Do not count prefunded executor assets, loan principal, or uncollected unrelated balances as profit.

## Validate execution

Encode or implement the atomic route, then fork-test it at the pinned block from the intended executor. Require repayment and a nonzero user-defined `minProfit` in contract logic or final router balance checks.

Re-run the quote at a fresher block before presenting an execution candidate. Model sensitivity to input size, gas price, and one or more adverse price movements. Consider public-mempool copying, backrunning, sandwiches, proposer or sequencer ordering, stale-state latency, failed-transaction gas, and competition.

Never describe simulated profit as guaranteed. A route visible in public state may be consumed before inclusion.

## Report

Return:

- chain, pinned block, timestamp, and data sources
- ordered route with verified contracts, pools, fees, and hooks
- input size and raw per-leg amounts
- gross spread, every cost, and expected net profit
- break-even gas price and break-even adverse price movement
- fork-test result and asserted minimum profit
- sensitivity table for size and state movement
- execution, MEV, token, contract, and data-quality risks
- classification as `not_executable`, `unprofitable`, `conditionally_profitable`, or `inconclusive`

Hand a conditionally profitable route to `$compose-atomic-evm-trade` or `$build-flash-loan-arbitrage`; do not broadcast from this skill.
