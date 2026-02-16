import { Observable, Listener } from './observable.js';
import { UIState } from './types.js';

const DEFAULT_UI_STATE: UIState = {
  landingStep: 'welcome',
  newStep: 'intro',
  resultTab: 'results',
};

export class UIStore {
  private observable: Observable<UIState>;

  constructor() {
    this.observable = new Observable<UIState>(DEFAULT_UI_STATE);
  }

  get state(): UIState {
    return this.observable.get();
  }

  set(update: Partial<UIState>): void {
    this.observable.update(current => ({ ...current, ...update }));
  }

  reset(): void {
    this.observable.set(DEFAULT_UI_STATE);
  }

  subscribe(listener: Listener<UIState>): () => void {
    return this.observable.subscribe(listener);
  }
}