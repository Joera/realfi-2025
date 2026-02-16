import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'

class SurveyFormIntro extends HTMLElement {
    private _title: string = ''
    private _introduction: string = ''

    static get observedAttributes() {
        return ['survey-title', 'introduction']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        switch (name) {
            case 'survey-title':
                this._title = newValue || ''
                break
            case 'introduction':
                this._introduction = newValue || ''
                break
        }
        this.updateFields()
    }

    set surveyTitle(value: string) {
        this._title = value
        this.updateFields()
    }

    get surveyTitle(): string {
        return this._title
    }

    set introduction(value: string) {
        this._introduction = value
        this.updateFields()
    }

    get introduction(): string {
        return this._introduction
    }

    private updateFields() {
        const titleInput = this.shadowRoot?.querySelector('#survey-title') as HTMLInputElement
        const introInput = this.shadowRoot?.querySelector('#survey-introduction') as HTMLTextAreaElement

        if (titleInput && titleInput.value !== this._title) {
            titleInput.value = this._title
        }
        if (introInput && introInput.value !== this._introduction) {
            introInput.value = this._introduction
        }
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
            }

            .form-container {
                padding: 1.5rem;
                width: 100%;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            input[type="text"],
            textarea,
            select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #fff;
                border-radius: 8px;
                font-size: 1rem;
                font-family: inherit;
                transition: border-color 0.2s;
                box-sizing: border-box;
                margin-bottom: 1rem;
            }

            input[type="text"]::placeholder,
            textarea::placeholder {
                color: white;
                font-style: italic;
            }

            input[type="text"]:focus,
            textarea:focus,
            select:focus {
                outline: none;
                border-color: var(--green);
            }

            textarea {
                min-height: 100px;
                resize: vertical;
            }
        </style>

        <div class="form-container">
            <div>
                <label for="survey-title">Survey Title:</label>
                <input id="survey-title" type="text" placeholder="Enter survey title" value="${this._title}" required />
                
                <label for="survey-introduction">Introduction for correspondents:</label>
                <textarea id="survey-introduction" placeholder="Enter survey introduction">${this._introduction}</textarea>
            </div>
        </div>
        `
    }

    private attachEventListeners() {
        this.shadowRoot?.querySelector('#survey-title')?.addEventListener('input', (e) => {
            this._title = (e.target as HTMLInputElement).value
            this.dispatchEvent(new CustomEvent('title-change', {
                detail: { value: this._title },
                bubbles: true,
                composed: true
            }))
        })

        this.shadowRoot?.querySelector('#survey-introduction')?.addEventListener('input', (e) => {
            this._introduction = (e.target as HTMLTextAreaElement).value
            this.dispatchEvent(new CustomEvent('introduction-change', {
                detail: { value: this._introduction },
                bubbles: true,
                composed: true
            }))
        })
    }
}

customElements.define('survey-form-intro', SurveyFormIntro)

export { SurveyFormIntro }