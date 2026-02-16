import { typograhyStyles } from '../../styles/shared-typograhy-styles.js'
import { colourStyles } from '../../styles/shared-colour-styles.js'
import { buttonStyles } from '../../styles/shared-button-styles.js'
import type { Question } from '../../types.js'
import './scale-config.js'
import './options-editor.js'

class QuestionCard extends HTMLElement {
    private _question: Question | null = null
    private _groupIndex: number = 0
    private _questionIndex: number = 0
    private _isDragEnabled: boolean = false

    static get observedAttributes() {
        return ['group-index', 'question-index']
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
            case 'group-index':
                this._groupIndex = parseInt(newValue) || 0
                break
            case 'question-index':
                this._questionIndex = parseInt(newValue) || 0
                break
        }
        // Update the displayed number when index changes
        const numberEl = this.shadowRoot?.querySelector('.question-number')
        if (numberEl) {
            numberEl.textContent = String(this._questionIndex + 1)
        }
    }

    set question(value: Question) {
        this._question = value
        if (this.isConnected) {
            this.render()
            this.attachEventListeners()
        }
    }

    get question(): Question | null {
        return this._question
    }

    private render() {
        if (!this.shadowRoot || !this._question) return

        const q = this._question

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
                margin-bottom: 1.5rem;
            }

            :host(.dragging) {
                opacity: 0.5;
            }

            .question-card {
                display: flex;
                gap: 0.5rem;
            }

            .question-left {
                display: flex;
                align-items: flex-start;
                gap: 0.25rem;
                padding-top: 0.25rem;
            }

            .drag-handle {
                cursor: grab;
                color: var(--green);
                background: transparent;
                border: none;
                font-size: 1.25rem;
                padding: 0.25rem;
                width: 1.5rem;
                height: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
                flex-shrink: 0;
            }

            .drag-handle:hover {
                background: rgba(42, 112, 98, 0.1);
                border-radius: 4px;
            }

            .drag-handle:active {
                cursor: grabbing;
            }

            .question-number {
                font-weight: 600;
                color: var(--green);
                font-size: 1.25rem;
                min-width: 1.5rem;
                text-align: right;
            }

            .question-content {
                flex: 1;
            }

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                border-left: 3px solid var(--green);
                padding: 0 0.75rem;
                gap: 1rem;
            }

            .question-title-input {
                flex: 1;
                font-size: 1rem;
                font-weight: 500;
                border: 1px solid transparent;
                background: transparent;
                padding: 0.5rem;
                border-radius: 6px;
                margin: 0;
            }

            .question-title-input:hover,
            .question-title-input:focus {
                border-color: #d1d5db;
                background: white;
            }

            .question-title-input::placeholder {
                color: white;
                font-style: italic;
                font-weight: normal;
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

            .question-body {
                padding: 0 0.75rem;
            }

            .checkbox-group {
                margin: 1rem 0 0 0;
            }

            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--green);
            }

            .checkbox-group input[type="checkbox"] {
                width: auto;
                margin: 0;
            }
        </style>

        <div class="question-card">
            <div class="question-left">
                <button class="drag-handle" title="Drag to reorder">⠿</button>
                <span class="question-number">${this._questionIndex + 1}</span>
            </div>
            <div class="question-content">
                <div class="question-header">
                    <input 
                        type="text" 
                        class="question-title-input" 
                        id="question-text"
                        value="${q.question}" 
                        placeholder="Enter question" 
                    />
                    <button class="btn-icon" id="remove-question" title="Remove question">✕</button>
                </div>

                <div class="question-body">
                    ${q.type === 'scale' ? `
                        <scale-config
                            min="${q.scaleRange?.min || 1}"
                            max="${q.scaleRange?.max || 10}"
                            min-label="${q.scaleRange?.minLabel || ''}"
                            max-label="${q.scaleRange?.maxLabel || ''}"
                            group-index="${this._groupIndex}"
                            question-index="${this._questionIndex}"
                        ></scale-config>
                    ` : ''}

                    ${q.type === 'radio' || q.type === 'checkbox' ? `
                        <options-editor
                            type="${q.type}"
                            group-index="${this._groupIndex}"
                            question-index="${this._questionIndex}"
                        ></options-editor>
                    ` : ''}

                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="required-checkbox" ${q.required ? 'checked' : ''} />
                            Required question
                        </label>
                    </div>
                </div>
            </div>
        </div>
        `

        // Set options via property after render
        if (q.type === 'radio' || q.type === 'checkbox') {
            const optionsEditor = this.shadowRoot.querySelector('options-editor') as any
            if (optionsEditor) {
                optionsEditor.options = q.options || []
            }
        }
    }

    private attachEventListeners() {
        // Question text
        this.shadowRoot?.querySelector('#question-text')?.addEventListener('input', (e) => {
            this.dispatchEvent(new CustomEvent('question-update', {
                detail: {
                    groupIndex: this._groupIndex,
                    questionIndex: this._questionIndex,
                    field: 'question',
                    value: (e.target as HTMLInputElement).value
                },
                bubbles: true,
                composed: true
            }))
        })

        // Required checkbox
        this.shadowRoot?.querySelector('#required-checkbox')?.addEventListener('change', (e) => {
            this.dispatchEvent(new CustomEvent('question-update', {
                detail: {
                    groupIndex: this._groupIndex,
                    questionIndex: this._questionIndex,
                    field: 'required',
                    value: (e.target as HTMLInputElement).checked
                },
                bubbles: true,
                composed: true
            }))
        })

        // Remove question
        this.shadowRoot?.querySelector('#remove-question')?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('question-remove', {
                detail: {
                    groupIndex: this._groupIndex,
                    questionIndex: this._questionIndex
                },
                bubbles: true,
                composed: true
            }))
        })

        // Drag handle - drag the inner card element
        const handle = this.shadowRoot?.querySelector('.drag-handle')
        const card = this.shadowRoot?.querySelector('.question-card') as HTMLElement

        const onMouseUp = () => {
            this._isDragEnabled = false
            card?.removeAttribute('draggable')
            document.removeEventListener('mouseup', onMouseUp)
        }

        handle?.addEventListener('mousedown', (e) => {
            // Don't call preventDefault - it blocks native drag!
            e.stopPropagation()
            console.log('drag handle mousedown')
            this._isDragEnabled = true
            card?.setAttribute('draggable', 'true')
            document.addEventListener('mouseup', onMouseUp)
        })

        card?.addEventListener('dragstart', (e) => {
            console.log('card dragstart fired, isDragEnabled:', this._isDragEnabled)
            if (!this._isDragEnabled) {
                e.preventDefault()
                return
            }
            e.dataTransfer?.setData('text/plain', JSON.stringify({
                groupIndex: this._groupIndex,
                questionIndex: this._questionIndex
            }))
            e.dataTransfer!.effectAllowed = 'move'
            console.log('drag data set')
            setTimeout(() => {
                this.classList.add('dragging')
            }, 0)
        })

        card?.addEventListener('dragend', () => {
            console.log('dragend')
            this.classList.remove('dragging')
            this._isDragEnabled = false
            card?.removeAttribute('draggable')
            document.removeEventListener('mouseup', onMouseUp)
        })
    }
}

customElements.define('question-card', QuestionCard)

export { QuestionCard }