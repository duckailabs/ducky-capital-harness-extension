---
name: manage-pending-evm-transaction
description: Diagnose and manage a pending EVM transaction by comparing receipts, public and provider mempool evidence, sender nonces, fees, replacements, and cancellation options. Use when a transaction is stuck, missing, underpriced, replaced, dropped, or needs an explicitly approved speed-up or same-nonce cancellation.
---

# Manage Pending EVM Transaction

Establish the transaction's state before constructing any replacement. Never retry an ambiguous submission blindly.

## Collect evidence

1. Require the chain ID and transaction hash. Confirm the RPC chain before interpreting the hash.
2. Check for Cast and record its version. If unavailable, recommend `https://www.getfoundry.sh/introduction/installation` or use equivalent standard JSON-RPC methods.
3. Fetch the transaction and receipt from more than one trusted provider when possible. Inspect the canonical explorer and the submitting provider's response.
4. Read the sender's `latest` and `pending` transaction counts. Inspect the node transaction pool only when the RPC exposes it.
5. Search for another transaction from the same sender and nonce. A missing hash can mean dropped, private, replaced, unknown to that provider, or never accepted.

Classify the candidate as `included`, `pending`, `replaced`, `dropped`, `private_or_provider_local`, or `inconclusive`. Report the evidence for the classification.

## Choose an action

- **Wait:** retain the original transaction when its fee and deadline remain acceptable.
- **Speed up:** construct the same intended call with the same nonce and a sufficiently higher effective fee for current network and provider replacement rules.
- **Cancel:** construct a same-nonce replacement that sends zero value to the sender with empty calldata. State that cancellation only wins if it is included before the original.
- **Rebuild:** use a new nonce only after proving the original nonce has been consumed, canceled, or intentionally abandoned in a way compatible with later queued transactions.

Preserve the original `to`, `value`, and `data` for a speed-up. Re-simulate them against current state because deadlines, prices, balances, and protocol state may have changed. Inspect every higher-nonce transaction that depends on the stuck nonce.

## Confirm and submit

Render the original and replacement side by side: chain, sender, nonce, target, value, decoded calldata, old and new fee caps, estimated maximum fee, deadline, and current classification. Require explicit confirmation of the replacement or cancellation.

Use `$send-evm-transaction` with the fixed nonce after confirmation. On an RPC timeout, query both hashes and the nonce again before any retry.

## Report

Return the original status, provider disagreements, latest and pending nonces, discovered replacement hash, dependent queued transactions, recommended action, replacement artifact if requested, submission hash, and final receipt. Never claim a cancellation succeeded until the cancellation transaction is canonically included and the original is not.
