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

        console.log(this.chainId);
        console.log("rpc", getRPCUrl(this.chainId))

        console.log(this.chainId)
        console.log( getViemChainById(this.chainId))

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

    async signMessage(
        messageHash: string
    ) {
        return await this.walletClient.signMessage({
            message: { raw: messageHash }
        })
    }

    async genericTx(
        address: string,
        abi: any,
        functionName: string,
        args: any[]
        ) {


        // lijkt weer dat geval met te hoge tx kosten want denkt aan mainnet ipv base 


        const hash = await this.walletClient.writeContract({
            address,
            abi,
            functionName,
            args
        });

        // console.log('Tx hash:', hash);

        const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        // console.log('Tx confirmed in block:', receipt.blockNumber);

        return receipt;
    }


}