# Ducky Capital Skills

Read-only Ethereum investigation skills packaged in the open Agent Skills format.

## Included skills

- `review-ethereum-transaction` — turn a transaction hash into an evidence-backed explanation of execution, transfers, approvals, fees, failures, and risk signals.
- `analyze-ethereum-bytecode` — inspect deployed or raw EVM bytecode, resolve proxies and verified source, recover behavior, and explain analysis limits.

## Install with OpenPond

After publishing this repository to GitHub:

```bash
openpond extension preview <github-owner>/ducky-capital-skills
openpond extension add <github-owner>/ducky-capital-skills
```

OpenPond installs the pack under `~/.openpond/extensions` and makes its skills available to the OpenPond harness. The repository does not require an OpenPond-specific manifest.

## Usage

```text
$review-ethereum-transaction Review 0x… on Ethereum mainnet.
$analyze-ethereum-bytecode Analyze 0x… at block 12345678 on Ethereum mainnet.
```

The workflows use read-only RPC calls and work best when Foundry Cast and an appropriate archive-capable RPC endpoint are available. They never require a private key or wallet connection.

These skills produce technical research, not a formal security audit or financial advice.
