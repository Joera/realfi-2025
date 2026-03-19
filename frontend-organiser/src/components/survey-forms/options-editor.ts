import { typograhyStyles } from '../../../../shared/src/assets/styles/typography-styles.js'
import { buttonStyles } from '@s3ntiment/shared/assets'

class OptionsEditor extends HTMLElement {
    private _options: string[] = []
    private _type: 'radio' | 'checkbox' | 'scored-single' = 'radio'
    private _groupIndex: number = 0
    private _questionIndex: number = 0
    private _questionId: string = ''
    private _correctAnswer: number | null = null
    private _points: number = 1

    static get observedAttributes() {
        return ['type', 'group-index', 'question-index', 'question-id']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        switch (name) {
            case 'type':
                this._type = newValue as 'radio' | 'checkbox' | 'scored-single'
                break
            case 'group-index':
                this._groupIndex = parseInt(newValue) || 0
                break
            case 'question-index':
                this._questionIndex = parseInt(newValue) || 0
                break
            case 'question-id':
                this._questionId = newValue
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

    set correctAnswer(value: number | null) {
        this._correctAnswer = value
        if (this.shadowRoot?.querySelector('.options-container')) {
            this.render()
            this.attachEventListeners()
        }
    }

    set points(value: number) {
        this._points = value
        if (this.shadowRoot?.querySelector('.options-container')) {
            this.render()
            this.attachEventListeners()
        }
    }

    private render() {
        if (!this.shadowRoot) return

        const label = this._type === 'radio'
            ? 'Options (single choice):'
            : this._type === 'scored-single'
                ? 'Options (scored single choice):'
                : 'Options (multiple choice):'

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: #3473ab;
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

            .option-item input[type="text"] {
                flex: 1;
                margin-bottom: 0;
            }

            .correct-radio {
                width: auto;
                margin: 0;
                cursor: pointer;
                accent-color: var(--green);
                flex-shrink: 0;
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

            .points-row {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-top: 1rem;
            }

            .points-row label {
                margin: 0;
                white-space: nowrap;
            }

            .points-row input {
                width: 5rem;
                margin: 0;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 1rem;
                color: var(--green);
            }

            input[type="text"],
            input[type="number"] {
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

        <div class="options-container">
            <label>${label}</label>
            ${this._options.map((opt, optIndex) => `
                <div class="option-item">
                    ${this._type === 'scored-single' ? `
                        <input
                            type="radio"
                            name="correct-${this._questionId}"
                            class="correct-radio"
                            data-correct-index="${optIndex}"
                            ${this._correctAnswer === optIndex ? 'checked' : ''}
                            title="Mark as correct answer"
                        />
                    ` : ''}
                    <input type="text" data-option-index="${optIndex}" value="${opt}" placeholder="Enter option" />
                    <button class="btn-icon" data-remove-index="${optIndex}" title="Remove option">✕</button>
                </div>
            `).join('')}

            ${this._type === 'scored-single' ? `
                <div class="points-row">
                    <label>Points:</label>
                    <input type="number" id="points-input" value="${this._points}" min="1" />
                </div>
            ` : ''}

            <button class="btn-add-option btn-secondary" id="add-option">Add Option</button>
        </div>
        `
    }

    private attachEventListeners() {
        // Option text changes
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

        // Correct answer radio
        this.shadowRoot?.querySelectorAll('.correct-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const optIndex = parseInt((e.target as HTMLInputElement).dataset.correctIndex!)
                this.dispatchEvent(new CustomEvent('correct-answer-set', {
                    detail: {
                        groupIndex: this._groupIndex,
                        questionIndex: this._questionIndex,
                        questionId: this._questionId,
                        optionIndex: optIndex
                    },
                    bubbles: true,
                    composed: true
                }))
            })
        })

        // Points
        this.shadowRoot?.querySelector('#points-input')?.addEventListener('input', (e) => {
            this.dispatchEvent(new CustomEvent('points-update', {
                detail: {
                    groupIndex: this._groupIndex,
                    questionIndex: this._questionIndex,
                    questionId: this._questionId,
                    points: parseInt((e.target as HTMLInputElement).value) || 1
                },
                bubbles: true,
                composed: true
            }))
        })
    }
}

customElements.define('options-editor', OptionsEditor)

export { OptionsEditor }