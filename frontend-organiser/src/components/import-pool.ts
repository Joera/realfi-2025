import { typograhyStyles } from '@s3ntiment/shared/assets'
import { buttonStyles } from '@s3ntiment/shared/assets'
import { formStyles } from '@s3ntiment/shared/assets'
import { store } from '../state/index.js'

class ImportPool extends HTMLElement {
  private open: boolean = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles, formStyles]
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
        }

        .add-pool {
          display: flex;
          align-items: stretch;
          margin-top: 1.5rem;
          margin-bottom: 3rem;
          overflow: hidden;
        }

        .add-pool__input {
          width: 0;
          opacity: 0;
          padding: 0;
          border: none;
          outline: none;
          transition: width 0.3s ease, opacity 0.25s ease, padding 0.3s ease;
          margin: 0;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        :host([open]) .add-pool__input {
          width: 14rem;
          opacity: 1;
          padding: 0 .75rem;
          border: 2px solid var(--color-too-dark);
          border-right: none;

        }

        #add-btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        :host(:not([open])) #add-btn {
          border-radius: 6px;
        }



        .error {
          color: red;
          margin-top: 0.5rem;
          margin-left: .75rem;
        }



      </style>


        <div class="add-pool">
          <input
            id="add-pool-id"
            type="text"
            class="add-pool__input"
            placeholder="Enter pool ID"
            autocomplete="off"
            tabindex="-1"
          />
          <button class="btn-secondary" id="add-btn">Import</button>
        </div>
        <div class="error" id="error"></div>

    `
  }

  private attachEventListeners() {
    const input = this.shadowRoot?.querySelector('.add-pool__input') as HTMLInputElement
    const button = this.shadowRoot?.querySelector('#add-btn') as HTMLButtonElement
    const error = this.shadowRoot?.querySelector('#error') as HTMLElement

    const submit = () => {
      const id = input.value.trim()
      if (!id) return

      this.dispatchEvent(new CustomEvent('import-pool', {
        detail: { poolId: id },
        bubbles: true,
        composed: true
      }))

      input.value = ''
      input.focus()
    }

    button?.addEventListener('click', () => {
      if (!this.open) {
        this.open = true
        this.setAttribute('open', '')
        input.tabIndex = 0
        input.focus()
        return
      }

      submit()
    })

    input?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') submit()
      if (e.key === 'Escape') {
        this.open = false
        this.removeAttribute('open')
        input.tabIndex = -1
        input.value = ''
      }
    })
  }
}

customElements.define('import-pool', ImportPool)

export { ImportPool }