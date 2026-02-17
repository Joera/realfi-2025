/// <reference types="vite/client" />

import { 
  toSafeSmartAccount,
} from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { concat, createClient, createPublicClient, encodeFunctionData, http, keccak256, pad, parseAbi, parseEther, toBytes, toHex } from "viem";
import { getChainId, getRPCUrl, getScanApi, getViemChainById } from "./chains.factory.ts";
import { getPackedUserOperation } from "permissionless";
import { encodeAbiParameters, parseAbiParameters } from "viem";

import { base } from "viem/chains";

const ENTRYPOINT_ADDRESS_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

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

type GenericTxCall  = {
    address: string;
    abi: string;
    method: string;
    args: any[];
};


export interface IPermissionlessSafeService {
  chainId: number;
  signer: any;
  smartAccount: any;
  smartAccountClient: any;
  provider: any;
  address: string;


  
  updateSigner: (pk: string) => Promise<string>;
  // getPredictedAddress: (owners: string[], salt: string) => Promise<string>;
  connectToFreshSafe: (salt: string) => Promise<string>
  connectToExistingSafe: (safe_address: string) => Promise<string>
  read: (address: string, abi: string, method: string, args: string[]) => Promise<any>;
  write: (address: string, abi: string, method: string, args: string[], deploy: boolean, wait?: boolean) => Promise<string>;
  writeWithWaapSigning: (address: string, abi: string, method: string, args: string[], deploy: boolean, wait?: boolean) => Promise<string>;
  batchWrite: (calls: Array<{ address: string; abi: string; method: string; args: any[]; }>) => Promise<string[]>;
  transfer: (to: string, amount: string) => Promise<string>;
  getSafeAddress: (owners: string[], salt: string) => Promise<string>;
  isDeployed: () => Promise<boolean>;
}

export class PermissionlessSafeService implements IPermissionlessSafeService {
  chainId: number;
  signer: any;
  smartAccount: any;
  smartAccountClient: any;
  provider: any;
  address!: string;

  private txMutex: Promise<void> = Promise.resolve();
  private publicClient: any;
  private pimlicoClient: any;
  private bundlerClient: any;

  constructor(chain: string) { // use viem naming :  mainnet, sepolia, base 

    this.chainId = getChainId(chain)

    this.publicClient = createPublicClient({
      chain: getViemChainById(this.chainId),
      transport: http(getRPCUrl(this.chainId))
    });

    this.pimlicoClient = createPimlicoClient({
      transport: http(`https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=${import.meta.env.VITE_PIMLICO_KEY}`),
      entryPoint: {
        address: ENTRYPOINT_ADDRESS_V07,
        version: "0.7",
      },
    });

    this.bundlerClient = createClient({
      chain: getViemChainById(this.chainId),
      transport: http(`https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=${import.meta.env.VITE_PIMLICO_KEY}`),
    });

  }

  // async updateSigner(waapWalletClient: any) {
  //   this.signer = waapWalletClient
  //   return this.signer.address;
  // }

  async updateSigner(waapWalletClient: any) {
      const address = waapWalletClient.account.address;
      
      // Create a fake "local" account that delegates to walletClient
      this.signer = {
          address,
          type: 'local',
          source: 'custom',
          
          signMessage: async ({ message }: { message: string | { raw: Uint8Array } }) => {
              const msg = typeof message === 'string' ? message : message.raw;
              return await waapWalletClient.signMessage({
                  account: address,
                  message: msg,
              });
          },
          
          signTypedData: async (typedData: any) => {
              return await waapWalletClient.signTypedData({
                  account: address,
                  domain: typedData.domain,
                  types: typedData.types,
                  primaryType: typedData.primaryType,
                  message: typedData.message,
              });
          },
          
          signTransaction: async (tx: any) => {
              return await waapWalletClient.signTransaction({
                  account: address,
                  ...tx,
              });
          },
      };
      
      return address;
  }
  
  async isDeployed(address?: string): Promise<boolean> {
    try {
        // Use provided address or default to current smart account address
        const checkAddress = address || this.address;
        
        if (!checkAddress) {
            console.log("No address to check");
            return false;
        }
        
        console.log("Checking if Safe is deployed:", checkAddress);
        
        // Get the bytecode at the address
        const code = await this.publicClient.getBytecode({ 
            address: checkAddress as `0x${string}`
        });
        
        // If there's no code or just '0x', the contract is not deployed
        const deployed = code !== undefined && code !== '0x' && code.length > 2;
        
        console.log("Safe deployment status:", deployed);
        return deployed;
        
    } catch (error: any) {
        console.error("Error checking deployment status:", error.message);
        return false;
    }
  }

  async connectToFreshSafe(salt: string) {

      const smartAccount = await toSafeSmartAccount({
        client: this.publicClient,
        owners: [this.signer],
        threshold: 1n,
        version: "1.4.1",
        saltNonce: BigInt(keccak256(toBytes(salt))),
        safeSingletonAddress: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762", // SafeL2 v1.4.1 on Base
        safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67"
      });

    return await this.setSafe(smartAccount);
  }

  async connectToExistingSafe(safe_address: string) {

    const smartAccount = await toSafeSmartAccount({
      client: this.publicClient,
      owners: [this.signer], 
      threshold: 1n,
      version: "1.4.1",
      address: safe_address as `0x${string}` ,
      safeSingletonAddress: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762", // SafeL2 v1.4.1 on Base
      // safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67"
    });

    return await this.setSafe(smartAccount);

  }

  async setSafe(smartAccount: any): Promise<string> {

    this.smartAccount = smartAccount
  
    this.smartAccountClient = await createSmartAccountClient({
      account: smartAccount,
      chain: getViemChainById(this.chainId),
      bundlerTransport: http(`https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=${import.meta.env.VITE_PIMLICO_KEY}`),
      paymaster: this.pimlicoClient,
      
    });

    this.address = smartAccount.address;
    return this.address;
  }

  async getSafeAddress(owner_keys: string[], salt: string): Promise<string> {

    const tempAccount = await toSafeSmartAccount({
      client: this.publicClient,
      owners: [this.signer],
      threshold: 1n,
      version: "1.4.1",
      saltNonce: BigInt(keccak256(toBytes(salt))),
    });
        
    return tempAccount.address;
  }


  async read(address: string, abi: string, method: string, args: string[]): Promise<any> {
    let retries = 1;
    while (retries > 0) {
        try {
            // console.log("🔍 Reading:", method, "from", address, "with args:", args);
            
            const result = await this.publicClient.readContract({
                address: this.ensureHex(address),
                abi: JSON.parse(abi),
                functionName: method,
                args: args,
            });
            
            // console.log("📖 Read result:", result);
            return result;
        } catch (error: any) {
            retries--;
            // console.log(`❌ RPC read failed:`, error.message || error);
            if (retries === 0) throw error;
            // console.log(`Retrying... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
  }

  async write(address: string, abi: string, method: string, args: string[], deploy: boolean, wait = false ): Promise<string> {


      console.log("🔧 genericTx called:", { address, method, args: JSON.stringify(args) });

      const data = encodeFunctionData({
          abi: JSON.parse(abi),
          functionName: method,
          args: args,
      });

      console.log("📝 Encoded data:", data);

      const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

      console.log("📤 About to call sendTransaction...");
      
      const txHash = await this.smartAccountClient.sendTransaction({
          to: address as `0x${string}`,
          data,
          value: 0n,
          maxFeePerGas: gasPrice.fast.maxFeePerGas,     
          maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      });

      console.log("✅ sendTransaction returned txHash:", txHash, "for method:", method);
      
      
      if (wait) {
          // Wait for the actual transaction receipt (not user operation)

          await  this.publicClient.waitForTransactionReceipt({ 
              hash: txHash as `0x${string}`,
              confirmations: 1 
          });
          console.log("Transaction confirmed:", txHash);
      }

      if (!deploy) {
        // For non-deployment transactions, just return the tx hash
        return txHash;
      }

      // For deployment transactions, extract the deployed contract address
      return await this.extractDeployedAddress(txHash);
    }

async writeWithWaapSigning(address: string, abi: string, method: string, args: any[]) {
    console.log("🚀 [1] writeWithWaapSigning called:", { address, method, args });

    const data = encodeFunctionData({
        abi: JSON.parse(abi),
        functionName: method,
        args,
    });
    console.log("📝 [2] Encoded calldata:", data.slice(0, 66) + "...");

    // 1. Get gas prices first
    console.log("⛽ [3] Fetching gas prices from Pimlico...");
    const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();
    console.log("⛽ [4] Gas prices:", {
        maxFeePerGas: gasPrice.fast.maxFeePerGas.toString(),
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas.toString(),
    });

    // 2. Build the UserOp with gas prices
    console.log("🔧 [5] Preparing UserOperation...");
    const userOp = await this.smartAccountClient.prepareUserOperation({
        calls: [{
            to: address as `0x${string}`,
            data,
            value: 0n,
        }],
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
    });
    console.log("📦 [6] UserOp prepared:", {
        sender: userOp.sender,
        nonce: userOp.nonce?.toString(),
        callGasLimit: userOp.callGasLimit?.toString(),
        verificationGasLimit: userOp.verificationGasLimit?.toString(),
        preVerificationGas: userOp.preVerificationGas?.toString(),
        hasFactory: !!userOp.factory,
        hasPaymaster: !!userOp.paymaster,
    });

    // 3. Get the hash to sign
    console.log("🔑 [7] Getting UserOp hash...");
    const packedUserOp = getPackedUserOperation(userOp);

    const userOpPacked = keccak256(
        encodeAbiParameters(
            parseAbiParameters('address, uint256, bytes32, bytes32, bytes32, uint256, bytes32, bytes32'),
            [
                packedUserOp.sender,
                packedUserOp.nonce,
                keccak256(packedUserOp.initCode),
                keccak256(packedUserOp.callData),
                packedUserOp.accountGasLimits,
                packedUserOp.preVerificationGas,
                packedUserOp.gasFees,
                keccak256(packedUserOp.paymasterAndData),
            ]
        )
    );

    const userOpHash = keccak256(
        encodeAbiParameters(
            parseAbiParameters('bytes32, address, uint256'),
            [userOpPacked, ENTRYPOINT_ADDRESS_V07 as `0x${string}`, BigInt(this.chainId)]
        )
    );
    console.log("🔑 [8] UserOp hash:", userOpHash);

    // 4. Sign with WaaP
    console.log("✍️ [9] Requesting signature from WaaP...");
    const rawSignature = await this.signer.signMessage({
        message: { raw: userOpHash },
    });
    console.log("✍️ [10] Raw signature received:", rawSignature);

    // 5. Format signature for Safe 4337 - just adjust v for eth_sign
    let v = parseInt(rawSignature.slice(130, 132), 16);
    if (v === 27 || v === 28) {
        v += 4; // eth_sign indicator for Safe
    }
    const safeSignature = rawSignature.slice(0, 130) + v.toString(16).padStart(2, '0');
    console.log("✍️ [10b] Safe signature:", safeSignature.slice(0, 40) + "...");

    // 6. Add signature to UserOp
    userOp.signature = safeSignature as `0x${string}`;
    console.log("📦 [11] Signature added to UserOp");

    // 7. Send directly to Pimlico bundler
    console.log("📤 [12] Sending UserOp to Pimlico bundler...");

    const bundlerClient = createClient({
        chain: getViemChainById(this.chainId),
        transport: http(`https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=${import.meta.env.VITE_PIMLICO_KEY}`),
    });

    const userOpForBundler = {
        sender: userOp.sender,
        nonce: toHex(userOp.nonce),
        factory: userOp.factory,
        factoryData: userOp.factoryData || '0x',
        callData: userOp.callData,
        callGasLimit: toHex(userOp.callGasLimit),
        verificationGasLimit: toHex(userOp.verificationGasLimit),
        preVerificationGas: toHex(userOp.preVerificationGas),
        maxFeePerGas: toHex(userOp.maxFeePerGas),
        maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
        paymaster: userOp.paymaster,
        paymasterVerificationGasLimit: userOp.paymasterVerificationGasLimit ? toHex(userOp.paymasterVerificationGasLimit) : undefined,
        paymasterPostOpGasLimit: userOp.paymasterPostOpGasLimit ? toHex(userOp.paymasterPostOpGasLimit) : undefined,
        paymasterData: userOp.paymasterData || '0x',
        signature: userOp.signature,
    };
    console.log("📤 [12b] UserOp for bundler:", userOpForBundler);

    const hash = await bundlerClient.request({
        method: 'eth_sendUserOperation',
        params: [userOpForBundler, ENTRYPOINT_ADDRESS_V07],
    });
    console.log("📤 [13] UserOp hash from bundler:", hash);

    // 8. Wait for receipt
    console.log("⏳ [14] Waiting for UserOp receipt...");
    let receipt = null;
    while (!receipt) {
        await new Promise(r => setTimeout(r, 2000));
        try {
            receipt = await bundlerClient.request({
                method: 'eth_getUserOperationReceipt',
                params: [hash],
            });
        } catch (e) {
            console.log("⏳ Polling for receipt...");
        }
    }

    console.log("✅ [15] Receipt received:", receipt);
    return receipt.receipt.transactionHash;
}

  async transfer(to: string, amount: string): Promise<string> {

    const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

    const txHash = await this.smartAccountClient.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
      maxFeePerGas: gasPrice.fast.maxFeePerGas,     
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas
    });

    return txHash;
  }


  async batchWrite(calls: Array<{
      address: string;
      abi: string;
      method: string;
      args: any[];
      deploy?: boolean; // ← Add this
  }>): Promise<string[]> {
      console.log("🔧 Executing", calls.length, "transactions sequentially");
      
      const results: string[] = [];
      
      for (const call of calls) {
          let result: string;
          
          await (this.txMutex = this.txMutex.then(async () => {
              console.log("📤 Executing:", call.method);
              
              result = await this.write(
                  call.address,
                  call.abi,
                  call.method,
                  call.args,
                  call.deploy ?? false, // ← Use the deploy flag from call
                  true
              );
              
              console.log("✅ Completed:", call.method, "->", result);
          }));
          
          results.push(result!);
      }
      
      return results;
  }

  private async extractDeployedAddress(txHash: string): Promise<string> {
      console.log("🔍 [START] Extracting deployed address from tx:", txHash);
      const result = await this.extractFromInternalTransactions(txHash);
      console.log("✅ [END] Extracted address:", result, "for tx:", txHash);
      return result;
  }


  /**
   * Strategy 2: Extract from internal transactions (fallback)
   */
  private async extractFromInternalTransactions(txHash: string): Promise<string> {
    console.log("🔄 Querying internal transactions...");
    
    let attempts = 0;
    const maxAttempts = 9;
    let txs: InternalTransaction[] = [];
    
    while (attempts < maxAttempts) {

      const response : any =  await this.getInternalTransactions(
        this.chainId,
        txHash,
        import.meta.env.VITE_ETHERSCAN_API_KEY || ""
      );
      ``
      // console.log(`Attempt ${attempts + 1}: Raw response:`, response);
      // console.log(`Response type:`, typeof response);
      // console.log(`Is array:`, Array.isArray(response));
      
      // Check if response has a result property
      const txs = Array.isArray(response) ? response : response?.result || [];
      // console.log(`Processed txs:`, txs);
      // console.log(`Txs length:`, txs.length);
      
      if (Array.isArray(txs)) {
        const deploymentTx = txs.find((tx) => tx.contractAddress && tx.contractAddress !== "");
        
        if (deploymentTx) {
          console.log("✅ Found deployed contract:", deploymentTx.contractAddress);
          return deploymentTx.contractAddress;
        }
      } else {
        console.error("txs is not an array:", txs);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
    }

    console.error("❌ Could not extract deployed contract address after", maxAttempts, "attempts");
    throw new Error("Failed to extract deployed contract address");
  }

  async getInternalTransactions(
    chainId: number, 
    txHash: string, 
    apiKey: string
    ): Promise<InternalTransaction[]> {

      const baseUrl = getScanApi(chainId);
      
      const url = `${baseUrl}&module=account&action=txlistinternal&txhash=${txHash}&apikey=${apiKey}`;

      // console.log(url)
      
      try {
          const response = await fetch(url);
          const data = await response.json();
          return data.result || [];
      } catch (error) {
          // console.error('Failed to fetch internal transactions:', error);
          return [];
      }
  }

//   private async extractAllDeployedAddresses(txHash: string): Promise<string[]> {
//     console.log("🔍 Extracting all deployed addresses from tx:", txHash);
    
//     let attempts = 0;
//     const maxAttempts = 9;
    
//     while (attempts < maxAttempts) {
//         attempts++;
        
//         const response: any = await this.getInternalTransactions(
//             this.chainId,
//             txHash,
//             this.main.plugin.settings.etherscan_key
//         );
        
//         const txs = Array.isArray(response) ? response : response?.result || [];
        
//         if (Array.isArray(txs) && txs.length > 0) {
//             const deployedAddresses = txs
//                 .filter(tx => tx.contractAddress && tx.contractAddress !== "")
//                 .map(tx => tx.contractAddress);
            
//             if (deployedAddresses.length > 0) {
//                 console.log("✅ Found", deployedAddresses.length, "deployed contracts:", deployedAddresses);
//                 return deployedAddresses;
//             }
//         }
        
//         if (attempts < maxAttempts) {
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }
//     }
    
//     throw new Error(`Failed to extract deployed addresses for tx: ${txHash}`);
// }


  // private getRPC(): string {
  //   // Your existing RPC logic
  //   return "";
  // }

    // Helper function to ensure proper 0x prefixed hex string format
  private ensureHex(value: string): `0x${string}` {
    if (!value) throw new Error("Empty value provided");
    
    // Remove any existing 0x prefix and convert to lowercase
    const cleaned = value.replace(/^0x/i, '').toLowerCase();
    
    // Validate it's a valid hex string
    if (!/^[0-9a-f]*$/.test(cleaned)) {
      throw new Error(`Invalid hex string: ${value}`);
    }
    
    return `0x${cleaned}` as `0x${string}`;
  }
}