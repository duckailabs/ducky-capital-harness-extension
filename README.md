# Ducky Capital Skills

EVM investigation, transaction construction, multichain coordination, simulation, safety, DeFi trading, and guarded submission skills packaged in the open Agent Skills format.

## Included agents

- `safe-treasury-operator` — inspect a Safe, construct canonical multisig transaction hashes, read confirmation status, and publish an externally signed proposal. Proposal publication is approval-gated and does not execute the Safe transaction.
- `uniswap-routing-agent` — obtain exact-input routes with Uniswap's smart-order-router, return hashed unsigned SwapRouter02 plans, review them, and approval-gate the broadcast of an externally signed exact match.
- `relay-cross-chain-operator` — obtain EVM cross-chain quotes with the Relay SDK, inspect every transaction and signature step, approval-gate one exact signed transaction step at a time, and monitor destination status.

The agents are implemented in TypeScript with the OpenPond Agent SDK. They never accept raw private keys or seed phrases. Uniswap and Relay signing happens outside the agents; Safe proposal publication requires a signature created by an existing Safe owner.

## Included skills

### Investigate

- `review-ethereum-transaction` — explain a published transaction using receipts, traces, logs, transfers, approvals, fees, and risk signals.
- `analyze-ethereum-bytecode` — inspect deployed or raw EVM bytecode, resolve proxies, recover behavior, and explain analysis limits.
- `review-evm-signature-request` — decode typed data and messages, then identify authority, scope, expiry, and replay risk.
- `assess-token-tradability` — inspect token restrictions and fork-test acquisition, transfer, approval, sale, and revocation.

### Build and validate

- `build-evm-transaction` — turn an onchain intent into a verified unsigned transaction artifact.
- `simulate-evm-transaction` — simulate a candidate transaction with Cast, Anvil, or Forge and measure its effects.
- `assess-evm-transaction-safety` — review decoded behavior, permissions, economic constraints, simulation evidence, and unknowns.
- `manage-token-approval` — build or revoke bounded ERC-20, EIP-2612, and Permit2 permissions.
- `build-safe-multisig-transaction` — construct and verify Safe proposals, batches, transaction hashes, modules, and guards.
- `build-erc4337-user-operation` — construct and simulate smart-account UserOperations, paymasters, and counterfactual deployment.
- `build-cross-chain-transaction` — model source, relay, finality, destination, claim, and recovery actions separately.
- `build-multichain-execution` — coordinate a dependency graph of independently authorized actions across multiple chains.

### Trade

- `build-uniswap-swap` — quote, encode, and simulate guarded Uniswap swaps.
- `manage-uniswap-liquidity` — create, change, collect, close, or migrate v3 and v4 liquidity positions.
- `compose-atomic-evm-trade` — combine multi-step trading actions with explicit atomic invariants.
- `analyze-dex-arbitrage` — size and evaluate arbitrage after liquidity, fees, gas, and MEV risk.
- `analyze-cross-chain-arbitrage` — evaluate inventory, latency, hedging, bridge, rebalancing, and partial-execution risk across chains.
- `build-flash-loan-arbitrage` — implement and fork-test a narrow flash-loan executor contract.
- `build-defi-liquidation` — evaluate eligibility and construct direct or flash-funded lending liquidations.

### Send

- `send-evm-transaction` — run the final simulation, show the exact transaction, obtain explicit confirmation, broadcast with Cast, and monitor the receipt.
- `submit-private-evm-transaction` — submit reviewed transactions or bundles through a private relay without unapproved public fallback.
- `manage-pending-evm-transaction` — diagnose, replace, speed up, or cancel a pending same-nonce transaction.

## Recommended flow

```text
build or protocol skill → simulate-evm-transaction → assess-evm-transaction-safety → send-evm-transaction → review-ethereum-transaction
analyze-dex-arbitrage → compose-atomic-evm-trade or build-flash-loan-arbitrage → simulate-evm-transaction → assess-evm-transaction-safety → send-evm-transaction
assess-token-tradability → build-uniswap-swap → simulate-evm-transaction → assess-evm-transaction-safety → send or private submission
build-safe-multisig-transaction → review-evm-signature-request → collect owner confirmations → execute
build-cross-chain-transaction → assess and confirm each source or destination transaction → monitor every lifecycle stage
analyze-cross-chain-arbitrage → build-multichain-execution → validate and confirm each independent action → monitor and rebalance
```

Keep construction and broadcast separate even when one user request spans the full flow. Re-render and reconfirm the final fields whenever simulation, quoting, nonce selection, or fee selection changes them.

## Install with OpenPond

Install the complete repository as an OpenPond Profile from **Settings → Profiles → Add → GitHub** using:

```text
duckailabs/ducky-capital-skills
```

This adds the `ducky-capital` Profile without activating or executing it. Select it in a task when you want its skills available.

The profile also registers the three TypeScript agents above. Their third-party SDK dependencies are pinned in the repository lockfile. For local development, install and verify them from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm agents:check
```

`SAFE_API_KEY` is optional when using a custom Safe Transaction Service URL and otherwise is stored as an OpenPond secret. `RELAY_API_KEY` is optional and is only sent to Relay's official mainnet or testnet API. RPC URLs are provided per action so the chain ID can be checked before construction or broadcast.

To install the same repository as a third-party skill extension instead:

```bash
openpond extension preview duckailabs/ducky-capital-skills
openpond extension add duckailabs/ducky-capital-skills
```

OpenPond installs the pack under `~/.openpond/extensions` and makes its skills available to the OpenPond harness. Foundry-backed skills require the agent runtime to expose a scoped command tool.

## Foundry requirement

The transaction skills use Foundry directly:

- Cast encodes calls, reads RPC state, simulates, estimates gas, broadcasts, and checks receipts.
- Anvil provides pinned-block forks for stateful simulations.
- Forge compiles and tests purpose-built atomic or flash-loan executors.

Install Foundry by following the official instructions at `https://www.getfoundry.sh/introduction/installation`. Each transaction skill checks for the commands it needs and stops with installation guidance when they are missing. Skills must not download or install Foundry without explicit user permission.

## Signing boundary

Construction, simulation, safety review, and trading skills return unsigned artifacts by default. Standard EVM artifacts contain `chainId`, `from`, `to`, `valueWei`, `data`, gas information, and economic constraints; Safe, ERC-4337, private-bundle, bridge, and multichain workflows use their native field sets.

Any skill that can cause live signing or submission must:

1. receive an explicit request for the specific action;
2. verify the chain, signer, targets, decoded payload, balances, nonce, fees, and constraints;
3. simulate the exact candidate immediately before submission;
4. render the final signed scope and obtain explicit confirmation; and
5. use an already configured keystore, hardware wallet, or approved remote signer without exposing secrets.

No skill should request, print, persist, or place a seed phrase, raw private key, mnemonic, or signer password on a command line.

These skills provide technical workflows and risk analysis, not a formal security audit, profit guarantee, or financial advice.
