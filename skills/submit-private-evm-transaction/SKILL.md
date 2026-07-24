---
name: submit-private-evm-transaction
description: Prepare, simulate, sign, and submit an explicitly approved EVM transaction or ordered bundle through a private relay or protected RPC, then monitor inclusion without unapproved public fallback. Use for swaps, liquidations, arbitrage, deployments, or other transactions that need frontrunning protection, atomic ordering, target blocks, or controlled information disclosure.
---

# Submit Private EVM Transaction

Use private submission only after the underlying transaction or bundle has passed construction and safety review. Private routing changes distribution and inclusion behavior; it does not make a transaction correct or confidential forever.

## Verify the submission channel

1. Confirm chain support, relay identity, authentication scheme, RPC method, target-block semantics, retention, multiplexing, data-sharing, refund, and cancellation behavior from current official documentation. For Flashbots, start at `https://docs.flashbots.net/`.
2. Distinguish a single private transaction, an ordered bundle, and a protected public-RPC submission. Record which parties may receive the payload or hints.
3. Define target block or block range, expiry, allowed reverting hashes, replacement identifier, builder set, refund recipient, and public-fallback policy.
4. Default public fallback to disabled. Never publish after private expiry without fresh explicit approval.

## Prepare and simulate

Check for Cast and any relay-specific client required. Recommend `https://www.getfoundry.sh/introduction/installation` when Cast is absent. Inspect installed command help rather than assuming flags.

For every transaction, verify chain, signer, nonce, target, value, calldata, gas, fee caps, and constraints. For a bundle, verify nonce continuity, exact order, aggregate gas, allowed reverts, target-state assumptions, builder payment, refunds, and net result.

Simulate against the parent state of each candidate target block when tooling supports it. Reject a bundle that depends on unmodeled pending transactions or counts prefunded balances as profit. Refresh simulation after any field or target block changes.

## Confirm and submit

Use only a signer already configured through a safe keystore flow, hardware wallet, or approved remote signer. Never request or expose raw signing secrets.

Render the exact signed scope and relay policy before submission. Require explicit confirmation covering the transactions, target range, recipients, maximum fees, revert policy, information shared, and public-fallback setting.

Submit with the relay's documented current method, such as a supported private-transaction or bundle RPC. Capture the relay response and locally computed transaction hashes. Do not treat relay acceptance as chain inclusion.

## Monitor

Track the relay status, public receipts, target blocks, nonce consumption, and competing hashes. Stop retrying after expiry or nonce consumption. Cancel through the relay when supported and requested; verify cancellation state rather than assuming it propagated to every builder.

Report submission method, disclosure policy, relay response, hashes, target range, simulations, inclusion or expiry, effective fees, asset deltas, and any fallback action. Never claim guaranteed inclusion, privacy, or MEV protection.
