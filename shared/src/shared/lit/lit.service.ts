import { nagaDev, nagaTest } from "@lit-protocol/networks";
import { createLitClient } from "@lit-protocol/lit-client";
import { createAuthManager, storagePlugins } from "@lit-protocol/auth";
import type { Account, PrivateKeyAccount } from "viem/accounts";

type LitNetwork = "nagaDev" | "nagaTest";

export class LitService {

    private litClient: any;
    private network: string;

    constructor(network: string) {
        this.network = network;
    }

    async init(): Promise<any> {
        this.litClient = await createLitClient({
            network: this.network === "nagaTest" ? nagaTest : nagaDev,
        });

        return this.litClient;
    }

    async createAuthContext(signer: any, capabilityDelegation: any, domain: string): Promise<any> {

        if (!this.litClient) throw new Error("Lit client not initialized — call init() first");

        console.log("signer address", signer.address)

        const wrappedAccount = {
            address: signer.address,
            type: "local",
            signMessage: async ({ message }: { message: string }) =>
                await signer.signMessage({ message }),
        } as unknown as Account;

        const authManager = createAuthManager({
            storage: storagePlugins.localStorage({
                appName: "s3ntiment",
                networkName: this.network === "nagaTest" ? "naga-test" : "naga-dev",
            }),
        });

        console.log(capabilityDelegation)

        return await authManager.createEoaAuthContext({
            config: {
                account: wrappedAccount,
            },
            authConfig: {
                domain,
                statement: "I authorize S3ntiment to access encrypted survey data",
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
                resources: [
                  ["access-control-condition-decryption", "*"],
                ],
                capabilityAuthSigs: [capabilityDelegation],
            },
            litClient: this.litClient,
        });
    }

    async encrypt(toEncrypt: any, accs: any[]): Promise<any> {

        // console.log("b4 encryptin", this.litClient.networkName, accs)

        return await this.litClient.encrypt({
            dataToEncrypt: toEncrypt,
            unifiedAccessControlConditions: accs,
            chain: "ethereum",
        });
    }

    async decrypt(encryptedData: any, authContext: any, accs: any[]): Promise<any> {

        // console.log("b4 decryptin", this.litClient.networkName, accs)

        return await this.litClient.decrypt({
            data: encryptedData,
            unifiedAccessControlConditions: accs,
            authContext,
            chain: "ethereum",
            userMaxPrice: 1000000000000000000n,
        });
    }
}