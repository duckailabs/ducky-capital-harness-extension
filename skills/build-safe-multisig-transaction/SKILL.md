---
name: build-safe-multisig-transaction
description: Construct and verify a Safe smart-account transaction or batch using the exact Safe deployment, owners, threshold, nonce, operation, gas and refund fields, modules, guard, and transaction hash. Use when preparing a Safe proposal, decoding a pending multisig action, validating a Safe batch, or checking what owners would authorize before signatures are collected.
---

# Build Safe Multisig Transaction

Build a Safe proposal without signing, posting it to a service, or executing it unless separately requested.

## Verify the Safe

1. Confirm the chain ID and Safe proxy address.
2. Resolve the singleton and Safe contract version from deployed code and official Safe deployments. Use current references under `https://docs.safe.global/reference-smart-account/overview`.
3. Read the Safe nonce, owners, threshold, enabled modules, guard, fallback handler, and material storage at a pinned block.
4. Inspect every module and guard. Modules may bypass owner signature verification, and a guard may block execution.

## Build the proposal

Specify every Safe transaction field:

- `to`, `value`, and `data`
- `operation` as `CALL` or `DELEGATECALL`
- `safeTxGas`, `baseGas`, `gasPrice`, `gasToken`, and `refundReceiver`
- Safe nonce and chain-specific domain

Default to `CALL`. Treat `DELEGATECALL` as high caution because target code executes in the Safe's context. For a batch, decode the MultiSend contract, batch operation, and every inner transaction; verify that the outer operation matches the deployed MultiSend variant.

Resolve all targets and decode all calldata. Highlight owner or threshold changes, module or guard changes, fallback-handler changes, approvals, asset transfers, arbitrary calls, and delegate calls.

## Verify the hash and execution

Compute the Safe transaction hash locally and through the Safe's `getTransactionHash` using the exact fields. Both results must match. Do not sign a hash supplied only by an interface or Transaction Service.

Simulate `execTransaction` or the Safe's supported simulation path on a pinned fork. Model the real Safe state, signatures or approved hashes required by threshold, guard checks, refund behavior, and inner-call state deltas. Keep service proposal state separate from onchain nonce state.

## Report and hand off

Return Safe identity and version, owners and threshold, modules and guard, nonce, complete transaction fields, decoded batch, transaction hash, simulation result, asset and permission deltas, refund exposure, and warnings.

Use `$review-evm-signature-request` before any owner signs the Safe hash. Posting a proposal to the Safe Transaction Service, collecting confirmations, and executing `execTransaction` are separate external actions requiring explicit authorization.
