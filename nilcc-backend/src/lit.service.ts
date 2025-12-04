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

    accs(surveyId: string) {

        const rawCondition = {
            conditionType: 'evmBasic' as const,
            contractAddress: SURVEYSTORE,
            standardContractType:  '' as const,
            chain: 'base' as const,
            method: 'isOwner',
            parameters: [':userAddress', surveyId],
            returnValueTest: {
                comparator: '=' as const,
                value: 'true',
            },
            functionAbi: {
                name: 'isOwner',
                inputs: [
                    { name: 'authSigAddress', type: 'address' },
                    { name: 'surveyId', type: 'string' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                stateMutability: 'view',
                type: 'function'
            },
        };

        return createAccBuilder()
        .unifiedAccs(rawCondition)
        .build();


    }

    async encrypt(nilKey:string, surveyName: string) {
        

        return await this.client.encrypt({
            dataToEncrypt: nilKey,
            unifiedAccessControlConditions: this.accs(surveyName),
            chain: "ethereum",
        });

    }


    async decrypt (surveyId: string, encryptedNilKey: string, sessionSig: string) {

        return await this.client.decrypt({
            data: encryptedNilKey,
            unifiedAccessControlConditions: this.accs(surveyId),
            authContext: sessionSig,
            chain: "ethereum",
        });
    }

    

}






