import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'

class ScaleConfig extends HTMLElement {
    private _min: number = 1
    private _max: number = 10
    private _minLabel: string = ''
    private _maxLabel: string = ''
    private _groupIndex: number = 0
    private _questionIndex: number = 0

    static get observedAttributes() {
        return ['min', 'max', 'min-label', 'max-label', 'group-index', 'question-index']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        switch (name) {
            case 'min':
                this._min = parseInt(newValue) || 1
                break
            case 'max':
                this._max = parseInt(newValue) || 10
                break
            case 'min-label':
                this._minLabel = newValue || ''
                break
            case 'max-label':
                this._maxLabel = newValue || ''
                break
            case 'group-index':
                this._groupIndex = parseInt(newValue) || 0
                break
            case 'question-index':
                this._questionIndex = parseInt(newValue) || 0
                break
        }
        if (this.shadowRoot?.querySelector('.scale-config')) {
            this.render()
            this.attachEventListeners()
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

            .scale-config {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 3rem;
                margin-top: 0.5rem;
            }

            .scale-config input {
                width: 100%;
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

            input::placeholder {
                color: white;
                font-style: italic;
            }

            input:focus {
                outline: none;
                border-color: var(--green);
            }
        </style>

        <div class="scale-config">
            <div>
                <label>Min Value:</label>
                <input type="number" data-field="min" value="${this._min}" />
                <label>Min Label:</label>
                <input type="text" data-field="minLabel" value="${this._minLabel}" placeholder="e.g., not important" />
            </div>
            <div>
                <label>Max Value:</label>
                <input type="number" data-field="max" value="${this._max}" />
                <label>Max Label:</label>
                <input type="text" data-field="maxLabel" value="${this._maxLabel}" placeholder="e.g., very important" />
            </div>
        </div>
        `
    }

    private attachEventListeners() {
        this.shadowRoot?.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const field = (e.target as HTMLInputElement).dataset.field!
                const value = field === 'min' || field === 'max' 
                    ? parseInt((e.target as HTMLInputElement).value)
                    : (e.target as HTMLInputElement).value

                this.dispatchEvent(new CustomEvent('scale-update', {
                    detail: {
                        groupIndex: this._groupIndex,
                        questionIndex: this._questionIndex,
                        field: `scaleRange.${field}`,
                        value
                    },
                    bubbles: true,
                    composed: true
                }))
            })
        })
    }
}

customElements.define('scale-config', ScaleConfig)

export { ScaleConfig }