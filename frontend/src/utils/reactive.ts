// src/utils/reactive.ts

import { store } from '../services/store.service';

type TemplateFunction = () => string;

export class ReactiveTemplate {
  private element: HTMLElement;
  private template: TemplateFunction;
  private unsubscribers: (() => void)[] = [];

  constructor(element: HTMLElement, template: TemplateFunction) {
    this.element = element;
    this.template = template;
  }

  render() {
    this.element.innerHTML = this.template();
  }

  // Subscribe to store changes and auto-render
  bind<K extends keyof typeof store.observables>(storeKey: K) {
    const unsubscribe = store.subscribe(storeKey, () => {
      this.render();
    });
    this.unsubscribers.push(unsubscribe);
    this.render(); // Initial render
    return this;
  }

  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}

// Helper function to create reactive elements
export const reactive = (
  selector: string,
  template: TemplateFunction
): ReactiveTemplate | null => {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return null;
  return new ReactiveTemplate(element, template);
};

// Helper to bind multiple elements at once
export const bindAll = (bindings: Array<{ selector: string; template: TemplateFunction; keys: Array<keyof typeof store.observables> }>): ReactiveTemplate[] => {
  return bindings
    .map(({ selector, template, keys }) => {
      const view = reactive(selector, template);
      if (view) {
        keys.forEach(key => view.bind(key));
      }
      return view;
    })
    .filter((v): v is ReactiveTemplate => v !== null);
};