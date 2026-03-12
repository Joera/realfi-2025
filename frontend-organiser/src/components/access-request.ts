// components/add-survey-input.ts
import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { formStyles } from '../styles/shared-form-styles.js'
import { store } from '../state/index.js'

class AccessRequest extends HTMLElement {
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

        .add-survey {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-top: 1.5rem;
          margin-left: .75rem;
        }

 =
      </style>

      <div class="container container-large">

          <div class="add-survey">
            <input
              id="request-access"
              type="text"
              class="request-access__input"
              placeholder="Enter survey ID"
              autocomplete="off"
            />
            <button class="btn-primary" id="add-btn">Add</button>
          </div>
        </div>
    `
  }

  private attachEventListeners() {
    const input = this.shadowRoot?.querySelector('.request-access__input') as HTMLInputElement
    const button = this.shadowRoot?.querySelector('#add-btn')

    const submit = () => {
      const id = input.value.trim()
      if (!id) return
      
      this.dispatchEvent(new CustomEvent('access-request', {
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

customElements.define('access-request', AccessRequest)

export { AccessRequest }