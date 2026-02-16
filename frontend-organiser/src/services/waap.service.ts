import { AuthenticationMethod, initWaaP } from "@human.tech/waap-sdk";
import type { SilkEthereumProviderInterface } from '@human.tech/waap-sdk';

import { createPublicClient, createWalletClient, custom, http, parseAbi } from "viem";
import type { WalletClient, Hash, TransactionReceipt} from 'viem';
import { base } from 'viem/chains';

declare global {
    interface Window {
        waap: SilkEthereumProviderInterface;
    }
}

interface LoginResult {
    walletClient: WalletClient;
    address: `0x${string}`;
}


interface TxOptions {
    deploy?: boolean;
    waitForReceipt?: boolean;
    confirmations?: number;
}

interface TxResult {
    txHash: Hash;
    receipt?: TransactionReceipt;
    deployedAddress?: `0x${string}`;
}


interface InternalTransaction {
  contractAddress: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  type: string;
  traceId: string;
}

const initConfig = {
    config: {
        allowedSocials: [],
        authenticationMethods: ['email', 'phone'] as AuthenticationMethod[],
        styles: { darkMode: false },
    },
    project: {
        name: 'S3ntiment',
        logo: ''
    },
    useStaging: false,
    walletConnectProjectId: "", 
    referralCode: "", 
}


export class WaapService { 

    public walletClient: WalletClient | null = null;
    public publicClient: any | null = null;
    public address: `0x${string}` | null = null;

    constructor() {

        this.initWaap(); 
        this.initPublicClient();
    }

    async initWaap() { 
        
        await initWaaP(initConfig);
        await this.createWallet()
    }

    initPublicClient() {
        this.publicClient = createPublicClient({
            chain: base,
            transport: http()
        });
    }

    async createWallet() {

        const accounts:any = await window.waap.request({ method: 'eth_requestAccounts' }); 
        if (accounts[0]) {
            this.address = accounts[0];  
            console.log("address set")       
            this.walletClient = createWalletClient({
                account: this.address as `0x${string}`,
                chain: base, 
                transport: custom(window.waap)
            });
        }

        return this.walletClient 
    
    }

    async login() : Promise<LoginResult> {

        try {
          
            const loginType = await window.waap.login();
            await this.createWallet();
           
            if (!this.address) {
                throw new Error('Failed to get wallet address');
            }

            if (!this.walletClient) {
                throw new Error('Failed to create wallet client');
            }
            
            return { 
                walletClient: this.walletClient, 
                address: this.address 
            };
 
        } catch (error) {
            console.error(error)
            throw error
        }

    }

    getWalletClient() {
        return this.walletClient;
    }

    getAddress() {
        return this.address as `0x${string}` | null;
    }

    async signMessage(message: string) {
        if (!this.walletClient || !this.address) {
            throw new Error('Not logged in');
        }
        
        return await this.walletClient.signMessage({
            account: this.address as `0x${string}`,
            message 
        });
    }

    async signatureToHex(signature: string) { 

        const encoder = new TextEncoder();
        const sigBytes = encoder.encode(signature);
        const seedHash = await crypto.subtle.digest('SHA-256', sigBytes);
        const seedHex = Array.from(new Uint8Array(seedHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

        return seedHex;
    }

       

    async writeContract(
        contractAddress: `0x${string}`, 
        abi: any, 
        functionName: string, 
        args: any[], 
        options: TxOptions = {}
    ): Promise<TxResult> {
        if (!this.walletClient || !this.address) {
            throw new Error('Not logged in');
        }

        if (!this.publicClient) {
            throw new Error('Public client not initialized');
        }

        const { deploy = false, waitForReceipt = false, confirmations = 1 } = options;

        const txHash = await this.walletClient.writeContract({
            address: contractAddress,
            chain: base,
            abi,
            functionName,
            args: args,
            account: this.address,
        });

        console.log(txHash)

        const result: TxResult = { txHash };

        // If we need to wait for receipt or handle deployment
        if (waitForReceipt || deploy) {
            try {
                const receipt = await this.publicClient.waitForTransactionReceipt({ 
                    hash: txHash,
                    confirmations
                });
                
                result.receipt = receipt;

                // For deployment transactions, extract the deployed contract address
                if (deploy && receipt.contractAddress) {
                    result.deployedAddress = receipt.contractAddress;
                }
            } catch (error) {
                console.error("Error waiting for receipt:", error);
                // Still return the txHash even if receipt fails
            }
        }

        return result;
    }

    async readContract<T = any>(
        contractAddress: `0x${string}`, 
        abi: any, 
        functionName: string, 
        args: any[] = []
    ): Promise<T> {
        if (!this.publicClient) {
            throw new Error('Public client not initialized');
        }

        try {
            const result = await this.publicClient.readContract({
                address: contractAddress,
                abi,
                functionName,
                args,
            });

            return result as T;
        } catch (error) {
            console.error('Error reading contract:', error);
            throw error;
        }
    }
}


