# Uniswap Routing Agent

Use this agent for exact-input ERC-20 swaps routed through Uniswap's official smart-order-router.

## Safety boundary

- `quote-uniswap-swap` reads RPC state and returns an unsigned transaction plan.
- `review-uniswap-plan` validates an existing plan without making network requests.
- `broadcast-uniswap-swap` accepts only an already-signed serialized transaction, verifies that its signer and transaction fields exactly match the reviewed plan, simulates it, requires OpenPond approval, and then broadcasts it.
- Never request or accept a seed phrase, mnemonic, raw private key, keystore password, or signer password.
- Never infer token decimals or token addresses. Require them explicitly and check that both tokens belong to the requested chain.
- Treat a quote as short-lived. Requote after its deadline, after a material delay, or whenever the amount, recipient, slippage, route, target, calldata, or value changes.
- A successful RPC simulation is useful evidence, not a guarantee against price movement, reordering, token restrictions, MEV, or a state change before inclusion.

## Workflow

1. Quote an exact-input route with an explicit sender, recipient, token pair, raw input amount, slippage limit, and deadline.
2. Review the returned `planHash`, router target, calldata, value, minimum output, route split, block number, and deadline.
3. Obtain a signature outside this agent using an approved wallet.
4. Submit the reviewed plan and serialized signed transaction to `broadcast-uniswap-swap`.
5. If any signed field differs, discard it and quote again.

The default chat action only explains these explicit actions and never quotes, signs, or broadcasts.
