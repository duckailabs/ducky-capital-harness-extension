---
name: compose-atomic-evm-trade
description: Design, encode, and fork-test multi-step EVM trading operations that must execute atomically through a verified router, multicall surface, or purpose-built executor contract. Use when a user needs several swaps, wraps, transfers, liquidity actions, repayments, or balance checks combined into one transaction with explicit invariants.
---

# Compose Atomic EVM Trade

Turn a sequence of value-changing actions into one all-or-nothing transaction. Atomic execution prevents partial completion; it does not make an economically bad route safe.

## Define the sequence

1. Check for `cast`, `anvil`, and `forge`. If Foundry is missing, recommend `https://www.getfoundry.sh/introduction/installation` and stop command-dependent work.
2. Require the chain ID, sender, final recipient, ordered legs, exact input or budget, deadline, slippage policy, and minimum final result.
3. Write every leg as preconditions, call target, calldata or typed action, expected asset deltas, and postconditions.
4. Express global invariants, including maximum spend, minimum final balances or profit, allowed recipients, permitted tokens, repayment requirements, and dust policy.

## Choose the execution surface

Prefer a verified, established router that natively supports the required operations. Use Uniswap Universal Router only for commands supported by the exact deployed version. Use a generic multicall only if it preserves the required sender, value, approval, and revert semantics.

Build a purpose-specific Solidity executor when callbacks, flash liquidity, interim custody, cross-protocol state, or final profit checks cannot be expressed safely through a verified router. Avoid an executor with unrestricted arbitrary calls, arbitrary token sweeps, caller-controlled recipients, or missing access control.

## Construct safely

1. Resolve every contract from official chain-specific sources and inspect proxies and callbacks.
2. Minimize approvals and scope them to the actual spender. Reset temporary approvals when practical.
3. Apply a meaningful bound to every value-changing leg. A final profit check does not excuse unbounded intermediate swaps if they expose unrelated balances.
4. Bind the final recipient, refund recipient, deadline, and minimum final result in calldata or contract logic.
5. Order transfers and balance checks so pre-existing executor balances cannot be counted as trade profit.
6. Decode the final nested calldata or command stream and compare it leg-by-leg with the plan.

## Fork-test the exact transaction

Use Anvil or Forge at a pinned block with the intended sender and real balances when available. Assert:

- each call reaches only an allowed target
- the sequence reverts on missed slippage, deadline, repayment, or profit bounds
- final profit is measured relative to the executor's starting balance
- no unintended token, native value, allowance, or position remains
- callbacks and reentrancy cannot bypass access or accounting checks
- gas, protocol fees, and any loan premium are included

Test adverse prices, partial liquidity, callback failure, nonstandard tokens, and a zero-profit route. Do not send a sequence that has only a happy-path test.

## Report

Return the ordered execution plan, contract provenance, approval graph, unsigned transaction artifact, decoded nested calls, invariant list, pinned-block test results, gas and net-outcome estimates, residual balances or permissions, and known inclusion-time risks. Keep deployment and execution as separate transactions with separate confirmation.
