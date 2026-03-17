import { typograhyStyles } from '../../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'
import { store } from '../../state/index.js'
import { Pool } from '@s3ntiment/shared'

class SurveyFormIntro extends HTMLElement {
    private _title: string = ''
    private _introduction: string = ''
    private _poolId: string = ''
    private _pools: Pool[] = []
    private unsubscribe?: () => void

    static get observedAttributes() {
        return ['survey-title', 'introduction', 'pool-id']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this._pools = store.pools
        this.render()
        this.attachEventListeners()

        this.unsubscribe = store.subscribePools((pools: Pool[]) => {
            this._pools = pools
            this.updatePoolDropdown()
        })
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        switch (name) {
            case 'survey-title':
                this._title = newValue || ''
                break
            case 'introduction':
                this._introduction = newValue || ''
                break
            case 'pool-id':
                this._poolId = newValue || ''
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

    set poolId(value: string) {
        this._poolId = value
        this.updateFields()
    }

    get poolId(): string {
        return this._poolId
    }

    private updateFields() {
        const titleInput = this.shadowRoot?.querySelector('#survey-title') as HTMLInputElement
        const introInput = this.shadowRoot?.querySelector('#survey-introduction') as HTMLTextAreaElement
        const poolSelect = this.shadowRoot?.querySelector('#survey-pool') as HTMLSelectElement

        if (titleInput && titleInput.value !== this._title) {
            titleInput.value = this._title
        }
        if (introInput && introInput.value !== this._introduction) {
            introInput.value = this._introduction
        }
        if (poolSelect && poolSelect.value !== this._poolId) {
            poolSelect.value = this._poolId
        }
    }

    private updatePoolDropdown() {
        const poolSelect = this.shadowRoot?.querySelector('#survey-pool') as HTMLSelectElement
        if (!poolSelect) return

        const current = poolSelect.value
        poolSelect.innerHTML = `
            <option value="__new">New pool</option>
            ${this._pools.map(p => `
                <option value="${p.id}" ${p.id === this._poolId ? 'selected' : ''}>${p.name}</option>
            `).join('')}
        `
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

            select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='white' fill='none'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 0.75rem center;
                cursor: pointer;
            }

            select option {
                background: #1a1a2e;
                color: white;
            }
        </style>

        <div class="form-container">
            <div>
                <label for="survey-title">Survey Title:</label>
                <input id="survey-title" type="text" placeholder="Enter survey title" value="${this._title}" required />

                <label for="survey-pool">Pool:</label>
                <select id="survey-pool">
                    <option value="__new">New pool</option>
                    ${this._pools.map(p => `
                        <option value="${p.id}" ${p.id === this._poolId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>

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

        this.shadowRoot?.querySelector('#survey-pool')?.addEventListener('change', (e) => {
            this._poolId = (e.target as HTMLSelectElement).value
            this.dispatchEvent(new CustomEvent('pool-change', {
                detail: { value: this._poolId === '__new' ? null : this._poolId },
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