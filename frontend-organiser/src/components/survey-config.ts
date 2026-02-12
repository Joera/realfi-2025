import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../services/store.service.js'
import { router } from '../router.js';

class SurveyConfig extends HTMLElement {
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
            .container {
                padding: 1.5rem;
                max-width: 1200px;
            }

            .back-btn {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 1rem;
                margin-bottom: 1rem;
            }

            .back-btn:hover {
                text-decoration: underline;
            }

            .survey-header {
                margin-bottom: 2rem;
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
        </style>

        <div class="container">
            <button class="back-btn" id="back-btn">← Back to Surveys</button>
            
            ${!survey ? `
                <div class="loading">Loading survey...</div>
            ` : `
          
                <div>config</div>
            `}
        </div>
        `;

        this.attachListeners()
    }


    private attachListeners() {
       
        this.shadowRoot?.querySelector('#back-btn')?.addEventListener('click', () => {
            router.navigate('/results');
        });

        // document.querySelectorAll('.tab').forEach(tab => {
        //     tab.addEventListener('click', (e) => {
        //     const tabName = (e.currentTarget as HTMLElement).dataset.tab as 
        //         'result' | 'config' | 'questions';
            
        //     store.setUI({ resultTab: tabName });  // ← Update resultTab
        //     });
        // });
    }


}

customElements.define('survey-config', SurveyConfig)

export { SurveyConfig }