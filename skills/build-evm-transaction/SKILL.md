---
name: build-evm-transaction
description: Construct a reproducible unsigned EVM transaction with verified chain context, target, value, ABI-encoded calldata, constraints, and supporting evidence. Use when a user wants to turn an onchain action into transaction fields, encode a contract call, prepare calldata, or produce an artifact for later simulation, review, or signing.
---

# Build EVM Transaction

Translate an explicit user intent into an unsigned transaction artifact. Build and inspect the transaction; do not sign or broadcast it.

## Prepare Foundry

1. Check for Cast with `command -v cast` and record `cast --version`.
2. If Cast is missing, stop command-dependent work and direct the user to `https://www.getfoundry.sh/introduction/installation`. Do not run a downloaded installer without explicit permission.
3. Check `cast <subcommand> --help` before relying on flags that may vary by Foundry version.

## Establish the intent

Collect or derive only from authoritative evidence:

- chain name and numeric chain ID
- sender address
- target address
- native value in wei
- function signature and arguments, or exact raw calldata
- user constraints such as recipient, deadline, slippage, minimum output, maximum input, and maximum spend

Ask one focused question when a missing value changes economic meaning. Never infer a token address, recipient, spender, chain, or amount from a symbol or display label alone.

## Verify the target

1. Confirm the RPC chain with:

   ```bash
   cast chain-id --rpc-url "$RPC_URL"
   ```

2. Compare the result with the requested chain ID.
3. Resolve the target from official deployment documentation or verified source for that exact chain. Do not copy an address from a search snippet, unrelated deployment, or token symbol.
4. Inspect runtime code with `cast code` when the target is expected to be a contract. Resolve proxies and identify the implementation used at the chosen block.
5. Obtain the ABI from verified source, an official repository, or a user-supplied artifact whose bytecode relationship can be checked. Label any unverified ABI as an assumption.

## Construct the transaction

1. Convert human amounts using the token's onchain `decimals()` value. Preserve the raw integer beside the formatted value.
2. Encode verified function calls with:

   ```bash
   cast calldata "FUNCTION_SIGNATURE" ARGUMENTS...
   ```

3. Decode the resulting calldata back against the intended signature and compare every argument. Preserve user-supplied raw calldata exactly; decode it for review without silently rewriting it.
4. Read sender balance, token balances, allowances, and nonce when they affect executability. Treat nonce and fee fields as late-bound unless the user explicitly needs a fully populated transaction.
5. Run a read-only call and gas estimate when an RPC endpoint and sender context are available. Hand complex state-delta analysis to the simulation workflow.

## Output the artifact

Return this shape using decimal strings for integer quantities:

```json
{
  "chainId": 1,
  "from": "0x...",
  "to": "0x...",
  "valueWei": "0",
  "data": "0x...",
  "nonce": null,
  "gas": {
    "estimate": null,
    "limit": null,
    "maxFeePerGasWei": null,
    "maxPriorityFeePerGasWei": null
  },
  "constraints": {
    "blockNumber": null,
    "deadline": null,
    "minAmountOut": null,
    "maxAmountIn": null
  },
  "decodedCall": {
    "signature": "...",
    "arguments": []
  }
}
```

Also report target provenance, ABI provenance, reads performed, simulation status, unresolved assumptions, and the exact next validation required. Use `$simulate-evm-transaction` and `$assess-evm-transaction-safety` before signing. Do not include a signature or raw secret. Broadcast only through `$send-evm-transaction` after the user confirms the final rendered transaction.
