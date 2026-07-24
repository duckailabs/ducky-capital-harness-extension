---
name: build-cross-chain-transaction
description: Construct and validate a bridge or cross-chain message flow as separate source-chain, relay, finality, destination-chain, and claim actions with verified contracts, token mappings, fees, recipients, refunds, and trust assumptions. Use when preparing asset bridging, cross-chain calldata, canonical rollup deposits or withdrawals, message retries, destination execution, or multi-chain transaction plans.
---

# Build Cross-Chain Transaction

Model the complete lifecycle across both chains. A successful source transaction does not prove destination delivery or execution.

## Define the route

Require:

- source and destination chain IDs
- bridge protocol, route type, and deployment version
- source token, destination token, amount, and minimum received amount
- source sender, destination recipient, refund recipient, and relayer
- destination calldata and gas limit when applicable
- deadline, fee budget, finality requirement, and acceptable trust model

Resolve every bridge, messenger, token gateway, liquidity pool, oracle, verifier, and wrapped-token contract from official documentation for both chains. Inspect proxies, admins, pause state, token mapping, and current route support. Use `https://ethereum.org/developers/docs/bridges` for the general bridge risk model.

## Map the lifecycle

Enumerate each required action:

1. token approval or permit on the source chain
2. source deposit, burn, lock, or message submission
3. source finality or challenge period
4. offchain relay, proof generation, or liquidity fulfillment
5. destination mint, unlock, message execution, or explicit claim
6. retry, refund, cancellation, or recovery path

State who can censor, pause, upgrade, validate, relay, or recover each step. Distinguish canonical messaging, external validator bridges, and liquidity networks. Do not describe independent chain transactions as atomic unless the protocol enforces that property.

## Build and validate

Check for Cast and Foundry; recommend `https://www.getfoundry.sh/introduction/installation` when unavailable. Confirm both RPC chain IDs.

Build separate artifacts for every transaction the sender may need to authorize. Use bounded approvals, bind the destination chain and recipient, encode minimum output or fee limits, and set the correct refund address. Decode the complete source and destination calldata.

Simulate source execution at a pinned block. Validate destination execution with the bridge's official tooling or a forked messenger state that authenticates the real source sender and message, recording any artificial proof or relay setup. Verify token decimal and representation changes and calculate all source, bridge, relayer, destination-gas, and liquidity fees.

## Report

Return the route and trust model, verified deployments on both chains, token mapping, complete lifecycle, separate unsigned artifacts, approvals, expected and minimum destination amounts, fee breakdown, finality and challenge timing, simulations, message identifier derivation, monitoring method, and recovery paths.

Require separate confirmation for every signed transaction. After source submission, report `source_included`, `awaiting_finality`, `relay_pending`, `destination_executed`, `claim_required`, `refundable`, or `failed` rather than calling the bridge complete prematurely.
