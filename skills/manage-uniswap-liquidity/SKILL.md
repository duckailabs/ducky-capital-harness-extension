---
name: manage-uniswap-liquidity
description: Plan, encode, and simulate Uniswap liquidity operations including pool inspection or initialization and creating, increasing, decreasing, collecting, or closing v3 and v4 positions. Use when a user wants to manage LP positions, choose a price range, migrate liquidity, inspect v4 hooks, or prepare an unsigned position-manager transaction.
---

# Manage Uniswap Liquidity

Construct a guarded liquidity operation from verified pool state and official deployments. Do not sign or broadcast.

## Establish the position

1. Check `command -v cast`; if missing, recommend `https://www.getfoundry.sh/introduction/installation` and stop command-dependent construction.
2. Require the chain ID, owner, recipient, protocol version, operation, token addresses, and token budgets.
3. Resolve pool and position-manager addresses from `https://developers.uniswap.org/deployments` for the exact chain.
4. Read token decimals, balances, current price, tick, liquidity, fee tier, tick spacing, position state, uncollected fees, and approvals at one reported block.
5. Distinguish adding liquidity from swapping into the pool's required token ratio. Do not silently add a swap the user did not request.

## Define the operation

- **Create or increase:** specify lower and upper prices, corresponding usable ticks, desired token amounts, minimum accepted amounts, recipient, and deadline.
- **Decrease or close:** specify liquidity units or percentage, minimum token amounts, recipient, and deadline. State whether fees are collected in the same transaction.
- **Collect:** specify the exact position, recipient, and collection maxima. Do not imply that collecting fees removes liquidity.
- **Initialize:** require the initial square-root price and show the equivalent human price with token ordering and decimals. Treat pool initialization as irreversible economic state.
- **Migrate:** enumerate remove, collect, approvals, optional swap, and add steps; preserve minimum outputs at each value-changing step.

Explain range exposure, impermanent loss, out-of-range behavior, fee assumptions, and concentration. Do not optimize a range solely from current price without the user's risk horizon and tolerance.

## Inspect v4 pools and hooks

For v4, identify the full pool key: currency ordering, fee, tick spacing, and hook address. Inspect verified hook source, deployed bytecode, permissions encoded by its address, upgradeability, callback behavior, fee changes, deltas, and external calls. Classify an unverified or unexplained hook as high caution.

Do not treat two pools with the same token pair as equivalent when their fee, tick spacing, or hook differs.

## Encode and simulate

1. Build the narrowest token or Permit2 permissions required.
2. Encode the correct position-manager or Universal Router call for the verified deployment version.
3. Decode the final calldata and compare token ordering, position identifier, ticks, liquidity, amounts, recipient, and deadline.
4. Simulate from the intended owner at a pinned block. Measure token deltas, position ownership and liquidity, collected fees, refunds, residual approvals, hook calls, and gas.
5. Assert the user's minimum received amounts and maximum spend. Reject any construction that requires removing those bounds.

## Report

Return the unsigned transaction artifact, pool identity and provenance, operation summary, current and proposed range, raw and formatted token amounts, expected position change, approval plan, decoded calldata, simulation deltas, gas estimate, hook assessment, and market-state limitations. Use `$assess-evm-transaction-safety` before `$send-evm-transaction`.
