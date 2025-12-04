import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'

class SurveyConfigForm extends HTMLElement {
    private questions: any[] = []

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            .form-container {
                padding: 1.5rem;
                max-width: 800px;
            }

            h1 {
                margin: 0 0 0.5rem 0;
                font-size: 1.75rem;
                font-weight: 700;
            }

            h2 {
                margin: 2rem 0 1rem 0;
                font-size: 1.25rem;
                font-weight: 600;
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

            input[type="text"]:focus,
            textarea:focus,
            select:focus {
                outline: none;
                border-color: #6366f1;
            }

            textarea {
                min-height: 100px;
                resize: vertical;
            }

            .question-card {
    
                margin-bottom: 1.5rem;
         
            }

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .question-number {
                font-weight: 600;
                color: #6366f1;
            }

            .btn-remove {
                background: #ef4444;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                flex-grow: 0;
            }

            .btn-remove:hover {
                background: #dc2626;
            }

            .options-container {
                margin-top: 1rem;
            }

            .option-item {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .option-item input {
                flex: 1;
                margin-bottom: 0;
            }

            .option-item button {
                background: #6b7280;
                color: white;
                border: none;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                cursor: pointer;
                flex-grow: 0;
            }

            .btn-add-option {
                background: #6366f1;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 0.5rem;
            }

            .scale-config {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 1rem;
            }

            .checkbox-group {
                margin: 1rem 0;
            }

            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .checkbox-group input[type="checkbox"] {
                width: auto;
                margin: 0;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .json-output {
                background: #1f2937;
                color: #f9fafb;
                padding: 1.5rem;
                border-radius: 8px;
                margin-top: 2rem;
                overflow-x: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.875rem;
                white-space: pre-wrap;
                word-break: break-all;
            }
        </style>

        <div class="form-container">
            <h1>Survey Config Builder</h1>
            
            <div>
                <label for="survey-title">Survey Title:</label>
                <input id="survey-title" type="text" placeholder="Enter survey title" required />
                
                <label for="survey-description">Description:</label>
                <textarea id="survey-description" placeholder="Enter survey description"></textarea>

                <label>
                    <input id="multisig" type="checkbox" />
                    Create a multisig that owns the survey collectively
                </label>
            </div>

            <h2>Questions</h2>
            <div id="questions-container"></div>

            <button class="btn-primary" id="add-question">Add Question</button>

            <div class="form-actions">
                <button class="btn-primary" id="create-survey">Create survey</button>
            </div>

            <div id="json-output" class="json-output" style="display: none;"></div>
        </div>
        `
    }

    private attachEventListeners() {
        const addQuestionBtn = this.shadowRoot?.querySelector('#add-question')
        addQuestionBtn?.addEventListener('click', () => this.addQuestion())

        const downloadBtn = this.shadowRoot?.querySelector('#create-survey')
        downloadBtn?.addEventListener('click', () => this.generateJSON())
    }

    private addQuestion() {
        const question = {
            id: `question_${Date.now()}`,
            question: '',
            type: 'radio',
            options: [''],
            required: true
        }
        this.questions.push(question)
        this.renderQuestions()
    }

    private removeQuestion(index: number) {
        this.questions.splice(index, 1)
        this.renderQuestions()
    }

    private addOption(questionIndex: number) {
        this.questions[questionIndex].options.push('')
        this.renderQuestions()
    }

    private removeOption(questionIndex: number, optionIndex: number) {
        this.questions[questionIndex].options.splice(optionIndex, 1)
        this.renderQuestions()
    }

    private renderQuestions() {
        const container = this.shadowRoot?.querySelector('#questions-container')
        if (!container) return

        container.innerHTML = this.questions.map((q, qIndex) => `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-number">Question ${qIndex + 1}</span>
                    <button class="btn-remove" data-remove-question="${qIndex}">Remove</button>
                </div>

                <label>Question ID:</label>
                <input type="text" data-question-id="${qIndex}" value="${q.id}" placeholder="question_id" />

                <label>Question Text:</label>
                <input type="text" data-question-text="${qIndex}" value="${q.question}" placeholder="Enter question" />

                <label>Question Type:</label>
                <select data-question-type="${qIndex}">
                    <option value="radio" ${q.type === 'radio' ? 'selected' : ''}>Radio (Single Choice)</option>
                    <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>Checkbox (Multiple Choice)</option>
                    <option value="scale" ${q.type === 'scale' ? 'selected' : ''}>Scale</option>
                    <option value="text" ${q.type === 'text' ? 'selected' : ''}>Text Input</option>
                </select>

                ${q.type === 'scale' ? `
                    <div class="scale-config">
                        <div>
                            <label>Min Value:</label>
                            <input type="number" data-scale-min="${qIndex}" value="${q.scaleRange?.min || 1}" />
                            <label>Min Label:</label>
                            <input type="text" data-scale-min-label="${qIndex}" value="${q.scaleRange?.minLabel || ''}" placeholder="e.g., not important" />
                        </div>
                        <div>
                            <label>Max Value:</label>
                            <input type="number" data-scale-max="${qIndex}" value="${q.scaleRange?.max || 10}" />
                            <label>Max Label:</label>
                            <input type="text" data-scale-max-label="${qIndex}" value="${q.scaleRange?.maxLabel || ''}" placeholder="e.g., very important" />
                        </div>
                    </div>
                ` : ''}

                ${q.type === 'radio' || q.type === 'checkbox' ? `
                    <div class="options-container">
                        <label>Options:</label>
                        ${q.options.map((opt: string, optIndex: number) => `
                            <div class="option-item">
                                <input type="text" data-option="${qIndex}-${optIndex}" value="${opt}" placeholder="Enter option" />
                                <button data-remove-option="${qIndex}-${optIndex}">×</button>
                            </div>
                        `).join('')}
                        <button class="btn-add-option" data-add-option="${qIndex}">Add Option</button>
                    </div>
                ` : ''}

                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" data-required="${qIndex}" ${q.required ? 'checked' : ''} />
                        Required question
                    </label>
                </div>
            </div>
        `).join('')

        this.attachQuestionEventListeners()
    }

    private attachQuestionEventListeners() {
        // Remove question
        this.shadowRoot?.querySelectorAll('[data-remove-question]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.removeQuestion!)
                this.removeQuestion(index)
            })
        })

        // Update question fields
        this.shadowRoot?.querySelectorAll('[data-question-id]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.questionId!)
                this.questions[index].id = (e.target as HTMLInputElement).value
            })
        })

        this.shadowRoot?.querySelectorAll('[data-question-text]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.questionText!)
                this.questions[index].question = (e.target as HTMLInputElement).value
            })
        })

        this.shadowRoot?.querySelectorAll('[data-question-type]').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt((e.target as HTMLSelectElement).dataset.questionType!)
                const newType = (e.target as HTMLSelectElement).value
                this.questions[index].type = newType
                
                if (newType === 'scale') {
                    this.questions[index].scaleRange = { min: 1, max: 10, minLabel: '', maxLabel: '' }
                    delete this.questions[index].options
                } else if (newType === 'text') {
                    delete this.questions[index].options
                    delete this.questions[index].scaleRange
                } else {
                    this.questions[index].options = ['']
                    delete this.questions[index].scaleRange
                }
                
                this.renderQuestions()
            })
        })

        // Scale inputs
        this.shadowRoot?.querySelectorAll('[data-scale-min]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.scaleMin!)
                if (!this.questions[index].scaleRange) this.questions[index].scaleRange = {}
                this.questions[index].scaleRange.min = parseInt((e.target as HTMLInputElement).value)
            })
        })

        this.shadowRoot?.querySelectorAll('[data-scale-max]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.scaleMax!)
                if (!this.questions[index].scaleRange) this.questions[index].scaleRange = {}
                this.questions[index].scaleRange.max = parseInt((e.target as HTMLInputElement).value)
            })
        })

        this.shadowRoot?.querySelectorAll('[data-scale-min-label]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.scaleMinLabel!)
                if (!this.questions[index].scaleRange) this.questions[index].scaleRange = {}
                this.questions[index].scaleRange.minLabel = (e.target as HTMLInputElement).value
            })
        })

        this.shadowRoot?.querySelectorAll('[data-scale-max-label]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.scaleMaxLabel!)
                if (!this.questions[index].scaleRange) this.questions[index].scaleRange = {}
                this.questions[index].scaleRange.maxLabel = (e.target as HTMLInputElement).value
            })
        })

        // Options
        this.shadowRoot?.querySelectorAll('[data-option]').forEach(input => {
            input.addEventListener('input', (e) => {
                const [qIndex, optIndex] = (e.target as HTMLInputElement).dataset.option!.split('-').map(Number)
                this.questions[qIndex].options[optIndex] = (e.target as HTMLInputElement).value
            })
        })

        this.shadowRoot?.querySelectorAll('[data-add-option]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.addOption!)
                this.addOption(index)
            })
        })

        this.shadowRoot?.querySelectorAll('[data-remove-option]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [qIndex, optIndex] = (e.target as HTMLElement).dataset.removeOption!.split('-').map(Number)
                this.removeOption(qIndex, optIndex)
            })
        })

        // Required checkbox
        this.shadowRoot?.querySelectorAll('[data-required]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt((e.target as HTMLInputElement).dataset.required!)
                this.questions[index].required = (e.target as HTMLInputElement).checked
            })
        })
    }

    private generateJSON() {
        const title = (this.shadowRoot?.querySelector('#survey-title') as HTMLInputElement)?.value
        const description = (this.shadowRoot?.querySelector('#survey-description') as HTMLTextAreaElement)?.value
        const multisig = (this.shadowRoot?.querySelector('#multisig') as HTMLTextAreaElement)?.value

        const config = {
            title,
            description,
            multisig,
            questions: this.questions
        }

        const jsonOutput = this.shadowRoot?.querySelector('#json-output') as HTMLElement
        if (jsonOutput) {
            jsonOutput.textContent = JSON.stringify(config, null, 2)
            jsonOutput.style.display = 'block'
        }

        this.dispatchEvent(new CustomEvent('survey-config-generated', {
            detail: { config },
            bubbles: true,
            composed: true
        }))
    }
}

customElements.define('survey-config-form', SurveyConfigForm)

export { SurveyConfigForm }