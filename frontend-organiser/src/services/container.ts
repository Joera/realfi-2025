import { NillionService } from "./nillion.service";
import { WaapService } from "./waap.service";
import { ViemService } from "./viem.service";
import { PermissionlessSafeService } from "./permissionless.safe.service";
import LitService from "./lit.ctrlr";
import { IPFSMethods } from "./ipfs.service";

export interface IServices {
  waap: WaapService;
  nillion: NillionService;
  viem: ViemService;
  lit: LitService;
  safe: PermissionlessSafeService;
  ipfs: IPFSMethods;
}

export class ServiceContainer {
  private static instance: ServiceContainer | null = null;
  private initialized = false;
  
  public waap!: WaapService;
  public nillion!: NillionService;
  public lit!: LitService;
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
    
    this.waap = new WaapService();
    this.nillion = new NillionService();    
    this.lit = new LitService();
    this.safe = new PermissionlessSafeService(import.meta.env.VITE_L2);
    this.viem = new ViemService(import.meta.env.VITE_L2);

    this.ipfs = new IPFSMethods(import.meta.env.VITE_KUBO_ENDPOINT, import.meta.env.VITE_PINATA_JWT, import.meta.env.VITE_PINATA_GATEWAY)
    this.initialized = true;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export the getter, not an instance
export const getServices = () => ServiceContainer.getInstance();