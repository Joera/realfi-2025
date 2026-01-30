import { WaapService } from './waap.service';
import { NillionService } from './nilldb.service';

export class ServiceContainer {
  public waap!: WaapService;
  public nillion!: NillionService;
  private initialized = false;
  
  // Make constructor public - context.ts manages the singleton
  constructor() {}
  
  async initialize() {
    if (this.initialized) {
      console.warn('Services already initialized');
      return;
    }
    
    this.waap = new WaapService();
    this.nillion = new NillionService();
    
    // await this.waap.init();

    this.initialized = true;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}