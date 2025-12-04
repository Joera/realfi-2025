import { createPublicClient, createWalletClient, http } from "viem";
import { getChainId, getRPCUrl, getViemChainById } from "./chains.factory";
import { privateKeyToAccount } from "viem/accounts";


export class ViemService {

    chainId : number;
    walletClient: any;
    publicClient: any;

    constructor(chain: string) { // use viem naming :  mainnet, sepolia, base 
    
        this.chainId = getChainId(chain);

        const account = privateKeyToAccount(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY as `0x${string}`);

        this.walletClient = createWalletClient({
            account,
            chain: getViemChainById(this.chainId),
            transport: http(getRPCUrl(this.chainId))
        });

        this.publicClient = createPublicClient({
            chain: getViemChainById(this.chainId),
            transport: http(getRPCUrl(this.chainId))
        });

    }

    async genericTx(
        address,
        abi,
        functionName,
        args
        ) {
        const hash = await this.walletClient.writeContract({
            address,
            abi,
            functionName,
            args
        });

        console.log('Tx hash:', hash);

        const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        console.log('Tx confirmed in block:', receipt.blockNumber);

        return receipt;
    }


}