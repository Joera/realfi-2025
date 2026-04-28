import { EIP1193BlockTag, EIP1193ProviderWithoutEvents } from 'eip-1193';
export type EstimateGasPriceOptions = {
    blockCount: number;
    newestBlock: EIP1193BlockTag;
    rewardPercentiles: number[];
};
export type RoughEstimateGasPriceOptions = {
    blockCount: number;
    newestBlock: EIP1193BlockTag;
    rewardPercentiles: [number, number, number];
};
export type GasPrice = {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
};
export type EstimateGasPriceResult = GasPrice[];
export type RoughEstimateGasPriceResult = {
    slow: GasPrice;
    average: GasPrice;
    fast: GasPrice;
};
export declare function getGasPriceEstimate(provider: EIP1193ProviderWithoutEvents, options?: Partial<EstimateGasPriceOptions>): Promise<EstimateGasPriceResult>;
export declare function getRoughGasPriceEstimate(provider: EIP1193ProviderWithoutEvents, options?: Partial<RoughEstimateGasPriceOptions>): Promise<RoughEstimateGasPriceResult>;
/**
 *  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number..
 *
 * - Docs: https://viem.sh/docs/utilities/formatUnits
 *
 * @example
 * import { formatUnits } from 'viem'
 *
 * formatUnits(420000000000n, 9)
 * // '420'
 */
export declare function formatUnits(value: bigint, decimals: number): string;
export declare const etherUnits: {
    gwei: number;
    wei: number;
};
/**
 * Converts numerical wei to a string representation of ether.
 *
 * - Docs: https://viem.sh/docs/utilities/formatEther
 *
 * @example
 * import { formatEther } from 'viem'
 *
 * formatEther(1000000000000000000n)
 * // '1'
 */
export declare function formatEther(wei: bigint, unit?: 'wei' | 'gwei'): string;
//# sourceMappingURL=eth.d.ts.map