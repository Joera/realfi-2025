---
name: lit-protocol
description: >
  Reference skill for Lit Protocol — focusing on the Chipotle (v3) architecture as used
  in S3ntiment. Covers PKPs, Lit Actions, groups, usage API keys, capacity credits,
  the LitService pattern, executeAction, compactAction, ownerInvocationAction, and
  the S3ntiment pool creation flow. Use this skill whenever the user asks about Lit
  Protocol, PKP, Lit Actions, Chipotle, Datil network, session signatures, Naga
  (deprecated), group management, usage keys, or the Lit layer of S3ntiment. Trigger also on tags #lit #Lit.
---

# Lit Protocol — Chipotle (v3) Reference

Compiled from S3ntiment project conversations (Nov 2025 – Apr 2026).
**Focus: Chipotle architecture. Naga is deprecated.**

---

## 1. What Changed: Naga → Chipotle

| | Naga (deprecated) | Chipotle (v3, current) |
|---|---|---|
| Auth model | Wallet signatures + ACCs (on-chain conditions) | API keys + TEE (code-enforced) |
| Access control | Access Control Conditions evaluated on-chain | Lit Action code enforces logic |
| Capacity payment | Capacity Credit NFT delegation | Account-level billing via API key |
| Session auth | `createAuthContext()`, `authSig` | Usage API key passed to executeAction |
| Network | Naga / Datil-test | Datil / Chipotle |
| Auth manager | `createAuthManager()` | Not needed |

**The core shift:** In Naga, the Lit network verified access conditions cryptographically. In Chipotle, your Lit Action JavaScript code does the verification inside a TEE. You are responsible for writing correct access checks.

---

## 2. Chipotle Architecture — Three Layers

```
┌─────────────────────────────────────────────────┐
│  Layer 1: TEE (Trusted Execution Environment)   │
│  Hardware-isolated enclave on Intel TDX          │
│  Root key material — never leaves the enclave    │
│  Every Lit Action execution is sandboxed         │
│  Cryptographically verifiable chain of trust     │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Layer 2: On-chain Permissions (Base)            │
│  Accounts, API key scopes, wallet registrations  │
│  Permission groups — all live in smart contracts │
│  Manageable via Lit API or direct EOA tx         │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Layer 3: Lit Actions                            │
│  Immutable JavaScript identified by IPFS CID    │
│  Runs inside TEE                                 │
│  Has access to PKP private key via API           │
└─────────────────────────────────────────────────┘
```

---

## 3. Key Primitives

### PKP (Programmable Key Pair)

A PKP is an ECDSA keypair whose private key lives distributed across Lit's TEE network. Nobody holds the full key — not even Lit. It can only be used through registered Lit Actions inside its group.

```typescript
// PKP has:
pkp.publicKey    // 0x04... (uncompressed)
pkp.ethAddress   // 0x... (Ethereum address derived from public key)
pkp.tokenId      // NFT token ID — needed for permission management
pkp.did          // did:pkh:eip155:1:0x... (for Nillion ACL)
```

**Funding:** PKPs do not need ETH for Nillion operations (off-chain). They do need funding if they submit on-chain transactions.

### Group

A group bundles together: PKP(s) + registered Lit Action CIDs + a Usage API key scope.

```
Group: s3ntiment-{poolId}
  ├── PKP wallet (1 per pool)
  ├── Action CID: encryptAction
  ├── Action CID: decryptOwnerAction
  ├── Action CID: decryptMemberAction
  ├── Action CID: createNillionInvocationAction
  ├── Action CID: getUserWriteDelegationAction
  └── Action CID: getPubKeyAction
```

### Usage API Key

A scoped key that allows executing actions within a specific group. This replaces session signatures / capacity credit delegations from Naga.

```
Usage API Key
  ├── execute_in_groups: [groupId]
  ├── can_create_pkps: false
  ├── can_create_groups: false
  └── manage_ipfs_ids_in_groups: []
```

The **Account API Key** (held by S3ntiment) can create groups, PKPs, register actions.
The **Usage API Key** (held per-pool) can only execute actions within that pool's group.

### Capacity Credits

In Chipotle, Lit operations are billed at the account level — you don't need to delegate capacity credit NFTs to individual users like in Naga. The account key covers all operations.

---

## 4. S3ntiment Pool Creation Flow

```
pool.create(poolId, safeAddress)
    │
    ├── 1. Mint PKP
    │      litService.createWallet() → pkpId, publicKey, ethAddress
    │
    ├── 2. Create Group
    │      litService.createGroup(`s3ntiment-${poolId}`) → groupId
    │
    ├── 3. Add PKP to Group
    │      litService.addPkpToGroup(groupId, pkpId)
    │
    ├── 4. Register 6 Lit Actions (get CIDs via IPFS)
    │      litService.addActionToGroup(groupId, encryptActionCid)
    │      litService.addActionToGroup(groupId, decryptOwnerActionCid)
    │      litService.addActionToGroup(groupId, decryptMemberActionCid)
    │      litService.addActionToGroup(groupId, createNillionInvocationActionCid)
    │      litService.addActionToGroup(groupId, getUserWriteDelegationActionCid)
    │      litService.addActionToGroup(groupId, getPubKeyActionCid)
    │
    ├── 5. Create Usage API Key
    │      litService.createUsageKey(groupId) → usageKey
    │
    └── 6. Register PKP as Nillion Builder
           NillionPkpClient.registerAsBuilder(usageKey, pkpId, pkpDid)
```

**Critical:** When creating a new survey on an existing pool, **reuse the existing PKP and group**. Never mint a new PKP for a new survey — this was a bug in pre-refactor code that caused `API key cannot use selected wallet in selected action` errors.

---

## 5. LitService (Chipotle pattern)

```typescript
class LitService {
    private baseUrl = 'https://api.chipotle.litprotocol.com/core/v1';
    private accountKey: string;

    // Management (requires account key)
    async createWallet(): Promise<{ wallet_address: string; public_key: string }>
    async createGroup(name: string): Promise<{ group_id: number }>
    async addPkpToGroup(groupId: number, pkpId: string): Promise<void>
    async addActionToGroup(groupId: number, cid: string): Promise<void>
    async createUsageKey(groupId: number, name: string): Promise<string>
    async getActionCid(code: string): Promise<string>  // uploads to IPFS

    // Execution (requires usage key)
    async executeAction(
        actionName: string,
        code: string,
        jsParams: Record<string, unknown>,
        usageKey: string
    ): Promise<{ response: unknown; logs: string[]; has_error: boolean }>
}
```

### executeAction usage in NillionPkpClient

```typescript
async createCollection(signature, userAddress, pkpId, pkpDid, usageKey, collectionData) {
    for (const node of this.nodes) {
        const result = await this.lit.executeAction(
            'create-collection',
            compactAction(ownerInvocationAction(this.poolId, this.contract, this.safeAddress)),
            {
                signature,
                userAddress,
                pkpId,
                pkpDid,
                nodeDid: node.did,
                command: '/nil/db/collections/create'
            },
            usageKey
        );

        const invocation = result?.invocation || result?.response?.invocation;
        // use invocation as Bearer token for nilDB API call
    }
}
```

---

## 6. Lit Actions in Chipotle

### Runtime environment

- JavaScript (V8/Deno inside TEE)
- `ethers` v5 available globally
- No arbitrary npm imports — sandboxed
- No `@nillion/nuc` SDK — must build NUC tokens manually or use backend hybrid

### Getting the PKP private key

```javascript
const privateKey = await Lit.Actions.getPrivateKey({ pkpId });
// Use with ethers to sign
const wallet = new ethers.Wallet(privateKey);
const signature = await wallet.signMessage(message);
```

### Signing arbitrary bytes (for NUC tokens)

```javascript
const privateKey = await Lit.Actions.getPrivateKey({ pkpId });
const signingKey = new ethers.utils.SigningKey(privateKey);
const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
const sig = signingKey.signDigest(messageHash);
// sig.r, sig.s, sig.v
```

### Verifying signatures inside a Lit Action

```javascript
// Verify a WAAP/EOA signature inside a Lit Action
const recovered = ethers.utils.verifyMessage(message, signature);
if (recovered.toLowerCase() !== expectedAddress.toLowerCase()) {
    Lit.Actions.setResponse({ response: JSON.stringify({ error: 'Invalid signature' }) });
    return;
}
```

### Available Lit.Actions methods (Chipotle)

- `Lit.Actions.getPrivateKey({ pkpId })` — get PKP private key
- `Lit.Actions.setResponse({ response })` — return value from action
- `Lit.Actions.signAndCombineEcdsa({ toSign, publicKey, sigName })` — sign bytes with PKP
- `Lit.Actions.decryptAndCombine({ accessControlConditions, ciphertext, dataToEncryptHash, chain })` — decrypt (uses Lit network key, not PKP)

**Note:** `signAndCombineEcdsa` can timeout (~25s) if nodes don't reach consensus. Use unique `sigName` per execution to avoid collisions.

### compactAction utility

```typescript
// Strips TypeScript types and minifies action code for sending as string
const compactAction = (fn: Function): string => {
    return fn.toString()
        .replace(/\/\/.*/g, '')     // remove comments
        .replace(/\s+/g, ' ')      // collapse whitespace
        .trim();
};
```

### ownerInvocationAction

The standard Lit Action used by NillionPkpClient to generate NUC invocation tokens for nilDB API calls:

```javascript
const ownerInvocationAction = (poolId, contractAddress, safeAddress) => async function main({
    signature, userAddress, pkpId, pkpDid, nodeDid, command
}) {
    // 1. Verify caller controls the safe (pool owner check)
    // 2. PKP signs a NUC invocation token for the specific nilDB node
    // 3. Return { invocation: "eyJ..." }
};
```

---

## 7. SaaS vs Sovereign Mode

### SaaS Mode (current)

```
S3ntiment Lit Account
    └── Pool A: Group 22 + PKP 0x7598... + Usage Key
    └── Pool B: Group 45 + PKP 0xabcd... + Usage Key

S3ntiment holds all Account API keys.
Organiser trusts S3ntiment.
```

### Sovereign Mode (planned)

```
Organiser's own Lit Account
    └── Their Pool: Group + PKP + Usage Key

S3ntiment provides Action CIDs (open source, auditable).
Organiser controls who can execute.
S3ntiment has ZERO access without organiser's usage key.
```

The sovereign path: organiser creates their own Lit account, registers S3ntiment's published action CIDs in their group, holds the usage key themselves. S3ntiment becomes a code provider, not an operator.

---

## 8. Common Errors and Fixes

**`API key cannot use selected wallet in selected action`**
→ The PKP is not a member of the group the usage key is scoped to.
→ Fix: add the PKP to the group via dashboard or API.
→ Root cause: new survey on existing pool minted a new PKP instead of reusing the pool's.

**`API key is not authorized to execute the specified action`**
→ The action CID is not registered in the group.
→ Fix: add the action CID to the group via `addActionToGroup`.

**`Uncaught SyntaxError: Unexpected token ';' at line 3:9`**
→ `compactAction()` is mangling the action code.
→ Fix: log the raw string before sending to verify it's valid JS.
→ TypeScript destructuring and `for...of` can cause issues — test with simple actions first.

**`signAndCombineEcdsa` timeout with 25s remaining**
→ Nodes not reaching consensus.
→ Fix: use unique `sigName` per execution: `sigName: \`sign-\${Date.now()}\``

**NUC token 401 on nilDB**
→ `aud` field in token must match the specific node DID being called.
→ Generate a fresh invocation per node with `nodeDid: node.did`.

---

## 9. Network Configuration

```typescript
// Chipotle production
const BASE_URL = 'https://api.chipotle.litprotocol.com/core/v1';

// Environment variables
LIT_API_ACCOUNT_KEY=       // account-level key, S3ntiment holds
// Usage keys stored per pool in database/config
```

---

## 10. Where to Get More Information

| Resource | URL |
|----------|-----|
| Lit docs (Chipotle) | https://developer.litprotocol.com |
| Migration guide (Naga → Chipotle) | https://developer.litprotocol.com/lit-actions/migration/changes |
| Lit Actions SDK reference | https://developer.litprotocol.com/lit-actions |
| Lit dashboard (manage groups/keys) | https://dashboard.litprotocol.com |

### S3ntiment conversation threads (searchable in past chats)

- **"Lit protocol v3 changes and agentic workflows"** — Chipotle architecture overview, LitService pattern, usage key vs account key
- **"S3ntiment deployment version and decryption error"** — group/PKP/usage key debugging, existing pool reuse bug
- **"Implementing message verification in Viem service"** — NillionPkpClient + executeAction + ownerInvocationAction
- **"Debugging 404 error in collection creation endpoint"** — compactAction syntax error, NUC token aud field
- **"Debugging lit network naga-test regression"** — session signatures, Naga flow for context
- **"Verifying message signatures with Lit actions"** — ethers.verifyMessage inside Lit Actions
- **"Lit protocol founding team"** — PKP group model, SaaS vs sovereign architecture
