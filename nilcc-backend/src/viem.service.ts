import { createPublicClient, http, type PublicClient } from "viem";
import { base } from "viem/chains";
import { SURVEY_STORE_ABI } from "./survey.abi";

const SURVEY_STORE_ADDRESS = '0x4CAfD69E3D7a9c37beCbFaF3D3D5C542F7b5fF6c'; 

export class ViemService {

    publicClient: PublicClient;
    rpcUrl: string

    constructor() {

        this.rpcUrl =  `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;

        this.publicClient = createPublicClient({
            chain: base,
            transport: http(this.rpcUrl)
        }) as PublicClient;
    }

    async readContract(functionName: any, surveyId: string)  {

           return await this.publicClient.readContract({
            address: SURVEY_STORE_ADDRESS,
            abi: SURVEY_STORE_ABI,
            functionName,
            args: [surveyId]
        });


    }


     

}