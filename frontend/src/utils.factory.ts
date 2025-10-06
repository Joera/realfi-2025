
 export const decimalToHex = (decimal: string | number): `0x${string}` => {
    // Convert to BigInt to handle large numbers
    const bigIntValue = BigInt(decimal);
    
    // Convert to hex and pad to 64 characters (32 bytes)
    const hexString = bigIntValue.toString(16).padStart(64, '0');
    
    return `0x${hexString}` as `0x${string}`;
 }