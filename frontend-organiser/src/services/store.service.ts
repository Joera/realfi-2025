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
  user: {};
  ui: {
    currentStep: 'register';
  },
   services: {
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
      user: new Observable<AppState['user']>({}),
      ui: new Observable<AppState['ui']>({
        currentStep: 'register'
      }),
      services:  new Observable<AppState['services']>({
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
    // if (user.nullifier) localStorage.setItem('nullifer', user.nullifier);

  }

  // Clear all data
  clear() {
    this.setUI({ currentStep: 'register'});
  }
}

// Export singleton instance
export const store = new Store();