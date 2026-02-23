 export const ensureHex = (value: string) : `0x${string}` => {
    if (!value) throw new Error("Empty value provided");
    
    // Remove any existing 0x prefix and convert to lowercase
    const cleaned = value.replace(/^0x/i, '').toLowerCase();
    
    // Validate it's a valid hex string
    if (!/^[0-9a-f]*$/.test(cleaned)) {
      throw new Error(`Invalid hex string: ${value}`);
    }
    
    return `0x${cleaned}` as `0x${string}`;
  }