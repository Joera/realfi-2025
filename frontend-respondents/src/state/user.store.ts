import { Observable, Listener } from './observable.js';
import { UserState } from './store.types.js';
import { loadUserFromStorage, saveUserToStorage, clearUserFromStorage } from './storage.js';

export class UserStore {
  private observable: Observable<UserState>;

  constructor() {
    this.observable = new Observable<UserState>(loadUserFromStorage());
  }

  get state(): UserState     { return this.observable.get(); }
  get nullifier()            { return this.state.nullifier; }
  get batchId()              { return this.state.batchId; }
  get address()              { return this.state.address; }

  set(update: Partial<UserState>): void {
    this.observable.update(current => ({ ...current, ...update }));
  }

  subscribe(listener: Listener<UserState>): () => void {
    return this.observable.subscribe(listener);
  }

  persist(): void {
    saveUserToStorage(this.state);
  }

  clear(): void {
    this.observable.set({ nullifier: null, batchId: null, address: null });
    clearUserFromStorage();
  }
}