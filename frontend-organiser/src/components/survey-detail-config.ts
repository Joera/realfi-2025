import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../state/store.js'
import { router } from '../router.js';

class SurveyDetailConfig extends HTMLElement {
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
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448);
                display: block;
            }

            .readonly {
                display: flex;
                flex-direction: row;
                justify-content: flex-start; 
            }

            .form-container {
                padding: 1.5rem 0;
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

                 <div class="form-container">
                        <div>               
                            <label for="survey-introduction">Introduction:</label>
                            <textarea id="survey-introduction" placeholder="Enter survey introduction">${survey.introduction}</textarea>
                        </div>
                </div>
            `};

        `;

        this.attachListeners()
    }


    private attachListeners() {


    }


}

customElements.define('survey-detail-config', SurveyDetailConfig)

export { SurveyDetailConfig }