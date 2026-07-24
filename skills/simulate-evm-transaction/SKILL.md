---
name: simulate-evm-transaction
description: Simulate an unsigned EVM transaction against pinned chain state using Cast, RPC tracing, Anvil forks, or Forge tests, then report reverts, calls, logs, asset and allowance deltas, gas, and uncertainty. Use before signing a transaction or when a user wants to preview execution, diagnose a prepared call, compare outcomes, or validate postconditions without broadcasting.
---

# Simulate EVM Transaction

Reproduce the transaction against a named chain and pinned state. Never sign or broadcast during simulation.

## Prepare the environment

1. Check `command -v cast`, `command -v anvil`, and `command -v forge`; record available versions.
2. If Foundry is missing, direct the user to `https://www.getfoundry.sh/introduction/installation`. Do not install it without explicit permission.
3. Require `chainId`, `from`, `to`, `valueWei`, and `data`. Keep calldata byte-for-byte identical to the candidate transaction.
4. Confirm the RPC chain with `cast chain-id`. Choose and report a concrete block number. Use the same block for every comparison.

## Run escalating simulations

1. Start with an `eth_call` through `cast call`, setting the real sender and value. Capture return data or revert bytes.
2. Run `cast estimate` with the same fields. Treat an estimate as a gas heuristic, not a guarantee of inclusion or economic outcome.
3. Request `debug_traceCall` or the provider's equivalent only when supported and needed. Record any nonstandard trace method used.
4. For multi-step, state-dependent, or high-value transactions, start Anvil at the pinned block and replay the exact call on the fork. Fund or impersonate the sender only for simulation, label all artificial state changes, and never confuse fork success with mainnet authorization.
5. Use Forge tests when correctness depends on callbacks, temporary balances, reentrancy behavior, atomic profit, or multiple contracts. Pin the fork block in the test configuration.

## Measure effects

Capture before and after values for every relevant party:

- native and token balances
- ERC-20 allowances and Permit2 permissions
- NFT ownership and approvals
- protocol positions, debt, collateral, liquidity, and fees
- emitted logs and important internal calls
- created contracts, delegate calls, hooks, callbacks, and external recipients
- gas used or estimated and effective fee assumptions

Decode reverts with verified custom-error ABIs where possible. A successful `eth_call` proves only that the tested state and parameters did not revert.

## Check postconditions

Express important expectations as explicit assertions, including:

- recipient receives at least the minimum output
- sender spends no more than the maximum input plus fees
- no unexpected allowance remains
- no unexpected party receives value
- an atomic trade ends with at least the required profit
- a flash loan and premium are fully repaid

Mark the simulation failed if any required assertion is absent, unmeasurable, or false. Do not replace a missing slippage or profit bound with a simulation result.

## Report

Return:

1. chain ID, RPC class, pinned block, and transaction fields
2. success or exact revert evidence for each simulation method
3. decoded call tree and material logs
4. before/after asset, permission, and position deltas
5. gas result and assumptions
6. postcondition results
7. differences introduced by fork-only funding or impersonation
8. state-drift, mempool, MEV, oracle, and RPC limitations

Conclude with `simulation_passed`, `simulation_failed`, or `simulation_inconclusive`. Never label a transaction safe solely because it simulated successfully. Use `$assess-evm-transaction-safety` for the final pre-signing risk review.
