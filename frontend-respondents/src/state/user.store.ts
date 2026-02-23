import { Observable } from './observable.js';
import { UserState } from './store.types.js';

class UserStore {

    private observable: Observable<UserState>;

    constructor() {
        this.observable = new Observable<UserState>({
            nullifier: localStorage.getItem('nullifier'),
            batchId:   localStorage.getItem('batchId'),
            address:   localStorage.getItem('address'),
        });
    }

    get state()     { return this.observable.get(); }
    get nullifier() { return this.state.nullifier; }
    get batchId()   { return this.state.batchId; }
    get address()   { return this.state.address; }

    set(update: Partial<UserState>) {
        this.observable.update(current => ({ ...current, ...update }));
    }

    subscribe(listener: (value: UserState) => void): () => void {
        return this.observable.subscribe(listener);
    }

    persist() {
        const { nullifier, batchId, address } = this.state;
        if (nullifier) localStorage.setItem('nullifier', nullifier);
        if (batchId)   localStorage.setItem('batchId', batchId);
        if (address)   localStorage.setItem('address', address);
    }

    clear() {
        this.observable.set({ nullifier: null, batchId: null, address: null });
        localStorage.removeItem('nullifier');
        localStorage.removeItem('batchId');
        localStorage.removeItem('address');
    }
}

export const userStore = new UserStore();