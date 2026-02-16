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

    async encrypt(nilKey:string, accs: any[]) {
        
        return await this.client.encrypt({
            dataToEncrypt: nilKey,
            evmContractConditions: accs,
            chain: "base",
        });
    }


    async decrypt (encryptedNilKey: string, authContext: string, accs: any[] ) {

        return await this.client.decrypt({
            data: encryptedNilKey,
            evmContractConditions: accs,
            authContext,
            chain: "ethereum",
        });
    }
}






