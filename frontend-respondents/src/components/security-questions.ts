import { formStyles } from '../shared-form-styles.js'
import { typograhyStyles } from '../shared-typograhy-styles.js';
import { colourStyles } from '../shared-colour-styles.js';
import { buttonStyles } from '../shared-button-styles.js';


// security-questions.ts
interface SecurityQuestion {
  id: string
  label: string
  type: 'text' | 'password'
  placeholder?: string
}

interface SelectedAnswer {
  questionId: string
  answer: string
}

class SecurityQuestionsForm extends HTMLElement {
  private availableQuestions: SecurityQuestion[] = [
    // { id: 'name', label: 'Your name', type: 'text', placeholder: 'John Doe' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a strong password' },
    { id: 'pet', label: "First pet's name", type: 'text', placeholder: 'Fluffy' },

    { id: 'song', label: "Most overplayed song ever", type: 'text', placeholder: 'Its raining men' },
    { id: 'crush', label: "High school crush", type: 'text', placeholder: 'Lisanne' },
    { id: 'idol', label: "Teenage idol", type: 'text', placeholder: 'Billy Idol' },
    { id: 'tv', label: "Secret pleasure TV show", type: 'text', placeholder: 'Love boat' },

    { id: 'vacation', label: 'Favorite vacation destination', type: 'text', placeholder: 'Bali' },
    { id: 'book', label: 'Favorite childhood book', type: 'text', placeholder: 'Harry Potter' },
    { id: 'car', label: 'First car model', type: 'text', placeholder: 'Toyota Corolla' }
  ]

  private selectedAnswers: SelectedAnswer[] = []
  private currentStep = 0
  private readonly totalSteps = 1

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [colourStyles, formStyles, typograhyStyles, buttonStyles]
  }

  connectedCallback() {
    this.loadSavedQuestions();
    this.render()
    this.attachEventListeners()
  }

  private loadSavedQuestions() {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
      const questionIds = JSON.parse(savedQuestions) as string[];
      console.log('Pre-loading saved questions:', questionIds);
      // You could use this to pre-select questions or show which ones were used
    }
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: calc(100% - 3rem);
          max-width: 500px;
          margin: 0 auto;
        }

        

        .progress-indicator {
            text-align: right;
            margin-bottom: 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--bg-too-dark)
        }

        .step {
          margin-bottom: 2rem;
        }

        .step.hidden {
          display: none;
        }

        #input-group-0 input {
            margin-bottom: 0;
        }

      </style>
      <div>
        <!-- <div class="progress-indicator">
        //   <span id="progress">${this.currentStep + 1}/${this.totalSteps}</span>
        // </div> -->

        <form id="securityForm">
          ${this.renderSteps()}
          
          <div class="button-group">
            <button type="button" class="btn-secondary" id="backBtn" ${this.currentStep === 0 ? 'disabled' : ''}>
              Back
            </button>
            <button type="button" class="btn-primary" id="nextBtn">
              ${this.currentStep === this.totalSteps - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    `
  }

  private renderSteps(): string {
    return Array.from({ length: this.totalSteps }, (_, index) => `
      <div class="step ${index !== this.currentStep ? 'hidden' : ''}" data-step="${index}">
   <!--     <label for="question-select-${index}">
          Security Question ${index + 1}
        </label> -->
        <select 
          id="question-select-${index}" 
          name="question-${index}"
          required
          aria-label="Select security question ${index + 1}"
        >
          <option value="">Choose a question...</option>
          ${this.getAvailableQuestionsForStep(index).map(q => `
            <option value="${q.id}">${q.label}</option>
          `).join('')}
        </select>

        <div class="input-group hidden" id="input-group-${index}">
          <label for="answer-${index}">Your Answer</label>
          <input
            type="text"
            id="answer-${index}"
            name="answer-${index}"
            required
            aria-label="Answer to security question ${index + 1}"
            autocomplete="off"
          />
          <div class="error-message hidden" id="error-${index}"></div>
        </div>
      </div>
    `).join('')
  }

  private getAvailableQuestionsForStep(step: number): SecurityQuestion[] {
    const selectedIds = this.selectedAnswers.map(a => a.questionId)
    return this.availableQuestions.filter(q => !selectedIds.includes(q.id))
  }

  private attachEventListeners() {
    const form = this.shadowRoot?.getElementById('securityForm')
    const nextBtn = this.shadowRoot?.getElementById('nextBtn')
    const backBtn = this.shadowRoot?.getElementById('backBtn')

    // Question select change handlers
    for (let i = 0; i < this.totalSteps; i++) {
      const select = this.shadowRoot?.getElementById(`question-select-${i}`) as HTMLSelectElement
      const inputGroup = this.shadowRoot?.getElementById(`input-group-${i}`)
      const answerInput = this.shadowRoot?.getElementById(`answer-${i}`) as HTMLInputElement

      select?.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement
        const selectedQuestion = this.availableQuestions.find(q => q.id === target.value)
        
        if (selectedQuestion) {
          inputGroup?.classList.remove('hidden')
          if (answerInput) {
            answerInput.type = selectedQuestion.type
            answerInput.placeholder = selectedQuestion.placeholder || ''
            answerInput.focus()
          }
        } else {
          inputGroup?.classList.add('hidden')
        }
      })
    }

    nextBtn?.addEventListener('click', () => this.handleNext())
    backBtn?.addEventListener('click', () => this.handleBack())

    form?.addEventListener('submit', (e) => {
      e.preventDefault()
    })
  }

  private handleNext() {
    const select = this.shadowRoot?.getElementById(`question-select-${this.currentStep}`) as HTMLSelectElement
    const answerInput = this.shadowRoot?.getElementById(`answer-${this.currentStep}`) as HTMLInputElement
    const errorDiv = this.shadowRoot?.getElementById(`error-${this.currentStep}`)

    // Validate current step
    if (!select.value) {
      this.showError(this.currentStep, 'Please select a question')
      return
    }

    if (!answerInput.value.trim()) {
      this.showError(this.currentStep, 'Please provide an answer')
      answerInput.focus()
      return
    }

    // Save answer
    const existingIndex = this.selectedAnswers.findIndex(a => a.questionId === select.value)
    if (existingIndex >= 0) {
      this.selectedAnswers[existingIndex] = {
        questionId: select.value,
        answer: answerInput.value.trim()
      }
    } else {
      this.selectedAnswers.push({
        questionId: select.value,
        answer: answerInput.value.trim()
      })
    }

    errorDiv?.classList.add('hidden')

    // Move to next step or complete
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
      
      // Restore previous selection
      const prevAnswer = this.selectedAnswers[this.currentStep]
      if (prevAnswer) {
        const select = this.shadowRoot?.getElementById(`question-select-${this.currentStep}`) as HTMLSelectElement
        const answerInput = this.shadowRoot?.getElementById(`answer-${this.currentStep}`) as HTMLInputElement
        const inputGroup = this.shadowRoot?.getElementById(`input-group-${this.currentStep}`)
        
        if (select && answerInput) {
          select.value = prevAnswer.questionId
          answerInput.value = prevAnswer.answer
          inputGroup?.classList.remove('hidden')
          
          const question = this.availableQuestions.find(q => q.id === prevAnswer.questionId)
          if (question) {
            answerInput.type = question.type
          }
        }
      }
    }
  }

  private showError(step: number, message: string) {
    const errorDiv = this.shadowRoot?.getElementById(`error-${step}`)
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.classList.remove('hidden')
    }
  }

  private complete() {
    // Dispatch custom event with collected answers
    const event = new CustomEvent('security-questions-complete', {
      detail: {
        answers: this.selectedAnswers,
        formattedInput: this.getFormattedInput()
      },
      bubbles: true,
      composed: true
    })
    this.dispatchEvent(event)
  }

  private getFormattedInput(): string {
    // Sort by question ID to ensure consistency
    return this.selectedAnswers
      .sort((a, b) => a.questionId.localeCompare(b.questionId))
      .map(a => a.answer.toLowerCase().replace(/\s+/g, ""))
      .join('|')
  }

  // Public method to get the formatted input for Human Network
  public getInput(): string {
    return this.getFormattedInput()
  }

  // Public method to get selected question IDs (for storage)
  public getSelectedQuestions(): string[] {
    return this.selectedAnswers.map(a => a.questionId).sort()
  }
}

// Register the custom element
customElements.define('security-questions-form', SecurityQuestionsForm)

export { SecurityQuestionsForm }