import { typograhyStyles } from '../styles/shared-typograhy-styles.js'
import { colourStyles } from '../styles/shared-colour-styles.js'
import { buttonStyles } from '../styles/shared-button-styles.js'
import { store } from '../services/store.service.js';
import { router } from '../router.js';

class SurveyResultsList extends HTMLElement {
   
    private unsubscribe?: () => void;

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles, colourStyles, buttonStyles]
    }

    connectedCallback() {

        this.unsubscribe = store.subscribe('surveys', (surveys: any[]) => {

            console.log("US", surveys)
            this.render(surveys);
        });
        
        this.render(store.surveys);

        
    }

    disconnectedCallback() {

         this.unsubscribe?.();
    }

    private render(surveys: any[]) {


        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
        <style>

            :host {
                
                --green: rgb(42.9834254144, 112.6165745856, 98.0022099448)
         
            }

            .survey-table {
                display: grid;
                grid-template-columns: 2fr 1fr 2fr;  /* Survey ID | Date | Collection */
                gap: 0;
                border: 1px solid var(--green);
                border-radius: 8px;
                overflow: hidden;
            }

            .table-header {
                // background: #f9fafb;
                font-weight: 600;
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-cell {
                padding: 1rem;
                border-bottom: 1px solid var(--green);
            }

            .table-row {
                display: contents;  /* Makes children participate in parent grid */
                cursor: pointer;
            }
           
        </style>

        <div class="container">
            <h1>Your surveys</h1>
            
             ${surveys.length === 0 ? `
        <div class="empty-state">No surveys found</div>
    ` : `
        <div class="survey-table">
            <!-- Header Row -->
            <div class="table-header">Survey ID</div>
            <div class="table-header">Created</div>
            <div class="table-header">Collection ID</div>
            
            <!-- Data Rows -->
            ${surveys.map(survey => `
                <div class="table-row" data-survey-id="${survey.id}">
                    <div class="table-cell">${survey.id.slice(0, 16)}...</div>
                    <div class="table-cell">${new Date(Number(survey.createdAt) * 1000).toLocaleDateString()}</div>
                    <div class="table-cell">${survey.collectionID?.slice(0, 8)}...</div>
                </div>
            `).join('')}
        </div>
    `}
        </div>
        `

        this.attachRowListeners()
    }

    private attachRowListeners() {
    this.shadowRoot?.querySelectorAll('.survey-table .table-row').forEach(row => {
        row.addEventListener('click', (e) => {
            const surveyId = (e.currentTarget as HTMLElement).dataset.surveyId;
            console.log("clicked", surveyId)
            // Navigate using Navigo
            router.navigate(`/survey/${surveyId}`);
        });
    });
}


}

customElements.define('survey-results-list', SurveyResultsList)

export { SurveyResultsList }