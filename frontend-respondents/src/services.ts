import { 
  ViemService,
  PermissionlessSimpleService,
  LitService,
  IPFSMethods,
  NillDBUserService
} from "@s3ntiment/shared";

import {
  WaapService
} from "@s3ntiment/shared/browser";



import { base } from "viem/chains";

export interface IServices {
  viem: ViemService;
  waap: WaapService;
  account: PermissionlessSimpleService;
  ipfs: IPFSMethods
  lit: LitService;
  nillDB: NillDBUserService;
}

export class ServiceContainer implements IServices {
  private static instance: ServiceContainer | null = null;
  private initialized = false;
  
  public viem!: ViemService;
  public waap!: WaapService;
  public account!: PermissionlessSimpleService;
  public ipfs!: IPFSMethods;
  public lit!: LitService;
  public nillDB!: NillDBUserService;
  
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
    
    this.viem = new ViemService(base, import.meta.env.VITE_ALCHEMY_KEY)
    this.waap = new WaapService();
    this.account = new PermissionlessSimpleService(base, import.meta.env.VITE_PIMLICO_KEY, import.meta.env.VITE_ALCHEMY_KEY, import.meta.env.VITE_ENTRYPOINT_ADDRESS_V07);
    this.lit = new LitService(import.meta.env.VITE_LIT_NETWORK);
    this.ipfs = new IPFSMethods(import.meta.env.VITE_KUBO_ENDPOINT, import.meta.env.VITE_PINATA_JWT, import.meta.env.VITE_PINATA_GATEWAY)
    this.nillDB = new NillDBUserService(import.meta.env.VITE_NIL_BUILDER_DID, import.meta.env.VITE_NILCHAIN_URL, import.meta.env.VITE_NILAUTH_URL, import.meta.env.VITE_NILDB_NODES);
    
    const walletClient = await this.waap.createWallet(base);

    if (walletClient) {
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