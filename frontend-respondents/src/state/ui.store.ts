import { Observable, Listener } from './observable.js';
import { UIState } from './store.types.js';

export class UIStore {
  private observable: Observable<UIState>;

  constructor() {
    this.observable = new Observable<UIState>({
      cardView: 'nocard',
    });
  }

  get state(): UIState {
    return this.observable.get();
  }

  get cardView(): UIState['cardView'] {
    return this.state.cardView;
  }

  set(update: Partial<UIState>): void {
    this.observable.update(current => ({ ...current, ...update }));
  }

  subscribe(listener: Listener<UIState>): () => void {
    return this.observable.subscribe(listener);
  }

  reset(): void {
    this.observable.set({ cardView: 'nocard' });
  }
}