import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { layoutStyles } from '../styles/shared-layout-styles.js'
import { store } from '../state/store.js'
import { router } from '../router.js';

class SurveyDetailResponses extends HTMLElement {
    private unsubscribe?: () => void;
    private surveyId!: string;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles, layoutStyles]
    }

    connectedCallback() {

        this.surveyId = this.getAttribute('survey-id') || '';

        // Subscribe to store changes
        this.unsubscribe = store.subscribe('surveys', (surveys) => {
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
            .survey-header {
                margin-bottom: 2rem;
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
        </style>

        <div class="container container-large">
            
            ${!survey ? `
                <div class="loading">Loading survey...</div>
            ` : `
                <div id="responses">
                    <p>Loading responses from Nillion...</p>
                </div>
            `}
        </div>
        `;

        this.attachListeners()
    }


    private attachListeners() {
       
    
 
    }


}

customElements.define('survey-detail-responses', SurveyDetailResponses)

export { SurveyDetailResponses }


        // <div class="survey-header">
                //     <h1>Survey Results</h1>
                //     <div>Survey ID: ${survey.id.slice(0, 16)}...</div>
                //     <div>Created: ${new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}</div>
                //     <div>Collection: ${survey.collectionID?.slice(0, 8)}...</div>
                // </div>