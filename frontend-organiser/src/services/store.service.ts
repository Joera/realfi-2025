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
  ui: {
    landingStep: 'register',
    resultTab: "results" | "config" | "questions" 
  },
  surveys: any[] 
}

class Store {
  // Make state public so it can be accessed
  public readonly observables: {
    [K in keyof AppState]: Observable<AppState[K]>;
  };

  constructor() {
    // Initialize observables with proper types
    this.observables = {
      ui: new Observable<AppState['ui']>({
        landingStep: 'register',
        resultTab: 'results'  // Default tab
      }),
      surveys: new Observable<AppState['surveys']>([])
    };
  }


  get ui() { return this.observables.ui.get(); }
  get surveys() { return this.observables.surveys.get(); }


  setUI(update: Partial<AppState['ui']>) {
    this.observables.ui.update(current => ({ ...current, ...update }));
  }

  setSurveys(surveys: AppState['surveys']) {  // ← Add this
    console.log(1)
    this.observables.surveys.set(surveys);
  }

  addSurvey(survey: any) {  // ← Add this
    this.observables.surveys.update(current => [...current, survey]);
  }

  subscribe<K extends keyof AppState>(
    key: K,
    listener: Listener<AppState[K]>
  ): () => void {
    return this.observables[key].subscribe(listener);
  }

  clear() {
    this.setUI({ 
        landingStep: 'register',
        resultTab: 'results' 
    });
    this.setSurveys([]); 
  }
}

// Export singleton instance
export const store = new Store();