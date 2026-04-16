export const getUserWriteDelegationAction = `
/**
 * PKP-signed delegation token for user data writes.
 * 
 * NUC Token Flow:
 * 1. PKP (builder) creates ONE delegation token → User
 * 2. User's SDK receives delegation and builds per-node invocations internally
 * 3. SDK signs invocations with user's signer
 * 
 * Delegation vs Invocation:
 * - Delegation has 'pol' (policy array) - grants permission
 * - Invocation has 'args' (arguments object) - executes action
 * 
 * Token fields:
 * - iss: PKP DID (who signs/issues the delegation)
 * - sub: PKP DID (whose authority is being delegated - same as iss for root)
 * - aud: User DID (who receives the delegation)
 * - cmd: '/nil/db/data/create' (what action is authorized)
 * - pol: [] (empty = no restrictions, or [['==', '.collection', id]] to restrict)
 * 
 * The collection is NOT in the token - it's passed in the HTTP request body.
 * The SDK handles building node-specific invocations from this single delegation.
 */
async function main({ pkpId, pkpDid, userDid, collectionId }) {

    const privateKey = await Lit.Actions.getPrivateKey({ pkpId });
    const wallet = new ethers.Wallet(privateKey);
    
    const header = {
        typ: 'nuc',
        alg: 'ES256K',
        ver: '1.0.0'
    };
    
    const payload = {
        iss: pkpDid,           // PKP signs
        sub: pkpDid,           // PKP is the granter (CHANGED)
        aud: userDid,          // User receives delegation (CHANGED)
        cmd: '/nil/db/data/create',  // Correct command (CHANGED)
        pol: [],
        exp: Math.floor(Date.now() / 1000) + 3600,
        nonce: Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        prf: []
    };
    
    const b64url = (obj) => {
        const str = JSON.stringify(obj);
        const b64 = btoa(str);
        return b64.replace(/[+]/g, '-').replace(/[/]/g, '_').replace(/=+$/g, '');
    };
    
    const headerB64 = b64url(header);
    const payloadB64 = b64url(payload);
    const message = headerB64 + '.' + payloadB64;
    
    const msgBytes = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBytes);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = '0x' + Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const sig = wallet._signingKey().signDigest(hashHex);
    
    const r = sig.r.slice(2);
    const s = sig.s.slice(2);
    const sigHex = r + s;
    
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    const sigB64 = btoa(String.fromCharCode(...sigBytes))
        .replace(/[+]/g, '-').replace(/[/]/g, '_').replace(/=+$/g, '');
    
    return { delegation: headerB64 + '.' + payloadB64 + '.' + sigB64 };
}
`;