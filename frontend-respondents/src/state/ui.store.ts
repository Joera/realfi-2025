import { Observable } from './observable.js';
import { UIState } from './store.types.js';

class UIStore {

    private observable: Observable<UIState>;

    constructor() {
        this.observable = new Observable<UIState>({
            cardView: 'nocard',
        });
    }

    get state()       { return this.observable.get(); }
    get cardView() { return this.state.cardView; }

    set(update: Partial<UIState>) {
        this.observable.update(current => ({ ...current, ...update }));
    }

    subscribe(listener: (value: UIState) => void): () => void {
        return this.observable.subscribe(listener);
    }

    reset() {
        this.observable.set({ cardView: 'nocard' });
    }
}

export const uiStore = new UIStore();