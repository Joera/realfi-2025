import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";

export class LitService {

    client: any; 

    constructor () {

    }

    async init () {

        this.client = await createLitClient({
            network: nagaTest // nagaDev,
        });

    }

    async encrypt(toEncrypt: any, accs: any[]) {

        return await this.client.encrypt({
            dataToEncrypt: toEncrypt,
            evmContractConditions: accs,
            chain: "ethereum",
        });
    }


    async decrypt (encryptedData: any, authContext: string, accs: any[] ) {

        return await this.client.decrypt({
            data: encryptedData,
            evmContractConditions: accs,
            authContext,
            chain: "ethereum",
        });
    }
}






