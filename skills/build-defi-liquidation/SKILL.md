---
name: build-defi-liquidation
description: Evaluate, size, construct, and fork-test a DeFi lending liquidation using current borrower state, protocol parameters, oracle prices, eligible debt and collateral, close rules, bonuses, fees, liquidity, swap execution, and minimum net profit. Use when checking liquidation eligibility, building a direct or flash-funded liquidation, or diagnosing why a liquidation route would revert or lose money.
---

# Build DeFi Liquidation

Build from current onchain eligibility and protocol rules. Do not manipulate a forked borrower or oracle into eligibility and present that as an executable opportunity.

## Resolve the market

1. Confirm chain ID, protocol and version, market or pool, borrower, debt asset, collateral asset, and intended profit asset.
2. Resolve the protocol contracts, address provider or registry, oracle, tokens, and liquidation entrypoint from official deployments and verified code.
3. Read the borrower's collateral, debt, health metric, isolation or silo state, e-mode or market mode, and asset-specific configuration at one pinned block.
4. Read current liquidation threshold, close or target-health rules, bonus, protocol fee, price sources, caps, pause flags, and debt and collateral liquidity directly from contracts. Do not hardcode parameters from examples. For Aave concepts, consult `https://aave.com/help/borrowing/liquidations` and the deployed version's developer reference.

## Size the liquidation

Calculate the protocol-permitted repayment and expected collateral seized using raw integer units and the protocol's rounding direction. Include:

- oracle prices and update state
- accrued interest and scaled balances
- close factor or target-health calculation
- liquidation bonus and protocol share
- flash-loan premium or capital cost
- collateral withdrawal or unwrap costs
- swap fees, price impact, transfer taxes, gas, L1 data fee, and builder payment

Optimize for net profit subject to protocol limits and executable liquidity. Require a user-defined nonzero minimum profit after every cost.

## Construct and test

Choose direct funding, an established atomic router, or `$build-flash-loan-arbitrage` when temporary liquidity and callback execution are required. Minimize approvals and bind the borrower, assets, repayment maximum, recipient, deadline, swap bounds, and final profit check.

Fork-test the exact transaction at the pinned block without altering eligibility. Assert repayment, collateral received, all swaps, loan repayment, final balance delta, residual approvals, and gas. Test adverse oracle or pool movement, partial liquidation, paused reserves, insufficient collateral liquidity, changed health, and lost competition.

Refresh borrower state, oracle data, protocol parameters, pool liquidity, gas, and nonce immediately before any submission. Public liquidations are competitive and may become invalid before inclusion; use `$submit-private-evm-transaction` when its supported trust and disclosure model is acceptable.

## Report

Return eligibility at block, verified market contracts, borrower health, current parameters, maximum and selected repayment, expected collateral, full cost model, expected and minimum net profit, unsigned transaction or executor plan, pinned-fork tests, break-even conditions, and a classification of `not_eligible`, `unprofitable`, `conditionally_profitable`, or `inconclusive`.

Use `$assess-evm-transaction-safety` before any signing or submission. Never describe liquidation eligibility, ordering, or profit as guaranteed.
