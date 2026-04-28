import { logger } from '../internal/logging.js';
function avg(arr) {
    const sum = arr.reduce((a, v) => a + v);
    return sum / BigInt(arr.length);
}
export async function getGasPriceEstimate(provider, options) {
    const defaultOptions = {
        blockCount: 20,
        newestBlock: 'pending',
        rewardPercentiles: [10, 50, 80],
    };
    const optionsResolved = options ? { ...defaultOptions, ...options } : defaultOptions;
    const historicalBlocks = `0x${optionsResolved.blockCount.toString(16)}`;
    let rawFeeHistory;
    try {
        rawFeeHistory = await provider.request({
            method: 'eth_feeHistory',
            params: [historicalBlocks, optionsResolved.newestBlock, optionsResolved.rewardPercentiles],
        });
    }
    catch (err) {
        const message = 'details' in err && err.details ? err.details : err.message;
        if (message &&
            (message.indexOf('unknown method eth_feeHistory') != -1 ||
                message.indexOf('The method "eth_feeHistory" does not exist') != -1)) {
            logger.warn(`eth_feeHistory not implemeted by node, falling back on "eth_gasPrice"`);
            const gasPrice = await provider.request({ method: 'eth_gasPrice' });
            const result = [];
            for (let i = 0; i < optionsResolved.rewardPercentiles.length; i++) {
                result.push({
                    maxFeePerGas: BigInt(gasPrice),
                    maxPriorityFeePerGas: BigInt(gasPrice),
                });
            }
            return result;
        }
        else {
            throw err;
        }
    }
    let blockNum = Number(rawFeeHistory.oldestBlock);
    const lastBlock = blockNum + rawFeeHistory.reward.length;
    let index = 0;
    const blocksHistory = [];
    while (blockNum < lastBlock) {
        blocksHistory.push({
            number: blockNum,
            baseFeePerGas: BigInt(rawFeeHistory.baseFeePerGas[index]),
            gasUsedRatio: Number(rawFeeHistory.gasUsedRatio[index]),
            priorityFeePerGas: rawFeeHistory.reward[index].map((x) => BigInt(x)),
        });
        blockNum += 1;
        index += 1;
    }
    const percentilePriorityFeeAverages = [];
    for (let i = 0; i < optionsResolved.rewardPercentiles.length; i++) {
        percentilePriorityFeeAverages.push(avg(blocksHistory.map((b) => b.priorityFeePerGas[i])));
    }
    const baseFeePerGas = BigInt(rawFeeHistory.baseFeePerGas[rawFeeHistory.baseFeePerGas.length - 1]);
    const result = [];
    for (let i = 0; i < optionsResolved.rewardPercentiles.length; i++) {
        result.push({
            maxFeePerGas: percentilePriorityFeeAverages[i] + baseFeePerGas,
            maxPriorityFeePerGas: percentilePriorityFeeAverages[i],
        });
    }
    return result;
}
export async function getRoughGasPriceEstimate(provider, options) {
    const defaultOptions = {
        blockCount: 20,
        newestBlock: 'pending',
        rewardPercentiles: [10, 50, 80],
    };
    const optionsResolved = options ? { ...defaultOptions, ...options } : defaultOptions;
    if (optionsResolved.rewardPercentiles.length !== 3) {
        throw new Error(`rough gas estimate require 3 percentile, it defaults to [10,50,80]`);
    }
    const result = await getGasPriceEstimate(provider, optionsResolved);
    return {
        slow: result[0],
        average: result[1],
        fast: result[2],
    };
}
// ----------------------------------------------------------------------------
// FROM VIEM: https://viem.sh
// ----------------------------------------------------------------------------
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
export function formatUnits(value, decimals) {
    let display = value.toString();
    const negative = display.startsWith('-');
    if (negative)
        display = display.slice(1);
    display = display.padStart(decimals, '0');
    let [integer, fraction] = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];
    fraction = fraction.replace(/(0+)$/, '');
    return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
}
export const etherUnits = {
    gwei: 9,
    wei: 18,
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
export function formatEther(wei, unit = 'wei') {
    return formatUnits(wei, etherUnits[unit]);
}
//# sourceMappingURL=eth.js.map