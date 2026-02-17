import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { Account, privateKeyToAccount } from 'viem/accounts';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createAuthManager, storagePlugins } from "@lit-protocol/auth";
import { alwaysTrue } from "../accs";

const pkpInfo = {
    ethAddress:  "0x9924a83B7F50d90d84168AAA35Bc026412727ce1",
    pubkey: "0x04ca59c3465e1eb8d6787fdca6d9016ffec8d44333fce8f4d17f6ab46561d489cdeaa0ef85445883d04de265c4bc4605ed0361d62087b8bc4658f2269501f802d0",
    tokenId:  "75713901035138599600471962197329332899902656329793128226708056407031104421993"
}


export default class LitService {

    litClient: any;
    account: any;

    constructor() {}

    async init() {

        this.litClient = await createLitClient({
            network: nagaTest, // nagaDev, // 
        });
    }


    async createAuthContext(waapWalletClient: any, viemAccount: any) {

        if (this.litClient == undefined) throw 'lit client not ready';

        const wrappedAccount = {
            address: waapWalletClient.account.address,
            type: 'local', // Trick it into thinking it's a local account
            signMessage: async ({ message }: { message: string }) => {
                // Use the WalletClient's signMessage which goes through WaaP
                return await waapWalletClient.signMessage({
                    account: waapWalletClient.account!,
                    message,
                });
            },
        } as unknown as Account;
        

        const authManager = createAuthManager({
            storage: storagePlugins.localStorage({
                appName: "s3ntiment",
                networkName: "naga-dev",
            }),
        });

        // Use createEoaAuthContext instead of createPkpAuthContext
        return await authManager.createEoaAuthContext({
            config: {
                account: wrappedAccount,
            },
            authConfig: {
                domain: window.location.host,
                statement: "I authorize S3ntiment to access encrypted survey data",
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                resources: [
                    ["access-control-condition-decryption", "*"]
                ],
            },
            litClient: this.litClient,
        });
    }

     async encrypt(toEncrypt: any, accs: any[]) {

        return await this.litClient.encrypt({
            dataToEncrypt: toEncrypt,
            unifiedAccessControlConditions: accs,
            chain: "ethereum",
        });
    }


    async decrypt (encryptedData: any, authContext: any, accs: any[] ) {


        return await this.litClient.decrypt({
            // ciphertext: encryptedData.ciphertext,
            // dataToEncryptHash: encryptedData.dataToEncryptHash,
            data: encryptedData,
            unifiedAccessControlConditions: accs,
            authContext,
            chain: "ethereum",
        });
    }

    async test(authContext: any) {

            const accs = alwaysTrue; // canRead(contentId, safeAddress, publicationModule) // 

            const encryptedData = await this.litClient.encrypt({
            dataToEncrypt: "Hello, my love! ❤️",
            // @ts-ignore
            unifiedAccessControlConditions: accs,
            chain: "ethereum",
            });

            const decryptedResponse = await this.litClient.decrypt({
            data: encryptedData,
            // @ts-ignore
            unifiedAccessControlConditions: accs,
            authContext: authContext,
            chain: "ethereum",
            });

            console.log(decryptedResponse);

    }

    getAddress() {

        return this.account.address
    }


}
