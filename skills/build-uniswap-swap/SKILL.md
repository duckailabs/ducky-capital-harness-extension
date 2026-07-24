---
name: build-uniswap-swap
description: Quote, route, encode, and simulate guarded Uniswap swaps across supported protocol versions using official deployments, Universal Router, Permit2, and exact slippage and deadline constraints. Use when a user wants to swap tokens through Uniswap, compare exact-input or exact-output routes, prepare multi-hop calldata, or build an unsigned swap transaction.
---

# Build Uniswap Swap

Build a reproducible swap from verified Uniswap contracts and current chain state. Do not sign or broadcast.

## Prepare the request

1. Check `command -v cast`; if missing, direct the user to `https://www.getfoundry.sh/introduction/installation` and stop command-dependent construction.
2. Require the chain ID, sender, recipient, input and output token addresses, exact-input or exact-output mode, amount, maximum slippage, and deadline policy.
3. Read token decimals and balances onchain. Distinguish native currency from wrapped native currency.
4. Resolve routers, Permit2, pools, position managers, and quoter contracts from `https://developers.uniswap.org/deployments`. Never reuse an address from another chain.

## Select and verify the route

1. Compare viable v2, v3, and v4 routes at one reported block. Include pool fees, price impact, gas, wrapping, and transfer behavior.
2. Prefer a route whose contracts and pools can be independently verified. Do not route through an unknown v4 hook without inspecting its code, permissions, and economic effects.
3. For exact input, compute and encode a nonzero minimum output from the user's slippage bound. For exact output, compute and encode a maximum input.
4. Use a short future deadline. Set the recipient and any refund recipient explicitly.
5. Treat fee-on-transfer, rebasing, blacklistable, pausable, upgradeable, or otherwise nonstandard tokens as high caution and verify router support.

## Encode the swap

Use the simplest supported route. When Universal Router is appropriate, follow `https://developers.uniswap.org/docs/protocols/universal-router/overview` and its current command reference.

1. Resolve the exact router version and command definitions used by the deployed address.
2. Build the command bytes and parallel inputs in execution order.
3. Add only the necessary Permit2 transfer, wrap or unwrap, swap, sweep, refund, and balance-check commands.
4. Decode the complete `execute(...)` calldata back into commands and inputs. Verify token path, pool fees, hook address, payer, recipient, amount, slippage bound, and deadline.
5. Prepare the narrowest required token or Permit2 permission separately. Never hide an approval inside the swap summary.

## Simulate and compare

Simulate from the intended sender at the quote block or the freshest reproducible block. Verify:

- input spent and output received
- minimum-output or maximum-input enforcement
- native wrapping and refunds
- remaining router or Permit2 allowances
- unexpected recipients, callbacks, hooks, or residual router balances
- gas estimate and total native balance requirement

Reject a route that only succeeds after removing its slippage, deadline, recipient, or profit protections.

## Report

Return the unsigned transaction artifact plus route version, pools and fees, quote block and timestamp, expected and protected amounts, price impact, gas estimate, approval plan, decoded router commands, simulation deltas, contract provenance, and state-drift or MEV risks. State that the quote must be refreshed immediately before signing. Use `$assess-evm-transaction-safety` before `$send-evm-transaction`.
