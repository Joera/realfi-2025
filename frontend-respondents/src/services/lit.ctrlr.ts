import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { privateKeyToAccount } from 'viem/accounts';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createAuthManager, storagePlugins } from "@lit-protocol/auth";

const pkpInfo = {
    ethAddress:  "0x9924a83B7F50d90d84168AAA35Bc026412727ce1",
    pubkey: "0x04ca59c3465e1eb8d6787fdca6d9016ffec8d44333fce8f4d17f6ab46561d489cdeaa0ef85445883d04de265c4bc4605ed0361d62087b8bc4658f2269501f802d0",
    tokenId:  "75713901035138599600471962197329332899902656329793128226708056407031104421993"
}


export default class LITCtrlr {

    litClient: any;
    account: any;

    constructor() {}

    async init(private_key: string) {

        this.litClient = await createLitClient({
            network: nagaTest,
        });

        this.account = privateKeyToAccount(
            private_key as `0x${string}`
        );

        return this.account.address;

    }


    async createSessionSignatures() {

        if (this.account == undefined) throw 'lit client not ready';
        
        const authData = await ViemAccountAuthenticator.authenticate(this.account);
    

        const authManager = createAuthManager({
            storage: storagePlugins.localStorage({
                appName: "s3ntiment",
                networkName: "naga-test",
            }),
        });

        const authContext = await authManager.createPkpAuthContext({
            authData: authData, 
            pkpPublicKey: pkpInfo.pubkey,
            authConfig: {
                resources: [
                ["pkp-signing", "*"],
                ["lit-action-execution", "*"],
                ],
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                statement: "",
                domain: window.location.origin,
            },
            litClient: this.litClient,
        });

        return {
            
            sessionSig: authData,
            signerAddress: this.account.address
        }
    }

    async decrypt (encryptedData: string, sessionSig: string, accs: any[] ) {

        return await this.litClient.decrypt({
            data: encryptedData,
            evmContractConditions: accs,
            authContext: sessionSig,
            chain: "ethereum",
        });
    }


}
