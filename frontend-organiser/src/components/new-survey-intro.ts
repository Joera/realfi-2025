import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'

class NewSurveyFormIntro extends HTMLElement {
    private unsubscribe: (() => void) | null = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {
        this.render()
        this.loadFromStore()
        this.attachEventListeners()

        // Subscribe to store changes to reload when navigating back
        this.unsubscribe = store.subscribe('surveyDraft', (draft) => {
            this.updateFieldsFromDraft(draft)
        })
    }

    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe()
            this.unsubscribe = null
        }
    }

    private loadFromStore() {
        const draft = store.surveyDraft
        this.updateFieldsFromDraft(draft)
    }

    private updateFieldsFromDraft(draft: any) {
        const titleInput = this.shadowRoot?.querySelector('#survey-title') as HTMLInputElement
        const introInput = this.shadowRoot?.querySelector('#survey-introduction') as HTMLTextAreaElement

        if (titleInput && draft.title !== undefined && titleInput.value !== draft.title) {
            titleInput.value = draft.title || ''
        }
        if (introInput && draft.introduction !== undefined && introInput.value !== draft.introduction) {
            introInput.value = draft.introduction || ''
        }
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>

            :host {
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448)
            }


            .form-container {
                padding: 1.5rem;
                width: 100%;
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
                border-color: var(--green);
            }

            textarea {
                min-height: 100px;
                resize: vertical;
            }



        </style>

        <div class="form-container">
      
            
            <div>
                <label for="survey-title">Survey Title:</label>
                <input id="survey-title" type="text" placeholder="Enter survey title" required />
                
                <label for="survey-introduction">Introduction for correspondents:</label>
                <textarea id="survey-introduction" placeholder="Enter survey introduction"></textarea>

                <button id="next-btn" class="btn-primary">Next</button>
            </div>

           
        </div>
        `
    }

    private attachEventListeners() {

        this.shadowRoot?.querySelector('#next-btn')?.addEventListener('click', () => {

            const title = (this.shadowRoot?.querySelector('#survey-title') as HTMLInputElement)?.value
            const introduction = (this.shadowRoot?.querySelector('#survey-introduction') as HTMLTextAreaElement)?.value

            const surveyConfig = {
                title,
                introduction
            }

            store.updateSurveyDraft(surveyConfig)
            store.setUI({ newStep: 'questions'})
        });

    }


}

customElements.define('new-survey-form-intro', NewSurveyFormIntro)

export { NewSurveyFormIntro }