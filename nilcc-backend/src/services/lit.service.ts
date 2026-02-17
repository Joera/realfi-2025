import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { createAccBuilder } from "@lit-protocol/access-control-conditions";

export class LitService {

    client: any; 

    constructor () {

    }

    async init () {

        this.client = await createLitClient({
            network: nagaDev, // nagaDev,
        });

    }

    async encrypt(toEncrypt: any, accs: any[]) {

        console.log(JSON.stringify(accs, null, 2));

        console.log("typeof toEncrypt:", typeof toEncrypt);
        console.log("toEncrypt:", toEncrypt);

        return await this.client.encrypt({
            dataToEncrypt: toEncrypt,
            unifiedAccessControlConditions: accs,
            chain: "ethereum",
        });
    }


    async decrypt (encryptedData: any, authContext: string, accs: any[] ) {

        return await this.client.decrypt({
            data: encryptedData,
            unifiedAccessControlConditions: accs,
            authContext,
            chain: "ethereum",
        });
    }
}






