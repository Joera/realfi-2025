import { nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { privateKeyToAccount } from 'viem/accounts';
import { createAuthManager, storagePlugins } from "@lit-protocol/auth";


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

        console.log(this.account);

        return this.account.address;
    }

    getAddress() {

        return this.account.address;
    }


    async createAuthContext() {
        if (!this.account) throw 'lit client not ready';

        const authManager = createAuthManager({
            storage: storagePlugins.localStorage({
                appName: "s3ntiment",
                networkName: "naga-test",
            }),
        });

        return await authManager.createEoaAuthContext({
            litClient: this.litClient,
            config: {
                account: this.account, // ← The Viem account goes here
            },
            authConfig: {
                resources: [
                    ["lit-action-execution", "*"],
                ],
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                domain: window.location.origin,
                statement: "", // Optional but good to include
            },
        });
    }
}
