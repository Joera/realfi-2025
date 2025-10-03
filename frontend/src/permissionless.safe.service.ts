
import { 
  toSafeSmartAccount,
} from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, encodeFunctionData, http, keccak256, parseAbi, parseEther, toBytes } from "viem";
import { privateKeyToAccount, toAccount } from "viem/accounts";
import { getChainId, getRPCUrl, getScanApi, getViemChainById, getViemChainByName } from "./chains.factory";

const ENTRYPOINT_ADDRESS_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

interface TxResult {
  txHash: string;
  receipt?: any;
  deployedAddress?: string;
}

interface TxOptions {
  deploy?: boolean;
  waitForReceipt?: boolean;
  confirmations?: number;
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


export interface IPermissionlessSafeService {
//   main: IMainController;
  chainId: number;
  signer: any;
  smartAccount: any;
  smartAccountClient: any;
  provider: any;
  address: string;
  
  updateSigner: (pk: string) => Promise<void>;
  // getPredictedAddress: (owners: string[], salt: string) => Promise<string>;
  connectToFreshSafe: (salt: string) => Promise<string>
  connectToExistingSafe: (safe_address: string) => Promise<string>
  genericRead: (address: string, abi: string, method: string, args: string[]) => Promise<any>;
  genericTx: (address: string, abi: string, method: string, args: string[], options: TxOptions) => Promise<TxResult>;
  // valueTx: (to: string, amount: string) => Promise<string>;
  getSafeAddress: (owners: string[], salt: string) => Promise<string>;
}

export class PermissionlessSafeService implements IPermissionlessSafeService {
//   main: IMainController;
  chainId: number;
  signer: any;
  smartAccount: any;
  smartAccountClient: any;
  provider: any;
  address!: string;
  
  private publicClient: any;
  private pimlicoClient: any;

  constructor(chain: string | number) {
    // this.main = main;
    this.chainId = typeof chain === 'string' ? getChainId(chain) : chain;

    this.publicClient = createPublicClient({
      chain: getViemChainById(this.chainId),
      transport: http(getRPCUrl(this.chainId, import.meta.env.VITE_ALCHEMY_KEY || ""))
    });

    this.pimlicoClient = createPimlicoClient({
      transport: http(`https://api.pimlico.io/v2/${this.chainId}/rpc?apikey=${import.meta.env.VITE_PIMLICO_KEY}`),
      entryPoint: {
        address: ENTRYPOINT_ADDRESS_V07,
        version: "0.7",
      },
    });
  }

  async updateSigner(pk: string) {
    this.signer = await privateKeyToAccount(pk as `0x${string}`);
    return this.signer.address;
  }

  async connectToFreshSafe(salt: string) {

      console.log("salt", salt)

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
      address: safe_address as `0x${string}`, 
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


   async genericRead(address: string, abi: string, method: string, args: string[]): Promise<any> {

    let retries = 3;
    while (retries > 0) {
      try {
        // Use viem's readContract instead of ethers
        const result = await this.publicClient.readContract({
          address: this.ensureHex(address),
          abi: JSON.parse(abi), // Parse the ABI string to object
          functionName: method,
          args: args,
        });
        return result;
      } catch (error: any) {
        retries--;
        if (retries === 0) throw error;
        console.log(`RPC call failed, retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async genericTx(
    address: string, 
    abi: string, 
    method: string, 
    args: string[], 
    options: TxOptions = {}
  ): Promise<TxResult> {
    const { deploy = false, waitForReceipt = false, confirmations = 1 } = options;
    
    console.log("Executing transaction:", { address, method, args });

    const data = encodeFunctionData({
      abi: JSON.parse(abi),
      functionName: method,
      args: args,
    });

    const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();

    // Execute via permissionless
    const txHash = await this.smartAccountClient.sendTransaction({
      to: address as `0x${string}`,
      data,
      value: 0n,
      maxFeePerGas: gasPrice.fast.maxFeePerGas,     
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
    });

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
        if (deploy) {
          result.deployedAddress = await this.extractDeployedAddress(txHash);
        }
      } catch (error) {
        console.error("Error waiting for receipt:", error);
        // Still return the txHash even if receipt fails
      }
    }

    return result;
  }

  private async extractDeployedAddress(txHash: string): Promise<string> {
    console.log("🔍 Extracting deployed contract address from tx:", txHash);

    // Strategy 1: Parse transaction receipt logs (fastest)
    // try {
    //   const contractAddress = await this.extractFromReceipt(txHash);
    //   if (contractAddress) {
    //     console.log("✅ Found address via receipt:", contractAddress);
    //     return contractAddress;
    //   }
    // } catch (error) {
    //   console.log("⚠️ Receipt parsing failed, trying internal transactions...");
    // }

    // Strategy 2: Use internal transactions API (more reliable for complex deployments)
    return await this.extractFromInternalTransactions(txHash);
  }

  /**
   * Strategy 1: Extract from transaction receipt logs
   */
  private async extractFromReceipt(txHash: string): Promise<string | null> {
    const receipt = await this.publicClient.waitForTransactionReceipt({ 
      hash: txHash as `0x${string}` 
    });

    // For direct deployments, contractAddress is in the receipt
    if (receipt.contractAddress) {
      return receipt.contractAddress;
    }

    // For factory deployments, look for deployment events
    for (const log of receipt.logs) {
      try {
        // Common factory event patterns
        const factoryEvents = [
          'event ModuleCreated(address indexed safe, address indexed module)',
          'event ContractDeployed(address indexed deployedAddress)',
          'event Created(address indexed instance)',
          'event Deployment(address indexed deployed)'
        ];

        for (const eventSig of factoryEvents) {
          try {
            const abi = parseAbi([eventSig]);
            const decoded = this.publicClient.decodeEventLog({
              abi,
              data: log.data,
              topics: log.topics
            });
            
            // Extract address from common field names
            const address = (decoded as any).args?.module || 
                           (decoded as any).args?.deployedAddress ||
                           (decoded as any).args?.instance ||
                           (decoded as any).args?.deployed;
                           
            if (address) {
              return address;
            }
          } catch (e) {
            // Try next event signature
            continue;
          }
        }
      } catch (error) {
        // Skip invalid logs
        continue;
      }
    }

    return null;
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
        import.meta.env.VITE_ETHERSCAN_KEY || ""
      );
      ``
      // console.log(`Attempt ${attempts + 1}: Raw response:`, response);
      // console.log(`Response type:`, typeof response);
      // console.log(`Is array:`, Array.isArray(response));
      
      // Check if response has a result property
      const txs = Array.isArray(response) ? response : response?.result || [];
      // console.log(`import.metaed txs:`, txs);
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

        console.log(url)
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.result || [];
        } catch (error) {
            console.error('Failed to fetch internal transactions:', error);
            return [];
        }
    }


  private getRPC(): string {
    // Your existing RPC logic
    return "";
  }

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