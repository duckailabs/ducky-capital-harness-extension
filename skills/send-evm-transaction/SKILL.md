---
name: send-evm-transaction
description: Safely sign and broadcast an explicitly requested EVM transaction with Foundry Cast after verifying chain, signer, fields, simulation, constraints, balance, nonce, and user confirmation, then monitor its receipt. Use only when a user clearly asks to send, execute, deploy, approve, revoke, swap, or otherwise publish a specific prepared transaction.
---

# Send EVM Transaction

Broadcast only a fully rendered transaction the user has explicitly approved. A request to build, quote, simulate, assess, or explain is not authorization to send.

## Enforce the boundary

- Require a specific transaction with chain ID, sender, target, value, and calldata.
- Never request or accept a seed phrase, raw private key, or mnemonic.
- Never place a private key, mnemonic, keystore password, or other secret in a command, environment variable, file created for the task, log, or response.
- Use only a signer the user has already configured through a Foundry account or keystore with interactive secret entry, a hardware wallet, or an approved remote signer. If the runtime cannot access that signer safely, return the unsigned artifact and stop.
- Do not use an unlocked RPC account unless the user explicitly identifies and accepts that security model.
- Treat deployment and execution, approval and swap, and replacement or cancellation as separate transactions requiring separate review.

## Prepare Cast

1. Check `command -v cast` and record `cast --version`.
2. If Cast is absent, stop and provide `https://www.getfoundry.sh/introduction/installation`. Do not run the installer automatically.
3. Run `cast send --help` and the selected signer option's help for the installed version before assembling the command.
4. If the user needs a local encrypted Foundry account, instruct them to run `cast wallet import ACCOUNT_NAME --interactive` directly in their terminal, then verify the derived address. Do not enter or observe the secret for them. For a hardware wallet, use the installed version's Ledger or Trezor option and let the user approve on the device.

## Run the final preflight

1. Confirm `cast chain-id --rpc-url "$RPC_URL"` equals the candidate `chainId`.
2. Verify that the configured signer resolves to the exact `from` address. Do not substitute another account.
3. Re-resolve the target and any nested protocol addresses from authoritative chain-specific sources.
4. Decode the complete calldata, including router commands and nested calls, and compare it with the user's stated intent.
5. Refresh balances, allowances, nonce, fee data, deadline, quotes, and protocol state.
6. Simulate the exact transaction from the signer and estimate gas immediately before confirmation. For trades, re-check minimum output, maximum input, price impact, net profit, and quote age.
7. Stop on a chain mismatch, changed transaction field, expired deadline, revert, violated constraint, unknown material call, insufficient balance, or ambiguous signer state.

## Request final confirmation

Present one compact confirmation block containing:

- chain name and ID
- signer address
- target address and verified identity
- native value and estimated maximum network fee
- decoded action and every material nested call
- token spends, receipts, approvals, recipients, slippage, deadline, and minimum output or profit
- nonce strategy
- simulation block and result
- remaining high-caution risks

Ask the user to explicitly confirm this rendered transaction. Do not treat earlier general permission, approval of a plan, or consent to install Foundry as final broadcast approval. If any field changes afterward, render it again and obtain new confirmation.

## Sign and broadcast

After confirmation, invoke `cast send` using the already configured safe signer and the exact reviewed fields. Prefer ABI-form arguments when they are the reviewed source of truth; otherwise send the exact reviewed calldata. Let the user complete any hardware-wallet or interactive keystore prompt directly.

Capture the transaction hash without exposing signer material. If submission returns an ambiguous timeout or RPC error, query the signer nonce and known hash before retrying. Never blindly resend, because the original transaction may already be pending.

## Monitor and report

Use:

```bash
cast receipt "$TX_HASH" --confirmations "$CONFIRMATIONS" --rpc-url "$RPC_URL" --json
```

Report the hash, explorer link for the confirmed chain, nonce, inclusion block, status, gas used, effective fee, material logs and asset changes, and confirmation count. On failure, decode the best available revert or trace evidence. On pending or dropped status, explain the evidence and ask before any replacement or cancellation.
