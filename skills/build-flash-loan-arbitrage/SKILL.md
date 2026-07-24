---
name: build-flash-loan-arbitrage
description: Implement and fork-test a purpose-built EVM executor for atomic flash-loan arbitrage with verified lender and DEX integrations, bounded swaps, repayment, access control, and minimum-profit enforcement. Use when a user wants to turn a validated arbitrage route into Solidity, integrate an Aave-style flash loan, or prepare deployment and execution transactions.
---

# Build Flash-Loan Arbitrage

Build a narrow executor contract and tests for one atomic route. A plain sequence of EOA commands cannot receive and complete a flash-loan callback.

## Establish prerequisites

1. Check `command -v forge`, `command -v cast`, and `command -v anvil`. If missing, direct the user to `https://www.getfoundry.sh/introduction/installation`. Do not install Foundry without explicit permission.
2. Require a validated same-chain route, chosen lender, borrowed asset and amount, DEX legs, final profit asset, owner or authorized caller, profit recipient, and nonzero minimum net profit.
3. Resolve the lender registry and pool from official current documentation for the exact chain. For Aave v3, fetch the Pool through the official PoolAddressesProvider rather than assuming a remembered address.
4. Read the current flash-loan premium onchain. Do not hardcode a fee from documentation because governance may change it.

## Implement the executor

Create a minimal Solidity contract that:

- restricts initiation to the intended owner or role
- authenticates the callback caller and initiator
- allowlists the lender, routers, tokens, and route used
- receives route parameters only where variation is intended
- enforces deadlines, per-leg amount bounds, and a final `minProfit`
- measures profit from balance deltas so prefunded assets are excluded
- approves only the repayment and trade amounts needed, using safe token handling
- repays principal plus the current premium atomically
- sends profit only to the fixed or explicitly authorized recipient
- rejects arbitrary external calls, arbitrary sweep recipients, and accidental native value
- includes a deliberately scoped rescue path with access control if stranded funds are possible

Use `flashLoanSimple` for a single reserve when its semantics fit; use a multi-reserve flow only when required. Follow the lender's current official interface and callback requirements.

## Test on a pinned fork

Write Forge tests against a reported block. Cover:

1. profitable execution and exact repayment
2. profit below `minProfit`
3. adverse price movement and insufficient output
4. wrong callback caller or initiator
5. unauthorized initiation and rescue
6. router or token not on the allowlist
7. callback reentrancy and repeated calls
8. fee or gas increases that erase profit
9. nonstandard token behavior when relevant
10. no residual approvals or unexplained balances after success

Run formatting, compilation, unit tests, and pinned-fork tests. Decode and review the proposed deployment bytecode and constructor arguments.

## Prepare, but separate, transactions

Return source, tests, compiler version, dependency commits, fork block, test evidence, contract-risk notes, and two distinct unsigned artifacts: deployment and route execution. Simulate the deployed runtime code on a fork before execution.

Do not deploy or execute here. Use `$assess-evm-transaction-safety`, then `$send-evm-transaction` only after the user confirms each final transaction. Never call expected arbitrage profit guaranteed.
