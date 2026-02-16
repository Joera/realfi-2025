// DID key format (did:key:z...)
const didKeyRegex = /^did:key:z[1-9A-HJ-NP-Za-km-z]{46,}$/;

// Generic DID format (did:method:identifier)
const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;

// Usage
export const isDid = (str: string): boolean => didRegex.test(str);
export const isDidKey = (str: string): boolean => didKeyRegex.test(str);

const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;

        // CIDv1 (starts with b, variable length)
const cidV1Regex = /^b[a-z2-7]{58,}$/;

// Combined
export const isCid = (str: string): boolean => {
    return cidV0Regex.test(str) || cidV1Regex.test(str);
};