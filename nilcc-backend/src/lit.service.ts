import { nagaDev } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { createAccBuilder } from "@lit-protocol/access-control-conditions";


const SURVEYSTORE = "0x6Ab10D4705041408b2ED049F12cc0606B735dF0e"

export class LitService {

    client: any; 

    constructor () {

    }

    async init () {

        this.client = await createLitClient({
            network: nagaDev,
        });

    }

    accs(surveySlug: string) {

        const rawCondition: any = {
            chain: "base",
            contractAddress: SURVEYSTORE,
            functionName: "isOwner",

            functionParams: [":userAddress", surveySlug],

            functionAbi: {
            name: "isOwner",
            inputs: [
                { name: "authSigAddress", type: "address" },
                { name: "surveyId", type: "string" }
            ],
            outputs: [
                { name: "", type: "bool" }
            ],
            stateMutability: "view",
            type: "function"
            },

            returnValueTest: {
                key: "",
                comparator: "=",
                value: "true"
            }
        };

    // return createAccBuilder()
    //     .unifiedAccs(rawCondition)
    //     .build();

    console.log(rawCondition)


    return [rawCondition]
}


    async encrypt(nilKey:string, surveyName: string) {
        
        return await this.client.encrypt({
            dataToEncrypt: nilKey,
            evmContractConditions: this.accs(surveyName),
            chain: "ethereum",
        });

    }


    async decrypt (surveyId: string, encryptedNilKey: string, sessionSig: string) {

        return await this.client.decrypt({
            data: encryptedNilKey,
            evmContractConditions: this.accs(surveyId),
            authContext: sessionSig,
            chain: "ethereum",
        });
    }

    

}






