import { typograhyStyles } from '../../../../shared/src/assets/styles/typography-styles.js'
import { breakpoints, buttonStyles } from '@s3ntiment/shared/assets'

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
                margin-left: -2.25rem;

                @media (min-width: ${breakpoints.lg}) {
                    margin-left: 0rem;
                }
            }

            .options-container {
                margin: 1.5rem 0;
            }

            .option-item {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                align-items: flex-start; /* Changed from center for textarea alignment */
            }

            .correct-radio {
                width: auto;
                margin: 0;
                margin-top: 0.75rem; /* Align with textarea text */
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
                margin-top: 0.25rem; /* Align with textarea text */
                flex-shrink: 0;
            }

            .points-row {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .points-row label {
                margin: 0;
                white-space: nowrap;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 1rem;
                color: var(--green);
                margin-left: 2rem;

                @media (min-width: ${breakpoints.lg}) {
                    margin-left: 0; 
                }
            }

            /* Shared input/textarea styles */
            input[type="text"],
            input[type="number"],
            textarea.option-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid white;
                border-radius: 6px;
                font-size: 1rem;
                font-family: inherit;
                background: transparent;
                color: inherit;
                background: white;
            }

            /* Textarea-specific: auto-grow behavior */
            textarea.option-input {
                flex: 1;
                line-height: 1.4;
                resize: none;
                overflow: hidden;
                field-sizing: content; /* Modern browsers: auto-grow */
                margin-bottom: 0;
                box-sizing: border-box;
            }

            input::placeholder,
            textarea::placeholder {
                color: white;
                font-style: italic;
            }

            input:focus,
            textarea:focus {
                outline: none;
                border-color: var(--green);
            }

            .points-row input {
                width: 3rem;
                margin: 0;
            }

            .actions {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 1rem;
                margin-top: 1.5rem;
                margin-left: 1.5rem;
                margin-right: 3.5rem;
                justify-content: space-between;
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
                    <textarea 
                        class="option-input"
                        rows="1"
                        data-option-index="${optIndex}" 
                        placeholder="Enter option"
                    >${this.escapeHtml(opt)}</textarea>
                    <button class="btn-icon" data-remove-index="${optIndex}" title="Remove option">✕</button>
                </div>
            `).join('')}

            <div class="actions">
                <button class="btn-add-option btn-secondary" id="add-option">Add Option</button>
                ${this._type === 'scored-single' ? `
                <div class="points-row">
                    <label>Points:</label>
                    <input type="number" id="points-input" value="${this._points}" min="1" />
                </div>
            ` : ''}
            </div>
        </div>
        `
    }

    /** Escape HTML to prevent XSS when inserting option text into textarea */
    private escapeHtml(text: string): string {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    /** Auto-resize textarea to fit content */
    private autoResizeTextarea(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    private attachEventListeners() {
        // Option text changes (now textareas)
        this.shadowRoot?.querySelectorAll('textarea[data-option-index]').forEach(ta => {
            const textarea = ta as HTMLTextAreaElement
            
            // Initial auto-resize
            this.autoResizeTextarea(textarea)

            textarea.addEventListener('input', (e) => {
                const target = e.target as HTMLTextAreaElement
                
                // Auto-resize on input (fallback for browsers without field-sizing)
                this.autoResizeTextarea(target)

                const optIndex = parseInt(target.dataset.optionIndex!)
                const value = target.value

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

            // Prevent Enter from creating newlines (optional: treat as "move to next")
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    // Optionally: focus next option or add new option
                    const nextItem = textarea.closest('.option-item')?.nextElementSibling
                    const nextTextarea = nextItem?.querySelector('textarea') as HTMLTextAreaElement | null
                    if (nextTextarea) {
                        nextTextarea.focus()
                    } else {
                        // No next option — could trigger add
                        this.shadowRoot?.querySelector<HTMLButtonElement>('#add-option')?.click()
                    }
                }
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