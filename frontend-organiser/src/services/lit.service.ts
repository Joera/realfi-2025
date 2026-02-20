import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { Account, privateKeyToAccount } from 'viem/accounts';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createAuthManager, storagePlugins } from "@lit-protocol/auth";
import { alwaysTrue } from "../accs";


export default class LitService {

    litClient: any;
    account: any;

    constructor() {}

    async init() {

        console.log("LIT network", import.meta.env.VITE_LIT_NETWORK)

        this.litClient = await createLitClient({
            network: import.meta.env.VITE_LIT_NETWORK == 'nagaTest' ? nagaTest : nagaDev,
        });
    }


    async createAuthContext(waapWalletClient: any) {

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
                networkName: import.meta.env.VITE_LIT_NETWORK == 'nagaDev' ? "naga-dev" : "naga-test",
            }),
        });

        // in LS .. + endpoint maken dat iets checkt 
        const cap = { sig: '0xa6d114499cbd82aa77eedf93658d82290e497c87990081c2b84ed674c88ba7a7778750306b6608079ba2a48c7cf3cdfbee54f33c202940d3b1015ae5e853d8de1b',
            derivedVia: 'web3.eth.personal.sign',
            signedMessage: 'localhost wants you to sign in with your Ethereum account:\n' +
                '0x934E20411C9E8E92946BD8786D7c3E5bC4DB1387\n' +
                '\n' +
                "This is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-paymentdelegation://*'.\n" +
                '\n' +
                'URI: lit:capability:delegation\n' +
                'Version: 1\n' +
                'Chain ID: 1\n' +
                'Nonce: 0x145ff71fdb55e9577345f51185cf150a8e355acaf444fc193bb2450b7d3be1a1\n' +
                'Issued At: 2026-02-19T13:50:42.823Z\n' +
                'Expiration Time: 2026-02-20T13:50:42.283Z\n' +
                'Resources:\n' +
                '- urn:recap:eyJhdHQiOnsibGl0LXBheW1lbnRkZWxlZ2F0aW9uOi8vKiI6eyJBdXRoL0F1dGgiOlt7ImRlbGVnYXRlX3RvIjpbIjYwOWUyODg5NzljNjhkMTQ4NmI2MDBmODJlYThlMjc4YjNlODgxNDgiXSwibWF4X3ByaWNlIjoiZGUwYjZiM2E3NjQwMDAwIiwic2NvcGVzIjpbImVuY3J5cHRpb25fc2lnbiIsInNpZ25fc2Vzc2lvbl9rZXkiLCJsaXRfYWN0aW9uIl19XX19LCJwcmYiOltdfQ',
            address: '0x934E20411C9E8E92946BD8786D7c3E5bC4DB1387'
            }

        return await authManager.createEoaAuthContext({
            config: {
                account: wrappedAccount,
            },
            authConfig: {
                domain: window.location.host,
                statement: "I authorize S3ntiment to access encrypted survey data",
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                resources: [
                    ["access-control-condition-decryption", "*"],
                ],
                capabilityAuthSigs: [cap]
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
            data: encryptedData,
            unifiedAccessControlConditions: accs,
            authContext,
            chain: "ethereum",
            userMaxPrice: 1000000000000000000n,
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
