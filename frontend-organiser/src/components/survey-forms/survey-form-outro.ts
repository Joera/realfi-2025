import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'

class SurveyFormOutro extends HTMLElement {
    private _batchName: string = ''
    private _batchSize: string = ''

    static get observedAttributes() {
        return ['batch-name', 'batch-size']
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
            case 'batch-name':
                this._batchName = newValue || ''
                break
            case 'batch-size':
                this._batchSize = newValue || ''
                break
        }
        this.updateFields()
    }

    set batchName(value: string) {
        this._batchName = value
        this.updateFields()
    }

    get batchName(): string {
        return this._batchName
    }

    set batchSize(value: string) {
        this._batchSize = value
        this.updateFields()
    }

    get batchSize(): string {
        return this._batchSize
    }

    private updateFields() {
        const nameInput = this.shadowRoot?.querySelector('#batch-name') as HTMLInputElement
        const sizeInput = this.shadowRoot?.querySelector('#batch-size') as HTMLInputElement

        if (nameInput && nameInput.value !== this._batchName) {
            nameInput.value = this._batchName
        }
        if (sizeInput && sizeInput.value !== this._batchSize) {
            sizeInput.value = this._batchSize
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

            input[type="text"]::placeholder {
                color: white;
                font-style: italic;
            }

            input[type="text"]:focus,
            textarea:focus,
            select:focus {
                outline: none;
                border-color: var(--green);
            }
        </style>

        <div class="form-container">
            <div>
                <label for="batch-name">Batch name:</label>
                <input id="batch-name" type="text" placeholder="Enter a name for the batch" value="${this._batchName}" required />
                
                <label for="batch-size">Nr of invitations:</label>
                <input id="batch-size" type="text" placeholder="Enter number of invitations" value="${this._batchSize}" required />
            </div>
        </div>
        `
    }

    private attachEventListeners() {
        this.shadowRoot?.querySelector('#batch-name')?.addEventListener('input', (e) => {
            this._batchName = (e.target as HTMLInputElement).value
            this.dispatchEvent(new CustomEvent('batch-name-change', {
                detail: { value: this._batchName },
                bubbles: true,
                composed: true
            }))
        })

        this.shadowRoot?.querySelector('#batch-size')?.addEventListener('input', (e) => {
            this._batchSize = (e.target as HTMLInputElement).value
            this.dispatchEvent(new CustomEvent('batch-size-change', {
                detail: { value: this._batchSize },
                bubbles: true,
                composed: true
            }))
        })
    }

    validate(): string[] {
        const errors: string[] = []
        
        if (!this._batchName.trim()) {
            errors.push('Batch name is required')
        }
        
        if (!this._batchSize.trim()) {
            errors.push('Number of invitations is required')
        } else if (isNaN(parseInt(this._batchSize)) || parseInt(this._batchSize) <= 0) {
            errors.push('Number of invitations must be a positive number')
        }
        
        return errors
    }
}

customElements.define('survey-form-outro', SurveyFormOutro)

export { SurveyFormOutro }