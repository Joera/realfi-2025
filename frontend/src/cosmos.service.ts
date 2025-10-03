import { SigningStargateClient, StargateClient, GasPrice, Coin } from "@cosmjs/stargate";
import { DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { fromHex, toHex, toBase64 } from "@cosmjs/encoding";
import { sha256, Secp256k1 } from "@cosmjs/crypto";
import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

interface CosmosConfig {
  rpcEndpoint: string;
  prefix: string;
  chainId?: string;
  gasPrice?: string;
}

interface TxResult {
  txHash: string;
  height?: number;
  code?: number;
  rawLog?: string;
}

interface SendTokensParams {
  recipient: string;
  amount: string;
  denom: string;
  memo?: string;
  gas?: string;
  gasPrice?: string;
}

interface ExecuteContractParams {
  contractAddress: string;
  msg: Record<string, any>;
  funds?: readonly Coin[]; // Changed to readonly Coin[]
  memo?: string;
  gas?: string;
}

export class CosmosWalletService {
  private wallet: DirectSecp256k1Wallet | null = null;
  private signingClient: SigningStargateClient | null = null;
  private wasmClient: SigningCosmWasmClient | null = null;
  private publicClient: StargateClient | null = null;
  private wasmPublicClient: CosmWasmClient | null = null;
  private config: CosmosConfig;
  private address: string = "";
  private privateKey: string = "";
  private isInitialized: boolean = false;

  constructor(config: CosmosConfig) {
    this.config = config;
  }

  /**
   * Set the private key (can be called anytime before initialize)
   */
  setPrivateKey(privateKey: string): void {
    this.privateKey = privateKey;
  }

  /**
   * Initialize the wallet and clients
   */
  async initialize(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.privateKey = privateKey.startsWith('0x') 
      ? privateKey.slice(2) 
      : privateKey;
    }

    if (!this.privateKey) {
      throw new Error("Private key not set. Call setPrivateKey() or pass it to initialize()");
    }

    if (this.isInitialized) {
      console.log("Wallet already initialized");
      return;
    }

    try {
      // Create wallet from private key
      const privateKeyBytes = fromHex(this.privateKey);
      
      this.wallet = await DirectSecp256k1Wallet.fromKey(
        privateKeyBytes,
        this.config.prefix
      );

      // Get account address
      const [account] = await this.wallet.getAccounts();
      this.address = account.address;

      console.log(`Cosmos wallet initialized: ${this.address}`);

      // Initialize signing client
      const gasPrice = this.config.gasPrice 
        ? GasPrice.fromString(this.config.gasPrice)
        : GasPrice.fromString("0.025uatom");

      this.signingClient = await SigningStargateClient.connectWithSigner(
        this.config.rpcEndpoint,
        this.wallet,
        { gasPrice }
      );

      // Initialize CosmWasm client for smart contracts
      this.wasmClient = await SigningCosmWasmClient.connectWithSigner(
        this.config.rpcEndpoint,
        this.wallet,
        { gasPrice }
      );

      // Initialize public clients (for queries)
      this.publicClient = await StargateClient.connect(this.config.rpcEndpoint);
      this.wasmPublicClient = await CosmWasmClient.connect(this.config.rpcEndpoint);

      this.isInitialized = true;
      console.log("Cosmos clients connected");
    } catch (error) {
      console.error("Failed to initialize Cosmos wallet:", error);
      throw error;
    }
  }

  /**
   * Check if wallet is initialized
   */
  isWalletInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Ensure wallet is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.wallet || !this.signingClient) {
      throw new Error("Wallet not initialized. Call initialize() first.");
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    this.ensureInitialized();
    return this.address;
  }

  /**
   * Get account balance
   */
  async getBalance(denom: string = "uatom"): Promise<string> {
    this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error("Public client not initialized");
    }

    const balance = await this.publicClient.getBalance(this.address, denom);
    return balance.amount;
  }

  /**
   * Get all balances
   */
  async getAllBalances(): Promise<readonly Coin[]> {
    this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error("Public client not initialized");
    }

    return await this.publicClient.getAllBalances(this.address);
  }

  /**
   * Send tokens
   */
  async sendTokens(params: SendTokensParams): Promise<TxResult> {
    this.ensureInitialized();

    if (!this.signingClient) {
      throw new Error("Signing client not initialized");
    }

    const { recipient, amount, denom, memo = "", gas = "auto" } = params;

    const result = await this.signingClient.sendTokens(
      this.address,
      recipient,
      [{ denom, amount }],
      gas === "auto" ? "auto" : { amount: [{ denom, amount: params.gasPrice || "5000" }], gas },
      memo
    );

    return {
      txHash: result.transactionHash,
      height: result.height,
      code: result.code,
      rawLog: result.rawLog,
    };
  }

  /**
   * Execute a contract (CosmWasm)
   */
  async executeContract(params: ExecuteContractParams): Promise<TxResult> {
    this.ensureInitialized();

    if (!this.wasmClient) {
      throw new Error("CosmWasm client not initialized");
    }

    const { contractAddress, msg, funds = [], memo = "", gas = "auto" } = params;

    const result: any = await this.wasmClient.execute(
      this.address,
      contractAddress,
      msg,
      gas === "auto" ? "auto" : { amount: [{ denom: "uatom", amount: "5000" }], gas },
      memo,
      funds
    );

    return {
      txHash: result.transactionHash,
      height: result.height,
      code: result.code,
      rawLog: result.rawLog,
    };
  }

  /**
   * Query a smart contract
   */
  async queryContract(
    contractAddress: string,
    query: Record<string, any>
  ): Promise<any> {
    this.ensureInitialized();

    if (!this.wasmPublicClient) {
      throw new Error("CosmWasm public client not initialized");
    }

    return await this.wasmPublicClient.queryContractSmart(contractAddress, query);
  }

  /**
   * Sign a message (using direct signing with raw bytes)
   */
  async signMessage(message: string): Promise<{
    signature: string;
    pubKey: string;
  }> {
    this.ensureInitialized();

    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }

    const accounts = await this.wallet.getAccounts();
    const account = accounts[0];

    // Hash the message
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = sha256(messageBytes);

    // Sign the hash directly using secp256k1
    const privateKeyBytes = fromHex(this.privateKey);
    const signature = await Secp256k1.createSignature(messageHash, privateKeyBytes);
    const signatureBytes = new Uint8Array([
      ...signature.r(32),
      ...signature.s(32),
    ]);

    return {
      signature: toHex(signatureBytes),
      pubKey: toHex(account.pubkey),
    };
  }

  /**
   * Sign a message hash (similar to Ethereum personal_sign)
   */
  async signMessageHash(message: string): Promise<{
    messageHash: string;
    signature: string;
    pubKey: string;
  }> {
    const messageBytes = new TextEncoder().encode(message);
    const messageHash = sha256(messageBytes);

    const signResult = await this.signMessage(message);

    return {
      messageHash: toHex(messageHash),
      ...signResult,
    };
  }

  /**
   * Sign arbitrary data with Cosmos personal_sign style
   */
  async signArbitrary(data: string): Promise<{
    signature: string;
    pubKey: string;
  }> {
    return this.signMessage(data);
  }

  /**
   * Generic transaction execution
   */
  async genericTx(
    msgs: any[],
    options: {
      memo?: string;
      gas?: string;
      gasPrice?: string;
    } = {}
  ): Promise<TxResult> {
    this.ensureInitialized();

    if (!this.signingClient) {
      throw new Error("Signing client not initialized");
    }

    const { memo = "", gas = "auto", gasPrice } = options;

    const fee = gas === "auto" 
      ? "auto" 
      : {
          amount: [{ denom: "uatom", amount: gasPrice || "5000" }],
          gas,
        };

    const result = await this.signingClient.signAndBroadcast(
      this.address,
      msgs,
      fee,
      memo
    );

    return {
      txHash: result.transactionHash,
      height: result.height,
      code: result.code,
      rawLog: result.rawLog,
    };
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string): Promise<any> {
    this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error("Public client not initialized");
    }

    return await this.publicClient.getTx(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    timeoutMs: number = 60000
  ): Promise<any> {
    this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error("Public client not initialized");
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const tx = await this.publicClient.getTx(txHash);
        if (tx) {
          return tx;
        }
      } catch (error) {
        // Transaction not found yet, continue polling
      }

      // Wait 1 second before next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Transaction ${txHash} not found after ${timeoutMs}ms`);
  }

  /**
   * Simulate a transaction to estimate gas
   */
  async simulateTransaction(msgs: any[]): Promise<number> {
    this.ensureInitialized();

    if (!this.signingClient) {
      throw new Error("Signing client not initialized");
    }

    const gasEstimate = await this.signingClient.simulate(
      this.address,
      msgs,
      ""
    );

    return Math.ceil(gasEstimate * 1.3); // Add 30% buffer
  }

  /**
   * Get account info
   */
  async getAccount(): Promise<any> {
    this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error("Public client not initialized");
    }

    return await this.publicClient.getAccount(this.address);
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.signingClient) {
      this.signingClient.disconnect();
    }
    if (this.wasmClient) {
      this.wasmClient.disconnect();
    }
    if (this.publicClient) {
      this.publicClient.disconnect();
    }
    if (this.wasmPublicClient) {
      this.wasmPublicClient.disconnect();
    }

    this.wallet = null;
    this.signingClient = null;
    this.wasmClient = null;
    this.publicClient = null;
    this.wasmPublicClient = null;
    this.address = "";
    this.privateKey = "";
    this.isInitialized = false;

    console.log("Cosmos wallet disconnected");
  }
}