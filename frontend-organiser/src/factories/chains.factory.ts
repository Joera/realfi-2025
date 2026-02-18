import { mainnet, sepolia, base, baseSepolia, gnosis } from "viem/chains";


export const getViemChainById = (id: number)  => {
    
    switch (id) {
      case 1:
        return mainnet;
      case 11155111:
        return sepolia;
      case 8453:
        return base;
      case 84532:
        return baseSepolia;
      case 100:
        return gnosis;
      default:
        return mainnet;
    }
  }

export const getChainId = (chain: string) => {

    switch (chain) {

      case 'mainnet':
          return 1;
      case 'base':
          return 8453;
      default:
          return 1;
    }
}

export const getRPCUrl = (chainId: number): string|undefined => {
  let rpc;

  const alchemy_key = import.meta.env.VITE_ALCHEMY_KEY;

  switch (chainId) {
    case 1:
      rpc = `https://eth-mainnet.g.alchemy.com/v2/${alchemy_key}`;
      break;

    case 11155111:
      // rpc = `https://eth-sepolia.g.alchemy.com/v2/${alchemy_key}`;
      rpc = "https://sepolia.infura.io/v3/5588b2f2645b47bf9d9df736ab328181";
      break;

    case 8453:
      rpc =  `https://base-mainnet.g.alchemy.com/v2/${alchemy_key}`;
      break;

    case 84532:
      rpc = `https://base-sepolia.g.alchemy.com/v2/${alchemy_key}`;
      break;

    case 175188:
      rpc = "https://yellowstone-rpc.litprotocol.com/";
      break;

  }

  return rpc;
};

export const getScanApi = (chainId: number): string => {

      return `https://api.etherscan.io/v2/api?chainid=` + chainId;
}
