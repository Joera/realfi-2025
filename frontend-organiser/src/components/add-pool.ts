import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { formStyles } from '../styles/shared-form-styles.js'
import { store } from '../state/index.js'

class AddPool extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, formStyles]
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
          gap: 1rem;
          align-items: flex-start;
          margin-top: 1.5rem;
          margin-left: .75rem;
        }

        .error {
          color: red;
          margin-top: 0.5rem;
          margin-left: .75rem;
        }
      </style>

      <div class="container container-large">
        <div class="add-pool">
          <input
            id="add-pool-id"
            type="text"
            class="add-pool__input"
            placeholder="Enter pool ID"
            autocomplete="off"
          />
          <button class="btn-primary" id="add-btn">Add</button>
        </div>
        <div class="error" id="error"></div>
      </div>
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
            detail: { surveyId: id },
            bubbles: true,
            composed: true
        }))

      input.value = ''
      input.focus()
    }

    button?.addEventListener('click', submit)
    input?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') submit()
    })
  }
}

customElements.define('add-pool', AddPool)

export { AddPool }