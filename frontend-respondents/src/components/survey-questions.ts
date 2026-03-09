import { typograhyStyles } from '@s3ntiment/shared/assets'
import { buttonStyles } from '@s3ntiment/shared/assets'
import { SurveyAnswer, Question, Survey } from "@s3ntiment/shared";
import { store } from "../state/store.js";

// Flatten groups into a sequential list of questions for step-based navigation
interface FlatQuestion extends Question {
  groupTitle: string;
  groupIndex: number;
}

class SurveyQuestions extends HTMLElement {
  private config?: Survey
  private flatQuestions: FlatQuestion[] = []
  private answers: SurveyAnswer[] = []
  private currentStep = 0
  previousDocument: any;

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, buttonStyles]
  }

  private flattenQuestions(survey: Survey): FlatQuestion[] {
    if (!survey.groups) return []
    return survey.groups.flatMap(group =>
      group.questions.map(q => ({
        ...q,
        groupTitle: group.title,
        groupIndex: survey.groups!.indexOf(group),
      }))
    )
  }

  private renderLoading() {
    if (!this.shadowRoot) return
    this.shadowRoot.innerHTML = `
      <style>
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          font-size: 1.2rem;
          color: #000;
        }
      </style>
      <div class="loading">Loading survey...</div>
    `
  }

  async connectedCallback() {
    const surveyId = this.getAttribute('survey-id');
    if (!surveyId) return;

    this.renderLoading();

    const config = store.getSurveyData(surveyId);
    if (!config) return;

    this.config = config;
    this.flatQuestions = this.flattenQuestions(config);

    this.render();
    this.attachEventListeners();
  }

  get totalSteps(): number {
    return this.flatQuestions.length;
  }

  private render() {
    if (!this.shadowRoot) return;

    if (!this.config || this.flatQuestions.length === 0) {
      this.renderLoading();
      return;
    }

    const currentQuestion = this.flatQuestions[this.currentStep];
    const savedAnswer = currentQuestion
      ? this.answers.find(a => a.questionId === currentQuestion.id)
      : undefined;

    // Show group title when entering a new group
    const showGroupTitle =
      this.currentStep === 0 ||
      this.flatQuestions[this.currentStep - 1]?.groupIndex !== currentQuestion?.groupIndex;

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

        .group-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #444;
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--bg-lightest);
        }

        .introduction {
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
          background: linear-gradient(90deg, var(--bg-darkest) 0%, var(--bg-too-dark) 100%);
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
          flex-direction: column;
          gap: 0.5rem;
        }

        .scale-option-vertical {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--bg-lightest);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .scale-option-vertical:hover {
          background: #f9fafb;
        }

        .scale-option-vertical input[type="radio"] {
          margin: 0 0.75rem 0 0;
          width: 20px;
          height: 20px;
        }

        .scale-label-vertical {
          font-size: 1rem;
          font-weight: 500;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .hidden {
          display: none;
        }

        .completion-screen {
          text-align: center;
          padding: 2rem 0;
        }

        .completion-screen h2 {
          color: #000;
          margin-bottom: 1rem;
        }

        a {
          color: white;
          text-decoration: none;
          border-bottom: 1px solid white;
        }

        .container  {
          width:  100%; 
        }
          
      </style>

      <div class="survey-container container">
        ${this.currentStep < this.totalSteps ? `
          <h1>${this.config.title}</h1>

          ${this.currentStep === 0 && this.config.introduction ? `
            <p class="introduction">${this.config.introduction}</p>
          ` : ''}

          ${showGroupTitle && currentQuestion.groupTitle ? `
            <p class="group-title">${currentQuestion.groupTitle}</p>
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
          </div>
        `}
      </div>
    `;
  }

  private renderQuestion(question: Question, savedAnswer?: SurveyAnswer): string {
    switch (question.type) {
      case 'radio':
        return `
          <div class="options-container">
            ${question.options?.map(option => `
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
        `;

      case 'checkbox':
        const savedAnswers = Array.isArray(savedAnswer?.answer) ? savedAnswer.answer : [];
        return `
          <div class="options-container">
            ${question.options?.map(option => `
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
        `;

      case 'scale':
        const range = question.scaleRange!;
        return `
          <div class="scale-container">
            <div class="scale-options">
              ${Array.from({ length: range.max - range.min + 1 }, (_, i) => {
                const value = range.min + i;
                return `
                  <label class="scale-option-vertical">
                    <input
                      type="radio"
                      name="${question.id}"
                      value="${value}"
                      id="${question.id}-${value}"
                      ${savedAnswer?.answer === value ? 'checked' : ''}
                    >
                    <span class="scale-label-vertical">${value}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        `;

      case 'text':
        return `
          <textarea
            name="${question.id}"
            placeholder="Share your thoughts..."
          >${savedAnswer?.answer || ''}</textarea>
        `;

      default:
        return '';
    }
  }

  private attachEventListeners() {
    const nextBtn = this.shadowRoot?.getElementById('nextBtn');
    const backBtn = this.shadowRoot?.getElementById('backBtn');
    nextBtn?.addEventListener('click', () => this.handleNext());
    backBtn?.addEventListener('click', () => this.handleBack());
  }

  private handleNext() {
    const currentQuestion = this.flatQuestions[this.currentStep];
    const answer = this.collectAnswer(currentQuestion);

    if (currentQuestion.required && !this.isAnswerValid(answer)) {
      this.showError('This question is required');
      return;
    }

    const enrichedAnswer: SurveyAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      questionType: currentQuestion.type,
      answer,
      ...(currentQuestion.scaleRange && { scaleRange: currentQuestion.scaleRange }),
    };

    const existingIndex = this.answers.findIndex(a => a.questionId === currentQuestion.id);
    if (existingIndex >= 0) {
      this.answers[existingIndex] = enrichedAnswer;
    } else {
      this.answers.push(enrichedAnswer);
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.render();
      this.attachEventListeners();
    } else {
      this.complete();
    }
  }

  private handleBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
      this.attachEventListeners();
    }
  }

  private collectAnswer(question: Question): string | string[] | number {
    const container = this.shadowRoot?.querySelector('.question-container');

    switch (question.type) {
      case 'radio':
        const radio = container?.querySelector(`input[name="${question.id}"]:checked`) as HTMLInputElement;
        return radio?.value || '';

      case 'scale':
        const scaleRadio = container?.querySelector(`input[name="${question.id}"]:checked`) as HTMLInputElement;
        return scaleRadio ? Number(scaleRadio.value) : '';

      case 'checkbox':
        const checkboxes = container?.querySelectorAll(`input[name="${question.id}"]:checked`) as NodeListOf<HTMLInputElement>;
        return Array.from(checkboxes).map(cb => cb.value);

      case 'text':
        const textarea = container?.querySelector(`textarea[name="${question.id}"]`) as HTMLTextAreaElement;
        return textarea?.value.trim() || '';

      default:
        return '';
    }
  }

  private isAnswerValid(answer: string | string[] | number): boolean {
    if (Array.isArray(answer)) return answer.length > 0;
    return answer !== '' && answer !== null && answer !== undefined;
  }

  private showError(message: string) {
    const errorDiv = this.shadowRoot?.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  private complete() {
    this.currentStep = this.totalSteps;
    this.render();

    console.log('complete')

    const event = new CustomEvent('survey-complete', {
      detail: {
        answers: this.answers,
        timestamp: new Date().toISOString(),
        documentId: this.previousDocument,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  public getAnswers(): SurveyAnswer[] {
    return this.answers;
  }
}

customElements.define('survey-questions', SurveyQuestions);

export { SurveyQuestions };