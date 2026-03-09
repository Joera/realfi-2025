import { typograhyStyles } from '../../../shared/src/assets/styles/typography-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'
import { router } from '../router.js';

class SurveyDetailAccess extends HTMLElement {
    private unsubscribe?: () => void;
    private surveyId!: string;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {

        this.surveyId = this.getAttribute('survey-id') || '';

        // Subscribe to store changes
        this.unsubscribe = store.subscribe('surveys', (surveys) => {
            console.log("subscription comes in")
            this.render(surveys);
        });

        // Initial render
        this.render(store.surveys);
    }

    disconnectedCallback() {
        // Cleanup if needed
         this.unsubscribe?.();
    }

    private render(surveys: any[]) {
        if (!this.shadowRoot) return;
        
        const survey = surveys.find(s => s.id === this.surveyId);

        this.shadowRoot.innerHTML = `
        <style>
              :host {
                display: block;
                color: var(--color-too-dark);
            }

            .access-container {
            
                padding: 2rem;
            }

            .readonly {
                display: flex;
                flex-direction: row;
                justify-content: flex-start; 
                margin-bottom: 0.75rem;
            }

            .form-container {
                padding: 1.5rem 0;
                width: 100%;
            }

            label {
                display: block;
                
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

            input[type="text"]::placeholder,
            textarea::placeholder {
                color: white;
                font-style: italic;
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


            
            ${!survey ? `
                <div class="loading">Loading survey...</div>
            ` : `

                <div class="access-container">

                    <div class="readonly">
                        <label>Survey ID:</label>
                        <span>${survey.id}</span>
                    </div>

                    <div class="readonly">
                        <label>Safe:</label>
                        <span></span>
                    </div>

                    <div class="readonly">
                        <label>Owners:</label>
                        <span></span>
                    </div>

                    <div class="readonly">
                        <label>Readers:</label>
                        <span></span>
                    </div>
                
                </div>

               
            `};

        `;

        this.attachListeners()
    }


    private attachListeners() {


    }


}

customElements.define('survey-detail-access', SurveyDetailAccess)

export { SurveyDetailAccess }