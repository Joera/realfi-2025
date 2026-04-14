import { base58btc } from 'multiformats/bases/base58';

export const publicKeyToDidKey = (publicKeyHex: string): string => {
    let pubKeyHex = publicKeyHex.replace('0x', '');
    
    // If uncompressed (65 bytes = 130 hex chars, starts with 04), compress it
    if (pubKeyHex.length === 130 && pubKeyHex.startsWith('04')) {
        // Extract x and y coordinates
        const x = BigInt('0x' + pubKeyHex.slice(2, 66));
        const y = BigInt('0x' + pubKeyHex.slice(66, 130));
        
        // Compressed format: 02 if y is even, 03 if y is odd, followed by x
        const prefix = (y % 2n === 0n) ? '02' : '03';
        pubKeyHex = prefix + pubKeyHex.slice(2, 66);
    }
    
    // For secp256k1 compressed, multicodec prefix is 0xe7, 0x01
    const pubKeyBytes = Buffer.from(pubKeyHex, 'hex');
    const multicodecPrefix = Buffer.from([0xe7, 0x01]);
    const prefixedKey = Buffer.concat([multicodecPrefix, pubKeyBytes]);
    
    const encoded = base58btc.encode(prefixedKey);
    return `did:key:${encoded}`;
};