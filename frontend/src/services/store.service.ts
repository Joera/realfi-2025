import { CardUsageState } from '../controllers/landing.ctrlr';
type Listener<T> = (value: T) => void;

class Observable<T> {
  private value: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
    this.notify();
  }

  update(updater: (current: T) => T) {
    this.value = updater(this.value);
    this.notify();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.value));
  }
}


// Store state interface
interface AppState {
  user: {
    nullifier: string | null;
    batchId: string | null;
    signerAddress: string | null;
    questions: number[];
    safeAddress: string | null;
    // nillionAddress: string | null
  };
  ui: {
    currentStep: 'onboarding' | 'wallet-creation' | 'survey';
    cardUsageState?: CardUsageState;
  },
   services: {
    nillion?: any;
    evmChain?: any;
    [key: string]: any; 
  };
}

class Store {
  // Make state public so it can be accessed
  public readonly observables: {
    [K in keyof AppState]: Observable<AppState[K]>;
  };

  constructor() {
    // Initialize observables with proper types
    this.observables = {
      user: new Observable<AppState['user']>({
        nullifier: localStorage.getItem('nullifer'),
        batchId: localStorage.getItem('batchId'),
        signerAddress: localStorage.getItem('signerAddress'),
        questions: JSON.parse(localStorage.getItem('questions') || '[]'),
        safeAddress: null,
        // nillionAddress: null,
      }),
      ui: new Observable<AppState['ui']>({
        currentStep: 'onboarding'
      }),
      services:  new Observable<AppState['services']>({
        nillion: undefined,
        evmChain: undefined
      }),
    };
  }

  // Getters
  get user() { return this.observables.user.get(); }
  get ui() { return this.observables.ui.get(); }

  // Setters
  setUser(update: Partial<AppState['user']>) {
    this.observables.user.update(current => ({ ...current, ...update }));
  }

  setUI(update: Partial<AppState['ui']>) {
    this.observables.ui.update(current => ({ ...current, ...update }));
  }

  setService(name: string, service: any) {
    this.observables.services = {
      ...this.observables.services,
      [name]: service
    } as any;
  }

  getService(name: string) {
    return (this.observables.services as any)[name];
  }

  // Subscribe to changes
  subscribe<K extends keyof AppState>(
    key: K,
    listener: Listener<AppState[K]>
  ): () => void {
    return this.observables[key].subscribe(listener);
  }

  // Persist user data
  persistUser() {
    const user = this.user;
    if (user.nullifier) localStorage.setItem('nullifer', user.nullifier);
    if (user.batchId) localStorage.setItem('batchId', user.batchId);
    if (user.signerAddress) localStorage.setItem('signerAddress', user.signerAddress);
  }

  // Clear all data
  clear() {
    this.setUI({ currentStep: 'onboarding'});
    localStorage.removeItem('nullifer');
    localStorage.removeItem('batchId');
    localStorage.removeItem('signerAddress');
  }
}

// Export singleton instance
export const store = new Store();