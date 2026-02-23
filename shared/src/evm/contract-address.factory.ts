import { getScanApi } from "./chains.factory";

interface InternalTransaction {
    contractAddress: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasUsed: string;
    input: string;
    output: string;
    type: string;
    traceId: string;
}

const getInternalTransactions = async (
    chainId: number,
    txHash: string,
    apiKey: string
): Promise<InternalTransaction[]> => {
    const baseUrl = getScanApi(chainId);
    const url = `${baseUrl}&module=account&action=txlistinternal&txhash=${txHash}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.result || [];
    } catch {
        return [];
    }
};

/**
 * Extracts a deployed contract address from a transaction's internal txs.
 * 
 * @param txHash        - transaction hash to inspect
 * @param chainId       - chain to query
 * @param apiKey        - etherscan API key
 * @param excludeAddress - optional address to skip (e.g. the Safe itself when
 *                         it was deployed in the same tx as a module)
 * @param nth           - if multiple deployments remain after filtering, return
 *                        this index (0-based). Defaults to 0 (first match).
 */
export const extractDeployedAddress = async (
    txHash: string,
    chainId: number,
    apiKey: string,
    excludeAddress?: string,
    nth = 0,
    maxAttempts = 16,
    pollInterval = 3000,
): Promise<string> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const txs = await getInternalTransactions(chainId, txHash, apiKey);

        let deployed = txs.filter(tx => tx.contractAddress && tx.contractAddress !== "");

        if (excludeAddress) {
            const lower = excludeAddress.toLowerCase();
            deployed = deployed.filter(tx => tx.contractAddress.toLowerCase() !== lower);
        }

        if (deployed.length > nth) {
            return deployed[nth].contractAddress;
        }

        await new Promise(r => setTimeout(r, pollInterval));
        attempts++;
    }

    throw new Error(`extractDeployedAddress: no contract found in tx ${txHash} after ${maxAttempts} attempts`);
};