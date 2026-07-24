---
name: assess-evm-transaction-safety
description: Review a proposed EVM transaction before signing by checking chain and address identity, decoded behavior, proxy and privilege risk, asset movement, approvals, slippage, deadlines, simulation evidence, and user constraints. Use when a user asks whether a transaction, trade, approval, contract interaction, or prepared calldata is safe or wants a preflight risk assessment.
---

# Assess EVM Transaction Safety

Produce a bounded risk assessment, not a guarantee or audit. Do not sign or broadcast.

## Establish the candidate

Require the chain ID, sender, target, native value, and calldata. If any field is mutable or missing, state that the review is provisional. Hash or otherwise fingerprint the reviewed fields so later changes are apparent.

Check for Cast with `command -v cast`. If missing, recommend `https://www.getfoundry.sh/introduction/installation` and complete only the checks supported by available evidence.

## Verify identity and behavior

1. Confirm the RPC chain ID and the checksum addresses.
2. Resolve the target from official chain-specific deployment documentation.
3. Inspect runtime bytecode, verified source, proxy implementation, upgrade admin, and recent material upgrades at the relevant block.
4. Decode the top-level call and nested router commands. Compare every decoded field with the user's stated intent.
5. Identify delegate calls, arbitrary-call surfaces, callbacks, hooks, token transfers, approvals, ownership changes, role grants, position changes, and external recipients.
6. Treat labels, token symbols, four-byte matches, and unverified ABIs as hints rather than identity proof.

## Check economic constraints

Verify all applicable controls:

- exact input or maximum input
- minimum output rather than only expected output
- slippage tolerance and price impact
- short, future deadline
- intended recipient and refund recipient
- token decimals and raw amounts
- fee-on-transfer, rebasing, blacklist, pause, upgrade, or nonstandard-return behavior
- gas budget, native balance, nonce state, and quote freshness
- minimum net profit for arbitrage after gas, protocol fees, loan premium, builder payment, and L1 data fees

Flag unlimited or long-lived approvals unless the user explicitly requested and justified them. Check both the token allowance to Permit2 and Permit2's allowance to the ultimate spender.

## Require simulation evidence

Simulate the exact transaction from the intended sender at a reported block. Compare balance, allowance, ownership, debt, and position deltas with the intended outcome. For high-value, atomic, hook-based, flash-loan, or unverified-contract interactions, require a pinned fork test with explicit postconditions.

Simulation success does not eliminate inclusion-time state drift, sandwiching, oracle movement, private-orderflow leakage, sequencer behavior, or upgrade risk.

## Classify the result

Use one of these labels:

- **blocked** — chain or target mismatch, undecodable material behavior, simulation revert, violated constraint, unexpected recipient or approval, stale deadline, or missing mandatory protection
- **high caution** — unverified or upgradeable critical code, unknown hook or callback, broad permission, incomplete trace, weak RPC evidence, or material state-drift exposure
- **ready for explicit user review** — fields match intent, provenance is established, simulation and postconditions pass, and remaining risks are clearly bounded

Never use `safe`, `risk-free`, or `guaranteed` as the verdict.

## Report

Show the exact reviewed transaction, decoded actions, asset and permission deltas, protections, simulation block and result, contract/proxy provenance, risk register, unknowns, and classification. List the single highest-value next check when the result is not ready for review.
