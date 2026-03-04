import { toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, encodeFunctionData, http, parseEther, Transport } from "viem";
import type { Chain, Signature } from "viem";

import { getRPCUrl, TxOptions, TxResult } from "@s3ntiment/shared";
import { extractDeployedAddress } from "@s3ntiment/shared";

export interface IPermissionlessSimpleService {
    getSmartAccountClient: () => SmartAccountClient;
    updateSigner: (signer: any) => Promise<string>;
    connectToAccount: () => Promise<void>;
    write: (address: string, abi: any, method: string, args: any[], options?: TxOptions) => Promise<TxResult>;
    writeRaw: (to: string, data: `0x${string}`, options?: TxOptions) => Promise<TxResult>;
    transfer: (to: string, amount: string) => Promise<string>;
}

export class PermissionlessSimpleService implements IPermissionlessSimpleService {

    private chain: Chain;
    private signer: any;
    private smartAccount: any;
    private smartAccountClient: any;
    private publicClient: any;
    private pimlicoClient: any;
    private pimlicoKey: string;
    private entrypointV7: `0x${string}`;

    constructor(chain: Chain, pimlicoKey: string, alchemyKey: string, entrypointV7: string) {

        this.chain = chain;
        this.pimlicoKey = pimlicoKey;
        this.entrypointV7 = entrypointV7 as `0x${string}`;

        this.publicClient = createPublicClient({
            chain,
            transport: http(getRPCUrl(chain.id, alchemyKey)),
        });

        this.pimlicoClient = createPimlicoClient({
            transport: http(`https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${pimlicoKey}`) as Transport,
            entryPoint: {
                address: this.entrypointV7,
                version: "0.7",
            },
        });
    }

    getSmartAccountClient() {
        return this.smartAccountClient;
    }

    async updateSigner(waapWalletClient: any): Promise<string> {
        this.signer = waapWalletClient;
        await this.connectToAccount();
        return this.signer.address;
    }

    async connectToAccount(): Promise<void> {

        this.smartAccount = await toSimpleSmartAccount({
            client: this.publicClient,
            owner: this.signer,
            entryPoint: { address: this.entrypointV7, version: "0.7" },
        });

        this.smartAccountClient = createSmartAccountClient({
            account: this.smartAccount,
            chain: this.chain,
            bundlerTransport: http(`https://api.pimlico.io/v2/${this.chain.id}/rpc?apikey=${this.pimlicoKey}`),
            paymaster: this.pimlicoClient,
            userOperation: {
                estimateFeesPerGas: async () =>
                    (await this.pimlicoClient.getUserOperationGasPrice()).fast,
            },
        });

        console.log("account address", this.smartAccount.address)
    }

    getAddress(): `0x${string}` {
        return this.smartAccount.address;
    }

    async write(
        address: string,
        abi: any,
        method: string,
        args: any[],
        options: TxOptions = {}
    ): Promise<TxResult> {

        const { deploy = false, waitForReceipt = false, confirmations = 1, excludeAddress, nth } = options;

        const data = encodeFunctionData({ abi, functionName: method, args });
        const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

        const txHash = await this.smartAccountClient.sendTransaction({
            to: address as `0x${string}`,
            data,
            value: 0n,
            maxFeePerGas: gasPrice.fast.maxFeePerGas,
            maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        });

        const result: TxResult = { txHash };

        if (waitForReceipt || deploy) {
            result.receipt = await this.publicClient.waitForTransactionReceipt({
                hash: txHash as `0x${string}`,
                confirmations,
            });
        }

        if (deploy) {
            result.deployedAddress = await extractDeployedAddress(
                txHash,
                this.chain.id,
                excludeAddress || "",
                nth?.toString(),
            );
        }

        return result;
    }

    async signMessage (message: string) : Promise<Signature> {

        const signature = await this.signer.signMessage({
            message: typeof message === 'string' ? message : JSON.stringify(message),
        });

        return signature;
    }

    async writeRaw(to: string, data: `0x${string}`, options: TxOptions = {}): Promise<TxResult> {

        const { waitForReceipt = false, confirmations = 1 } = options;

        const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

        const txHash = await this.smartAccountClient.sendTransaction({
            to: to as `0x${string}`,
            data,
            value: 0n,
            maxFeePerGas: gasPrice.fast.maxFeePerGas,
            maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        });

        const result: TxResult = { txHash };

        if (waitForReceipt) {
            result.receipt = await this.publicClient.waitForTransactionReceipt({
                hash: txHash as `0x${string}`,
                confirmations,
            });
        }

        return result;
    }

    async transfer(to: string, amount: string): Promise<string> {

        const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

        const txHash = await this.smartAccountClient.sendTransaction({
            to: to as `0x${string}`,
            value: parseEther(amount),
            maxFeePerGas: gasPrice.fast.maxFeePerGas,
            maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        });

        return txHash;
    }
}