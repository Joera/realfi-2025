import { NillionService } from "./nilldb.service";
import { WaapService } from "./waap.service";

export interface IServices {
  waap: WaapService;
  nillion: NillionService;
}

export class ServiceContainer {
  private static instance: ServiceContainer | null = null;
  private initialized = false;
  
  public waap: any;
  public nillion!: any;
  
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
    this.initialized = true;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export the getter, not an instance
export const getServices = () => ServiceContainer.getInstance();