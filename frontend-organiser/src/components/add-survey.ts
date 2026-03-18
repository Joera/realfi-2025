import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { formStyles } from '../styles/shared-form-styles.js'
import { store } from '../state/index.js'

class AddSurvey extends HTMLElement {
  private open: boolean = false

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
          align-items: stretch;
          margin-top: 1.5rem;
          margin-bottom: 3rem;
          overflow: hidden;
        }

        .add-survey__input {
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

        :host([open]) .add-survey__input {
          width: 14rem;
          opacity: 1;
          padding: 0 .75rem;
        }

        #add-btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        :host(:not([open])) #add-btn {
          border-radius: revert;
        }

        .error {
          color: red;
          margin-top: 0.5rem;
          margin-left: .75rem;
        }
      </style>

      <div class="container container-large">
        <div class="add-survey">
          <input
            id="add-survey-id"
            type="text"
            class="add-survey__input"
            placeholder="Enter survey ID"
            autocomplete="off"
            tabindex="-1"
          />
          <button class="btn-primary" id="add-btn">Add</button>
        </div>
        <div class="error" id="error"></div>
      </div>
    `
  }

  private attachEventListeners() {
    const input = this.shadowRoot?.querySelector('.add-survey__input') as HTMLInputElement
    const button = this.shadowRoot?.querySelector('#add-btn') as HTMLButtonElement
    const error = this.shadowRoot?.querySelector('#error') as HTMLElement

    const submit = () => {
      const id = input.value.trim()
      if (!id) return
      store.addSurvey({ id })
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

customElements.define('add-survey', AddSurvey)

export { AddSurvey }