import { createPublicClient, createWalletClient, http } from "viem";
import { getChainId, getRPCUrl, getViemChainById } from "./chains.factory";
import { privateKeyToAccount } from "viem/accounts";
import { SURVEY_STORE_ABI } from "../survey.abi";

export class ViemService {

    account: any;
    chainId : number;
    walletClient: any;
    publicClient: any;

    constructor(chain: string) { // use viem naming :  mainnet, sepolia, base 
    
        this.chainId = getChainId(chain);

        this.account = privateKeyToAccount(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY as `0x${string}`);

        this.walletClient = createWalletClient({
            account: this.account,
            chain: getViemChainById(this.chainId),
            transport: http(getRPCUrl(this.chainId))
        });

        this.publicClient = createPublicClient({
            chain: getViemChainById(this.chainId),
            transport: http(getRPCUrl(this.chainId))
        });

    }

    getAddress() {

        return this.account.address;

    }

    async signMessage(
        messageHash: string
    ) {
        return await this.walletClient.signMessage({
            message: { raw: messageHash }
        })
    }

    async writeContract(
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

    async readSurveyContract(functionName: any, args: any[])  {
    
        return await this.publicClient.readContract({
            address: import.meta.env.VITE_SURVEYSTORE_CONTRACT,
            abi: SURVEY_STORE_ABI,
            functionName,
            args
        });
    }

}