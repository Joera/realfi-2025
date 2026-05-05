---
name: waap
description: >
  Reference skill for WAAP (Wallet as a Protocol) by Human.tech — covering what it is,
  how it works cryptographically, how it is integrated into S3ntiment, and where to find
  up-to-date documentation. Use this skill whenever the user asks about WAAP, Human Keys,
  the Human Network, wallet login in S3ntiment, passkey-based auth, WaaP SDK integration,
  signer derivation from WAAP, or compares WAAP to Privy/WaaS solutions.
---

# WAAP — Wallet as a Protocol

A reference document for working with WAAP in the S3ntiment codebase, compiled from
project conversations (Oct 2025 – Apr 2026).

---

## 1. What is WAAP?

WAAP stands for **Wallet as a Protocol** — a category of decentralized wallet infrastructure
introduced by **Human.tech** (Holonym Foundation) in partnership with **Ika Network**.

It is the evolution beyond **Wallet-as-a-Service (WaaS)** (e.g. Privy, Magic). Where WaaS
providers give apps custodial control over user wallets, WAAP decentralizes that entirely:
no seed phrase, no centralized key holder, no vendor lock-in.

> "Wallet-as-a-Protocol is what Wallet-as-a-Service wanted to be." — Nanak Nihal Singh Khalsa, Co-Founder, Human.tech

### Key properties

- **Non-custodial**: user holds their sovereign share; neither Human.tech nor the app can access funds unilaterally
- **No seed phrase**: authentication via email, phone, socials, or Face ID
- **EIP-1193 compliant**: integrates as a standard Ethereum provider (`window.waap`)
- **Multi-chain**: Ethereum/EVM, Sui, Bitcoin (via cross-chain coordination with Ika)
- **Free**: no API key required for developers (as of April 2026)
- **Audited**: Cure53, Hexens, Least Authority, Halborn

---

## 2. Cryptographic Architecture

### Two-Party Computation (2PC-MPC)

The private key is **never whole** — it is split into two mathematically linked shares:

| Share               | Where                                           | Who controls            |
| ------------------- | ----------------------------------------------- | ----------------------- |
| **Sovereign Share** | User's device (derived via Human Network VOPRF) | User                    |
| **Security Share**  | Ika Network (TEE / secure enclave)              | Ika (threshold network) |

Both shares are required for any signing operation. Neither the user's device alone, nor
Ika alone, nor Human.tech can sign on behalf of the user.

### Identity derivation flow

```
Email address
    ↓
JWT sub (stable identifier tied to email)
    ↓
VOPRF via Human Network  ← sub is the INPUT to the VOPRF
    ↓
Sovereign Share (deterministic output per email)
    ↓
Combined with Security Share via 2PC-MPC
    ↓
Deterministic wallet address
```

**Important**: the same email always produces the same wallet address because the VOPRF
output is deterministic. There is no "account" stored anywhere — identity is derived,
not assigned.

### Nillion signer derivation (S3ntiment pattern)

Because Nillion's `SecretVaultUserClient` requires a keypair-based signer, S3ntiment
derives one from the WAAP wallet signature:

```typescript
// Sign a deterministic message using WAAP (requires both 2PC shares)
const message = "nillion-keypair-derivation-v1";
const signature = await signer.signMessage(message);
// signature = f(x1, x2, message) via MPC — requires BOTH shares

// Use signature as entropy seed for Nillion keypair
const nillionKeypair = Keypair.from(signature);
```

Why this is secure: deriving from the full MPC signature (not just the sovereign share)
maintains the two-party security model. Compromising one share does not expose the
Nillion keypair.

Because RFC 6979 deterministic nonce is used: same email + same message = same signature
= same Nillion identity across sessions.

---

## 3. WAAP vs WaaS (why we chose WAAP)

|                              | Privy (WaaS)                               | WAAP                              |
| ---------------------------- | ------------------------------------------ | --------------------------------- |
| **Key custody**              | Privy custodies embedded wallet keys       | User's sovereign share + Ika      |
| **Login**                    | Email code → sign message (custodial sign) | Email link → JWT → wallet derived |
| **Seed phrase**              | No (Privy holds keys)                      | No (2PC)                          |
| **Vendor dependency**        | High — Privy can change terms              | Low — decentralized               |
| **Privacy**                  | Privy sees user data & activity            | Zero-trust, no single observer    |
| **Alignment with S3ntiment** | ❌ Contradicts privacy mission             | ✅ Aligned                        |
| **Cost**                     | Subscription per wallet                    | Free                              |

When Privy asks a user to "sign something" during email login, it is actually signing
with a freshly generated key that Privy controls — the user never held the key themselves.
WAAP keeps email auth and wallet auth as separate, non-custodial flows.

---

## 4. WAAP in S3ntiment — How It Is Used

### Authentication flow (respondent onboarding)

```
User enters email
    ↓
Magic link sent → user clicks
    ↓
JWT issued (contains sub — stable, email-tied identifier)
    ↓
WAAP derives wallet address deterministically (via Human Network)
    ↓
window.waap is available as EIP-1193 provider
    ↓
S3ntiment derives Nillion signer from WAAP signature
    ↓
User can write to their Nillion-owned collection
```

No wallet install. No seed phrase. Any device. Recoverable via email.

### Why this beats ZK credential wallets

|                  | ZK credential wallet (e.g. Zupass) | S3ntiment + WAAP         |
| ---------------- | ---------------------------------- | ------------------------ |
| Onboarding       | Install app, backup seed           | Email + click            |
| Lost device      | Credentials gone                   | Log in again             |
| Proof generation | Client-side, slow                  | Lit Action (server-side) |
| Target user      | Crypto natives                     | Everyone                 |

### Pattern in codebase

```typescript
// Init WAAP (EIP-1193 provider)
const loginType = await window.waap.login();

// Get address
const accounts = await window.waap.request({ method: "eth_requestAccounts" });
const address = accounts[0];

// Verify message / recover address (viem pattern used in S3ntiment)
import { recoverMessageAddress } from "viem";

const address = await recoverMessageAddress({
  message: msg,
  signature: signature as `0x${string}`,
});
```

### WAAP as "invocation" vs "delegation" (in Nillion context)

| Action                                   | Pattern                                |
| ---------------------------------------- | -------------------------------------- |
| User logs in with WAAP                   | Invocation (authentication)            |
| PKP creates collection on behalf of pool | Invocation                             |
| PKP grants user write access             | Delegation                             |
| User writes survey response              | Invocation (carrying delegation proof) |

WAAP login = **invocation for authentication**: proving "I am this key" so the server
can act on the user's behalf or the user can construct a Nillion signer.

---

## 5. SDK Integration Notes

### Basic integration (EIP-1193)

```typescript
import { initWaaP } from "@holonym-foundation/waap-sdk";

await initWaaP(); // mounts window.waap

const loginType = await window.waap.login();
// returns: 'waap' | 'injected' | 'walletconnect' | null

const [address] = await window.waap.request({ method: "eth_requestAccounts" });
```

### TypeScript types issue (known)

The SDK's exported types may not include the `request` method. Workaround:

```typescript
// Cast to any or extend the type
const waap = window.waap as any;
const accounts = await waap.request({ method: "eth_requestAccounts" });
```

### Integration with permissionless.js

The WAAP team provides a recipe at:
`https://github.com/holonym-foundation/waap-examples/blob/main/waap-permissionless/RECIPE.md`

The recipe uses `toOwner()` from permissionless — this is a normalizer utility that accepts
a `WalletClient`, `EIP1193Provider`, or `LocalAccount` and returns a standard `Owner` type
compatible with smart account constructors.

### Electron / Obsidian limitation (known issue)

WAAP uses an iframe with postMessage origin checking. Electron apps use `app://` origins
which are rejected by `waap.xyz`. Fix requires:

1. Human.tech allowing `app://` origins server-side (open issue)
2. SDK fork with electron-aware origin checks client-side

---

## 6. Agentic WaaP (April 2026 — latest development)

Announced at WalletCon 2026 in Cannes. Extends WAAP to AI agents:

- **Privileges** (formerly Permission Tokens): define time limits, spending caps, allowed contracts
- **Policy engine**: higher-risk actions route to human-in-the-loop approval (e.g. one-tap Telegram confirmation)
- **Natural language interface**: abstracts signing/auth for non-technical users
- **No API key required** for developers

> "We are not giving agents wallets. We are giving humans delegation tools." — Shady El Dalmaty, Co-founder

The same 2PC-MPC model applies: neither the AI agent, the developer, nor Human.tech can
act independently. Evolving toward full decentralization via Ika Network.

---

## 7. Human.tech Ecosystem

| Component          | What it is                                                           |
| ------------------ | -------------------------------------------------------------------- |
| **WAAP**           | Wallet as a Protocol — the wallet layer                              |
| **Human Keys**     | The underlying key technology (VOPRF + 2PC-MPC)                      |
| **Human Network**  | Decentralized threshold network (EigenLayer + Symbiotic secured)     |
| **Human Passport** | 3M+ users, 175+ partners — sybil-resistance / identity verification  |
| **Ika Network**    | Parallel MPC network on Sui — provides the co-signing Security Share |
| **$HUMN token**    | Protocol token — likely sustains the network economically            |
| **Gas Tank**       | Sponsored transactions — users don't need to hold ETH for gas        |

**Scale (as of April 2026):**

- 3M+ Human Passport users
- 175+ ecosystem partners
- $500M+ protected from sybil attacks
- $3B+ in restaked ETH securing the network

---

## 8. Where to Get More Information

| Resource                                   | URL                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| WAAP docs (primary)                        | https://docs.wallet.human.tech/                                                                    |
| Human.tech main site                       | https://human.tech/waap                                                                            |
| WAAP examples / recipes                    | https://github.com/holonym-foundation/waap-examples                                                |
| Human Network whitepaper                   | Available via human.tech — "A Decentralized Threshold Network with forward secrecy"                |
| Ika + Human.tech announcement              | https://www.theblock.co/press-releases/375698/ika-and-human-tech-reveal-wallet-as-a-protocol-waap  |
| Agentic WaaP announcement (WalletCon 2026) | https://invezz.com/news/2026/04/01/human-tech-unveils-agentic-waap-for-secure-ai-agent-operations/ |
| WaaP vs Safe comparison                    | https://www.onesafe.io/blog/wallet-as-a-protocol-decentralized-infrastructure                      |

### S3ntiment conversation threads (searchable in past chats)

- **"Business model for WAAP"** — overview of WAAP protocol, $HUMN token economics, Human Network whitepaper
- **"S3ntiment builder key selection strategy"** — WAAP vs Privy architectural decision, custody tradeoffs
- **"Viewing connected wallet address after login"** — SDK usage, `eth_requestAccounts`, TypeScript types
- **"Integrating WAAP with permissionless.js"** — `toOwner()` method, recipe walkthrough
- **"WaaP request method type error"** — signer derivation, MPC signature as Nillion seed
- **"WAAP login relocation with signer creation flow"** — deferred login UX, card nullifier + WAAP binding
- **"Implementing message verification in Viem service"** — `recoverMessageAddress`, WAAP in full stack context

---

## 9. Quick Reference — Common Patterns

### Get WAAP address after login

```typescript
await window.waap.login();
const [address] = await (window.waap as any).request({
  method: "eth_requestAccounts",
});
```

### Derive deterministic Nillion signer from WAAP

```typescript
const sig = await signer.signMessage("nillion-keypair-derivation-v1");
const nillionKeypair = Keypair.from(sig); // same email → same keypair always
```

### Recover address from WAAP-signed message (server-side verification)

```typescript
import { recoverMessageAddress } from "viem";
const address = await recoverMessageAddress({ message, signature });
```

### Check WAAP docs for latest SDK version

```
https://docs.wallet.human.tech/docs/methods
```
