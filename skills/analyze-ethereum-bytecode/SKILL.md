---
name: analyze-ethereum-bytecode
description: Dissect EVM contract bytecode or a deployed contract address using verified-source lookup, proxy resolution, runtime-code collection, disassembly, selector recovery, opcode and control-flow inspection, and evidence-based risk reporting. Use when a user asks what unverified bytecode does, wants a contract reverse-engineered, needs proxy or implementation behavior identified, or wants suspicious EVM capabilities and analysis limits explained.
---

# Analyze Ethereum Bytecode

Recover the strongest defensible description of deployed EVM behavior. Prefer verified source when it actually matches, then use bytecode analysis to fill gaps and cross-check claims.

## Guardrails

- Stay read-only. Never request keys, connect a wallet, sign, deploy, or broadcast.
- Require a chain and block context for an address. Bytecode and proxy implementations can differ across chains or blocks.
- Distinguish creation bytecode from deployed runtime bytecode.
- Treat recovered names, selectors, types, and decompiler output as hypotheses unless verified by matching source or observed calls.
- Never claim that bytecode is safe, audited, or vulnerability-free.

## Choose the path

- **Contract address:** collect runtime code at the requested block, resolve proxies, and check verified-source services.
- **Raw bytecode:** ask whether it is creation or runtime code if unclear; skip address-specific storage, admin, and verification checks.
- **Transaction-created contract:** use the creation transaction for constructor inputs and the resulting address for runtime analysis.

## Collect and verify

1. Validate the address or hex bytecode and confirm chain ID.
2. For an address, collect code, size, and hash at a stable block:

   ```bash
   cast chain-id --rpc-url "$ETH_RPC_URL"
   cast code "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL"
   cast codesize "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL"
   cast codehash "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL"
   ```

3. Query Sourcify v2 and the chain’s established explorer for verified source, ABI, compiler, and match status. Prefer an exact match over a non-exact match. Verification proves a source/bytecode relationship, not functional correctness.
4. Record the deployed bytecode hash and verification result before interpreting source.
5. Detect proxy patterns before analyzing apparent behavior. Check minimal proxies, EIP-1967 implementation and admin slots, beacon proxies, and diamond-style dispatch. Foundry can resolve common EIP-1967 cases:

   ```bash
   cast implementation "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL"
   cast admin "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL"
   ```

6. Follow the implementation recursively, but report the proxy, implementation, admin or beacon, block, and evidence separately. Do not analyze only the proxy shell and attribute that behavior to the full system.

## Dissect unverified code

1. Disassemble runtime bytecode:

   ```bash
   cast code "$ADDRESS" --block "$BLOCK" --rpc-url "$ETH_RPC_URL" --disassemble
   # or, for raw bytecode
   cast disassemble "$BYTECODE"
   ```

2. Extract apparent selectors and resolve possible signatures:

   ```bash
   cast selectors "$BYTECODE"
   cast 4byte 0x12345678
   ```

   Mark all signature matches as candidates. Selector collisions and non-Solidity dispatch are possible.
3. Map the dispatcher and major control-flow regions. Identify payable and nonpayable gates, fallback and receive paths, revert paths, and dynamic jumps.
4. Inventory consequential capabilities, including:
   - `CALL`, `STATICCALL`, `DELEGATECALL`, and `CALLCODE`
   - `SLOAD`, `SSTORE`, transient storage, and hard-coded storage slots
   - `CREATE`, `CREATE2`, and contract factories
   - `SELFDESTRUCT`, while noting behavior depends on the active fork rules
   - external token calls, arbitrary-call surfaces, signature recovery, and permit-like flows
   - owner, role, pause, upgrade, allowlist, fee, mint, burn, sweep, and rescue patterns
5. Separate constants embedded in code from values read from storage or calldata. Never infer a live admin, balance, or configuration solely from runtime bytecode.
6. Cross-check hypotheses against verified sibling deployments, observed calldata, event topics, and trace behavior when available. Keep provenance for every external match.

## State the limits

Bytecode generally cannot recover original comments, variable names, source structure, precise types, or developer intent. Optimization, libraries, immutables, compiler metadata, custom dispatch, and proxies can make decompilation misleading. A missing recognizable pattern is not evidence that a capability is absent.

## Report the result

Use this order:

1. **Identity** — chain, address, block, code size, code hash, and bytecode kind.
2. **Verification** — source provider, exact or non-exact match, compiler metadata, and confidence.
3. **Proxy topology** — proxy type, implementation, admin or beacon, and resolution evidence.
4. **Behavior map** — verified functions or candidate selectors, dispatch paths, storage behavior, and external calls.
5. **Privileged and dangerous capabilities** — upgrades, arbitrary calls, delegate calls, minting, sweeping, pausing, destruction, or access-control observations.
6. **Evidence** — commands, RPC methods, source URLs, hashes, selectors, opcodes, and block number.
7. **Unknowns** — ambiguities and the next highest-value evidence to obtain.

Label findings as confirmed, strongly inferred, or speculative. Keep the executive summary understandable while retaining technical evidence below it.
