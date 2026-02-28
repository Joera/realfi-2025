/// <reference types="vite/client" />

import { 
  ViemService,
  PermissionlessSafeService,
  PermissionlessSimpleService,
  LitService,
  IPFSMethods
} from "@s3ntiment/shared";

import { WaapService } from "@s3ntiment/shared/browser"


import { base } from "viem/chains";

export interface IServices {
  waap: WaapService;
  viem: ViemService;
  lit: LitService;
  account: PermissionlessSimpleService;
  safe: PermissionlessSafeService;
  ipfs: IPFSMethods;
  isInitialized: () => boolean;
}

export class ServiceContainer {
  private static instance: ServiceContainer | null = null;
  private initialized = false;
  
  public waap!: WaapService;
  public lit!: LitService;
  public account!: PermissionlessSimpleService;
  public safe!: PermissionlessSafeService;
  public viem!: ViemService;
  public ipfs!: IPFSMethods;
  
  private constructor() {
    if (ServiceContainer.instance) {
      throw new Error('ServiceContainer already instantiated! Use ServiceContainer.getInstance()');
    }
    ServiceContainer.instance = this;
  }
  
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  async initialize() {
    if (this.initialized) {
      console.warn('Services already initialized');
      return;
    }
    
    this.viem = new ViemService(base, import.meta.env.VITE_ALCHEMY_KEY);
    this.waap = new WaapService();
    this.safe = new PermissionlessSafeService(base, import.meta.env.VITE_PIMLICO_KEY, import.meta.env.VITE_ALCHEMY_KEY, import.meta.env.VITE_ENTRYPOINT_ADDRESS_V07);
    this.account = new PermissionlessSimpleService(base, import.meta.env.VITE_PIMLICO_KEY, import.meta.env.VITE_ALCHEMY_KEY, import.meta.env.VITE_ENTRYPOINT_ADDRESS_V07);
 
    this.lit = new LitService(import.meta.env.VITE_LIT_NETWORK);
    this.ipfs = new IPFSMethods(import.meta.env.VITE_KUBO_ENDPOINT, import.meta.env.VITE_PINATA_JWT, import.meta.env.VITE_PINATA_GATEWAY)

    const walletClient = await this.waap.createWallet(base);

    if (walletClient) {
        if (import.meta.env.VITE_USE_SAFE == 'true') { await this.safe.updateSigner(walletClient); }
        await this.account.updateSigner(walletClient);
    } else {
        
        console.warn('No wallet yet, skipping signer setup');
    }

    await this.lit.init()

    this.initialized = true;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export the getter, not an instance
export const getServices = () => ServiceContainer.getInstance();