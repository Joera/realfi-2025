export const getDelegationAction = `
async function main({ pkpId, pkpDid, userDid, builderDelegation }) {
    const privateKey = await Lit.Actions.getPrivateKey({ pkpId });
    const wallet = new ethers.Wallet(privateKey);
    
    const header = {
        typ: 'nuc',
        alg: 'ES256K',
        ver: '1.0.0'
    };
    
    const payload = {
        iss: pkpDid,
        aud: userDid,
        sub: pkpDid,
        cmd: '/nil/db/data/create',
        pol: [],
        exp: Math.floor(Date.now() / 1000) + 3600,
        nonce: [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        prf: [builderDelegation]
    };
    
    const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const headerB64 = base64url(header);
    const payloadB64 = base64url(payload);
    const message = headerB64 + '.' + payloadB64;
    
    // Sign without Ethereum prefix
    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
    const sig = wallet._signingKey().signDigest(messageHash);
    const sigBytes = ethers.utils.concat([sig.r, sig.s]);
    const sigB64 = Buffer.from(ethers.utils.arrayify(sigBytes)).toString('base64url');
    
    return { delegation: headerB64 + '.' + payloadB64 + '.' + sigB64 };
}
`;