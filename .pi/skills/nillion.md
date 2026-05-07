---
name: nillion
description: >
  Reference skill for Nillion — covering nilDB (secret-shared storage), nilCC (TEE compute),
  the NUC token / delegation system, the SecretVaults SDK, blindfold operations, collection
  schemas, and how Nillion is integrated into S3ntiment. Use this skill whenever the user
  asks about Nillion, nilDB, nilCC, nilVM (deprecated), NUC tokens, %allot, %share, secret
  sharing, blind computation, SecretVaultUserClient, Builder.delegation(), or anything
  related to the Nillion layer of the S3ntiment stack. Trigger also on tags #nillion #Nillion.
---

# Nillion — Reference Document

Compiled from S3ntiment project conversations (Oct 2025 – Apr 2026).

---

## 1. What Nillion Is

Nillion is a decentralized network for **blind computation** — storing and computing over
data that remains encrypted and never reconstructable by any single party.

Two active products matter for S3ntiment:

| Component | What it does |
|-----------|-------------|
| **nilDB** | Secret-shared storage across a cluster of nodes |
| **nilCC** | Confidential compute in TEEs (Docker containers in hardware enclaves) |
| ~~nilVM~~ | **Deprecated.** Do not reference. nilCC replaces it. |

### Architecture in one sentence

Data is split via Shamir Secret Sharing across 3 nilDB nodes (no single node holds
readable data), and computation over that data runs in nilCC TEEs where even the
server operator cannot read the plaintext.

---

## 2. Two Security Layers

**Layer 1 — Access Control (ACL)**

Every record has an ACL specifying who can read, write, and execute queries on it.
Parties are identified by DID. This is enforced at the API layer.

```typescript
acl: {
    grantee: pkpDid,   // who gets access
    read: false,       // can they read individual records?
    write: false,      // can they write more records?
    execute: true,     // can they run aggregate queries?
}
```

**Layer 2 — Encryption (Blind Computation)**

Even parties with execute access cannot see individual values — they can only receive
the output of an aggregate computation (e.g. SUM). Data is:
- Split via additive secret sharing across nodes (multi-node cluster)
- Or encrypted with Paillier homomorphic encryption (single node)

The combination means: organizers see totals, never individual responses.

---

## 3. %share vs %allot

These are two POVs on the same encryption mechanism:

| Tag | Where used | What it means |
|-----|-----------|--------------|
| `%share` | **Schema definition** | "This field stores a secret-shared value" |
| `%allot` | **Data insertion** | "Encrypt this value and distribute shares across nodes" |

```typescript
// SCHEMA — define that a field is secret-shared:
properties: {
    rating: {
        type: "object",
        properties: { "%share": { type: "string" } }
    }
}

// DATA — write an encrypted value:
{
    rating: { "%allot": "5" }
}

// What each node stores:
{
    rating: { "%share": "xK9f3m..." }  // each node gets a different share
}
```

**Type must match:** if schema says `type: "integer"`, send a number. If `type: "string"`,
send a string. Type mismatch causes validation errors.

### Blindfold operation

The SDK client is initialized with a blindfold operation that determines the encryption
protocol:

```typescript
const client = await SecretVaultUserClient.from({
    baseUrls: nodes,
    signer: signer,
    blindfold: {
        operation: 'store',  // or 'sum' for aggregation
    },
});
```

- `operation: 'store'` — XOR sharing, for encrypted storage only
- `operation: 'sum'` — additive sharing, enables SUM queries on the data

**The tension in S3ntiment:** you need `sum` for numeric fields (ratings, radio) and
`store` for text fields. The SDK client uses one operation at a time — this requires
either two client instances or a workaround.

---

## 4. Supported Blind Compute Operations

nilDB only supports **SUM** on `%share` fields. That's the only aggregate operation
available on encrypted data.

| Operation | Supported |
|-----------|-----------|
| SUM | ✅ |
| AVG | ❌ (compute manually: SUM ÷ COUNT) |
| MIN / MAX | ❌ |
| Bitwise AND/OR | ❌ |
| COUNT | ✅ (standard, non-blind) |

**Implication for checkboxes:** You cannot store a bitmask and bitwise-AND on it.
Each checkbox option needs its own `%share` integer field with value 0 or 1:

```typescript
// For a checkbox question with options [rice, pasta, eggs]:
properties["question_abc_0"] = { type: "object", properties: { "%share": { type: "string" } } }
properties["question_abc_1"] = { type: "object", properties: { "%share": { type: "string" } } }
properties["question_abc_2"] = { type: "object", properties: { "%share": { type: "string" } } }

// Data:
{ "question_abc_0": { "%allot": "1" }, "question_abc_1": { "%allot": "0" }, "question_abc_2": { "%allot": "1" } }

// Query: SUM(question_abc_0) → count of people who selected rice
```

---

## 5. Collection Schema

### Survey collection structure (S3ntiment pattern)

```typescript
export const createSurveyCollectionSchema = (config: Survey, type: "owned" | "standard" = "standard") => {
    const properties: Record<string, any> = {
        _id: { type: "string", format: "uuid" },
        surveyId: { type: "string" },
        signer: { type: "string" }
    };

    for (const group of config.groups) {
        for (const question of group.questions) {
            switch (question.type) {
                case "radio":
                case "scale":
                    properties[question.id] = {
                        type: "object",
                        properties: { "%share": { type: "string" } }
                    };
                    break;
                case "checkbox":
                    for (let i = 0; i < question.options.length; i++) {
                        properties[`${question.id}_${i}`] = {
                            type: "object",
                            properties: { "%share": { type: "string" } }
                        };
                    }
                    break;
                case "text":
                    properties[question.id] = { type: "string" }; // no blind compute
                    break;
            }
        }
    }

    return {
        _id: config.id,
        name: config.id || config.title,
        type,  // "owned" for user-owned collections
        schema: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "array",
            uniqueItems: true,
            items: {
                type: "object",
                properties,
                required: ["_id", "surveyId"]
            }
        }
    };
};
```

**Collection types:**
- `"standard"` — builder owns all data
- `"owned"` — each record has an individual owner (user DID) + ACL

You cannot change a collection's type after creation. Create a new one.

---

## 6. NUC Token System (Delegation)

Nillion uses **NUC (Nillion User Credentials)** tokens for authorization — a capability
token system similar to UCAN.

### Token types

| Token | Who signs | Says what |
|-------|-----------|-----------|
| **Invocation** | Actor | "I am doing X now" |
| **Delegation** | Owner | "Party Y can do X" (permission grant) |

### Delegation chain in S3ntiment

```
Builder (collection owner)
    └── delegates to PKP DID
            └── PKP sub-delegates to User DID
                    └── User writes to collection
```

Each delegation token carries a `prf` (proof) array referencing parent delegations,
forming a verifiable chain.

### SDK — @nillion/nuc (2.0.0+)

In version 2.0.0, `NucTokenBuilder` was renamed. Exports are:

```
Builder, Codec, Did, Envelope, Errors, NUC_EIP712_DOMAIN,
Payload, Policy, Signer, Validator
```

```typescript
import { Builder, Did, Signer } from "@nillion/nuc";

// Issue a delegation from builder to a user
const delegation = await Builder.delegation()
    .audience(Did.parse(userDidString))
    .subject(Did.parse(userDidString))
    .command("/nil/db/data/create")
    .policy([
        ["==", ".args.collection", collectionId]
    ])
    .expiresIn(3600)
    .sign(builderSigner);
```

### auth modes in SecretVaultUserClient

When calling `createData`, the `auth` parameter has two modes:

```typescript
// Mode 1: pass pre-built invocations keyed by node DID
await user.createData(body, {
    auth: { invocations: { "did:key:zQ3sh...": "eyJ..." } }
});

// Mode 2: pass a single delegation, SDK builds invocations (requires user signer)
await user.createData(body, {
    auth: { delegation: delegationToken }
});
```

In S3ntiment, Mode 1 is used because users authenticate via WAAP (passkey), not a
Nillion `Signer`. The backend generates per-node invocations signed by the PKP.

---

## 7. Node URLs

### S3ntiment mainnet nodes (from NilPay cluster)

```env
NILDB_NODES=https://nildb-5ab1.nillion.network,https://nildb-f496.nillion.network,https://nildb-f375.nillion.network
```

### Staging nodes (limited features — do not use for owned collections)

```
https://nildb-stg-n1.nillion.network
https://nildb-stg-n2.nillion.network
https://nildb-stg-n3.nillion.network
```

**Important:** The `/v1/data/owned` endpoint is NOT available on staging nodes.
Owned collections only work on mainnet. This caused a persistent 404 error in
development until the switch to mainnet nodes.

---

## 8. SecretVaults SDK

### Package

```bash
pnpm add @nillion/secretvaults@3.0.0
pnpm add @nillion/nuc
```

### Key version notes

- SDK 3.0.0 introduced `nilauthClient` as a required parameter in `SecretVaultUserClient`
- If TypeScript still complains after upgrading, restart the TS server (VS Code:
  `Ctrl+Shift+P` → "TypeScript: Restart TS Server")
- Check for multiple copies in a monorepo: `find . -name "package.json" -exec grep -l "secretvaults" {} \;`

### SecretVaultUserClient

```typescript
import { SecretVaultUserClient } from "@nillion/secretvaults";

const user = await SecretVaultUserClient.from({
    baseUrls: nodes.split(','),
    signer: nillionSigner,
    blindfold: {
        operation: 'store',  // or 'sum'
    },
});
```

The `signer` here is a Nillion keypair-based signer, derived from the WAAP signature:

```typescript
// Derive deterministic Nillion signer from WAAP MPC signature
const sig = await waapSigner.signMessage("nillion-keypair-derivation-v1");
const nillionKeypair = Keypair.from(sig);
```

---

## 9. nilCC — Confidential Compute

nilCC is managed TEE hosting: submit a Docker Compose file, it runs inside a hardware
enclave (Intel SGX / AMD SEV), you get back cryptographic attestation.

**What it provides:**
- Memory isolation — even Nillion operators cannot read enclave memory
- Remote attestation — anyone can verify which code is running
- Suitable for: processing survey results, running aggregation logic, decrypting
  delegation chains without exposing keys

**Current limitation:** nilCC is single-node per workload. Multi-node coordination
(e.g. FROST threshold signing across nodes) must be built on top — nilCC does not
provide it natively. Secret shares live in nilDB; a nilCC workload pulls the relevant
share from nilDB, processes it, and writes results back.

**For S3ntiment:** nilCC is the planned environment for running the backend
(NillionPkpClient, delegation issuance) so that the PKP private key and delegation
signing happen inside a TEE rather than on a regular server. This upgrades the privacy
claim from "trust the server operator" to "trust the TEE + auditable code."

---

## 10. NilAI — Limitation with Encrypted Data

NilAI allows LLM inference over nilDB data via RAG. However: NilAI **cannot decrypt
`%allot`-encrypted fields**. It receives `%share` ciphertext which is meaningless to
the LLM.

NilAI only works with:
- Plaintext fields (text questions without `%allot`)
- Aggregate outputs from blind compute (the final SUM result)

It cannot summarize or analyze individual encrypted responses.

---

## 11. S3ntiment Integration Summary

```
Respondent submits survey
    ↓
Frontend derives Nillion signer from WAAP signature
    ↓
Frontend calls backend for write delegation
    ↓
Backend (NillionPkpClient) verifies pool membership (on-chain)
    ↓
PKP signs per-node invocations via Lit Action
    ↓
Frontend calls user.createData() with { auth: { invocations: ... } }
    ↓
Data stored as %allot-encrypted shares across 3 nilDB mainnet nodes
    (no node sees the plaintext, no single point of failure)
    ↓
Organizer requests results
    ↓
PKP signs read/execute delegation for organizer
    ↓
Organizer runs SUM query → receives aggregate totals only
    (individual responses never decrypted, never visible)
```

---

## 12. Where to Get More Information

| Resource | URL |
|----------|-----|
| Nillion docs (primary) | https://docs.nillion.com |
| nilDB API reference | https://docs.nillion.com/api/nildb/overview |
| SecretVaults quickstart | https://docs.nillion.com/build/private-storage/quickstart |
| Blindfold library | https://blindfold.nillion.com/ |
| SDK examples | https://github.com/NillionNetwork/blind-module-examples |
| NilPay (node credits) | https://nilpay.nillion.com |
| nilCC docs | https://docs.nillion.com/build/nilcc |

### S3ntiment conversation threads (searchable in past chats)

- **"Nillion data distribution and Shamir secret sharing"** — SSS vs MPC, additive homomorphism
- **"Nillion security layers overview"** — ACL vs encryption two-layer model
- **"Nillion additive secret sharing configuration debugging"** — %allot/%share, blindfold ops
- **"Backend security: nilcc vs server"** — TEE trust model vs regular server
- **"Fixing pnpm libsodium-wrappers missing file error"** — %share vs %allot explained, schema lessons
- **"Implementing message verification in Viem service"** — NUC delegation chain, owned collections, mainnet nodes
- **"Migrating Lit Protocol session signatures to Naga network"** — NUC token delegation, SUM operations, checkbox schema
- **"Nillion user owned collections thread"** — PKP delegation chain, 401 debugging

---

## 13. Quick Reference — Common Gotchas

- **404 on /v1/data/owned** → you're using staging nodes, switch to mainnet
- **TypeScript complains after SDK upgrade** → restart TS server
- **SUM query returns wrong results** → blindfold must be `operation: 'sum'`, not `'store'`
- **"nilauthClient missing"** → SDK version mismatch, upgrade to 3.0.0
- **%allot type mismatch** → schema says integer, you're sending a string (or vice versa)
- **Delegation 401** → `aud` in NUC token must match the specific node DID, not a generic audience
- **nilVM referenced anywhere** → deprecated, replace with nilCC
- **NilAI can't read data** → encrypted fields (`%allot`) are opaque to LLMs; only plaintext or aggregate outputs work
