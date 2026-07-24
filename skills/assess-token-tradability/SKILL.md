---
name: assess-token-tradability
description: Assess whether an EVM token can currently be transferred, bought, approved, and sold by inspecting deployed code, privileges, transfer restrictions, taxes, liquidity, routing, and pinned-fork balance deltas. Use when checking a token for honeypot behavior, blacklist or whitelist rules, trading gates, mutable fees, max-wallet limits, sell failures, or other conditions that could trap or unexpectedly reduce value.
---

# Assess Token Tradability

Test observable behavior at a reported block. Do not buy, approve, or sell on a live network.

## Verify the token and market

1. Confirm the chain ID and token address. Read code, proxy implementation, decimals, supply, balances, and verified source.
2. Identify owner, roles, upgrade admin, fee controller, pauser, blacklist or whitelist manager, minter, and any address able to change trading rules.
3. Resolve candidate pools and routers from official deployments. Verify pool addresses onchain and measure usable liquidity at one pinned block.
4. Treat names, symbols, logos, and explorer labels as display metadata rather than identity.

Check for Cast, Anvil, and Forge. Recommend `https://www.getfoundry.sh/introduction/installation` when the required tools are unavailable.

## Inspect restrictions

Trace every path used by `transfer`, `transferFrom`, approval, mint, burn, and fee collection. Check for:

- trading-enabled flags, launch blocks, cooldowns, and per-block limits
- blacklist, whitelist, bot, sanctions, or privileged-address branches
- maximum transaction, maximum wallet, minimum balance, and holder-count rules
- buy, sell, transfer, liquidity, and dynamic taxes
- router or pair recognition that can be changed or spoofed
- pause, confiscation, forced transfer, mint, rebase, proxy upgrade, and arbitrary external-call powers
- inconsistent return values or other nonstandard ERC-20 behavior

Renounced ownership does not remove powers held by other roles, immutable code paths, external controllers, or proxy admins.

## Fork-test the lifecycle

At the pinned block, use fresh simulated accounts and real verified pools to test:

1. acquire through the intended route
2. transfer between ordinary accounts
3. approve the intended router
4. sell through the intended route
5. revoke the approval

Measure raw balance deltas for sender, recipient, pool, fee wallets, and token contract. Compare quoted, debited, and received amounts to derive effective taxes and hidden deductions. Test representative sizes and both directions.

Label all impersonation, artificial funding, or storage modification. Never modify token or pool state to bypass a restriction and then cite the result as evidence of tradability. Fork success at one block does not prove future behavior when privileged settings or liquidity can change.

## Report

Return token identity and provenance, implementation and privilege map, pool and route evidence, restriction inventory, lifecycle test results, measured taxes, liquidity and size limits, upgrade or controller risks, and one of `currently_tradable_at_block`, `restricted`, `not_tradable`, or `inconclusive`.

Never describe a token as safe, legitimate, or guaranteed sellable from a successful test alone.
