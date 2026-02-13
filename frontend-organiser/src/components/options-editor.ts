import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'

class OptionsEditor extends HTMLElement {
    private _options: string[] = []
    private _type: 'radio' | 'checkbox' = 'radio'
    private _groupIndex: number = 0
    private _questionIndex: number = 0

    static get observedAttributes() {
        return ['type', 'group-index', 'question-index']
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
            case 'type':
                this._type = newValue as 'radio' | 'checkbox'
                break
            case 'group-index':
                this._groupIndex = parseInt(newValue) || 0
                break
            case 'question-index':
                this._questionIndex = parseInt(newValue) || 0
                break
        }
        if (this.shadowRoot?.querySelector('.options-container')) {
            this.render()
            this.attachEventListeners()
        }
    }

    set options(value: string[]) {
        this._options = value
        if (this.shadowRoot?.querySelector('.options-container')) {
            this.render()
            this.attachEventListeners()
        }
    }

    get options(): string[] {
        return this._options
    }

    private render() {
        if (!this.shadowRoot) return

        const label = this._type === 'radio' 
            ? 'Options (single choice):' 
            : 'Options (multiple choice):'

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
            }

            .options-container {
                margin: 1.5rem 0;
            }

            .option-item {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                align-items: center;
            }

            .option-item input {
                flex: 1;
                margin-bottom: 0;
            }

            .btn-icon {
                color: var(--green);
                cursor: pointer;
                background: transparent;
                border: none;
                width: 2rem;
                height: 2rem;
                font-size: 1.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .btn-add-option {
                margin-top: 1.5rem;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 1rem;
                color: var(--green);
            }

            input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid white;
                border-radius: 6px;
                margin-bottom: 0.75rem;
                font-size: 1rem;
            }

            input:focus {
                outline: none;
                border-color: var(--green);
            }
        </style>

        <div class="options-container">
            <label>${label}</label>
            ${this._options.map((opt, optIndex) => `
                <div class="option-item">
                    <input type="text" data-option-index="${optIndex}" value="${opt}" placeholder="Enter option" />
                    <button class="btn-icon" data-remove-index="${optIndex}" title="Remove option">✕</button>
                </div>
            `).join('')}
            <button class="btn-add-option btn-secondary" id="add-option">Add Option</button>
        </div>
        `
    }

    private attachEventListeners() {
        // Option input changes
        this.shadowRoot?.querySelectorAll('[data-option-index]').forEach(input => {
            input.addEventListener('input', (e) => {
                const optIndex = parseInt((e.target as HTMLInputElement).dataset.optionIndex!)
                const value = (e.target as HTMLInputElement).value

                this.dispatchEvent(new CustomEvent('option-update', {
                    detail: {
                        groupIndex: this._groupIndex,
                        questionIndex: this._questionIndex,
                        optionIndex: optIndex,
                        value
                    },
                    bubbles: true,
                    composed: true
                }))
            })
        })

        // Remove option
        this.shadowRoot?.querySelectorAll('[data-remove-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const optIndex = parseInt((e.target as HTMLElement).dataset.removeIndex!)

                this.dispatchEvent(new CustomEvent('option-remove', {
                    detail: {
                        groupIndex: this._groupIndex,
                        questionIndex: this._questionIndex,
                        optionIndex: optIndex
                    },
                    bubbles: true,
                    composed: true
                }))
            })
        })

        // Add option
        this.shadowRoot?.querySelector('#add-option')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('option-add', {
                detail: {
                    groupIndex: this._groupIndex,
                    questionIndex: this._questionIndex
                },
                bubbles: true,
                composed: true
            }))
        })
    }
}

customElements.define('options-editor', OptionsEditor)

export { OptionsEditor }