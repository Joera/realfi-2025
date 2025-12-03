import { nagaDev } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { createAccBuilder } from "@lit-protocol/access-control-conditions";


const SURVEYSTORE = "xx"

export class LitService {

    client: any; 

    constructor () {

    }

    async init () {

        this.client = await createLitClient({
            network: nagaDev,
        });

    }

    async encrypt(nilKey:string, surveyName: string) {
        
        const rawCondition = {
            conditionType: 'evmBasic' as const,
            contractAddress: SURVEYSTORE,
            standardContractType:  '' as const,
            chain: 'base' as const,
            method: 'isOwner',
            parameters: [':userAddress', surveyName],
            returnValueTest: {
                comparator: '=' as const,
                value: 'true',
            },
            functionAbi: {
                name: 'isOwner',
                inputs: [
                    { name: 'authSigAddress', type: 'address' },
                    { name: 'surveyName', type: 'string' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                stateMutability: 'view',
                type: 'function'
            },
        };

        const conditions = createAccBuilder()
        .unifiedAccs(rawCondition)
        .build();


        return await this.client.encrypt({
            dataToEncrypt: nilKey,
            unifiedAccessControlConditions: conditions,
            chain: "ethereum",
        });

    }


    async decrypt (cyphertext: string, encryptedKey: string, sessionSig: string) {

            // get encrypted Data 
    }

    

}






