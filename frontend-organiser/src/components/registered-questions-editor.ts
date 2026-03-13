import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { layoutStyles } from '../styles/shared-layout-styles.js'
import type { QuestionGroup } from '@s3ntiment/shared'
import { store } from '../state/index.js'
import './survey-forms/survey-form-questions.js'

class RegisteredQuestionsEditor extends HTMLElement {
    private _surveyId: string = ''
    private _groups: QuestionGroup[] = []
    private _isDirty: boolean = false

    static get observedAttributes() { return ['survey-id'] }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, layoutStyles]
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }

    attributeChangedCallback(name: string, _: string, newVal: string) {
        if (name === 'survey-id' && newVal) {
            this._surveyId = newVal
            this.loadFromStore()
        }
    }

    private loadFromStore() {
        const survey = store.surveys.find((s: any) => s.id === this._surveyId)
        if (survey) {
            this._groups = survey.groups || []
            this._isDirty = false
            this.render()
            this.attachEventListeners()
        }
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
            }

            .actions {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
            }

            .dirty-indicator {
                font-size: 0.875rem;
                color: #9ca3af;
                font-style: italic;
            }

            .dirty-indicator.has-changes {
                color: var(--color-too-dark);
            }
        </style>

        <survey-form-questions class="container"></survey-form-questions>

        <div class="actions container container-large centered">
            <button class="btn-primary" id="save-btn" ${!this._isDirty ? 'disabled' : ''}>
                Save Changes
            </button>
            <span class="dirty-indicator ${this._isDirty ? 'has-changes' : ''}">
                ${this._isDirty ? 'Unsaved changes' : 'No changes'}
            </span>
        </div>
        `

        // Pass groups to form
        const questionsForm = this.shadowRoot.querySelector('survey-form-questions') as any
        if (questionsForm) {
            questionsForm.groups = this._groups
        }
    }

    private attachEventListeners() {
        this.shadowRoot?.addEventListener('groups-change', ((e: CustomEvent) => {
            this._groups = e.detail.value
            this._isDirty = true
            // Update just the save button and indicator without full re-render
            const saveBtn = this.shadowRoot?.querySelector('#save-btn') as HTMLButtonElement
            const indicator = this.shadowRoot?.querySelector('.dirty-indicator')
            if (saveBtn) saveBtn.disabled = false
            if (indicator) {
                indicator.textContent = 'Unsaved changes'
                indicator.classList.add('has-changes')
            }
        }) as EventListener)

        this.shadowRoot?.querySelector('#save-btn')?.addEventListener('click', () => {
            this.save()
        })
    }

    private save() {
        this.dispatchEvent(new CustomEvent('survey-save', {
            detail: {
                surveyId: this._surveyId,
                groups: this._groups
            },
            bubbles: true,
            composed: true
        }))

        this._isDirty = false
        const saveBtn = this.shadowRoot?.querySelector('#save-btn') as HTMLButtonElement
        const indicator = this.shadowRoot?.querySelector('.dirty-indicator')
        if (saveBtn) saveBtn.disabled = true
        if (indicator) {
            indicator.textContent = 'No changes'
            indicator.classList.remove('has-changes')
        }
    }
}

customElements.define('registered-questions-editor', RegisteredQuestionsEditor)

export { RegisteredQuestionsEditor }