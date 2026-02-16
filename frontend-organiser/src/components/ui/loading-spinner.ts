// loading-spinner.ts
import { formStyles } from '../../styles/shared-form-styles.js'
import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'

class LoadingSpinner extends HTMLElement {
  private message: string = 'Loading...'
  private size: number = 48
  private color: string = '#FFF'

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [formStyles, typograhyStyles]
  }

  static get observedAttributes() {
    return ['message', 'size', 'color']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return

    switch (name) {
      case 'message':
        this.message = newValue
        break
      case 'size':
        this.size = parseInt(newValue, 10) || 48
        break
      case 'color':
        this.color = newValue
        break
    }

    if (this.shadowRoot) {
      this.render()
    }
  }

  connectedCallback() {
    this.render()
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          text-align: center;
        }

        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }

        .loader {
          width: ${this.size}px;
          height: ${this.size}px;
          border: ${Math.max(3, Math.floor(this.size / 10))}px dotted ${this.color};
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 2s linear infinite;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .message {
          color: ${this.color};
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>

      <div class="spinner-container" role="status" aria-live="polite">
        <span class="loader" aria-hidden="true"></span>
        ${this.message ? `<p class="message">${this.message}</p>` : ''}
        <span class="visually-hidden">${this.message || 'Loading'}</span>
      </div>
    `
  }

  // Public methods
  public setMessage(message: string): void {
    this.message = message
    this.render()
  }

  public setSize(size: number): void {
    this.size = size
    this.render()
  }

  public setColor(color: string): void {
    this.color = color
    this.render()
  }
}

customElements.define('loading-spinner', LoadingSpinner)

export { LoadingSpinner }