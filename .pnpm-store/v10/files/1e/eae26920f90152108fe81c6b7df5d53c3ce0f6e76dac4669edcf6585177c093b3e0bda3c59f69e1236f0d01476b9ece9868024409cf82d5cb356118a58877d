import * as chains from 'viem/chains';
import { kebabCase } from 'change-case';
const chainTypesByNames = {
    base: 'op-stack',
    baseGoerli: 'op-stack',
    baseSepolia: 'op-stack',
    optimism: 'op-stack',
    optimismGoerli: 'op-stack',
    optimismSepolia: 'op-stack',
    pgn: 'op-stack',
    pgnTestnet: 'op-stack',
    zora: 'op-stack',
    zoraSepolia: 'op-stack',
    zoraTestnet: 'op-stack',
    ancient8: 'op-stack',
    ancient8Sepolia: 'op-stack',
    celoAlfajores: 'celo',
    celo: 'celo',
    zkSync: 'zksync',
    zkSyncTestnet: 'zksync',
    zkSyncSepoliaTestnet: 'zksync',
};
const chainTypes = {};
const allChains = { ...(chains.default || chains) };
allChains['localhost'] = { ...allChains['hardhat'], name: 'localhost' };
export const chainById = {};
for (const key of Object.keys(allChains)) {
    const chain = allChains[key];
    const chainId = chain.id.toString();
    const specificChainType = chainTypesByNames[key];
    if (specificChainType) {
        chainTypes[chainId] = specificChainType;
    }
    const list = (chainById[chainId] = chainById[chainId] || []);
    list.push({ ...chain, chainType: specificChainType });
}
export const chainByCanonicalName = {};
for (const key of Object.keys(allChains)) {
    const chain = allChains[key];
    const canonicalName = kebabCase(chain.name);
    chainByCanonicalName[canonicalName] = chain;
}
//# sourceMappingURL=chains.js.map