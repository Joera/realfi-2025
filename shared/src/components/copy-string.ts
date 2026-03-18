import { typograhyStyles } from '../assets/styles/typography-styles.js'

class CopyString extends HTMLElement {
  private value: string = ''
  private copied: boolean = false
  private timeout: number | null = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [typograhyStyles]
  }

  static get observedAttributes() {
    return ['value']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return

    if (name === 'value') {
      this.value = newValue
    }

    if (this.shadowRoot) {
      this.render()
    }
  }

  connectedCallback() {
    if (!this.value) {
      this.value = this.textContent?.trim() || ''
    }
    this.render()
  }

  disconnectedCallback() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  private async copy() {
    try {
      await navigator.clipboard.writeText(this.value)
      this.copied = true
      this.render()
      if (this.timeout) clearTimeout(this.timeout)
      this.timeout = window.setTimeout(() => {
        this.copied = false
        this.render()
      }, 1500)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .text {
          margin: 0;
          user-select: all;
        }

        button {
          all: unset;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.15rem;
          border-radius: 3px;
          color: #666;
          transition: color 0.2s ease;
        }

        button:hover {
          color: #1a1a1a;
        }

        button.copied {
          color: #2e7d32;
        }

        svg {
          width: 14px;
          height: 14px;
        }
      </style>

      <span class="text">${this.value}</span>
      <button class="${this.copied ? 'copied' : ''}" aria-label="Copy to clipboard">
        ${this.copied
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>`
        }
      </button>
    `

    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.copy())
  }
}

customElements.define('copy-string', CopyString)

export { CopyString }