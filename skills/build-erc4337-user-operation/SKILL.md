---
name: build-erc4337-user-operation
description: Construct and simulate an ERC-4337 UserOperation for a smart account using the exact EntryPoint, account implementation, factory, nonce key, bundler, paymaster, gas fields, and signature scheme. Use when preparing account-abstraction calls, sponsored transactions, counterfactual account deployment, batched smart-account execution, or diagnosing a rejected UserOperation.
---

# Build ERC-4337 UserOperation

Build against the deployed EntryPoint and account version. A UserOperation is not a conventional EOA transaction and is submitted to a bundler rather than directly to the public transaction pool.

## Resolve the stack

1. Confirm the chain ID, smart-account address, intended calls, owner or validator scheme, and bundler endpoint.
2. Resolve the EntryPoint address and version from official deployments and deployed bytecode. Start with `https://docs.erc4337.io/core-standards/erc-4337`.
3. Identify the account implementation, proxy, factory, nonce scheme, validator or aggregator, executor, and paymaster. Inspect verified source for every security-critical component.
4. Determine the exact UserOperation schema for the EntryPoint version. Do not mix packed and unpacked fields or copy fields from another version.

Use `cast rpc` and ABI tools when available. If Cast is missing, recommend `https://www.getfoundry.sh/introduction/installation`.

## Construct the operation

Populate the version-correct equivalents of:

- sender and keyed nonce
- factory or initialization code for an undeployed account
- account call data and decoded inner calls
- execution, verification, and pre-verification gas
- maximum fee and priority fee
- paymaster data, validation windows, and sponsorship limits
- signature or signature placeholder required for estimation

Derive a counterfactual sender from the exact factory data and verify that no incompatible code already exists at that address. Read the nonce through the EntryPoint or account's documented nonce mechanism rather than using the EOA transaction count.

Decode account call data into every target, value, operation, and permission change. Apply the same recipient, slippage, deadline, and spend controls required for ordinary transactions.

## Estimate and simulate

Use the bundler's current ERC-4337 RPC methods to estimate gas and simulate validation. Independently simulate EntryPoint validation and execution on a pinned fork when the action is material.

Verify:

- account and paymaster validation data and time range
- signature scheme and hash domain
- factory deployment and sender address
- prefund, deposit, sponsorship, and token-charge behavior
- aggregator, module, session-key, and executor permissions
- complete execution state changes and failure reason

Treat bundler acceptance, paymaster sponsorship, and simulation success as separate facts. A paymaster may impose offchain policy beyond onchain validation.

## Report

Return chain, EntryPoint and version, account stack, bundler and paymaster provenance, exact UserOperation fields, decoded calls, operation hash, gas estimates, prefund, sponsorship terms, validation windows, simulations, and unresolved policy dependencies.

Do not sign or call `eth_sendUserOperation` without explicit authorization after rendering the final fields. Monitor submission with the version's receipt methods and report the enclosing transaction hash separately from the UserOperation hash.
