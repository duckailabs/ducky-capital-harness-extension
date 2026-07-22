---
name: review-ethereum-transaction
description: Investigate an Ethereum or EVM transaction hash and explain what happened using read-only RPC data, receipts, traces, verified ABIs, logs, asset movements, approvals, and risk indicators. Use when a user supplies a transaction hash, asks why a transaction succeeded or failed, wants calldata or events decoded, needs transfers and approvals summarized, or wants a concise transaction-forensics report.
---

# Review Ethereum Transaction

Build an evidence-backed explanation of a published EVM transaction. Stay read-only and distinguish confirmed facts from decoded interpretations.

## Guardrails

- Never request a seed phrase, private key, signing approval, or wallet connection.
- Never broadcast, replace, cancel, or replay a transaction unless the user separately and explicitly requests that action.
- Confirm the network or chain ID. A transaction hash alone does not identify a chain.
- Treat explorer labels, four-byte signatures, token symbols, and unverified ABIs as hints until corroborated.
- State the block number or tag used for every historical conclusion.
- Do not call a transaction or contract safe. Report observable behavior, risks, and unknowns.

## Collect the evidence

1. Validate that the hash is `0x` followed by 64 hexadecimal characters.
2. Identify the chain. Ask one focused question if the chain cannot be inferred from user-provided context.
3. Start with the chain's canonical block explorer. For Ethereum mainnet, open `https://etherscan.io/tx/<TX_HASH>` directly. Avoid lookalike explorer domains reached through search results.
4. Capture the status, block, timestamp, confirmations or finality indicator, sender, recipient or created contract, value, fee, gas, calldata, token transfers, internal transactions, and logs exposed by the explorer.
5. Open every material contract on the same explorer. Check verified source, ABI, proxy implementation, contract labels, and decoded input or events. Treat labels as attribution claims rather than onchain proof.
6. If the explorer view is insufficient, try a public transaction debugger such as `https://dashboard.tenderly.co/tx/<TX_HASH>` for a call trace, state changes, and decoded errors. State when a site requires sign-in, lacks the selected network, or cannot load the transaction.
7. Use a trusted RPC endpoint for raw evidence when web views disagree, omit required fields, or cannot provide historical traces. If Foundry Cast is installed:

   ```bash
   cast chain-id --rpc-url "$ETH_RPC_URL"
   cast tx "$TX_HASH" --rpc-url "$ETH_RPC_URL" --json
   cast receipt "$TX_HASH" --rpc-url "$ETH_RPC_URL" --json
   ```

8. If the transaction exists but its receipt is null, report it as pending. If both are null, report “not found on the selected chain” rather than “invalid.”
9. Capture the nonce and transaction type from RPC evidence when the web view omits them. Convert values from raw units explicitly; retain the raw value beside any formatted amount.
10. Fetch the containing block when timestamp, finality, or fee context matters.

Use standard JSON-RPC methods `eth_chainId`, `eth_getTransactionByHash`, `eth_getTransactionReceipt`, and `eth_getBlockByNumber` when Cast is unavailable. Do not block the review merely because Cast or an archive RPC is unavailable; finish from the explorer evidence and disclose what could not be independently reproduced.

## Decode intent and execution

1. Classify the transaction as an ETH transfer, contract call, contract creation, blob transaction, or delegated-account transaction when the fields establish that classification.
2. For contract calls, resolve verified source and ABI for the exact chain and address first. Resolve proxies to the implementation used at the transaction block before interpreting logic.
3. Decode calldata with the verified ABI. If no verified ABI exists, use selector databases only as candidates:

   ```bash
   cast 4byte-calldata "$INPUT"
   ```

   List competing signatures when a selector is ambiguous. Never present a four-byte lookup as proof.
4. Decode receipt logs against verified event ABIs. Summarize token transfers, NFT movements, approvals, role changes, upgrades, ownership changes, and protocol-specific state changes.
5. Use the explorer or public debugger trace first. Replay the published transaction locally when more detail is needed and the RPC supports historical state:

   ```bash
   cast run "$TX_HASH" --rpc-url "$ETH_RPC_URL" --decode-internal
   ```

   If replay fails because archive state or trace methods are unavailable, say so and continue from the receipt and verified source.
6. Compare top-level intent with internal execution. Highlight delegate calls, newly created contracts, unexpected recipients, broad token approvals, ownership or admin changes, and transfers that only appear in internal calls or logs.
7. For failures, report the receipt status and the best available revert evidence. Do not invent a revert reason from status alone.

## Report the result

Use this order:

1. **One-line outcome** — plain-language result and whether it succeeded, failed, or remains pending.
2. **Transaction facts** — chain, hash, block, timestamp, from, to or created contract, value, fee, gas, and finality if checked.
3. **Decoded action** — function, arguments, trace summary, and important internal calls.
4. **Asset and permission changes** — transfers, mints, burns, approvals, roles, ownership, and upgrades.
5. **Risk signals** — surprising behavior, unlimited approvals, proxy changes, unverified code, ambiguous decoding, or inconsistent labels.
6. **Unknowns and confidence** — missing archive data, unverified ABIs, unresolved proxies, or other limits.
7. **Evidence** — RPC methods, commands, contract addresses, block number, and direct chain-specific explorer links used.

Keep conclusions proportional to the evidence. A successful receipt proves EVM execution did not revert; it does not prove the user received the economic outcome they expected.
