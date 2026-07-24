---
name: manage-token-approval
description: Inspect, construct, reduce, revoke, or simulate ERC-20 allowances and supported permit flows including EIP-2612 and Uniswap Permit2. Use when a user needs a token approval for a trade, wants to choose between approval and permit, needs an allowance revoked, or wants spender, amount, expiration, nonce, and signature scope checked before authorization.
---

# Manage Token Approval

Build the narrowest permission that completes the requested action. Treat a permit signature as spend authorization even when it is not itself an onchain transaction.

## Prepare and verify

1. Check `command -v cast`. If unavailable, recommend `https://www.getfoundry.sh/introduction/installation` and stop command-dependent construction.
2. Confirm the RPC chain ID, token address, token code, owner, actual spender, amount, and desired expiration.
3. Resolve the spender from official deployment documentation and decoded downstream calldata. A router, Permit2 contract, position manager, and protocol vault are different spenders.
4. Read `decimals()`, `symbol()`, current balance, and current allowance. Use the address and raw integer as identity; use symbol only for display.
5. Check verified source for nonstandard approval behavior, transfer fees, pausing, blacklisting, and zero-first allowance requirements.

## Choose the permission

Prefer in this order when the protocol supports it:

1. one-transaction signature transfer scoped to the exact token, amount, spender, nonce, chain, and deadline
2. time-bound Permit2 allowance scoped to the exact amount and spender
3. exact ERC-20 allowance for the requested spend
4. a larger or unlimited allowance only after the user explicitly accepts the additional exposure

For Permit2, inspect both permission layers: the ERC-20 allowance from owner to Permit2 and the Permit2 allowance or signature authorizing the application spender. Do not describe Permit2 as eliminating the underlying token approval when one is required.

## Construct the action

- Direct approval: encode `approve(address,uint256)` with the verified spender and raw amount.
- Revocation: encode the applicable allowance to zero and confirm which permission layer is being revoked.
- Zero-first token: prepare a zero approval followed by the new bounded approval; simulate both in order.
- EIP-2612 or Permit2: build typed data using the exact domain separator inputs, chain ID, verifying contract, owner, spender, amount, nonce, and deadline. Decode and present it before requesting a signature.

Never request a seed phrase or raw private key. Never put a private key, mnemonic, or keystore password on a command line. If the runtime cannot use an already configured signer or an interactive hardware-wallet flow, return the unsigned transaction or typed data.

## Simulate and report

Simulate the approval or revocation from the owner and re-read the expected allowance on a fork when necessary. Report:

- chain, token, owner, spender, and spender provenance
- current and proposed allowance as raw and formatted values
- permission type, nonce, and expiration
- calldata or typed data
- prerequisite and follow-up transactions
- residual exposure after the intended action
- simulation result and any token-specific caveat

Do not sign or broadcast here. Use `$assess-evm-transaction-safety` for review and `$send-evm-transaction` only after the user confirms the final authorization.
