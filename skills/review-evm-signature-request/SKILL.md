---
name: review-evm-signature-request
description: Decode and assess an EVM offchain signature request, including EIP-712 typed data, EIP-191 or personal-sign messages, permits, orders, Safe hashes, and contract-account signatures. Use when a signature could authorize token spending, order execution, account changes, login, delegation, or any later onchain action and the exact authority, scope, replay protection, or human-readable meaning needs verification.
---

# Review EVM Signature Request

Explain exactly what the supplied bytes authorize. Stay read-only and do not produce a signature.

## Collect the complete request

Require the proposed signer address and the exact payload supplied to the wallet: method, typed-data JSON or raw bytes, and any application context. Preserve the original payload byte-for-byte.

Classify the request as EIP-712, EIP-191 `personal_sign`, raw `eth_sign`, a transaction, or an unknown scheme. Treat an opaque hash as high risk until its preimage and verification path are established.

## Reconstruct the signed digest

1. Follow `https://eips.ethereum.org/EIPS/eip-712` for typed data and `https://eips.ethereum.org/EIPS/eip-191` for prefixed messages.
2. Validate every declared type, array, nested struct, integer width, and field value. Reject duplicate or ambiguous fields and lossy numeric conversions.
3. For EIP-712, verify the domain name, version, chain ID, verifying contract, and salt when present. Resolve the verifying contract on the stated chain and inspect its code, proxy, and verified source.
4. Recompute the domain separator, struct hash, and final digest independently. Compare them with any digest displayed by the application.
5. For contract accounts, determine the actual EIP-1271 or account-specific verification path. Do not assume an EOA recovery check is sufficient.

Use Cast hashing and ABI utilities when available. If Cast is missing, recommend `https://www.getfoundry.sh/introduction/installation`; never block a pure payload review on installation.

## Trace the authority

Identify the contract function that will consume the signature and decode the resulting capability:

- token, NFT, or native asset that can move
- maximum amount, order size, price, or spend
- spender, recipient, relayer, executor, or allowed caller
- nonce or bitmap position and whether it is unused
- deadline, start time, cancellation path, and fill count
- chain and contract replay domain
- one-time, partial-fill, recurring, session, or unlimited scope
- calls, delegate calls, modules, ownership, roles, or account delegation enabled

Read current nonce and cancellation state from the verifying contract. EIP-712 provides domain-separated encoding but does not itself guarantee replay protection.

## Test redemption

When a concrete redemption call can be built, simulate it at a pinned block using a placeholder signature only if the verifier supports that path, or a real supplied signature when the user has already provided it. Measure the maximum state change permitted by the signature, not only the application's intended next action.

Never submit the signature to a public service merely to decode it. A valid unexpired signature may be immediately usable by another party.

## Report

Return the original method, signer, decoded message, recomputed digest, domain and contract provenance, authorized assets and actions, nonce and deadline status, replay and frontrunning analysis, cancellation mechanism, simulation evidence, and a classification of `reject`, `high_caution`, or `ready_for_signer_review`.

Never call a signature harmless because no transaction is being sent at signing time.
