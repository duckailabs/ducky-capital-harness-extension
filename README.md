# Ducky Capital Skills

Read-only Ethereum investigation skills packaged in the open Agent Skills format.

## Included skills

- `review-ethereum-transaction` — turn a transaction hash into an evidence-backed explanation of execution, transfers, approvals, fees, failures, and risk signals.
- `analyze-ethereum-bytecode` — inspect deployed or raw EVM bytecode, resolve proxies and verified source, recover behavior, and explain analysis limits.

## Install with OpenPond

Once the repository is on GitHub, replace `<github-owner>` with the account or organization that published it:

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

The workflows start with Etherscan or the selected chain's canonical explorer. No separate debugger, decompiler, or verification service is required. Foundry Cast and an archive-capable RPC endpoint are optional tools for deeper traces and bytecode analysis.

These skills produce technical research, not a formal security audit or financial advice.
