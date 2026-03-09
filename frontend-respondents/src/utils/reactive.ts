// reactive.ts
type TemplateFunction = () => string;

type AnyStore = {
  subscribe: (listener: () => void) => () => void;
};

class Reactive {
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

  bind(store: AnyStore) {
    const unsubscribe = store.subscribe(() => this.render());
    this.unsubscribers.push(unsubscribe);
    this.render();
    return this;
  }

  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}

export const reactive = (
  selector: string,
  template: TemplateFunction
): Reactive | null => {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return null;
  return new Reactive(element, template);
};