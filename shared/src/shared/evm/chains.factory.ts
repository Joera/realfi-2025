export const getRPCUrl = (chainId: number, alchemyKey?: string): string | undefined => {

    switch (chainId) {
        case 1:
            return `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
        case 11155111:
            return "https://sepolia.infura.io/v3/5588b2f2645b47bf9d9df736ab328181";
        case 8453:
            return `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`;
        case 84532:
            return `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`;
        case 175188:
            return "https://yellowstone-rpc.litprotocol.com/";
        default:
            return undefined;
    }
};

export const getScanApi = (chainId: number): string => {
    return `https://api.etherscan.io/v2/api?chainid=${chainId}`;
};
