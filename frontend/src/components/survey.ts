import { defaultSurveyConfig } from "../surveys/web3-onboarding";
import { formStyles } from '../shared-form-styles.js'
import { typograhyStyles } from '../shared-typograhy-styles.js'
import { colourStyles } from '../shared-colour-styles.js'
import { buttonStyles } from '../shared-button-styles'
  
interface SurveyQuestion {
  id: string
  question: string
  type: 'radio' | 'checkbox' | 'text' | 'scale'
  options?: string[]
  scaleRange?: { min: number; max: number; minLabel: string; maxLabel: string }
  required?: boolean
}

interface SurveyAnswer {
  questionId: string
  answer: string | string[] | number
}

interface SurveyConfig {
  title: string
  description?: string
  questions: SurveyQuestion[]
}

class Survey extends HTMLElement {
  private config: SurveyConfig
  private answers: SurveyAnswer[] = []
  private currentStep = 0

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles] // formStyles have conflicts
    // Try to load config from attribute or use default
    const configAttr = this.getAttribute('config')
    this.config = configAttr ? JSON.parse(configAttr) : defaultSurveyConfig
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  get totalSteps(): number {
    return this.config.questions.length
  }

  private render() {
    if (!this.shadowRoot) return

    const currentQuestion = this.config.questions[this.currentStep]
    const savedAnswer = this.answers.find(a => a.questionId === currentQuestion.id)

    this.shadowRoot.innerHTML = `
      <style>
  

        .survey-container {
          padding: 1.5rem;
        }

        h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #000;
        }

        .description {
          margin: 0 0 2rem 0;
          color: #000;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .progress-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg,  var(--bg-darkest) 0%,  var(--bg-too-dark) 100%);
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: right;
          font-size: 0.875rem;
          color: #000;
          margin-bottom: 1rem;
        }

        .question-container {
          margin-bottom: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .question-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          margin-bottom: 1.5rem;
        }

        .required {
          color: #ef4444;
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        label {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 1rem;
          background: var(--bg-lightest);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 12px;
        }

        label:hover {
          border-color: #6366f1;
          background: #f9fafb;
        }

        input[type="radio"],
        input[type="checkbox"] {
          margin-right: 0.75rem;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        input[type="text"]:focus,
        textarea:focus {
          outline: none;
          border-color: #6366f1;
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        .scale-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .scale-options {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .scale-option {
          flex: 1;
          text-align: center;
        }

        .scale-option input[type="radio"] {
          margin: 0 0 0.5rem 0;
          width: 100%;
        }

        .scale-label {
          display: block;
          font-size: 0.875rem;
          color: #000;
        }

        .scale-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #000;
          font-weight: 500;
        }

        .completion-screen {
          text-align: center;
          padding: 2rem 0;
        }

        .completion-screen h2 {
          color: #000;
          margin-bottom: 1rem;
        }
      </style>

      <div class="survey-container">
        ${this.currentStep < this.totalSteps ? `
          <h1>${this.config.title}</h1>
          ${this.currentStep === 0 && this.config.description ? `
            <p class="description">${this.config.description}</p>
          ` : ''}

          <div class="progress-text">
            Question ${this.currentStep + 1} of ${this.totalSteps}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${((this.currentStep + 1) / this.totalSteps) * 100}%"></div>
          </div>

          <div class="question-container">
            <div class="question-text">
              ${currentQuestion.question}
              ${currentQuestion.required ? '<span class="required">*</span>' : ''}
            </div>
            
            ${this.renderQuestion(currentQuestion, savedAnswer)}
            
            <div class="error-message hidden" id="error-message"></div>
          </div>

          <div class="button-group">
            <button type="button" class="btn-secondary" id="backBtn" ${this.currentStep === 0 ? 'disabled' : ''}>
              Back
            </button>
            <button type="button" class="btn-primary" id="nextBtn">
              ${this.currentStep === this.totalSteps - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        ` : `
          <div class="completion-screen">
            <h2>Thank you for your feedback!</h2>
            <p>Your responses will help us improve the Web3 onboarding experience.</p>
          </div>
        `}
      </div>
    `
  }

  private renderQuestion(question: SurveyQuestion, savedAnswer?: SurveyAnswer): string {
    switch (question.type) {
      case 'radio':
        return `
          <div class="options-container">
            ${question.options?.map((option, index) => `
              <label>
                <input 
                  type="radio" 
                  name="${question.id}" 
                  value="${option}"
                  ${savedAnswer?.answer === option ? 'checked' : ''}
                >
                <span>${option}</span>
              </label>
            `).join('') || ''}
          </div>
        `

      case 'checkbox':
        const savedAnswers = Array.isArray(savedAnswer?.answer) ? savedAnswer.answer : []
        return `
          <div class="options-container">
            ${question.options?.map((option, index) => `
              <label>
                <input 
                  type="checkbox" 
                  name="${question.id}" 
                  value="${option}"
                  ${savedAnswers.includes(option) ? 'checked' : ''}
                >
                <span>${option}</span>
              </label>
            `).join('') || ''}
          </div>
        `

      case 'scale':
        const range = question.scaleRange!
        return `
          <div class="scale-container">
            <div class="scale-options">
              ${Array.from({ length: range.max - range.min + 1 }, (_, i) => {
                const value = range.min + i
                return `
                  <div class="scale-option">
                    <input 
                      type="radio" 
                      name="${question.id}" 
                      value="${value}"
                      id="${question.id}-${value}"
                      ${savedAnswer?.answer === value ? 'checked' : ''}
                    >
                    <label class="scale-label" for="${question.id}-${value}">${value}</label>
                  </div>
                `
              }).join('')}
            </div>
            <div class="scale-labels">
              <span>${range.minLabel}</span>
              <span>${range.maxLabel}</span>
            </div>
          </div>
        `

      case 'text':
        return `
          <textarea 
            name="${question.id}" 
            placeholder="Share your thoughts..."
          >${savedAnswer?.answer || ''}</textarea>
        `

      default:
        return ''
    }
  }

  private attachEventListeners() {
    const nextBtn = this.shadowRoot?.getElementById('nextBtn')
    const backBtn = this.shadowRoot?.getElementById('backBtn')

    nextBtn?.addEventListener('click', () => this.handleNext())
    backBtn?.addEventListener('click', () => this.handleBack())
  }

  private handleNext() {
    const currentQuestion = this.config.questions[this.currentStep]
    const answer = this.collectAnswer(currentQuestion)

    if (currentQuestion.required && !this.isAnswerValid(answer)) {
      this.showError('This question is required')
      return
    }

    // Save answer
    const existingIndex = this.answers.findIndex(a => a.questionId === currentQuestion.id)
    if (existingIndex >= 0) {
      this.answers[existingIndex] = { questionId: currentQuestion.id, answer }
    } else {
      this.answers.push({ questionId: currentQuestion.id, answer })
    }

    // Move to next or complete
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++
      this.render()
      this.attachEventListeners()
    } else {
      this.complete()
    }
  }

  private handleBack() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.render()
      this.attachEventListeners()
    }
  }

  private collectAnswer(question: SurveyQuestion): string | string[] | number {
    const container = this.shadowRoot?.querySelector('.question-container')
    
    switch (question.type) {
      case 'radio':
      case 'scale':
        const radio = container?.querySelector(`input[name="${question.id}"]:checked`) as HTMLInputElement
        return question.type === 'scale' ? Number(radio?.value) : (radio?.value || '')

      case 'checkbox':
        const checkboxes = container?.querySelectorAll(`input[name="${question.id}"]:checked`) as NodeListOf<HTMLInputElement>
        return Array.from(checkboxes).map(cb => cb.value)

      case 'text':
        const textarea = container?.querySelector(`textarea[name="${question.id}"]`) as HTMLTextAreaElement
        return textarea?.value.trim() || ''

      default:
        return ''
    }
  }

  private isAnswerValid(answer: string | string[] | number): boolean {
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    return answer !== '' && answer !== null && answer !== undefined
  }

  private showError(message: string) {
    const errorDiv = this.shadowRoot?.getElementById('error-message')
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.classList.remove('hidden')
    }
  }

  private complete() {
    this.currentStep = this.totalSteps
    this.render()

    // Dispatch custom event with survey results
    const event = new CustomEvent('survey-complete', {
      detail: {
        answers: this.answers,
        timestamp: new Date().toISOString()
      },
      bubbles: true,
      composed: true
    })
    this.dispatchEvent(event)
  }

  // Public methods
  public getAnswers(): SurveyAnswer[] {
    return this.answers
  }

  public setConfig(config: SurveyConfig): void {
    this.config = config
    this.currentStep = 0
    this.answers = []
    this.render()
    this.attachEventListeners()
  }
}

customElements.define('survey-questions', Survey)

export { Survey }

export type { SurveyConfig, SurveyQuestion, SurveyAnswer }